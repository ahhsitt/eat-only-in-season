# Data Model: 应用流程重构与功能增强

**Feature**: 003-flow-redesign-improvements
**Date**: 2026-01-13
**Updated**: 2026-01-13

## 实体概述

本功能涉及以下核心数据实体：

- **业务实体**: Location, SeasonalIngredient, Recipe, RecipeDetail, UserPreference
- **缓存实体**: CacheConfig, CacheEntry (双层缓存架构)

---

## 1. Location（城市/地区）

用户输入的查询地点。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inputName | string | 是 | 用户原始输入 |
| matchedName | string | 是 | AI 匹配的实际城市/地区名 |
| country | string | 否 | 国家/地区 |
| season | string | 是 | 当前季节（春/夏/秋/冬） |
| month | number | 是 | 当前月份（1-12） |

### TypeScript 定义

```typescript
interface Location {
  inputName: string;
  matchedName: string;
  country?: string;
  season: string;
  month: number;
}
```

### Go 定义

```go
type Location struct {
    InputName   string `json:"inputName"`
    MatchedName string `json:"matchedName"`
    Country     string `json:"country,omitempty"`
    Season      string `json:"season"`
    Month       int    `json:"month"`
}
```

---

## 2. SeasonalIngredient（应季食材）

当前季节适合食用的食材。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识（UUID） |
| name | string | 是 | 食材名称 |
| category | string | 是 | 分类（肉类/蔬菜/水果/海鲜/蛋奶/其他） |
| briefIntro | string | 是 | 简短介绍（50字内） |
| detailedInfo | IngredientDetail | 否 | 详细信息（按需加载） |
| seasonMonths | number[] | 是 | 应季月份列表 |

### IngredientDetail（食材详情）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| seasonReason | string | 是 | 应季原因 |
| nutrition | string | 是 | 营养价值 |
| selectionTips | string | 是 | 挑选建议 |
| storageTips | string | 否 | 储存建议 |

### TypeScript 定义

```typescript
type IngredientCategory = '肉类' | '蔬菜' | '水果' | '海鲜' | '蛋奶' | '其他';

interface IngredientDetail {
  seasonReason: string;
  nutrition: string;
  selectionTips: string;
  storageTips?: string;
}

interface SeasonalIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  briefIntro: string;
  detailedInfo?: IngredientDetail;
  seasonMonths: number[];
}
```

### Go 定义

```go
type IngredientCategory string

const (
    CategoryMeat      IngredientCategory = "肉类"
    CategoryVegetable IngredientCategory = "蔬菜"
    CategoryFruit     IngredientCategory = "水果"
    CategorySeafood   IngredientCategory = "海鲜"
    CategoryDairy     IngredientCategory = "蛋奶"
    CategoryOther     IngredientCategory = "其他"
)

type IngredientDetail struct {
    SeasonReason  string `json:"seasonReason"`
    Nutrition     string `json:"nutrition"`
    SelectionTips string `json:"selectionTips"`
    StorageTips   string `json:"storageTips,omitempty"`
}

type SeasonalIngredient struct {
    ID           string             `json:"id"`
    Name         string             `json:"name"`
    Category     IngredientCategory `json:"category"`
    BriefIntro   string             `json:"briefIntro"`
    DetailedInfo *IngredientDetail  `json:"detailedInfo,omitempty"`
    SeasonMonths []int              `json:"seasonMonths"`
}
```

---

## 3. Recipe（菜谱）

可制作的菜品。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识（UUID） |
| title | string | 是 | 菜谱标题 |
| description | string | 是 | 简短描述（100字内） |
| matchedIngredients | string[] | 是 | 匹配的选中食材名称 |
| matchCount | number | 是 | 匹配食材数量（用于排序） |
| cookingTime | string | 是 | 烹饪时间（如"30分钟"） |
| difficulty | string | 是 | 难度（简单/中等/复杂） |
| tags | string[] | 否 | 标签（如["清淡", "下饭"]） |

### TypeScript 定义

```typescript
type DifficultyLevel = '简单' | '中等' | '复杂';

interface Recipe {
  id: string;
  title: string;
  description: string;
  matchedIngredients: string[];
  matchCount: number;
  cookingTime: string;
  difficulty: DifficultyLevel;
  tags?: string[];
}
```

