// Package handlers provides HTTP handlers for the API
package handlers

import (
	"context"
	"io"
	"net/http"
	"time"

	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/ai/imagegen"
	"github.com/gin-gonic/gin"
)

// ImageHandler handles image-related requests
type ImageHandler struct {
	cache        *cache.Cache
	imageService *imagegen.Service
}

// NewImageHandler creates a new image handler
func NewImageHandler(c *cache.Cache, imageSvc *imagegen.Service) *ImageHandler {
	return &ImageHandler{
		cache:        c,
		imageService: imageSvc,
	}
}

// GetRecipeImage handles GET /api/v1/recipes/:recipeId/image
// @Summary 获取菜谱图片
// @Description 获取指定菜谱的 AI 生成图片
// @Tags image
// @Produce json
// @Param recipeId path string true "菜谱 ID"
// @Success 200 {object} models.ImageResponse
// @Failure 202 {object} models.ImagePendingResponse "图片生成中"
// @Failure 404 {object} models.ErrorResponse
// @Router /recipes/{recipeId}/image [get]
func (h *ImageHandler) GetRecipeImage(c *gin.Context) {
	recipeID := c.Param("recipeId")
	if recipeID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_ID",
			Message: "菜谱 ID 不能为空",
		})
		return
	}

	// Check if image is already cached
	if base64Image, ok := h.cache.GetImageBase64(recipeID); ok {
		c.JSON(http.StatusOK, models.ImageResponse{
			RecipeID:    recipeID,
			Status:      models.ImageStatusReady,
			ImageBase64: base64Image,
		})
		return
	}

	// Check current status
	if status, ok := h.cache.GetImageStatus(recipeID); ok {
		switch status {
		case models.ImageStatusGenerating:
			c.JSON(http.StatusAccepted, models.ImagePendingResponse{
				RecipeID: recipeID,
				Status:   models.ImageStatusGenerating,
				Message:  "图片正在生成中，请稍后重试",
			})
			return
		case models.ImageStatusFailed:
			c.JSON(http.StatusOK, models.ImageResponse{
				RecipeID: recipeID,
				Status:   models.ImageStatusFailed,
			})
			return
		}
	}

	// Image not found
	c.JSON(http.StatusOK, models.ImageResponse{
		RecipeID: recipeID,
		Status:   models.ImageStatusPending,
	})
}

// GenerateRecipeImage handles POST /api/v1/recipes/:recipeId/image
// @Summary 触发菜谱图片生成
// @Description 触发为指定菜谱生成 AI 图片
// @Tags image
// @Produce json
// @Param recipeId path string true "菜谱 ID"
// @Success 202 {object} models.ImagePendingResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 503 {object} models.ErrorResponse
// @Router /recipes/{recipeId}/image [post]
func (h *ImageHandler) GenerateRecipeImage(c *gin.Context) {
	recipeID := c.Param("recipeId")
	if recipeID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_ID",
			Message: "菜谱 ID 不能为空",
		})
		return
	}

	// Check if image service is available
	if !h.imageService.IsAvailable() {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{
			Code:    "IMAGE_SERVICE_UNAVAILABLE",
			Message: "图像生成服务不可用，请配置 Stability AI 或 OpenAI API Key",
		})
		return
	}

	// Get recipe from cache
	recipe, ok := h.cache.GetSingleRecipe(recipeID)
	if !ok {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Code:    "RECIPE_NOT_FOUND",
			Message: "菜谱不存在或已过期",
		})
		return
	}

	// Check if already generating
	if status, ok := h.cache.GetImageStatus(recipeID); ok && status == models.ImageStatusGenerating {
		c.JSON(http.StatusAccepted, models.ImagePendingResponse{
			RecipeID: recipeID,
			Status:   models.ImageStatusGenerating,
			Message:  "图片正在生成中，请稍后重试",
		})
		return
	}

	// Set status to generating
	h.cache.SetImageStatus(recipeID, models.ImageStatusGenerating)

	// Generate image in background
	go h.generateImageAsync(recipeID, recipe)

	c.JSON(http.StatusAccepted, models.ImagePendingResponse{
		RecipeID: recipeID,
		Status:   models.ImageStatusGenerating,
		Message:  "图片生成已开始，预计需要 10-30 秒",
	})
}

