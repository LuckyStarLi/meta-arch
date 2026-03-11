/**
 * 响应式设计系统
 * 用于定义和管理组件的响应式行为，支持多设备适配
 */

/**
 * 断点类型
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * 断点配置
 */
export interface BreakpointConfig {
  name: Breakpoint
  label: string
  minWidth: number
  maxWidth?: number
  defaultColumns: number
  gutter: number
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  display: 'block' | 'flex' | 'grid' | 'inline-block' | 'inline-flex' | 'inline-grid' | 'none'
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  alignItems?: 'stretch' | 'start' | 'end' | 'center' | 'baseline'
  alignContent?: 'stretch' | 'start' | 'end' | 'center' | 'between' | 'around'
  gridTemplateColumns?: string
  gridTemplateRows?: string
  gridColumnGap?: string
  gridRowGap?: string
  // 尺寸相关
  maxWidth?: string
  maxHeight?: string
  width?: string
  height?: string
  // 间距相关
  marginLeft?: string
  marginRight?: string
  marginTop?: string
  marginBottom?: string
  paddingLeft?: string
  paddingRight?: string
  paddingTop?: string
  paddingBottom?: string
  gap?: string
}

/**
 * 间距配置
 */
export interface SpacingConfig {
  margin?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string
  padding?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
}

/**
 * 尺寸配置
 */
