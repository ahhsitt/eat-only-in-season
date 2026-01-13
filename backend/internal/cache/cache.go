// Package cache provides TTL-based caching for the application
package cache

import (
	"crypto/md5"
	"encoding/hex"
	"time"

	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/jellydator/ttlcache/v3"
)

// Cache TTL durations
const (
	CityTTL   = 7 * 24 * time.Hour // 7 days
	RecipeTTL = 24 * time.Hour     // 24 hours
	DetailTTL = 24 * time.Hour     // 24 hours
	ImageTTL  = 24 * time.Hour     // 24 hours
)

// Cache wraps ttlcache for application-specific caching
type Cache struct {
	cities       *ttlcache.Cache[string, *models.City]
	recipes      *ttlcache.Cache[string, []models.Recipe]
	singleRecipe *ttlcache.Cache[string, *models.Recipe]
	details      *ttlcache.Cache[string, *models.RecipeDetail]
	images       *ttlcache.Cache[string, string]
	imageURLs    *ttlcache.Cache[string, string] // 003-flow-redesign: 图片URL缓存
	status       *ttlcache.Cache[string, models.ImageStatus]
	// 003-flow-redesign: 新流程菜谱详情缓存
	newDetails *ttlcache.Cache[string, *models.NewRecipeDetail]
}

// Global cache instance
var DefaultCache *Cache

func init() {
	DefaultCache = NewCache()
}

// NewCache creates a new cache instance
func NewCache() *Cache {
	c := &Cache{
		cities: ttlcache.New[string, *models.City](
			ttlcache.WithTTL[string, *models.City](CityTTL),
		),
		recipes: ttlcache.New[string, []models.Recipe](
			ttlcache.WithTTL[string, []models.Recipe](RecipeTTL),
		),
		singleRecipe: ttlcache.New[string, *models.Recipe](
			ttlcache.WithTTL[string, *models.Recipe](RecipeTTL),
		),
		details: ttlcache.New[string, *models.RecipeDetail](
			ttlcache.WithTTL[string, *models.RecipeDetail](DetailTTL),
		),
		images: ttlcache.New[string, string](
			ttlcache.WithTTL[string, string](ImageTTL),
		),
		imageURLs: ttlcache.New[string, string](
			ttlcache.WithTTL[string, string](ImageTTL),
		),
		status: ttlcache.New[string, models.ImageStatus](
			ttlcache.WithTTL[string, models.ImageStatus](ImageTTL),
		),
		// 003-flow-redesign: 新流程菜谱详情缓存
		newDetails: ttlcache.New[string, *models.NewRecipeDetail](
			ttlcache.WithTTL[string, *models.NewRecipeDetail](DetailTTL),
		),
	}

	// Start automatic expiration cleanup
	go c.cities.Start()
	go c.recipes.Start()
	go c.singleRecipe.Start()
	go c.details.Start()
	go c.images.Start()
	go c.imageURLs.Start()
	go c.status.Start()
	go c.newDetails.Start()

	return c
}

// --- City Cache ---

// SetCity caches a city's geocoding information
func (c *Cache) SetCity(cityName string, city *models.City) {
	c.cities.Set(cityKey(cityName), city, ttlcache.DefaultTTL)
}

// GetCity retrieves a cached city
func (c *Cache) GetCity(cityName string) (*models.City, bool) {
	item := c.cities.Get(cityKey(cityName))
	if item == nil {
		return nil, false
	}
	return item.Value(), true
}

func cityKey(name string) string {
	return "city:" + name
}

// --- Recipe Cache ---

// RecipeCacheKey generates a cache key for recipes based on city, season, and preferences
func RecipeCacheKey(cityName string, seasonID models.SeasonID, preferenceText string) string {
	prefHash := ""
	if preferenceText != "" {
		hash := md5.Sum([]byte(preferenceText))
		prefHash = hex.EncodeToString(hash[:])[:8]
	}
	return "recipes:" + cityName + ":" + string(seasonID) + ":" + prefHash
}

// SetRecipes caches recipe recommendations
func (c *Cache) SetRecipes(key string, recipes []models.Recipe) {
	c.recipes.Set(key, recipes, ttlcache.DefaultTTL)
}

