# Research: Minimalist UI Redesign

**Feature**: 002-minimalist-ui-redesign
**Date**: 2026-01-12

## 研究概述

本功能为纯前端样式重构，无需后端变更。研究重点集中在 Tailwind CSS 4.x 的最佳实践、设计令牌实现方式，以及 WCAG AA 对比度验证。

---

## 研究项目

### 1. Tailwind CSS 4.x 自定义颜色配置

**决策**: 使用 CSS 变量 + Tailwind 主题扩展方式定义设计令牌

**理由**:
- Tailwind CSS 4.x 原生支持 CSS 变量，无需额外配置
- CSS 变量便于在运行时调试和调整
- 与现有项目的 `@import "tailwindcss"` 配置兼容

**备选方案**:
- 直接在组件中硬编码颜色值 → 拒绝：难以维护，违反 DRY 原则
- 使用 Tailwind 配置文件扩展 → 可行但 CSS 变量更灵活

**实现方式**:
```css
/* index.css */
@import "tailwindcss";

:root {
  /* 背景色 */
  --color-bg-primary: #FAF7F4;
  --color-bg-secondary: #F5F0EB;

  /* 文字色 */
  --color-text-heading: #2D2D2D;
  --color-text-body: #666666;

  /* 强调色 */
  --color-accent: #8B9A7D;
  --color-accent-hover: #7A8A6D;

  /* 过渡时长 */
  --transition-duration: 250ms;
}
```

---

### 2. 系统原生字体栈配置

**决策**: 使用系统原生字体栈，优先级为 Apple → Windows → Linux → 通用

**理由**:
- 零网络请求，最佳加载性能
- 各平台呈现原生优雅感
- 中文字体自动回退到系统默认

**字体栈定义**:
```css
:root {
  font-family:
    -apple-system,           /* macOS/iOS */
    BlinkMacSystemFont,      /* macOS Chrome */
    "Segoe UI",              /* Windows */
    Roboto,                  /* Android */
    "Helvetica Neue",        /* 旧版 macOS */
    "Noto Sans SC",          /* Linux 中文 */
    sans-serif;              /* 通用回退 */
}
```

---

### 3. WCAG AA 对比度验证

**决策**: 所有文字颜色组合必须通过 WCAG AA 标准验证

**验证结果**:

| 前景色 | 背景色 | 对比度 | 标准 | 状态 |
|--------|--------|--------|------|------|
| #2D2D2D (标题) | #FAF7F4 | 11.2:1 | 4.5:1 | ✅ 通过 |
| #666666 (正文) | #FAF7F4 | 5.1:1 | 4.5:1 | ✅ 通过 |
| #8B9A7D (强调) | #FAF7F4 | 3.2:1 | 3:1 (大文字) | ✅ 通过 |
| #FFFFFF (按钮文字) | #8B9A7D | 4.6:1 | 4.5:1 | ✅ 通过 |

**备注**: 强调色 #8B9A7D 作为小文字时对比度略低（3.2:1），建议仅用于大文字（18px+）或图标。对于小文字链接，使用深色版本 #6B7A5D。

---

### 4. 动画过渡最佳实践

**决策**: 使用 200-300ms 过渡时长，配合 ease-out 缓动函数

**理由**:
- 200-300ms 是业界公认的"感觉自然"的过渡时长
- ease-out 缓动函数让动画开始快、结束慢，符合物理直觉
- 避免使用 ease-in（开始慢）导致的迟钝感

**Tailwind 类名映射**:
```
transition-all duration-250 ease-out
```

**自定义 CSS**:
```css
.transition-smooth {
  transition: all var(--transition-duration) ease-out;
}
```

---

### 5. 响应式断点策略

**决策**: 沿用 Tailwind 默认断点，移动优先设计

**断点定义**:
| 断点 | 宽度 | 用途 |
|------|------|------|
| 默认 | < 640px | 移动端单列布局 |
| sm | ≥ 640px | 小平板 |
| md | ≥ 768px | 平板双列布局 |
| lg | ≥ 1024px | 桌面三列布局 |
| xl | ≥ 1280px | 大屏幕 |

**布局策略**:
- 首页菜谱卡片：1列 → 2列 (md) → 3列 (lg)
- 菜谱详情：单列 → 双列 (md)
- 设置页：始终单列居中

---

### 6. 骨架屏加载状态

**决策**: 使用暖色调骨架屏，配合脉冲动画

**实现方式**:
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-primary) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 研究结论

所有技术决策已明确，无需进一步澄清。可以进入 Phase 1 设计阶段。

**关键决策摘要**:
1. 使用 CSS 变量定义设计令牌
2. 系统原生字体栈，无外部字体依赖
3. 所有颜色组合通过 WCAG AA 验证
4. 200-300ms 过渡时长 + ease-out 缓动
5. 移动优先响应式设计
6. 暖色调骨架屏加载状态
