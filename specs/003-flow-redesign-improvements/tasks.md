# Tasks: 应用流程重构与功能增强

**Input**: Design documents from `/specs/003-flow-redesign-improvements/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅, quickstart.md ✅

**Tests**: Tests are OPTIONAL - only included if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization and dependency management

- [x] T001 Add SQLite dependency `modernc.org/sqlite` to `backend/go.mod`
- [x] T002 [P] Create SQLite data directory `backend/data/` with .gitkeep
- [x] T003 [P] Add cache configuration environment variables to `backend/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define cache models (CacheConfig, CacheEntry) in `backend/internal/models/cache.go`
- [x] T005 Implement SQLite cache layer in `backend/internal/cache/sqlite.go`
- [x] T006 Implement CacheManager (dual-layer) in `backend/internal/cache/manager.go`
- [x] T007 Add cache configuration parsing in `backend/pkg/config/config.go`
- [x] T008 [P] Define frontend TypeScript types in `frontend/src/types/index.ts`
- [x] T009 Initialize CacheManager in `backend/cmd/server/main.go`
- [x] T010 Start SQLite cleanup goroutine in CacheManager initialization

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 - 查询城市应季食材 (Priority: P1) 🎯 MVP ✅

**Goal**: 用户输入城市后展示分类的应季食材列表

**Independent Test**: 输入城市名称"汕尾"，验证返回按类别分组的应季食材列表

### Implementation for User Story 1

- [x] T011 [P] [US1] Define SeasonalIngredient model in `backend/internal/models/models.go`
- [x] T012 [P] [US1] Define Location model in `backend/internal/models/models.go`
- [x] T013 [US1] Implement ingredient service in `backend/internal/services/ingredient/service.go`
- [x] T014 [US1] Add ingredient cache key generation (city+season+month format)
- [x] T015 [US1] Implement POST /ingredients handler in `backend/internal/api/handlers/ingredient.go`
- [x] T016 [US1] Register /ingredients route in `backend/internal/api/router.go`
- [x] T017 [P] [US1] Create CityInput component in `frontend/src/components/CityInput/`
- [x] T018 [P] [US1] Create IngredientList component in `frontend/src/components/IngredientList/`
- [x] T019 [US1] Create NewHome page in `frontend/src/pages/NewHome/`
- [x] T020 [US1] Add getSeasonalIngredients API function in `frontend/src/services/api.ts`
- [x] T021 [US1] Configure / route to NewHome in `frontend/src/App.tsx`

**Checkpoint**: User Story 1 should be fully functional - user can input city and see ingredient list ✅

---

## Phase 4: User Story 2 - 基于食材获取菜谱推荐 (Priority: P1) 🎯 MVP ✅

**Goal**: 用户选择食材后获取匹配的菜谱列表

**Independent Test**: 选择"番茄"和"牛肉"，验证返回包含这些食材的菜谱列表

### Implementation for User Story 2

- [x] T022 [P] [US2] Define Recipe model in `backend/internal/models/models.go`
- [x] T023 [US2] Implement recipe service in `backend/internal/services/recipe/service.go`
- [x] T024 [US2] Add recipe cache key generation (ingredients combination format)
- [x] T025 [US2] Implement POST /recipes/by-ingredients handler in `backend/internal/api/handlers/new_recipe.go`
- [x] T026 [US2] Register /recipes/by-ingredients route in `backend/internal/api/router.go`
- [x] T027 [P] [US2] Add ingredient selection state to NewHome page
- [x] T028 [P] [US2] Create RecipeList component in `frontend/src/components/RecipeList/`
- [x] T029 [US2] Create RecipeListPage in `frontend/src/pages/RecipeListPage/`
- [x] T030 [US2] Add getRecipesByIngredients API function in `frontend/src/services/api.ts`
- [x] T031 [US2] Configure /recipes route in `frontend/src/App.tsx`

**Checkpoint**: User Stories 1 AND 2 should both work - complete flow from city to recipe list ✅

---

## Phase 5: User Story 8 - 移除旧版流程 (Priority: P1) 🎯 MVP ✅

