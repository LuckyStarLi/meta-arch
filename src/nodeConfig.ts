import type { NodeKind, NodeConfig } from './types'

export const getDefaultConfig = (type: NodeKind): NodeConfig => {
  const configMap: Record<NodeKind, NodeConfig> = {
    frontend: {
      name: '前端应用',
      framework: 'react',
      port: 3000,
    },
    api: {
      name: '示例 API',
      route: '/api/example',
      method: 'GET',
      requestModel: '示例请求模型',
      responseModel: '示例响应模型',
      requiresAuth: false,
      description: '获取示例数据',
    },
    service: {
      name: '示例服务',
      functionName: 'example_function',
      description: '示例服务函数',
    },
    repository: {
      name: '示例仓库',
      entity: '示例实体',
      operations: ['create', 'read', 'update', 'delete'],
    },
    database: {
      name: '示例数据库',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
    },
    agent: {
      name: '示例 Agent',
      agentType: 'rule',
      description: '示例规则引擎 Agent',
      capabilities: {
        inputs: [
          {
            name: 'query',
            type: 'string',
            required: true,
            description: '查询条件',
          },
        ],
        outputs: [
          {
            name: 'result',
            type: 'object',
            description: '查询结果',
          },
        ],
      },
      triggers: [
        {
          type: 'manual',
          config: {},
        },
      ],
      execution: {
        rules: [
          {
            condition: 'input.query !== ""',
            action: 'process',
            priority: 1,
          },
        ],
      },
      resources: {
        maxMemoryMB: 256,
        maxExecutionTimeMs: 5000,
        maxConcurrency: 10,
        gpuRequired: false,
      },
      monitoring: {
        enableLogging: true,
        enableMetrics: true,
        alertThresholds: {
          errorRate: 0.05,
          latencyP99: 1000,
        },
      },
    },
    persona: {
      name: '数字助手',
      avatar: '🤖',
      description: '智能数字助手角色',
      personality: {
        traits: {
          openness: 0.8,
          conscientiousness: 0.7,
          extraversion: 0.6,
          agreeableness: 0.9,
          neuroticism: 0.3,
        },
        communication: {
          tone: 'friendly',
          formality: 0.5,
          verbosity: 0.6,
          emoji: true,
          language: ['zh-CN', 'en'],
        },
        preferences: {
          workingHours: { start: 9, end: 18 },
          autoApproveThreshold: 1000,
          escalationPolicy: 'notify_user',
        },
      },
      agents: [],
      knowledge: {
        sources: [],
      },
      goals: [],
      relationships: [],
    },
  }

  return configMap[type]
}

export const getNodeLabel = (type: NodeKind): string => {
  const labels: Record<NodeKind, string> = {
    frontend: '前端',
    api: 'API',
    service: '服务',
    repository: '仓库',
    database: '数据库',
    agent: 'Agent',
    persona: '数字角色',
  }
  return labels[type]
}

export const getNodeColor = (type: NodeKind): string => {
  const colors: Record<NodeKind, string> = {
    frontend: '#61dafb',
    api: '#009688',
    service: '#ff9800',
    repository: '#9c27b0',
    database: '#2196f3',
    agent: '#4caf50',
    persona: '#e91e63',
  }
  return colors[type]
}

export const getConfigFields = (type: NodeKind) => {
  const fields: Record<NodeKind, { key: string; label: string; type: string }[]> = {
    frontend: [
      { key: 'name', label: '应用名称', type: 'text' },
      { key: 'framework', label: '框架', type: 'select' },
      { key: 'port', label: '端口', type: 'number' },
    ],
    api: [
      { key: 'name', label: 'API 名称', type: 'text' },
      { key: 'route', label: '路由路径', type: 'text' },
      { key: 'method', label: '请求方法', type: 'select' },
      { key: 'description', label: '描述', type: 'text' },
      { key: 'requiresAuth', label: '需要认证', type: 'boolean' },
    ],
    service: [
      { key: 'name', label: '服务名称', type: 'text' },
      { key: 'functionName', label: '函数名', type: 'text' },
      { key: 'description', label: '描述', type: 'text' },
    ],
    repository: [
      { key: 'name', label: '仓库名称', type: 'text' },
      { key: 'entity', label: '实体名', type: 'text' },
      { key: 'operations', label: '操作', type: 'multiselect' },
    ],
    database: [
      { key: 'name', label: '数据库名', type: 'text' },
      { key: 'type', label: '数据库类型', type: 'select' },
      { key: 'host', label: '主机地址', type: 'text' },
      { key: 'port', label: '端口', type: 'number' },
    ],
    agent: [
      { key: 'name', label: 'Agent 名称', type: 'text' },
      { key: 'agentType', label: 'Agent 类型', type: 'select' },
      { key: 'description', label: '描述', type: 'text' },
      { key: 'maxMemoryMB', label: '最大内存 (MB)', type: 'number' },
      { key: 'maxExecutionTimeMs', label: '超时时间 (ms)', type: 'number' },
    ],
    persona: [
      { key: 'name', label: '角色名称', type: 'text' },
      { key: 'avatar', label: '头像', type: 'text' },
      { key: 'description', label: '描述', type: 'text' },
      { key: 'tone', label: '沟通风格', type: 'select' },
    ],
  }
  return fields[type]
}
