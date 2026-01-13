# Tasks: UX 问题修复与优化

**Feature**: 006-ux-fixes-optimization
**Branch**: `006-ux-fixes-optimization`
**Generated**: 2026-01-13
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Overview

本任务列表基于 4 个用户故事生成，按优先级和依赖关系排序：
- US1 (P1): 移除食材详情弹窗功能
- US2 (P1): 增强应季食材推荐的季节性与地方特色
- US3 (P1): 修复页面返回导航的参数保持
- US4 (P2): PDF 导出保持页面样式

---

## Phase 1: Setup

### Task 1.1: 安装前端新依赖

**User Story**: US4 - PDF 导出保持页面样式
**Priority**: P2 | **Estimate**: XS

**Description**:
安装 html2canvas 和 jspdf 依赖，用于前端 PDF 导出功能。

**Acceptance Criteria**:
- [x] html2canvas 已安装到 dependencies
- [x] jspdf 已安装到 dependencies
- [x] npm install 无报错
- [x] package.json 包含新依赖

**Implementation Notes**:
```bash
cd frontend
npm install html2canvas jspdf
```

**Files**:
- `frontend/package.json` (修改)

---

## Phase 2: US1 - 移除食材详情弹窗功能 (P1)

### Task 2.1: 移除 IngredientModal 组件目录

**User Story**: US1 - 移除食材详情弹窗功能
**Priority**: P1 | **Estimate**: XS

**Description**:
删除整个 IngredientModal 组件目录，包括所有相关文件。

**Acceptance Criteria**:
- [x] `frontend/src/components/IngredientModal/` 目录已完全删除
- [x] 无遗留的 import 语句引用该组件

**Files**:
- `frontend/src/components/IngredientModal/` (删除整个目录)

---

### Task 2.2: 移除 NewHome 页面中的弹窗状态和引用

**User Story**: US1 - 移除食材详情弹窗功能
**Priority**: P1 | **Estimate**: S
**Depends On**: Task 2.1

**Description**:
从 NewHome.tsx 中移除与 IngredientModal 相关的所有状态变量、import 语句和 JSX 渲染。

**Acceptance Criteria**:
- [x] 移除 IngredientModal 的 import 语句
- [x] 移除 modalVisible / selectedIngredient 等相关状态
- [x] 移除打开弹窗的 handler 函数
- [x] 移除 JSX 中的 `<IngredientModal />` 渲染
- [x] 页面正常渲染无报错

**Files**:
- `frontend/src/pages/NewHome/NewHome.tsx` (修改)

---

### Task 2.3: 移除 IngredientList 中的详情按钮

**User Story**: US1 - 移除食材详情弹窗功能
**Priority**: P1 | **Estimate**: S
**Depends On**: Task 2.2

**Description**:
从 IngredientList 组件中移除"了解更多"按钮及其点击事件。

**Acceptance Criteria**:
- [x] 移除"了解更多"按钮的 JSX
- [x] 移除 onViewDetail / onShowDetail 等 props 定义
- [x] 移除相关的 onClick handler
- [x] 食材卡片仍正常显示基本信息
- [x] 点击卡片不触发任何弹窗

**Files**:
- `frontend/src/components/IngredientList/IngredientList.tsx` (修改)

---

### Task 2.4: 移除前端 API 中的 getIngredientDetail 函数

**User Story**: US1 - 移除食材详情弹窗功能
**Priority**: P1 | **Estimate**: XS
**Depends On**: Task 2.3

**Description**:
从 api.ts 中移除 getIngredientDetail 函数及相关类型定义。

**Acceptance Criteria**:
- [x] 移除 getIngredientDetail 函数
- [x] 移除 GetIngredientDetailResponse 类型（如果独立定义）
- [x] 无编译错误

**Files**:
- `frontend/src/services/api.ts` (修改)
- `frontend/src/types/index.ts` (修改，如有相关类型)

---

### Task 2.5: 验证 US1 完成

**User Story**: US1 - 移除食材详情弹窗功能
**Priority**: P1 | **Estimate**: XS
**Depends On**: Task 2.4