// generateImageAsync generates image in background
func (h *ImageHandler) generateImageAsync(recipeID string, recipe *models.Recipe) {
	ctx := context.Background()

	base64Image, err := h.imageService.GenerateRecipeImage(ctx, recipe)
	if err != nil {
		h.cache.SetImageStatus(recipeID, models.ImageStatusFailed)
		return
	}

	// Store the image
	h.cache.SetImageBase64(recipeID, base64Image)
	h.cache.SetImageStatus(recipeID, models.ImageStatusReady)
}

// GetRecipeImageUrl handles GET /api/v1/recipes/:recipeId/image-url
// @Summary 获取菜谱图片URL（新流程）
// @Description 为新流程菜谱生成图片并返回URL
// @Tags image
// @Produce json
// @Param recipeId path string true "菜谱 ID"
// @Success 200 {object} models.ImageURLResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 503 {object} models.ErrorResponse
// @Router /recipes/{recipeId}/image-url [get]
func (h *ImageHandler) GetRecipeImageUrl(c *gin.Context) {
	recipeID := c.Param("recipeId")
	if recipeID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_ID",
			Message: "菜谱 ID 不能为空",
		})
		return
	}

	// Check if image URL is already cached
	if imageURL, ok := h.cache.GetImageURL(recipeID); ok && imageURL != "" {
		c.JSON(http.StatusOK, models.ImageURLResponse{
			ImageURL: imageURL,
		})
		return
	}

	// Check if image service is available
	if !h.imageService.IsAvailable() {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{
			Code:    "IMAGE_SERVICE_UNAVAILABLE",
			Message: "图像生成服务不可用，请配置图像生成 API Key",
		})
		return
	}

	// Get recipe detail from cache
	recipeDetail, ok := h.cache.GetNewRecipeDetail(recipeID)
	if !ok {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Code:    "RECIPE_NOT_FOUND",
			Message: "菜谱不存在或已过期，请先查看菜谱详情",
		})
		return
	}

	// Generate image synchronously (this is a blocking call)
	ctx := c.Request.Context()
	imageURL, err := h.imageService.GenerateRecipeImageURL(ctx, recipeDetail.Title, recipeDetail.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "IMAGE_GENERATION_FAILED",
			Message: "图片生成失败: " + err.Error(),
		})
		return
	}

	// Cache the URL
	h.cache.SetImageURL(recipeID, imageURL)

	c.JSON(http.StatusOK, models.ImageURLResponse{
		ImageURL: imageURL,
	})
}

// ProxyRecipeImage handles GET /api/v1/recipes/:recipeId/image-proxy
// @Summary 代理获取菜谱图片（解决跨域问题）
// @Description 通过后端代理获取图片，用于 PDF 导出等场景
// @Tags image
// @Produce image/png,image/jpeg
// @Param recipeId path string true "菜谱 ID"
// @Success 200 {file} binary "图片内容"
// @Failure 404 {object} models.ErrorResponse
// @Router /recipes/{recipeId}/image-proxy [get]
func (h *ImageHandler) ProxyRecipeImage(c *gin.Context) {
	recipeID := c.Param("recipeId")
	if recipeID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_ID",
			Message: "菜谱 ID 不能为空",
		})
		return
	}

	// Get cached image URL
	imageURL, ok := h.cache.GetImageURL(recipeID)
	if !ok || imageURL == "" {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Code:    "IMAGE_NOT_FOUND",
			Message: "图片不存在，请先生成图片",
		})
		return
	}

	// Fetch image from external URL
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(imageURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "IMAGE_FETCH_FAILED",
			Message: "获取图片失败: " + err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "IMAGE_FETCH_FAILED",
			Message: "获取图片失败，状态码: " + resp.Status,
		})
		return
	}

	// Get content type
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/png"
	}

	// Stream image to response
	c.Header("Content-Type", contentType)
	c.Header("Cache-Control", "public, max-age=86400") // Cache for 24 hours
	c.Status(http.StatusOK)
	io.Copy(c.Writer, resp.Body)
}
