/**
 * AI Prompt 模板系统
 * 为不同类型的代码生成任务提供标准化的 Prompt 模板
 * 用于提高 AI 代码生成的准确性和一致性
 */

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  category: 'component' | 'service' | 'api' | 'database' | 'utility' | 'config'
}

export interface PromptContext {
  nodeType: string
  nodeName: string
  techStack?: {
    language: string
    framework: string
    libraries?: string[]
  }
  requirements?: {
    functional: string[]
    nonFunctional: string[]
  }
  constraints?: string[]
  examples?: Array<{
    input: string
    output: string
  }>
}

/**
 * React 组件生成 Prompt 模板
 */
export const reactComponentTemplate: PromptTemplate = {
  id: 'react-component',
  name: 'React 组件生成',
  description: '用于生成标准化的 React 函数组件',
  category: 'component',
  template: `请创建一个 React 函数组件，具体要求如下：

## 组件信息
- 组件名称：{{componentName}}
- 技术栈：{{language}} + {{framework}}
- 依赖库：{{libraries}}

## 功能要求
{{functionalRequirements}}

## 非功能要求
{{nonFunctionalRequirements}}

## 设计规范
- 使用 TypeScript 进行类型安全
- 遵循 React Hooks 最佳实践
- 使用设计令牌系统（designTokens）
- 实现响应式布局（支持 mobile/tablet/desktop）
- 添加适当的错误处理

## 代码结构
1. 导入依赖
2. 定义 Props 接口
3. 定义组件
4. 导出组件

## 约束条件
{{constraints}}

{{examples}}

请生成完整、可运行的代码，包含所有必要的导入语句和类型定义。`,
  variables: [
    'componentName',
    'language',
    'framework',
    'libraries',
    'functionalRequirements',
    'nonFunctionalRequirements',
    'constraints',
    'examples',
  ],
}

/**
 * Service 层生成 Prompt 模板
 */
export const serviceTemplate: PromptTemplate = {
  id: 'service-layer',
  name: 'Service 层生成',
  description: '用于生成业务逻辑服务层代码',
  category: 'service',
  template: `请创建一个 Service 层模块，具体要求如下：

## 服务信息
- 服务名称：{{serviceName}}
- 技术栈：{{language}} + {{framework}}
- 依赖库：{{libraries}}

## 功能要求
{{functionalRequirements}}

## 安全要求
- 实现身份验证检查
- 实现授权验证（角色：{{roles}}）
- 输入数据验证
- 输出数据编码
- SQL 注入防护

## 性能要求
- 实现缓存机制（策略：{{cachingStrategy}}）
- 支持懒加载
- 错误重试机制

## 代码规范
- 使用 TypeScript
- 遵循单一职责原则
- 添加完整的错误处理
- 添加日志记录
- 使用异步/等待模式

## 约束条件
{{constraints}}

{{examples}}

请生成完整、可运行的代码，包含所有必要的导入语句、类型定义和错误处理。`,
  variables: [
    'serviceName',
    'language',
    'framework',
    'libraries',
    'functionalRequirements',
    'roles',
    'cachingStrategy',
    'constraints',
    'examples',
  ],
}

/**
 * API 端点生成 Prompt 模板
 */
export const apiEndpointTemplate: PromptTemplate = {
  id: 'api-endpoint',
  name: 'API 端点生成',
  description: '用于生成 RESTful API 端点代码',
  category: 'api',
  template: `请创建一个 RESTful API 端点，具体要求如下：

## 端点信息
- 端点名称：{{endpointName}}
- HTTP 方法：{{httpMethod}}
- 路径：{{path}}
- 技术栈：{{language}} + {{framework}}

## 请求参数
{{requestParams}}

## 响应格式
{{responseFormat}}

## 安全要求
- JWT 身份验证
- 权限验证（权限：{{permissions}}）
- 请求体验证
- 响应体 sanitization
- CORS 配置

## 业务逻辑
{{businessLogic}}

## 错误处理
- 400 - 请求参数错误
- 401 - 未授权
- 403 - 禁止访问
- 404 - 资源不存在
- 500 - 服务器错误

## 约束条件
{{constraints}}

{{examples}}

请生成完整、可运行的代码，包含路由定义、控制器、验证中间件和错误处理。`,
  variables: [
    'endpointName',
    'httpMethod',
    'path',
    'language',
    'framework',
    'requestParams',
    'responseFormat',
    'permissions',
    'businessLogic',
    'constraints',
    'examples',
  ],
}

/**
 * 数据库表生成 Prompt 模板
 */
