// 动画 Token 系统 - 缓动函数和时长定义
// 设计规范参考: specs/005-page-ui-redesign/data-model.md

export const motion = {
  // 缓动函数
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // 持续时间
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // 延迟（用于 staggered 动画）
  delay: {
    none: '0ms',
    short: '50ms',
    medium: '100ms',
    long: '200ms',
  },
} as const;

// CSS 变量格式的动画值
export const motionVars = {
  '--motion-ease-default': motion.easing.default,
  '--motion-ease-bounce': motion.easing.bounce,
  '--motion-ease-spring': motion.easing.spring,
  '--motion-duration-fast': motion.duration.fast,
  '--motion-duration-normal': motion.duration.normal,
  '--motion-duration-slow': motion.duration.slow,
} as const;

// 预设动画配置
export const animationPresets = {
  fadeIn: {
    duration: motion.duration.normal,
    easing: motion.easing.easeOut,
  },
  slideUp: {
    duration: motion.duration.normal,
    easing: motion.easing.bounce,
  },
  scale: {
    duration: motion.duration.fast,
    easing: motion.easing.easeOut,
  },
  hover: {
    duration: motion.duration.fast,
    easing: motion.easing.default,
  },
} as const;

export type MotionToken = typeof motion;
export type AnimationPreset = typeof animationPresets;
