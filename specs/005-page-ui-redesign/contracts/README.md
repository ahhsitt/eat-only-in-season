# API Contracts

**Feature**: 005-page-ui-redesign
**Date**: 2026-01-13

## 说明

本功能为纯前端 UI 重设计，**不涉及 API 契约变更**。

现有 API 接口保持不变：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/ingredients` | GET | 获取应季食材 |
| `/api/recipes` | GET | 获取菜谱推荐 |
| `/api/recipe/:id` | GET | 获取菜谱详情 |

所有数据类型和响应格式保持原有定义，详见 `frontend/src/types/index.ts`。
