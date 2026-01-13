# Quickstart: 活泼年轻风沉浸式 UI 重设计

**Feature**: 005-page-ui-redesign
**Date**: 2026-01-13

## 快速开始

### 1. 环境准备

```bash
# 确保在正确的分支
git checkout 005-page-ui-redesign

# 安装依赖（如有更新）
cd frontend && npm install
```

### 2. 开发服务器

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 3. 关键入口点

| 页面 | 路由 | 文件 |
|------|------|------|
| 首页 | `/` | `src/pages/NewHome/NewHome.tsx` |
| 菜谱列表 | `/recipes` | `src/pages/RecipeListPage/RecipeListPage.tsx` |
| 菜谱详情 | `/recipe/:id` | `src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx` |
| 设置 | `/settings` | `src/pages/Settings/Settings.tsx` |

---

## 开发顺序建议

### Phase 1: 主题系统 (基础)
```
1. src/theme/tokens/colors.ts     # 定义色彩 token
2. src/theme/tokens/motion.ts     # 定义动画 token
3. src/theme/index.ts             # 更新 Ant Design 主题配置
4. src/styles/animations.css      # 全局动画样式
5. src/hooks/useReducedMotion.ts  # 动画降级 hook
```

### Phase 2: 布局组件
```
1. src/components/Layout/Layout.tsx  # 新导航设计
2. src/pages/NewHome/NewHome.tsx     # 沉浸式首页
```

### Phase 3: 交互组件
```
1. src/components/CityInput/CityInput.tsx
2. src/components/IngredientList/IngredientList.tsx
3. src/components/IngredientModal/IngredientModal.tsx
```

### Phase 4: 菜谱页面
```
1. src/components/RecipeCard/RecipeCard.tsx
2. src/pages/RecipeListPage/RecipeListPage.tsx
3. src/pages/NewRecipeDetail/NewRecipeDetailPage.tsx
```

---

## 色彩参考

### 主色调
```css
--color-primary: #FF6B6B;      /* 活力珊瑚红 */
--color-secondary: #FFA07A;    /* 温暖橙粉 */
--color-accent: #FFE66D;       /* 明亮柠檬黄 */
```

### 背景色
```css
--color-bg-warm: #FFFAF0;      /* 暖白 */
--color-bg-pink: #FFF5F5;      /* 淡粉 */
```

### 文字色
```css
--color-text-primary: #2D3436;   /* 深灰黑 */
--color-text-secondary: #6C757D; /* 中灰 */
```

---

## 动画测试

### 检查动画降级
1. 打开系统设置 → 辅助功能 → 显示
2. 开启"减少动态效果"
3. 刷新页面，验证动画是否降级

### Chrome DevTools 测试
```javascript
// 模拟 prefers-reduced-motion
// Elements → Styles → :hov → Rendering → Emulate CSS media feature
// 选择 prefers-reduced-motion: reduce
```

---

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 类型检查
tsc --noEmit

# 代码检查
npm run lint
```

---

## 相关文档

- [规范文档](./spec.md) - 功能需求
- [研究文档](./research.md) - 技术决策
- [设计模型](./data-model.md) - 组件设计
