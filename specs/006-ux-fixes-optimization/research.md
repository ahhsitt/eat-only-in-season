# Research: UX 问题修复与优化

**Feature**: 006-ux-fixes-optimization
**Date**: 2026-01-13
**Updated**: 2026-01-13 (PDF 方案重构)

## Research Topics

### 1. React Router 导航参数保持策略

**问题**: 菜谱详情页返回菜谱列表时，URL 参数丢失导致缓存未命中。

**研究结果**:

**Decision**: 使用 `useNavigate` 配合 `useLocation` 保存和恢复查询参数

**Rationale**:
- React Router DOM 7.x 提供了完整的 location 状态管理
- `useSearchParams` 可以在导航时传递完整参数
- 通过 `navigate(-1)` 使用浏览器历史可自动保持参数，但不可靠
- 推荐方案：在进入详情页时保存来源 URL，返回时使用保存的 URL

**实现方案**:
```typescript
// 方案 A: 使用 location.state 传递来源信息
navigate(`/recipe/${id}`, { state: { from: location.pathname + location.search } });

// 返回时
const location = useLocation();
const handleBack = () => {
  const from = location.state?.from || '/recipes';
  navigate(from);
};
```

**Alternatives considered**:
- 浏览器 history.back(): 不可控，可能返回错误页面
- URL 参数编码传递: 过于复杂，URL 过长
- 全局状态管理 (Zustand/Redux): 过度设计

---

### 2. LLM 提示词优化 - 地方特色食材推荐

**问题**: 当前提示词未强调季节性和地方特色，导致推荐常见的全年供应食材。

**研究结果**:

**Decision**: 增强提示词，明确排除规则和地理特征引导

**Rationale**:
- LLM 需要明确的指令来排除特定食材类别
- 地理特征描述有助于 LLM 理解地域饮食特点
- 示例列表可提高输出一致性

**优化后的提示词结构**:
```text
## 核心要求
1. 必须排除全年供应的常见食材：鸡蛋、牛奶、猪肉、牛肉、羊肉、鸡肉、豆腐、大米、面粉等
2. 只推荐当月应季的时令食材
3. 根据城市地理特征调整推荐：
   - 沿海城市（青岛、厦门、大连等）：优先推荐当季海鲜
   - 山区城市（贵阳、昆明、张家界等）：推荐山珍、菌菇、野菜
   - 平原城市：推荐时令蔬菜水果
4. 推荐的食材必须合法、安全、可食用

## 排除清单
以下食材不得出现在推荐列表中：
- 蛋类：鸡蛋、鸭蛋、鹌鹑蛋
- 奶类：牛奶、酸奶、奶酪
- 常规肉类：猪肉、牛肉、羊肉、鸡肉
- 主食原料：大米、小麦、面粉
- 常年蔬菜：土豆、洋葱、胡萝卜、白菜
```

**Alternatives considered**:
- 后处理过滤: 浪费 LLM 调用，体验差
- 数据库预设食材: 缺乏灵活性，无法适应不同城市

---

### 3. PDF 导出方案 - 前端 HTML 转 PDF ⚡ 重大变更

**问题**: 用户要求 PDF 导出完全保持页面样式，包括图标、表格等，不仅仅是改配色。

**研究结果**:

**Decision**: 使用前端 html2canvas + jsPDF 方案，直接将页面渲染为 PDF

**Rationale**:
- 完全保持页面样式，所见即所得
- 无需后端参与，简化架构
- 成熟的库组合，社区广泛使用
- html2canvas 支持大部分 CSS 样式
- jsPDF 处理最终的 PDF 生成

**技术方案对比**:

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **html2canvas + jsPDF** | 所见即所得、成熟稳定、无需服务器 | 文字变图片不可选中、部分 CSS 不支持 | ⭐⭐⭐⭐⭐ |
| react-to-pdf | 封装好、React 友好 | 底层仍是 html2canvas + jsPDF | ⭐⭐⭐⭐ |
| @react-pdf/renderer | 原生 PDF 渲染、文字可选中 | 需要重写组件为 PDF 专用 | ⭐⭐ |
| 后端 gopdf | 可控性强、文字可选中 | 无法完全复制前端样式 | ⭐⭐ |
| puppeteer (服务端) | 完美渲染、文字可选中 | 需要服务器、资源消耗大 | ⭐⭐⭐ |

