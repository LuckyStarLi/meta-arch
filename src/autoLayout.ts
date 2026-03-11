import type { Node, Edge } from 'reactflow'
import type { NodeKind } from './types'

export interface LayoutConfig {
  horizontalSpacing: number
  verticalSpacing: number
  layerSpacing: number
  nodeWidth: number
  nodeHeight: number
  direction: 'horizontal' | 'vertical'
  align: 'left' | 'center' | 'right' | 'top' | 'bottom'
}

const defaultLayoutConfig: LayoutConfig = {
  horizontalSpacing: 50,
  verticalSpacing: 30,
  layerSpacing: 250,
  nodeWidth: 200,
  nodeHeight: 100,
  direction: 'horizontal',
  align: 'center',
}

const layerMap: Record<NodeKind, number> = {
  frontend: 0,
  persona: 0,           // Persona 与 Frontend 同层（展示层）
  api: 1,
  service: 2,
  agent: 2,             // Agent 与 Service 同层（智能层）
  repository: 3,
  database: 4,
}

// 获取节点的层级，未知类型默认返回 0
const getNodeLayer = (node: Node): number => {
  const kind = getNodeKind(node)
  return layerMap[kind] ?? 0
}

const getNodeKind = (node: Node): NodeKind => {
  return node.data?.type || 'frontend'
}

const groupNodesByLayer = (nodes: Node[]): Map<number, Node[]> => {
  const layerMap_nodes = new Map<number, Node[]>()
  
  nodes.forEach((node) => {
    const kind = getNodeKind(node)
    const layer = layerMap[kind] ?? 0
    
    if (!layerMap_nodes.has(layer)) {
      layerMap_nodes.set(layer, [])
    }
    layerMap_nodes.get(layer)!.push(node)
  })
  
  return layerMap_nodes
}

const calculateLayerPositions = (
  layerNodes: Node[],
  layerIndex: number,
  config: LayoutConfig
): { x: number; y: number }[] => {
  const nodeCount = layerNodes.length
  const positions: { x: number; y: number }[] = []
  
  const totalHeight = nodeCount * config.nodeHeight + (nodeCount - 1) * config.verticalSpacing
  
  let startY = 0
  if (config.align === 'center') {
    startY = -totalHeight / 2 + config.nodeHeight / 2
  } else if (config.align === 'left' || config.align === 'top') {
    startY = 0
  } else if (config.align === 'right' || config.align === 'bottom') {
    startY = -totalHeight + config.nodeHeight
  }
  
  for (let i = 0; i < nodeCount; i++) {
    const x = layerIndex * config.layerSpacing
    const y = startY + i * (config.nodeHeight + config.verticalSpacing)
    positions.push({ x, y })
  }
  
  return positions
}

export const autoLayout = (
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): { nodes: Node[]; edges: Edge[]; stats: LayoutStats } => {
  const finalConfig = { ...defaultLayoutConfig, ...config }
  
  const layerGroups = groupNodesByLayer(nodes)
  const layers = Array.from(layerGroups.keys()).sort((a, b) => a - b)
  
  const canvasCenterX = 400
  const canvasCenterY = 300
  
  const isHorizontal = finalConfig.direction === 'horizontal'
  
  const newPositions = new Map<string, { x: number; y: number }>()
  
  // 确保所有节点都被分配位置
  nodes.forEach((node) => {
    const layer = getNodeLayer(node)
    const layerNodes = layerGroups.get(layer) || []
    const nodeIndex = layerNodes.findIndex(n => n.id === node.id)
    
    if (nodeIndex === -1) {
      console.warn(`节点 ${node.id} 未在层级中找到，使用默认位置`)
      newPositions.set(node.id, { x: canvasCenterX, y: canvasCenterY })
      return
    }
    
    const layerIndex = layers.indexOf(layer)
    const positions = calculateLayerPositions(layerNodes, layerIndex, finalConfig)
    const pos = positions[nodeIndex]
    
    let x: number, y: number
    
    if (isHorizontal) {
      x = layerIndex * finalConfig.layerSpacing
      y = pos.y
    } else {
      x = pos.x
      y = layerIndex * finalConfig.layerSpacing
    }
    
    x += canvasCenterX
    y += canvasCenterY
    
    newPositions.set(node.id, { x, y })
  })
  
  // 保留所有节点属性和数据
  const newNodes = nodes.map((node) => {
    const pos = newPositions.get(node.id)
    if (!pos) {
      console.error(`节点 ${node.id} 没有位置信息，这是不应该发生的`)
      return node
    }
    
    return {
      ...node,
      position: pos,
      // 确保保留所有原有属性
      data: node.data,
      style: node.style,
      type: node.type,
      width: node.width,
      height: node.height,
      zIndex: node.zIndex,
    }
  })
  
  // 保持边的原有类型，仅优化样式
  const newEdges = edges.map((edge) => ({
    ...edge,
    // 保持原有的边类型
    type: edge.type || 'default',
    // 仅优化视觉样式，使线条更清晰
    style: {
      ...edge.style,
      strokeWidth: 2,
      stroke: '#555',
    },
  }))
  
  // 统计信息
  const stats: LayoutStats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    layers: layers.length,
    nodesByLayer: layers.map(layer => ({
      layer,
      count: layerGroups.get(layer)!.length,
      type: getLayerTypeName(layer),
    })),
  }
  
  return { nodes: newNodes, edges: newEdges, stats }
}

