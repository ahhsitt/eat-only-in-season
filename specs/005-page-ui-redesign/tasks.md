# Tasks: 活泼年轻风沉浸式 UI 重设计

**Input**: Design documents from `/specs/005-page-ui-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: 本功能为纯 UI 重构，未明确要求测试，故不包含测试任务。

**Organization**: 任务按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` (本项目仅涉及前端变更)

---

## Phase 1: Setup (主题系统基础设施)

**Purpose**: 创建设计 token 系统和基础动画架构，为所有页面重构奠定基础

- [x] T001 创建 tokens 目录结构 `frontend/src/theme/tokens/`
- [x] T002 [P] 创建色彩 token 文件，定义珊瑚橙粉色系 `frontend/src/theme/tokens/colors.ts`
- [x] T003 [P] 创建动画 token 文件，定义缓动函数和时长 `frontend/src/theme/tokens/motion.ts`
- [x] T004 [P] 创建全局动画样式文件，包含入场和交互动画 keyframes `frontend/src/styles/animations.css`
- [x] T005 [P] 创建 useReducedMotion hook，检测系统动画偏好 `frontend/src/hooks/useReducedMotion.ts`
- [x] T006 重写 Ant Design 主题配置，应用新色彩系统 `frontend/src/theme/index.ts`
- [x] T007 在 App.tsx 中导入全局动画样式 `frontend/src/App.tsx`

**Checkpoint**: 主题系统就绪，所有组件将自动继承新色彩 ✅

---

## Phase 2: Foundational (全局布局重构)

**Purpose**: 重构全局布局组件，为所有页面提供统一的导航和结构

**⚠️ CRITICAL**: 布局变更会影响所有页面，需在用户故事前完成

- [x] T008 重构 Layout 组件头部，更新品牌色彩和导航样式 `frontend/src/components/Layout/Layout.tsx`
- [x] T009 为 Layout 添加导航项悬停动画效果 `frontend/src/components/Layout/Layout.tsx`
- [x] T010 更新 Layout 背景色为暖白色调 `frontend/src/components/Layout/Layout.tsx`

**Checkpoint**: 全局布局就绪 - 用户故事实现可以开始

---

## Phase 3: User Story 1 - 沉浸式首页搜索体验 (Priority: P1) 🎯 MVP

**Goal**: 首页采用全屏沉浸式布局，城市搜索框位于视觉中心，搜索时有流畅动画反馈

**Independent Test**: 打开首页，验证全屏欢迎界面、输入城市、观察动画效果

### Implementation for User Story 1

- [x] T011 [US1] 重构 NewHome 页面，创建全屏 HeroSection 欢迎区 `frontend/src/pages/NewHome/NewHome.tsx`
- [x] T012 [US1] 为 HeroSection 添加渐变背景和品牌标语 `frontend/src/pages/NewHome/NewHome.tsx`
- [x] T013 [US1] 增强 CityInput 组件，添加聚焦和搜索动画效果 `frontend/src/components/CityInput/CityInput.tsx`
- [x] T014 [US1] 为 CityInput 添加悬停和点击反馈动画 `frontend/src/components/CityInput/CityInput.tsx`
- [x] T015 [US1] 实现首页搜索后的平滑过渡动画 `frontend/src/pages/NewHome/NewHome.tsx`
- [x] T016 [US1] 更新偏好设置卡片样式为新色彩系统 `frontend/src/pages/NewHome/NewHome.tsx`
- [x] T017 [US1] 更新位置信息徽章为珊瑚橙粉配色 `frontend/src/pages/NewHome/NewHome.tsx`
- [x] T018 [US1] 更新"获取菜谱"按钮为活力风格，添加点击动画 `frontend/src/pages/NewHome/NewHome.tsx`

**Checkpoint**: 首页沉浸式体验完成，可独立验证

---

## Phase 4: User Story 2 - 活力食材选择体验 (Priority: P1)

**Goal**: 食材列表色彩丰富，选择时有愉悦动效，每个分类有独特视觉标识

**Independent Test**: 搜索城市后，验证食材展示效果、选择交互和动画反馈

### Implementation for User Story 2