**Description**:
运行前端开发服务器，验证弹窗功能已完全移除。

**Acceptance Criteria**:
- [x] npm run dev 无报错
- [x] 首页正常加载
- [x] 食材卡片无"了解更多"按钮
- [x] 点击食材卡片不弹出任何弹窗
- [x] 浏览器控制台无相关错误

**Verification**:
```bash
cd frontend && npm run dev
# 访问 http://localhost:5173
# 搜索城市，验证食材列表
```

---

## Phase 3: US2 - 增强应季食材推荐 (P1)

### Task 3.1: 优化 LLM 食材推荐提示词

**User Story**: US2 - 增强应季食材推荐的季节性与地方特色
**Priority**: P1 | **Estimate**: M

**Description**:
修改后端 ingredient service 中的 LLM 提示词，添加排除规则和地理特征引导。

**Acceptance Criteria**:
- [x] 提示词包含明确的排除清单（鸡蛋、牛奶、猪肉、牛肉等）
- [x] 提示词包含地理特征识别逻辑（沿海→海鲜，山区→山珍）
- [x] 提示词强调只推荐当月应季食材
- [x] 提示词要求食材必须合法、安全、可食用

**Implementation Notes**:
参考 research.md 中的提示词结构：
```text
## 核心要求
1. 必须排除全年供应的常见食材：鸡蛋、牛奶、猪肉、牛肉、羊肉、鸡肉、豆腐、大米、面粉等
2. 只推荐当月应季的时令食材
3. 根据城市地理特征调整推荐：
   - 沿海城市：优先推荐当季海鲜
   - 山区城市：推荐山珍、菌菇、野菜
   - 平原城市：推荐时令蔬菜水果

## 排除清单
以下食材不得出现在推荐列表中：
- 蛋类：鸡蛋、鸭蛋、鹌鹑蛋
- 奶类：牛奶、酸奶、奶酪
- 常规肉类：猪肉、牛肉、羊肉、鸡肉
- 主食原料：大米、小麦、面粉
- 常年蔬菜：土豆、洋葱、胡萝卜、白菜
```

**Files**:
- `backend/internal/services/ingredient/service.go` (修改)

---

### Task 3.2: 验证 US2 完成

**User Story**: US2 - 增强应季食材推荐的季节性与地方特色
**Priority**: P1 | **Estimate**: S
**Depends On**: Task 3.1

**Description**:
重启后端服务，清除缓存，验证食材推荐结果符合要求。

**Acceptance Criteria**:
- [x] 沿海城市（青岛/厦门）推荐中有明显海鲜食材
- [x] 山区城市（贵阳/昆明）推荐中有山珍/菌菇类
- [x] 推荐结果中不包含鸡蛋、猪肉、牛奶等常见食材
- [x] 每种食材有季节性说明

**Verification**:
```bash
# 清除缓存
rm backend/data/cache.db*

# 重启后端
cd backend && go run cmd/server/main.go

# 测试沿海城市
curl "http://localhost:8080/api/v1/ingredients?city=青岛"

# 测试山区城市
curl "http://localhost:8080/api/v1/ingredients?city=贵阳"
```

---

## Phase 4: US3 - 修复页面返回导航 (P1)

### Task 4.1: 修改菜谱列表页导航到详情页时携带来源信息

**User Story**: US3 - 修复页面返回导航的参数保持
**Priority**: P1 | **Estimate**: S

**Description**:
在 RecipeListPage 跳转到详情页时，通过 location.state 传递来源 URL。

**Acceptance Criteria**:
- [x] 点击菜谱卡片时，navigate 携带 state.from 参数
- [x] state.from 包含当前页面的完整 URL（pathname + search）
- [x] 导航正常工作

**Implementation Notes**:
```typescript
// 跳转时携带来源信息
const handleRecipeClick = (recipeId: string) => {
  navigate(`/recipe/${recipeId}`, {
    state: { from: location.pathname + location.search }
  });
};
```

**Files**:
- `frontend/src/pages/RecipeListPage/RecipeListPage.tsx` (修改)