// 获取层级的中文名称
const getLayerTypeName = (layer: number): string => {
  const names: Record<number, string> = {
    0: '前端',
    1: 'API',
    2: '服务',
    3: '仓库',
    4: '数据库',
  }
  return names[layer] || '未知'
}

export interface LayoutStats {
  totalNodes: number
  totalEdges: number
  layers: number
  nodesByLayer: { layer: number; count: number; type: string }[]
}

export const getLayoutPreview = (
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): { id: string; originalX: number; originalY: number; newX: number; newY: number }[] => {
  const { nodes: laidOutNodes } = autoLayout(nodes, edges, config)
  
  return nodes.map((node, index) => ({
    id: node.id,
    originalX: node.position.x,
    originalY: node.position.y,
    newX: laidOutNodes[index].position.x,
    newY: laidOutNodes[index].position.y,
  }))
}

export const getLayoutBounds = (nodes: Node[]) => {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }
  }
  
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  
  nodes.forEach((node) => {
    const x = node.position.x
    const y = node.position.y
    const width = node.width || 200
    const height = node.height || 100
    
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x + width)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y + height)
  })
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export const getOptimalLayoutConfig = (nodes: Node[]): LayoutConfig => {
  const nodeCount = nodes.length
  const baseSpacing = nodeCount > 10 ? 40 : 50
  
  return {
    ...defaultLayoutConfig,
    horizontalSpacing: baseSpacing,
    verticalSpacing: baseSpacing * 0.6,
    layerSpacing: nodeCount > 8 ? 280 : 250,
  }
}

// 验证布局前后节点数量是否一致
export const validateLayout = (
  originalNodes: Node[],
  newNodes: Node[]
): { valid: boolean; message: string } => {
  if (originalNodes.length !== newNodes.length) {
    return {
      valid: false,
      message: `节点数量不匹配：原始 ${originalNodes.length} 个，排版后 ${newNodes.length} 个`,
    }
  }
  
  const originalIds = new Set(originalNodes.map(n => n.id))
  const newIds = new Set(newNodes.map(n => n.id))
  
  const missingIds = [...originalIds].filter(id => !newIds.has(id))
  if (missingIds.length > 0) {
    return {
      valid: false,
      message: `丢失节点：${missingIds.join(', ')}`,
    }
  }
  
  // 检查节点数据是否保留
  for (let i = 0; i < originalNodes.length; i++) {
    const original = originalNodes[i]
    const newNode = newNodes.find(n => n.id === original.id)
    
    if (!newNode) {
      return {
        valid: false,
        message: `节点 ${original.id} 丢失`,
      }
    }
    
    // 检查关键数据是否保留
    if (JSON.stringify(original.data) !== JSON.stringify(newNode.data)) {
      return {
        valid: false,
        message: `节点 ${original.id} 的数据被修改`,
      }
    }
  }
  
  return {
    valid: true,
    message: '布局验证通过，所有节点和数据已保留',
  }
}
