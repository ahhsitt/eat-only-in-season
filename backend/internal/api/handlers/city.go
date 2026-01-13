// Package handlers provides HTTP handlers for the API
package handlers

import (
	"net/http"

	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/city"
	"github.com/eat-only-in-season/backend/internal/services/season"
	"github.com/gin-gonic/gin"
)

// CityHandler handles city-related requests
type CityHandler struct {
	geocoder   *city.Geocoder
	calculator *season.Calculator
}

// NewCityHandler creates a new city handler
func NewCityHandler(c *cache.Cache) *CityHandler {
	return &CityHandler{
		geocoder:   city.NewGeocoder(c),
		calculator: season.NewCalculator(),
	}
}

// Search handles GET /api/v1/city/search
// @Summary 搜索城市
// @Description 根据用户输入搜索城市，返回地理信息和当前季节
// @Tags city
// @Accept json
// @Produce json
// @Param q query string true "城市名称"
// @Success 200 {object} models.CitySearchResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /city/search [get]
func (h *CityHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:    "INVALID_QUERY",
			Message: "请输入城市名称",
		})
		return
	}

	// Search for city
	cityInfo, err := h.geocoder.SearchCity(c.Request.Context(), query)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Code:    "CITY_NOT_FOUND",
			Message: err.Error(),
			Details: map[string]any{
				"suggestions": city.PopularCities(),
			},
		})
		return
	}

	// Calculate season
	currentSeason := h.calculator.GetCurrentSeason(cityInfo.Latitude)

	c.JSON(http.StatusOK, models.CitySearchResponse{
		City:   *cityInfo,
		Season: currentSeason,
	})
}

// Suggestions handles GET /api/v1/city/suggestions
// @Summary 获取热门城市建议
// @Description 返回热门城市列表供用户选择
// @Tags city
// @Produce json
// @Success 200 {array} string
// @Router /city/suggestions [get]
func (h *CityHandler) Suggestions(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"suggestions": city.PopularCities(),
	})
}
