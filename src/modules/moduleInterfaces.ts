/**
 * 模块接口规范
 * 定义模块间的标准接口和通信协议
 */

/**
 * 模块接口定义
 */
export interface ModuleInterface {
  id: string
  name: string
  version: string
  description: string
  type: 'provider' | 'consumer' | 'bidirectional'
  methods: ModuleMethod[]
  events?: ModuleEvent[]
  types?: TypeDefinition[]
  dependencies?: InterfaceDependency[]
}

/**
 * 模块方法定义
 */
export interface ModuleMethod {
  name: string
  description: string
  parameters: MethodParameter[]
  returnType: string
  async: boolean
  throws?: string[]
  example?: string
}

/**
 * 方法参数定义
 */
export interface MethodParameter {
  name: string
  type: string
  required: boolean
  description?: string
  defaultValue?: unknown
}

/**
 * 模块事件定义
 */
export interface ModuleEvent {
  name: string
  description: string
  payload: string
  bubbles?: boolean
  cancelable?: boolean
}

/**
 * 类型定义
 */
export interface TypeDefinition {
  name: string
  type: 'interface' | 'type' | 'class' | 'enum'
  definition: string
  description?: string
}

/**
 * 接口依赖
 */
export interface InterfaceDependency {
  interfaceId: string
  version: string
  required: boolean
}

/**
 * 模块通信协议
 */
export interface ModuleCommunicationProtocol {
  id: string
  name: string
  version: string
  transport: 'sync' | 'async' | 'event' | 'message'
  serialization: 'json' | 'binary' | 'custom'
  methods: CommunicationMethod[]
}

/**
 * 通信方法定义
 */
export interface CommunicationMethod {
  name: string
  pattern: 'request-response' | 'publish-subscribe' | 'event-stream' | 'command'
  inputSchema: unknown
  outputSchema: unknown
  errorSchema?: unknown
  timeout?: number
  retry?: {
    maxAttempts: number
    delay: number
    backoff: 'linear' | 'exponential'
  }
}

/**
 * 接口契约
 */
export interface InterfaceContract {
  id: string
  name: string
  version: string
  provider: string
  consumers: string[]
  interface: ModuleInterface
  protocol: ModuleCommunicationProtocol
  sla?: {
    availability: number
    latency: number
    throughput: number
  }
  validation: {
    inputValidation: boolean
    outputValidation: boolean
    schemaValidation: boolean
  }
}

/**
 * 创建模块接口
 */
export function createModuleInterface(
  name: string,
  type: 'provider' | 'consumer' | 'bidirectional',
  overrides?: Partial<ModuleInterface>
): ModuleInterface {
  const baseInterface: ModuleInterface = {
    id: generateInterfaceId(),
    name,
    version: '1.0.0',
    description: '',
    type,
    methods: [],
    events: [],
    types: [],
    dependencies: [],
  }

  if (overrides) {
    Object.assign(baseInterface, overrides)
  }

  return baseInterface
}

/**
 * 添加接口方法
 */
export function addInterfaceMethod(
  iface: ModuleInterface,
  method: ModuleMethod
): ModuleInterface {
  return {
    ...iface,
    methods: [...iface.methods, method],
  }
}

/**
 * 添加接口事件
 */
export function addInterfaceEvent(
  iface: ModuleInterface,
  event: ModuleEvent
): ModuleInterface {
  return {
    ...iface,
    events: [...(iface.events || []), event],
  }
}

/**
 * 添加类型定义
 */
export function addTypeDefinition(
  iface: ModuleInterface,
  type: TypeDefinition
): ModuleInterface {
  return {
    ...iface,
    types: [...(iface.types || []), type],
  }
}

/**
 * 验证接口完整性
 */
