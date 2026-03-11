/**
 * 设计令牌系统 (Design Tokens)
 * 用于标准化设计系统的颜色、字体、间距等变量
 * 为 AI 代码生成提供一致的设计规范
 */

export interface ColorPalette {
  primary: string[]
  secondary: string[]
  success: string[]
  warning: string[]
  error: string[]
  neutral: string[]
}

export interface TypographyScale {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

export interface SpacingScale {
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  8: string
  10: string
  12: string
  16: string
  20: string
  24: string
  32: string
}

export interface BorderRadius {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  full: string
}

export interface Shadow {
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

export interface DesignTokens {
  colors: {
    palette: ColorPalette
    background: {
      primary: string
      secondary: string
      tertiary: string
      accent: string
    }
    text: {
      primary: string
      secondary: string
      tertiary: string
      disabled: string
      inverse: string
    }
    border: {
      light: string
      medium: string
      dark: string
    }
  }
  typography: TypographyScale
  spacing: SpacingScale
  borderRadius: BorderRadius
  shadow: Shadow
  zIndex: {
    hide: number
    base: number
    dropdown: number
    sticky: number
    fixed: number
    modalOverlay: number
    modal: number
    popover: number
    toast: number
    tooltip: number
  }
}

export const designTokens: DesignTokens = {
  colors: {
    palette: {
      primary: [
        '#eff6ff', // 50
        '#dbeafe', // 100
        '#bfdbfe', // 200
        '#93c5fd', // 300
        '#60a5fa', // 400
        '#3b82f6', // 500 - base
        '#2563eb', // 600
        '#1d4ed8', // 700
        '#1e40af', // 800
        '#1e3a8a', // 900
      ],
      secondary: [
        '#f5f3ff',
        '#ede9fe',
        '#ddd6fe',
        '#c4b5fd',
        '#a78bfa',
        '#8b5cf6',
        '#7c3aed',
        '#6d28d9',
        '#5b21b6',
        '#4c1d95',
      ],
      success: [
        '#f0fdf4',
        '#dcfce7',
        '#bbf7d0',
        '#86efac',
        '#4ade80',
        '#22c55e',
        '#16a34a',
        '#15803d',
        '#166534',
        '#14532d',
      ],
      warning: [
        '#fffbeb',
        '#fef3c7',
        '#fde68a',
        '#fcd34d',
        '#fbbf24',
        '#f59e0b',
        '#d97706',
        '#b45309',
        '#92400e',
        '#78350f',
      ],
      error: [
        '#fef2f2',
        '#fee2e2',
        '#fecaca',
        '#fca5a5',
        '#f87171',
        '#ef4444',
        '#dc2626',
        '#b91c1c',
        '#991b1b',
        '#7f1d1d',
      ],
      neutral: [
        '#fafafa',
        '#f4f4f5',
        '#e4e4e7',
        '#d4d4d8',
        '#a1a1aa',
        '#71717a',
        '#52525b',
        '#3f3f46',
        '#27272a',
        '#18181b',
      ],
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      accent: '#eff6ff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#6b7280',
      disabled: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
    },
  },
  typography: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
  },
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalOverlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    tooltip: 1700,
  },
}

/**
 * 导出为 JSON 格式，供 AI 消费
 */
export function exportTokensAsJSON(): string {
  return JSON.stringify(designTokens, null, 2)
}

/**
 * 获取颜色值
 */
export function getColor(
  palette: keyof ColorPalette,
  shade: number = 500
): string {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  const index = shades.indexOf(shade)
  if (index === -1 || index < 0 || index >= designTokens.colors.palette[palette].length) {
    return designTokens.colors.palette[palette][5] // default to 500
  }
  return designTokens.colors.palette[palette][index]
}

/**
 * 获取间距值
 */
export function getSpacing(value: keyof SpacingScale): string {
  return designTokens.spacing[value]
}

/**
 * 获取字体大小
 */
export function getFontSize(size: keyof TypographyScale): string {
  return designTokens.typography[size]
}

/**
 * 获取圆角值
 */
export function getBorderRadius(radius: keyof BorderRadius): string {
  return designTokens.borderRadius[radius]
}

/**
 * 获取阴影值
 */
export function getShadow(shadow: keyof Shadow): string {
  return designTokens.shadow[shadow]
}

export default designTokens