- [x] T019 [US2] 重构 IngredientList 组件，添加分类颜色标识系统 `frontend/src/components/IngredientList/IngredientList.tsx`
- [x] T020 [US2] 为食材卡片添加入场动画（staggered fadeIn） `frontend/src/components/IngredientList/IngredientList.tsx`
- [x] T021 [US2] 实现食材选中状态的弹跳动画效果 `frontend/src/components/IngredientList/IngredientList.tsx`
- [x] T022 [US2] 为食材卡片添加悬停放大和阴影效果 `frontend/src/components/IngredientList/IngredientList.tsx`
- [x] T023 [US2] 更新已选食材列表展示样式 `frontend/src/components/IngredientList/IngredientList.tsx`
- [x] T024 [US2] 为每个食材分类设置独特的背景色标识 `frontend/src/components/IngredientList/IngredientList.tsx`

**Checkpoint**: 食材选择体验完成，可独立验证

---

## Phase 5: User Story 3 - 沉浸式菜谱列表浏览 (Priority: P1)

**Goal**: 菜谱以大图沉浸式卡片展示，滑动浏览有视差效果，悬停有明显动效

**Independent Test**: 访问 `/recipes` 页面，验证菜谱展示效果和滑动体验

### Implementation for User Story 3

- [x] T025 [US3] 重构 RecipeCard 组件为大图沉浸式卡片 `frontend/src/components/RecipeCard/RecipeCard.tsx`
- [x] T026 [US3] 为 RecipeCard 添加图片懒加载和骨架屏 `frontend/src/components/RecipeCard/RecipeCard.tsx`
- [x] T027 [US3] 实现 RecipeCard 悬停放大和阴影动画 `frontend/src/components/RecipeCard/RecipeCard.tsx`
- [x] T028 [US3] 重构 RecipeListPage 布局为沉浸式展示 `frontend/src/pages/RecipeListPage/RecipeListPage.tsx`
- [x] T029 [US3] 为菜谱列表添加入场 staggered 动画 `frontend/src/pages/RecipeListPage/RecipeListPage.tsx`
- [x] T030 [US3] 实现页面滚动时的视差效果 `frontend/src/pages/RecipeListPage/RecipeListPage.tsx`
- [x] T031 [US3] 更新页面标题和返回按钮样式 `frontend/src/pages/RecipeListPage/RecipeListPage.tsx`

**Checkpoint**: 菜谱列表沉浸式体验完成，可独立验证

---

## Phase 6: User Story 4 - 活力菜谱详情页 (Priority: P2)

**Goal**: 菜谱详情以杂志风格呈现，配图突出，食材和步骤有设计感

**Independent Test**: 访问 `/recipe/:id` 页面，验证内容展示效果和视觉吸引力

### Implementation for User Story 4

- [x] T032 [US4] 重构详情页顶部为大图 Hero 区域 `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx`
- [x] T033 [US4] 更新食材清单区域为彩色标签设计 `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx`
- [x] T034 [US4] 重构烹饪步骤区域，添加设计感步骤编号 `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx`
- [x] T035 [US4] 更新导出/分享按钮为活力风格 `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx`
- [x] T036 [US4] 为详情页各区域添加入场动画 `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx`
- [x] T037 [US4] 优化小贴士区域样式为卡片式展示 `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx`

**Checkpoint**: 菜谱详情页杂志风格完成，可独立验证

---

## Phase 7: User Story 5 - 食材详情弹窗升级 (Priority: P2)

**Goal**: 食材详情弹窗以活泼动画形式出现，内容以卡片式分区呈现

**Independent Test**: 在首页点击食材详情按钮，验证弹窗展示效果和交互体验

### Implementation for User Story 5

- [x] T038 [US5] 增强 IngredientModal 弹窗打开动画（scale + fadeIn） `frontend/src/components/IngredientModal/IngredientModal.tsx`
- [x] T039 [US5] 更新弹窗内容为卡片式分区布局 `frontend/src/components/IngredientModal/IngredientModal.tsx`
- [x] T040 [US5] 为弹窗标题区域添加图标装饰 `frontend/src/components/IngredientModal/IngredientModal.tsx`
- [x] T041 [US5] 实现弹窗关闭时的平滑消失动画 `frontend/src/components/IngredientModal/IngredientModal.tsx`
- [x] T042 [US5] 更新弹窗配色为珊瑚橙粉系 `frontend/src/components/IngredientModal/IngredientModal.tsx`

**Checkpoint**: 食材弹窗升级完成，可独立验证

---

## Phase 8: User Story 6 - 全局导航与品牌升级 (Priority: P2)

**Goal**: 导航设计年轻化，品牌元素有活力，交互有动效

**Independent Test**: 在不同页面验证导航一致性和品牌元素展示

### Implementation for User Story 6

