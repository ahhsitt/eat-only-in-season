# Quickstart: 应用流程重构与功能增强

**Feature**: 003-flow-redesign-improvements
**Date**: 2026-01-13
**Updated**: 2026-01-13

## 概述

本文档提供快速启动开发所需的关键信息和代码片段。

---

## 1. 环境准备

### 依赖安装

**Backend (Go)**:
```bash
cd backend

# 安装新增依赖 - SQLite（纯Go实现，无CGO）
go get modernc.org/sqlite

# 验证现有依赖
go mod tidy
```

**Frontend**:
```bash
cd frontend
npm install
```

### 环境变量

复制 `.env.example` 并配置：

```bash
cp backend/.env.example backend/.env
```

必要配置项：
```env
# AI服务（至少配置一个）
OPENAI_API_KEY=sk-xxx
DEEPSEEK_API_KEY=xxx
DASHSCOPE_API_KEY=xxx

# 图片生成（至少配置一个）
STABILITY_API_KEY=xxx
OPENAI_API_KEY=sk-xxx  # ���时支持DALL-E

# 缓存配置（可选，有默认值）
CACHE_MEMORY_TTL=3600           # 内存缓存TTL（秒）
CACHE_MEMORY_MAX_ITEMS=1000     # 内存缓存最大条目
CACHE_SQLITE_TTL=604800         # SQLite缓存TTL（秒，默认7天）
CACHE_SQLITE_CLEAN_INTERVAL=3600 # SQLite清理间隔（秒）
CACHE_SQLITE_PATH=./data/cache.db
```

### 启动服务

**后端**:
```bash
cd backend
go run cmd/server/main.go
# 运行在 http://localhost:8080
```

**前端**:
```bash
cd frontend
npm run dev
# 运行在 http://localhost:5173
```

---

## 2. 核心代码片段

### 双层缓存实现

**SQLite缓存层** (`backend/internal/cache/sqlite.go`):

```go
package cache

import (
    "database/sql"
    "sync"
    "time"

    _ "modernc.org/sqlite"
)

type SQLiteCache struct {
    db    *sql.DB
    mutex sync.Mutex
}

func NewSQLiteCache(dbPath string) (*SQLiteCache, error) {
    db, err := sql.Open("sqlite", dbPath)
    if err != nil {
        return nil, err
    }

    // 启用WAL模式
    db.Exec("PRAGMA journal_mode=WAL")
    db.Exec("PRAGMA synchronous=NORMAL")

    // 创建表
    _, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS cache_entries (
            key TEXT PRIMARY KEY,
            value BLOB NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_expires_at ON cache_entries(expires_at);
    `)
    if err != nil {
        return nil, err
    }

    return &SQLiteCache{db: db}, nil
}

func (c *SQLiteCache) Get(key string) ([]byte, bool) {
    var value []byte
    err := c.db.QueryRow(
        "SELECT value FROM cache_entries WHERE key = ? AND expires_at > ?",
        key, time.Now().Unix(),
    ).Scan(&value)
    if err != nil {
        return nil, false
    }
    return value, true
}

func (c *SQLiteCache) Set(key string, value []byte, ttl time.Duration) error {
    c.mutex.Lock()
    defer c.mutex.Unlock()

    expiresAt := time.Now().Add(ttl).Unix()
    _, err := c.db.Exec(
        "INSERT OR REPLACE INTO cache_entries (key, value, expires_at, created_at) VALUES (?, ?, ?, ?)",
        key, value, expiresAt, time.Now().Unix(),
    )
    return err
}

func (c *SQLiteCache) Cleanup() error {
    c.mutex.Lock()
    defer c.mutex.Unlock()

    _, err := c.db.Exec("DELETE FROM cache_entries WHERE expires_at < ?", time.Now().Unix())
    return err
}
```

**缓存管理器** (`backend/internal/cache/manager.go`):

```go
package cache

import (
    "encoding/json"
    "time"

    "github.com/jellydator/ttlcache/v3"
)

type CacheManager struct {
    memory *ttlcache.Cache[string, []byte]
    sqlite *SQLiteCache
    config CacheConfig
}

func NewCacheManager(config CacheConfig) (*CacheManager, error) {
    // 初始化内存缓存
    memory := ttlcache.New(
        ttlcache.WithTTL[string, []byte](config.MemoryTTL),
    )
    go memory.Start()

    // 初始化SQLite缓存
    sqlite, err := NewSQLiteCache(config.SQLitePath)
    if err != nil {
        return nil, err
    }

    cm := &CacheManager{
        memory: memory,
        sqlite: sqlite,
        config: config,
    }

    // 启动定时清理
    go cm.startCleanup()

    return cm, nil
}

