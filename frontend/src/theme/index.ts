import type { ThemeConfig } from 'antd';
import { colors } from './tokens/colors';

// Ant Design 6.x - Neubrutalism v2 Theme
export const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.candy.orange,
    colorPrimaryHover: colors.candy.pink,
    colorPrimaryActive: colors.candy.red,
    colorPrimaryBg: colors.paper,
    colorPrimaryBgHover: colors.cream,

    colorSuccess: colors.candy.green,
    colorError: colors.candy.red,
    colorWarning: colors.candy.orange,
    colorInfo: colors.candy.blue,

    colorBgContainer: '#FFFFFF',
    colorBgLayout: colors.paper,
    colorBgElevated: '#FFFFFF',
    colorBgSpotlight: colors.candy.yellow,

    colorText: colors.ink,
    colorTextSecondary: colors.neutral[600],
    colorTextTertiary: colors.neutral[500],
    colorTextQuaternary: colors.neutral[400],

    colorBorder: colors.ink,
    colorBorderSecondary: colors.neutral[300],

    borderRadius: 16,
    borderRadiusLG: 20,
    borderRadiusSM: 12,
    borderRadiusXS: 8,

    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif",

    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    lineHeight: 1.6,

    boxShadow: '6px 6px 0px #1A1A2E',
    boxShadowSecondary: '8px 8px 0px #1A1A2E',

    motionDurationFast: '0.15s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  components: {
    Button: {
      colorPrimary: colors.candy.orange,
      colorPrimaryHover: colors.candy.pink,
      colorPrimaryActive: colors.candy.red,
      borderRadius: 16,
      controlHeight: 44,
      controlHeightLG: 52,
      fontWeight: 800,
      algorithm: true,
    },
    Card: {
      borderRadiusLG: 20,
    },
    Input: {
      borderRadius: 16,
      controlHeight: 48,
      controlHeightLG: 56,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Tag: {
      borderRadiusSM: 50,
    },
    Badge: {
      colorBgContainer: colors.candy.pink,
    },
    Menu: {
      itemBorderRadius: 12,
      itemHoverBg: colors.candy.yellow + '40',
      itemSelectedBg: colors.candy.yellow,
      itemSelectedColor: colors.ink,
    },
    Spin: {
      colorPrimary: colors.candy.orange,
    },
    Alert: {
      borderRadiusLG: 16,
    },
    Empty: {
      colorTextDescription: colors.neutral[500],
    },
  },
};

export { colors } from './tokens/colors';
export { categoryColors } from './tokens/colors';
export { motion, animationPresets } from './tokens/motion';

export default theme;