**Goal**: 清理旧版代码，统一用户体验

**Independent Test**: 访问 /old 路径返回404或重定向到新首页

### Implementation for User Story 8

- [x] T032 [P] [US8] Remove old Home page directory `frontend/src/pages/Home/`
- [x] T033 [P] [US8] Remove old RecipeDetail page directory `frontend/src/pages/RecipeDetail/`
- [x] T034 [US8] Remove /old route from `frontend/src/App.tsx`
- [x] T035 [US8] Remove old recipe handler from `backend/internal/api/handlers/recipe.go`
- [x] T036 [US8] Remove old routes from `backend/internal/api/router.go`
- [x] T037 [US8] Clean up unused API functions in `frontend/src/services/api.ts`

**Checkpoint**: MVP Complete - old flow removed, new flow is the only path ✅

---

## Phase 6: User Story 7 - AI数据双层缓存管理 (Priority: P2) ✅

**Goal**: 实现完整的双层缓存架构，包含内存LRU和SQLite持久化

**Independent Test**: 重复请求相同数据验证响应时间缩短；重启服务验证数据从SQLite恢复

### Implementation for User Story 7

- [x] T038 [US7] Add cache statistics logging in CacheManager
- [x] T039 [US7] Implement cache warm-up on service start (load from SQLite to memory)
- [x] T040 [US7] Add cache hit/miss metrics endpoint GET /system/cache-stats
- [x] T041 [P] [US7] Add environment variable validation for cache config
- [x] T042 [US7] Implement graceful shutdown for cache cleanup goroutine

**Checkpoint**: Dual-layer cache fully operational with monitoring ✅

---

## Phase 7: User Story 3 - 查看菜谱详情与精准图片 (Priority: P2) ✅

**Goal**: 菜谱详情页展示精准匹配的菜品图片

**Independent Test**: 访问"清蒸马鲛鱼"详情页，验证图片为马鲛鱼而非其他鱼类

### Implementation for User Story 3

- [x] T043 [P] [US3] Define RecipeDetail model in `backend/internal/models/models.go`
- [x] T044 [P] [US3] Define ImagePromptTemplate in `backend/internal/services/ai/imagegen/prompt.go`
- [x] T045 [US3] Implement FishVisualFeatures mapping in `backend/internal/services/ai/imagegen/prompt.go`
- [x] T046 [US3] Implement BuildDishPrompt function with negative prompts
- [x] T047 [US3] Update image generation to use structured prompts in `backend/internal/services/ai/imagegen/imagegen.go`
- [x] T048 [US3] Implement image download and Base64 caching
- [x] T049 [US3] Implement GET /recipes/{recipeId}/detail handler in `backend/internal/api/handlers/new_recipe.go`
- [x] T050 [US3] Implement GET /recipes/{recipeId}/image-url handler in `backend/internal/api/handlers/image.go`
- [x] T051 [US3] Register recipe detail and image routes in `backend/internal/api/router.go`
- [x] T052 [P] [US3] Create RecipeDetail component (removed - using NewRecipeDetail page)
- [x] T053 [US3] Create NewRecipeDetail page in `frontend/src/pages/NewRecipeDetail/`
- [x] T054 [US3] Add getRecipeDetail and getRecipeImage API functions in `frontend/src/services/api.ts`
- [x] T055 [US3] Add image container CSS with object-fit: contain in component styles
- [x] T056 [US3] Configure /recipe/:recipeId route in `frontend/src/App.tsx`

**Checkpoint**: Recipe detail page shows accurate images matching dish names ✅

---

## Phase 8: User Story 4 - 导出精美PDF菜谱 (Priority: P2) ✅

**Goal**: 生成简洁美观的PDF菜谱文件

**Independent Test**: 在详情页点击导出，验证PDF样式简洁、中文无乱码

### Implementation for User Story 4

