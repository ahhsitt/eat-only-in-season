# Implementation Plan: Ant Design UI 升级

**Branch**: `004-antd-ui-redesign` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-antd-ui-redesign/spec.md`

## Summary

将现有基于 Tailwind CSS 的前端界面升级为 Ant Design 5.x 组件库，提升用户界面的专业感、一致性和流畅度。主要工作包括：安装配置 Ant Design、自定义主题（绿色系）、逐步替换现有组件、移除 Tailwind CSS 依赖。

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2.0
**Primary Dependencies**: Ant Design 5.x, React Router DOM 7.11.0, Axios 1.13.2
**Storage**: N/A（纯前端 UI 变更，无存储需求）
**Testing**: Manual visual testing + existing build verification
**Target Platform**: Web (Desktop + Mobile responsive)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: 页面首次加载 ≤ 3 秒
**Constraints**: 保持所有现有功能完整，响应式适配桌面和移动端
**Scale/Scope**: 4 个页面（首页、菜谱列表、菜谱详情、设置）+ 10+ 组件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| 一、高品质代码 | ✅ 通过 | Ant Design 组件库遵循最佳实践，命名清晰 |
| 二、可测试性 | ✅ 通过 | 各页面可独立访问验证，核心流程可手动测试 |
| 三、最小可行产品 (MVP) | ✅ 通过 | 按 P1→P2→P3 优先级分阶段交付 |
| 四、避免过度设计 | ✅ 通过 | 直接使用 Ant Design 组件，不创建额外抽象层 |

**Gate Status**: ✅ 全部通过，可进入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/004-antd-ui-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - pure UI change)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API changes)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/          # 通用组件（需升级为 Ant Design）
│   │   ├── CityInput/       # 城市搜索输入
│   │   ├── IngredientList/  # 食材列表
│   │   ├── IngredientModal/ # 食材详情弹窗
│   │   ├── RecipeList/      # 菜谱列表
│   │   ├── RecipeCard/      # 菜谱卡片
│   │   ├── PDFExport/       # PDF 导出按钮
│   │   ├── PreferenceForm/  # 偏好设置表单
│   │   ├── LoadingSpinner/  # 加载状态
│   │   ├── Layout/          # 页面布局
│   │   └── ErrorBoundary.tsx
│   ├── pages/               # 页面组件（需升级布局和样式）
│   │   ├── NewHome/         # 首页
│   │   ├── RecipeListPage/  # 菜谱列表页
│   │   ├── NewRecipeDetail/ # 菜谱详情页
│   │   ├── Settings/        # 设置页
│   │   └── Setup/           # 初始设置页
│   ├── services/            # API 服务（保持不变）
│   ├── types/               # 类型定义（保持不变）
│   ├── hooks/               # 自定义 Hooks（保持不变）
│   ├── theme/               # 新增：Ant Design 主题配置
│   │   └── index.ts
│   ├── App.tsx              # 需配置 ConfigProvider
│   ├── main.tsx             # 入口文件
│   └── index.css            # 需简化，移除 Tailwind
└── package.json             # 需更新依赖
```

**Structure Decision**: 保持现有的 frontend 目录结构，新增 `theme/` 目录用于 Ant Design 主题配置。

## Complexity Tracking

无复杂性偏离。本功能是纯 UI 替换，遵循直接使用 Ant Design 组件的简单策略。
