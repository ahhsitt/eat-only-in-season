# Implementation Plan: Minimalist UI Redesign

**Branch**: `002-minimalist-ui-redesign` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-minimalist-ui-redesign/spec.md`

## Summary

将应用的视觉风格从当前的绿色渐变设计重构为简约、优雅的现代美学风格，灵感来源于 Ayune 护肤品电商设计。主要变更包括：暖色奶油/米色调色板、系统原生字体栈、柔和鼠尾草绿强调色、200-300ms 过渡动画，以及充足的留白空间。此功能仅涉及前端样式修改，不影响后端或数据流。

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2.0
**Primary Dependencies**: Tailwind CSS 4.1.18, Vite 7.2.4, React Router DOM 7.11.0
**Storage**: N/A（纯样式变更，无存储需求）
**Testing**: 视觉回归测试（手动验证），ESLint 代码检查
**Target Platform**: Web 浏览器（桌面 + 移动端响应式）
**Project Type**: Web 应用（前端 + 后端分离架构）
**Performance Goals**: 动画 60fps，页面加载无明显延迟
**Constraints**: WCAG AA 对比度标准，200-300ms 过渡时长
**Scale/Scope**: 3 个主要页面（首页、菜谱详情、设置），约 15 个组件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| 一、高品质代码 | ✅ 通过 | 样式变更将遵循 Tailwind CSS 最佳实践，保持一致的编码风格 |
| 二、可测试性 | ✅ 通过 | 视觉变更可通过手动验收测试验证，关键路径覆盖 |
| 三、最小可行产品 (MVP) | ✅ 通过 | 按 P1→P2→P3 优先级分阶段交付，每个用户故事可独立验证 |
| 四、避免过度设计 | ✅ 通过 | 仅修改必要的样式，不引入新的抽象层或配置系统 |

**开发约束检查**:
- ✅ 代码风格：遵循 ESLint 配置
- ✅ 安全性：无敏感信息涉及
- ✅ 文档：样式变更将在设计文档中说明

## Project Structure

### Documentation (this feature)

```text
specs/002-minimalist-ui-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (design tokens)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for this feature)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── index.css            # 全局样式和 Tailwind 配置
│   ├── App.css              # 应用级样式
│   ├── components/
│   │   ├── Layout/          # 布局组件样式
│   │   ├── RecipeCard/      # 菜谱卡片样式
│   │   ├── RecipeDetail/    # 菜谱详情组件样式
│   │   ├── CityInput/       # 城市输入组件样式
│   │   ├── SeasonBadge/     # 季节徽章样式
│   │   ├── LoadingSpinner/  # 加载动画样式
│   │   ├── PreferenceForm/  # 偏好表单样式
│   │   ├── PDFExport/       # PDF 导出按钮样式
│   │   └── AIStatus/        # AI 状态徽章样式
│   └── pages/
│       ├── Home/            # 首页样式
│       ├── RecipeDetail/    # 菜谱详情页样式
│       ├── Settings/        # 设置页样式
│       └── Setup/           # 设置向导页样式
└── tests/                   # 视觉测试（如有）
```

**Structure Decision**: 使用现有的 Web 应用结构，仅修改前端组件的 Tailwind CSS 类名和 index.css 中的全局样式变量。不创建新的目录或文件结构。

## Complexity Tracking

> 无宪法违规，无需记录复杂性偏离。
