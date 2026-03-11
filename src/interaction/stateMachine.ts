/**
 * 状态机系统
 * 用于定义和管理组件、服务的状态转换逻辑
 * 为 AI 代码生成提供清晰的状态流转规则
 */

/**
 * 状态类型
 */
export type StateType =
  | 'initial'      // 初始状态
  | 'intermediate' // 中间状态
  | 'final'        // 最终状态
  | 'error'        // 错误状态

/**
 * 状态定义
 */
export interface State {
  id: string
  name: string
  type: StateType
  description?: string
  entryActions?: string[]
  exitActions?: string[]
  internalActivities?: string[]
  metadata?: {
    [key: string]: unknown
  }
}

/**
 * 事件定义
 */
export interface Event {
  id: string
  name: string
  description?: string
  payload?: {
    name: string
    type: string
    required: boolean
  }[]
}

/**
 * 转换定义
 */
export interface Transition {
  id: string
  from: string
  to: string
  trigger: string
  guard?: string
  actions?: string[]
  description?: string
}

/**
 * 状态机配置
 */
export interface StateMachineConfig {
  id: string
  name: string
  description: string
  version: string
  initialstate: string
  states: State[]
  events: Event[]
  transitions: Transition[]
  context?: {
    variables: Array<{
      name: string
      type: string
      defaultValue?: unknown
    }>
  }
  metadata?: {
    createdAt?: string
    updatedAt?: string
    author?: string
  }
}

/**
 * 状态机验证结果
 */
export interface StateMachineValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * 状态机执行上下文
 */
export interface ExecutionContext {
  currentState: string
  variables: Map<string, unknown>
  history: string[]
  timestamp: number
}

/**
 * 状态机执行结果
 */
export interface ExecutionResult {
  success: boolean
  newState: string
  executedActions: string[]
  error?: string
  context: ExecutionContext
}

/**
 * 创建状态机配置
 */