**实现方案**:
```typescript
// frontend/src/utils/pdfExport.ts
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportElementToPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // 1. 将 DOM 元素渲染为 canvas
  const canvas = await html2canvas(element, {
    scale: 2, // 高清
    useCORS: true, // 支持跨域图片
    logging: false,
    backgroundColor: '#FFFFFF',
  });

  // 2. 转换为图片
  const imgData = canvas.toDataURL('image/png');

  // 3. 计算 PDF 尺寸 (A4)
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  // 4. 添加图片到 PDF (支持多页)
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

  // 5. 下载
  pdf.save(`${filename}.pdf`);
}
```

**依赖安装**:
```bash
cd frontend
npm install html2canvas jspdf
npm install -D @types/html2canvas
```

**注意事项**:
1. 跨域图片需要 CORS 支持或使用 base64
2. 某些 CSS 属性不支持（如 `backdrop-filter`）
3. 生成的 PDF 是图片格式，文字不可选中/搜索
4. 大页面可能需要分页处理

**Alternatives considered**:
- 后端 gopdf 优化配色: 无法完全复制前端样式，用户明确要求保持一致
- @react-pdf/renderer: 需要重写所有 UI 组件，工作量大
- puppeteer 服务端渲染: 需要额外服务器资源，过度设计

**Sources**:
- [JS PDF Generation Libraries Comparison](https://dmitriiboikov.com/posts/2025/01/pdf-generation-comarison/)
- [Generate PDFs from HTML in React with jsPDF](https://www.nutrient.io/blog/how-to-convert-html-to-pdf-using-react/)
- [6 Open-Source PDF Libraries for React 2025](https://dev.to/ansonch/6-open-source-pdf-generation-and-modification-libraries-every-react-dev-should-know-in-2025-13g0)

---

### 4. 组件移除策略 - IngredientModal

**问题**: 食材详情弹窗接口报错，需要完整移除该功能。

**研究结果**:

**Decision**: 彻底移除相关组件和 API 调用

**Rationale**:
- 修复接口不如直接移除功能成本低
- 食材卡片的简短介绍已提供足够信息
- 减少代码复杂度和维护负担

**移除清单**:
1. `frontend/src/components/IngredientModal/` - 整个目录
2. `frontend/src/pages/NewHome/NewHome.tsx` - 移除弹窗状态和引用
3. `frontend/src/components/IngredientList/IngredientList.tsx` - 移除详情按钮
4. `frontend/src/services/api.ts` - 移除 `getIngredientDetail` 函数
5. `frontend/src/types/index.ts` - 移除相关类型定义（如果独立）

**后端保留决定**: 暂时保留后端 `/ingredients/:id/detail` 接口，避免 API 变更影响。

**Alternatives considered**:
- 修复接口参数传递: 需要修改多处代码，收益低
- 保留弹窗但禁用: 代码残留，不符合简洁原则

---

## Summary

| 主题 | 决策 | 影响范围 | 变更类型 |
|------|------|----------|----------|
| 导航参数保持 | 使用 location.state | 前端页面组件 | 修改 |
| 食材推荐优化 | 增强 LLM 提示词 | 后端 service.go | 修改 |
| PDF 导出 | **前端 html2canvas + jsPDF** | 前端新增 utils，后端移除 PDF 接口 | **重构** |
| 弹窗移除 | 彻底删除组件 | 前端多个文件 | 删除 |

**架构变更说明**:
- PDF 生成从后端迁移到前端，彻底移除后端 PDF 相关代码
- 新增前端 `utils/pdfExport.ts` 工具函数
- 新增前端依赖: `html2canvas`, `jspdf`

所有研究主题已完成，无需进一步澄清，可进入 Phase 1。
