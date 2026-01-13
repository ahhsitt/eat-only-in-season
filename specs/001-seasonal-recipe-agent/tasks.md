# Tasks: 应季食谱推荐 AI Agent

**Input**: Design documents from `/specs/001-seasonal-recipe-agent/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/openapi.yaml

**Tests**: 测试任务为可选，规范未明确要求 TDD。

**Organization**: 任务按用户故事组织，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（US1-US6）
- 包含精确文件路径

## Path Conventions

- **后端**: `backend/` at repository root
- **前端**: `frontend/` at repository root

---

## Phase 1: Setup (项目初始化)

**Purpose**: 创建项目基础结构和依赖配置

- [X] T001 初始化 Go 模块 `go mod init` in `backend/`
- [X] T002 创建后端项目结构 `backend/cmd/server/`, `backend/internal/`, `backend/pkg/`
- [X] T003 [P] 添加后端依赖 (gin, helloagents-go, geo-golang, gopdf, ttlcache) in `backend/go.mod`
- [X] T004 [P] 创建前端项目 `pnpm create vite frontend -- --template react-ts`
- [X] T005 [P] 添加前端依赖 (axios, tailwindcss, react-router-dom) in `frontend/package.json`
- [X] T006 配置 TailwindCSS in `frontend/tailwind.config.js` and `frontend/src/index.css`
- [X] T007 [P] 创建环境变量示例文件 `.env.example` (所有支持的 API Key)
- [X] T008 [P] 配置 ESLint 和 Prettier in `frontend/`

**Checkpoint**: 后端可运行 `go build`，前端可运行 `pnpm dev`

---

## Phase 2: Foundational (基础设施 - 阻塞所有用户故事)

**Purpose**: 所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 用户故事开发前必须完成此阶段

### 后端基础设施

- [X] T009 创建数据模型 `backend/internal/models/models.go` (City, Season, Recipe, RecipeDetail, Ingredient, CookingStep, AIProvider)
- [X] T010 [P] 创建后端入口文件 `backend/cmd/server/main.go` (Gin server + CORS)
- [X] T011 [P] 实现配置加载器 `backend/pkg/config/config.go` (环境变量读取)
- [X] T012 [P] 实现 TTL 缓存模块 `backend/internal/cache/cache.go` (使用 jellydator/ttlcache)
- [X] T013 创建 AI 提供商检测与管理 `backend/internal/services/ai/provider.go`
- [X] T014 [P] 实现错误处理中间件 `backend/internal/api/middleware/error.go`
- [X] T015 [P] 实现请求日志中间件 `backend/internal/api/middleware/logging.go`
- [X] T016 创建路由配置 `backend/internal/api/router.go`

### 前端基础设施

- [X] T017 [P] 创建 TypeScript 类型定义 `frontend/src/types/index.ts` (与后端模型对应)
- [X] T018 [P] 创建 API 服务客户端 `frontend/src/services/api.ts` (Axios 配置)
- [X] T019 [P] 创建 useLocalStorage Hook `frontend/src/hooks/useLocalStorage.ts`
- [X] T020 [P] 配置前端路由 `frontend/src/App.tsx` (Home, Recipe 路由)
- [X] T021 [P] 创建基础布局组件 `frontend/src/components/Layout/Layout.tsx`

**Checkpoint**: 后端启动并响应，前端可访问空白页面

---

## Phase 3: User Story 1 - 获取应季食谱推荐 (Priority: P1) 🎯 MVP

**Goal**: 用户输入全球任意城市后，系统返回 3-5 个应季菜谱卡片

**Independent Test**:
1. 启动后端: `go run backend/cmd/server/main.go`
2. 启动前端: `cd frontend && pnpm dev`
3. 输入城市名 "东京"
4. 验证显示 3-5 个菜谱卡片，符合当地饮食文化

### 后端实现 US1

- [X] T022 [US1] 实现地理编码服务 `backend/internal/services/city/geocoder.go` (使用 geo-golang + OpenStreetMap)
- [X] T023 [US1] 实现季节计算服务 `backend/internal/services/season/calculator.go` (天文季节，南北半球)
- [X] T024 [US1] 创建 LLM 服务抽象 `backend/internal/services/ai/llm/llm.go` (使用 helloagents-go)
- [X] T025 [US1] 实现菜谱生成服务 `backend/internal/services/recipe/generator.go` (中文提示词) - 集成到 llm.go
- [X] T026 [US1] 创建城市搜索 handler `GET /api/v1/city/search` in `backend/internal/api/handlers/city.go`
- [X] T027 [US1] 创建菜谱推荐 handler `POST /api/v1/recipes` in `backend/internal/api/handlers/recipe.go`
- [X] T028 [US1] 添加城市和菜谱缓存逻辑 (7天/24小时 TTL)
- [X] T029 [US1] 创建健康检查 handler `GET /api/v1/system/health` in `backend/internal/api/handlers/system.go`

### 前端实现 US1

- [X] T030 [P] [US1] 创建城市输入组件 `frontend/src/components/CityInput/CityInput.tsx`
- [X] T031 [P] [US1] 创建菜谱卡片组件 `frontend/src/components/RecipeCard/RecipeCard.tsx`
- [X] T032 [P] [US1] 创建季节徽章组件 `frontend/src/components/SeasonBadge/SeasonBadge.tsx`
- [X] T033 [P] [US1] 创建加载状态组件 `frontend/src/components/LoadingSpinner/LoadingSpinner.tsx`
- [X] T034 [US1] 创建首页 `frontend/src/pages/Home/Home.tsx` (城市输入 + 菜谱列表)
- [X] T035 [US1] 实现首页 API 调用和状态管理
- [X] T036 [US1] 添加加载状态和错误处理 UI

**Checkpoint**: User Story 1 (MVP) 完成 - 用户可获取应季菜谱推荐

---

## Phase 4: User Story 2 - 查看菜谱详细制作过程 (Priority: P2)

**Goal**: 用户点击菜谱卡片后，看到完整的食材清单和制作步骤

**Independent Test**:
1. 获取菜谱推荐 (US1)
2. 点击任意菜谱卡片
3. 验证详情页显示食材清单和分步骤说明

### 后端实现 US2

- [X] T037 [US2] 实现菜谱详情生成服务 `backend/internal/services/recipe/detail.go` - 集成到 llm.go
- [X] T038 [US2] 创建菜谱详情 handler `GET /api/v1/recipes/{recipeId}` in `backend/internal/api/handlers/recipe.go`
- [X] T039 [US2] 添加详情缓存逻辑 (24小时 TTL)

### 前端实现 US2

- [X] T040 [P] [US2] 创建食材列表组件 `frontend/src/components/RecipeDetail/IngredientList.tsx`
- [X] T041 [P] [US2] 创建制作步骤组件 `frontend/src/components/RecipeDetail/CookingSteps.tsx`
- [X] T042 [P] [US2] 创建详情骨架屏组件 `frontend/src/components/RecipeDetail/RecipeDetailSkeleton.tsx`
- [X] T043 [US2] 创建菜谱详情页 `frontend/src/pages/Recipe/Recipe.tsx` - 实现为 RecipeDetailPage.tsx
- [X] T044 [US2] 添加从 RecipeCard 到详情页的导航
- [X] T045 [US2] 添加加载骨架屏和错误状态

**Checkpoint**: User Story 2 完成 - 用户可查看菜谱详情

---

## Phase 5: User Story 3 - 查看菜品成品图片 (Priority: P3)

**Goal**: AI 生成的菜品图片显示在详情页

**Independent Test**:
1. 进入菜谱详情页
2. 验证图片加载（或显示生成中状态）
3. 若失败，点击重试按钮验证重新生成

### 后端实现 US3

- [X] T046 [US3] 创建图像生成服务 `backend/internal/services/ai/imagegen/imagegen.go` (使用 helloagents-go NewImageProvider)
- [X] T047 [US3] 实现异步图片生成与状态跟踪 `backend/internal/services/image/generator.go` - 集成到 imagegen.go
- [X] T048 [US3] 创建图片获取 handler `GET /api/v1/recipes/{recipeId}/image` in `backend/internal/api/handlers/image.go`
- [X] T049 [US3] 创建图片重新生成 handler `POST /api/v1/recipes/{recipeId}/image` in `backend/internal/api/handlers/image.go`
- [X] T050 [US3] 添加图片缓存 (Base64 存储, 24小时 TTL)

### 前端实现 US3

- [X] T051 [P] [US3] 创建菜谱图片组件 `frontend/src/components/RecipeDetail/RecipeImage.tsx` (loading/error/ready 状态)
- [X] T052 [US3] 将 RecipeImage 集成到详情页
- [X] T053 [US3] 实现图片生成状态轮询机制
- [X] T054 [US3] 添加失败重试按钮

**Checkpoint**: User Story 3 完成 - 用户可看到 AI 生成的菜品图片

---

## Phase 6: User Story 4 - 设置个人饮食偏好 (Priority: P4)

**Goal**: 用户可用自然语言描述饮食偏好（限200字）

**Independent Test**:
1. 输入偏好文本（如 "我是素食主义者"）
2. 验证字数计数器显示 X/200
3. 获取新推荐
4. 验证推荐结果符合偏好

### 后端实现 US4

- [X] T055 [US4] 更新菜谱生成服务接受并处理偏好文本
- [X] T056 [US4] 更新缓存键包含偏好哈希值

### 前端实现 US4

- [X] T057 [P] [US4] 创建偏好设置表单组件 `frontend/src/components/PreferenceForm/PreferenceForm.tsx` (含字数计数器)
- [X] T058 [US4] 使用 localStorage Hook 管理偏好状态
- [X] T059 [US4] 将偏好集成到菜谱推荐流程
- [X] T060 [US4] 在首页头部显示当前偏好 - Settings 页面链接

**Checkpoint**: User Story 4 完成 - 用户可设置饮食偏好

---

## Phase 7: User Story 5 - 导出菜谱为 PDF (Priority: P5)

**Goal**: 用户可导出包含内嵌图片的 PDF 菜谱

**Independent Test**:
1. 进入已加载图片的菜谱详情页
2. 点击 "导出 PDF" 按钮
3. 验证下载的 PDF 包含菜名、图片、食材、步骤

### 后端实现 US5

- [X] T061 [US5] 实现 PDF 生成服务 `backend/internal/services/pdf/generator.go` (使用 signintech/gopdf)
- [X] T062 [US5] 添加中文字体支持 (NotoSansSC) - 使用 PingFang/NotoSansCJK
- [X] T063 [US5] 创建 PDF 导出 handler `POST /api/v1/recipes/{recipeId}/pdf` in `backend/internal/api/handlers/pdf.go`
- [X] T064 [US5] 处理图片未就绪情况（提供无图版本选项）

### 前端实现 US5

- [X] T065 [P] [US5] 创建 PDF 导出按钮组件 `frontend/src/components/PDFExport/PDFExportButton.tsx`
- [X] T066 [US5] 实现 PDF 下载逻辑（Base64 解码）
- [X] T067 [US5] 添加图片未就绪时的导出选项模态框

**Checkpoint**: User Story 5 完成 - 用户可导出 PDF 菜谱

---

## Phase 8: User Story 6 - 配置 AI 服务 (Priority: P6)

**Goal**: 系统自动检测可用 AI 服务并显示状态

**Independent Test**:
1. 配置不同 API Key 启动系统
2. 访问 `/api/v1/system/status`
3. 验证正确检测提供商和优先级

### 后端实现 US6

- [X] T068 [US6] 实现系统状态 handler `GET /api/v1/system/status` in `backend/internal/api/handlers/system.go`
- [X] T069 [US6] 在 AI 服务层添加提供商可用性检查
- [X] T070 [US6] 实现主提供商失败时自动降级

### 前端实现 US6

- [X] T071 [P] [US6] 创建 AI 状态徽章组件 `frontend/src/components/AIStatus/AIStatusBadge.tsx`
- [X] T072 [US6] 创建配置引导页 `frontend/src/pages/Setup/Setup.tsx` (无 API Key 场景)
- [X] T073 [US6] 在应用头部/底部添加状态指示器

**Checkpoint**: User Story 6 完成 - 用户可查看 AI 服务配置状态

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 全局优化和收尾工作

- [X] T074 [P] 优化响应式设计 (移动端适配) - TailwindCSS 响应式类已应用
- [X] T075 [P] 添加无障碍改进 (ARIA 标签, 键盘导航)
- [X] T076 运行 quickstart.md 验证流程 (端到端测试)
- [X] T077 [P] 添加完善的中文错误提示信息
- [X] T078 性能优化: 详情页懒加载
- [X] T079 添加 favicon 和 meta 标签 `frontend/index.html`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-8)**: 依赖 Foundational 完成
  - 可并行开发（多人协作时）
  - 或按优先级顺序开发 (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: 依赖所需用户故事完成

### User Story Dependencies

- **US1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖 - **MVP**
- **US2 (P2)**: Foundational 完成后可开始 - 测试受益于 US1 但可独立测试
- **US3 (P3)**: Foundational 完成后可开始 - 集成受益于 US2 但可独立测试
- **US4 (P4)**: Foundational 完成后可开始 - 与 US1 推荐流程集成
- **US5 (P5)**: 依赖 US2（菜谱详情）和 US3（图片）完整功能
- **US6 (P6)**: Foundational 完成后可开始 - 独立状态显示

### Within Each User Story

- 后端先于前端（API 必须先存在）
- 服务先于 Handler
- Handler 先于前端集成
- 核心实现先于优化

### Parallel Opportunities

- Phase 1 所有标记 [P] 的任务可并行
- Phase 2 所有标记 [P] 的任务可并行
- Foundational 完成后，多个用户故事可并行开发
- 每个故事内标记 [P] 的前端组件可并行构建

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (**关键 - 阻塞所有故事**)
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试 User Story 1
5. 部署/演示 - 用户可获取应季推荐！

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 US1 → 独立测试 → 部署/演示 (**MVP!**)
3. 添加 US2 → 独立测试 → 用户可查看菜谱详情
4. 添加 US3 → 独立测试 → 用户可看到菜品图片
5. 添加 US4 → 独立测试 → 个性化推荐
6. 添加 US5 → 独立测试 → PDF 导出可用
7. 添加 US6 → 独立测试 → AI 服务透明化

### 单人开发推荐顺序

```
Phase 1 (Setup) → Phase 2 (Foundation) → US1 (MVP) → US2 → US3 → US4 → US5 → US6 → Polish
```

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签映射到 spec.md 中的用户故事
- 每个用户故事可独立完成和测试
- 每个任务完成后提交代码
- 在检查点停止验证功能
- 所有 AI 提示词必须使用中文（按规范要求）
- 图片使用 Base64 存储避免 URL 过期问题
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖
