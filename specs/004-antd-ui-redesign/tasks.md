# Tasks: Ant Design UI 升级

**Input**: Design documents from `/specs/004-antd-ui-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: No automated tests required for this UI redesign feature. Visual verification via quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Components**: `frontend/src/components/`
- **Pages**: `frontend/src/pages/`
- **Theme**: `frontend/src/theme/` (new)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Ant Design and configure project foundation

- [x] T001 Install Ant Design dependencies: `pnpm add antd @ant-design/icons` in frontend/
- [x] T002 Remove Tailwind CSS dependencies: `pnpm remove tailwindcss @tailwindcss/vite` in frontend/
- [x] T003 Create theme configuration file in frontend/src/theme/index.ts
- [x] T004 Update Vite config to remove Tailwind plugin in frontend/vite.config.ts
- [x] T005 Wrap App with ConfigProvider in frontend/src/App.tsx
- [x] T006 Simplify global styles, remove Tailwind directives in frontend/src/index.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core layout and shared components that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Upgrade Layout component to Ant Design Layout in frontend/src/components/Layout/Layout.tsx
- [x] T008 [P] Upgrade LoadingSpinner to Ant Design Spin in frontend/src/components/LoadingSpinner/LoadingSpinner.tsx
- [x] T009 [P] Upgrade ErrorBoundary to use Ant Design Result component in frontend/src/components/ErrorBoundary.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 首页搜索体验升级 (Priority: P1) 🎯 MVP

**Goal**: 升级首页城市搜索、食材列表展示，打造大气专业的第一印象

**Independent Test**: 打开首页 → 输入城市 → 浏览食材列表 → 选择食材 → 点击获取菜谱

### Implementation for User Story 1

- [x] T010 [US1] Upgrade CityInput to Ant Design Input.Search in frontend/src/components/CityInput/CityInput.tsx
- [x] T011 [US1] Upgrade IngredientList to Ant Design Card + Checkbox.Group in frontend/src/components/IngredientList/IngredientList.tsx
- [x] T012 [US1] Update SeasonBadge to use Ant Design Tag component in frontend/src/components/SeasonBadge/SeasonBadge.tsx
- [x] T013 [US1] Upgrade NewHome page layout with Ant Design Row/Col grid in frontend/src/pages/NewHome/NewHome.tsx
- [x] T014 [US1] Update "获取菜谱" button to Ant Design Button in frontend/src/pages/NewHome/NewHome.tsx
- [x] T015 [US1] Add loading skeleton for ingredient list in frontend/src/components/IngredientList/IngredientList.tsx
- [x] T016 [US1] Add Empty state for no ingredients in frontend/src/components/IngredientList/IngredientList.tsx

**Checkpoint**: 首页应完全使用 Ant Design 组件，视觉效果大气整洁

---

## Phase 4: User Story 2 - 菜谱列表页面优化 (Priority: P1)

**Goal**: 升级菜谱列表页，展示美观的卡片列表，包含加载和空状态

**Independent Test**: 带参数访问 /recipes → 查看加载状态 → 浏览菜谱卡片 → 悬停查看效果

### Implementation for User Story 2

- [x] T017 [US2] Upgrade RecipeCard to Ant Design Card in frontend/src/components/RecipeCard/RecipeCard.tsx
- [x] T018 [US2] Upgrade RecipeList to Ant Design Row/Col grid layout in frontend/src/components/RecipeList/RecipeList.tsx
- [x] T019 [US2] Update RecipeListPage with Ant Design Spin/Skeleton loading in frontend/src/pages/RecipeListPage/RecipeListPage.tsx
- [x] T020 [US2] Add Empty state component for no recipes in frontend/src/pages/RecipeListPage/RecipeListPage.tsx
- [x] T021 [US2] Add hover effect styles to RecipeCard in frontend/src/components/RecipeCard/RecipeCard.tsx

**Checkpoint**: 菜谱列表页美观流畅，加载和空状态友好

---

## Phase 5: User Story 3 - 菜谱详情页面美化 (Priority: P2)

**Goal**: 升级菜谱详情页，清晰展示食材、步骤、小贴士等内容

**Independent Test**: 访问 /recipe/:id → 查看内容区块 → 查看图片加载 → 测试 PDF 导出

### Implementation for User Story 3

- [x] T022 [US3] Upgrade NewRecipeDetailPage layout with Ant Design Card sections in frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx
- [x] T023 [US3] Add Ant Design Image component for recipe images in frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx
- [x] T024 [US3] Style cooking steps with Ant Design Steps or List in frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx
- [x] T025 [US3] Upgrade PDFExportButton to Ant Design Button with icon in frontend/src/components/PDFExport/PDFExportButton.tsx
- [x] T026 [US3] Add loading skeleton for detail page in frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx

**Checkpoint**: 菜谱详情页内容层次分明，图片和导出功能正常

---

## Phase 6: User Story 4 - 食材详情弹窗优化 (Priority: P2)

**Goal**: 升级食材详情弹窗，展示应季原因、营养价值等信息

**Independent Test**: 在首页点击食材"了解更多" → 查看弹窗动画 → 阅读内容 → 关闭弹窗

### Implementation for User Story 4

- [x] T027 [US4] Upgrade IngredientModal to Ant Design Modal in frontend/src/components/IngredientModal/IngredientModal.tsx
- [x] T028 [US4] Style modal content with Ant Design Typography and Divider in frontend/src/components/IngredientModal/IngredientModal.tsx
- [x] T029 [US4] Add smooth open/close animations (Ant Design default) in frontend/src/components/IngredientModal/IngredientModal.tsx

**Checkpoint**: 食材详情弹窗流畅美观，内容分区清晰

---

## Phase 7: User Story 5 - 全局布局与导航优化 (Priority: P3)

**Goal**: 统一顶部导航栏，确保各页面布局一致

**Independent Test**: 在不同页面间导航 → 验证导航栏一致性 → 验证页边距统一

### Implementation for User Story 5

- [x] T030 [US5] Add Ant Design Header with logo and navigation in frontend/src/components/Layout/Layout.tsx
- [x] T031 [US5] Ensure consistent Content padding across all pages in frontend/src/components/Layout/Layout.tsx
- [x] T032 [US5] Add responsive menu for mobile (Ant Design Menu) in frontend/src/components/Layout/Layout.tsx

**Checkpoint**: 所有页面导航栏统一，布局一致

---

## Phase 8: User Story 6 - 加载与错误状态统一 (Priority: P3)

**Goal**: 统一所有页面的加载和错误状态展示

**Independent Test**: 模拟慢网络 → 验证加载状态 → 模拟错误 → 验证错误提示和重试

### Implementation for User Story 6

- [x] T033 [US6] Create shared loading component using Ant Design Spin in frontend/src/components/LoadingSpinner/LoadingSpinner.tsx
- [x] T034 [US6] Create shared error component using Ant Design Result in frontend/src/components/ErrorBoundary.tsx
- [x] T035 [US6] Add retry button to error states in frontend/src/components/ErrorBoundary.tsx
- [x] T036 [US6] Ensure all pages use consistent loading/error components

**Checkpoint**: 所有页面加载和错误状态统一，用户体验一致

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and verification

- [x] T037 Remove unused Tailwind utility classes from all components
- [x] T038 Verify responsive layout on desktop (1920x1080) and mobile (375x667)
- [x] T039 Run quickstart.md validation checklist
- [x] T040 Build production bundle and verify no errors: `npm run build`
- [x] T041 Test full user flow: 城市搜索 → 选择食材 → 查看菜谱 → 查看详情 → PDF导出

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 and US2 are both P1, can proceed in parallel
  - US3 and US4 are both P2, can proceed in parallel after P1
  - US5 and US6 are both P3, can proceed in parallel after P2
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can start after Phase 2
- **User Story 2 (P1)**: No dependencies on other stories - can start after Phase 2
- **User Story 3 (P2)**: May use components from US1/US2, but independently testable
- **User Story 4 (P2)**: Depends on US1 (IngredientList triggers modal), but independently testable
- **User Story 5 (P3)**: Layout changes affect all pages, but can be tested independently
- **User Story 6 (P3)**: Cross-cutting, should be done after core stories

### Parallel Opportunities

- T001, T002, T003, T004 can run sequentially (dependency chain)
- T008, T009 can run in parallel (different files)
- US1 and US2 can run in parallel (different pages/components)
- US3 and US4 can run in parallel (different components)
- US5 and US6 can run in parallel (different concerns)

---

## Parallel Example: Phase 1 Setup

```bash
# Sequential - dependency chain
T001: Install Ant Design
T002: Remove Tailwind (after T001)
T003: Create theme config (after T001)
T004: Update Vite config (after T002)
T005: Wrap with ConfigProvider (after T003)
T006: Clean index.css (after T002)
```

## Parallel Example: User Story 1 & 2

```bash
# After Phase 2 completion, can run in parallel:

