package api

import (
	"github.com/eat-only-in-season/backend/internal/api/handlers"
	"github.com/eat-only-in-season/backend/internal/api/middleware"
	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/services/ai"
	"github.com/eat-only-in-season/backend/internal/services/ai/imagegen"
	"github.com/eat-only-in-season/backend/internal/services/ingredient"
	"github.com/eat-only-in-season/backend/internal/services/pdf"
	"github.com/eat-only-in-season/backend/internal/services/recipe"
	"github.com/eat-only-in-season/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

// SetupRouter 配置并返回路由
func SetupRouter() *gin.Engine {
	router := gin.Default()

	// Load configuration
	cfg := config.Load()

	// Initialize provider manager
	provider := ai.NewProviderManager(cfg)

	// Initialize image generation service (optional)
	var imageService *imagegen.Service
	if provider.HasImageGen() {
		var err error
		imageService, err = imagegen.NewService(cfg, provider)
		if err != nil {
			gin.DefaultWriter.Write([]byte("Warning: Image service initialization failed: " + err.Error() + "\n"))
		}
	}

	// Global middleware
	router.Use(middleware.CORS())
	router.Use(middleware.ErrorHandler())

	// Initialize handlers
	cityHandler := handlers.NewCityHandler(cache.DefaultCache)
	systemHandler := handlers.NewSystemHandler(provider)
	imageHandler := handlers.NewImageHandler(cache.DefaultCache, imageService)
	pdfHandler := handlers.NewPDFHandler(cache.DefaultCache, pdf.NewService())

	// 003-flow-redesign: Initialize new services and handlers
	var ingredientService *ingredient.Service
	var recipeService *recipe.Service
	if provider.HasLLM() {
		var err error
		ingredientService, err = ingredient.NewService(cfg, provider)
		if err != nil {
			gin.DefaultWriter.Write([]byte("Warning: Ingredient service initialization failed: " + err.Error() + "\n"))
		}
		recipeService, err = recipe.NewService(cfg, provider)
		if err != nil {
			gin.DefaultWriter.Write([]byte("Warning: Recipe service initialization failed: " + err.Error() + "\n"))
		}
	}
	ingredientHandler := handlers.NewIngredientHandler(cache.DefaultCache, ingredientService)
	newRecipeHandler := handlers.NewNewFlowRecipeHandler(cache.DefaultCache, recipeService)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// City endpoints
		city := v1.Group("/city")
		{
			city.GET("/search", cityHandler.Search)
			city.GET("/suggestions", cityHandler.Suggestions)
		}

		// Recipe endpoints (003-flow-redesign: 新流程 API)
		recipes := v1.Group("/recipes")
		{
			// Image endpoints
			recipes.GET("/:recipeId/image", imageHandler.GetRecipeImage)
			recipes.POST("/:recipeId/image", imageHandler.GenerateRecipeImage)
			recipes.GET("/:recipeId/image-url", imageHandler.GetRecipeImageUrl)
			recipes.GET("/:recipeId/image-proxy", imageHandler.ProxyRecipeImage) // 006: 图片代理，用于 PDF 导出
			// PDF export
			recipes.POST("/:recipeId/pdf", pdfHandler.ExportPDF)
			// New recipe endpoints
			recipes.POST("/by-ingredients", newRecipeHandler.GetRecipesByIngredients)
			recipes.GET("/:recipeId/detail", newRecipeHandler.GetNewRecipeDetail)
		}

		// 003-flow-redesign: Ingredient endpoints
		ingredients := v1.Group("/ingredients")
		{
			ingredients.POST("", ingredientHandler.GetSeasonalIngredients)
			ingredients.GET("/:id/detail", ingredientHandler.GetIngredientDetail)
		}

		// System endpoints
		system := v1.Group("/system")
		{
			system.GET("/health", systemHandler.Health)
			system.GET("/status", systemHandler.Status)
			system.GET("/cache-stats", systemHandler.CacheStats)
		}
	}

	return router
}