---

### Task 4.2: 修改菜谱详情页的返回按钮逻辑

**User Story**: US3 - 修复页面返回导航的参数保持
**Priority**: P1 | **Estimate**: S
**Depends On**: Task 4.1

**Description**:
在 NewRecipeDetailPage 的返回按钮中，使用 location.state.from 进行导航。

**Acceptance Criteria**:
- [x] 返回按钮读取 location.state.from
- [x] 如果 from 存在，导航到该 URL
- [x] 如果 from 不存在，默认返回 /recipes
- [x] 返回后 URL 参数完整保留

**Implementation Notes**:
```typescript
const location = useLocation();

const handleBack = () => {
  const from = (location.state as NavigationState)?.from || '/recipes';
  navigate(from);
};
```

**Files**:
- `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx` (修改)

---

### Task 4.3: 验证 US3 完成

**User Story**: US3 - 修复页面返回导航的参数保持
**Priority**: P1 | **Estimate**: XS
**Depends On**: Task 4.2

**Description**:
完整测试导航流程，验证参数保持和缓存命中。

**Acceptance Criteria**:
- [x] 首页 → 选择食材 → 菜谱列表 → 详情页 → 返回，URL 参数完整
- [x] 返回时不触发新的 API 请求（通过 Network 面板验证）
- [x] 连续快速点击返回无异常

**Verification**:
```
1. 访问首页，搜索城市
2. 选择食材，进入菜谱列表
3. 记录 URL: /recipes?ingredients=番茄,黄瓜&location=上海
4. 点击菜谱进入详情页
5. 点击返回按钮
6. 验证 URL 与步骤 3 一致
7. 观察 Network 面板，确认无新请求
```

---

## Phase 5: US4 - PDF 导出保持页面样式 (P2)

### Task 5.1: 创建 PDF 导出工具函数

**User Story**: US4 - PDF 导出保持页面样式
**Priority**: P2 | **Estimate**: M
**Depends On**: Task 1.1

**Description**:
创建 `frontend/src/utils/pdfExport.ts`，实现 html2canvas + jsPDF 的 PDF 导出功能。

**Acceptance Criteria**:
- [x] exportElementToPDF 函数正确实现
- [x] 支持将 DOM 元素渲染为 PDF
- [x] 支持多页内容自动分页
- [x] 支持跨域图片（useCORS: true）
- [x] 导出的 PDF 使用 A4 纸张格式
- [x] TypeScript 类型正确

**Implementation Notes**:
参考 research.md 中的实现代码：
```typescript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PDFExportOptions {
  scale?: number;
  useCORS?: boolean;
  backgroundColor?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export async function exportElementToPDF(
  element: HTMLElement,
  filename: string,
  options?: PDFExportOptions
): Promise<void> {
  const { scale = 2, useCORS = true, backgroundColor = '#FFFFFF' } = options || {};

  const canvas = await html2canvas(element, {
    scale,
    useCORS,
    logging: false,
    backgroundColor,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = pdfHeight;
  let position = 0;
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}
```

**Files**:
- `frontend/src/utils/pdfExport.ts` (新建)

---

### Task 5.2: 移除前端 API 中的 downloadRecipePdf 函数

**User Story**: US4 - PDF 导出保持页面样式
**Priority**: P2 | **Estimate**: XS

**Description**:
从 api.ts 中移除后端 PDF 下载函数，改用前端直接生成。

**Acceptance Criteria**:
- [x] 移除 downloadRecipePdf 函数
- [x] 无编译错误

**Files**:
- `frontend/src/services/api.ts` (修改)

---

### Task 5.3: 修改菜谱详情页的 PDF 导出逻辑

**User Story**: US4 - PDF 导出保持页面样式
**Priority**: P2 | **Estimate**: M
**Depends On**: Task 5.1, Task 5.2

**Description**:
修改 NewRecipeDetailPage 中的 PDF 导出按钮，改用前端 exportElementToPDF 函数。

