# Data Model: 应季食谱推荐 AI Agent

**Date**: 2026-01-08 (Updated)
**Feature**: 001-seasonal-recipe-agent

## 概述

本项目无持久化数据库，数据模型主要用于：
1. 后端 API 请求/响应结构
2. 前端 TypeScript 类型定义
3. AI 生成内容的结构化解析

## 实体定义

### City（城市）

表示用户输入的全球城市，通过地理编码服务解析。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✓ | 城市名称（原始输入） |
| displayName | string | ✓ | 显示名称（标准化中文名 + 英文名） |
| latitude | float64 | ✓ | 纬度（-90 到 90） |
| longitude | float64 | ✓ | 经度（-180 到 180） |
| country | string | ✗ | 所属国家 |
| timezone | string | ✗ | 时区（如 "Asia/Tokyo"） |

**示例**:
```json
{
  "name": "Tokyo",
  "displayName": "东京 (Tokyo)",
  "latitude": 35.6762,
  "longitude": 139.6503,
  "country": "Japan",
  "timezone": "Asia/Tokyo"
}
```

---

### Season（季节）

由系统根据城市纬度和当前日期自动计算。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✓ | 季节标识 |
| name | string | ✓ | 显示名称 |
| hemisphere | string | ✓ | 半球：north/south |

**枚举值**:
| ID | 名称 |
|----|------|
| spring | 春季 |
| summer | 夏季 |
| autumn | 秋季 |
| winter | 冬季 |

**季节判断逻辑**:
- 纬度 > 0：北半球
- 纬度 < 0：南半球
- 南半球季节与北半球相反

---

### Recipe（菜谱）

AI 生成的菜谱信息。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✓ | 唯一标识（UUID） |
| name | string | ✓ | 菜名 |
| description | string | ✓ | 简短描述（50字内） |
| imageBase64 | string | ✗ | AI 生成图片的 Base64 编码 |
| imageStatus | string | ✓ | 图片状态：pending/generating/ready/failed |
| cookingTime | int | ✓ | 预计烹饪时间（分钟） |
| difficulty | string | ✓ | 难度：easy/medium/hard |
| seasonalIngredients | []string | ✓ | 应季食材列表 |
| cuisine | string | ✓ | 菜系风格（如 "日式"、"川菜"） |
| createdAt | datetime | ✓ | 创建时间 |

---

### RecipeDetail（菜谱详情）

菜谱的完整制作信息，按需加载。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| recipeId | string | ✓ | 关联菜谱 ID |
| ingredients | []Ingredient | ✓ | 完整食材清单 |
| steps | []CookingStep | ✓ | 制作步骤 |
| tips | []string | ✗ | 烹饪小贴士 |

---

### Ingredient（食材）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✓ | 食材名称 |
| amount | float64 | ✓ | 用量数值 |
| unit | string | ✓ | 单位（如 "克"、"个"、"毫升"） |
| isSeasonal | bool | ✓ | 是否应季 |

**示例**:
```json
{
  "name": "鸡蛋",
  "amount": 2,
  "unit": "个",
  "isSeasonal": true
}
```

---

### CookingStep（制作步骤）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| order | int | ✓ | 步骤序号（从 1 开始） |
| instruction | string | ✓ | 步骤说明 |
| duration | int | ✗ | 该步骤耗时（分钟） |
| tip | string | ✗ | 步骤提示 |

---

### UserPreference（用户偏好）

存储在浏览器 localStorage 中。**改为自然语言文本描述**。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cityName | string | ✗ | 用户选择的城市名称 |
| preferenceText | string | ✗ | 自然语言偏好描述（限200字） |
| updatedAt | datetime | ✓ | 最后更新时间 |

**localStorage 键**: `seasonal-recipe-preferences`

**示例**:
```json
{
  "cityName": "成都",
  "preferenceText": "我是素食主义者，不吃任何肉类和海鲜，喜欢清淡口味，对花生过敏",
  "updatedAt": "2026-01-08T10:30:00Z"
}
```

**约束**:
- `preferenceText` 最大长度 200 字符
- 前端需提供实时字数统计（X/200）

---

### PDFExport（PDF导出）

PDF 导出请求和响应结构。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| recipeId | string | ✓ | 要导出的菜谱 ID |
| includeImage | bool | ✓ | 是否包含图片 |
| fileName | string | ✓ | 生成的文件名（格式：菜谱名称_日期.pdf） |
| pdfBase64 | string | ✓ | PDF 文件的 Base64 编码 |

---

### AIProvider（AI 服务提供商）

系统运行时检测的 AI 服务状态。LLM 和图像生成均通过 helloagents-go 框架的 Provider 统一管理。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | ✓ | 类型：llm/image |
| provider | string | ✓ | 提供商名称 |
| model | string | ✓ | 使用的模型 |
| available | bool | ✓ | 是否可用 |
| priority | int | ✓ | 优先级（1 最高） |