- [x] T043 [US6] 更新 Layout 导航栏为活力设计风格 `frontend/src/components/Layout/Layout.tsx`
- [x] T044 [US6] 为导航菜单项添加悬停动画效果 `frontend/src/components/Layout/Layout.tsx`
- [x] T045 [US6] 更新品牌标题和标语样式 `frontend/src/components/Layout/Layout.tsx`
- [x] T046 [US6] 优化页脚样式为统一品牌风格 `frontend/src/components/Layout/Layout.tsx`

**Checkpoint**: 全局导航与品牌升级完成，可独立验证

---

## Phase 9: User Story 7 - 响应式适配与移动端优化 (Priority: P3)

**Goal**: 应用在移动设备上布局适配良好，触摸交互友好

**Independent Test**: 在不同屏幕尺寸（375px, 768px, 1024px+）下验证页面布局和交互

### Implementation for User Story 7

- [x] T047 [US7] 优化首页在移动端的布局适配 `frontend/src/pages/NewHome/NewHome.tsx`
- [x] T048 [US7] 优化食材列表在移动端的列数和间距 `frontend/src/components/IngredientList/IngredientList.tsx`
- [x] T049 [US7] 优化菜谱卡片在移动端的尺寸 `frontend/src/components/RecipeCard/RecipeCard.tsx`
- [x] T050 [US7] 优化菜谱列表页移动端布局 `frontend/src/pages/RecipeListPage/RecipeListPage.tsx`
- [x] T051 [US7] 优化菜谱详情页移动端布局 `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx`
- [x] T052 [US7] 优化导航栏在移动端的显示模式 `frontend/src/components/Layout/Layout.tsx`
- [x] T053 [US7] 验证触摸交互反馈在移动端的效果 `frontend/src/styles/animations.css`

**Checkpoint**: 响应式适配完成，所有设备可用

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: 性能优化和最终验收

- [x] T054 验证所有页面的 prefers-reduced-motion 降级效果
- [x] T055 检查所有动画的性能（确保 60fps）
- [x] T056 验证页面加载时间 < 3 秒
- [x] T057 检查色彩一致性，确保无遗漏的旧色彩
- [x] T058 运行 quickstart.md 验证流程

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-9)**: 全部依赖 Foundational 完成
  - US1-US3 (P1) 建议按顺序完成
  - US4-US6 (P2) 可在 P1 完成后并行
  - US7 (P3) 建议最后完成
- **Polish (Phase 10)**: 依赖所有用户故事完成

### User Story Dependencies

| 用户故事 | 优先级 | 依赖 | 并行可能性 |
|---------|--------|------|-----------|
| US1 沉浸式首页 | P1 | Foundational | 可独立完成 |
| US2 食材选择 | P1 | US1 完成后更佳 | 可与 US1 并行 |
| US3 菜谱列表 | P1 | 无 | 可与 US1/US2 并行 |
| US4 菜谱详情 | P2 | 无 | 可与 P1 故事并行 |
| US5 食材弹窗 | P2 | 无 | 可与其他 P2 并行 |
| US6 导航品牌 | P2 | 无 | 可与其他 P2 并行 |
| US7 响应式 | P3 | 所有页面完成 | 最后执行 |

### Within Each User Story

- 页面/组件样式变更优先
- 动画效果后添加
- 交互反馈最后完善

### Parallel Opportunities

**Phase 1 并行**:
```
T002 colors.ts | T003 motion.ts | T004 animations.css | T005 useReducedMotion.ts
```

**P1 用户故事可部分并行**:
```
US1 首页团队 | US3 菜谱列表团队
```

**P2 用户故事完全并行**:
```
US4 详情页 | US5 弹窗 | US6 导航
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational
3. 完成 Phase 3: US1 沉浸式首页
4. **STOP and VALIDATE**: 独立验证首页体验
5. 可部署/演示

### Incremental Delivery

1. Setup + Foundational → 主题系统就绪
2. US1 首页 → 验证 → MVP 可用
3. US2 食材选择 → 验证 → 核心流程完善
4. US3 菜谱列表 → 验证 → 核心功能完整
5. US4-US6 → 验证 → 全面升级
6. US7 响应式 → 验证 → 全设备可用

### Suggested MVP Scope

**最小可行产品 (MVP)**: Phase 1 + Phase 2 + Phase 3 (US1)

完成后可获得：
- 新的珊瑚橙粉主题系统
- 沉浸式首页搜索体验
- 动画降级支持

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签映射到具体用户故事便于追踪
- 每个用户故事应可独立完成和测试
- 每个任务或逻辑组完成后提交
- 任意检查点可停下验证
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖
