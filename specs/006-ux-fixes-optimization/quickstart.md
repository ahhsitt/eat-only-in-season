# Quickstart: UX 问题修复与优化

**Feature**: 006-ux-fixes-optimization
**Date**: 2026-01-13
**Updated**: 2026-01-13 (PDF 方案重构)

## Prerequisites

- Node.js 22.12+ (建议，Vite 要求)
- Go 1.24+
- 现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）

## Quick Verification Steps

### 1. 安装新依赖并启动开发环境

```bash
# Terminal 1: 启动后端
cd backend
go run cmd/server/main.go

# Terminal 2: 安装前端新依赖并启动
cd frontend
npm install html2canvas jspdf  # 新增 PDF 导出依赖
npm run dev
```

### 2. 验证 User Story 1: 食材详情弹窗已移除

1. 打开浏览器访问 http://localhost:5173
2. 输入城市名称（如"上海"）并搜索
3. 查看食材列表
4. **验证**: 食材卡片上不应有"了解更多"按钮
5. **验证**: 点击食材卡片不会弹出任何弹窗

### 3. 验证 User Story 2: 季节性食材推荐

1. 搜索沿海城市（如"青岛"、"厦门"）
2. **验证**: 推荐列表中应有明显的海鲜食材（梭子蟹、带鱼、牡蛎等）
3. **验证**: 不应出现鸡蛋、猪肉、牛奶等全年供应食材

4. 搜索内陆山区城市（如"贵阳"、"昆明"）
5. **验证**: 推荐列表中应有山珍、菌菇类食材

### 4. 验证 User Story 3: 返回导航参数保持

1. 搜索城市并选择食材
2. 点击"获取菜谱推荐"进入菜谱列表页
3. 记录浏览器 URL（应包含 `?ingredients=...&location=...`）
4. 点击任意菜谱进入详情页
5. 点击"返回列表"按钮
6. **验证**: URL 应与步骤 3 记录的一致
7. **验证**: 页面不应重新加载或请求 API（观察网络面板）

### 5. 验证 User Story 4: PDF 导出样式 ⚡ 新方案

1. 进入任意菜谱详情页
2. 等待页面完全加载（包括图片）
3. 点击"导出 PDF"按钮
4. 等待生成完成（可能需要几秒）
5. 打开下载的 PDF 文件
6. **验证**: PDF 样式应与网页完全一致（所见即所得）
7. **验证**: 包含所有图标、标签、按钮样式
8. **验证**: 配色为珊瑚橙粉系
9. **验证**: 图片正常显示

## Common Issues

### PDF 导出空白或部分内容丢失

**原因**: 跨域图片未加载

**解决方案**:
1. 确保图片 URL 支持 CORS
2. 或将图片转为 base64 格式
3. 检查浏览器控制台是否有跨域错误

### PDF 导出样式不完整

**原因**: 某些 CSS 属性不被 html2canvas 支持

**已知不支持的 CSS**:
- `backdrop-filter` (毛玻璃效果)
- `filter` (部分滤镜)
- `box-shadow` (部分场景)
- CSS 变量 (部分场景)

**解决方案**: 导出时这些效果会被简化或忽略，属于预期行为

### PDF 文字无法选中/搜索

**原因**: html2canvas 将页面渲染为图片

**说明**: 这是所选方案的已知限制，PDF 中的文字是图片格式，无法选中或搜索。如需可选中文字，需要使用服务端渲染方案（如 puppeteer），但复杂度更高。

### 食材推荐仍有常见食材

**原因**: 缓存未清除

**解决方案**:
```bash
# 删除后端缓存数据库
rm backend/data/cache.db*
# 重启后端服务
```

### 返回导航不保持参数

**可能原因**:
1. 使用了浏览器后退按钮而非页面返回按钮
2. 页面组件未正确使用 location.state

**验证方法**: 使用 React DevTools 检查 location.state 是否正确传递

## Expected Results Summary

| 功能 | 预期结果 |
|------|----------|
| 食材详情弹窗 | 完全移除，无按钮，无弹窗 |
| 食材推荐 | 无鸡蛋/猪肉等，沿海城市有海鲜 |
| 返回导航 | URL 参数保持，缓存命中 |
| PDF 导出 | **所见即所得**，完整保持网页样式 |

## New Dependencies

本次更新新增以下前端依赖：

```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1"
  }
}
```

安装命令:
```bash
cd frontend
npm install html2canvas jspdf
```
