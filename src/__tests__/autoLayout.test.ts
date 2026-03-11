import { describe, it, expect } from 'vitest'
import { autoLayout, getOptimalLayoutConfig } from '../autoLayout'
import type { Node, Edge } from 'reactflow'
import type { NodeKind, NodeConfig } from '../types'

// 辅助函数：创建测试节点
const createTestNode = (id: string, type: NodeKind, position = { x: 0, y: 0 }): Node => ({
  id,
  type: 'default',
  position,
  data: {
    label: `${type} Node`,
    type,
    config: {} as NodeConfig,
  },
})

describe('自动排版算法测试', () => {
  describe('新增节点排版', () => {
    it('应该正确处理包含 Persona 节点的排版', () => {
      const nodes: Node[] = [
        createTestNode('persona-1', 'persona', { x: 100, y: 100 }),
        createTestNode('frontend-1', 'frontend', { x: 200, y: 200 }),
        createTestNode('api-1', 'api', { x: 300, y: 300 }),
      ]
      const edges: Edge[] = []

      const result = autoLayout(nodes, edges)

      expect(result.nodes).toHaveLength(3)
      // Persona 和 Frontend 应该在同一层（x 坐标相近）
      const personaNode = result.nodes.find(n => n.id === 'persona-1')
      const frontendNode = result.nodes.find(n => n.id === 'frontend-1')
      
      expect(personaNode).toBeDefined()
      expect(frontendNode).toBeDefined()
      
      if (personaNode && frontendNode) {
        // 同一层的节点 x 坐标应该相同或相近
        expect(Math.abs(personaNode.position.x - frontendNode.position.x)).toBeLessThan(100)
      }
    })

    it('应该正确处理包含 Agent 节点的排版', () => {
      const nodes: Node[] = [
        createTestNode('service-1', 'service', { x: 100, y: 100 }),
        createTestNode('agent-1', 'agent', { x: 200, y: 200 }),
        createTestNode('agent-2', 'agent', { x: 300, y: 300 }),
        createTestNode('repo-1', 'repository', { x: 400, y: 400 }),
      ]
      const edges: Edge[] = []

      const result = autoLayout(nodes, edges)

      expect(result.nodes).toHaveLength(4)
      // Service 和 Agent 应该在同一层
      const serviceNode = result.nodes.find(n => n.id === 'service-1')
      const agentNode = result.nodes.find(n => n.id === 'agent-1')
      
      expect(serviceNode).toBeDefined()
      expect(agentNode).toBeDefined()
      
      if (serviceNode && agentNode) {
        expect(Math.abs(serviceNode.position.x - agentNode.position.x)).toBeLessThan(100)
      }
    })

    it('应该正确处理混合节点排版', () => {
      const nodes: Node[] = [
        createTestNode('persona-1', 'persona'),
        createTestNode('frontend-1', 'frontend'),
        createTestNode('api-1', 'api'),
        createTestNode('service-1', 'service'),
        createTestNode('agent-1', 'agent'),
        createTestNode('repo-1', 'repository'),
        createTestNode('db-1', 'database'),
      ]
      const edges: Edge[] = []

      const result = autoLayout(nodes, edges)

      expect(result.nodes).toHaveLength(7)
      
      // 验证层级关系
      const layers = new Map<number, number>()
      result.nodes.forEach(node => {
        const x = node.position.x
        if (!layers.has(x)) {
          layers.set(x, 0)
        }
        layers.set(x, (layers.get(x) || 0) + 1)
      })

      // 应该至少有 5 个不同的层
      expect(layers.size).toBeGreaterThanOrEqual(5)
    })
  })

  describe('最优配置测试', () => {
    it('应该为少量节点生成合适的配置', () => {
      const nodes: Node[] = [
        createTestNode('persona-1', 'persona'),
        createTestNode('agent-1', 'agent'),
      ]

      const config = getOptimalLayoutConfig(nodes)

      expect(config.horizontalSpacing).toBe(50)
      expect(config.layerSpacing).toBe(250)
    })

    it('应该为大量节点调整间距', () => {
      const nodes: Node[] = Array.from({ length: 15 }, (_, i) =>
        createTestNode(`node-${i}`, i % 2 === 0 ? 'agent' : 'service')
      )

      const config = getOptimalLayoutConfig(nodes)

      // 节点数超过 10 个，间距应该减小
      expect(config.horizontalSpacing).toBe(40)
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空节点数组', () => {
      const nodes: Node[] = []
      const edges: Edge[] = []

      const result = autoLayout(nodes, edges)

      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('应该处理单个 Persona 节点', () => {
      const nodes: Node[] = [createTestNode('persona-1', 'persona')]
      const edges: Edge[] = []

      const result = autoLayout(nodes, edges)

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].position.x).toBeGreaterThan(0)
    })

    it('应该处理只有 Agent 节点的情况', () => {
      const nodes: Node[] = [
        createTestNode('agent-1', 'agent'),
        createTestNode('agent-2', 'agent'),
        createTestNode('agent-3', 'agent'),
      ]
      const edges: Edge[] = []

      const result = autoLayout(nodes, edges)

      expect(result.nodes).toHaveLength(3)
      // 所有 Agent 应该在同一层
      const xCoords = result.nodes.map(n => n.position.x)
      expect(xCoords[0]).toBe(xCoords[1])
      expect(xCoords[1]).toBe(xCoords[2])
    })
  })
})
