/**
 * 组件库定义系统
 * 用于定义和管理可复用的 UI 组件库
 */

/**
 * 组件类别
 */
export type ComponentCategory =
  | 'layout'       // 布局组件
  | 'typography'   // 排版组件
  | 'form'         // 表单组件
  | 'button'       // 按钮组件
  | 'navigation'   // 导航组件
  | 'data-display' // 数据展示
  | 'feedback'     // 反馈组件
  | 'overlay'      // 浮层组件
  | 'media'        // 媒体组件
  | 'other'        // 其他

/**
 * 组件变体
 */
export interface ComponentVariant {
  name: string
  description?: string
  props?: Record<string, unknown>
  styles?: Record<string, unknown>
}

/**
 * 组件尺寸
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * 组件属性定义
 */
export interface ComponentProp {
  name: string
  type: string
  required: boolean
  defaultValue?: unknown
  description?: string
  options?: string[]
  validation?: string
}

/**
 * 组件事件定义
 */
export interface ComponentEvent {
  name: string
  description?: string
  payload?: {
    name: string
    type: string
    description?: string
  }[]
}

/**
 * 组件插槽定义
 */
export interface ComponentSlot {
  name: string
  description?: string
  props?: Record<string, string>
  fallback?: string
}

/**
 * 组件定义
 */
export interface ComponentDefinition {
  id: string
  name: string
  category: ComponentCategory
  description: string
  version: string
  author?: string
  props: ComponentProp[]
  events: ComponentEvent[]
  slots: ComponentSlot[]
  variants: ComponentVariant[]
  sizes: ComponentSize[]
  dependencies: string[]
  examples: Array<{
    title: string
    code: string
    description?: string
  }>
  responsive?: boolean
  accessibility?: {
    role?: string
    ariaAttributes?: string[]
    keyboardNavigation?: boolean
  }
  metadata?: {
    createdAt?: string
    updatedAt?: string
    tags?: string[]
  }
}

/**
 * 组件库定义
 */
export interface ComponentLibrary {
  id: string
  name: string
  version: string
  description: string
  framework: 'React' | 'Vue' | 'Angular' | 'Svelte' | 'Web Components'
  language: 'TypeScript' | 'JavaScript'
  styling: 'CSS' | 'Sass' | 'Less' | 'Styled Components' | 'Emotion' | 'Tailwind'
  components: ComponentDefinition[]
  designTokens?: Record<string, unknown>
  theme?: {
    colors: Record<string, string>
    typography: Record<string, string>
    spacing: Record<string, string>
    breakpoints: Record<string, string>
  }
  metadata?: {
    createdAt?: string
    updatedAt?: string
    author?: string
    license?: string
  }
}

/**
 * 创建组件定义
 */
export function createComponentDefinition(
  name: string,
  category: ComponentCategory,
  description: string,
  overrides?: Partial<ComponentDefinition>
): ComponentDefinition {
  const baseComponent: ComponentDefinition = {
    id: generateComponentId(),
    name,
    category,
    description,
    version: '1.0.0',
    props: [],
    events: [],
    slots: [],
    variants: [],
    sizes: ['md'],
    dependencies: [],
    examples: [],
    responsive: true,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    },
  }

  if (overrides) {
    Object.assign(baseComponent, overrides)
  }

  return baseComponent
}

/**
 * 添加组件属性
 */
