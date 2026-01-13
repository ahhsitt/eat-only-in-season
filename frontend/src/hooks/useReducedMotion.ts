import { useState, useEffect } from 'react';

/**
 * 检测用户系统是否设置了减少动画偏好
 * 用于实现动画降级策略
 *
 * @returns boolean - true 表示用户偏好减少动画
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <div style={{
 *     transition: prefersReducedMotion ? 'none' : 'transform 0.3s ease'
 *   }}>
 *     内容
 *   </div>
 * );
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // 服务端渲染时返回 false
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // 监听系统设置变化
    mediaQuery.addEventListener('change', handleChange);

    // 初始化时同步状态
    setPrefersReducedMotion(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * 根据动画偏好返回动画配置
 *
 * @param normalAnimation - 正常动画配置
 * @param reducedAnimation - 降级动画配置（可选，默认为无动画）
 * @returns 根据用户偏好返回的动画配置
 *
 * @example
 * const animationStyle = useAnimationConfig(
 *   { transform: 'scale(1.05)', transition: 'transform 0.3s ease' },
 *   { transform: 'scale(1)' }
 * );
 */
export function useAnimationConfig<T>(
  normalAnimation: T,
  reducedAnimation?: Partial<T>
): T {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && reducedAnimation) {
    return { ...normalAnimation, ...reducedAnimation } as T;
  }

  if (prefersReducedMotion) {
    // 默认降级：移除动画相关属性
    const reduced = { ...normalAnimation };
    if (typeof reduced === 'object' && reduced !== null) {
      const obj = reduced as Record<string, unknown>;
      if ('transition' in obj) obj.transition = 'none';
      if ('animation' in obj) obj.animation = 'none';
    }
    return reduced;
  }

  return normalAnimation;
}

export default useReducedMotion;
