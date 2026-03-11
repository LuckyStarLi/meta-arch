/**
 * 节点元数据增强系统
 * 为节点提供丰富的元数据信息，用于 AI 代码生成和设计验证
 */

/**
 * 节点技术栈元数据
 */
export interface TechStackMetadata {
  language?: string
  framework?: string
  library?: string[]
  version?: string
  dependencies?: string[]
  config?: Record<string, unknown>
}

/**
 * 节点交互元数据
 */
export interface InteractionMetadata {
  triggers?: Array<{
    event: string
    action: string
    target?: string
    payload?: Record<string, unknown>
  }>
  handlers?: Array<{
    method: string
    params?: string[]
    returnType?: string
    async?: boolean
  }>
  stateChanges?: Array<{
    state: string
    oldValue?: unknown
    newValue: unknown
    condition?: string
  }>
}

/**
 * 节点数据流元数据
 */
export interface DataFlowMetadata {
  inputs?: Array<{
    name: string
    type: string
    source?: string
    required: boolean
    defaultValue?: unknown
  }>
  outputs?: Array<{
    name: string
    type: string
    destination?: string
  }>
  transformations?: Array<{
    input: string
    output: string
    logic: string
  }>
}

/**
 * 节点安全元数据
 */
export interface SecurityMetadata {
  authentication?: boolean
  authorization?: {
    required: boolean
    roles?: string[]
    permissions?: string[]
  }
  validation?: {
    inputValidation: boolean
    outputEncoding: boolean
    sanitization: boolean
  }
  encryption?: {
    dataAtRest: boolean
    dataInTransit: boolean
    algorithm?: string
  }
}

/**
 * 节点性能元数据
 */
export interface PerformanceMetadata {
  caching?: {
    enabled: boolean
    strategy?: 'lru' | 'lfu' | 'fifo' | 'ttl'
    ttl?: number
    maxSize?: number
  }
  optimization?: {
    lazyLoading?: boolean
    virtualScrolling?: boolean
    memoization?: boolean
    debouncing?: boolean
    throttling?: boolean
  }
  scaling?: {
    horizontal?: boolean
    vertical?: boolean
    minInstances?: number
    maxInstances?: number
  }
}

/**
 * 节点文档元数据
 */
export interface DocumentationMetadata {
  description?: string
  tags?: string[]
  author?: string
  createdAt?: string
  updatedAt?: string
  version?: string
  changelog?: Array<{
    version: string
    date: string
    changes: string[]
  }>
  examples?: Array<{
    title: string
    code: string
    description?: string
  }>
}

/**
 * 节点 AI 提示元数据
 */
export interface AIPromptMetadata {
  context?: string
  constraints?: string[]
  preferences?: {
    codeStyle?: string
    patterns?: string[]
    antiPatterns?: string[]
  }
  examples?: Array<{
    input: string
    output: string
    explanation?: string
  }>
}

/**
 * 节点响应式元数据
 */
export interface ResponsiveMetadata {
  breakpoints?: {
    mobile?: string
    tablet?: string
    desktop?: string
    widescreen?: string
  }
  layouts?: Array<{
    breakpoint: string
    layout: 'single-column' | 'multi-column' | 'grid' | 'flex'
    columns?: number
    gaps?: string
  }>
  visibility?: {
    hideOnMobile?: boolean
    hideOnTablet?: boolean
    hideOnDesktop?: boolean
  }
}

/**
 * 完整的节点元数据接口
 */
export interface NodeMetadata {
  id: string
  type: string
  name: string
  techStack?: TechStackMetadata
  interaction?: InteractionMetadata
  dataFlow?: DataFlowMetadata
  security?: SecurityMetadata
  performance?: PerformanceMetadata
  documentation?: DocumentationMetadata
  aiPrompt?: AIPromptMetadata
  responsive?: ResponsiveMetadata
  custom?: Record<string, unknown>
}

/**
 * 创建节点元数据
 */