- [x] T057 [US4] Update PDF step formatting to plain numbers in `backend/internal/services/pdf/generator.go`
- [x] T058 [US4] Implement printTip function with [TIP] text marker
- [x] T059 [US4] Implement printSectionTitle with text markers ([CHEF], [材料])
- [x] T060 [US4] Add light green background for tip sections
- [x] T061 [US4] Update PDF layout spacing and font sizes per design spec
- [x] T062 [US4] Implement POST /recipes/{recipeId}/pdf handler in `backend/internal/api/handlers/pdf.go`
- [x] T063 [US4] Register /recipes/{recipeId}/pdf route in `backend/internal/api/router.go`
- [x] T064 [P] [US4] Create PDFExport component in `frontend/src/components/PDFExport/`
- [x] T065 [US4] Add exportRecipePdf API function in `frontend/src/services/api.ts`
- [x] T066 [US4] Integrate PDF export button in NewRecipeDetail page

**Checkpoint**: PDF export generates clean, readable documents ✅

---

## Phase 9: User Story 5 - 偏好设置与搜索合并 (Priority: P2) ✅

**Goal**: 偏好设置与搜索在同一页面，支持浏览器缓存

**Independent Test**: 设置偏好后刷新页面，验证设置自动恢复

### Implementation for User Story 5

- [x] T067 [P] [US5] Define UserPreference type in `frontend/src/types/index.ts`
- [x] T068 [US5] Implement useLocalStorage hook in `frontend/src/hooks/useLocalStorage.ts`
- [x] T069 [P] [US5] Create PreferenceForm component in `frontend/src/components/PreferenceForm/`
- [x] T070 [US5] Integrate PreferenceForm in NewHome page
- [x] T071 [US5] Pass preference to recipe API request
- [x] T072 [US5] Update recipe service to consider preference in prompts

**Checkpoint**: Preferences persist across sessions and affect recipe recommendations ✅

---

## Phase 10: User Story 6 - 应季食材介绍模块 (Priority: P3) ✅

**Goal**: 弹窗展示食材详细介绍

**Independent Test**: 点击食材"了解更多"，验证弹窗显示应季原因、营养价值等

### Implementation for User Story 6

- [x] T073 [P] [US6] Define IngredientDetail model in `backend/internal/models/models.go`
- [x] T074 [US6] Implement ingredient detail generation in `backend/internal/services/ingredient/service.go`
- [x] T075 [US6] Add ingredient detail cache key generation
- [x] T076 [US6] Implement GET /ingredients/{id}/detail handler in `backend/internal/api/handlers/ingredient.go`
- [x] T077 [US6] Register ingredient detail route in `backend/internal/api/router.go`
- [x] T078 [P] [US6] Create IngredientModal component using native dialog in `frontend/src/components/IngredientModal/`
- [x] T079 [US6] Add getIngredientDetail API function in `frontend/src/services/api.ts`
- [x] T080 [US6] Integrate IngredientModal trigger in IngredientList component
- [x] T081 [US6] Add modal backdrop and close behavior

**Checkpoint**: All user stories complete - ingredient details available via modal ✅

---

## Phase 11: Polish & Cross-Cutting Concerns ✅

**Purpose**: Improvements that affect multiple user stories

- [x] T082 [P] Add loading states and skeletons to all async components
- [x] T083 [P] Add error boundary component for graceful error handling
- [x] T084 Implement ServiceUnavailableError display page
- [x] T085 [P] Add retry buttons for failed image/data loads
- [x] T086 Run quickstart.md validation - test cache behavior
- [x] T087 Run quickstart.md validation - test image generation
- [x] T088 Run quickstart.md validation - test PDF export
- [x] T089 Final code cleanup - remove unused imports and dead code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately ✅
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories ✅
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion ✅
  - P1 stories (US1, US2, US8) should complete first for MVP ✅
  - P2 stories (US3, US4, US5, US7) can proceed after MVP ✅
  - P3 story (US6) lowest priority ✅
