# 不时不食 - 应季食谱推荐 AI Agent

基于 AI 的应季食谱推荐系统，根据用户所在城市和当前季节，智能推荐合适的应季菜谱。

## 功能特性

- **全球城市支持**: 支持中文、英文、拼音输入城市名，自动识别地理位置和季节
- **应季食材推荐**: 根据地区和季节智能推荐当季食材（排除全年食材）
- **AI智能食谱**: 基于应季食材生成个性化食谱推荐
- **详细烹饪指导**: 包含完整的食材清单、用量和分步骤制作说明
- **AI生成图片**: 使用AI生成精美菜品成品图
- **PDF导出**: 支持将食谱导出为PDF文件，方便保存分享
- **多LLM支持**: 支持OpenAI、DeepSeek、通义千问、Ollama等多种AI服务
- **个人偏好**: 支持素食、辣度、过敏原等偏好设置

## 目录

- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [AI服务配置](#ai服务配置)
- [缓存系统](#缓存系统)
- [API端点](#api端点)
- [项目结构](#项目结构)
- [开发说明](#开发说明)
- [License](#license)

## 技术栈

### 后端
- Go 1.24
- Gin Web框架 1.11
- [helloagents-go](https://github.com/ahhsitt/helloagents-go) AI Agent框架
- TTL Cache + SQLite 双层缓存
- gopdf PDF生成
- geo-golang 地理位置服务

### 前端
- React 19 + TypeScript 5.9
- Vite 7 构建工具
- Ant Design 6 UI组件库
- React Router 7 路由
- Axios HTTP客户端
- jsPDF + html2canvas PDF导出

## 快速开始

### 前置条件

- Go 1.24+
- Node.js 20+
- 至少一个LLM API Key（OpenAI/DeepSeek/DashScope）或本地Ollama

### 后端启动

```bash
cd backend

# 复制并配置环境变量
cp .env.example .env
# 编辑.env文件，配置API Key

# 安装依赖
go mod tidy

# 启动服务 (默认端口8080)
go run cmd/server/main.go
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (默认端口5173)
npm run dev

# 构建生产版本
npm run build
```

### 访问应用

- 前端: http://localhost:5173
- 后端API: http://localhost:8080/api/v1

## AI服务配置

系统支持多种AI服务提供商，按优先级自动选择可用服务。

### LLM提供商（按优先级）

| 优先级 | 提供商 | 环境变量 | 说明 |
|--------|--------|----------|------|
| 1 | OpenAI | `OPENAI_API_KEY` | 支持自定义端点 `OPENAI_BASE_URL` |
| 2 | DeepSeek | `DEEPSEEK_API_KEY` | 国内友好 |
| 3 | 阿里云DashScope | `DASHSCOPE_API_KEY` | 通义千问 |
| 4 | Ollama | `OLLAMA_HOST` | 本地部署，默认 localhost:11434 |

### 图像生成提供商（按优先级）

| 优先级 | 提供商 | 环境变量 | 说明 |
|--------|--------|----------|------|
| 1 | Stability AI | `STABILITY_API_KEY` | 推荐 |
| 2 | OpenAI DALL-E | `OPENAI_API_KEY` | 复用LLM密钥 |
| 3 | DashScope Wanx | `DASHSCOPE_API_KEY` | 复用LLM密钥 |

### 本地开发（使用Ollama）

```bash
# 安装Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# 启动Ollama服务
ollama serve

# 拉取模型
ollama pull qwen2.5:7b

# 配置环境变量
export OLLAMA_HOST=http://localhost:11434
```

## 缓存系统

系统采用两层缓存架构，提高响应速度并减少API调用成本。

### 架构

- **L1 内存缓存**: TTL-based，快速访问，默认1小时过期
- **L2 SQLite缓存**: 持久化存储，服务重启后数据保留，默认7天过期

### 配置项

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `CACHE_MEMORY_TTL` | 3600 | 内存缓存TTL（秒） |
| `CACHE_MEMORY_MAX_ITEMS` | 100 | 内存缓存最大条目数 |
| `CACHE_SQLITE_TTL` | 604800 | SQLite缓存TTL（秒，7天） |
| `CACHE_SQLITE_CLEAN_INTERVAL` | 3600 | SQLite清理间隔（秒） |
| `CACHE_SQLITE_PATH` | ./data/cache.db | SQLite缓存文件路径 |

## API端点

所有API路径前缀: `/api/v1`

### 城市服务

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /city/search | 搜索城市 |
| GET | /city/suggestions | 城市建议列表 |

### 应季食材服务

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /ingredients | 获取应季食材列表 |
| GET | /ingredients/:id/detail | 获取食材详情 |

### 食谱服务

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /recipes/by-ingredients | 根据食材推荐食谱 |
| GET | /recipes/:recipeId/detail | 获取食谱详情 |

### 图像服务

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /recipes/:recipeId/image | 获取图片状态 |
| POST | /recipes/:recipeId/image | 触发图片生成 |
| GET | /recipes/:recipeId/image-url | 获取图片URL |
| GET | /recipes/:recipeId/image-proxy | 图片代理（PDF用） |

### PDF服务

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /recipes/:recipeId/pdf | 导出食谱为PDF |

### 系统服务

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /system/health | 健康检查 |
| GET | /system/status | 系统状态 |
| GET | /system/cache-stats | 缓存统计 |

## 项目结构

```
.
├── backend/
│   ├── cmd/server/              # 服务入口
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handlers/        # HTTP处理器
│   │   │   └── middleware/      # 中间件
│   │   ├── cache/               # 双层缓存（内存+SQLite）
│   │   ├── models/              # 数据模型
│   │   └── services/
│   │       ├── ai/              # AI Provider管理
│   │       │   └── imagegen/    # 图像生成服务
│   │       ├── ingredient/      # 应季食材服务
│   │       ├── pdf/             # PDF导出服务
│   │       └── recipe/          # 食谱服务
│   ├── pkg/
│   │   └── config/              # 配置管理
│   ├── data/                    # SQLite缓存数据
│   └── tests/                   # 测试文件
├── frontend/
│   ├── src/
│   │   ├── components/          # React组件
│   │   ├── pages/               # 页面组件
│   │   ├── services/            # API服务
│   │   ├── hooks/               # 自定义Hooks
│   │   ├── types/               # TypeScript类型
│   │   ├── theme/               # 设计tokens
│   │   ├── styles/              # 全局样式
│   │   ├── utils/               # 工具函数
│   │   └── assets/              # 静态资源
│   └── ...
└── specs/                       # 功能规范文档
```

## 开发说明

### 添加新的LLM提供商

编辑 `backend/internal/services/ai/provider.go`，参考现有实现添加新的Provider。

### 添加新的图像生成服务

编辑 `backend/internal/services/ai/imagegen/service.go`，实现ImageGenerator接口。

### 调整缓存配置

修改 `.env` 文件中的 `CACHE_*` 环境变量，或编辑 `backend/internal/cache/` 中的默认配置。