// Get 三级查询：内存 → SQLite → 返回未命中
func (cm *CacheManager) Get(key string, target interface{}) bool {
    // 1. 查内存缓存
    if item := cm.memory.Get(key); item != nil {
        json.Unmarshal(item.Value(), target)
        return true
    }

    // 2. 查SQLite缓存
    if data, ok := cm.sqlite.Get(key); ok {
        json.Unmarshal(data, target)
        // 加载到内存缓存
        cm.memory.Set(key, data, cm.config.MemoryTTL)
        return true
    }

    return false
}

// Set 同时写入两层缓存
func (cm *CacheManager) Set(key string, value interface{}) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }

    cm.memory.Set(key, data, cm.config.MemoryTTL)
    return cm.sqlite.Set(key, data, cm.config.SQLiteTTL)
}

func (cm *CacheManager) startCleanup() {
    ticker := time.NewTicker(cm.config.SQLiteCleanInterval)
    for range ticker.C {
        cm.sqlite.Cleanup()
    }
}
```

### 图片提示词生成

**提示词构建** (`backend/internal/services/ai/imagegen/prompt.go`):

```go
package imagegen

import (
    "fmt"
    "strings"
)

// FishVisualFeatures 鱼类视觉特征映射
var FishVisualFeatures = map[string]string{
    "马鲛鱼": "whole mackerel with distinctive green-blue dorsal surface and silver belly, elongated body shape",
    "鲈鱼":   "whole sea bass with silver-gray scales, large mouth, prominent dorsal fin",
    "黄花鱼": "whole yellow croaker with golden-yellow color, compressed body shape",
}

// DefaultNegativePrompts 默认负向提示词
var DefaultNegativePrompts = []string{
    "distorted anatomy", "artificial appearance", "plastic-like",
    "watermark", "text overlay", "dark shadows", "cluttered background",
}

// BuildDishPrompt 构建菜品图片提示词
func BuildDishPrompt(dishName string) (positive, negative string) {
    // 查找视觉特征
    var visualDesc string
    for ingredient, desc := range FishVisualFeatures {
        if strings.Contains(dishName, ingredient) {
            visualDesc = desc
            break
        }
    }

    // 默认描述
    if visualDesc == "" {
        visualDesc = "beautifully prepared dish"
    }

    positive = fmt.Sprintf(
        "%s, %s, professional food photography, "+
        "soft 45-degree side lighting, oil sheen visible, "+
        "warm natural tones, shallow depth of field, "+
        "clean white background, high resolution, 4K quality",
        dishName, visualDesc,
    )

    negative = strings.Join(DefaultNegativePrompts, ", ")
    return
}
```

### PDF样式改进

**步骤编号（纯数字）** (`backend/internal/services/pdf/generator.go`):

```go
// printStep 打印步骤（纯数字编号，移除圆圈）
func printStep(pdf *gopdf.GoPdf, num int, text string, x, y float64) {
    pdf.SetXY(x, y)
    pdf.SetFont("noto-sc", "B", 11)
    pdf.Cell(nil, fmt.Sprintf("%d. ", num))  // 纯数字 + 点

    pdf.SetFont("noto-sc", "", 11)
    // 计算文本起始位置（数字后）
    numWidth, _ := pdf.MeasureTextWidth(fmt.Sprintf("%d. ", num))
    pdf.SetXY(x+numWidth, y)
    pdf.Cell(nil, text)
}

// printTip 打印小贴士（文本标记代替emoji）
func printTip(pdf *gopdf.GoPdf, text string, x, y float64) {
    // 淡绿色背景
    pdf.SetFillColor(245, 250, 240)
    pdf.Rectangle(x-5, y-3, x+400, y+15, "F")

    pdf.SetXY(x, y)
    pdf.SetFont("noto-sc", "B", 10)
    pdf.Cell(nil, "[TIP] ")  // 文本标记代替💡

    pdf.SetFont("noto-sc", "", 10)
    pdf.Cell(nil, text)
}

// printSectionTitle 打印区块标题
func printSectionTitle(pdf *gopdf.GoPdf, title string, marker string, x, y float64) {
    pdf.SetXY(x, y)
    pdf.SetFont("noto-sc", "B", 14)
    pdf.SetTextColor(51, 51, 51) // #333333
    pdf.Cell(nil, fmt.Sprintf("%s %s", marker, title))
    pdf.SetTextColor(0, 0, 0)
}
```

---

## 3. API调用示例

### 获取应季食材

```typescript
// frontend/src/services/api.ts
export async function getSeasonalIngredients(city: string) {
  const response = await api.post<GetIngredientsResponse>('/ingredients', {
    city,
  });
  return response.data;
}

// 使用示例
const { location, ingredients } = await getSeasonalIngredients('汕尾');
console.log(`${location.matchedName} ${location.season}季应季食材:`);
ingredients.forEach(group => {
  console.log(`【${group.category}】`);
  group.items.forEach(item => console.log(`  - ${item.name}: ${item.briefIntro}`));
});
```

### 根据食材获取菜谱

```typescript
export async function getRecipesByIngredients(
  ingredients: string[],
  preference?: string,
  city?: string
) {
  const response = await api.post<GetRecipesResponse>('/recipes/by-ingredients', {
    ingredients,
    preference,
    city,
  });
  return response.data;
}

// 使用示例
const { recipes } = await getRecipesByIngredients(
  ['马鲛鱼', '番茄'],
  '不吃辣',
  '汕尾'
);
// recipes 按matchCount降序排列，最多5道
```

### 导出PDF

```typescript
export async function exportRecipePdf(
  recipeId: string,
  recipeDetail: RecipeDetail,
  imageBase64?: string
) {
  const response = await api.post(
    `/recipes/${recipeId}/pdf`,
    { recipeDetail, imageBase64 },
    { responseType: 'blob' }
  );

  // 触发下载
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${recipeDetail.title}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}
```

---

## 4. 移除旧流程检查清单

移除以下文件和代码：

**前端**:
- [ ] `frontend/src/pages/Home/` - 旧流程首页目录
- [ ] `frontend/src/pages/RecipeDetail/` - 旧流程详情页目录
- [ ] `App.tsx` 中的 `/old` 路由配置
- [ ] `api.ts` 中仅旧流程使用的API函数

**后端**:
- [ ] `backend/internal/api/handlers/recipe.go` 中的旧流程handler
- [ ] `backend/internal/api/router.go` 中的旧流程路由

---

## 5. 测试验证

### 缓存测试

```bash
# 1. 首次请求（调用AI）
curl -X POST http://localhost:8080/api/v1/ingredients \
  -H "Content-Type: application/json" \
  -d '{"city": "汕尾"}'

# 2. 立即重复请求（应命中内存缓存，响应极快）
time curl -X POST http://localhost:8080/api/v1/ingredients \
  -H "Content-Type: application/json" \
  -d '{"city": "汕尾"}'

# 3. 重启服务后请求（应命中SQLite缓存）
# 重启backend服务
time curl -X POST http://localhost:8080/api/v1/ingredients \
  -H "Content-Type: application/json" \
  -d '{"city": "汕尾"}'
```

### 图片生成测试

```bash
curl -X GET "http://localhost:8080/api/v1/recipes/test-id/image-url?title=清蒸马鲛鱼"
```

### PDF导出测试

```bash
curl -X POST http://localhost:8080/api/v1/recipes/test-id/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "recipeDetail": {
      "id": "test-id",
      "title": "番茄炒蛋",
      "description": "经典家常菜",
      "ingredients": [{"name": "番茄", "amount": "2个"}],
      "steps": [{"stepNumber": 1, "instruction": "切番茄"}],
      "cookingTime": "15分钟",
      "servings": "2人份",
      "difficulty": "简单"
    }
  }' \
  --output test.pdf
```

---

## 6. 关键配置

### 超时配置

| 操作 | 超时时间 |
|------|---------|
| 食材查询 | 90秒 |
| 菜谱推荐 | 60秒 |
| 菜谱详情 | 60秒 |
| 图片生成 | 120秒 |
| PDF导出 | 30秒 |

### 缓存TTL

| 数据类型 | 内存TTL | SQLite TTL |
|---------|---------|-----------|
| 食材列表 | 1小时 | 7天 |
| 食材详情 | 1小时 | 7天 |
| 菜谱列表 | 1小时 | 7天 |
| 菜谱详情 | 1小时 | 7天 |
| 图片数据 | 1小时 | 7天 |

---

## 7. 常见问题

### Q: AI服务不可用怎么办？

A: 系统采用完全阻断策略，显示错误页面提示用户稍后重试。检查：
1. API Key是否正确配置
2. 网络是否可达
3. 服务商是否有故障

### Q: 图片与菜品不匹配？

A: 检查 `FishVisualFeatures` 映射是否包含该食材，必要时添加新的视觉特征描述。

### Q: PDF中文乱码？

A: 确保 `NotoSansSC-Regular.ttf` 字体文件存在于正确路径，检查 `pdf.AddUTF8Font()` 调用。

### Q: 缓存未生效？

A: 检查：
1. 缓存键是否一致（区分大小写）
2. SQLite文件路径是否可写
3. 内存缓存是否正确启动（`cache.Start()`）

---

## 8. 相关文档

- [规格说明](./spec.md)
- [数据模型](./data-model.md)
- [API契约](./contracts/openapi.yaml)
- [技术研究](./research.md)
