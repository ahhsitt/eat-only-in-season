# Research: 活泼年轻风沉浸式 UI 重设计

**Feature**: 005-page-ui-redesign
**Date**: 2026-01-13

## 1. 珊瑚橙粉色系主题方案

### Decision
采用珊瑚橙粉色系作为新的品牌主色调，具体色值方案：

- **主色 (Primary)**: `#FF6B6B` (活力珊瑚红)
- **次要色 (Secondary)**: `#FFA07A` (温暖橙粉)
- **强调色 (Accent)**: `#FFE66D` (明亮柠檬黄)
- **背景色**: `#FFF5F5` (淡粉白) / `#FFFAF0` (暖白)
- **成功色**: `#4ECDC4` (清新青绿)
- **文字色**: `#2D3436` (深灰黑)

### Rationale
- 珊瑚橙粉系与食物、烹饪主题有天然关联（食材的温暖色调）
- 明亮活泼的色彩符合年轻用户群体审美偏好
- 与当前鼠尾草绿形成鲜明对比，实现风格转变
- 色彩心理学上，暖色调能激发食欲和愉悦感

### Alternatives Considered
- **明亮黄绿系**: 清新但与食物关联度较低
- **天蓝紫色系**: 现代感强但偏冷，不适合烹饪主题
- **多彩渐变系**: 视觉冲击力强但品牌辨识度分散

---

## 2. 动画效果实现方案

### Decision
使用 CSS 原生动画 + Ant Design Motion 组件的混合方案：

1. **CSS Transitions**: 用于基础交互（悬停、点击反馈）
2. **CSS @keyframes**: 用于页面入场动画、加载动画
3. **Ant Design Motion**: 用于弹窗、抽屉等组件动画
4. **prefers-reduced-motion**: 全局检测并降级

### Rationale
- 无需引入额外动画库（如 Framer Motion），减少包体积
- Ant Design 6.x 内置 motion 系统，与组件深度集成
- CSS 原生动画性能最佳，GPU 加速
- 遵循 Web 标准的可访问性设计

### Alternatives Considered
- **Framer Motion**: 功能强大但增加 ~50KB 包体积
- **React Spring**: 物理动画效果好但学习曲线陡峭
- **GSAP**: 专业动画库但过于重量级

### Animation Patterns
```css
/* 基础过渡 */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* 弹跳入场 */
@keyframes bounceIn {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 1; }
}

/* 降级方案 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3. 沉浸式布局实现方案

### Decision
采用全屏 Section 滚动 + 视差效果的沉浸式布局：

1. **首页**: 全屏欢迎区 + 滚动触发的内容展开
2. **菜谱列表**: 大图卡片瀑布流，悬停放大效果
3. **详情页**: 固定背景 + 内容滚动的视差效果

### Rationale
- 全屏设计能强化"沉浸感"，符合年轻用户习惯
- 无需引入全屏滚动库，用 CSS scroll-snap 实现
- 视差效果用 CSS position: sticky 实现，性能优异

### Layout Patterns
```css
/* 全屏 Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滚动吸附 */
.snap-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.snap-section {
  scroll-snap-align: start;
  min-height: 100vh;
}
```

---

## 4. 组件重构范围评估

### Decision
分三层进行组件重构：

**第一层 - 主题系统** (影响全局)
- `frontend/src/theme/index.ts` - 完全重写色彩配置

**第二层 - 布局组件** (结构变更)
- `Layout.tsx` - 重新设计导航和页面结构
- `NewHome.tsx` - 改为沉浸式全屏布局

**第三层 - 交互组件** (样式增强)
- `CityInput.tsx` - 添加动画效果
- `IngredientList.tsx` - 改为活力卡片设计
- `IngredientModal.tsx` - 添加弹窗动画
- `RecipeCard.tsx` - 大图沉浸式卡片
- `RecipeList.tsx` - 瀑布流布局

### Rationale
- 分层重构降低风险，可逐步验证
- 主题系统优先确保色彩一致性
- 保持组件 API 不变，仅改变视觉呈现

---

## 5. 响应式断点策略

### Decision
采用移动优先的 3 断点策略：

| 断点名称 | 宽度范围 | 布局特点 |
|---------|---------|---------|
| Mobile | < 768px | 单列，底部导航，触摸优化 |
| Tablet | 768px - 1024px | 双列，侧边导航收起 |
| Desktop | > 1024px | 多列，完整导航 |

### Rationale
- Ant Design 默认断点体系，无需额外配置
- 覆盖主流设备（iPhone SE 375px ~ 4K 显示器）
- 移动优先确保核心体验在小屏可用

---

## 6. 性能优化策略

### Decision
采用以下性能优化措施：

1. **动画性能**: 仅使用 transform/opacity 触发 GPU 加速
2. **图片优化**: 菜谱图片使用懒加载 + 骨架屏
3. **代码分割**: 保持现有 lazy loading 策略
4. **动画降级**: prefers-reduced-motion 自动检测

### Performance Targets
- 首次内容绘制 (FCP): < 1.5s
- 最大内容绘制 (LCP): < 2.5s
- 首次输入延迟 (FID): < 100ms
- 累积布局偏移 (CLS): < 0.1
- 动画帧率: 60fps (降级后可接受无动画)

### Rationale
- 符合 Web Vitals 核心指标要求
- 动画不阻塞主线程，保证交互响应性
- 成功标准 SC-007 要求页面加载 < 3s

---

## 7. 技术栈确认

### Current Stack (No Changes)
- **Framework**: React 19.2.0
- **UI Library**: Ant Design 6.1.4
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript 5.9.3
- **Router**: React Router DOM 7.11.0
- **HTTP Client**: Axios 1.13.2

### New Additions
- **Animation**: CSS native (transitions, keyframes)
- **Layout**: CSS Grid, Flexbox, scroll-snap

### No New Dependencies Required
本次重构不需要引入新的 npm 依赖，完全利用现有技术栈能力。