export function createNodeMetadata(
  type: string,
  name: string,
  overrides?: Partial<NodeMetadata>
): NodeMetadata {
  const baseMetadata: NodeMetadata = {
    id: generateMetadataId(),
    type,
    name,
    documentation: {
      description: '',
      tags: [],
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  // 根据节点类型添加默认元数据
  const typeSpecificDefaults = getTypeSpecificDefaults(type)
  Object.assign(baseMetadata, typeSpecificDefaults)

  // 应用覆盖
  if (overrides) {
    Object.assign(baseMetadata, overrides)
  }

  return baseMetadata
}

/**
 * 根据节点类型生成默认元数据
 */
function getTypeSpecificDefaults(type: string): Partial<NodeMetadata> {
  switch (type) {
    case 'component':
      return {
        techStack: {
          language: 'TypeScript',
          framework: 'React',
          library: ['React Hooks'],
        },
        interaction: {
          triggers: [],
          handlers: [],
          stateChanges: [],
        },
        responsive: {
          breakpoints: {
            mobile: '640px',
            tablet: '768px',
            desktop: '1024px',
            widescreen: '1280px',
          },
        },
      }

    case 'service':
      return {
        techStack: {
          language: 'TypeScript',
          framework: 'Node.js',
        },
        security: {
          authentication: true,
          authorization: {
            required: true,
            roles: ['user', 'admin'],
          },
          validation: {
            inputValidation: true,
            outputEncoding: true,
            sanitization: true,
          },
        },
        performance: {
          caching: {
            enabled: false,
          },
        },
      }

    case 'database':
    case 'table':
      return {
        techStack: {
          language: 'SQL',
        },
        security: {
          encryption: {
            dataAtRest: true,
            dataInTransit: true,
          },
        },
        performance: {
          optimization: {
            lazyLoading: false,
          },
        },
      }

    case 'api':
    case 'endpoint':
      return {
        techStack: {
          language: 'TypeScript',
          framework: 'Express',
        },
        dataFlow: {
          inputs: [],
          outputs: [],
          transformations: [],
        },
        security: {
          authentication: true,
          validation: {
            inputValidation: true,
            outputEncoding: true,
            sanitization: true,
          },
        },
      }

    default:
      return {}
  }
}

/**
 * 生成元数据 ID
 */
function generateMetadataId(): string {
  return `meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 更新节点元数据
 */
export function updateNodeMetadata(
  metadata: NodeMetadata,
  updates: Partial<NodeMetadata>
): NodeMetadata {
  return {
    ...metadata,
    ...updates,
    documentation: {
      ...metadata.documentation,
      ...updates.documentation,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 合并节点元数据
 */
export function mergeNodeMetadata(
  base: NodeMetadata,
  extension: Partial<NodeMetadata>
): NodeMetadata {
  const merged: NodeMetadata = { ...base }

  // 深度合并各元数据字段
  if (extension.techStack) {
    merged.techStack = { ...base.techStack, ...extension.techStack }
  }

  if (extension.interaction) {
    merged.interaction = {
      triggers: [
        ...(base.interaction?.triggers || []),
        ...(extension.interaction.triggers || []),
      ],
      handlers: [
        ...(base.interaction?.handlers || []),
        ...(extension.interaction.handlers || []),
      ],
      stateChanges: [
        ...(base.interaction?.stateChanges || []),
        ...(extension.interaction.stateChanges || []),
      ],
    }
  }

  if (extension.dataFlow) {
    merged.dataFlow = {
      inputs: [
        ...(base.dataFlow?.inputs || []),
        ...(extension.dataFlow.inputs || []),
      ],
      outputs: [
        ...(base.dataFlow?.outputs || []),
        ...(extension.dataFlow.outputs || []),
      ],
      transformations: [
        ...(base.dataFlow?.transformations || []),
        ...(extension.dataFlow.transformations || []),
      ],
    }
  }

  if (extension.documentation) {
    merged.documentation = {
      ...base.documentation,
      ...extension.documentation,
      tags: [
        ...(base.documentation?.tags || []),
        ...(extension.documentation.tags || []),
      ],
    }
  }

  return merged
}

/**
 * 验证节点元数据完整性
 */
export function validateMetadata(metadata: NodeMetadata): {
  isValid: boolean
  missingFields: string[]
  warnings: string[]
} {
  const missingFields: string[] = []
  const warnings: string[] = []

  // 必填字段检查
  if (!metadata.id) missingFields.push('id')
  if (!metadata.type) missingFields.push('type')
  if (!metadata.name) missingFields.push('name')

  // 推荐字段检查（警告）
  if (!metadata.documentation?.description) {
    warnings.push('缺少节点描述')
  }

  if (!metadata.documentation?.tags || metadata.documentation.tags.length === 0) {
    warnings.push('建议添加标签以便更好地分类')
  }

  // 特定类型节点的元数据检查
  if (metadata.type === 'service' || metadata.type === 'api') {
    if (!metadata.security?.authentication) {
      warnings.push('服务/API 节点建议启用身份验证')
    }
  }

  if (metadata.type === 'component') {
    if (!metadata.responsive) {
      warnings.push('组件节点建议添加响应式设计配置')
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  }
}

/**
 * 从节点元数据生成 AI Prompt
 */
export function generateAIPrompt(metadata: NodeMetadata): string {
  let prompt = `请创建一个${metadata.type}节点，名称为"${metadata.name}"`

  if (metadata.documentation?.description) {
    prompt += `\n\n描述：${metadata.documentation.description}`
  }

  if (metadata.techStack) {
    prompt += '\n\n技术栈要求：'
    if (metadata.techStack.language) {
      prompt += `\n- 编程语言：${metadata.techStack.language}`
    }
    if (metadata.techStack.framework) {
      prompt += `\n- 框架：${metadata.techStack.framework}`
    }
    if (metadata.techStack.library && metadata.techStack.library.length > 0) {
      prompt += `\n- 库：${metadata.techStack.library.join(', ')}`
    }
  }

  if (metadata.security) {
    prompt += '\n\n安全要求：'
    if (metadata.security.authentication) {
      prompt += '\n- 需要实现身份验证'
    }
    if (metadata.security.authorization?.required) {
      prompt += `\n- 需要实现授权，角色：${metadata.security.authorization.roles?.join(', ')}`
    }
    if (metadata.security.validation?.inputValidation) {
      prompt += '\n- 需要输入验证'
    }
  }

  if (metadata.performance?.caching?.enabled) {
    prompt += `\n\n性能要求：启用缓存，策略为 ${metadata.performance.caching.strategy || 'lru'}`
  }

  if (metadata.aiPrompt?.constraints) {
    prompt += '\n\n约束条件：'
    metadata.aiPrompt.constraints.forEach(constraint => {
      prompt += `\n- ${constraint}`
    })
  }

  return prompt
}

/**
 * 导出节点元数据为 JSON
 */
export function exportMetadataAsJSON(metadata: NodeMetadata): string {
  return JSON.stringify(metadata, null, 2)
}

/**
 * 从 JSON 导入节点元数据
 */
export function importMetadataFromJSON(json: string): NodeMetadata {
  return JSON.parse(json) as NodeMetadata
}

export default {
  createNodeMetadata,
  updateNodeMetadata,
  mergeNodeMetadata,
  validateMetadata,
  generateAIPrompt,
  exportMetadataAsJSON,
  importMetadataFromJSON,
}
