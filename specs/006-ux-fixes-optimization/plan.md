# Implementation Plan: UX 问题修复与优化

**Branch**: `006-ux-fixes-optimization` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-ux-fixes-optimization/spec.md`

## Summary

本次优化包含四个主要任务：
1. 移除食材详情弹窗功能以修复接口报错问题
2. 优化 LLM 提示词以增强食材推荐的季节性和地方特色
3. 修复页面返回导航的参数保持问题，确保缓存命中
4. **PDF 导出重构**: 改用前端 HTML 转 PDF 方案（html2canvas + jsPDF），完全保持页面样式

技术方案：
- 前端：移除弹窗组件，修复导航逻辑，新增 PDF 导出工具
- 后端：修改 LLM 提示词，移除 PDF 生成接口（前端直接生成）

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.9.3, React 19.2.0
- Backend: Go 1.24.0

**Primary Dependencies**:
- Frontend: Ant Design 6.1.4, React Router DOM 7.11.0, Axios 1.13.2
- Frontend (新增): html2canvas, jsPDF (用于前端 PDF 导出)
- Backend: Gin 1.11.0, helloagents-go 0.1.2

**Storage**: SQLite (TTL Cache)

**Testing**:
- Frontend: Vite + ESLint (无正式测试框架)
- Backend: 无正式测试框架

**Target Platform**: Web (现代浏览器)

**Project Type**: Web 应用 (frontend + backend)

**Performance Goals**:
- 返回导航 < 1 秒（缓存命中时）
- PDF 导出 < 5 秒（前端渲染）

**Constraints**:
- 前端需兼容现有 React Router 路由结构
- PDF 导出需在客户端完成，支持中文

**Scale/Scope**: 单用户本地使用

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| 一、高品质代码 | ✅ PASS | 修改遵循现有代码风格，使用成熟库 |
| 二、可测试性 | ⚠️ N/A | 本功能为 bug 修复和样式优化，不强制新增测试 |
| 三、最小可行产品 | ✅ PASS | 四个用户故事可独立交付，P1 优先级明确 |
| 四、避免过度设计 | ✅ PASS | 使用成熟的 html2canvas + jsPDF 组合，不自建轮子 |

**Gate Result**: ✅ PASS - 可进入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/006-ux-fixes-optimization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A (本功能不涉及新 API)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── services/
│   │   └── ingredient/
│   │       └── service.go      # 修改：LLM 提示词优化
│   └── api/
│       └── handlers/
│           ├── ingredient.go   # 可能移除：食材详情接口
│           └── pdf.go          # 移除：后端 PDF 生成不再使用
└── ...

frontend/
├── src/
│   ├── components/
│   │   ├── IngredientList/
│   │   │   └── IngredientList.tsx    # 修改：移除详情按钮
│   │   └── IngredientModal/          # 移除：整个目录
│   ├── pages/
│   │   ├── NewHome/
│   │   │   └── NewHome.tsx           # 修改：移除弹窗状态
│   │   ├── RecipeListPage/
│   │   │   └── RecipeListPage.tsx    # 修改：返回按钮逻辑
│   │   └── NewRecipeDetail/
│   │       └── NewRecipeDetailPage.tsx  # 修改：返回按钮 + PDF 导出逻辑
│   ├── services/
│   │   └── api.ts                    # 移除：getIngredientDetail, downloadRecipePdf
│   └── utils/
│       └── pdfExport.ts              # 新增：前端 PDF 导出工具
└── ...
```

**Structure Decision**: 采用现有 Web 应用结构。本次变更亮点：
- PDF 导出从后端迁移到前端，使用 html2canvas + jsPDF
- 移除后端 PDF 生成相关代码，简化架构

## Complexity Tracking

> 无违规项，不需要记录复杂性偏离。
