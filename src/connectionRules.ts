import type { Edge } from 'reactflow'
import type { CustomNode, NodeKind } from './types'

type ConnectionRule = {
  source: NodeKind
  target: NodeKind
}

// 定义合法的连接规则：前端 → API → 服务 → 仓库 → 数据库
// 新增：Agent 和 Persona 节点的连接规则
const validConnections: ConnectionRule[] = [
  // 原有规则
  { source: 'frontend', target: 'api' },
  { source: 'api', target: 'service' },
  { source: 'service', target: 'repository' },
  { source: 'repository', target: 'database' },
  
  // Agent 相关规则
  { source: 'service', target: 'agent' },      // 服务可以调用 Agent
  { source: 'agent', target: 'repository' },   // Agent 可以访问仓库
  { source: 'agent', target: 'agent' },        // Agent 之间可以协作
  { source: 'agent', target: 'service' },      // Agent 可以调用服务
  
  // Persona 相关规则
  { source: 'persona', target: 'agent' },      // Persona 可以指挥 Agent
  { source: 'frontend', target: 'persona' },   // 前端可以与 Persona 交互
  { source: 'agent', target: 'persona' },      // Agent 可以向 Persona 汇报
]

// 节点类型中文映射（更新）
const nodeTypeLabels: Record<NodeKind, string> = {
  frontend: '前端',
  api: 'API',
  service: '服务',
  repository: '仓库',
  database: '数据库',
  agent: 'Agent',
  persona: '数字角色',
}

export const validateConnection = (
  sourceNode: CustomNode,
  targetNode: CustomNode
): boolean => {
  return validConnections.some(
    rule =>
      rule.source === sourceNode.data.type &&
      rule.target === targetNode.data.type
  )
}

export const validateArchitecture = (
  nodes: CustomNode[],
  edges: Edge[]
): boolean => {
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)

    if (!sourceNode || !targetNode) {
      return false
    }

    if (!validateConnection(sourceNode, targetNode)) {
      return false
    }
  }

  return true
}

export const getValidationError = (
  sourceNode: CustomNode,
  targetNode: CustomNode
): string | null => {
  if (!validateConnection(sourceNode, targetNode)) {
    const sourceType = sourceNode.data.type
    const targetType = targetNode.data.type
    const sourceLabel = nodeTypeLabels[sourceType]
    const targetLabel = nodeTypeLabels[targetType]
    
    const validTargets = validConnections
      .filter(rule => rule.source === sourceType)
      .map(rule => nodeTypeLabels[rule.target])

    if (validTargets.length === 0) {
      return `${sourceLabel} 节点不能连接到其他节点`
    }

    return `${sourceLabel} 节点只能连接到：${validTargets.join('、')}，不能连接到 ${targetLabel}`
  }

  return null
}

export const getConnectionRules = () => {
  return validConnections.map(rule => ({
    from: nodeTypeLabels[rule.source],
    to: nodeTypeLabels[rule.target],
  }))
}

// 新增：获取节点的层级（用于自动排版）
export const getNodeLayer = (type: NodeKind): number => {
  const layerMap: Record<NodeKind, number> = {
    frontend: 0,
    persona: 0,           // Persona 与 Frontend 同层
    api: 1,
    service: 2,
    agent: 2,             // Agent 与 Service 同层（智能层）
    repository: 3,
    database: 4,
  }
  return layerMap[type] ?? 0
}