### Go 定义

```go
type DifficultyLevel string

const (
    DifficultyEasy   DifficultyLevel = "简单"
    DifficultyMedium DifficultyLevel = "中等"
    DifficultyHard   DifficultyLevel = "复杂"
)

type Recipe struct {
    ID                 string          `json:"id"`
    Title              string          `json:"title"`
    Description        string          `json:"description"`
    MatchedIngredients []string        `json:"matchedIngredients"`
    MatchCount         int             `json:"matchCount"`
    CookingTime        string          `json:"cookingTime"`
    Difficulty         DifficultyLevel `json:"difficulty"`
    Tags               []string        `json:"tags,omitempty"`
}
```

---

## 4. RecipeDetail（菜谱详情）

菜谱的完整信息。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识 |
| title | string | 是 | 菜谱标题 |
| description | string | 是 | 详细描述 |
| ingredients | RecipeIngredient[] | 是 | 食材清单 |
| steps | CookingStep[] | 是 | 烹饪步骤 |
| cookingTime | string | 是 | 烹饪时间 |
| servings | string | 是 | 份量（如"2-3人份"） |
| difficulty | string | 是 | 难度 |
| tags | string[] | 否 | 标签 |
| tips | string | 否 | 烹饪小贴士 |
| imageUrl | string | 否 | 图片 URL（生成后填充） |

### RecipeIngredient（菜谱食材）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 食材名称 |
| amount | string | 是 | 用量（如"200克"） |
| note | string | 否 | 备注（如"切丝"） |

### CookingStep（烹饪步骤）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stepNumber | number | 是 | 步骤序号 |
| instruction | string | 是 | 步骤说明 |
| duration | string | 否 | 时长（如"5分钟"） |

### TypeScript 定义

```typescript
interface RecipeIngredient {
  name: string;
  amount: string;
  note?: string;
}

interface CookingStep {
  stepNumber: number;
  instruction: string;
  duration?: string;
}

interface RecipeDetail {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  cookingTime: string;
  servings: string;
  difficulty: DifficultyLevel;
  tags?: string[];
  tips?: string;
  imageUrl?: string;
}
```

### Go 定义

```go
type RecipeIngredient struct {
    Name   string `json:"name"`
    Amount string `json:"amount"`
    Note   string `json:"note,omitempty"`
}

type CookingStep struct {
    StepNumber  int    `json:"stepNumber"`
    Instruction string `json:"instruction"`
    Duration    string `json:"duration,omitempty"`
}

type RecipeDetail struct {
    ID          string             `json:"id"`
    Title       string             `json:"title"`
    Description string             `json:"description"`
    Ingredients []RecipeIngredient `json:"ingredients"`
    Steps       []CookingStep      `json:"steps"`
    CookingTime string             `json:"cookingTime"`
    Servings    string             `json:"servings"`
    Difficulty  DifficultyLevel    `json:"difficulty"`
    Tags        []string           `json:"tags,omitempty"`
    Tips        string             `json:"tips,omitempty"`
    ImageUrl    string             `json:"imageUrl,omitempty"`
}
```

---

## 5. UserPreference（用户偏好）

用户的饮食偏好设置，存储在前端 localStorage。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| preferenceText | string | 是 | 用户自定义偏好文本 |
| lastCity | string | 否 | 上次查询的城市 |
| updatedAt | number | 是 | 更新时间戳（毫秒） |

### TypeScript 定义

```typescript
interface UserPreference {
  preferenceText: string;
  lastCity?: string;
  updatedAt: number;
}
```

### localStorage Key

```
eat-only-in-season:preferences
```

---

## 实体关系图

```
┌──────────────┐
│   Location   │
└──────┬───────┘
       │ 查询
       ▼
┌──────────────────────┐
│  SeasonalIngredient  │──────────────┐
│  (按 category 分组)   │              │
└──────────┬───────────┘              │
           │ 选择                      │
           ▼                          │
    ┌──────────────┐                  │
    │    Recipe    │◄─────────────────┘
    │ (列表，5道)   │  matchedIngredients
    └──────┬───────┘
           │ 点击
           ▼
    ┌──────────────┐
    │ RecipeDetail │
    │   + Image    │
    │   + PDF      │
    └──────────────┘

┌──────────────────┐
│  UserPreference  │ (localStorage 独立存储)
└──────────────────┘
```