export function createStateMachine(
  name: string,
  description: string,
  overrides?: Partial<StateMachineConfig>
): StateMachineConfig {
  const baseConfig: StateMachineConfig = {
    id: generateStateMachineId(),
    name,
    description,
    version: '1.0.0',
    initialstate: '',
    states: [],
    events: [],
    transitions: [],
    context: {
      variables: [],
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  if (overrides) {
    Object.assign(baseConfig, overrides)
  }

  return baseConfig
}

/**
 * 添加状态
 */
export function addState(
  config: StateMachineConfig,
  state: State
): StateMachineConfig {
  return {
    ...config,
    states: [...config.states, state],
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加事件
 */
export function addEvent(
  config: StateMachineConfig,
  event: Event
): StateMachineConfig {
  return {
    ...config,
    events: [...config.events, event],
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加转换
 */
export function addTransition(
  config: StateMachineConfig,
  transition: Transition
): StateMachineConfig {
  return {
    ...config,
    transitions: [...config.transitions, transition],
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 设置初始状态
 */
export function setInitialState(
  config: StateMachineConfig,
  stateId: string
): StateMachineConfig {
  const stateExists = config.states.some(s => s.id === stateId)
  if (!stateExists) {
    throw new Error(`状态 ${stateId} 不存在`)
  }

  return {
    ...config,
    initialstate: stateId,
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加上下文变量
 */
export function addContextVariable(
  config: StateMachineConfig,
  variable: {
    name: string
    type: string
    defaultValue?: unknown
  }
): StateMachineConfig {
  return {
    ...config,
    context: {
      variables: [...(config.context?.variables || []), variable],
    },
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 验证状态机
 */
export function validateStateMachine(
  config: StateMachineConfig
): StateMachineValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // 必填字段检查
  if (!config.id) errors.push('缺少状态机 ID')
  if (!config.name) errors.push('缺少状态机名称')
  if (!config.description) warnings.push('建议添加状态机描述')
  if (!config.initialstate) errors.push('缺少初始状态')
  if (config.states.length === 0) errors.push('状态机没有定义任何状态')
  if (config.events.length === 0) warnings.push('状态机没有定义任何事件')
  if (config.transitions.length === 0) errors.push('状态机没有定义任何转换')

  // 检查初始状态是否存在
  if (config.initialstate && !config.states.some(s => s.id === config.initialstate)) {
    errors.push(`初始状态 "${config.initialstate}" 不存在`)
  }

  // 检查状态 ID 唯一性
  const stateIds = config.states.map(s => s.id)
  const uniqueStateIds = new Set(stateIds)
  if (uniqueStateIds.size !== stateIds.length) {
    errors.push('存在重复的状态 ID')
  }

  // 检查事件 ID 唯一性
  const eventIds = config.events.map(e => e.id)
  const uniqueEventIds = new Set(eventIds)
  if (uniqueEventIds.size !== eventIds.length) {
    errors.push('存在重复的事件 ID')
  }

  // 检查转换的有效性
  config.transitions.forEach((transition, index) => {
    if (!config.states.some(s => s.id === transition.from)) {
      errors.push(`转换 ${index + 1} 的源状态 "${transition.from}" 不存在`)
    }
    if (!config.states.some(s => s.id === transition.to)) {
      errors.push(`转换 ${index + 1} 的目标状态 "${transition.to}" 不存在`)
    }
    if (!config.events.some(e => e.id === transition.trigger)) {
      errors.push(`转换 ${index + 1} 的触发事件 "${transition.trigger}" 不存在`)
    }
  })

  // 检查是否有孤立状态
  const reachableStates = new Set<string>([config.initialstate])
  let changed = true
  while (changed) {
    changed = false
    config.transitions.forEach(t => {
      if (reachableStates.has(t.from) && !reachableStates.has(t.to)) {
        reachableStates.add(t.to)
        changed = true
      }
    })
  }

  config.states.forEach(state => {
    if (!reachableStates.has(state.id)) {
      warnings.push(`状态 "${state.name}" 无法从初始状态到达`)
    }
  })

  // 检查最终状态
  const finalStates = config.states.filter(s => s.type === 'final')
  if (finalStates.length === 0) {
    suggestions.push('建议定义至少一个最终状态')
  }

  // 检查错误状态
  const errorStates = config.states.filter(s => s.type === 'error')
  if (errorStates.length === 0) {
    suggestions.push('建议定义错误状态以处理异常情况')
  }

  // 检查状态类型
  const initialStates = config.states.filter(s => s.type === 'initial')
  if (initialStates.length === 0) {
    warnings.push('没有定义初始类型状态')
  } else if (initialStates.length > 1) {
    warnings.push('定义了多个初始类型状态')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * 执行状态转换
 */
export function executeTransition(
  config: StateMachineConfig,
  currentState: string,
  eventId: string,
  context: ExecutionContext
): ExecutionResult {
  // 查找匹配的转换
  const transition = config.transitions.find(
    t => t.from === currentState && t.trigger === eventId
  )

  if (!transition) {
    return {
      success: false,
      newState: currentState,
      executedActions: [],
      error: `在状态 ${currentState} 下无法处理事件 ${eventId}`,
      context,
    }
  }

  // 检查守卫条件（简化版本，实际应该评估 guard 表达式）
  if (transition.guard) {
    // TODO: 实现守卫条件评估
    console.log(`检查守卫条件：${transition.guard}`)
  }

  // 执行动作
  const executedActions: string[] = []
  const previousState = config.states.find(s => s.id === currentState)
  const nextState = config.states.find(s => s.id === transition.to)

  // 执行退出动作
  if (previousState?.exitActions) {
    executedActions.push(...previousState.exitActions)
  }

  // 执行转换动作
  if (transition.actions) {
    executedActions.push(...transition.actions)
  }

  // 执行进入动作
  if (nextState?.entryActions) {
    executedActions.push(...nextState.entryActions)
  }

  // 更新上下文
  const newContext: ExecutionContext = {
    currentState: transition.to,
    variables: new Map(context.variables),
    history: [...context.history, transition.to],
    timestamp: Date.now(),
  }

  return {
    success: true,
    newState: transition.to,
    executedActions,
    context: newContext,
  }
}

/**
 * 创建执行上下文
 */
export function createExecutionContext(
  config: StateMachineConfig
): ExecutionContext {
  const variables = new Map<string, unknown>()

  // 初始化上下文变量
  config.context?.variables.forEach(variable => {
    variables.set(variable.name, variable.defaultValue)
  })

  return {
    currentState: config.initialstate,
    variables,
    history: [config.initialstate],
    timestamp: Date.now(),
  }
}

/**
 * 获取所有可能的转换路径
 */
export function getAllPossiblePaths(
  config: StateMachineConfig
): string[][] {
  const paths: string[][] = []
  const finalStates = config.states.filter(s => s.type === 'final')

  function dfs(currentState: string, path: string[], visited: Set<string>) {
    if (visited.has(currentState)) return

    const newPath = [...path, currentState]
    const isFinal = finalStates.some(s => s.id === currentState)

    if (isFinal) {
      paths.push(newPath)
      return
    }

    visited.add(currentState)

    const outgoingTransitions = config.transitions.filter(
      t => t.from === currentState
    )

    outgoingTransitions.forEach(transition => {
      dfs(transition.to, newPath, new Set(visited))
    })
  }

  dfs(config.initialstate, [], new Set())
  return paths
}

/**
 * 生成状态图（Mermaid 格式）
 */
export function generateStateDiagram(
  config: StateMachineConfig
): string {
  let diagram = 'stateDiagram-v2\n'
  diagram += `  title ${config.name}\n\n`

  // 定义状态
  config.states.forEach(state => {
    // const stateName = state.name.replace(/\s+/g, '_')
    
    if (state.type === 'initial') {
      diagram += `  [*] --> ${state.id}\n`
    } else if (state.type === 'final') {
      diagram += `  ${state.id} --> [*]\n`
    }

    if (state.description) {
      diagram += `  state ${state.id} {\n`
      diagram += `    ${state.description}\n`
      if (state.entryActions && state.entryActions.length > 0) {
        diagram += `    entry / ${state.entryActions.join('; ')}\n`
      }
      if (state.exitActions && state.exitActions.length > 0) {
        diagram += `    exit / ${state.exitActions.join('; ')}\n`
      }
      diagram += `  }\n`
    }
  })

  diagram += '\n'

  // 定义转换
  config.transitions.forEach(transition => {
    let label = transition.trigger
    
    if (transition.guard) {
      label += ` [${transition.guard}]`
    }

    if (transition.actions && transition.actions.length > 0) {
      label += ` / ${transition.actions.join('; ')}`
    }

    diagram += `  ${transition.from} --> ${transition.to}: ${label}\n`
  })

  return diagram
}

/**
 * 生成状态机文档
 */
export function generateStateMachineDocumentation(
  config: StateMachineConfig
): string {
  let doc = `# ${config.name} 状态机文档\n\n`
  doc += `**版本**: ${config.version}\n\n`
  doc += `**描述**: ${config.description}\n\n`

  // 状态图
  doc += `## 状态图\n\n`
  doc += '```mermaid\n'
  doc += generateStateDiagram(config)
  doc += '```\n\n'

  // 状态列表
  doc += `## 状态列表\n\n`
  doc += `| 状态 ID | 名称 | 类型 | 描述 |\n`
  doc += `|---------|------|------|------|\n`
  config.states.forEach(state => {
    doc += `| ${state.id} | ${state.name} | ${state.type} | ${state.description || '-'} |\n`
  })
  doc += '\n'

  // 事件列表
  doc += `## 事件列表\n\n`
  doc += `| 事件 ID | 名称 | 描述 |\n`
  doc += `|---------|------|------|\n`
  config.events.forEach(event => {
    doc += `| ${event.id} | ${event.name} | ${event.description || '-'} |\n`
  })
  doc += '\n'

  // 转换列表
  doc += `## 转换列表\n\n`
  doc += `| 源状态 | 目标状态 | 触发事件 | 守卫条件 | 动作 |\n`
  doc += `|--------|----------|----------|----------|------|\n`
  config.transitions.forEach(transition => {
    doc += `| ${transition.from} | ${transition.to} | ${transition.trigger} | ${transition.guard || '-'} | ${transition.actions?.join('; ') || '-'} |\n`
  })
  doc += '\n'

  // 上下文变量
  if (config.context?.variables && config.context.variables.length > 0) {
    doc += `## 上下文变量\n\n`
    doc += `| 变量名 | 类型 | 默认值 |\n`
    doc += `|--------|------|--------|\n`
    config.context.variables.forEach(variable => {
      doc += `| ${variable.name} | ${variable.type} | ${variable.defaultValue ?? '无'} |\n`
    })
    doc += '\n'
  }

  // 可能的路径
  const paths = getAllPossiblePaths(config)
  if (paths.length > 0) {
    doc += `## 可能的执行路径\n\n`
    paths.forEach((path, index) => {
      doc += `${index + 1}. ${path.join(' → ')}\n`
    })
    doc += '\n'
  }

  return doc
}

/**
 * 生成状态机 ID
 */
function generateStateMachineId(): string {
  return `sm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 预定义的状态机模板
 */
export const commonStateMachineTemplates: Record<string, Partial<StateMachineConfig>> = {
  // CRUD 状态机
  crud: {
    name: 'CRUD 状态机',
    description: '标准的增删改查状态流转',
    initialstate: 'idle',
    states: [
      { id: 'idle', name: '空闲', type: 'initial' },
      { id: 'loading', name: '加载中', type: 'intermediate' },
      { id: 'success', name: '成功', type: 'final' },
      { id: 'error', name: '错误', type: 'error' },
    ],
    events: [
      { id: 'fetch', name: '获取数据' },
      { id: 'success', name: '操作成功' },
      { id: 'error', name: '操作失败' },
      { id: 'reset', name: '重置' },
    ],
    transitions: [
      { from: 'idle', to: 'loading', trigger: 'fetch' },
      { from: 'loading', to: 'success', trigger: 'success' },
      { from: 'loading', to: 'error', trigger: 'error' },
      { from: 'success', to: 'idle', trigger: 'reset' },
      { from: 'error', to: 'idle', trigger: 'reset' },
    ],
  },

  // 认证状态机
  authentication: {
    name: '认证状态机',
    description: '用户认证流程状态机',
    initialstate: 'unauthenticated',
    states: [
      { id: 'unauthenticated', name: '未认证', type: 'initial' },
      { id: 'authenticating', name: '认证中', type: 'intermediate' },
      { id: 'authenticated', name: '已认证', type: 'final' },
      { id: 'expired', name: '令牌过期', type: 'intermediate' },
      { id: 'locked', name: '账户锁定', type: 'error' },
    ],
    events: [
      { id: 'login', name: '登录' },
      { id: 'success', name: '认证成功' },
      { id: 'failure', name: '认证失败' },
      { id: 'logout', name: '登出' },
      { id: 'token_expired', name: '令牌过期' },
      { id: 'refresh', name: '刷新令牌' },
    ],
    transitions: [
      { from: 'unauthenticated', to: 'authenticating', trigger: 'login' },
      { from: 'authenticating', to: 'authenticated', trigger: 'success' },
      { from: 'authenticating', to: 'unauthenticated', trigger: 'failure' },
      { from: 'authenticated', to: 'unauthenticated', trigger: 'logout' },
      { from: 'authenticated', to: 'expired', trigger: 'token_expired' },
      { from: 'expired', to: 'authenticated', trigger: 'refresh' },
      { from: 'expired', to: 'locked', trigger: 'failure' },
    ],
  },

  // 订单状态机
  order: {
    name: '订单状态机',
    description: '电商订单状态流转',
    initialstate: 'pending',
    states: [
      { id: 'pending', name: '待支付', type: 'initial' },
      { id: 'paid', name: '已支付', type: 'intermediate' },
      { id: 'shipped', name: '已发货', type: 'intermediate' },
      { id: 'delivered', name: '已送达', type: 'final' },
      { id: 'cancelled', name: '已取消', type: 'final' },
      { id: 'refunded', name: '已退款', type: 'final' },
    ],
    events: [
      { id: 'pay', name: '支付' },
      { id: 'cancel', name: '取消' },
      { id: 'ship', name: '发货' },
      { id: 'deliver', name: '送达' },
      { id: 'refund', name: '退款' },
    ],
    transitions: [
      { from: 'pending', to: 'paid', trigger: 'pay' },
      { from: 'pending', to: 'cancelled', trigger: 'cancel' },
      { from: 'paid', to: 'shipped', trigger: 'ship' },
      { from: 'paid', to: 'refunded', trigger: 'refund' },
      { from: 'shipped', to: 'delivered', trigger: 'deliver' },
      { from: 'shipped', to: 'refunded', trigger: 'refund' },
    ],
  },
}

/**
 * 从模板创建状态机
 */
export function createStateMachineFromTemplate(
  templateName: string,
  overrides?: Partial<StateMachineConfig>
): StateMachineConfig {
  const template = commonStateMachineTemplates[templateName]
  if (!template) {
    throw new Error(`模板 ${templateName} 不存在`)
  }

  return createStateMachine(
    template.name || 'Unnamed',
    template.description || '',
    { ...template, ...overrides }
  )
}

export default {
  createStateMachine,
  addState,
  addEvent,
  addTransition,
  setInitialState,
  addContextVariable,
  validateStateMachine,
  executeTransition,
  createExecutionContext,
  getAllPossiblePaths,
  generateStateDiagram,
  generateStateMachineDocumentation,
  createStateMachineFromTemplate,
  commonStateMachineTemplates,
}
