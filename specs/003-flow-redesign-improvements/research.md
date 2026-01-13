# Research: 应用流程重构与功能增强

**Branch**: `003-flow-redesign-improvements`
**Date**: 2026-01-13
**Status**: Complete

## 研究主题概览

本研究围绕以下技术决策展开：

1. SQLite持久化缓存库选型
2. 内存LRU缓存策略优化
3. AI图片生成提示词精准度提升
4. PDF样式改进方案
5. 已有决策确认（PDF生成、AI服务、城市支持等）

---

## 1. SQLite持久化缓存库选型

### 决策

**选择**: `modernc.org/sqlite` (纯Go实现, 无CGO依赖)

### 理由

| 考量维度 | modernc.org/sqlite | mattn/go-sqlite3 | ncruces/go-sqlite3 |
|---------|-------------------|------------------|-------------------|
| CGO依赖 | ❌ 不需要 | ✅ 需要 | ❌ 不需要 |
| 部署复杂度 | 简单 (单二进制) | 复杂 (需C库) | 简单 |
| 跨平台编译 | 优秀 | 困难 | 优秀 |
| INSERT性能 | ~5,288ms/1M rows | ~2,000ms/1M rows | ~3,800ms/1M rows |
| SELECT性能 | 相当 | 最快 | 接近 |
| 内存开销 | 低 | 低 | 高 (Wasm) |
| 维护状态 | 活跃 (2026年1月更新) | 活跃 | 活跃 |
| 社区采用 | 2,562+ 项目 | 23,349+ 项目 | 较少 |

**核心决策因素**:
- 本项目为读多写少的缓存场景，INSERT性能差异可接受
- 纯Go实现简化Docker构建和CI/CD流程
- 无外部C库依赖，单二进制部署

### 备选方案与否决原因

- **mattn/go-sqlite3**: 性能最佳，但CGO依赖增加构建复杂度，不符合项目简洁部署原则
- **ncruces/go-sqlite3**: Wasm实现内存开销较高，不适合存储Base64图片数据

### 实现建议

**Schema设计**:
```sql
CREATE TABLE cache_entries (
    key TEXT PRIMARY KEY,
    value BLOB NOT NULL,
    expires_at INTEGER NOT NULL,  -- Unix时间戳
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_expires_at ON cache_entries(expires_at);
```

**性能优化**:
```go
// 启用WAL模式提升并发读取性能
db.Exec("PRAGMA journal_mode=WAL")
db.Exec("PRAGMA synchronous=NORMAL")
```

**存储优化**:
- 图片数据以BLOB形式存储（解码后的二进制），而非Base64文本
- 节省33%磁盘空间
- <100KB的图片在SQLite中读取比文件系统快35%

**并发访问**:
```go
var cacheMutex sync.Mutex

func SetCache(key string, value []byte, ttl time.Duration) error {
    cacheMutex.Lock()
    defer cacheMutex.Unlock()

    expiresAt := time.Now().Add(ttl).Unix()
    _, err := db.Exec(
        "INSERT OR REPLACE INTO cache_entries (key, value, expires_at, created_at) VALUES (?, ?, ?, ?)",
        key, value, expiresAt, time.Now().Unix(),
    )
    return err
}

func GetCache(key string) ([]byte, error) {
    // 读取无需加锁
    var value []byte
    err := db.QueryRow(
        "SELECT value FROM cache_entries WHERE key = ? AND expires_at > ?",
        key, time.Now().Unix(),
    ).Scan(&value)
    return value, err
}
```

---

## 2. 内存LRU缓存策略

### 决策

**保持现有方案**: `jellydator/ttlcache/v3` (已在项目中使用)

### 理由

| 库 | TTL支持 | 性能 | 内存效率 | 成熟度 | 适配度 |
|---|---------|------|---------|-------|-------|
| **ttlcache/v3** (当前) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 良好 | ⭐⭐⭐⭐⭐ | **最佳** |
| Otter/v2 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 优秀 | ⭐⭐⭐ | 适合10x扩展 |
| Ristretto/v2 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 优秀 | ⭐⭐⭐⭐ | 适合100x扩展 |
| golang-lru/v2 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 优秀 | ⭐⭐⭐⭐⭐ | 可替代 |

**核心决策因素**:
- 现有实现已通过验证，迁移成本为零
- TTL功能原生支持，完全匹配需求
- 1.8k依赖项目，生产环境可靠性已验证
- 泛型支持，类型安全

