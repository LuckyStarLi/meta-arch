import type { Node } from 'reactflow'

// 节点类型扩展：新增 agent 和 persona
export type NodeKind =
  | 'frontend'
  | 'api'
  | 'service'
  | 'repository'
  | 'database'
  | 'agent'      // 新增：AI Agent
  | 'persona'    // 新增：数字角色

// Agent 类型细分
export type AgentType = 'rule' | 'workflow' | 'ml' | 'llm'

// Agent 角色类型
export type AgentRole = 'assistant' | 'specialist' | 'manager' | 'executor'

// 人格特征接口
export interface PersonalityTraits {
  openness: number              // 开放性 0-1
  conscientiousness: number     // 尽责性 0-1
  extraversion: number          // 外向性 0-1
  agreeableness: number         // 宜人性 0-1
  neuroticism: number           // 神经质 0-1
}

// 沟通风格
export interface CommunicationStyle {
  tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'empathetic'
  formality: number             // 正式程度 0-1
  verbosity: number             // 详细程度 0-1
  emoji: boolean                // 是否使用表情
  language: string[]            // 支持的语言
}

// Agent 配置接口
export interface AgentConfig {
  name: string
  agentType: AgentType
  description: string
  
  // 能力定义
  capabilities: {
    inputs: {
      name: string
      type: 'string' | 'number' | 'object' | 'array' | 'file'
      required: boolean
      description: string
      validation?: string
    }[]
    outputs: {
      name: string
      type: 'string' | 'number' | 'object' | 'array' | 'file'
      description: string
      schema?: unknown
    }[]
  }
  
  // 触发器配置
  triggers: {
    type: 'manual' | 'scheduled' | 'event' | 'message'
    config: {
      cron?: string
      eventPattern?: string
      messagePattern?: string
    }
  }[]
  
  // 执行逻辑（根据类型不同）
  execution: {
    // Rule Agent
    rules?: {
      condition: string
      action: string
      priority: number
    }[]
    
    // Workflow Agent
    workflow?: {
      steps: unknown[]
    }
    
    // ML Agent
    mlModel?: {
      modelPath: string
      inputSchema: unknown
      outputSchema: unknown
    }
    
    // LLM Agent
    llm?: {
      provider: 'openai' | 'anthropic' | 'azure' | 'local'
      model: string
      temperature: number
      maxTokens: number
      systemPrompt: string
    }
  }
  
  // 资源限制
  resources: {
    maxMemoryMB: number
    maxExecutionTimeMs: number
    maxConcurrency: number
    gpuRequired: boolean
  }
  
  // 监控配置
  monitoring: {
    enableLogging: boolean
    enableMetrics: boolean
    alertThresholds: {
      errorRate: number
      latencyP99: number
    }
  }
}

// Persona 配置接口
export interface PersonaConfig {
  name: string
  avatar?: string
  description: string
  
  // 人格特征
  personality: {
    traits: PersonalityTraits
    communication: CommunicationStyle
    preferences: {
      workingHours: { start: number, end: number }
      autoApproveThreshold: number
      escalationPolicy: string
    }
  }
  
  // 拥有的 Agent
  agents: {
    agentId: string
    name: string
    role: AgentRole
    priority: number
    autoActivate: boolean
  }[]
  
  // 知识库
  knowledge: {
    sources: {
      type: 'document' | 'database' | 'api' | 'url'
      path: string
      updatePolicy: 'manual' | 'scheduled' | 'realtime'
    }[]
  }
  
  // 目标与 KPI
  goals: {
    id: string
    description: string
    kpis: {
      metric: string
      target: number
      current: number
    }[]
  }[]
  
  // 社交关系
  relationships: {
    personaId: string
    type: 'friend' | 'colleague' | 'client' | 'competitor'
    trustLevel: number
  }[]
}

// 原有配置接口保持不变
export interface FrontendConfig {
  name: string
  framework: 'react' | 'vue' | 'angular'
  port: number
}

export interface ApiConfig {
  name: string
  route: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  requestModel: string
  responseModel: string
  requiresAuth: boolean
  description: string
}

export interface ServiceConfig {
  name: string
  functionName: string
  description: string
}

export interface RepositoryConfig {
  name: string
  entity: string
  operations: ('create' | 'read' | 'update' | 'delete')[]
}

export interface DatabaseConfig {
  name: string
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite'
  host: string
  port: number
}

// 统一的配置类型
export type NodeConfig =
  | FrontendConfig
  | ApiConfig
  | ServiceConfig
  | RepositoryConfig
  | DatabaseConfig
  | AgentConfig
  | PersonaConfig

// 节点数据接口
export interface BaseNodeData {
  label: string
  type: NodeKind
  config: NodeConfig
}

// ReactFlow 节点类型
export type CustomNode = Node<BaseNodeData>

// ==================== 模块与节点集成类型 ====================

/**
 * 节点与模块的关联关系（已废弃，使用 NodeOwnership）
 */
export interface NodeModuleBinding {
  nodeId: string              // 节点 ID
  moduleId: string            // 模块 ID
  bindingType: 'primary' | 'secondary'  // 主要关联/次要关联
  createdAt: number           // 绑定时间戳
  // 为兼容性保留的字段
  primaryModule?: string      // 主要归属模块 ID
  secondaryModules?: string[] // 次要归属模块 ID
  isOrphan?: boolean          // 是否未归属任何模块
}

/**
 * 模块级别的节点分组
 */
export interface ModuleNodeGroup {
  moduleId: string
  moduleName: string
  moduleType: string
  moduleLayer: string
  nodes: string[]             // 节点 ID 列表
  color: string               // 模块主题色
  position?: {               // 模块在画布中的位置
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * 模块依赖与节点连接的映射关系
 */
export interface ModuleDependencyMapping {
  sourceModuleId: string      // 源模块
  targetModuleId: string      // 目标模块
  connections: Array<{        // 对应的节点连接
    sourceNodeId: string
    targetNodeId: string
    edgeId: string
  }>
  isValid: boolean            // 依赖是否有效
  validationErrors: string[]  // 验证错误
}

/**
 * 模块统计信息
 */
export interface ModuleStatistics {
  moduleId: string
  totalNodes: number          // 节点总数
  nodesByType: Record<string, number>  // 按类型统计
  internalConnections: number // 模块内部连接数
  externalConnections: number // 模块外部连接数
  dependencyCount: number     // 依赖模块数
  dependentCount: number      // 被依赖模块数
  healthScore: number         // 健康度评分 0-100
}

/**
 * 节点归属信息（添加到 BaseNodeData）
 */
export interface NodeOwnership {
  primaryModule?: string      // 主要归属模块 ID
  secondaryModules?: string[] // 次要归属模块 ID
  isOrphan: boolean           // 是否未归属任何模块
}
