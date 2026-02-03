// Package handlers provides HTTP handlers for new recipe API
package handlers

import (
	"log"
	"net/http"
	"sort"
	"strings"

	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/i18n"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/recipe"
	"github.com/gin-gonic/gin"
)

// NewFlowRecipeHandler handles new recipe-related requests (003-flow-redesign)
type NewFlowRecipeHandler struct {
	cache   *cache.Cache
	service *recipe.Service
}

// NewNewFlowRecipeHandler creates a new recipe handler for the new flow
func NewNewFlowRecipeHandler(c *cache.Cache, service *recipe.Service) *NewFlowRecipeHandler {
	return &NewFlowRecipeHandler{
		cache:   c,
		service: service,
	}
}

// GetRecipesByIngredients handles POST /api/v1/recipes/by-ingredients
func (h *NewFlowRecipeHandler) GetRecipesByIngredients(c *gin.Context) {
	var req models.GetRecipesByIngredientsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_REQUEST",
			Message: "请求参数无效：" + err.Error(),
		})
		return
	}

	// Get language from context
	lang := i18n.GetLang(c)

	// 生成缓存键：语言 + 排序后的食材列表 + 偏好
	cacheKey := h.buildRecipesCacheKey(req.Ingredients, req.Preference, lang)

	// 尝试从双层缓存获取
	if cache.DefaultManager != nil {
		var cached models.GetRecipesByIngredientsResponse
		if cache.DefaultManager.GetJSON(cacheKey, &cached) {
			log.Printf("[RecipeHandler] 菜谱推荐缓存命中: %s", cacheKey)
			c.JSON(http.StatusOK, &cached)
			return
		}
		log.Printf("[RecipeHandler] 菜谱推荐缓存未命中: %s", cacheKey)
	}

	// Check if service is available
	if h.service == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{
			Code:    "SERVICE_UNAVAILABLE",
			Message: "菜谱服务暂不可用，请稍后重试",
		})
		return
	}

	result, err := h.service.GetRecipeRecommendations(c.Request.Context(), &req, lang)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "GENERATION_FAILED",
			Message: "获取菜谱推荐失败：" + err.Error(),
		})
		return
	}

	// 存入双层缓存
	if cache.DefaultManager != nil {
		if err := cache.DefaultManager.SetJSON(cacheKey, result); err != nil {
			log.Printf("[RecipeHandler] 菜谱推荐缓存写入失败: %v", err)
		} else {
			log.Printf("[RecipeHandler] 菜谱推荐缓存写入成功: %s", cacheKey)
		}
	}

	c.JSON(http.StatusOK, result)
}

// buildRecipesCacheKey 生成菜谱推荐缓存键
func (h *NewFlowRecipeHandler) buildRecipesCacheKey(ingredients []string, preference string, lang string) string {
	// 排序食材以保证一致性
	sorted := make([]string, len(ingredients))
	copy(sorted, ingredients)
	sort.Strings(sorted)

	key := lang + ":recipes:" + strings.Join(sorted, ",")
	if preference != "" {
		key += ":" + preference
	}
	return key
}

// GetNewRecipeDetail handles GET /api/v1/recipes/:id/detail
func (h *NewFlowRecipeHandler) GetNewRecipeDetail(c *gin.Context) {
	recipeID := c.Param("recipeId")
	if recipeID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "MISSING_ID",
			Message: "请提供菜谱ID",
		})
		return
	}

	// Get recipe title from query param
	recipeTitle := c.Query("title")
	if recipeTitle == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "MISSING_TITLE",
			Message: "请提供菜谱标题",
		})
		return
	}

	// Get language from context
	lang := i18n.GetLang(c)

	// 生成缓存键（包含语言）
	cacheKey := lang + ":" + cache.RecipeDetailKey(recipeID)

	// 尝试从双层缓存获取
	if cache.DefaultManager != nil {
		var cached models.NewRecipeDetail
		if cache.DefaultManager.GetJSON(cacheKey, &cached) {
			log.Printf("[RecipeHandler] 菜谱详情缓存命中: %s", cacheKey)
			c.JSON(http.StatusOK, models.GetNewRecipeDetailResponse{
				Recipe: cached,
			})
			return
		}
		log.Printf("[RecipeHandler] 菜谱详情缓存未命中: %s", cacheKey)
	}

	// Check if service is available
	if h.service == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{
			Code:    "SERVICE_UNAVAILABLE",
			Message: "菜谱服务暂不可用，请稍后重试",
		})
		return
	}

	result, err := h.service.GetRecipeDetail(c.Request.Context(), recipeID, recipeTitle, lang)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "GENERATION_FAILED",
			Message: "获取菜谱详情失败：" + err.Error(),
		})
		return
	}

	// 存入双层缓存
	if cache.DefaultManager != nil {
		if err := cache.DefaultManager.SetJSON(cacheKey, result); err != nil {
			log.Printf("[RecipeHandler] 菜谱详情缓存写入失败: %v", err)
		} else {
			log.Printf("[RecipeHandler] 菜谱详情缓存写入成功: %s", cacheKey)
		}
	}

	// 同时存入内存缓存（保持向后兼容）
	h.cache.SetNewRecipeDetail(recipeID, result)

	c.JSON(http.StatusOK, models.GetNewRecipeDetailResponse{
		Recipe: *result,
	})
}
