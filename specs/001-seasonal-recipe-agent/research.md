# Research: 应季食谱推荐 AI Agent

**Date**: 2026-01-08 (Updated)
**Feature**: 001-seasonal-recipe-agent
**Status**: Complete

## 1. AI Agent 框架选型

### Decision: helloagents-go

**Rationale**:
- 用户明确指定使用此框架
- 框架提供多种 Agent 模式（SimpleAgent, ReActAgent 等）
- 内置工具系统，支持自定义工具扩展
- 支持多 LLM 提供商（OpenAI, DeepSeek, Qwen, Ollama）
- 轻量级设计，符合 MVP 原则

**Alternatives Considered**:
- LangChain Go: 也可作为备选，文档完善度提升中
- 自研 Agent: 开发成本高，违反"避免过度设计"原则

### helloagents-go 使用要点

1. **Agent 选择**: 使用 `SimpleAgent` 模式即可满足菜谱生成需求
2. **Provider 配置**: 通过环境变量配置 API Key 和 Endpoint
3. **调用模式**:
   ```go
   agent.Run(context.Background(), agents.Input{Query: "..."})
   ```

---

## 2. 城市识别与地理数据

### Decision: geo-golang + OpenStreetMap (Nominatim)

**Rationale**:
- geo-golang 提供统一的接口抽象，支持 10+ 地理编码服务提供商
- 只需修改 1 行代码即可切换服务提供商
- OpenStreetMap/Nominatim 免费且对中英文城市名称支持良好
- MIT 开源协议，持续更新维护

**使用示例**:
```go
import "github.com/codingsince1985/geo-golang/openstreetmap"

geocoder := openstreetmap.Geocoder()
location, _ := geocoder.Geocode("东京")
// location.Lat = 35.6762, location.Lng = 139.6503
```

**Alternatives Considered**:
- Google Maps API - 需要付费，有配额限制
- 自建城市数据库 - 维护成本高，数据难以全面覆盖

---

## 3. 季节判断逻辑

### Decision: 基于经纬度 + 天文季节划分

**Rationale**:
- 支持全球城市，必须考虑南北半球差异
- 天文季节划分比气象划分更精确
- 简单算法即可满足需求

**核心算法**:
1. **纬度 > 0** = 北半球，**纬度 < 0** = 南半球
2. 基于天文季节划分：
   - 春分 (3月20日) → 夏至 (6月21日) → 秋分 (9月22日) → 冬至 (12月21日)
3. 南半球季节与北半球相反

**日期范围（北半球）**:
| 季节 | 起始日期 | 结束日期 |
|------|----------|----------|
| 春季 | 3月20日 | 6月20日 |
| 夏季 | 6月21日 | 9月21日 |
| 秋季 | 9月22日 | 12月20日 |
| 冬季 | 12月21日 | 3月19日 |

**Alternatives Considered**:
- 气象季节划分（按月份整月划分）- 更简单但不够精确
- 引入天文计算库 - 增加不必要的依赖

---

## 4. LLM 多模型支持

### Decision: helloagents-go Provider 抽象层 + 配置切换

**Rationale**:
- helloagents-go 原生支持多 Provider
- 通过环境变量配置，无需修改代码
- 符合"支持多模型切换"的需求

**支持的 Provider**:
| 优先级 | Provider | 环境变量 | 默认模型 |
|--------|----------|----------|----------|
| 1 | OpenAI | OPENAI_API_KEY | gpt-4o-mini |
| 2 | DeepSeek | DEEPSEEK_API_KEY | deepseek-chat |
| 3 | Qwen | DASHSCOPE_API_KEY | qwen-plus |
| 4 | Ollama | OLLAMA_HOST | llama3 |

**降级策略**:
- 按优先级顺序检测可用服务
- 当前服务调用失败时，自动降级到下一优先级服务商

---

## 5. 图像生成服务

### Decision: 统一使用 helloagents-go 框架的 NewImageProvider

**Rationale**:
- helloagents-go 框架已内置 `NewImageProvider` 支持多个图像生成服务
- 与 LLM Provider 使用同一框架，保持技术栈一致性
- 无需自建抽象，减少开发工作量
- 框架已处理错误重试、超时等通用逻辑

