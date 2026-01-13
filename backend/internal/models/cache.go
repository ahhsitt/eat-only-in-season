// Package models - 缓存相关模型定义
package models

import "time"

// CacheConfig 双层缓存配置
type CacheConfig struct {
	// 内存LRU缓存
	MemoryTTL      time.Duration `json:"memoryTTL"`
	MemoryMaxItems int           `json:"memoryMaxItems"`

	// SQLite持久化缓存
	SQLiteTTL           time.Duration `json:"sqliteTTL"`
	SQLiteCleanInterval time.Duration `json:"sqliteCleanInterval"`
	SQLitePath          string        `json:"sqlitePath"`
}

// DefaultCacheConfig 默认配置
var DefaultCacheConfig = CacheConfig{
	MemoryTTL:           1 * time.Hour,
	MemoryMaxItems:      1000,
	SQLiteTTL:           7 * 24 * time.Hour,
	SQLiteCleanInterval: 1 * time.Hour,
	SQLitePath:          "./data/cache.db",
}

// CacheEntry SQLite持久化缓存的数据条目
type CacheEntry struct {
	Key       string `db:"key"`
	Value     []byte `db:"value"`
	ExpiresAt int64  `db:"expires_at"`
	CreatedAt int64  `db:"created_at"`
}
