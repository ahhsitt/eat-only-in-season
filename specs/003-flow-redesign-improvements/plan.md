# Implementation Plan: 应用流程重构与功能增强

**Branch**: `003-flow-redesign-improvements` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-flow-redesign-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本次需求重构应用核心流程：将原有"城市→菜谱"流程改为"城市→应季食材列表→勾选食材→菜谱推荐"。同时引入双层缓存架构（内存LRU + SQLite持久化）、优化图片生成提示词精准度、改进PDF导出样式、移除旧版流程代码。

## Technical Context

**Language/Version**:
- Frontend: TypeScript ~5.9.3, React 19.2.0
- Backend: Go 1.24.0

**Primary Dependencies**:
- Frontend: Tailwind CSS 4.1.18, Vite 7.2.4, React Router DOM 7.11.0, Axios 1.13.2
- Backend: Gin 1.11.0, helloagents-go 0.1.2, jellydator/ttlcache/v3 3.3.0, signintech/gopdf 0.34.0

**Storage**:
- 现有: 内存TTL缓存 (jellydator/ttlcache)
- 新增: SQLite持久化缓存 (需引入 modernc.org/sqlite 或 mattn/go-sqlite3)
- 前端: localStorage (用户偏好设置)

**Testing**: Go test (backend), Vitest (frontend - 待配置)

**Target Platform**: Web application (现代浏览器, 支持localStorage)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- 城市查询到食材列表展示: <3秒
- 内存缓存命中响应时间减少: 95%
- SQLite缓存命中响应时间减少: 80%
- 用户交互反馈: <100ms

**Constraints**:
- 图片与菜品匹配准确率: >90%
- PDF导出成功率: >98%
- 所有输出必须为中文
- 服务重启后缓存恢复成功率: >99%

**Scale/Scope**: 单用户应用, 8个核心页面/流程

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 一、高品质代码 ✅
- [x] 代码遵循Go/TypeScript社区标准规范
- [x] 公共接口有明确的契约定义 (OpenAPI contracts)
- [x] 错误处理完善 (API错误码、前端错误边界、AI服务不可用时完全阻断)
- [x] 日志记录支持调试 (Gin中间件已配置)

### 二、可测试性 ✅
- [x] 功能模块可独立测试 (服务层分离、缓存层抽象)
- [x] 核心业务逻辑有清晰的输入输出定义
- [x] 测试用例描述预期行为 (spec.md Acceptance Scenarios)

### 三、最小可行产品 (MVP) ✅
- [x] 功能按P1/P2/P3优先级分阶段交付
- [x] 每个User Story可独立交付价值
- [x] 功能范围聚焦于核心用户需求

### 四、避免过度设计 ✅ (需注意)
- [x] 不为假设的未来需求添加功能
- [x] 双层缓存架构有明确的业务理由 (服务重启恢复数据、热点数据快速访问)
- [ ] ⚠️ 注意: 配置项应限于必要参数（缓存TTL、清理间隔），避免过度配置化

**Gate Status**: ✅ PASS - 可进入Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-flow-redesign-improvements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── server/main.go           # 入口点, Gin服务启动
├── internal/
│   ├── api/
│   │   ├── handlers/            # HTTP请求处理器
│   │   │   ├── ingredient.go    # 应季食材处理器
│   │   │   ├── new_recipe.go    # 新流程菜谱处理器
│   │   │   ├── pdf.go           # PDF导出处理器
│   │   │   └── image.go         # 图片处理器
│   │   ├── middleware/          # CORS, 错误处理, 日志
│   │   └── router.go            # 路由配置
│   ├── cache/
│   │   ├── cache.go             # 缓存管理器 (现有TTL缓存)
│   │   ├── lru.go               # [NEW] 内存LRU缓存实现
│   │   └── sqlite.go            # [NEW] SQLite持久化缓存实现
│   ├── models/
│   │   └── models.go            # 数据模型定义
│   └── services/
│       ├── ai/
│       │   ├── imagegen/
│       │   │   └── imagegen.go  # 图片生成服务 (需优化提示词)
│       │   └── llm/
│       │       └── llm.go
│       ├── ingredient/
│       │   └── service.go       # 应季食材服务
│       ├── pdf/
│       │   └── generator.go     # PDF生成器 (需改进样式)
│       └── recipe/
│           └── service.go       # 菜谱推荐服务
├── pkg/
│   └── config/
│       └── config.go            # 环境变量配置
├── go.mod
└── .env