**使用示例**:
```go
import "github.com/ahhsitt/helloagents-go/pkg/image"

// 创建图像生成提供商
provider := image.NewImageProvider(image.Config{
    Provider: "openai",  // 或 "dashscope", "stability"
    APIKey:   os.Getenv("OPENAI_API_KEY"),
    Model:    "dall-e-3",
})

// 生成图片
response, err := provider.Generate(ctx, image.Request{
    Prompt:  "一道精美的红烧狮子头，色泽红亮，摆盘精致",
    Size:    "1024x1024",
    Quality: "hd",
    Style:   "vivid",
})

// 获取结果
imageURL := response.Images[0].URL
imageBase64 := response.Images[0].Base64
```

**支持的提供商**:
| 优先级 | Provider | 环境变量 | 默认模型 |
|--------|----------|----------|----------|
| 1 | OpenAI (DALL-E) | OPENAI_API_KEY | dall-e-3 |
| 2 | 通义万象 | DASHSCOPE_API_KEY | wanx-v1 |
| 3 | Stability AI | STABILITY_API_KEY | stable-diffusion-xl |

**配置选项**:
| 参数 | 说明 | 推荐值 |
|------|------|--------|
| Model | 模型选择 | dall-e-3 |
| Size | 图片尺寸 | 1024x1024 |
| Quality | 图片质量 | hd（高清） |
| Style | 风格 | vivid（生动） |

**降级策略**:
- 与 LLM 相同，按优先级顺序检测可用服务
- 当前服务调用失败时，自动降级到下一优先级服务商

---

## 6. PDF 生成

### Decision: 后端使用 signintech/gopdf

**Rationale**:
- **积极维护**: 仍在活跃开发中（gofpdf 已于 2021 年归档）
- **中文支持**: 原生支持 Unicode subfont embedding，可嵌入 NotoSansSC 字体
- **图片支持**: 完整支持 Base64 图片嵌入
- **开源免费**: MIT 协议

**为什么后端生成**:
- 后端可预装中文字体，前端需下载大型字体文件（3-10MB）
- Base64 图片在后端处理更高效
- 一致性：确保所有用户获得相同输出

**Alternatives Considered**:
- gofpdf - 功能强大但已停止维护
- unipdf - 需要商业许可证
- 前端 jsPDF - 中文支持差

---

## 7. 缓存策略

### Decision: jellydator/ttlcache（24小时过期）

**Rationale**:
- Go 泛型支持，类型安全
- 自动过期清理（`cache.Start()`）
- 灵活的 TTL 配置

**使用示例**:
```go
cache := ttlcache.New[string, []byte](
    ttlcache.WithTTL[string, []byte](24 * time.Hour),
)
cache.Start() // 启动自动清理

cache.Set("key", data, ttlcache.DefaultTTL)
item := cache.Get("key")
```

**缓存键设计**:
- 推荐列表: `recipes:{city}:{season}:{preferences_hash}`
- 菜谱详情: `detail:{recipe_id}`
- 图片 Base64: `image:{recipe_id}`

**Alternatives Considered**:
- patrickmn/go-cache - 经典但不支持泛型
- Redis - 对单机应用过重

---

## 8. 前后端通信

### Decision: REST API + JSON

**Rationale**:
- 简单直接，无需额外依赖
- 适合 MVP 规模
- 前端 Axios 天然支持

**CORS 配置**:
- 开发环境: 允许 localhost:5173
- 生产环境: 配置具体域名

---

## 9. 错误处理策略

### Decision: 分层错误处理 + 自动降级

**Rationale**:
- AI 服务不稳定，需要容错
- 用户体验优先，错误信息友好

**策略**:
1. LLM 调用失败 → 自动降级到下一服务商 → 所有服务都失败后返回友好错误
2. 图片生成失败 → 返回占位图 → 后台异步重试 → 成功后自动更新
3. 网络超时 → 前端显示加载状态 → 支持手动重试

---

## 10. 依赖清单

### 后端 (Go)
```
github.com/gin-gonic/gin              # HTTP 框架
github.com/ahhsitt/helloagents-go     # AI Agent 框架 (LLM + 图像生成)
github.com/codingsince1985/geo-golang # 地理编码
github.com/signintech/gopdf           # PDF 生成
github.com/jellydator/ttlcache/v3     # TTL 缓存
```

### 前端 (React)
```
react                  # UI 框架
react-router-dom       # 路由
tailwindcss            # CSS 框架
axios                  # HTTP 客户端
```

---

## 11. 未解决问题

无。所有技术选型已确定。