export function validateInterface(iface: ModuleInterface): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 必填字段检查
  if (!iface.id) errors.push('缺少接口 ID')
  if (!iface.name) errors.push('缺少接口名称')
  if (!iface.version) errors.push('缺少接口版本')
  if (!iface.type) errors.push('缺少接口类型')

  // 命名规范检查
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(iface.name)) {
    errors.push(`接口名称 "${iface.name}" 不符合命名规范`)
  }

  // 版本号检查
  if (!/^\d+\.\d+\.\d+$/.test(iface.version)) {
    warnings.push(`版本号 "${iface.version}" 建议遵循 semver 规范`)
  }

  // 方法检查
  if (iface.methods.length === 0) {
    warnings.push('接口没有定义任何方法')
  }

  iface.methods.forEach((method, index) => {
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(method.name)) {
      errors.push(`方法 ${index + 1} 的名称 "${method.name}" 不符合命名规范`)
    }

    if (method.async && !method.throws) {
      warnings.push(`异步方法 "${method.name}" 建议定义可能的异常`)
    }
  })

  // 类型定义检查
  if (iface.types && iface.types.length > 0) {
    iface.types.forEach(type => {
      if (!['interface', 'type', 'class', 'enum'].includes(type.type)) {
        errors.push(`类型 "${type.name}" 的类型定义无效`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 创建通信协议
 */
export function createCommunicationProtocol(
  name: string,
  transport: 'sync' | 'async' | 'event' | 'message',
  overrides?: Partial<ModuleCommunicationProtocol>
): ModuleCommunicationProtocol {
  const baseProtocol: ModuleCommunicationProtocol = {
    id: generateProtocolId(),
    name,
    version: '1.0.0',
    transport,
    serialization: 'json',
    methods: [],
  }

  if (overrides) {
    Object.assign(baseProtocol, overrides)
  }

  return baseProtocol
}

/**
 * 添加通信方法
 */
export function addCommunicationMethod(
  protocol: ModuleCommunicationProtocol,
  method: CommunicationMethod
): ModuleCommunicationProtocol {
  return {
    ...protocol,
    methods: [...protocol.methods, method],
  }
}

/**
 * 创建接口契约
 */
export function createInterfaceContract(
  name: string,
  provider: string,
  iface: ModuleInterface,
  protocol: ModuleCommunicationProtocol,
  overrides?: Partial<InterfaceContract>
): InterfaceContract {
  const baseContract: InterfaceContract = {
    id: generateContractId(),
    name,
    version: '1.0.0',
    provider,
    consumers: [],
    interface: iface,
    protocol,
    validation: {
      inputValidation: true,
      outputValidation: true,
      schemaValidation: true,
    },
  }

  if (overrides) {
    Object.assign(baseContract, overrides)
  }

  return baseContract
}

/**
 * 添加契约消费者
 */
export function addContractConsumer(
  contract: InterfaceContract,
  consumerId: string
): InterfaceContract {
  if (contract.consumers.includes(consumerId)) {
    return contract
  }

  return {
    ...contract,
    consumers: [...contract.consumers, consumerId],
  }
}

/**
 * 验证契约兼容性
 */
export function validateContractCompatibility(
  contract: InterfaceContract,
  consumerRequirements: ModuleInterface
): {
  compatible: boolean
  missingMethods: string[]
  typeMismatches: Array<{
    method: string
    expected: string
    actual: string
  }>
  suggestions: string[]
} {
  const missingMethods: string[] = []
  const typeMismatches: Array<{
    method: string
    expected: string
    actual: string
  }> = []
  const suggestions: string[] = []

  // 检查消费者需要的方法是否都存在于提供者接口中
  const providerMethodNames = new Set(contract.interface.methods.map(m => m.name))

  consumerRequirements.methods.forEach(method => {
    if (!providerMethodNames.has(method.name)) {
      missingMethods.push(method.name)
    } else {
      // 检查返回类型是否匹配
      const providerMethod = contract.interface.methods.find(
        m => m.name === method.name
      )
      if (providerMethod && providerMethod.returnType !== method.returnType) {
        typeMismatches.push({
          method: method.name,
          expected: method.returnType,
          actual: providerMethod.returnType,
        })
      }
    }
  })

  // 生成建议
  if (missingMethods.length > 0) {
    suggestions.push(`提供者需要实现以下方法：${missingMethods.join(', ')}`)
  }

  if (typeMismatches.length > 0) {
    suggestions.push('检查并统一以下方法的返回类型')
  }

  if (contract.protocol.serialization !== 'json') {
    suggestions.push('建议使用 JSON 序列化以提高兼容性')
  }

  return {
    compatible: missingMethods.length === 0 && typeMismatches.length === 0,
    missingMethods,
    typeMismatches,
    suggestions,
  }
}

/**
 * 生成接口文档
 */
export function generateInterfaceDocumentation(
  iface: ModuleInterface
): string {
  let doc = `# ${iface.name} 接口文档\n\n`
  doc += `**版本**: ${iface.version}\n\n`
  doc += `**类型**: ${iface.type}\n\n`
  doc += `**描述**: ${iface.description || '暂无描述'}\n\n`

  // 方法文档
  doc += `## 方法列表\n\n`
  iface.methods.forEach(method => {
    doc += `### ${method.name}\n\n`
    doc += `${method.description || '暂无描述'}\n\n`
    doc += `**异步**: ${method.async ? '是' : '否'}\n\n`

    // 参数
    if (method.parameters.length > 0) {
      doc += `**参数**:\n\n`
      doc += `| 参数名 | 类型 | 必填 | 默认值 | 描述 |\n`
      doc += `|--------|------|------|--------|------|\n`
      method.parameters.forEach(param => {
        doc += `| ${param.name} | \`${param.type}\` | ${param.required ? '是' : '否'} | ${param.defaultValue ?? '无'} | ${param.description || ''} |\n`
      })
      doc += '\n'
    }

    // 返回值
    doc += `**返回值**: \`${method.returnType}\`\n\n`

    // 异常
    if (method.throws && method.throws.length > 0) {
      doc += `**异常**: ${method.throws.join(', ')}\n\n`
    }

    // 示例
    if (method.example) {
      doc += `**示例**:\n\n\`\`\`\n${method.example}\n\`\`\`\n\n`
    }
  })

  // 事件文档
  if (iface.events && iface.events.length > 0) {
    doc += `## 事件列表\n\n`
    iface.events.forEach(event => {
      doc += `### ${event.name}\n\n`
      doc += `${event.description || '暂无描述'}\n\n`
      doc += `**载荷类型**: \`${event.payload}\`\n\n`
      if (event.bubbles !== undefined) {
        doc += `**冒泡**: ${event.bubbles ? '是' : '否'}\n\n`
      }
      if (event.cancelable !== undefined) {
        doc += `**可取消**: ${event.cancelable ? '是' : '否'}\n\n`
      }
    })
  }

  // 类型定义文档
  if (iface.types && iface.types.length > 0) {
    doc += `## 类型定义\n\n`
    iface.types.forEach(type => {
      doc += `### ${type.name}\n\n`
      doc += `**类型**: ${type.type}\n\n`
      if (type.description) {
        doc += `${type.description}\n\n`
      }
      doc += `\`\`\`typescript\n${type.definition}\n\`\`\`\n\n`
    })
  }

  return doc
}

/**
 * 生成协议文档
 */
export function generateProtocolDocumentation(
  protocol: ModuleCommunicationProtocol
): string {
  let doc = `# ${protocol.name} 通信协议文档\n\n`
  doc += `**版本**: ${protocol.version}\n\n`
  doc += `**传输方式**: ${protocol.transport}\n\n`
  doc += `**序列化**: ${protocol.serialization}\n\n`

  // 方法文档
  doc += `## 通信方法\n\n`
  protocol.methods.forEach(method => {
    doc += `### ${method.name}\n\n`
    doc += `**模式**: ${method.pattern}\n\n`

    if (method.timeout) {
      doc += `**超时**: ${method.timeout}ms\n\n`
    }

    if (method.retry) {
      doc += `**重试**: 最多 ${method.retry.maxAttempts} 次，间隔 ${method.retry.delay}ms (${method.retry.backoff})\n\n`
    }

    doc += `**输入模式**:\n\n\`\`\`json\n${JSON.stringify(method.inputSchema, null, 2)}\n\`\`\`\n\n`
    doc += `**输出模式**:\n\n\`\`\`json\n${JSON.stringify(method.outputSchema, null, 2)}\n\`\`\`\n\n`

    if (method.errorSchema) {
      doc += `**错误模式**:\n\n\`\`\`json\n${JSON.stringify(method.errorSchema, null, 2)}\n\`\`\`\n\n`
    }
  })

  return doc
}

/**
 * 生成契约文档
 */
export function generateContractDocumentation(
  contract: InterfaceContract
): string {
  let doc = `# ${contract.name} 接口契约文档\n\n`
  doc += `**版本**: ${contract.version}\n\n`
  doc += `**提供者**: ${contract.provider}\n\n`
  doc += `**消费者**: ${contract.consumers.join(', ') || '暂无'}\n\n`

  if (contract.sla) {
    doc += `## 服务等级协议 (SLA)\n\n`
    doc += `- 可用性：${contract.sla.availability}%\n`
    doc += `- 延迟：${contract.sla.latency}ms\n`
    doc += `- 吞吐量：${contract.sla.throughput} req/s\n\n`
  }

  doc += `## 验证配置\n\n`
  doc += `- 输入验证：${contract.validation.inputValidation ? '启用' : '禁用'}\n`
  doc += `- 输出验证：${contract.validation.outputValidation ? '启用' : '禁用'}\n`
  doc += `- 模式验证：${contract.validation.schemaValidation ? '启用' : '禁用'}\n\n`

  doc += `---\n\n`
  doc += generateInterfaceDocumentation(contract.interface)
  doc += `\n---\n\n`
  doc += generateProtocolDocumentation(contract.protocol)

  return doc
}

/**
 * 生成接口 ID
 */
function generateInterfaceId(): string {
  return `iface_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成协议 ID
 */
function generateProtocolId(): string {
  return `proto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成契约 ID
 */
function generateContractId(): string {
  return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 预定义的通用接口
 */
export const commonInterfaces: Record<string, ModuleInterface> = {
  // CRUD 接口
  crud: {
    id: 'common-crud',
    name: 'CRUD 接口',
    version: '1.0.0',
    description: '标准的增删改查接口',
    type: 'provider',
    methods: [
      {
        name: 'create',
        description: '创建新实体',
        parameters: [
          { name: 'data', type: 'any', required: true, description: '实体数据' },
        ],
        returnType: 'Promise<T>',
        async: true,
        throws: ['ValidationError', 'DuplicateError'],
      },
      {
        name: 'findById',
        description: '根据 ID 查询实体',
        parameters: [
          { name: 'id', type: 'string', required: true, description: '实体 ID' },
        ],
        returnType: 'Promise<T | null>',
        async: true,
        throws: ['NotFoundError'],
      },
      {
        name: 'findAll',
        description: '查询所有实体',
        parameters: [
          { name: 'filters', type: 'FilterOptions', required: false, description: '过滤条件' },
          { name: 'pagination', type: 'PaginationOptions', required: false, description: '分页选项' },
        ],
        returnType: 'Promise<T[]>',
        async: true,
        throws: [],
      },
      {
        name: 'update',
        description: '更新实体',
        parameters: [
          { name: 'id', type: 'string', required: true, description: '实体 ID' },
          { name: 'data', type: 'Partial<any>', required: true, description: '更新数据' },
        ],
        returnType: 'Promise<T>',
        async: true,
        throws: ['NotFoundError', 'ValidationError'],
      },
      {
        name: 'delete',
        description: '删除实体',
        parameters: [
          { name: 'id', type: 'string', required: true, description: '实体 ID' },
        ],
        returnType: 'Promise<void>',
        async: true,
        throws: ['NotFoundError'],
      },
    ],
    events: [],
    types: [],
    dependencies: [],
  },

  // 认证接口
  authentication: {
    id: 'common-auth',
    name: '认证接口',
    version: '1.0.0',
    description: '用户认证相关接口',
    type: 'provider',
    methods: [
      {
        name: 'login',
        description: '用户登录',
        parameters: [
          { name: 'username', type: 'string', required: true, description: '用户名' },
          { name: 'password', type: 'string', required: true, description: '密码' },
        ],
        returnType: 'Promise<AuthToken>',
        async: true,
        throws: ['InvalidCredentialsError', 'AccountLockedError'],
      },
      {
        name: 'logout',
        description: '用户登出',
        parameters: [
          { name: 'token', type: 'string', required: true, description: '访问令牌' },
        ],
        returnType: 'Promise<void>',
        async: true,
        throws: [],
      },
      {
        name: 'refreshToken',
        description: '刷新令牌',
        parameters: [
          { name: 'refreshToken', type: 'string', required: true, description: '刷新令牌' },
        ],
        returnType: 'Promise<AuthToken>',
        async: true,
        throws: ['InvalidTokenError', 'TokenExpiredError'],
      },
      {
        name: 'validateToken',
        description: '验证令牌',
        parameters: [
          { name: 'token', type: 'string', required: true, description: '访问令牌' },
        ],
        returnType: 'Promise<TokenValidation>',
        async: true,
        throws: [],
      },
    ],
    events: [
      {
        name: 'user:login',
        description: '用户登录事件',
        payload: 'LoginEvent',
        bubbles: false,
        cancelable: false,
      },
      {
        name: 'user:logout',
        description: '用户登出事件',
        payload: 'LogoutEvent',
        bubbles: false,
        cancelable: false,
      },
    ],
    types: [],
    dependencies: [],
  },
}

export default {
  createModuleInterface,
  addInterfaceMethod,
  addInterfaceEvent,
  addTypeDefinition,
  validateInterface,
  createCommunicationProtocol,
  addCommunicationMethod,
  createInterfaceContract,
  addContractConsumer,
  validateContractCompatibility,
  generateInterfaceDocumentation,
  generateProtocolDocumentation,
  generateContractDocumentation,
  commonInterfaces,
}
