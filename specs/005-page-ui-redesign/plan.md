# Implementation Plan: 活泼年轻风沉浸式 UI 重设计

**Branch**: `005-page-ui-redesign` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-page-ui-redesign/spec.md`

## Summary

将现有的鼠尾草绿色调 UI 重新设计为活泼年轻的沉浸式体验。采用珊瑚橙粉色系作为主色调，通过 CSS 原生动画实现流畅的交互效果，全屏沉浸式布局提升视觉冲击力。保持现有功能完整性，仅变更前端 UI 展现层。

## Technical Context

**Language/Version**: TypeScript 5.9.3
**Primary Dependencies**: React 19.2.0, Ant Design 6.1.4, Vite 7.2.4, React Router DOM 7.11.0
**Storage**: N/A（纯前端变更，无存储需求）
**Testing**: Vite 内置测试（如需要可补充 Vitest）
**Target Platform**: Web（桌面 + 移动端响应式）
**Project Type**: Web Application (frontend only)
**Performance Goals**: FCP < 1.5s, LCP < 2.5s, 动画 60fps
**Constraints**: 页面加载 < 3s, 遵循 prefers-reduced-motion 降级
**Scale/Scope**: 4 个主要页面重构，12 个组件增强/重构

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| 高品质代码 | ✅ PASS | 遵循 TypeScript 严格类型，Ant Design 最佳实践 |
| 可测试性 | ✅ PASS | 组件可独立测试，视觉效果可通过截图对比验证 |
| MVP 原则 | ✅ PASS | 按 P1/P2/P3 优先级分阶段交付 |
| 避免过度设计 | ✅ PASS | 不引入新依赖，利用现有技术栈能力 |

**Gate Result**: PASSED - 可继续执行

## Project Structure

### Documentation (this feature)

```text
specs/005-page-ui-redesign/
├── plan.md              # 本文件
├── spec.md              # 功能规范
├── research.md          # 技术研究
├── data-model.md        # 设计模型
├── quickstart.md        # 快速开始指南
├── contracts/           # API 契约（无变更）
│   └── README.md
└── tasks.md             # 任务列表（由 /speckit.tasks 生成）
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── theme/
│   │   ├── index.ts           # Ant Design 主题配置 [重写]
│   │   └── tokens/            # 设计 token [新增]
│   │       ├── colors.ts
│   │       └── motion.ts
│   ├── styles/
│   │   └── animations.css     # 全局动画 [新增]
│   ├── hooks/
│   │   └── useReducedMotion.ts # 动画降级 hook [新增]
│   ├── components/
│   │   ├── Layout/Layout.tsx           [重构]
│   │   ├── CityInput/CityInput.tsx     [增强]
│   │   ├── IngredientList/IngredientList.tsx [重构]
│   │   ├── IngredientModal/IngredientModal.tsx [增强]
│   │   ├── RecipeCard/RecipeCard.tsx   [重构]
│   │   └── RecipeList/RecipeList.tsx   [重构]
│   └── pages/
│       ├── NewHome/NewHome.tsx         [重构]
│       ├── RecipeListPage/RecipeListPage.tsx [重构]
│       └── NewRecipeDetail/NewRecipeDetailPage.tsx [重构]
└── tests/
    └── (如需要可补充视觉回归测试)
```

**Structure Decision**: 保持现有 Web Application 结构，在 `theme/` 目录下新增 `tokens/` 子目录存放设计 token，新增 `styles/` 目录存放全局 CSS 动画，新增 `hooks/` 目录存放自定义 hook。

## Complexity Tracking

> **无违规需要记录** - 本功能符合所有宪法原则

## Phase 0 Output

**研究文档**: [research.md](./research.md)

关键决策：
1. **色彩方案**: 珊瑚橙粉系（#FF6B6B 为主色）
2. **动画方案**: CSS 原生动画 + Ant Design Motion
3. **布局方案**: 全屏 Section + scroll-snap 沉浸式
4. **降级策略**: prefers-reduced-motion 自动检测

## Phase 1 Output

**设计模型**: [data-model.md](./data-model.md)
**快速开始**: [quickstart.md](./quickstart.md)
**API 契约**: [contracts/README.md](./contracts/README.md) (无变更)

关键输出：
1. 设计 Token 系统（色彩、间距、圆角、动画）
2. 组件层级结构定义
3. 布局规范（沉浸式首页、菜谱列表、详情页）
4. 动画规范（入场、交互、降级）
5. 文件变更清单（9 个修改、4 个新增）

## Implementation Phases

### Phase 1: 主题系统基础 (P1 优先级)
- 创建色彩 token 系统
- 创建动画 token 系统
- 更新 Ant Design 主题配置
- 创建全局动画样式
- 创建 useReducedMotion hook

### Phase 2: 首页沉浸式体验 (P1 优先级)
- 重构 Layout 组件（新导航设计）
- 重构 NewHome 页面（沉浸式布局）
- 增强 CityInput 组件（动画效果）

### Phase 3: 食材选择体验 (P1 优先级)
- 重构 IngredientList 组件（活力卡片）
- 增强 IngredientModal 组件（弹窗动画）

### Phase 4: 菜谱展示升级 (P1-P2 优先级)
- 重构 RecipeCard 组件（大图卡片）
- 重构 RecipeListPage 页面（沉浸式列表）
- 重构 NewRecipeDetailPage 页面（杂志风格）

### Phase 5: 响应式优化 (P3 优先级)
- 移动端布局适配
- 触摸交互优化
- 性能测试与优化

---

## Next Step

运行 `/speckit.tasks` 生成详细任务列表。
