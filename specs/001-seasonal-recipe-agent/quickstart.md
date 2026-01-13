# Quickstart: 应季食谱推荐 AI Agent

**Date**: 2026-01-08 (Updated)
**Feature**: 001-seasonal-recipe-agent

## 前置条件

- Go 1.21+
- Node.js 18+
- pnpm（推荐）或 npm
- AI API 密钥（至少配置一个）：

| 用途 | 环境变量 | 服务商 |
|------|----------|--------|
| LLM + 图像 | `OPENAI_API_KEY` | OpenAI (推荐) |
| 仅 LLM | `DEEPSEEK_API_KEY` | DeepSeek |
| 仅 LLM | `DASHSCOPE_API_KEY` | 通义千问 |
| 仅 LLM | `OLLAMA_HOST` | Ollama (本地) |
| 仅图像 | `STABILITY_API_KEY` | Stability AI |

## 快速启动

### 1. 克隆项目

```bash
git clone <repo-url>
cd eat-only-in-season
```

### 2. 配置环境变量

创建 `.env` 文件或直接设置环境变量：

```bash
# 推荐：OpenAI (同时支持 LLM 和图像生成)
export OPENAI_API_KEY="sk-..."

# 或者：组合使用多个服务
export DEEPSEEK_API_KEY="sk-..."    # LLM
export OPENAI_API_KEY="sk-..."       # 图像生成 (DALL-E)

# 可选：Ollama 本地模型
export OLLAMA_HOST="http://localhost:11434"
```

### 3. 启动后端

```bash
cd backend
go mod download
go run cmd/server/main.go

# 服务启动于 http://localhost:8080
```

验证服务：
```bash
# 健康检查
curl http://localhost:8080/api/v1/system/health

# 查看 AI 服务状态
curl http://localhost:8080/api/v1/system/status
```

### 4. 启动前端

```bash
cd frontend
pnpm install
pnpm dev

# 开发服务器启动于 http://localhost:5173
```

### 5. 访问应用

打开浏览器访问 http://localhost:5173

## 验证步骤

### P1 验证：应季菜谱推荐

1. 打开首页
2. 输入城市名称（如"东京"、"成都"、"Paris"）
3. 点击"获取推荐"按钮
4. 验证：页面显示 3-5 个应季菜谱卡片，风格符合当地饮食文化

**预期时间**: < 8 秒

### P2 验证：菜谱详情

1. 点击任意菜谱卡片
2. 验证：显示食材清单（含精确用量）和分步骤制作说明

**预期时间**: < 15 秒

### P3 验证：菜品图片

1. 在详情页等待图片加载
2. 验证：显示 AI 生成的菜品成品图片（或"正在生成..."提示）

**预期时间**: < 60 秒

### P4 验证：个人偏好

1. 进入偏好设置
2. 输入自然语言偏好（如"我是素食主义者，喜欢清淡口味"）
3. 验证：字数统计显示 X/200，后续推荐结果符合偏好

### P5 验证：PDF 导出

1. 在菜谱详情页点击"导出 PDF"
2. 验证：下载包含菜品图片、食材、步骤的 PDF 文件

**预期时间**: < 10 秒

## API 测试

```bash
# 搜索城市
curl "http://localhost:8080/api/v1/city/search?q=东京"

# 获取菜谱推荐
curl -X POST http://localhost:8080/api/v1/recipes \
  -H "Content-Type: application/json" \
  -d '{"cityName": "成都", "preferenceText": "喜欢麻辣口味"}'

# 获取菜谱详情
curl http://localhost:8080/api/v1/recipes/{recipeId}

# 获取菜谱图片
curl http://localhost:8080/api/v1/recipes/{recipeId}/image

# 导出 PDF
curl -X POST http://localhost:8080/api/v1/recipes/{recipeId}/pdf \
  -H "Content-Type: application/json" \
  -d '{"includeImage": true}'

# 系统状态
curl http://localhost:8080/api/v1/system/status
```

## 常见问题

### Q: 后端启动失败，提示缺少依赖

```bash
cd backend
go mod tidy
go mod download
```

### Q: 前端无法连接后端

检查 CORS 配置，确保 `localhost:5173` 在允许列表中。
后端默认已配置开发环境 CORS。

### Q: AI 调用超时

1. 检查网络连接
2. 尝试使用代理（设置 `OPENAI_BASE_URL`）
3. 系统会自动降级到下一优先级服务商

### Q: 图片生成失败

1. 确认 OpenAI API Key 有 DALL-E 访问权限
2. 检查 API 余额
3. 系统会显示友好占位图，可点击重试

### Q: 城市无法识别

1. 尝试输入城市的中文或英文名称
2. 使用更常见的城市拼写方式
3. 系统会提供热门城市列表供选择

### Q: 无可用 AI 服务

1. 检查环境变量是否正确设置
2. 访问 `/api/v1/system/status` 查看服务状态
3. 至少需要配置一个 LLM 服务

## 开发模式

### 后端热重载

```bash
# 安装 air
go install github.com/cosmtrek/air@latest

# 使用 air 启动
cd backend
air
```

### 前端开发

```bash
cd frontend
pnpm dev  # 已支持 HMR
```

### 运行测试

```bash
# 后端测试
cd backend
go test ./...

# 前端测试
cd frontend
pnpm test
```

## 目录结构

```
eat-only-in-season/
├── backend/                 # Go 后端
│   ├── cmd/server/          # 入口
│   ├── internal/
│   │   ├── api/             # HTTP handlers
│   │   ├── models/          # 数据模型
│   │   └── services/        # 业务服务
│   └── go.mod
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/      # UI 组件
│   │   ├── pages/           # 页面
│   │   └── services/        # API 调用
│   └── package.json
└── specs/                   # 规格文档
    └── 001-seasonal-recipe-agent/
        ├── spec.md          # 功能规范
        ├── plan.md          # 实现计划
        ├── data-model.md    # 数据模型
        ├── contracts/       # API 契约
        └── quickstart.md    # 本文件
```

## 下一步

1. 运行 `/speckit.tasks` 生成详细任务列表
2. 按 P1 → P2 → P3 → P4 → P5 → P6 优先级顺序实现功能
3. 每个用户故事可独立交付和验证