export interface SizeConfig {
  width?: string
  minWidth?: string
  maxWidth?: string
  height?: string
  minHeight?: string
  maxHeight?: string
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig<T = unknown> {
  base: T
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

/**
 * 响应式值工具
 */
export interface ResponsiveValue<T> {
  base: T
  breakpoints?: Partial<Record<Breakpoint, T>>
}

/**
 * 可见性配置
 */
export interface VisibilityConfig {
  visible: boolean
  hiddenOn?: Breakpoint[]
  visibleOn?: Breakpoint[]
}

/**
 * 响应式组件配置
 */
export interface ResponsiveComponentConfig {
  id: string
  name: string
  type: string
  layout: ResponsiveConfig<LayoutConfig>
  spacing: ResponsiveConfig<SpacingConfig>
  size: ResponsiveConfig<SizeConfig>
  visibility: VisibilityConfig
  order?: ResponsiveConfig<number>
  flex?: ResponsiveConfig<string>
  grid?: ResponsiveConfig<{
    column?: string
    row?: string
    area?: string
  }>
}

/**
 * 预设断点配置
 */
export const defaultBreakpoints: BreakpointConfig[] = [
  {
    name: 'xs',
    label: '超小屏 (手机)',
    minWidth: 0,
    maxWidth: 639,
    defaultColumns: 1,
    gutter: 16,
  },
  {
    name: 'sm',
    label: '小屏 (大手机)',
    minWidth: 640,
    maxWidth: 767,
    defaultColumns: 2,
    gutter: 16,
  },
  {
    name: 'md',
    label: '中屏 (平板)',
    minWidth: 768,
    maxWidth: 1023,
    defaultColumns: 6,
    gutter: 24,
  },
  {
    name: 'lg',
    label: '大屏 (桌面)',
    minWidth: 1024,
    maxWidth: 1279,
    defaultColumns: 8,
    gutter: 24,
  },
  {
    name: 'xl',
    label: '超大屏 (大桌面)',
    minWidth: 1280,
    maxWidth: 1535,
    defaultColumns: 12,
    gutter: 32,
  },
  {
    name: '2xl',
    label: '超大屏 (超大桌面)',
    minWidth: 1536,
    defaultColumns: 12,
    gutter: 32,
  },
]

/**
 * 创建响应式配置
 */
export function createResponsiveConfig<T>(base: T, overrides?: Partial<Record<Breakpoint, T>>): ResponsiveValue<T> {
  return {
    base,
    breakpoints: overrides,
  }
}

/**
 * 获取指定断点的值
 */
export function getResponsiveValue<T>(
  config: ResponsiveValue<T>,
  breakpoint?: Breakpoint
): T {
  if (!breakpoint) {
    return config.base
  }
  return config.breakpoints?.[breakpoint] ?? config.base
}

/**
 * 创建响应式组件配置
 */
export function createResponsiveComponentConfig(
  name: string,
  type: string,
  overrides?: Partial<ResponsiveComponentConfig>
): ResponsiveComponentConfig {
  const baseConfig: ResponsiveComponentConfig = {
    id: generateResponsiveId(),
    name,
    type,
    layout: createResponsiveConfig<LayoutConfig>({
      display: 'block',
    }),
    spacing: createResponsiveConfig<SpacingConfig>({}),
    size: createResponsiveConfig<SizeConfig>({}),
    visibility: {
      visible: true,
    },
  }

  if (overrides) {
    Object.assign(baseConfig, overrides)
  }

  return baseConfig
}

/**
 * 创建栅格布局配置
 */
export function createGridLayout(
  columns: ResponsiveConfig<number>,
  gap?: ResponsiveConfig<number>
): ResponsiveConfig<LayoutConfig> {
  const baseLayout: LayoutConfig = {
    display: 'grid',
    gridTemplateColumns: `repeat(${typeof columns.base === 'number' ? columns.base : columns.base}, 1fr)`,
    gridColumnGap: typeof gap?.base === 'number' ? `${gap.base}px` : gap?.base,
    gridRowGap: typeof gap?.base === 'number' ? `${gap.base}px` : gap?.base,
  }

  const layout: ResponsiveConfig<LayoutConfig> = {
    base: baseLayout,
  }

  // 为每个断点生成配置
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  breakpoints.forEach(bp => {
    const colValue = typeof columns[bp] === 'number' ? columns[bp] : columns.base
    const gapValue = gap?.[bp] ?? gap?.base

    if (colValue !== undefined) {
      layout[bp] = {
        display: 'grid',
        gridTemplateColumns: `repeat(${colValue}, 1fr)`,
        gridColumnGap: typeof gapValue === 'number' ? `${gapValue}px` : gapValue,
        gridRowGap: typeof gapValue === 'number' ? `${gapValue}px` : gapValue,
      }
    }
  })

  return layout
}

/**
 * 创建 Flex 布局配置
 */
export function createFlexLayout(
  direction: ResponsiveConfig<'row' | 'column'>,
  wrap?: boolean,
  justify?: string,
  align?: string
): ResponsiveConfig<LayoutConfig> {
  const baseLayout: LayoutConfig = {
    display: 'flex',
    flexDirection: direction.base,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    justifyContent: justify as unknown as LayoutConfig['justifyContent'],
    alignItems: align as unknown as LayoutConfig['alignItems'],
  }

  const layout: ResponsiveConfig<LayoutConfig> = {
    base: baseLayout,
  }

  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  breakpoints.forEach(bp => {
    if (direction[bp]) {
      layout[bp] = {
        display: 'flex',
        flexDirection: direction[bp],
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent: justify as unknown as LayoutConfig['justifyContent'],
        alignItems: align as unknown as LayoutConfig['alignItems'],
      }
    }
  })

  return layout
}

/**
 * 创建间距配置
 */
export function createSpacingConfig(
  margin?: string | ResponsiveConfig<string>,
  padding?: string | ResponsiveConfig<string>
): {
  margin: ResponsiveConfig<SpacingConfig>
  padding: ResponsiveConfig<SpacingConfig>
} {
  const marginConfig: ResponsiveConfig<SpacingConfig> = {
    base: {},
  }

  const paddingConfig: ResponsiveConfig<SpacingConfig> = {
    base: {},
  }

  if (typeof margin === 'string') {
    marginConfig.base.margin = margin
  } else if (margin) {
    marginConfig.base = { margin: margin.base }
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    breakpoints.forEach(bp => {
      if (margin[bp]) {
        marginConfig[bp] = { margin: margin[bp] }
      }
    })
  }

  if (typeof padding === 'string') {
    paddingConfig.base.padding = padding
  } else if (padding) {
    paddingConfig.base = { padding: padding.base }
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    breakpoints.forEach(bp => {
      if (padding[bp]) {
        paddingConfig[bp] = { padding: padding[bp] }
      }
    })
  }

  return {
    margin: marginConfig,
    padding: paddingConfig,
  }
}

/**
 * 验证响应式配置
 */
export function validateResponsiveConfig(
  config: ResponsiveComponentConfig
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // 必填字段检查
  if (!config.id) errors.push('缺少组件 ID')
  if (!config.name) errors.push('缺少组件名称')
  if (!config.type) errors.push('缺少组件类型')

  // 布局配置检查
  if (!config.layout) {
    warnings.push('缺少布局配置')
  }

  // 间距配置检查
  if (!config.spacing) {
    suggestions.push('建议添加间距配置以确保响应式一致性')
  }

  // 尺寸配置检查
  if (!config.size) {
    suggestions.push('建议添加尺寸配置以支持多设备适配')
  }

  // 可见性配置检查
  if (!config.visibility) {
    warnings.push('缺少可见性配置')
  }

  // 检查断点配置的一致性
  const allBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  
  // 检查布局断点
  if (config.layout) {
    const layoutBreakpoints = Object.keys(config.layout).filter(
      key => key !== 'base'
    ) as Breakpoint[]
    
    layoutBreakpoints.forEach(bp => {
      if (!allBreakpoints.includes(bp)) {
        warnings.push(`未知的断点：${bp}`)
      }
    })
  }

  // 检查栅格配置
  if (config.grid) {
    const gridBreakpoints = Object.keys(config.grid).filter(
      key => key !== 'base'
    ) as Breakpoint[]

    gridBreakpoints.forEach(bp => {
      const gridConfig = config.grid?.[bp]
      if (gridConfig?.column) {
        const colNum = parseInt(gridConfig.column)
        if (isNaN(colNum) || colNum < 1 || colNum > 12) {
          errors.push(`断点 ${bp} 的栅格列数必须在 1-12 之间`)
        }
      }
    })
  }

  // 检查可见性冲突
  if (config.visibility.hiddenOn && config.visibility.visibleOn) {
    const conflict = config.visibility.hiddenOn.some(bp =>
      config.visibility.visibleOn?.includes(bp)
    )
    if (conflict) {
      errors.push('hiddenOn 和 visibleOn 存在冲突的断点')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * 生成响应式 CSS 类名
 */
export function generateResponsiveCSS(
  config: ResponsiveComponentConfig
): string {
  let css = `/* ${config.name} - ${config.type} */\n`
  css += `.${config.id} {\n`

  // 基础样式
  const baseLayout = config.layout.base
  if (baseLayout) {
    css += generateLayoutCSS(baseLayout, '  ')
  }

  const baseSpacing = config.spacing.base
  if (baseSpacing) {
    css += generateSpacingCSS(baseSpacing, '  ')
  }

  const baseSize = config.size.base
  if (baseSize) {
    css += generateSizeCSS(baseSize, '  ')
  }

  css += `}\n\n`

  // 断点样式
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  breakpoints.forEach(bp => {
    const breakpointConfig = defaultBreakpoints.find(b => b.name === bp)
    if (!breakpointConfig) return

    const layout = config.layout[bp]
    const spacing = config.spacing[bp]
    const size = config.size[bp]

    if (layout || spacing || size) {
      const minWidth = breakpointConfig.minWidth
      const maxWidth = breakpointConfig.maxWidth

      let mediaQuery = `@media (min-width: ${minWidth}px)`
      if (maxWidth) {
        mediaQuery += ` and (max-width: ${maxWidth}px)`
      }

      css += `${mediaQuery} {\n`
      css += `  .${config.id} {\n`

      if (layout) {
        css += generateLayoutCSS(layout, '    ')
      }
      if (spacing) {
        css += generateSpacingCSS(spacing, '    ')
      }
      if (size) {
        css += generateSizeCSS(size, '    ')
      }

      css += `  }\n`
      css += `}\n\n`
    }
  })

  // 可见性样式
  if (config.visibility.hiddenOn) {
    config.visibility.hiddenOn.forEach(bp => {
      const breakpointConfig = defaultBreakpoints.find(b => b.name === bp)
      if (!breakpointConfig) return

      const minWidth = breakpointConfig.minWidth
      const maxWidth = breakpointConfig.maxWidth

      let mediaQuery = `@media (min-width: ${minWidth}px)`
      if (maxWidth) {
        mediaQuery += ` and (max-width: ${maxWidth}px)`
      }

      css += `${mediaQuery} {\n`
      css += `  .${config.id} {\n`
      css += `    display: none !important;\n`
      css += `  }\n`
      css += `}\n\n`
    })
  }

  return css
}

/**
 * 生成布局 CSS
 */
function generateLayoutCSS(layout: LayoutConfig, indent: string = ''): string {
  let css = ''

  if (layout.display) css += `${indent}display: ${layout.display};\n`
  if (layout.flexDirection) css += `${indent}flex-direction: ${layout.flexDirection};\n`
  if (layout.flexWrap) css += `${indent}flex-wrap: ${layout.flexWrap};\n`
  if (layout.justifyContent) css += `${indent}justify-content: ${layout.justifyContent};\n`
  if (layout.alignItems) css += `${indent}align-items: ${layout.alignItems};\n`
  if (layout.alignContent) css += `${indent}align-content: ${layout.alignContent};\n`
  if (layout.gridTemplateColumns) css += `${indent}grid-template-columns: ${layout.gridTemplateColumns};\n`
  if (layout.gridTemplateRows) css += `${indent}grid-template-rows: ${layout.gridTemplateRows};\n`
  if (layout.gridColumnGap) css += `${indent}grid-column-gap: ${layout.gridColumnGap};\n`
  if (layout.gridRowGap) css += `${indent}grid-row-gap: ${layout.gridRowGap};\n`

  return css
}

/**
 * 生成间距 CSS
 */
function generateSpacingCSS(spacing: SpacingConfig, indent: string = ''): string {
  let css = ''

  if (spacing.margin) css += `${indent}margin: ${spacing.margin};\n`
  if (spacing.marginTop) css += `${indent}margin-top: ${spacing.marginTop};\n`
  if (spacing.marginRight) css += `${indent}margin-right: ${spacing.marginRight};\n`
  if (spacing.marginBottom) css += `${indent}margin-bottom: ${spacing.marginBottom};\n`
  if (spacing.marginLeft) css += `${indent}margin-left: ${spacing.marginLeft};\n`
  if (spacing.padding) css += `${indent}padding: ${spacing.padding};\n`
  if (spacing.paddingTop) css += `${indent}padding-top: ${spacing.paddingTop};\n`
  if (spacing.paddingRight) css += `${indent}padding-right: ${spacing.paddingRight};\n`
  if (spacing.paddingBottom) css += `${indent}padding-bottom: ${spacing.paddingBottom};\n`
  if (spacing.paddingLeft) css += `${indent}padding-left: ${spacing.paddingLeft};\n`

  return css
}

/**
 * 生成尺寸 CSS
 */
function generateSizeCSS(size: SizeConfig, indent: string = ''): string {
  let css = ''

  if (size.width) css += `${indent}width: ${size.width};\n`
  if (size.minWidth) css += `${indent}min-width: ${size.minWidth};\n`
  if (size.maxWidth) css += `${indent}max-width: ${size.maxWidth};\n`
  if (size.height) css += `${indent}height: ${size.height};\n`
  if (size.minHeight) css += `${indent}min-height: ${size.minHeight};\n`
  if (size.maxHeight) css += `${indent}max-height: ${size.maxHeight};\n`

  return css
}

/**
 * 生成 Tailwind CSS 类名
 */
export function generateTailwindClasses(
  config: ResponsiveComponentConfig
): string {
  const classes: string[] = []

  // 基础布局类
  const baseLayout = config.layout.base
  if (baseLayout) {
    classes.push(...generateTailwindLayoutClasses(baseLayout))
  }

  // 基础间距类
  const baseSpacing = config.spacing.base
  if (baseSpacing) {
    classes.push(...generateTailwindSpacingClasses(baseSpacing))
  }

  // 基础尺寸类
  const baseSize = config.size.base
  if (baseSize) {
    classes.push(...generateTailwindSizeClasses(baseSize))
  }

  // 断点类
  const breakpoints: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
  breakpoints.forEach(bp => {
    const layout = config.layout[bp]
    const spacing = config.spacing[bp]
    const size = config.size[bp]

    if (layout) {
      generateTailwindLayoutClasses(layout).forEach(cls => {
        classes.push(`${bp}:${cls}`)
      })
    }

    if (spacing) {
      generateTailwindSpacingClasses(spacing).forEach(cls => {
        classes.push(`${bp}:${cls}`)
      })
    }

    if (size) {
      generateTailwindSizeClasses(size).forEach(cls => {
        classes.push(`${bp}:${cls}`)
      })
    }
  })

  // 可见性类
  if (config.visibility.hiddenOn) {
    config.visibility.hiddenOn.forEach(bp => {
      classes.push(`${bp}:hidden`)
    })
  }

  return classes.join(' ')
}

/**
 * 生成 Tailwind 布局类
 */
function generateTailwindLayoutClasses(layout: LayoutConfig): string[] {
  const classes: string[] = []

  const displayMap: Record<string, string> = {
    block: 'block',
    flex: 'flex',
    grid: 'grid',
    'inline-block': 'inline-block',
    'inline-flex': 'inline-flex',
    'inline-grid': 'inline-grid',
  }

  if (layout.display && displayMap[layout.display]) {
    classes.push(displayMap[layout.display])
  }

  if (layout.flexDirection) {
    const dirMap: Record<string, string> = {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      column: 'flex-col',
      'column-reverse': 'flex-col-reverse',
    }
    if (dirMap[layout.flexDirection]) {
      classes.push(dirMap[layout.flexDirection])
    }
  }

  if (layout.flexWrap) {
    const wrapMap: Record<string, string> = {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    }
    if (wrapMap[layout.flexWrap]) {
      classes.push(wrapMap[layout.flexWrap])
    }
  }

  if (layout.justifyContent) {
    const justifyMap: Record<string, string> = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }
    if (justifyMap[layout.justifyContent]) {
      classes.push(justifyMap[layout.justifyContent])
    }
  }

  if (layout.alignItems) {
    const alignMap: Record<string, string> = {
      stretch: 'items-stretch',
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
    }
    if (alignMap[layout.alignItems]) {
      classes.push(alignMap[layout.alignItems])
    }
  }

  return classes
}

/**
 * 生成 Tailwind 间距类
 */
function generateTailwindSpacingClasses(spacing: SpacingConfig): string[] {
  const classes: string[] = []

  const spacingMap: Record<string, string> = {
    margin: 'm',
    marginTop: 'mt',
    marginRight: 'mr',
    marginBottom: 'mb',
    marginLeft: 'ml',
    padding: 'p',
    paddingTop: 'pt',
    paddingRight: 'pr',
    paddingBottom: 'pb',
    paddingLeft: 'pl',
  }

  Object.entries(spacing).forEach(([key, value]) => {
    const prefix = spacingMap[key]
    if (prefix && value) {
      // 简化处理，实际应该解析值并映射到 Tailwind 间距尺度
      classes.push(`${prefix}-${value}`)
    }
  })

  return classes
}

/**
 * 生成 Tailwind 尺寸类
 */
function generateTailwindSizeClasses(size: SizeConfig): string[] {
  const classes: string[] = []

  const sizeMap: Record<string, string> = {
    width: 'w',
    minWidth: 'min-w',
    maxWidth: 'max-w',
    height: 'h',
    minHeight: 'min-h',
    maxHeight: 'max-h',
  }

  Object.entries(size).forEach(([key, value]) => {
    const prefix = sizeMap[key]
    if (prefix && value) {
      classes.push(`${prefix}-${value}`)
    }
  })

  return classes
}

/**
 * 生成响应式 ID
 */
function generateResponsiveId(): string {
  return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 预定义的响应式布局模板
 */
export const commonResponsiveLayouts: Record<string, ResponsiveConfig<LayoutConfig>> = {
  // 容器
  container: {
    base: {
      display: 'block',
      maxWidth: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: '16px',
      paddingRight: '16px',
    },
    sm: {
      display: 'block',
      maxWidth: '640px',
    },
    md: {
      display: 'block',
      maxWidth: '768px',
      paddingLeft: '24px',
      paddingRight: '24px',
    },
    lg: {
      display: 'block',
      maxWidth: '1024px',
    },
    xl: {
      display: 'block',
      maxWidth: '1280px',
    },
    '2xl': {
      display: 'block',
      maxWidth: '1536px',
    },
  },

  // Flex 行
  flexRow: {
    base: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginLeft: '-8px',
      marginRight: '-8px',
    },
  },

  // Flex 列
  flexCol: {
    base: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  // 栅格
  grid: {
    base: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '16px',
    },
    sm: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    md: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    },
    lg: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
    xl: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '32px',
    },
  },

  // 响应式隐藏
  hideOnMobile: {
    base: {
      display: 'block',
    },
    xs: {
      display: 'none' as const,
    },
    sm: {
      display: 'none' as const,
    },
  },

  // 响应式显示
  showOnMobile: {
    base: {
      display: 'block',
    },
    md: {
      display: 'none' as const,
    },
    lg: {
      display: 'none' as const,
    },
    xl: {
      display: 'none' as const,
    },
    '2xl': {
      display: 'none' as const,
    },
  },
}

export default {
  createResponsiveConfig,
  getResponsiveValue,
  createResponsiveComponentConfig,
  createGridLayout,
  createFlexLayout,
  createSpacingConfig,
  validateResponsiveConfig,
  generateResponsiveCSS,
  generateTailwindClasses,
  commonResponsiveLayouts,
  defaultBreakpoints,
}
