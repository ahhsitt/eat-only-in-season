// 色彩 Token 系统 - 珊瑚橙粉色系
// 设计规范参考: specs/005-page-ui-redesign/data-model.md

export const colors = {
  // 主色调 - 珊瑚橙粉系
  primary: {
    50: '#FFF5F5',
    100: '#FFE4E4',
    200: '#FFB8B8',
    300: '#FF8A8A',
    400: '#FF6B6B', // 主色
    500: '#FA5252',
    600: '#E03131',
    700: '#C92A2A',
    800: '#A61E1E',
    900: '#801515',
  },

  // 次要色 - 温暖橙粉
  secondary: {
    50: '#FFF5F0',
    100: '#FFEBE0',
    200: '#FFD4C0',
    300: '#FFB899',
    400: '#FFA07A', // 主次要色
    500: '#FF8C5A',
    600: '#FF7043',
  },

  // 强调色 - 明亮柠檬黄
  accent: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFE66D', // 主强调色
    500: '#FFD93D',
    600: '#FFC107',
  },

  // 功能色
  success: '#4ECDC4',
  warning: '#FFB347',
  error: '#FF6B6B',
  info: '#74B9FF',

  // 中性色
  neutral: {
    50: '#FFFAF0', // 暖白背景
    100: '#FFF5F5', // 淡粉背景
    200: '#F8F9FA',
    300: '#E9ECEF',
    400: '#DEE2E6',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#2D3436', // 深灰文字
  },
} as const;

// 分类颜色映射 - 用于食材分类标识
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  蔬菜: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  水果: { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },
  肉类: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
  海鲜: { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
  菌菇: { bg: '#F3E5F5', text: '#7B1FA2', border: '#CE93D8' },
  豆类: { bg: '#FFF8E1', text: '#FF8F00', border: '#FFE082' },
  谷物: { bg: '#EFEBE9', text: '#5D4037', border: '#BCAAA4' },
  default: { bg: colors.neutral[100], text: colors.neutral[700], border: colors.neutral[300] },
};

export type ColorToken = typeof colors;
export type CategoryColor = typeof categoryColors;