### 现有实现评估

当前 `backend/internal/cache/cache.go` 实现：
- ✅ 按数据类型分离缓存，类型安全
- ✅ TTL配置合理（城市7天，菜谱/图片24小时）
- ✅ 使用`cache.Start()`启动后台清理
- ✅ 键命名规范（前缀模式）
- ⚠️ 可优化：8个清理goroutine可合并为1个（非必须）

### 性能指标

- **Get/Set延迟**: <1微秒（优秀）
- **每条目内存开销**: ~100字节（可接受）
- **预估缓存大小**: 20-25 MB（可接受）
- **CPU开销**: 清理goroutine <1%

### 扩展信号监控

当出现以下情况时考虑迁移到Otter/Ristretto：
- 缓存内存接近500MB
- CPU分析显示锁竞争
- 缓存命中率低于70%
- 清理goroutine CPU超过5%

---

## 3. AI图片生成提示词优化

### 问题分析

当前问题：生成"马鲛鱼"图片时可能生成其他鱼类，图片与菜品名称不匹配。

### 决策

**采用结构化提示词模板系统 + 负向提示词**

### 提示词工程最佳实践

#### 提示词结构模板

```text
{菜品名称(中英文)} + {食材类型(视觉特征)} + {烹饪方式} + {摆盘风格} + {摄影风格} + {灯光}
```

#### 示例：清蒸马鲛鱼

**正向提示词**:
```text
清蒸马鲛鱼 (Steamed Spanish Mackerel) - 整条新鲜马鲛鱼，具有独特的青蓝色背部和银白色腹部，
体型修长侧扁，约20-30cm长度。清蒸烹饪，姜丝葱段点缀，淋上少许麻油，置于白色圆形瓷盘中。
专业美食摄影，45度柔和侧光，表面可见油光和水汽，暖色自然光，浅景深，
干净简约背景，高分辨率，无模糊，无水印
```

**负向提示词**:
```text
salmon, cod, sea bass, tilapia, catfish, grilled, fried, breaded,
sliced fillet, distorted anatomy, artificial appearance, plastic-like,
watermark, text overlay, dark shadows, cluttered background
```

#### 关键技术要点

1. **食材视觉特征描述**
   - 鱼类：体型、颜色、鳍部特征、尺寸
   - 肉类：纹理、切割方式、熟度表现
   - 蔬菜：颜色鲜艳度、新鲜度特征

2. **摄影细节强化**（三大支柱）
   - **微观细节**: "油光泽感 (oil sheen)"、"蒸汽水珠 (steam droplets)"、"香料质感 (herb texture)"
   - **光线控制**: "45度柔和侧光 (soft 45-degree side lighting)"、"自然窗光 (natural window light)"
   - **场景暗示**: "白色瓷盘 (white ceramic plate)"、"蒸笼虚化背景 (bamboo steamer in soft focus)"

3. **负向提示词策略**
   - 排除常见替代食材（如其他鱼类）
   - 排除错误烹饪方式
   - 排除质量问题（变形、人工感）
   - 限制5-8个关键词，避免过载

### 实现建议

```go
type ImagePromptTemplate struct {
    DishNameCN      string   // 中文名称
    DishNameEN      string   // 英文名称
    IngredientDesc  string   // 食材视觉特征
    CookingMethod   string   // 烹饪方式
    PlatingStyle    string   // 摆盘风格
    NegativePrompts []string // 排除项
}

// 预定义的鱼类视觉特征
var fishVisualFeatures = map[string]string{
    "马鲛鱼": "whole mackerel with distinctive green-blue dorsal surface and silver belly, elongated body shape, approximately 20-30cm length",
    "鲈鱼":   "whole sea bass with silver-gray scales, large mouth, prominent dorsal fin",
    "黄花鱼": "whole yellow croaker with golden-yellow color, compressed body shape",
}

func BuildPrompt(t ImagePromptTemplate) (positive, negative string) {
    positive = fmt.Sprintf(
        "%s (%s), %s, %s preparation, %s, professional food photography, "+
        "soft 45-degree side lighting, oil sheen visible, warm natural tones, "+
        "shallow depth of field, clean background, high resolution, 4K quality",
        t.DishNameCN, t.DishNameEN, t.IngredientDesc, t.CookingMethod, t.PlatingStyle,
    )
    negative = strings.Join(t.NegativePrompts, ", ")
    return
}
```

