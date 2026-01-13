# Research: Ant Design UI 升级

**Feature**: 004-antd-ui-redesign
**Date**: 2026-01-13
**Status**: Complete

## 1. Ant Design 5.x 与 React 19 兼容性

### Decision
使用 Ant Design 5.x（最新稳定版），该版本完全支持 React 18+，与 React 19 兼容。

### Rationale
- Ant Design 5.x 使用 CSS-in-JS（@ant-design/cssinjs），无需额外 CSS 预处理
- 支持 Tree Shaking，可优化打包体积
- 提供完整的 TypeScript 类型支持
- 内置主题定制系统（Design Token）

### Alternatives Considered
| 方案 | 评估 | 排除原因 |
|------|------|----------|
| Ant Design 4.x | 稳定但较旧 | 不支持 CSS-in-JS，需要额外的 Less 配置 |
| Material UI | 功能强大 | 风格偏向 Material Design，不符合项目调性 |
| Chakra UI | 简洁易用 | 组件丰富度不如 Ant Design |

## 2. 主题配置方案

### Decision
使用 Ant Design 5.x 的 ConfigProvider + Design Token 系统配置主题色。

### Rationale
- 通过 `token` 属性直接设置主色调、圆角、间距等
- 无需编译时配置，运行时动态生效
- 支持组件级别的样式覆盖

### Theme Token 配置

```typescript
// 推荐的主题配置
const theme = {
  token: {
    // 主色 - 柔和鼠尾草绿（与现有品牌色一致）
    colorPrimary: '#8B9A7D',
    colorSuccess: '#7A9A6D',
    colorError: '#C45C5C',

    // 背景色
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#FAF7F4',
    colorBgElevated: '#FFFFFF',

    // 文字色
    colorText: '#2D2D2D',
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',

    // 圆角 - 柔和风格
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,

    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans SC", sans-serif',
  },
};
```

## 3. Tailwind CSS 移除策略

### Decision
完全移除 Tailwind CSS，使用 Ant Design 的样式系统替代。

### Rationale
- 避免两套样式系统共存带来的复杂性
- Ant Design 5.x 内置 Flex、Grid 等布局能力
- 减少打包体积和构建时间

### Migration Steps
1. 安装 Ant Design 依赖
2. 配置 ConfigProvider 主题
3. 逐个组件替换 Tailwind 类名为 Ant Design 组件/样式
4. 移除 `@tailwindcss/vite` 插件和 `tailwindcss` 依赖
5. 简化 `index.css`，仅保留必要的全局样式

## 4. 组件映射方案

### Decision
按以下映射替换现有自定义组件为 Ant Design 组件。

| 现有组件 | Ant Design 替代 | 说明 |
|----------|-----------------|------|
| CityInput | Input.Search | 带搜索按钮的输入框 |
| IngredientList | Card + Checkbox | 可选中的卡片列表 |
| IngredientModal | Modal | 模态框展示详情 |
| RecipeCard | Card | 菜谱卡片 |
| RecipeList | Row + Col + Card | 响应式卡片网格 |
| LoadingSpinner | Spin / Skeleton | 加载状态 |
| PDFExportButton | Button | 带图标按钮 |
| PreferenceForm | Form + Input.TextArea | 表单组件 |
| Layout | Layout (Header/Content) | 页面布局 |
| ErrorBoundary | Result | 错误状态展示 |

## 5. 响应式布局方案

### Decision
使用 Ant Design 的 Grid 系统（Row/Col）+ 响应式断点。

### Rationale
- Ant Design Grid 提供 24 栏栅格系统
- 支持 xs/sm/md/lg/xl/xxl 六个响应式断点
- 与 Ant Design 组件无缝集成

### Breakpoints
| 断点 | 宽度 | 用途 |
|------|------|------|
| xs | <576px | 手机竖屏 |
| sm | ≥576px | 手机横屏 |
| md | ≥768px | 平板 |
| lg | ≥992px | 小型桌面 |
| xl | ≥1200px | 桌面 |
| xxl | ≥1600px | 大屏桌面 |

## 6. 性能优化策略

### Decision
采用按需加载 + Tree Shaking 优化打包体积。

### Rationale
- Ant Design 5.x 默认支持 Tree Shaking，只打包使用的组件
- 无需 babel-plugin-import 额外配置
- CSS-in-JS 自动按需生成样式

### Best Practices
1. 直接从 `antd` 导入组件（如 `import { Button } from 'antd'`）
2. 避免导入整个命名空间（如 `import * as antd from 'antd'`）
3. 使用 Vite 的代码分割特性（已有 lazy loading）

## 7. 错误和空状态处理

### Decision
使用 Ant Design 的 Result 和 Empty 组件。

### Component Usage
- **加载中**: `<Spin>` 或 `<Skeleton>`
- **空数据**: `<Empty>`
- **网络错误**: `<Result status="error">`
- **服务不可用**: `<Result status="500">`

## Research Completion

所有技术决策已确定，无未解决的 NEEDS CLARIFICATION 项。可进入 Phase 1 设计阶段。
