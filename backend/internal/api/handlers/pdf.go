// Package handlers provides HTTP handlers for the API
package handlers

import (
	"encoding/base64"
	"io"
	"net/http"
	"time"

	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/pdf"
	"github.com/gin-gonic/gin"
)

// PDFHandler handles PDF export requests
type PDFHandler struct {
	cache      *cache.Cache
	pdfService *pdf.Service
}

// NewPDFHandler creates a new PDF handler
func NewPDFHandler(c *cache.Cache, pdfSvc *pdf.Service) *PDFHandler {
	return &PDFHandler{
		cache:      c,
		pdfService: pdfSvc,
	}
}

// ExportPDFRequest represents the PDF export request body
type ExportPDFRequest struct {
	IncludeImage bool   `json:"includeImage"`
	ImageURL     string `json:"imageUrl,omitempty"`
}

// ExportPDF handles POST /api/v1/recipes/:recipeId/pdf
// @Summary 导出菜谱为 PDF
// @Description 将菜谱详情导出为 PDF 文件
// @Tags pdf
// @Accept json
// @Produce json
// @Param recipeId path string true "菜谱 ID"
// @Param request body ExportPDFRequest false "导出选项"
// @Success 200 {object} models.ExportPDFResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /recipes/{recipeId}/pdf [post]
func (h *PDFHandler) ExportPDF(c *gin.Context) {
	recipeID := c.Param("recipeId")
	if recipeID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_ID",
			Message: "菜谱 ID 不能为空",
		})
		return
	}

	// Parse request body
	var req ExportPDFRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Default to include image if body is empty
		req.IncludeImage = true
	}

	// Try new flow cache first (003-flow-redesign)
	if newDetail, ok := h.cache.GetNewRecipeDetail(recipeID); ok {
		// Try to get image data
		var imageData []byte
		if req.IncludeImage {
			imageData = h.fetchImageData(recipeID, req.ImageURL)
		}

		pdfBase64, fileName, err := h.pdfService.GenerateNewRecipePDF(newDetail, imageData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Code:    "PDF_GENERATION_FAILED",
				Message: "生成 PDF 失败: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, models.ExportPDFResponse{
			FileName:  fileName,
			PDFBase64: pdfBase64,
		})
		return
	}

	// Fall back to old flow cache
	recipe, ok := h.cache.GetSingleRecipe(recipeID)
	if !ok {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Code:    "RECIPE_NOT_FOUND",
			Message: "菜谱不存在或已过期",
		})
		return
	}

	// Update image from cache
	if base64Image, ok := h.cache.GetImageBase64(recipeID); ok {
		recipe.ImageBase64 = base64Image
	}

	// Get detail from cache
	detail, ok := h.cache.GetRecipeDetail(recipeID)
	if !ok {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Code:    "DETAIL_NOT_FOUND",
			Message: "菜谱详情不存在，请先查看菜谱详情页面",
		})
		return
	}

	// Generate PDF
	pdfBase64, fileName, err := h.pdfService.GenerateRecipePDF(recipe, detail, req.IncludeImage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:    "PDF_GENERATION_FAILED",
			Message: "生成 PDF 失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.ExportPDFResponse{
		FileName:  fileName,
		PDFBase64: pdfBase64,
	})
}

// fetchImageData tries to get image data from cache or URL
func (h *PDFHandler) fetchImageData(recipeID string, imageURL string) []byte {
	// Try cache first (base64 encoded)
	if base64Image, ok := h.cache.GetImageBase64(recipeID); ok && base64Image != "" {
		if data, err := base64.StdEncoding.DecodeString(base64Image); err == nil {
			return data
		}
	}

	// Try to fetch from URL if provided
	if imageURL != "" {
		client := &http.Client{Timeout: 30 * time.Second}
		resp, err := client.Get(imageURL)
		if err != nil {
			return nil
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			data, err := io.ReadAll(resp.Body)
			if err == nil {
				return data
			}
		}
	}

	return nil
}
