// Package handlers provides HTTP handlers for ingredient API
package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/i18n"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/ingredient"
	"github.com/gin-gonic/gin"
)

// IngredientHandler handles ingredient-related requests
type IngredientHandler struct {
	cache   *cache.Cache
	service *ingredient.Service
}

// NewIngredientHandler creates a new ingredient handler
func NewIngredientHandler(c *cache.Cache, service *ingredient.Service) *IngredientHandler {
	return &IngredientHandler{
		cache:   c,
		service: service,
	}
}

// GetSeasonalIngredients handles POST /api/v1/ingredients
func (h *IngredientHandler) GetSeasonalIngredients(c *gin.Context) {
	var req models.GetIngredientsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_REQUEST",
			Message: "请求参数无效：" + err.Error(),
		})
		return
	}

	if req.City == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "MISSING_CITY",
			Message: "请输入城市名称",
		})
		return
	}

	// Get language from context (set by i18n middleware)
	lang := i18n.GetLang(c)

	// 生成缓存键：语言+城市+月份
	month := time.Now().Month()
	cacheKey := cache.IngredientsKey(req.City, lang, int(month))

	// 尝试从双层缓存获取
	if cache.DefaultManager != nil {
		var cached models.GetIngredientsResponse
		if cache.DefaultManager.GetJSON(cacheKey, &cached) {
			log.Printf("[IngredientHandler] 缓存命中: %s", cacheKey)
			c.JSON(http.StatusOK, &cached)
			return
		}
		log.Printf("[IngredientHandler] 缓存未命中: %s", cacheKey)
	}

	// Check if service is available
	if h.service == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{
			Code:    "SERVICE_UNAVAILABLE",
			Message: "食材服务暂不可用，请稍后重试",
		})
		return
	}

	result, err := h.service.GetSeasonalIngredients(c.Request.Context(), req.City, lang)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "GENERATION_FAILED",
			Message: "获取应季食材失败：" + err.Error(),
		})
		return
	}

	// 存入双层缓存
	if cache.DefaultManager != nil {
		if err := cache.DefaultManager.SetJSON(cacheKey, result); err != nil {
			log.Printf("[IngredientHandler] 缓存写入失败: %v", err)
		} else {
			log.Printf("[IngredientHandler] 缓存写入成功: %s", cacheKey)
		}
	}

	c.JSON(http.StatusOK, result)
}

// GetIngredientDetail handles GET /api/v1/ingredients/:id/detail
func (h *IngredientHandler) GetIngredientDetail(c *gin.Context) {
	ingredientID := c.Param("id")
	if ingredientID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "MISSING_ID",
			Message: "请提供食材ID",
		})
		return
	}

	// Get ingredient name from query param (passed from frontend)
	ingredientName := c.Query("name")
	if ingredientName == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "MISSING_NAME",
			Message: "请提供食材名称",
		})
		return
	}

	// Get language from context
	lang := i18n.GetLang(c)

	// 生成缓存键（包含语言）
	cacheKey := cache.IngredientDetailKey(ingredientID) + ":" + lang

	// 尝试从双层缓存获取
	if cache.DefaultManager != nil {
		var cached models.SeasonalIngredient
		if cache.DefaultManager.GetJSON(cacheKey, &cached) {
			log.Printf("[IngredientHandler] 食材详情缓存命中: %s", cacheKey)
			c.JSON(http.StatusOK, models.GetIngredientDetailResponse{
				Ingredient: cached,
			})
			return
		}
		log.Printf("[IngredientHandler] 食材详情缓存未命中: %s", cacheKey)
	}

	// Check if service is available
	if h.service == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{
			Code:    "SERVICE_UNAVAILABLE",
			Message: "食材服务暂不可用，请稍后重试",
		})
		return
	}

	result, err := h.service.GetIngredientDetail(c.Request.Context(), ingredientID, ingredientName, lang)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "GENERATION_FAILED",
			Message: "获取食材详情失败：" + err.Error(),
		})
		return
	}

	// 存入双层缓存
	if cache.DefaultManager != nil {
		if err := cache.DefaultManager.SetJSON(cacheKey, result); err != nil {
			log.Printf("[IngredientHandler] 食材详情缓存写入失败: %v", err)
		} else {
			log.Printf("[IngredientHandler] 食材详情缓存写入成功: %s", cacheKey)
		}
	}

	c.JSON(http.StatusOK, models.GetIngredientDetailResponse{
		Ingredient: *result,
	})
}
