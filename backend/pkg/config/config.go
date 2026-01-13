// Package config handles application configuration from environment variables
package config

import (
	"os"
	"strconv"
	"time"

	"github.com/eat-only-in-season/backend/internal/models"
)

// Config holds all application configuration
type Config struct {
	// Server
	ServerPort string
	GinMode    string

	// AI Providers - LLM
	OpenAIAPIKey    string
	DeepSeekAPIKey  string
	DashScopeAPIKey string
	OllamaHost      string

	// AI Providers - Image
	StabilityAPIKey string

	// Optional overrides
	OpenAIBaseURL string

	// Cache configuration
	Cache models.CacheConfig
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		// Server
		ServerPort: getEnv("SERVER_PORT", "8080"),
		GinMode:    getEnv("GIN_MODE", "debug"),

		// AI Providers - LLM
		OpenAIAPIKey:    os.Getenv("OPENAI_API_KEY"),
		DeepSeekAPIKey:  os.Getenv("DEEPSEEK_API_KEY"),
		DashScopeAPIKey: os.Getenv("DASHSCOPE_API_KEY"),
		OllamaHost:      os.Getenv("OLLAMA_HOST"),

		// AI Providers - Image
		StabilityAPIKey: os.Getenv("STABILITY_API_KEY"),

		// Optional overrides
		OpenAIBaseURL: os.Getenv("OPENAI_BASE_URL"),

		// Cache configuration
		Cache: loadCacheConfig(),
	}
}

// getEnv gets an environment variable with a default fallback
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvInt gets an integer environment variable with a default fallback
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// loadCacheConfig 加载缓存配置
func loadCacheConfig() models.CacheConfig {
	defaults := models.DefaultCacheConfig

	return models.CacheConfig{
		MemoryTTL:           time.Duration(getEnvInt("CACHE_MEMORY_TTL", int(defaults.MemoryTTL/time.Second))) * time.Second,
		MemoryMaxItems:      getEnvInt("CACHE_MEMORY_MAX_ITEMS", defaults.MemoryMaxItems),
		SQLiteTTL:           time.Duration(getEnvInt("CACHE_SQLITE_TTL", int(defaults.SQLiteTTL/time.Second))) * time.Second,
		SQLiteCleanInterval: time.Duration(getEnvInt("CACHE_SQLITE_CLEAN_INTERVAL", int(defaults.SQLiteCleanInterval/time.Second))) * time.Second,
		SQLitePath:          getEnv("CACHE_SQLITE_PATH", defaults.SQLitePath),
	}
}

// HasOpenAI returns true if OpenAI API key is configured
func (c *Config) HasOpenAI() bool {
	return c.OpenAIAPIKey != ""
}

// HasDeepSeek returns true if DeepSeek API key is configured
func (c *Config) HasDeepSeek() bool {
	return c.DeepSeekAPIKey != ""
}

// HasDashScope returns true if DashScope API key is configured
func (c *Config) HasDashScope() bool {
	return c.DashScopeAPIKey != ""
}

// HasOllama returns true if Ollama host is configured
func (c *Config) HasOllama() bool {
	return c.OllamaHost != ""
}

// HasStability returns true if Stability AI API key is configured
func (c *Config) HasStability() bool {
	return c.StabilityAPIKey != ""
}

// HasAnyLLM returns true if any LLM provider is configured
func (c *Config) HasAnyLLM() bool {
	return c.HasOpenAI() || c.HasDeepSeek() || c.HasDashScope() || c.HasOllama()
}

// HasAnyImageGen returns true if any image generation provider is configured
func (c *Config) HasAnyImageGen() bool {
	return c.HasOpenAI() || c.HasDashScope() || c.HasStability()
}
