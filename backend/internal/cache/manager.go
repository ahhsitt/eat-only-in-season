// Package cache - 双层缓存管理器实现
package cache

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/jellydator/ttlcache/v3"
)

// CacheManager 双层缓存管理器
// L1: 内存 LRU 缓存 (ttlcache) - 快速访问
// L2: SQLite 持久化缓存 - 服务重启后恢复
type CacheManager struct {
	config  models.CacheConfig
	memory  *ttlcache.Cache[string, []byte]
	sqlite  *SQLiteCache
	mutex   sync.RWMutex
	stopCh  chan struct{}
	stopped bool
}

// DefaultManager 全局缓存管理器实例
var DefaultManager *CacheManager

// NewCacheManager 创建双层缓存管理器
func NewCacheManager(config models.CacheConfig) (*CacheManager, error) {
	// 创建 SQLite 持久化缓存
	sqliteCache, err := NewSQLiteCache(config.SQLitePath)
	if err != nil {
		return nil, err
	}

	// 创建内存 LRU 缓存
	memoryCache := ttlcache.New[string, []byte](
		ttlcache.WithTTL[string, []byte](config.MemoryTTL),
		ttlcache.WithCapacity[string, []byte](uint64(config.MemoryMaxItems)),
	)

	manager := &CacheManager{
		config: config,
		memory: memoryCache,
		sqlite: sqliteCache,
		stopCh: make(chan struct{}),
	}

	// 启动内存缓存自动过期清理
	go memoryCache.Start()

	return manager, nil
}

// InitDefaultManager 初始化全局缓存管理器
func InitDefaultManager(config models.CacheConfig) error {
	manager, err := NewCacheManager(config)
	if err != nil {
		return err
	}
	DefaultManager = manager
	return nil
}

// Get 获取缓存值 (L1 -> L2)
// 查询顺序: 内存缓存 -> SQLite缓存 -> 返回未命中
func (m *CacheManager) Get(key string) ([]byte, bool) {
	// L1: 尝试从内存缓存获取
	if item := m.memory.Get(key); item != nil {
		return item.Value(), true
	}

	// L2: 尝试从 SQLite 缓存获取
	if value, found := m.sqlite.Get(key); found {
		// 回填到内存缓存 (使用内存TTL)
		m.memory.Set(key, value, m.config.MemoryTTL)
		return value, true
	}

	return nil, false
}

// Set 设置缓存值 (同时写入 L1 和 L2)
func (m *CacheManager) Set(key string, value []byte) error {
	// L1: 写入内存缓存
	m.memory.Set(key, value, m.config.MemoryTTL)

	// L2: 写入 SQLite 缓存
	return m.sqlite.Set(key, value, m.config.SQLiteTTL)
}

// Delete 删除缓存值 (同时从 L1 和 L2 删除)
func (m *CacheManager) Delete(key string) error {
	// L1: 从内存缓存删除
	m.memory.Delete(key)

	// L2: 从 SQLite 缓存删除
	return m.sqlite.Delete(key)
}

// GetJSON 获取并反序列化 JSON ��存
func (m *CacheManager) GetJSON(key string, v interface{}) bool {
	data, found := m.Get(key)
	if !found {
		return false
	}
	if err := json.Unmarshal(data, v); err != nil {
		return false
	}
	return true
}

// SetJSON 序列化并设置 JSON 缓存
func (m *CacheManager) SetJSON(key string, v interface{}) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return m.Set(key, data)
}

// WarmUp 预热: 从 SQLite 加载数据到内存缓存
func (m *CacheManager) WarmUp() error {
	log.Println("[CacheManager] 开始缓存预热...")

	allData, err := m.sqlite.GetAll()
	if err != nil {
		return err
	}

	count := 0
	for key, value := range allData {
		m.memory.Set(key, value, m.config.MemoryTTL)
		count++
	}

	log.Printf("[CacheManager] 缓存预热完成，加载了 %d 条记录\n", count)
	return nil
}

// StartCleanupRoutine 启动 SQLite 清理协程
func (m *CacheManager) StartCleanupRoutine(ctx context.Context) {
	ticker := time.NewTicker(m.config.SQLiteCleanInterval)
	defer ticker.Stop()

	log.Printf("[CacheManager] SQLite 清理协程已启动，清理间隔: %v\n", m.config.SQLiteCleanInterval)

	for {
		select {
		case <-ticker.C:
			if err := m.sqlite.Cleanup(); err != nil {
				log.Printf("[CacheManager] SQLite 清理失败: %v\n", err)
			} else {
				count, _ := m.sqlite.Count()
				log.Printf("[CacheManager] SQLite 清理完成，当前缓存条目数: %d\n", count)
			}
		case <-ctx.Done():
			log.Println("[CacheManager] SQLite 清理协程收到停止信号")
			return
		case <-m.stopCh:
			log.Println("[CacheManager] SQLite 清理协程已停止")
			return
		}
	}
}

// Stats 获取缓存统计信息
func (m *CacheManager) Stats() CacheStats {
	memoryCount := m.memory.Len()
	sqliteCount, _ := m.sqlite.Count()

	return CacheStats{
		MemoryItems: memoryCount,
		SQLiteItems: sqliteCount,
		MemoryTTL:   m.config.MemoryTTL,
		SQLiteTTL:   m.config.SQLiteTTL,
	}
}

// CacheStats 缓存统计信息
type CacheStats struct {
	MemoryItems int           `json:"memoryItems"`
	SQLiteItems int           `json:"sqliteItems"`
	MemoryTTL   time.Duration `json:"memoryTTL"`
	SQLiteTTL   time.Duration `json:"sqliteTTL"`
}

// Close 关闭缓存管理器
func (m *CacheManager) Close() error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if m.stopped {
		return nil
	}
	m.stopped = true

	// 停止清理协程
	close(m.stopCh)

	// 停止内存缓存
	m.memory.Stop()

	// 关闭 SQLite 连接
	return m.sqlite.Close()
}

// --- 便捷方法: 特定类型缓存键生成 ---

// IngredientsKey 生成食材缓存键
// 格式: ingredients:{city}:{season}:{month}
func IngredientsKey(city string, season string, month int) string {
	return "ingredients:" + city + ":" + season + ":" + string(rune('0'+month))
}

// RecipesByIngredientsKey 生成基于食材的菜谱缓存键
// 格式: recipes-by-ingredients:{ingredientIDs sorted and joined}
func RecipesByIngredientsKey(ingredientIDs []string) string {
	// 简单拼接，实际使用时应排序以保证一致性
	key := "recipes-by-ingredients:"
	for i, id := range ingredientIDs {
		if i > 0 {
			key += ","
		}
		key += id
	}
	return key
}

// RecipeDetailKey 生成菜谱详情缓存键
func RecipeDetailKey(recipeID string) string {
	return "recipe-detail:" + recipeID
}

// IngredientDetailKey 生成食材详情缓存键
func IngredientDetailKey(ingredientID string) string {
	return "ingredient-detail:" + ingredientID
}

// ImageKey 生成图片缓存键
func ImageCacheKey(recipeID string) string {
	return "image:" + recipeID
}
