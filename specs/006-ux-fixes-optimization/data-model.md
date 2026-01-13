# Data Model: UX 问题修复与优化

**Feature**: 006-ux-fixes-optimization
**Date**: 2026-01-13
**Updated**: 2026-01-13 (PDF 方案重构)

## Overview

本功能主要涉及配置和状态数据的变更，不涉及新的持久化实体。以下记录受影响的数据结构。

## Entities

### 1. NavigationState (新增 - 前端状态)

用于在页面导航时保持查询参数和来源信息。

| Field | Type | Description |
|-------|------|-------------|
| from | string | 来源页面的完整 URL (pathname + search) |
| timestamp | number | 导航发生的时间戳 |

**Usage**: 通过 React Router 的 `location.state` 传递

**Example**:
```typescript
interface NavigationState {
  from?: string;      // 例如 "/recipes?ingredients=番茄,黄瓜&location=上海"
  timestamp?: number; // 可选，用于判断状态是否过期
}
```

---

### 2. IngredientPromptConfig (修改 - 后端配置)

LLM 提示词配置，增强季节性和地方特色要求。

| Field | Type | Description |
|-------|------|-------------|
| excludedCategories | []string | 排除的食材类别 |
| excludedItems | []string | 排除的具体食材 |
| geoFeatures | map[string][]string | 地理特征到推荐食材类型的映射 |

**New Values**:
```go
excludedCategories: ["蛋奶", "常规肉类", "主食原料"]

excludedItems: [
  "鸡蛋", "鸭蛋", "鹌鹑蛋",
  "牛奶", "酸奶", "奶酪",
  "猪肉", "牛肉", "羊肉", "鸡肉",
  "大米", "小麦", "面粉",
  "土豆", "洋葱", "胡萝卜", "白菜"
]

geoFeatures: {
  "沿海": ["当季海鲜", "海产品"],
  "山区": ["山珍", "菌菇", "野菜"],
  "平原": ["时令蔬菜", "应季水果"]
}
```

---

### 3. PDFExportOptions (新增 - 前端配置) ⚡ 新方案

前端 HTML 转 PDF 导出配置。

| Field | Type | Description |
|-------|------|-------------|
| scale | number | 渲染缩放比例，默认 2（高清） |
| useCORS | boolean | 是否启用跨域图片支持，默认 true |
| backgroundColor | string | 背景色，默认 '#FFFFFF' |
| format | 'a4' \| 'letter' | PDF 纸张格式，默认 'a4' |
| orientation | 'portrait' \| 'landscape' | 纸张方向，默认 'portrait' |

**Example**:
```typescript
interface PDFExportOptions {
  scale?: number;           // 渲染质量，2 = 高清
  useCORS?: boolean;        // 跨域图片支持
  backgroundColor?: string; // 背景色
  format?: 'a4' | 'letter'; // 纸张格式
  orientation?: 'portrait' | 'landscape';
}

// 默认配置
const defaultOptions: PDFExportOptions = {
  scale: 2,
  useCORS: true,
  backgroundColor: '#FFFFFF',
  format: 'a4',
  orientation: 'portrait',
};
```

---

## Removed Entities

### IngredientDetail (前端移除)

以下类型/接口将从前端代码中移除：

```typescript
// 移除: frontend/src/types/index.ts
interface IngredientDetail {
  seasonReason: string;
  nutrition: string;
  selectionTips: string;
  storageTips: string;
}

// 移除: frontend/src/services/api.ts
function getIngredientDetail(ingredientId: string): Promise<GetIngredientDetailResponse>
```

**Note**: 后端接口 `/api/v1/ingredients/:id/detail` 暂时保留，不做移除。

---

### PDFStyleConfig (后端移除) ⚡ 方案变更

后端 PDF 生成功能将被移除，以下配置不再需要：

```go
// 移除: backend/internal/services/pdf/generator.go
// PDF 生成已迁移到前端
type PDFColors struct { ... }  // 不再使用
```

**Reason**: PDF 导出改为前端 html2canvas + jsPDF 方案，直接渲染页面 HTML 为 PDF，无需后端参与。

---

### downloadRecipePdf (前端 API 函数移除)

```typescript
// 移除: frontend/src/services/api.ts
function downloadRecipePdf(recipeId: string, includeImage: boolean, imageUrl?: string): Promise<Blob>
```

**Replaced by**: `frontend/src/utils/pdfExport.ts` 中的 `exportElementToPDF` 函数

---

## State Transitions

本功能不涉及实体状态转换。

---

## Validation Rules

### NavigationState
- `from` 必须是有效的相对 URL 路径
- 如果 `from` 为空或无效，默认返回 `/recipes` 或 `/`

### IngredientPromptConfig
- `excludedItems` 列表不得为空
- 食材名称使用简体中文

### PDFExportOptions
- `scale` 必须在 1-4 范围内（1 = 标清，2 = 高清，4 = 超清）
- `backgroundColor` 必须是有效的 CSS 颜色值

---

## Relationships

```
NavigationState ──用于── NewRecipeDetailPage
                  ──用于── RecipeListPage

IngredientPromptConfig ──配置── ingredient/service.go

PDFExportOptions ──配置── utils/pdfExport.ts
                   ──使用── NewRecipeDetailPage
```
