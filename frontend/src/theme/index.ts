import type { ThemeConfig } from 'antd';
import { colors } from './tokens/colors';

// Ant Design 6.x 主题配置
// 主色调：珊瑚橙粉系 - 活泼年轻风格
// 设计规范参考: specs/005-page-ui-redesign/data-model.md
export const theme: ThemeConfig = {
  token: {
    // 主色 - 活力珊瑚红
    colorPrimary: colors.primary[400],
    colorPrimaryHover: colors.primary[300],
    colorPrimaryActive: colors.primary[500],
    colorPrimaryBg: colors.primary[50],
    colorPrimaryBgHover: colors.primary[100],

    // 功能色
    colorSuccess: colors.success,
    colorError: colors.error,
    colorWarning: colors.warning,
    colorInfo: colors.info,

    // 背景色 - 暖白色调
    colorBgContainer: '#FFFFFF',
    colorBgLayout: colors.neutral[50], // 暖白背景
    colorBgElevated: '#FFFFFF',
    colorBgSpotlight: colors.primary[50],

    // 文字色
    colorText: colors.neutral[900],
    colorTextSecondary: colors.neutral[600],
    colorTextTertiary: colors.neutral[500],
    colorTextQuaternary: colors.neutral[400],

    // 边框色
    colorBorder: colors.neutral[300],
    colorBorderSecondary: colors.neutral[200],

    // 圆角 - 更大更圆润
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,

    // 字体
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans SC", "PingFang SC", sans-serif',

    // 字体大小
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // 行高
    lineHeight: 1.6,

    // 阴影
    boxShadow:
      '0 4px 12px rgba(255, 107, 107, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    boxShadowSecondary:
      '0 8px 24px rgba(255, 107, 107, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',

    // 动画
    motionDurationFast: '0.15s',
    motionDurationMid: '0.3s',
    motionDurationSlow: '0.5s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  components: {
    Button: {
      colorPrimary: colors.primary[400],
      colorPrimaryHover: colors.primary[300],
      colorPrimaryActive: colors.primary[500],
      borderRadius: 24, // 胶囊按钮
      controlHeight: 40,
      controlHeightLG: 48,
      fontWeight: 500,
      algorithm: true,
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary:
        '0 4px 16px rgba(255, 107, 107, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    },
    Input: {
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 52,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Tag: {
      borderRadiusSM: 12,
    },
    Badge: {
      colorBgContainer: colors.primary[400],
    },
    Menu: {
      itemBorderRadius: 12,
      itemHoverBg: colors.primary[50],
      itemSelectedBg: colors.primary[100],
      itemSelectedColor: colors.primary[500],
    },
    Spin: {
      colorPrimary: colors.primary[400],
    },
    Alert: {
      borderRadiusLG: 12,
    },
    Empty: {
      colorTextDescription: colors.neutral[500],
    },
  },
};

// 导出色彩 token 供组件直接使用
export { colors } from './tokens/colors';
export { categoryColors } from './tokens/colors';
export { motion, animationPresets } from './tokens/motion';

export default theme;