// GetRecipes retrieves cached recipe recommendations
func (c *Cache) GetRecipes(key string) ([]models.Recipe, bool) {
	item := c.recipes.Get(key)
	if item == nil {
		return nil, false
	}
	return item.Value(), true
}

// --- Recipe Detail Cache ---

// SetRecipeDetail caches a recipe's detailed information
func (c *Cache) SetRecipeDetail(recipeID string, detail *models.RecipeDetail) {
	c.details.Set(detailKey(recipeID), detail, ttlcache.DefaultTTL)
}

// GetRecipeDetail retrieves a cached recipe detail
func (c *Cache) GetRecipeDetail(recipeID string) (*models.RecipeDetail, bool) {
	item := c.details.Get(detailKey(recipeID))
	if item == nil {
		return nil, false
	}
	return item.Value(), true
}

func detailKey(recipeID string) string {
	return "detail:" + recipeID
}

// --- Image Cache ---

// SetImageBase64 caches the Base64 encoded image for a recipe
func (c *Cache) SetImageBase64(recipeID string, base64Image string) {
	c.images.Set(imageKey(recipeID), base64Image, ttlcache.DefaultTTL)
}

// GetImageBase64 retrieves a cached Base64 image
func (c *Cache) GetImageBase64(recipeID string) (string, bool) {
	item := c.images.Get(imageKey(recipeID))
	if item == nil {
		return "", false
	}
	return item.Value(), true
}

func imageKey(recipeID string) string {
	return "image:" + recipeID
}

// --- Image Status Cache ---

// SetImageStatus caches the image generation status for a recipe
func (c *Cache) SetImageStatus(recipeID string, status models.ImageStatus) {
	c.status.Set(statusKey(recipeID), status, ttlcache.DefaultTTL)
}

// GetImageStatus retrieves the cached image generation status
func (c *Cache) GetImageStatus(recipeID string) (models.ImageStatus, bool) {
	item := c.status.Get(statusKey(recipeID))
	if item == nil {
		return "", false
	}
	return item.Value(), true
}

func statusKey(recipeID string) string {
	return "status:" + recipeID
}

// --- Store Recipe with Full Info ---

// SetSingleRecipe caches a single recipe by ID
func (c *Cache) SetSingleRecipe(recipeID string, recipe *models.Recipe) {
	c.singleRecipe.Set("recipe:"+recipeID, recipe, ttlcache.DefaultTTL)
}

// GetSingleRecipe retrieves a cached single recipe
func (c *Cache) GetSingleRecipe(recipeID string) (*models.Recipe, bool) {
	item := c.singleRecipe.Get("recipe:" + recipeID)
	if item == nil {
		return nil, false
	}
	return item.Value(), true
}

// StoreRecipe stores a recipe and its status in cache
func (c *Cache) StoreRecipe(recipe *models.Recipe) {
	c.SetSingleRecipe(recipe.ID, recipe)
	c.SetImageStatus(recipe.ID, recipe.ImageStatus)
	if recipe.ImageBase64 != "" {
		c.SetImageBase64(recipe.ID, recipe.ImageBase64)
	}
}

// --- 003-flow-redesign: New Recipe Detail Cache ---

// SetNewRecipeDetail caches a new flow recipe detail
func (c *Cache) SetNewRecipeDetail(recipeID string, detail *models.NewRecipeDetail) {
	c.newDetails.Set("new-detail:"+recipeID, detail, ttlcache.DefaultTTL)
}

// GetNewRecipeDetail retrieves a cached new flow recipe detail
func (c *Cache) GetNewRecipeDetail(recipeID string) (*models.NewRecipeDetail, bool) {
	item := c.newDetails.Get("new-detail:" + recipeID)
	if item == nil {
		return nil, false
	}
	return item.Value(), true
}

// --- 003-flow-redesign: Image URL Cache ---

// SetImageURL caches the image URL for a recipe
func (c *Cache) SetImageURL(recipeID string, imageURL string) {
	c.imageURLs.Set("image-url:"+recipeID, imageURL, ttlcache.DefaultTTL)
}

// GetImageURL retrieves a cached image URL
func (c *Cache) GetImageURL(recipeID string) (string, bool) {
	item := c.imageURLs.Get("image-url:" + recipeID)
	if item == nil {
		return "", false
	}
	return item.Value(), true
}
