# Data Model: Design Tokens

**Feature**: 002-minimalist-ui-redesign
**Date**: 2026-01-12

## 概述

本功能不涉及传统数据模型变更。此文档定义 UI 重构所需的设计令牌（Design Tokens），作为样式系统的单一真相来源。

---

## 设计令牌定义

### 1. 颜色令牌 (Color Tokens)

#### 背景色 (Background)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| bg-primary | `--color-bg-primary` | #FAF7F4 | 页面主背景 |
| bg-secondary | `--color-bg-secondary` | #F5F0EB | 卡片、区块背景 |
| bg-white | `--color-bg-white` | #FFFFFF | 输入框、弹窗背景 |

#### 文字色 (Text)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| text-heading | `--color-text-heading` | #2D2D2D | 标题、重要文字 |
| text-body | `--color-text-body` | #666666 | 正文、描述文字 |
| text-muted | `--color-text-muted` | #999999 | 次要信息、占位符 |

#### 强调色 (Accent)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| accent | `--color-accent` | #8B9A7D | 按钮、链接、徽章 |
| accent-hover | `--color-accent-hover` | #7A8A6D | 悬停状态 |
| accent-light | `--color-accent-light` | #E8EDE4 | 浅色背景、标签 |
| accent-dark | `--color-accent-dark` | #6B7A5D | 小文字链接（高对比度） |

#### 功能色 (Functional)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| error | `--color-error` | #C45C5C | 错误提示 |
| error-light | `--color-error-light` | #FDF2F2 | 错误背景 |
| success | `--color-success` | #7A9A6D | 成功提示 |
| success-light | `--color-success-light` | #F2F7F0 | 成功背景 |

---

### 2. 字体令牌 (Typography Tokens)

#### 字体族 (Font Family)

| 令牌名称 | CSS 变量 | 值 |
|----------|----------|-----|
| font-sans | `--font-sans` | -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans SC", sans-serif |

#### 字号 (Font Size)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| text-xs | `--text-xs` | 0.75rem (12px) | 辅助信息 |
| text-sm | `--text-sm` | 0.875rem (14px) | 次要文字 |
| text-base | `--text-base` | 1rem (16px) | 正文 |
| text-lg | `--text-lg` | 1.125rem (18px) | 小标题 |
| text-xl | `--text-xl` | 1.25rem (20px) | 区块标题 |
| text-2xl | `--text-2xl` | 1.5rem (24px) | 页面标题 |
| text-3xl | `--text-3xl` | 1.875rem (30px) | 主标题 |

#### 字重 (Font Weight)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| font-normal | `--font-normal` | 400 | 正文 |
| font-medium | `--font-medium` | 500 | 强调文字 |
| font-semibold | `--font-semibold` | 600 | 标题 |
| font-bold | `--font-bold` | 700 | 主标题 |

#### 行高 (Line Height)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| leading-tight | `--leading-tight` | 1.25 | 标题 |
| leading-normal | `--leading-normal` | 1.5 | 正文 |
| leading-relaxed | `--leading-relaxed` | 1.75 | 长文本 |

---

### 3. 间距令牌 (Spacing Tokens)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| space-1 | `--space-1` | 0.25rem (4px) | 最小间距 |
| space-2 | `--space-2` | 0.5rem (8px) | 紧凑间距 |
| space-3 | `--space-3` | 0.75rem (12px) | 小间距 |
| space-4 | `--space-4` | 1rem (16px) | 标准间距 |
| space-6 | `--space-6` | 1.5rem (24px) | 中等间距 |
| space-8 | `--space-8` | 2rem (32px) | 大间距 |
| space-12 | `--space-12` | 3rem (48px) | 区块间距 |
| space-16 | `--space-16` | 4rem (64px) | 页面间距 |

---

### 4. 圆角令牌 (Border Radius Tokens)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| rounded-sm | `--rounded-sm` | 0.25rem (4px) | 小元素 |
| rounded | `--rounded` | 0.5rem (8px) | 按钮、输入框 |
| rounded-lg | `--rounded-lg` | 0.75rem (12px) | 卡片 |
| rounded-xl | `--rounded-xl` | 1rem (16px) | 大卡片 |
| rounded-full | `--rounded-full` | 9999px | 圆形、药丸形 |

---

### 5. 阴影令牌 (Shadow Tokens)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| shadow-sm | `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | 微弱阴影 |
| shadow | `--shadow` | 0 2px 8px rgba(0,0,0,0.08) | 标准阴影 |
| shadow-md | `--shadow-md` | 0 4px 16px rgba(0,0,0,0.1) | 悬停阴影 |
| shadow-lg | `--shadow-lg` | 0 8px 24px rgba(0,0,0,0.12) | 弹窗阴影 |

---

### 6. 过渡令牌 (Transition Tokens)

| 令牌名称 | CSS 变量 | 值 | 用途 |
|----------|----------|-----|------|
| duration-fast | `--duration-fast` | 150ms | 快速反馈 |
| duration-normal | `--duration-normal` | 250ms | 标准过渡 |
| duration-slow | `--duration-slow` | 350ms | 缓慢过渡 |
| easing | `--easing` | ease-out | 缓动函数 |

---

## 组件样式映射

### 按钮 (Button)

```
主按钮:
  背景: accent
  文字: white
  悬停: accent-hover
  圆角: rounded
  内边距: space-3 space-6
  过渡: duration-normal

次按钮:
  背景: bg-secondary
  文字: text-body
  悬停: bg-primary
  边框: 1px solid #E5E5E5
```

### 卡片 (Card)

```
背景: bg-white
圆角: rounded-xl
阴影: shadow
悬停阴影: shadow-md
内边距: space-6
过渡: duration-normal
```

### 输入框 (Input)

```
背景: bg-white
边框: 1px solid #E5E5E5
圆角: rounded-lg
内边距: space-3 space-4
聚焦边框: accent
过渡: duration-fast
```

### 徽章 (Badge)

```
背景: accent-light
文字: accent-dark
圆角: rounded-full
内边距: space-1 space-3
字号: text-xs
```

---

## Tailwind CSS 类名映射

| 设计令牌 | Tailwind 类名 |
|----------|---------------|
| bg-primary | `bg-[#FAF7F4]` 或自定义 `bg-cream` |
| text-heading | `text-[#2D2D2D]` 或自定义 `text-charcoal` |
| accent | `bg-[#8B9A7D]` 或自定义 `bg-sage` |
| shadow | `shadow-[0_2px_8px_rgba(0,0,0,0.08)]` |
| duration-normal | `duration-[250ms]` |

**建议**: 在 index.css 中定义 CSS 变量，然后在组件中使用 Tailwind 的任意值语法 `[]` 引用。
