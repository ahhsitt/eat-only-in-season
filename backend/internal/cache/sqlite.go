// Package cache - SQLite 持久化缓存实现
package cache

import (
	"database/sql"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

// SQLiteCache SQLite 持久化缓存
type SQLiteCache struct {
	db    *sql.DB
	mutex sync.Mutex
}

// NewSQLiteCache 创建 SQLite 缓存实例
func NewSQLiteCache(dbPath string) (*SQLiteCache, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	// 启用 WAL 模式提升并发读取性能
	_, _ = db.Exec("PRAGMA journal_mode=WAL")
	_, _ = db.Exec("PRAGMA synchronous=NORMAL")

	// 创建缓存表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS cache_entries (
			key TEXT PRIMARY KEY,
			value BLOB NOT NULL,
			expires_at INTEGER NOT NULL,
			created_at INTEGER NOT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_expires_at ON cache_entries(expires_at);
	`)
	if err != nil {
		db.Close()
		return nil, err
	}

	return &SQLiteCache{db: db}, nil
}

// Get 获取缓存值
func (c *SQLiteCache) Get(key string) ([]byte, bool) {
	var value []byte
	err := c.db.QueryRow(
		"SELECT value FROM cache_entries WHERE key = ? AND expires_at > ?",
		key, time.Now().Unix(),
	).Scan(&value)
	if err != nil {
		return nil, false
	}
	return value, true
}

// Set 设置缓存值
func (c *SQLiteCache) Set(key string, value []byte, ttl time.Duration) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	expiresAt := time.Now().Add(ttl).Unix()
	_, err := c.db.Exec(
		"INSERT OR REPLACE INTO cache_entries (key, value, expires_at, created_at) VALUES (?, ?, ?, ?)",
		key, value, expiresAt, time.Now().Unix(),
	)
	return err
}

// Delete 删除缓存值
func (c *SQLiteCache) Delete(key string) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	_, err := c.db.Exec("DELETE FROM cache_entries WHERE key = ?", key)
	return err
}

// Cleanup 清理过期数据
func (c *SQLiteCache) Cleanup() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	_, err := c.db.Exec("DELETE FROM cache_entries WHERE expires_at < ?", time.Now().Unix())
	return err
}

// Count 获取缓存条目数量
func (c *SQLiteCache) Count() (int, error) {
	var count int
	err := c.db.QueryRow(
		"SELECT COUNT(*) FROM cache_entries WHERE expires_at > ?",
		time.Now().Unix(),
	).Scan(&count)
	return count, err
}

// Close 关闭数据库连接
func (c *SQLiteCache) Close() error {
	return c.db.Close()
}

// GetAll 获取所有未过期的缓存键（用于预热）
func (c *SQLiteCache) GetAll() (map[string][]byte, error) {
	rows, err := c.db.Query(
		"SELECT key, value FROM cache_entries WHERE expires_at > ?",
		time.Now().Unix(),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string][]byte)
	for rows.Next() {
		var key string
		var value []byte
		if err := rows.Scan(&key, &value); err != nil {
			continue
		}
		result[key] = value
	}
	return result, rows.Err()
}