frontend/
├── src/
│   ├── components/
│   │   ├── CityInput/           # 城市输入组件
│   │   ├── IngredientList/      # 食材列表组件
│   │   ├── IngredientModal/     # 食材详情弹窗
│   │   ├── RecipeList/          # 菜谱列表组件
│   │   ���── RecipeDetail/        # 菜谱详情子组件
│   │   ├── PDFExport/           # PDF导出组件
│   │   └── PreferenceForm/      # 偏好设置表单
│   ├── pages/
│   │   ├── NewHome/             # 新流程首页 (城市+偏好+食材)
│   │   ├── RecipeListPage/      # 菜谱选择页
│   │   ├── NewRecipeDetail/     # 菜谱详情页
│   │   ├── Home/                # [DELETE] 旧流程首页
│   │   └── RecipeDetail/        # [DELETE] 旧流程详情页
│   ├── services/
│   │   └── api.ts               # API客户端
│   ├── types/
│   │   └── index.ts             # TypeScript类型定义
│   ├── hooks/
│   │   └── useLocalStorage.ts   # localStorage Hook
│   └── App.tsx                  # 路由配置 (需移除/old路由)
├── tests/                       # [NEW] 测试目录
└── package.json
```

**Structure Decision**: 采用现有的Web应用架构 (frontend + backend 分离)，在现有目录结构上扩展，不引入新的顶层目录。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 双层缓存架构 (LRU + SQLite) | 1. 服务重启后数据可从SQLite恢复 2. 热点数据在内存中快速访问 3. 减少AI调用成本 | 单层内存缓存: 服务重启数据丢失，需重新调用AI; 单层SQLite: 每次读取需磁盘IO，响应慢 |
| 配置化缓存参数 | 不同环境(dev/prod)可能需要不同的TTL和清理间隔 | 硬编码配置: 无法灵活调整，需重新部署才能修改参数 |

---

**Note**: 本计划将在 Phase 0 生成 research.md，Phase 1 生成 data-model.md、contracts/ 和 quickstart.md。

---

## Constitution Check (Post-Design Re-evaluation)

*Re-checked after Phase 1 design completion.*

### 一、高品质代码 ✅
- [x] 代码遵循Go/TypeScript社区标准规范
- [x] 公共接口有明确的契约定义 → **已生成 OpenAPI spec** (`contracts/openapi.yaml`)
- [x] 错误处理完善 → **定义了 ServiceUnavailableError 响应结构**
- [x] 日志记录支持调试

### 二、可测试性 ✅
- [x] 功能模块可独立测试 → **缓存层抽象为 CacheManager，可注入mock**
- [x] 核心业务逻辑有清晰的输入输出定义 → **data-model.md 完整定义**
- [x] 测试用例描述预期行为 → **quickstart.md 包含测试验证命令**

### 三、最小可行产品 (MVP) ✅
- [x] 功能按P1/P2/P3优先级分阶段交付 → **spec.md 已定义优先级**
- [x] 每个User Story可独立交付价值
- [x] 功能范围聚焦于核心用户需求 → **8个User Story，无冗余功能**

### 四、避免过度设计 ✅
- [x] 不为假设的未来需求添加功能
- [x] 双层缓存架构有明确的业务理由 → **Complexity Tracking 已记录**
- [x] 配置项限于必要参数 → **仅5个缓存配置项，全部有默认值**
- [x] 无抽象工厂、策略模式等过度抽象 → **直接实现，简洁明了**

**Post-Design Gate Status**: ✅ PASS - 设计符合宪法原则，可进入实现阶段

---

## Generated Artifacts Summary

| Artifact | Path | Status |
|----------|------|--------|
| Implementation Plan | `specs/003-flow-redesign-improvements/plan.md` | ✅ Complete |
| Research | `specs/003-flow-redesign-improvements/research.md` | ✅ Complete |
| Data Model | `specs/003-flow-redesign-improvements/data-model.md` | ✅ Complete |
| API Contracts | `specs/003-flow-redesign-improvements/contracts/openapi.yaml` | ✅ Complete |
| Quickstart Guide | `specs/003-flow-redesign-improvements/quickstart.md` | ✅ Complete |
| Tasks | `specs/003-flow-redesign-improvements/tasks.md` | ✅ Complete |