**LLM 提供商** (helloagents-go Provider):
| 优先级 | Provider | 环境变量 | 模型 |
|--------|----------|----------|------|
| 1 | OpenAI | OPENAI_API_KEY | gpt-4o-mini |
| 2 | DeepSeek | DEEPSEEK_API_KEY | deepseek-chat |
| 3 | Qwen | DASHSCOPE_API_KEY | qwen-plus |
| 4 | Ollama | OLLAMA_HOST | llama3 |

**图像生成提供商** (helloagents-go NewImageProvider):
| 优先级 | Provider | 环境变量 | 模型 |
|--------|----------|----------|------|
| 1 | DALL-E | OPENAI_API_KEY | dall-e-3 |
| 2 | 通义万象 | DASHSCOPE_API_KEY | wanx-v1 |
| 3 | Stability AI | STABILITY_API_KEY | stable-diffusion-xl |

---

## 状态转换

### Recipe.imageStatus 状态机

```
[pending] ---(开始生成)---> [generating]
    |                           |
    |                           +---(生成成功)---> [ready]
    |                           |
    |                           +---(生成失败)---> [failed]
    |
    +---(无图像服务)---> [failed]

[failed] ---(用户点击重试)---> [generating]
```

---

## 关系图

```
UserPreference (localStorage)
      |
      +--- cityName ---> City (geo-golang 解析)
      |                    |
      |                    +--- latitude/longitude ---> Season (自动计算)
      |
      +--- preferenceText ---> LLM Prompt 上下文
                                    |
                                    v
                              Recipe[] ---> RecipeDetail
                                  |              |
                                  v              v
                           imageBase64     Ingredient[]
                                                 |
                                                 v
                                           CookingStep[]
```

---

## 缓存策略

| 缓存键模式 | 数据 | TTL |
|-----------|------|-----|
| `city:{cityName}` | City 地理信息 | 7 天 |
| `recipes:{city}:{season}:{prefHash}` | Recipe[] 推荐列表 | 24 小时 |
| `detail:{recipeId}` | RecipeDetail | 24 小时 |
| `image:{recipeId}` | Base64 图片 | 24 小时 |

**prefHash**: 用户偏好文本的 MD5 哈希（前8位）

---

## 验证规则

| 实体 | 字段 | 规则 |
|------|------|------|
| City | name | 长度 1-100 字符 |
| City | latitude | 范围 -90 到 90 |
| City | longitude | 范围 -180 到 180 |
| Recipe | name | 长度 2-50 字符 |
| Recipe | description | 长度 10-100 字符 |
| Recipe | cookingTime | 范围 5-480 分钟 |
| Ingredient | amount | > 0 |
| Ingredient | unit | 非空字符串 |
| CookingStep | order | >= 1 |
| UserPreference | preferenceText | 最大 200 字符 |

---

## TypeScript 类型定义

```typescript
// types/index.ts

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

export interface RecipeDetail {
  recipeId: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  tips?: string[];
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
```

---

## Go 结构体定义

```go
// internal/models/models.go

package models

import "time"

type City struct {
    Name        string  `json:"name"`
    DisplayName string  `json:"displayName"`
    Latitude    float64 `json:"latitude"`
    Longitude   float64 `json:"longitude"`
    Country     string  `json:"country,omitempty"`
    Timezone    string  `json:"timezone,omitempty"`
}

type Season struct {
    ID         string `json:"id"`
    Name       string `json:"name"`
    Hemisphere string `json:"hemisphere"`
}

type Recipe struct {
    ID                  string    `json:"id"`
    Name                string    `json:"name"`
    Description         string    `json:"description"`
    ImageBase64         string    `json:"imageBase64,omitempty"`
    ImageStatus         string    `json:"imageStatus"`
    CookingTime         int       `json:"cookingTime"`
    Difficulty          string    `json:"difficulty"`
    SeasonalIngredients []string  `json:"seasonalIngredients"`
    Cuisine             string    `json:"cuisine"`
    CreatedAt           time.Time `json:"createdAt"`
}

type Ingredient struct {
    Name       string  `json:"name"`
    Amount     float64 `json:"amount"`
    Unit       string  `json:"unit"`
    IsSeasonal bool    `json:"isSeasonal"`
}

type CookingStep struct {
    Order       int    `json:"order"`
    Instruction string `json:"instruction"`
    Duration    int    `json:"duration,omitempty"`
    Tip         string `json:"tip,omitempty"`
}

type RecipeDetail struct {
    RecipeID    string        `json:"recipeId"`
    Ingredients []Ingredient  `json:"ingredients"`
    Steps       []CookingStep `json:"steps"`
    Tips        []string      `json:"tips,omitempty"`
}

type AIProvider struct {
    Type      string `json:"type"`
    Provider  string `json:"provider"`
    Model     string `json:"model"`
    Available bool   `json:"available"`
    Priority  int    `json:"priority"`
}
```