---

## 数据流

1. **用户输入城市** → 调用 `/api/ingredients` → 返回 `Location` + `SeasonalIngredient[]`
2. **用户选择食材** → 前端状态管理选中项
3. **获取菜谱** → 调用 `/api/recipes` (带 preference) → 返回 `Recipe[]` (5道)
4. **查看详情** → 调用 `/api/recipes/:id` → 返回 `RecipeDetail`
5. **加载图片** → 调用 `/api/recipes/:id/image` → 更新 `imageUrl`
6. **导出 PDF** → 调用 `/api/recipes/:id/pdf` → 下载文件

---

## 验证规则

| 实体 | 字段 | 规则 |
|------|------|------|
| Location | inputName | 非空，最大100字符 |
| SeasonalIngredient | name | 非空，最大50字符 |
| SeasonalIngredient | category | 必须为预定义分类之一 |
| Recipe | matchCount | >= 0 |
| RecipeDetail | steps | 至少1步 |
| UserPreference | preferenceText | 最大500字符 |
| CacheEntry | key | 非空，唯一 |
| CacheEntry | expiresAt | 必须大于 createdAt |
| CacheConfig | memoryTTL | > 0 |
| CacheConfig | sqliteTTL | > memoryTTL |

---

## 6. CacheConfig（缓存配置）

双层缓存架构的配置参数，仅在后端使用。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| memoryTTL | duration | 是 | 内存缓存过期时间（默认1小时） |
| memoryMaxItems | number | 是 | 内存缓存最大条目数（默认1000） |
| sqliteTTL | duration | 是 | SQLite缓存过期时间（默认7天） |
| sqliteCleanInterval | duration | 是 | SQLite清理间隔（默认1小时） |
| sqlitePath | string | 是 | SQLite数据库文件路径 |

### Go 定义

```go
type CacheConfig struct {
    // 内存LRU缓存
    MemoryTTL      time.Duration `json:"memoryTTL"`
    MemoryMaxItems int           `json:"memoryMaxItems"`

    // SQLite持久化缓存
    SQLiteTTL           time.Duration `json:"sqliteTTL"`
    SQLiteCleanInterval time.Duration `json:"sqliteCleanInterval"`
    SQLitePath          string        `json:"sqlitePath"`
}

// DefaultCacheConfig 默认配置
var DefaultCacheConfig = CacheConfig{
    MemoryTTL:           1 * time.Hour,
    MemoryMaxItems:      1000,
    SQLiteTTL:           7 * 24 * time.Hour,
    SQLiteCleanInterval: 1 * time.Hour,
    SQLitePath:          "./data/cache.db",
}
```

### 环境变量配置

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| CACHE_MEMORY_TTL | 内存缓存TTL（秒） | 3600 |
| CACHE_MEMORY_MAX_ITEMS | 内存缓存最大条目 | 1000 |
| CACHE_SQLITE_TTL | SQLite缓存TTL（秒） | 604800 |
| CACHE_SQLITE_CLEAN_INTERVAL | SQLite清理间隔（秒） | 3600 |
| CACHE_SQLITE_PATH | SQLite文件路径 | ./data/cache.db |

---

## 7. CacheEntry（缓存条目）

SQLite持久化缓存的数据条目。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 缓存键（主键） |
| value | blob | 是 | 缓存值（二进制数据） |
| expiresAt | number | 是 | 过期时间（Unix时间戳） |
| createdAt | number | 是 | 创建时间（Unix时间戳） |

### SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS cache_entries (
    key TEXT PRIMARY KEY,
    value BLOB NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expires_at ON cache_entries(expires_at);
```

### Go 定义

```go
type CacheEntry struct {
    Key       string `db:"key"`
    Value     []byte `db:"value"`
    ExpiresAt int64  `db:"expires_at"`
    CreatedAt int64  `db:"created_at"`
}
```

### 缓存键命名规范

```text
格式: {类型}:{标识符}[:附加信息]

