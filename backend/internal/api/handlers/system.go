// Package handlers provides HTTP handlers for the API
package handlers

import (
	"net/http"

	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/services/ai"
	"github.com/gin-gonic/gin"
)

// SystemHandler handles system-related requests
type SystemHandler struct {
	provider *ai.ProviderManager
}

// NewSystemHandler creates a new system handler
func NewSystemHandler(provider *ai.ProviderManager) *SystemHandler {
	return &SystemHandler{
		provider: provider,
	}
}

// Health handles GET /api/v1/system/health
// @Summary 健康检查
// @Description 服务健康检查端点
// @Tags system
// @Produce json
// @Success 200 {object} map[string]string
// @Router /system/health [get]
func (h *SystemHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
	})
}

// Status handles GET /api/v1/system/status
// @Summary 获取系统状态
// @Description 获取 AI 服务可用性状态
// @Tags system
// @Produce json
// @Success 200 {object} models.SystemStatusResponse
// @Router /system/status [get]
func (h *SystemHandler) Status(c *gin.Context) {
	status := h.provider.GetStatus()
	c.JSON(http.StatusOK, status)
}

// CacheStats handles GET /api/v1/system/cache-stats
// @Summary 获取缓存统计信息
// @Description 获取双层缓存的统计信息（内存缓存和 SQLite 缓存）
// @Tags system
// @Produce json
// @Success 200 {object} cache.CacheStats
// @Router /system/cache-stats [get]
func (h *SystemHandler) CacheStats(c *gin.Context) {
	if cache.DefaultManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "缓存管理器未初始化",
		})
		return
	}
	stats := cache.DefaultManager.Stats()
	c.JSON(http.StatusOK, stats)
}