export const databaseTableTemplate: PromptTemplate = {
  id: 'database-table',
  name: '数据库表生成',
  description: '用于生成数据库表定义和迁移脚本',
  category: 'database',
  template: `请创建数据库表定义和迁移脚本，具体要求如下：

## 表信息
- 表名：{{tableName}}
- 数据库类型：{{databaseType}}
- 描述：{{description}}

## 字段定义
{{fields}}

## 索引设计
{{indexes}}

## 约束条件
- 主键约束
- 外键约束（如适用）
- 唯一性约束
- 检查约束
- 默认值

## 安全要求
- 字段级访问控制
- 敏感数据加密
- 审计字段（created_at, updated_at）

## 性能优化
- 适当的索引
- 分区策略（如适用）
- 查询优化建议

## 约束条件
{{constraints}}

{{examples}}

请生成完整的 SQL DDL 语句和迁移脚本（使用 {{migrationTool}}）。`,
  variables: [
    'tableName',
    'databaseType',
    'description',
    'fields',
    'indexes',
    'constraints',
    'migrationTool',
    'examples',
  ],
}

/**
 * 工具函数生成 Prompt 模板
 */
export const utilityFunctionTemplate: PromptTemplate = {
  id: 'utility-function',
  name: '工具函数生成',
  description: '用于生成通用工具函数',
  category: 'utility',
  template: `请创建一个工具函数，具体要求如下：

## 函数信息
- 函数名称：{{functionName}}
- 技术栈：{{language}}
- 用途：{{purpose}}

## 输入参数
{{inputParams}}

## 返回值
{{returnValue}}

## 功能要求
{{functionalRequirements}}

## 边界情况处理
- 空值处理
- 类型检查
- 异常处理
- 边界值验证

## 性能要求
- 时间复杂度：{{timeComplexity}}
- 空间复杂度：{{spaceComplexity}}
- 内存优化

## 代码规范
- 使用 TypeScript 类型定义
- 添加完整的 JSDoc 注释
- 提供使用示例
- 包含单元测试

## 约束条件
{{constraints}}

{{examples}}

请生成完整、可运行的代码，包含函数实现、类型定义、文档注释和测试用例。`,
  variables: [
    'functionName',
    'language',
    'purpose',
    'inputParams',
    'returnValue',
    'functionalRequirements',
    'timeComplexity',
    'spaceComplexity',
    'constraints',
    'examples',
  ],
}

/**
 * 配置文件生成 Prompt 模板
 */
export const configTemplate: PromptTemplate = {
  id: 'config-file',
  name: '配置文件生成',
  description: '用于生成各种配置文件',
  category: 'config',
  template: `请生成配置文件，具体要求如下：

## 配置信息
- 配置名称：{{configName}}
- 配置类型：{{configType}}
- 环境：{{environment}}

## 配置项
{{configItems}}

## 环境变量
{{envVariables}}

## 安全要求
- 敏感信息使用环境变量
- 不硬编码密钥
- 访问权限控制

## 验证规则
{{validationRules}}

## 约束条件
{{constraints}}

{{examples}}

请生成完整的配置文件（格式：{{fileFormat}}），包含所有必要的配置项、注释和验证逻辑。`,
  variables: [
    'configName',
    'configType',
    'environment',
    'configItems',
    'envVariables',
    'validationRules',
    'constraints',
    'fileFormat',
    'examples',
  ],
}

/**
 * Prompt 模板注册表
 */
export const promptTemplates: Record<string, PromptTemplate> = {
  'react-component': reactComponentTemplate,
  'service-layer': serviceTemplate,
  'api-endpoint': apiEndpointTemplate,
  'database-table': databaseTableTemplate,
  'utility-function': utilityFunctionTemplate,
  'config-file': configTemplate,
}

/**
 * 渲染 Prompt 模板
 */
export function renderPrompt(
  template: PromptTemplate,
  context: Record<string, unknown>
): string {
  let rendered = template.template

  // 替换变量
  Object.keys(context).forEach(key => {
    const value = context[key]
    const placeholder = `{{${key}}}`

    if (typeof value === 'string') {
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value)
    } else if (Array.isArray(value)) {
      rendered = rendered.replace(
        new RegExp(placeholder, 'g'),
        value.map(item => `- ${item}`).join('\n')
      )
    } else if (typeof value === 'object' && value !== null) {
      rendered = rendered.replace(
        new RegExp(placeholder, 'g'),
        JSON.stringify(value, null, 2)
      )
    } else {
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value))
    }
  })

  // 清理未替换的空变量
  rendered = rendered.replace(/{{\w+}}/g, '（未提供）')

  return rendered
}

