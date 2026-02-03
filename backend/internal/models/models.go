// Package models contains all data models for the seasonal recipe agent
package models

import "time"

// City represents a global city with geocoding information
type City struct {
	Name        string  `json:"name"`
	DisplayName string  `json:"displayName"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Country     string  `json:"country,omitempty"`
	Timezone    string  `json:"timezone,omitempty"`
}

// SeasonID represents the season identifier
type SeasonID string

const (
	SeasonSpring SeasonID = "spring"
	SeasonSummer SeasonID = "summer"
	SeasonAutumn SeasonID = "autumn"
	SeasonWinter SeasonID = "winter"
)

// Hemisphere represents the hemisphere
type Hemisphere string

const (
	HemisphereNorth Hemisphere = "north"
	HemisphereSouth Hemisphere = "south"
)

// Season represents the current season for a location
type Season struct {
	ID         SeasonID   `json:"id"`
	Name       string     `json:"name"`
	Hemisphere Hemisphere `json:"hemisphere"`
}

// ImageStatus represents the status of image generation
type ImageStatus string

const (
	ImageStatusPending    ImageStatus = "pending"
	ImageStatusGenerating ImageStatus = "generating"
	ImageStatusReady      ImageStatus = "ready"
	ImageStatusFailed     ImageStatus = "failed"
)

// Difficulty represents cooking difficulty level
type Difficulty string

const (
	DifficultyEasy   Difficulty = "easy"
	DifficultyMedium Difficulty = "medium"
	DifficultyHard   Difficulty = "hard"
)

// Recipe represents an AI-generated recipe
type Recipe struct {
	ID                  string      `json:"id"`
	Name                string      `json:"name"`
	Description         string      `json:"description"`
	ImageBase64         string      `json:"imageBase64,omitempty"`
	ImageStatus         ImageStatus `json:"imageStatus"`
	CookingTime         int         `json:"cookingTime"`
	Difficulty          Difficulty  `json:"difficulty"`
	SeasonalIngredients []string    `json:"seasonalIngredients"`
	Cuisine             string      `json:"cuisine"`
	CreatedAt           time.Time   `json:"createdAt"`
}

// Ingredient represents a recipe ingredient
type Ingredient struct {
	Name       string  `json:"name"`
	Amount     float64 `json:"amount"`
	Unit       string  `json:"unit"`
	IsSeasonal bool    `json:"isSeasonal"`
}

// CookingStep represents a cooking instruction step
type CookingStep struct {
	Order       int    `json:"order"`
	Instruction string `json:"instruction"`
	Duration    int    `json:"duration,omitempty"`
	Tip         string `json:"tip,omitempty"`
}

// RecipeDetail contains full recipe information
type RecipeDetail struct {
	RecipeID    string        `json:"recipeId"`
	Ingredients []Ingredient  `json:"ingredients"`
	Steps       []CookingStep `json:"steps"`
	Tips        []string      `json:"tips,omitempty"`
}

// UserPreference represents user dietary preferences
type UserPreference struct {
	CityName       string    `json:"cityName,omitempty"`
	PreferenceText string    `json:"preferenceText,omitempty"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// AIProviderType represents the type of AI provider
type AIProviderType string

const (
	AIProviderTypeLLM   AIProviderType = "llm"
	AIProviderTypeImage AIProviderType = "image"
)

// AIProvider represents an AI service provider status
type AIProvider struct {
	Type      AIProviderType `json:"type"`
	Provider  string         `json:"provider"`
	Model     string         `json:"model"`
	Available bool           `json:"available"`
	Priority  int            `json:"priority"`
}

// --- API Request/Response Types ---

// CitySearchResponse is the response for city search
type CitySearchResponse struct {
	City   City   `json:"city"`
	Season Season `json:"season"`
}

// GetRecipesRequest is the request for getting recipe recommendations
type GetRecipesRequest struct {
	CityName       string `json:"cityName" binding:"required"`
	PreferenceText string `json:"preferenceText,omitempty" binding:"max=200"`
}

// GetRecipesResponse is the response for recipe recommendations
type GetRecipesResponse struct {
	City    City     `json:"city"`
	Season  Season   `json:"season"`
	Recipes []Recipe `json:"recipes"`
}

// RecipeDetailResponse is the response for recipe detail
type RecipeDetailResponse struct {
	Recipe Recipe       `json:"recipe"`
	Detail RecipeDetail `json:"detail"`
}

// ImageResponse is the response for ready image
type ImageResponse struct {
	RecipeID    string      `json:"recipeId"`
	Status      ImageStatus `json:"status"`
	ImageBase64 string      `json:"imageBase64"`
}

// ImagePendingResponse is the response for pending/generating image
type ImagePendingResponse struct {
	RecipeID string      `json:"recipeId"`
	Status   ImageStatus `json:"status"`
	Message  string      `json:"message"`
}

// ExportPDFRequest is the request for PDF export
type ExportPDFRequest struct {
	IncludeImage bool `json:"includeImage"`
}

// ExportPDFResponse is the response for PDF export
type ExportPDFResponse struct {
	FileName  string `json:"fileName"`
	PDFBase64 string `json:"pdfBase64"`
}

// SystemStatusResponse is the response for system status
type SystemStatusResponse struct {
	LLMProviders   []AIProvider `json:"llmProviders"`
	ImageProviders []AIProvider `json:"imageProviders"`
	ActiveLLM      string       `json:"activeLlm"`
	ActiveImage    string       `json:"activeImage"`
}

// ErrorResponse is the standard error response
type ErrorResponse struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// --- 003-flow-redesign-improvements: 新增数据模型 ---

// IngredientCategory 食材分类 (code 值，用于 i18n 翻译)
type IngredientCategory string

const (
	CategoryMeat      IngredientCategory = "meat"
	CategoryVegetable IngredientCategory = "vegetable"
	CategoryFruit     IngredientCategory = "fruit"
	CategorySeafood   IngredientCategory = "seafood"
	CategoryDairy     IngredientCategory = "dairy"
	CategoryOther     IngredientCategory = "other"
)

// Location 用户查询的城市/地区信息
type Location struct {
	InputName   string `json:"inputName"`
	MatchedName string `json:"matchedName"`
	Country     string `json:"country,omitempty"`
	Season      string `json:"season"`
	Month       int    `json:"month"`
}

// SeasonalIngredient 应季食材
type SeasonalIngredient struct {
	ID           string              `json:"id"`
	Name         string              `json:"name"`
	Category     IngredientCategory  `json:"category"`
	BriefIntro   string              `json:"briefIntro"`
	DetailedInfo *IngredientDetail   `json:"detailedInfo,omitempty"`
	SeasonMonths []int               `json:"seasonMonths"`
}

// IngredientDetail 食材详情
type IngredientDetail struct {
	SeasonReason  string `json:"seasonReason"`
	Nutrition     string `json:"nutrition"`
	SelectionTips string `json:"selectionTips"`
	StorageTips   string `json:"storageTips,omitempty"`
}

// IngredientCategoryGroup 按分类分组的食材
type IngredientCategoryGroup struct {
	Category    IngredientCategory   `json:"category"`
	Ingredients []SeasonalIngredient `json:"ingredients"`
}

// --- 新增 API 请求/响应类型 ---

// GetIngredientsRequest 获取应季食材请求
type GetIngredientsRequest struct {
	City string `json:"city" binding:"required,max=100"`
}

// GetIngredientsResponse 获取应季食材响应
type GetIngredientsResponse struct {
	Location   Location                  `json:"location"`
	Categories []IngredientCategoryGroup `json:"categories"`
}

// GetIngredientDetailResponse 获取食材详情响应
type GetIngredientDetailResponse struct {
	Ingredient SeasonalIngredient `json:"ingredient"`
}

// GetRecipesByIngredientsRequest 根据食材获取菜谱推荐请求
type GetRecipesByIngredientsRequest struct {
	Ingredients []string `json:"ingredients"`
	Preference  string   `json:"preference,omitempty" binding:"max=500"`
	Location    string   `json:"location,omitempty"`
}

// RecipeWithMatch 带匹配信息的菜谱
type RecipeWithMatch struct {
	ID                 string   `json:"id"`
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	MatchedIngredients []string `json:"matchedIngredients"`
	MatchCount         int      `json:"matchCount"`
	CookingTime        string   `json:"cookingTime"`
	Difficulty         string   `json:"difficulty"`
	Tags               []string `json:"tags,omitempty"`
}

// GetRecipesByIngredientsResponse 根据食材获取菜谱推荐响应
type GetRecipesByIngredientsResponse struct {
	Recipes []RecipeWithMatch `json:"recipes"`
}

// NewRecipeDetail 新的菜谱详情结构
type NewRecipeDetail struct {
	ID          string             `json:"id"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Ingredients []RecipeIngredient `json:"ingredients"`
	Steps       []NewCookingStep   `json:"steps"`
	CookingTime string             `json:"cookingTime"`
	Servings    string             `json:"servings"`
	Difficulty  string             `json:"difficulty"`
	Tags        []string           `json:"tags,omitempty"`
	Tips        string             `json:"tips,omitempty"`
	ImageUrl    string             `json:"imageUrl,omitempty"`
}

// RecipeIngredient 菜谱食材
type RecipeIngredient struct {
	Name   string `json:"name"`
	Amount string `json:"amount"`
	Note   string `json:"note,omitempty"`
}

// NewCookingStep 新的烹饪步骤结构
type NewCookingStep struct {
	StepNumber  int    `json:"stepNumber"`
	Instruction string `json:"instruction"`
	Duration    string `json:"duration,omitempty"`
}

// GetNewRecipeDetailResponse 获取新菜谱详情响应
type GetNewRecipeDetailResponse struct {
	Recipe NewRecipeDetail `json:"recipe"`
}

// ImageURLResponse 图片URL响应
type ImageURLResponse struct {
	ImageURL string `json:"imageUrl"`
}
