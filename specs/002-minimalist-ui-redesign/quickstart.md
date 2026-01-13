# Quickstart: Minimalist UI Redesign

**Feature**: 002-minimalist-ui-redesign
**Date**: 2026-01-12

## 快速开始

本指南帮助开发者快速理解和实施 UI 重构。

---

## 1. 环境准备

```bash
# 进入前端目录
cd frontend

# 安装依赖（如尚未安装）
npm install

# 启动开发服务器
npm run dev
```

---

## 2. 核心文件修改清单

### 全局样式 (必须首先修改)

| 文件 | 修改内容 |
|------|----------|
| `src/index.css` | 添加 CSS 变量定义、字体栈配置 |

### 页面组件 (按优先级)

| 优先级 | 文件 | 修改内容 |
|--------|------|----------|
| P1 | `src/pages/Home/Home.tsx` | 背景色、间距、标题样式 |
| P1 | `src/components/RecipeCard/RecipeCard.tsx` | 卡片样式、悬停效果 |
| P1 | `src/components/Layout/Layout.tsx` | 页头页脚样式 |
| P2 | `src/pages/RecipeDetail/RecipeDetailPage.tsx` | 详情页布局、排版 |
| P2 | `src/components/RecipeDetail/*.tsx` | 食材列表、步骤样式 |
| P3 | `src/pages/Settings/Settings.tsx` | 表单样式、按钮样式 |
| P3 | `src/components/CityInput/CityInput.tsx` | 输入框样式 |

---

## 3. 样式变更示例

### 3.1 全局 CSS 变量 (index.css)

```css
@import "tailwindcss";

:root {
  /* 字体 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", "Noto Sans SC", sans-serif;
  line-height: 1.5;
  font-weight: 400;

  /* 背景色 */
  --color-bg-primary: #FAF7F4;
  --color-bg-secondary: #F5F0EB;

  /* 文字色 */
  --color-text-heading: #2D2D2D;
  --color-text-body: #666666;

  /* 强调色 */
  --color-accent: #8B9A7D;
  --color-accent-hover: #7A8A6D;
  --color-accent-light: #E8EDE4;

  /* 过渡 */
  --transition-duration: 250ms;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  color: var(--color-text-body);
}
```

### 3.2 页面背景变更

**Before (Home.tsx)**:
```tsx
<div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
```

**After**:
```tsx
<div className="min-h-screen bg-[#FAF7F4]">
```

### 3.3 标题样式变更

**Before**:
```tsx
<h1 className="text-3xl font-bold text-green-700">
```

**After**:
```tsx
<h1 className="text-3xl font-bold text-[#2D2D2D] tracking-tight">
```

### 3.4 卡片样式变更

**Before (RecipeCard.tsx)**:
```tsx
<article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
```

**After**:
```tsx
<article className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-[250ms] ease-out overflow-hidden">
```

### 3.5 按钮样式变更

**Before**:
```tsx
<button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
```

**After**:
```tsx
<button className="px-6 py-3 bg-[#8B9A7D] text-white rounded-lg hover:bg-[#7A8A6D] transition-all duration-[250ms] ease-out">
```

### 3.6 徽章样式变更

**Before**:
```tsx
<span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
```

**After**:
```tsx
<span className="px-3 py-1 bg-[#E8EDE4] text-[#6B7A5D] text-xs rounded-full">
```

---

## 4. 验证清单

完成每个组件修改后，验证以下项目：

### 视觉验证

- [ ] 背景色为暖色奶油色 (#FAF7F4)
- [ ] 标题文字为深炭灰色 (#2D2D2D)
- [ ] 正文文字为中灰色 (#666666)
- [ ] 强调色为柔和鼠尾草绿 (#8B9A7D)
- [ ] 卡片有微妙阴影效果
- [ ] 悬停时有平滑过渡动画

### 响应式验证

- [ ] 移动端 (< 640px) 单列布局
- [ ] 平板 (768px+) 双列布局
- [ ] 桌面 (1024px+) 三列布局

### 无障碍验证

- [ ] 文字对比度符合 WCAG AA 标准
- [ ] 焦点状态清晰可见
- [ ] 跳转链接功能正常

---

## 5. 常见问题

### Q: 如何快速测试颜色对比度？

使用浏览器开发者工具的 Accessibility 面板，或在线工具如 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)。

### Q: Tailwind 任意值语法 `[]` 会影响性能吗？

不会。Tailwind 4.x 在构建时会提取所有使用的值，生成优化的 CSS。

### Q: 如何保持样式一致性？

始终使用 CSS 变量引用颜色值，避免在组件中硬编码不同的颜色值。

---

## 6. 参考资源

- [设计令牌定义](./data-model.md)
- [研究文档](./research.md)
- [功能规格](./spec.md)
- [Tailwind CSS 4.x 文档](https://tailwindcss.com/docs)
