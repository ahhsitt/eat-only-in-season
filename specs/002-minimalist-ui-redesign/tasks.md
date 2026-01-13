# Tasks: Minimalist UI Redesign

**Input**: Design documents from `/specs/002-minimalist-ui-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: 本功能为纯视觉样式重构，不包含自动化测试任务。验收通过手动视觉验证完成。

**Organization**: 任务按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（US1, US2, US3）
- 描述中包含精确文件路径

## Path Conventions

- **Web app**: `frontend/src/` 前端源码目录
- 所有路径相对于仓库根目录

---

## Phase 1: Setup (全局样式基础)

**Purpose**: 建立设计令牌和全局样式基础

- [x] T001 在 frontend/src/index.css 中定义 CSS 变量（颜色、字体、间距、阴影、过渡）
- [x] T002 在 frontend/src/index.css 中配置系统原生字体栈和 body 基础样式
- [x] T003 [P] 清理 frontend/src/App.css 中不再需要的旧样式

---

## Phase 2: Foundational (共享组件样式)

**Purpose**: 更新被多个页面共享的基础组件样式

**⚠️ CRITICAL**: 此阶段完成后，用户故事才能开始

- [x] T004 更新 frontend/src/components/Layout/Layout.tsx 中的页头页脚样式（背景色、间距、字体）
- [x] T005 [P] 更新 frontend/src/components/LoadingSpinner/LoadingSpinner.tsx 中的加载动画样式（暖色调骨架屏）
- [x] T006 [P] 更新 frontend/src/components/SeasonBadge/SeasonBadge.tsx 中的徽章样式（强调色、圆角）
- [x] T007 [P] 更新 frontend/src/components/AIStatus/AIStatusBadge.tsx 中的状态徽章样式

**Checkpoint**: 基础组件样式就绪，用户故事实现可以开始

---

## Phase 3: User Story 1 - 首页浏览体验优化 (Priority: P1) 🎯 MVP

**Goal**: 用户在首页看到优雅的菜谱卡片布局，体验高端浏览感受

**Independent Test**: 加载首页，验证暖色奶油背景、优雅排版、卡片悬停动画效果

### Implementation for User Story 1

- [x] T008 [US1] 更新 frontend/src/pages/Home/Home.tsx 中的页面背景色（从 green-50 渐变改为 #FAF7F4）
- [x] T009 [US1] 更新 frontend/src/pages/Home/Home.tsx 中的标题样式（字体颜色 #2D2D2D、字重、间距）
- [x] T010 [US1] 更新 frontend/src/pages/Home/Home.tsx 中的搜索区域样式（间距、居中、留白）
- [x] T011 [US1] 更新 frontend/src/components/RecipeCard/RecipeCard.tsx 中的卡片容器样式（阴影、圆角、背景）
- [x] T012 [US1] 更新 frontend/src/components/RecipeCard/RecipeCard.tsx 中的卡片悬停效果（250ms 过渡、阴影加深）
- [x] T013 [US1] 更新 frontend/src/components/RecipeCard/RecipeCard.tsx 中的卡片内容样式（标题、描述、标签颜色）
- [x] T014 [US1] 更新 frontend/src/components/CityInput/CityInput.tsx 中的输入框样式（边框、圆角、聚焦状态）
- [x] T015 [US1] 更新 frontend/src/pages/Home/Home.tsx 中的错误提示和空状态样式（暖色调）
- [x] T016 [US1] 验证首页响应式布局（移动端单列、平板双列、桌面三列）

**Checkpoint**: 首页视觉体验完成，可独立验收

---

## Phase 4: User Story 2 - 菜谱详情页优化 (Priority: P2)

**Goal**: 用户在菜谱详情页看到清晰、优雅的内容呈现

**Independent Test**: 导航到任意菜谱详情页，验证图片展示、步骤列表、食材清单的视觉效果

### Implementation for User Story 2

- [x] T017 [US2] 更新 frontend/src/pages/RecipeDetail/RecipeDetailPage.tsx 中的页面背景和整体布局
- [x] T018 [US2] 更新 frontend/src/pages/RecipeDetail/RecipeDetailPage.tsx 中的菜谱头部样式（图片区域、标题、标签）
- [x] T019 [P] [US2] 更新 frontend/src/components/RecipeDetail/IngredientList.tsx 中的食材列表样式（间距、图标、应季标记）
- [x] T020 [P] [US2] 更新 frontend/src/components/RecipeDetail/CookingSteps.tsx 中的步骤列表样式（序号、排版、小贴士）
- [x] T021 [P] [US2] 更新 frontend/src/components/RecipeDetail/RecipeImage.tsx 中的图片展示样式（圆角、占位符）
- [x] T022 [P] [US2] 更新 frontend/src/components/RecipeDetail/RecipeDetailSkeleton.tsx 中的骨架屏样式（暖色调）
- [x] T023 [US2] 更新 frontend/src/pages/RecipeDetail/RecipeDetailPage.tsx 中的营养信息和小贴士区块样式
- [x] T024 [US2] 更新返回按钮和面包屑导航样式（强调色链接）

**Checkpoint**: 菜谱详情页视觉体验完成，可独立验收

---

## Phase 5: User Story 3 - 设置页一致性 (Priority: P3)

**Goal**: 用户在设置页看到与整体风格一致的表单和按钮

**Independent Test**: 导航到设置页，验证表单元素、按钮、信息卡片的视觉一致性

### Implementation for User Story 3

- [x] T025 [US3] 更新 frontend/src/pages/Settings/Settings.tsx 中的页面背景和整体布局
- [x] T026 [US3] 更新 frontend/src/pages/Settings/Settings.tsx 中的表单区域样式（卡片背景、间距）
- [x] T027 [US3] 更新 frontend/src/pages/Settings/Settings.tsx 中的文本输入框样式（边框、圆角、聚焦）
- [x] T028 [US3] 更新 frontend/src/pages/Settings/Settings.tsx 中的按钮样式（主按钮强调色、次按钮灰色）
- [x] T029 [US3] 更新 frontend/src/pages/Settings/Settings.tsx 中的信息卡片样式（蓝色/绿色提示框改为暖色调）
- [x] T030 [P] [US3] 更新 frontend/src/components/PreferenceForm/PreferenceForm.tsx 中的偏好表单样式（如存在）
- [x] T031 [P] [US3] 更新 frontend/src/pages/Setup/Setup.tsx 中的设置向导页样式（如存在）
- [x] T032 [P] [US3] 更新 frontend/src/components/PDFExport/PDFExportButton.tsx 中的导出按钮样式

**Checkpoint**: 设置页视觉体验完成，可独立验收

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全局优化和边缘情况处理

- [x] T033 验证所有页面的 WCAG AA 对比度合规性
- [x] T034 验证所有交互元素的焦点状态可见性（无障碍）
- [x] T035 [P] 验证移动端响应式布局（320px - 768px）
- [x] T036 [P] 验证桌面端响应式布局（1024px - 1920px）
- [x] T037 清理所有组件中残留的旧绿色系样式类名
- [x] T038 运行 ESLint 检查并修复样式相关警告
- [x] T039 按 quickstart.md 验证清单执行最终视觉验收

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Phase 1 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 依赖 Phase 2 完成
  - 用户故事可并行执行（如有多人）
  - 或按优先级顺序执行（P1 → P2 → P3）
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Phase 2 完成后可开始 - 无其他故事依赖
- **User Story 3 (P3)**: Phase 2 完成后可开始 - 无其他故事依赖

### Within Each User Story

- 页面级样式先于组件级样式
- 核心布局先于细节样式
- 交互效果最后处理

### Parallel Opportunities

- Phase 1: T003 可与 T001/T002 并行
- Phase 2: T005, T006, T007 可并行
- Phase 3: 大部分任务需顺序执行（同一文件）
- Phase 4: T019, T020, T021, T022 可并行（不同文件）
- Phase 5: T030, T031, T032 可并行（不同文件）
- Phase 6: T035, T036 可并行

---

## Parallel Example: User Story 2

```bash
# 以下任务可并行执行（不同文件）:
Task: "更新 IngredientList.tsx 食材列表样式"
Task: "更新 CookingSteps.tsx 步骤列表样式"
Task: "更新 RecipeImage.tsx 图片展示样式"
Task: "更新 RecipeDetailSkeleton.tsx 骨架屏样式"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup（全局样式基础）
2. 完成 Phase 2: Foundational（共享组件）
3. 完成 Phase 3: User Story 1（首页）
4. **STOP and VALIDATE**: 独立测试首页视觉效果
5. 如满意可先部署/演示

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 每个故事增加价值，不破坏之前的故事

### Parallel Team Strategy

多人协作时：

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后：
   - 开发者 A: User Story 1（首页）
   - 开发者 B: User Story 2（详情页）
   - 开发者 C: User Story 3（设置页）
3. 各故事独立完成和集成

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签映射到 spec.md 中的用户故事
- 每个用户故事应可独立完成和测试
- 每个任务或逻辑组完成后提交
- 在任何检查点停止以独立验证故事
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖

---

## Summary

| 指标 | 数值 |
|------|------|
| 总任务数 | 39 |
| Phase 1 (Setup) | 3 |
| Phase 2 (Foundational) | 4 |
| Phase 3 (US1 - 首页) | 9 |
| Phase 4 (US2 - 详情页) | 8 |
| Phase 5 (US3 - 设置页) | 8 |
| Phase 6 (Polish) | 7 |
| 可并行任务 | 15 |

**MVP 范围**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 16 个任务