### 多生成策略

对于关键图片，生成4-5个变体并选择最准确的：
- 监控哪些负向提示词对特定鱼类效果最好
- 建立每道菜的有效提示词数据库
- 测试不同服务（DALL-E 3 vs Stability AI）对比准确率

---

## 4. PDF样式改进方案

### 问题分析

- 当前使用圆圈包裹的步骤编号，样式过于装饰
- emoji图标无法在gopdf中直接渲染
- 需要简洁现代的设计风格

### 决策

**采用文本替代方案 + 纯数字编号**

### gopdf限制

- gopdf不支持回退到替代字体，emoji渲染受限
- NotoColorEmoji字体与gopdf不兼容（使用CBDT/CBLC位图表）

### 解决方案

#### 方案A: 文本标记替代emoji（推荐）

将emoji替换为简洁的文本标记：

| 原emoji | 替代文本 | 用途 |
|--------|---------|-----|
| 💡 | [TIP] | 小贴士 |
| 👨‍🍳 | [CHEF] 或 ▸ | 烹饪步骤标题 |
| 🥬 | [材料] 或 ● | 食材清单标题 |
| ⏱ | [TIME] | 烹饪时间 |

#### 方案B: 图片替代（备选）

- 将emoji转换为PNG图片资源
- 使用`pdf.Image()`嵌入
- ���加资源管理复杂度，不推荐

### 样式改进代码模式

```go
// 步骤编号：纯数字 + 点 (移除圆圈)
func printStep(pdf *gopdf.GoPdf, num int, text string, x, y float64) {
    pdf.SetXY(x, y)
    pdf.SetFont("noto-sc", "B", 11)
    pdf.Cell(nil, fmt.Sprintf("%d. ", num))  // 纯数字编号

    pdf.SetFont("noto-sc", "", 11)
    pdf.Cell(nil, text)
}

// 小贴士区块 - 浅色背景
func printTip(pdf *gopdf.GoPdf, text string, x, y float64) {
    // 淡绿色背景
    pdf.SetFillColor(245, 250, 240)
    pdf.Rectangle(x-5, y-3, x+400, y+15, "F")

    pdf.SetXY(x, y)
    pdf.SetFont("noto-sc", "B", 10)
    pdf.Cell(nil, "[TIP] ")

    pdf.SetFont("noto-sc", "", 10)
    pdf.Cell(nil, text)
}

// 区块标题
func printSectionTitle(pdf *gopdf.GoPdf, title string, icon string, x, y float64) {
    pdf.SetXY(x, y)
    pdf.SetFont("noto-sc", "B", 14)
    pdf.SetTextColor(51, 51, 51) // #333333
    pdf.Cell(nil, fmt.Sprintf("%s %s", icon, title))
    pdf.SetTextColor(0, 0, 0)
}
```

### 设计规范

| 元素 | 字号 | 颜色 | 说明 |
|-----|-----|-----|-----|
| 标题 | 24pt Bold | #000000 | 菜谱名称 |
| 区块标题 | 14pt Bold | #333333 | 材料、步骤等 |
| 正文 | 12pt Regular | #000000 | 步骤内容 |
| 次要文本 | 10pt Regular | #666666 | 小贴士、备注 |

**间距规范**:
- 页边距: 40pt
- 行高: 16pt
- 段落间距: 8pt
- 区块间距: 20pt

**颜色板**:
- 主色: #000000 (黑色)
- 次要: #333333, #666666 (灰色)
- 强调: #8B9A7D (绿色，用于分隔线)
- 背景: #F5FAF0 (浅绿色，小贴士背景)

### 中文字体支持

使用`NotoSansSC-Regular.ttf`，通过`AddUTF8Font()`加载：

```go
pdf.AddUTF8Font("noto-sc", "", "./fonts/NotoSansSC-Regular.ttf")
pdf.AddUTF8Font("noto-sc", "B", "./fonts/NotoSansSC-Bold.ttf")
```

---

## 5. 双层缓存架构设计

### 架构概览

```text
用户请求
    ↓
[查询内存LRU缓存 - 1小时TTL]
    ├─ 命中: 直接返回 (最快)
    └─ 未命中
        ↓
    [查询SQLite缓存 - 7天TTL]
        ├─ 命中: 加载到内存缓存 → 返回
        └─ 未命中
            ↓
        [调用AI服务]
            ↓
        [同时写入两层缓存]
            ↓
        [返回结果]

+ 后台定时任务: 清理SQLite过期数据
```

### 缓存键设计

```text
格式: {类型}:{标识符}

示例:
- city:汕尾:summer           # 城市+季节的食材列表
- ingredient:detail:马鲛鱼   # 食材详情
- recipe:list:马鲛鱼,番茄    # 菜谱列表（按食材组合）
- recipe:detail:{id}        # 菜谱详情
- image:{recipe_id}         # 菜谱图片（BLOB）
```

### 配置参数

```go
type CacheConfig struct {
    // 内存LRU缓存
    MemoryTTL      time.Duration // 默认: 1小时
    MemoryMaxItems int           // 默认: 1000

    // SQLite缓存
    SQLiteTTL           time.Duration // 默认: 7天
    SQLiteCleanInterval time.Duration // 默认: 1小时
    SQLitePath          string        // 默认: ./data/cache.db
}

// 默认配置
var DefaultCacheConfig = CacheConfig{
    MemoryTTL:           1 * time.Hour,
    MemoryMaxItems:      1000,
    SQLiteTTL:           7 * 24 * time.Hour,
    SQLiteCleanInterval: 1 * time.Hour,
    SQLitePath:          "./data/cache.db",
}
```

---

## 6. 已有决策确认

以下是之前研究中已确认的决策，保持不变：

### PDF 生成方案
- **决策**: 使用后端 Go 服务的 gopdf 库生成 PDF
- **理由**: 项目已引入依赖，中文支持好，无需前端大型库

### AI 服务调用策略
- **决策**: 使用现有的 helloagents-go SDK，结构化 prompt 确保中文输出
- **Provider优先级**: OpenAI → DeepSeek → DashScope → Ollama

### 任意城市支持
- **决策**: 移除城市白名单限制，AI 智能处理未知城市
- **边缘情况**: 完全无法识别的输入返回通用季节性建议

### 前端状态管理
- **决策**: React useState + localStorage，不引入额外状态管理库
- **理由**: 应用状态简单，符合避免过度设计原则

### 模态框实现
- **决策**: 使用原生 HTML `<dialog>` 元素 + Tailwind 样式
- **理由**: 现代浏览器原生支持，无障碍访问性好

---

## 7. 图片下载与存储策略

### 决策

**获取URL后立即下载图片，以BLOB形式存入双层缓存**

### 理由

- AI生成的图片URL可能有过期时间限制
- 本地存储BLOB确保图片永久可用
- 与其他缓存数据使用相同的双层架构，简化管理

### 实现流程

```text
[调用AI生成图片]
    ↓
[获取图片URL]
    ↓
[HTTP下载图片数据]
    ↓
[转换为BLOB ([]byte)]
    ↓
[同时写入内存缓存和SQLite缓存]
    ↓
[返回Base64给前端展示]
```

### 代码模式

```go
func (s *ImageService) GenerateAndCacheImage(recipeID, recipeName string) (string, error) {
    // 1. 调用AI生成图片URL
    imageURL, err := s.aiProvider.GenerateImage(recipeName)
    if err != nil {
        return "", err
    }

    // 2. 下载图片
    resp, err := http.Get(imageURL)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    imageData, err := io.ReadAll(resp.Body)
    if err != nil {
        return "", err
    }

    // 3. 存入双层缓存
    cacheKey := fmt.Sprintf("image:%s", recipeID)
    s.memoryCache.Set(cacheKey, imageData, 1*time.Hour)
    s.sqliteCache.Set(cacheKey, imageData, 7*24*time.Hour)

    // 4. 返回Base64
    return base64.StdEncoding.EncodeToString(imageData), nil
}
```

---

## 研究结论

| 主题 | 决策 | 置信度 |
|-----|-----|-------|
| SQLite库 | modernc.org/sqlite | 高 |
| LRU缓存 | 保持ttlcache/v3 | 高 |
| 图片提示词 | 结构化模板 + 负向提示词 | 中高 |
| PDF样式 | 文本标记替代emoji + 纯数字编号 | 高 |
| 图片存储 | URL下载后BLOB存储 | 高 |

**所有NEEDS CLARIFICATION项已解决** ✅
