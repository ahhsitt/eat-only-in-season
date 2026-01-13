# 不时不食 - 应季食谱推荐 AI Agent

基于 AI 的应季食谱推荐系统，根据用户所在地区和当前季节，推荐合适的中国传统菜谱。

## 功能特性

- **地区选择**: 支持华北、华东、华南、西南、西北、东北 6 个地区
- **应季推荐**: 根据地区和季节智能推荐 3-5 道应季菜谱
- **详细食谱**: 包含完整的食材清单和制作步骤
- **AI 生成图片**: 使用 AI 生成菜品成品图
- **个人偏好**: 支持素食、辣度、过敏原等偏好设置

## 技术栈

### 后端
- Go 1.21+
- Gin Web 框架
- [helloagents-go](https://github.com/ahhsitt/helloagents-go) AI Agent 框架
- go-cache 内存缓存

### 前端
- React 18 + TypeScript
- Vite 构建工具
- TailwindCSS 样式
- React Router 路由
- Axios HTTP 客户端

## 快速开始

### 前置条件

- Go 1.21+
- Node.js 20+
- OpenAI API Key (或 DeepSeek/Ollama)

### 后端启动

```bash
cd backend

# 设置环境变量
export OPENAI_API_KEY=your-api-key
# 可选：使用自定义 Base URL
# export OPENAI_BASE_URL=https://api.openai.com/v1
# export OPENAI_MODEL=gpt-4o-mini

# 或使用 DeepSeek
# export DEEPSEEK_API_KEY=your-deepseek-key

# 或使用 Ollama (默认 localhost:11434)
# export OLLAMA_HOST=http://localhost:11434

# 安装依赖
go mod tidy

# 启动服务 (默认端口 8080)
go run cmd/server/main.go

# 或指定端口
# SERVER_PORT=3000 go run cmd/server/main.go
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (默认端口 5173)
npm run dev

# 构建生产版本
npm run build
```

### 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:8080/api/v1

## API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/v1/health | 健康检查 |
| GET | /api/v1/regions | 获取地区列表 |
| GET | /api/v1/season | 获取当前季节 |
| GET | /api/v1/recipes | 获取菜谱推荐 |
| GET | /api/v1/recipes/:id | 获取菜谱详情 |
| GET | /api/v1/recipes/:id/image | 获取菜品图片状态 |
| POST | /api/v1/recipes/:id/image | 触发生成菜品图片 |

## 项目结构

```
.
├── backend/
│   ├── cmd/server/          # 服务入口
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handler/     # HTTP 处理器
│   │   │   └── middleware/  # 中间件
│   │   ├── agent/           # AI Agent 实现
│   │   ├── cache/           # 缓存模块
│   │   └── model/           # 数据模型
│   └── pkg/
│       └── season/          # 季节计算
├── frontend/
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 服务
│   │   ├── hooks/           # 自定义 Hooks
│   │   └── types/           # TypeScript 类型
│   └── ...
└── specs/                   # 规范文档
```

## 开发说明

### 添加新的 LLM 提供商

编辑 `backend/internal/agent/providers.go`，参考 helloagents-go 文档添加新的 Provider。

### 自定义地区

编辑 `backend/internal/model/region.go` 中的 `Regions` 变量。

### 调整缓存时间

编辑 `backend/internal/cache/memory.go` 中的 TTL 常量。

## License

MIT
