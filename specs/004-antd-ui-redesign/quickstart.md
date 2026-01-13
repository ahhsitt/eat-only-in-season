# Quickstart: Ant Design UI 升级

**Feature**: 004-antd-ui-redesign
**Date**: 2026-01-13
**Purpose**: 快速验证 Ant Design UI 升级是否正确完成

## Prerequisites

- Node.js 18+
- pnpm 或 npm

## Setup Steps

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖（包括 Ant Design）
pnpm install

# 3. 启动开发服务器
pnpm dev
```

## Validation Checklist

### 1. 首页验证 (/)

- [ ] 页面使用 Ant Design 风格，整体布局大气整洁
- [ ] 城市搜索框使用 Ant Design Input.Search 组件
- [ ] 食材列表以卡片形式展示，分类清晰
- [ ] 选中食材时有明确的视觉反馈
- [ ] "获取菜谱"按钮使用 Ant Design Button 组件

### 2. 菜谱列表页验证 (/recipes)

- [ ] 加载中显示 Spin 或 Skeleton 组件
- [ ] 菜谱以卡片形式展示
- [ ] 卡片悬停有视觉效果
- [ ] 空状态使用 Empty 组件

### 3. 菜谱详情页验证 (/recipe/:id)

- [ ] 内容以清晰的区块展示
- [ ] 图片有加载占位效果
- [ ] PDF 导出按钮样式正确

### 4. 食材详情弹窗验证

- [ ] 点击食材详情显示 Modal 组件
- [ ] 弹窗打开/关闭动画流畅
- [ ] 内容分区清晰

### 5. 响应式验证

- [ ] 桌面端 (1920x1080) 布局正常
- [ ] 移动端 (375x667) 布局适配

### 6. 主题验证

- [ ] 主色调为绿色系 (#8B9A7D)
- [ ] 按钮、链接等交互元素颜色一致
- [ ] 整体风格与自然健康主题呼应

## Build Verification

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

验证构建成功且无错误。

## Quick Test Flow

1. 打开首页 http://localhost:5173
2. 输入城市名称（如"深圳"）并搜索
3. 浏览食材列表，选择几个食材
4. 点击"获取菜谱"按钮
5. 在菜谱列表中选择一个菜谱
6. 查看菜谱详情页
7. 点击 PDF 导出按钮

全流程应流畅无阻塞，视觉效果统一大气。