export function addComponentProp(
  component: ComponentDefinition,
  prop: ComponentProp
): ComponentDefinition {
  return {
    ...component,
    props: [...component.props, prop],
    metadata: {
      ...component.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加组件事件
 */
export function addComponentEvent(
  component: ComponentDefinition,
  event: ComponentEvent
): ComponentDefinition {
  return {
    ...component,
    events: [...component.events, event],
    metadata: {
      ...component.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加组件插槽
 */
export function addComponentSlot(
  component: ComponentDefinition,
  slot: ComponentSlot
): ComponentDefinition {
  return {
    ...component,
    slots: [...component.slots, slot],
    metadata: {
      ...component.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加组件变体
 */
export function addComponentVariant(
  component: ComponentDefinition,
  variant: ComponentVariant
): ComponentDefinition {
  return {
    ...component,
    variants: [...component.variants, variant],
    metadata: {
      ...component.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加组件示例
 */
export function addComponentExample(
  component: ComponentDefinition,
  example: {
    title: string
    code: string
    description?: string
  }
): ComponentDefinition {
  return {
    ...component,
    examples: [...component.examples, example],
    metadata: {
      ...component.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 创建组件库
 */
export function createComponentLibrary(
  name: string,
  framework: 'React' | 'Vue' | 'Angular' | 'Svelte' | 'Web Components',
  styling: 'CSS' | 'Sass' | 'Less' | 'Styled Components' | 'Emotion' | 'Tailwind',
  overrides?: Partial<ComponentLibrary>
): ComponentLibrary {
  const baseLibrary: ComponentLibrary = {
    id: generateLibraryId(),
    name,
    version: '1.0.0',
    description: '',
    framework,
    language: 'TypeScript',
    styling,
    components: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  if (overrides) {
    Object.assign(baseLibrary, overrides)
  }

  return baseLibrary
}

/**
 * 添加组件到库
 */
export function addComponentToLibrary(
  library: ComponentLibrary,
  component: ComponentDefinition
): ComponentLibrary {
  return {
    ...library,
    components: [...library.components, component],
    metadata: {
      ...library.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 验证组件定义
 */
export function validateComponentDefinition(
  component: ComponentDefinition
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
  if (!component.id) errors.push('缺少组件 ID')
  if (!component.name) errors.push('缺少组件名称')
  if (!component.category) errors.push('缺少组件类别')
  if (!component.description) warnings.push('建议添加组件描述')

  // 命名规范检查
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(component.name)) {
    errors.push(`组件名称 "${component.name}" 不符合 PascalCase 命名规范`)
  }

  // 版本号检查
  if (!/^\d+\.\d+\.\d+$/.test(component.version)) {
    warnings.push(`版本号 "${component.version}" 建议遵循 semver 规范`)
  }

  // 属性检查
  if (component.props.length === 0) {
    suggestions.push('建议添加组件属性定义')
  }

  component.props.forEach(prop => {
    if (!prop.type) {
      errors.push(`属性 "${prop.name}" 缺少类型定义`)
    }

    if (prop.required && prop.defaultValue !== undefined) {
      warnings.push(`必填属性 "${prop.name}" 不应有默认值`)
    }
  })

  // 变体检查
  if (component.variants.length === 0) {
    suggestions.push('建议添加组件变体以增强灵活性')
  }

  // 示例检查
  if (component.examples.length === 0) {
    suggestions.push('建议添加使用示例')
  }

  // 可访问性检查
  if (!component.accessibility) {
    suggestions.push('建议添加可访问性配置')
  } else {
    if (!component.accessibility.role) {
      suggestions.push('建议添加 ARIA role')
    }
    if (!component.accessibility.keyboardNavigation) {
      warnings.push('建议支持键盘导航')
    }
  }

  // 响应式检查
  if (!component.responsive) {
    warnings.push('组件不支持响应式可能影响移动端体验')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * 生成组件文档
 */
export function generateComponentDocumentation(
  component: ComponentDefinition
): string {
  let doc = `# ${component.name} 组件\n\n`
  doc += `**类别**: ${component.category}\n\n`
  doc += `**版本**: ${component.version}\n\n`
  doc += `**描述**: ${component.description}\n\n`

  if (component.metadata?.tags && component.metadata.tags.length > 0) {
    doc += `**标签**: ${component.metadata.tags.join(', ')}\n\n`
  }

  // 特性
  doc += `## 特性\n\n`
  if (component.responsive) {
    doc += '- ✅ 响应式设计\n'
  }
  if (component.accessibility?.keyboardNavigation) {
    doc += '- ✅ 键盘导航支持\n'
  }
  if (component.accessibility?.role) {
    doc += `- ✅ ARIA Role: ${component.accessibility.role}\n`
  }
  doc += '\n'

  // 安装
  if (component.dependencies.length > 0) {
    doc += `## 依赖\n\n`
    component.dependencies.forEach(dep => {
      doc += `- ${dep}\n`
    })
    doc += '\n'
  }

  // 尺寸
  if (component.sizes.length > 0) {
    doc += `## 尺寸\n\n`
    doc += `支持的尺寸：${component.sizes.join(', ')}\n\n`
  }

  // 变体
  if (component.variants.length > 0) {
    doc += `## 变体\n\n`
    component.variants.forEach(variant => {
      doc += `### ${variant.name}\n`
      if (variant.description) {
        doc += `${variant.description}\n\n`
      }
    })
  }

  // Props
  if (component.props.length > 0) {
    doc += `## Props\n\n`
    doc += `| 属性名 | 类型 | 必填 | 默认值 | 描述 |\n`
    doc += `|--------|------|------|--------|------|\n`
    component.props.forEach(prop => {
      const required = prop.required ? '是' : '否'
      const defaultValue = prop.defaultValue ?? '-'
      const description = prop.description || '-'
      doc += `| ${prop.name} | \`${prop.type}\` | ${required} | ${defaultValue} | ${description} |\n`
    })
    doc += '\n'
  }

  // Events
  if (component.events.length > 0) {
    doc += `## Events\n\n`
    doc += `| 事件名 | 描述 | 载荷 |\n`
    doc += `|--------|------|------|\n`
    component.events.forEach(event => {
      const payload = event.payload
        ? event.payload.map(p => `${p.name}: ${p.type}`).join(', ')
        : '-'
      doc += `| ${event.name} | ${event.description || '-'} | ${payload} |\n`
    })
    doc += '\n'
  }

  // Slots
  if (component.slots.length > 0) {
    doc += `## Slots\n\n`
    doc += `| 插槽名 | 描述 | 作用域 Props |\n`
    doc += `|--------|------|------------|\n`
    component.slots.forEach(slot => {
      const scopeProps = slot.props
        ? Object.entries(slot.props)
            .map(([name, type]) => `${name}: ${type}`)
            .join(', ')
        : '-'
      doc += `| ${slot.name} | ${slot.description || '-'} | ${scopeProps} |\n`
    })
    doc += '\n'
  }

  // 示例
  if (component.examples.length > 0) {
    doc += `## 使用示例\n\n`
    component.examples.forEach((example, index) => {
      doc += `### ${index + 1}. ${example.title}\n\n`
      if (example.description) {
        doc += `${example.description}\n\n`
      }
      doc += '```tsx\n'
      doc += example.code
      doc += '\n```\n\n'
    })
  }

  // 可访问性
  if (component.accessibility) {
    doc += `## 可访问性\n\n`
    if (component.accessibility.role) {
      doc += `- **ARIA Role**: ${component.accessibility.role}\n`
    }
    if (component.accessibility.ariaAttributes && component.accessibility.ariaAttributes.length > 0) {
      doc += `- **ARIA Attributes**: ${component.accessibility.ariaAttributes.join(', ')}\n`
    }
    if (component.accessibility.keyboardNavigation) {
      doc += '- **键盘导航**: 支持\n'
      doc += '  - `Tab`: 聚焦到组件\n'
      doc += '  - `Enter` / `Space`: 触发点击\n'
      doc += '  - `Esc`: 关闭（如适用）\n'
    }
    doc += '\n'
  }

  return doc
}

/**
 * 生成组件库文档
 */
export function generateLibraryDocumentation(
  library: ComponentLibrary
): string {
  let doc = `# ${library.name} 组件库文档\n\n`
  doc += `**版本**: ${library.version}\n\n`
  doc += `**框架**: ${library.framework}\n\n`
  doc += `**语言**: ${library.language}\n\n`
  doc += `**样式方案**: ${library.styling}\n\n`
  doc += `**描述**: ${library.description}\n\n`

  if (library.metadata?.author) {
    doc += `**作者**: ${library.metadata.author}\n\n`
  }

  if (library.metadata?.license) {
    doc += `**许可证**: ${library.metadata.license}\n\n`
  }

  // 组件列表
  doc += `## 组件列表\n\n`
  doc += `共 **${library.components.length}** 个组件\n\n`

  // 按类别分组
  const categories: Record<ComponentCategory, ComponentDefinition[]> = {
    layout: [],
    typography: [],
    form: [],
    button: [],
    navigation: [],
    'data-display': [],
    feedback: [],
    overlay: [],
    media: [],
    other: [],
  }

  library.components.forEach(component => {
    categories[component.category].push(component)
  })

  Object.entries(categories).forEach(([category, components]) => {
    if (components.length > 0) {
      doc += `### ${category === 'data-display' ? '数据展示' : category}\n\n`
      components.forEach(component => {
        doc += `- [${component.name}](#${component.name.toLowerCase()}) - ${component.description}\n`
      })
      doc += '\n'
    }
  })

  // 设计令牌
  if (library.designTokens) {
    doc += `## 设计令牌\n\n`
    doc += '```json\n'
    doc += JSON.stringify(library.designTokens, null, 2)
    doc += '\n```\n\n'
  }

  // 主题配置
  if (library.theme) {
    doc += `## 主题配置\n\n`
    
    if (library.theme.colors) {
      doc += `### 颜色\n\n`
      Object.entries(library.theme.colors).forEach(([name, value]) => {
        doc += `- **${name}**: \`${value}\`\n`
      })
      doc += '\n'
    }

    if (library.theme.typography) {
      doc += `### 字体\n\n`
      Object.entries(library.theme.typography).forEach(([name, value]) => {
        doc += `- **${name}**: \`${value}\`\n`
      })
      doc += '\n'
    }

    if (library.theme.spacing) {
      doc += `### 间距\n\n`
      Object.entries(library.theme.spacing).forEach(([name, value]) => {
        doc += `- **${name}**: \`${value}\`\n`
      })
      doc += '\n'
    }

    if (library.theme.breakpoints) {
      doc += `### 断点\n\n`
      Object.entries(library.theme.breakpoints).forEach(([name, value]) => {
        doc += `- **${name}**: \`${value}\`\n`
      })
      doc += '\n'
    }
  }

  // 组件详细文档
  doc += `## 组件详细文档\n\n`
  library.components.forEach(component => {
    doc += `---\n\n`
    doc += generateComponentDocumentation(component)
  })

  return doc
}

/**
 * 生成组件 ID
 */
function generateComponentId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成组件库 ID
 */
function generateLibraryId(): string {
  return `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 预定义的通用组件
 */
export const commonComponents: Record<string, Partial<ComponentDefinition>> = {
  // 按钮
  Button: {
    name: 'Button',
    category: 'button',
    description: '按钮组件，用于触发操作',
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'danger'", required: false, defaultValue: 'primary', description: '按钮变体' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", required: false, defaultValue: 'md', description: '按钮尺寸' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false, description: '是否禁用' },
      { name: 'loading', type: 'boolean', required: false, defaultValue: false, description: '是否加载中' },
      { name: 'onClick', type: '(event: MouseEvent) => void', required: false, description: '点击事件' },
    ],
    events: [
      { name: 'click', description: '点击按钮时触发', payload: [{ name: 'event', type: 'MouseEvent', description: '鼠标事件' }] },
    ],
    variants: [
      { name: 'primary', description: '主按钮，用于主要操作' },
      { name: 'secondary', description: '次按钮，用于次要操作' },
      { name: 'danger', description: '危险按钮，用于删除等危险操作' },
    ],
    sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
    accessibility: {
      role: 'button',
      keyboardNavigation: true,
    },
  },

  // 输入框
  Input: {
    name: 'Input',
    category: 'form',
    description: '输入框组件，用于文本输入',
    props: [
      { name: 'value', type: 'string', required: true, description: '输入值' },
      { name: 'onChange', type: '(value: string) => void', required: true, description: '值变更事件' },
      { name: 'placeholder', type: 'string', required: false, description: '占位符' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false, description: '是否禁用' },
      { name: 'error', type: 'string', required: false, description: '错误消息' },
    ],
    events: [
      { name: 'change', description: '值变更时触发', payload: [{ name: 'value', type: 'string', description: '新值' }] },
      { name: 'focus', description: '聚焦时触发' },
      { name: 'blur', description: '失焦时触发' },
    ],
    variants: [
      { name: 'outlined', description: '边框样式' },
      { name: 'filled', description: '填充样式' },
    ],
    sizes: ['sm', 'md', 'lg'],
    accessibility: {
      role: 'textbox',
      ariaAttributes: ['aria-label', 'aria-describedby', 'aria-invalid'],
      keyboardNavigation: true,
    },
  },

  // 卡片
  Card: {
    name: 'Card',
    category: 'layout',
    description: '卡片组件，用于内容分组',
    props: [
      { name: 'title', type: 'string', required: false, description: '卡片标题' },
      { name: 'bordered', type: 'boolean', required: false, defaultValue: true, description: '是否显示边框' },
      { name: 'shadow', type: "'sm' | 'md' | 'lg'", required: false, defaultValue: 'md', description: '阴影大小' },
    ],
    slots: [
      { name: 'header', description: '卡片头部' },
      { name: 'default', description: '卡片内容' },
      { name: 'footer', description: '卡片底部' },
    ],
    variants: [
      { name: 'default', description: '默认卡片' },
      { name: 'hoverable', description: '可悬停卡片' },
    ],
    sizes: ['sm', 'md', 'lg'],
    responsive: true,
  },
}

export default {
  createComponentDefinition,
  addComponentProp,
  addComponentEvent,
  addComponentSlot,
  addComponentVariant,
  addComponentExample,
  createComponentLibrary,
  addComponentToLibrary,
  validateComponentDefinition,
  generateComponentDocumentation,
  generateLibraryDocumentation,
  commonComponents,
}
