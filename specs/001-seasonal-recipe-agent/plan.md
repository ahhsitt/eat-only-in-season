# Implementation Plan: 应季食谱推荐 AI Agent

**Branch**: `001-seasonal-recipe-agent` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-seasonal-recipe-agent/spec.md`

## Summary

构建一个完整的应季食谱推荐 AI Agent，包括前后端。用户输入城市名称后，系统根据城市地理位置判断当前季节，结合用户个人偏好（自然语言描述，限200字），调用 LLM 生成3-5个应季菜谱推荐。用户可查看菜谱详情（食材清单、制作步骤），AI 生成菜品成品图片，并支持导出 PDF（图片内嵌）。系统支持多 LLM 和图像生成服务商，通过环境变量自动检测和降级。

## Technical Context

**Language/Version**:
- 后端: Go 1.21+
- 前端: TypeScript 5.x / React 18

**Primary Dependencies**:
- 后端: Gin (HTTP框架), helloagents-go (AI Agent框架, 包含 LLM 和图像生成)
- 前端: Vite, React, TailwindCSS
- PDF生成: signintech/gopdf

**Storage**:
- 用户偏好: 浏览器 localStorage
- 图片缓存: 服务端内存缓存 (24小时过期)

**Testing**:
- 后端: Go test
- 前端: Vitest + React Testing Library

**Target Platform**: Web 应用 (桌面/移动端浏览器)

**Project Type**: Web 应用 (frontend + backend)

**Performance Goals**:
- 首次推荐响应 < 8秒
- 菜谱详情加载 < 15秒
- 图片生成 < 60秒 (异步)
- PDF 导出 < 10秒

**Constraints**:
- 无用户登录/注册
- 图片必须转为 Base64 存储
- 所有 AI 提示词使用中文

**Scale/Scope**:
- 支持全球100+主要城市识别
- 单用户使用，无并发压力

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| 一、高品质代码 | ✅ PASS | 将遵循 Go/React 社区编码规范，API 契约明确定义 |
| 二、可测试性 | ✅ PASS | 后端 API 可独立测试，前端组件可单元测试 |
| 三、最小可行产品 (MVP) | ✅ PASS | 按 P1-P6 优先级分阶段交付，P1(推荐)可独立交付价值 |
| 四、避免过度设计 | ✅ PASS | 无登录系统、无数据库、使用 localStorage，架构简洁 |

**开发约束检查**:
- ✅ 代码风格: Go fmt + ESLint/Prettier
- ✅ 依赖管理: 使用成熟库 (Gin, React, TailwindCSS)
- ✅ 安全性: API Key 通过环境变量配置，不硬编码
- ✅ 文档: API 契约通过 OpenAPI 规范定义

## Project Structure

### Documentation (this feature)

```text
specs/001-seasonal-recipe-agent/
├── spec.md              # 功能规范
├── plan.md              # 本文件 (实现计划)
├── research.md          # Phase 0 研究输出
├── data-model.md        # Phase 1 数据模型
├── quickstart.md        # Phase 1 快速启动指南
├── contracts/           # Phase 1 API 契约
│   └── openapi.yaml     # OpenAPI 规范
└── tasks.md             # Phase 2 任务列表 (由 /speckit.tasks 生成)
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── server/
│       └── main.go           # 入口
├── internal/
│   ├── api/
│   │   ├── handlers/         # HTTP handlers
│   │   └── middleware/       # 中间件
│   ├── models/               # 数据模型
│   ├── services/
│   │   ├── city/             # 城市识别服务
│   │   ├── season/           # 季节判断服务
│   │   ├── recipe/           # 菜谱生成服务
│   │   ├── image/            # 图片生成服务
│   │   ├── pdf/              # PDF 导出服务
│   │   └── ai/               # AI 提供商抽象层
│   │       ├── llm/          # LLM 多提供商
│   │       └── imagegen/     # 图像生成多提供商
│   └── cache/                # 缓存管理
├── pkg/
│   └── config/               # 配置加载
├── go.mod
└── go.sum

frontend/
├── src/
│   ├── components/
│   │   ├── CityInput/        # 城市输入组件
│   │   ├── RecipeCard/       # 菜谱卡片组件
│   │   ├── RecipeDetail/     # 菜谱详情组件
│   │   ├── PreferenceForm/   # 偏好设置组件
│   │   └── PDFExport/        # PDF 导出组件
│   ├── pages/
│   │   ├── Home/             # 首页
│   │   └── Recipe/           # 菜谱详情页
│   ├── services/
│   │   └── api.ts            # API 调用封装
│   ├── hooks/
│   │   └── useLocalStorage.ts # localStorage hook
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Structure Decision**: 采用 Web 应用结构 (frontend + backend 分离)，后端使用 Go + Gin 提供 RESTful API，前端使用 React + Vite + TailwindCSS 构建 SPA。

## Complexity Tracking

> 无需填写 - Constitution Check 所有项目通过，无违规需要说明。