示例:
- ingredients:汕尾:summer:1    # 城市+季节+月份的食材列表
- ingredient:detail:马鲛鱼     # 食材详情
- recipes:马鲛鱼,番茄          # 菜谱列表（按食材组合）
- recipe:detail:{uuid}        # 菜谱详情
- image:{uuid}                # 菜谱图片（BLOB）
```

---

## 8. ImagePromptTemplate（图片提示词模板）

用于生成精准AI图片的提示词模板，仅在后端使用。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dishNameCN | string | 是 | 菜品中文名称 |
| dishNameEN | string | 是 | 菜品英文名称 |
| ingredientDesc | string | 是 | 食材视觉特征描述 |
| cookingMethod | string | 是 | 烹饪方式 |
| platingStyle | string | 是 | 摆盘风格 |
| negativePrompts | string[] | 是 | 负向提示词（排除项） |

### Go 定义

```go
type ImagePromptTemplate struct {
    DishNameCN      string   `json:"dishNameCN"`
    DishNameEN      string   `json:"dishNameEN"`
    IngredientDesc  string   `json:"ingredientDesc"`
    CookingMethod   string   `json:"cookingMethod"`
    PlatingStyle    string   `json:"platingStyle"`
    NegativePrompts []string `json:"negativePrompts"`
}

// 预定义的鱼类视觉特征
var FishVisualFeatures = map[string]string{
    "马鲛鱼": "whole mackerel with distinctive green-blue dorsal surface and silver belly, elongated body shape, approximately 20-30cm length",
    "鲈鱼":   "whole sea bass with silver-gray scales, large mouth, prominent dorsal fin",
    "黄花鱼": "whole yellow croaker with golden-yellow color, compressed body shape",
    "鲫鱼":   "whole crucian carp with silver scales, deep oval body shape",
    "草鱼":   "whole grass carp with greenish-brown back, elongated body",
}
```

---

## 缓存架构图

```text
┌─────────────────────────────────────────────────────────────┐
│                        用户请求                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              内存LRU缓存 (ttlcache/v3)                        │
│              TTL: 1小时 | MaxItems: 1000                     │
├─────────────────────────────────────────────────────────────┤
│  命中 ──► 直接返回 (延迟 <1ms)                                │
│  未命中 ──► 继续查询SQLite                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            SQLite持久化缓存 (modernc.org/sqlite)              │
│            TTL: 7天 | WAL模式 | 定时清理                      │
├─────────────────────────────────────────────────────────────┤
│  命中 ──► 加载到内存缓存 ──► 返回 (延迟 ~10ms)                  │
│  未命中 ──► 调用AI服务                                        │
└───────────────────��──────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI服务调用                              │
│              (OpenAI/DeepSeek/DashScope/Ollama)              │
├─────────────────────────────────────────────────────────────┤
│  生成数据 ──► 同时写入两层缓存 ──► 返回 (延迟 1-5秒)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    后台定时任务                               │
│              每1小时清理SQLite过期条目                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 完整实体关系图

```text
┌──────────────┐
│   Location   │
└──────┬───────┘
       │ 查询 (缓存键: ingredients:{city}:{season}:{month})
       ▼
┌──────────────────────┐
│  SeasonalIngredient  │──────────────┐
│  (按 category 分组)   │              │ 详情 (缓存键: ingredient:detail:{name})
└──────────┬───────────┘              │
           │ 选择                      │
           ▼                          │
    ┌──────────────┐                  │
    │    Recipe    │◄─────────────────┘
    │ (列表，5道)   │  matchedIngredients (缓存键: recipes:{ingredients})
    └──────┬───────┘
           │ 点击
           ▼
    ┌──────────────┐
    │ RecipeDetail │ (缓存键: recipe:detail:{id})
    │   + Image    │ (缓存键: image:{id})
    │   + PDF      │ (无缓存，实时生成)
    └──────────────┘

┌──────────────────┐      ┌──────────────────┐
│  UserPreference  │      │   CacheConfig    │
│ (localStorage)   │      │ (后端配置)        │
└──────────────────┘      └──────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │   CacheEntry     │
                          │ (SQLite存储)     │
                          └──────────────────┘
```