- **Polish (Phase 11)**: Depends on all desired user stories being complete ✅

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - provides ingredient list ✅
- **User Story 2 (P1)**: Foundation + partial US1 (ingredient selection UI) - provides recipe list ✅
- **User Story 8 (P1)**: Can start after US1+US2 routes are configured - code cleanup ✅
- **User Story 7 (P2)**: Foundation only - enhances cache infrastructure ✅
- **User Story 3 (P2)**: Foundation + US2 (recipe exists) - provides detail page ✅
- **User Story 4 (P2)**: Foundation + US3 (detail page exists) - adds PDF export ✅
- **User Story 5 (P2)**: Foundation + US1 (search page exists) - adds preferences ✅
- **User Story 6 (P3)**: Foundation + US1 (ingredient list exists) - adds detail modal ✅

### Parallel Opportunities

Within Phase 2 (Foundational):
- T004, T005, T006, T007 must be sequential (model → sqlite → manager → config)
- T008 (frontend types) can run parallel with backend tasks

Within User Stories:
- Model definitions (T011, T012, T022, T043) can run parallel within their phases
- Frontend component creation can run parallel when they don't depend on each other
- Backend handlers can run parallel once their services are complete

Cross-Story Parallelism (with sufficient team capacity):
- US1 and US7 can proceed in parallel after foundation
- US3, US4, US5 can proceed in parallel after US1+US2 complete

---

## MVP Implementation Path

### Minimum Viable Product (P1 Stories Only) ✅

1. Phase 1: Setup (T001-T003) ✅
2. Phase 2: Foundational (T004-T010) ✅
3. Phase 3: US1 - City → Ingredients (T011-T021) ✅
4. Phase 4: US2 - Ingredients → Recipes (T022-T031) ✅
5. Phase 5: US8 - Remove Old Flow (T032-T037) ✅

**MVP Checkpoint**: At this point, the new flow is fully functional: ✅
- User enters city → sees ingredient list
- User selects ingredients → gets recipe recommendations
- Old flow is removed

### Full Implementation ✅

Continue with P2 stories in order: US7 → US3 → US4 → US5 ✅
Then P3 story: US6 ✅
Finally: Phase 11 polish ✅

---

## Task Count Summary

| Phase | Story | Tasks | Parallel Tasks | Status |
|-------|-------|-------|----------------|--------|
| Setup | - | 3 | 2 | ✅ |
| Foundation | - | 7 | 1 | ✅ |
| US1 | P1 | 11 | 4 | ✅ |
| US2 | P1 | 10 | 3 | ✅ |
| US8 | P1 | 6 | 2 | ✅ |
| US7 | P2 | 5 | 1 | ✅ |
| US3 | P2 | 14 | 3 | ✅ |
| US4 | P2 | 10 | 1 | ✅ |
| US5 | P2 | 6 | 2 | ✅ |
| US6 | P3 | 9 | 2 | ✅ |
| Polish | - | 8 | 4 | ✅ |
| **Total** | | **89** | **25** | **✅ COMPLETE** |

---

## Implementation Summary

**Completed**: 2026-01-13

All 89 tasks across 11 phases have been implemented:

### Key Deliverables

1. **双层缓存架构** - Memory LRU + SQLite 持久化
   - `backend/internal/cache/manager.go`
   - `backend/internal/cache/sqlite.go`
   - `backend/internal/models/cache.go`

2. **新流程 API**
   - POST /ingredients - 获取应季食材
   - GET /ingredients/:id/detail - 食材详情
   - POST /recipes/by-ingredients - 根据食材推荐菜谱
   - GET /recipes/:id/detail - 菜谱详情
   - GET /recipes/:id/image-url - 菜谱图片
   - POST /recipes/:id/pdf - PDF 导出
   - GET /system/cache-stats - 缓存统计

3. **精准图片提示词**
   - `backend/internal/services/ai/imagegen/prompt.go`
   - 鱼类、海鲜、肉类视觉特征映射
   - 烹饪方式视觉特征
   - 负面提示词避免错误图片

4. **PDF 样式优化**
   - 文本标记替代 emoji ([CHEF], [材料], [TIP])
   - 改进布局和字体

5. **旧流程清理**
   - 移除 /old 路由
   - 移除旧 Home 和 RecipeDetail 页面
   - 清理未使用的 API 函数
