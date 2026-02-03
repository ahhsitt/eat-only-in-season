// types/index.ts - TypeScript type definitions matching backend models

export interface City {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country?: string;
  timezone?: string;
}

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';
export type Hemisphere = 'north' | 'south';

export interface Season {
  id: SeasonId;
  name: string;
  hemisphere: Hemisphere;
}

export type ImageStatus = 'pending' | 'generating' | 'ready' | 'failed';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageBase64?: string;
  imageStatus: ImageStatus;
  cookingTime: number;
  difficulty: Difficulty;
  seasonalIngredients: string[];
  cuisine: string;
  createdAt: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  isSeasonal: boolean;
}

export interface CookingStep {
  order: number;
  instruction: string;
  duration?: number;
  tip?: string;
}

// RecipeDetail from API - only the detail fields
export interface RecipeDetailFromAPI {
  recipeId: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  tips?: string[];
}

// RecipeDetail for display - combines Recipe and detail info
export interface RecipeDetail {
  // Recipe base fields
  id: string;
  name: string;
  description: string;
  imageBase64?: string;
  imageStatus: ImageStatus;
  cookingTime: number;
  difficulty: Difficulty;
  seasonalIngredients: string[];
  cuisine: string;
  servings: number;
  // Detail fields
  ingredients: Ingredient[];
  steps: CookingStep[];
  tips?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface UserPreference {
  cityName?: string;
  preferenceText?: string;
  updatedAt: string;
}

export interface AIProvider {
  type: 'llm' | 'image';
  provider: string;
  model: string;
  available: boolean;
  priority: number;
}

// API Request/Response types
export interface CitySearchResponse {
  city: City;
  season: Season;
}

export interface GetRecipesRequest {
  cityName: string;
  preferenceText?: string;
}

export interface GetRecipesResponse {
  city: City;
  season: Season;
  recipes: Recipe[];
}

export interface RecipeDetailResponse {
  recipe: Recipe;
  detail: RecipeDetailFromAPI;
}

export interface ImageResponse {
  recipeId: string;
  status: ImageStatus;
  imageBase64: string;
}

export interface ImagePendingResponse {
  recipeId: string;
  status: ImageStatus;
  message: string;
}

export interface ExportPDFRequest {
  includeImage: boolean;
}

export interface ExportPDFResponse {
  fileName: string;
  pdfBase64: string;
}

export interface SystemStatusResponse {
  llmProviders: AIProvider[];
  imageProviders: AIProvider[];
  activeLlm: string;
  activeImage: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Season display helpers
export const SeasonNames: Record<SeasonId, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
};

export const DifficultyNames: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export const ImageStatusNames: Record<ImageStatus, string> = {
  pending: '待生成',
  generating: '生成中',
  ready: '已完成',
  failed: '生成失败',
};

// --- 003-flow-redesign-improvements: 新增类型定义 ---

// 食材分类 (code 值)
export type IngredientCategory = 'meat' | 'vegetable' | 'fruit' | 'seafood' | 'dairy' | 'other';

// 位置信息
export interface Location {
  inputName: string;
  matchedName: string;
  country?: string;
  season: string;
  month: number;
}

// 食材详情
export interface IngredientDetail {
  seasonReason: string;
  nutrition: string;
  selectionTips: string;
  storageTips?: string;
}

// 应季食材
export interface SeasonalIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  briefIntro: string;
  detailedInfo?: IngredientDetail;
  seasonMonths: number[];
}

// 按分类分组的食材
export interface IngredientCategoryGroup {
  category: IngredientCategory;
  ingredients: SeasonalIngredient[];
}

// 难度等级 (后端返回翻译后的显示名称)
export type DifficultyLevel = string;

// 带匹配信息的菜谱
export interface RecipeWithMatch {
  id: string;
  title: string;
  description: string;
  matchedIngredients: string[];
  matchCount: number;
  cookingTime: string;
  difficulty: DifficultyLevel;
  tags?: string[];
}

// 菜谱食材
export interface RecipeIngredient {
  name: string;
  amount: string;
  note?: string;
}

// 新烹饪步骤
export interface NewCookingStep {
  stepNumber: number;
  instruction: string;
  duration?: string;
}

// 新菜谱详情
export interface NewRecipeDetail {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: NewCookingStep[];
  cookingTime: string;
  servings: string;
  difficulty: DifficultyLevel;
  tags?: string[];
  tips?: string;
  imageUrl?: string;
}

// 用户偏好（带localStorage）
export interface NewUserPreference {
  preferenceText: string;
  lastCity?: string;
  updatedAt: number;
}

// --- 新增 API 请求/响应类型 ---

// 获取应季食材请求
export interface GetIngredientsRequest {
  city: string;
}

// 获取应季食材响应
export interface GetIngredientsResponse {
  location: Location;
  categories: IngredientCategoryGroup[];
}

// 根据食材获取菜谱推荐请求
export interface GetRecipesByIngredientsRequest {
  ingredients: string[];
  preference?: string;
  location?: string;
}

// 根据食材获取菜谱推荐响应
export interface GetRecipesByIngredientsResponse {
  recipes: RecipeWithMatch[];
}

// 获取新菜谱详情响应
export interface GetNewRecipeDetailResponse {
  recipe: NewRecipeDetail;
}

// 图片URL响应
export interface ImageURLResponse {
  imageUrl: string;
}

// localStorage key
export const PREFERENCES_STORAGE_KEY = 'eat-only-in-season:preferences';