# Developer A - User Story 1:
T010: Upgrade CityInput
T011: Upgrade IngredientList
T012: Update SeasonBadge
T013: Upgrade NewHome layout

# Developer B - User Story 2:
T017: Upgrade RecipeCard
T018: Upgrade RecipeList
T019: Update RecipeListPage
T020: Add Empty state
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T009)
3. Complete Phase 3: User Story 1 (T010-T016)
4. **STOP and VALIDATE**: Test 首页 independently
5. Deploy/demo if ready - 用户已可体验升级后的首页

### Incremental Delivery

1. Setup + Foundational → Ant Design configured
2. Add US1 (首页) → Test → Deploy (MVP!)
3. Add US2 (菜谱列表) → Test → Deploy
4. Add US3 (菜谱详情) → Test → Deploy
5. Add US4 (食材弹窗) → Test → Deploy
6. Add US5 (导航布局) → Test → Deploy
7. Add US6 (状态统一) → Test → Deploy
8. Polish → Final validation → Complete!

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Phase 2 is done:
   - Developer A: US1 (首页) + US3 (详情页)
   - Developer B: US2 (列表页) + US4 (弹窗)
3. After P1/P2 stories complete:
   - Any developer: US5 (布局) + US6 (状态)
4. Team together: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Theme color: Primary green #8B9A7D (鼠尾草绿)
- All components should preserve existing functionality while upgrading visual style