**Acceptance Criteria**:
- [x] 导入 exportElementToPDF 函数
- [x] 为需要导出的内容区域添加 ref
- [x] 修改导出按钮的 onClick handler
- [x] 导出时显示 loading 状态
- [x] 导出完成后显示成功提示
- [x] 导出失败时显示错误提示

**Implementation Notes**:
```typescript
import { exportElementToPDF } from '../../utils/pdfExport';

const contentRef = useRef<HTMLDivElement>(null);
const [exporting, setExporting] = useState(false);

const handleExportPDF = async () => {
  if (!contentRef.current) return;

  setExporting(true);
  try {
    await exportElementToPDF(contentRef.current, `recipe-${recipe.name}`);
    message.success('PDF 导出成功');
  } catch (error) {
    message.error('PDF 导出失败');
    console.error(error);
  } finally {
    setExporting(false);
  }
};

// JSX
<div ref={contentRef}>
  {/* 菜谱内容 */}
</div>
<Button onClick={handleExportPDF} loading={exporting}>
  导出 PDF
</Button>
```

**Files**:
- `frontend/src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx` (修改)

---

### Task 5.4: 验证 US4 完成

**User Story**: US4 - PDF 导出保持页面样式
**Priority**: P2 | **Estimate**: S
**Depends On**: Task 5.3

**Description**:
测试 PDF 导出功能，验证样式保持完整。

**Acceptance Criteria**:
- [x] 点击导出按钮后 PDF 正确下载
- [x] PDF 样式与网页一致（所见即所得）
- [x] PDF 包含图片、图标、标签样式
- [x] PDF 配色为珊瑚橙粉系
- [x] 中文内容正确显示
- [x] 长内容正确分页

**Verification**:
```
1. 进入任意菜谱详情页
2. 等待页面完全加载（包括图片）
3. 点击"导出 PDF"按钮
4. 等待生成完成
5. 打开下载的 PDF
6. 对比 PDF 与网页样式
```

---

## Phase 6: Cleanup & Final Verification

### Task 6.1: 移除后端 PDF 生成接口（可选）

**User Story**: US4 - PDF 导出保持页面样式
**Priority**: P2 | **Estimate**: S

**Description**:
PDF 导出已迁移到前端，后端 PDF 相关代码可选择移除以简化架构。

**Acceptance Criteria**:
- [x] 移除 pdf handler（如果存在）- 已决定保留，前端已迁移
- [x] 移除 pdf service（如果存在）- 已决定保留，避免影响其他功能
- [x] 后端编译无错误

**Note**: 此任务为可选，可根据实际情况决定是否执行。

**Files**:
- `backend/internal/api/handlers/pdf.go` (移除，如存在)
- `backend/internal/services/pdf/` (移除，如存在)

---

### Task 6.2: 最终集成验证

**User Story**: All
**Priority**: P1 | **Estimate**: S
**Depends On**: Task 2.5, Task 3.2, Task 4.3, Task 5.4

**Description**:
完整运行前后端，验证所有功能正常工作。

**Acceptance Criteria**:
- [x] 前端 `npm run dev` 无报错
- [x] 后端 `go run cmd/server/main.go` 无报错
- [x] US1: 食材卡片无详情按钮，无弹窗
- [x] US2: 食材推荐无常见食材，体现地方特色
- [x] US3: 返回导航参数完整，缓存命中
- [x] US4: PDF 导出样式与网页一致

**Verification Checklist**:
参考 quickstart.md 中的验证步骤。

---

## Summary

| Phase | Tasks | User Story | Priority |
|-------|-------|------------|----------|
| 1 | 1 | US4 Setup | P2 |
| 2 | 5 | US1 移除弹窗 | P1 |
| 3 | 2 | US2 食材推荐 | P1 |
| 4 | 3 | US3 返回导航 | P1 |
| 5 | 4 | US4 PDF 导出 | P2 |
| 6 | 2 | Cleanup | - |

**Total Tasks**: 17
**Critical Path**: Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

**Recommended Order**: 先完成所有 P1 任务（US1→US2→US3），再完成 P2 任务（US4）。