/**
 * 根据节点类型获取 Prompt 模板
 */
export function getTemplateForNodeType(nodeType: string): PromptTemplate | null {
  const mapping: Record<string, string> = {
    component: 'react-component',
    service: 'service-layer',
    api: 'api-endpoint',
    endpoint: 'api-endpoint',
    database: 'database-table',
    table: 'database-table',
    utility: 'utility-function',
    config: 'config-file',
  }

  const templateId = mapping[nodeType]
  return templateId ? promptTemplates[templateId] : null
}

/**
 * 从节点元数据生成 Prompt
 */
export function generatePromptFromMetadata(metadata: {
  type: string
  name: string
  techStack?: {
    language?: string
    framework?: string
    library?: string[]
  }
  requirements?: {
    functional?: string[]
    nonFunctional?: string[]
  }
  constraints?: string[]
}): string {
  const template = getTemplateForNodeType(metadata.type)

  if (!template) {
    return `请创建${metadata.type}：${metadata.name}`
  }

  const context: Record<string, unknown> = {
    [`${metadata.type}Name`]: metadata.name,
    language: metadata.techStack?.language || 'TypeScript',
    framework: metadata.techStack?.framework || 'React',
    libraries: metadata.techStack?.library?.join(', ') || '无',
    functionalRequirements: metadata.requirements?.functional?.join('\n') || '无特殊要求',
    nonFunctionalRequirements:
      metadata.requirements?.nonFunctional?.join('\n') || '遵循最佳实践',
    constraints: metadata.constraints || [],
    examples: '',
  }

  return renderPrompt(template, context)
}

/**
 * 优化 Prompt（添加更多上下文和约束）
 */
export function optimizePrompt(
  prompt: string,
  enhancements: {
    addDesignTokens?: boolean
    addSecurityRequirements?: boolean
    addPerformanceRequirements?: boolean
    addTestingRequirements?: boolean
    addDocumentationRequirements?: boolean
  }
): string {
  let optimized = prompt

  if (enhancements.addDesignTokens) {
    optimized += `

## 设计规范
- 使用设计令牌系统（designTokens）
- 颜色：使用 colors.palette 中的颜色
- 间距：使用 spacing 中的值
- 字体：使用 typography 中的字号
- 圆角：使用 borderRadius 中的值`
  }

  if (enhancements.addSecurityRequirements) {
    optimized += `

## 安全要求
- 输入验证：验证所有用户输入
- XSS 防护：对用户输出进行编码
- CSRF 防护：实现 CSRF token
- 敏感数据：不记录敏感信息`
  }

  if (enhancements.addPerformanceRequirements) {
    optimized += `

## 性能要求
- 代码分割：使用动态导入
- 缓存：实现适当的缓存策略
- 优化：避免不必要的渲染和计算
- 监控：添加性能监控点`
  }

  if (enhancements.addTestingRequirements) {
    optimized += `

## 测试要求
- 单元测试：覆盖核心逻辑
- 集成测试：测试组件交互
- 端到端测试：测试完整流程
- 测试覆盖率：目标 80%+`
  }

  if (enhancements.addDocumentationRequirements) {
    optimized += `

## 文档要求
- JSDoc：为所有公共 API 添加文档
- 注释：为复杂逻辑添加注释
- README：更新使用说明
- 变更日志：记录变更`
  }

  return optimized
}

/**
 * 验证 Prompt 完整性
 */
export function validatePrompt(prompt: string): {
  isValid: boolean
  missingSections: string[]
  suggestions: string[]
} {
  const requiredSections = [
    '功能要求',
    '技术栈',
    '约束条件',
  ]

  const missingSections: string[] = []
  const suggestions: string[] = []

  requiredSections.forEach(section => {
    if (!prompt.includes(section)) {
      missingSections.push(section)
    }
  })

  // 检查是否有具体示例
  if (!prompt.includes('示例') && !prompt.includes('example')) {
    suggestions.push('建议添加代码示例以帮助 AI 理解需求')
  }

  // 检查是否有错误处理要求
  if (!prompt.includes('错误') && !prompt.includes('error')) {
    suggestions.push('建议添加错误处理要求')
  }

  // 检查是否有性能要求
  if (!prompt.includes('性能') && !prompt.includes('performance')) {
    suggestions.push('建议添加性能要求')
  }

  return {
    isValid: missingSections.length === 0,
    missingSections,
    suggestions,
  }
}

export default {
  promptTemplates,
  renderPrompt,
  getTemplateForNodeType,
  generatePromptFromMetadata,
  optimizePrompt,
  validatePrompt,
}
