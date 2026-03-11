import { describe, it, expect } from 'vitest'
import { validateConnection, getNodeLayer } from '../connectionRules'
import type { CustomNode, NodeKind, NodeConfig } from '../types'

// 辅助函数：创建测试节点
const createTestNode = (id: string, type: NodeKind): CustomNode => ({
  id,
  type: 'default',
  position: { x: 0, y: 0 },
  data: {
    label: `${type} Node`,
    type,
    config: {} as NodeConfig,
  },
})

describe('连接规则测试', () => {
  describe('新增节点连接规则', () => {
    it('Service 应该可以连接到 Agent', () => {
      const serviceNode = createTestNode('service-1', 'service')
      const agentNode = createTestNode('agent-1', 'agent')
      
      const result = validateConnection(serviceNode, agentNode)
      expect(result).toBe(true)
    })

    it('Agent 应该可以连接到 Repository', () => {
      const agentNode = createTestNode('agent-1', 'agent')
      const repoNode = createTestNode('repo-1', 'repository')
      
      const result = validateConnection(agentNode, repoNode)
      expect(result).toBe(true)
    })

    it('Agent 之间应该可以互相连接', () => {
      const agent1 = createTestNode('agent-1', 'agent')
      const agent2 = createTestNode('agent-2', 'agent')
      
      const result = validateConnection(agent1, agent2)
      expect(result).toBe(true)
    })

    it('Persona 应该可以连接到 Agent', () => {
      const personaNode = createTestNode('persona-1', 'persona')
      const agentNode = createTestNode('agent-1', 'agent')
      
      const result = validateConnection(personaNode, agentNode)
      expect(result).toBe(true)
    })

    it('Frontend 应该可以连接到 Persona', () => {
      const frontendNode = createTestNode('frontend-1', 'frontend')
      const personaNode = createTestNode('persona-1', 'persona')
      
      const result = validateConnection(frontendNode, personaNode)
      expect(result).toBe(true)
    })

    it('Agent 应该可以连接到 Persona', () => {
      const agentNode = createTestNode('agent-1', 'agent')
      const personaNode = createTestNode('persona-1', 'persona')
      
      const result = validateConnection(agentNode, personaNode)
      expect(result).toBe(true)
    })

    it('应该拒绝无效连接：Frontend 直接连接到 Database', () => {
      const frontendNode = createTestNode('frontend-1', 'frontend')
      const dbNode = createTestNode('db-1', 'database')
      
      const result = validateConnection(frontendNode, dbNode)
      expect(result).toBe(false)
    })

    it('应该拒绝无效连接：Agent 直接连接到 Database', () => {
      const agentNode = createTestNode('agent-1', 'agent')
      const dbNode = createTestNode('db-1', 'database')
      
      const result = validateConnection(agentNode, dbNode)
      expect(result).toBe(false)
    })
  })

  describe('节点层级测试', () => {
    it('Persona 应该与 Frontend 同层（第 0 层）', () => {
      expect(getNodeLayer('persona')).toBe(0)
      expect(getNodeLayer('frontend')).toBe(0)
    })

    it('Agent 应该与 Service 同层（第 2 层）', () => {
      expect(getNodeLayer('agent')).toBe(2)
      expect(getNodeLayer('service')).toBe(2)
    })

    it('所有节点层级应该正确', () => {
      expect(getNodeLayer('frontend')).toBe(0)
      expect(getNodeLayer('persona')).toBe(0)
      expect(getNodeLayer('api')).toBe(1)
      expect(getNodeLayer('service')).toBe(2)
      expect(getNodeLayer('agent')).toBe(2)
      expect(getNodeLayer('repository')).toBe(3)
      expect(getNodeLayer('database')).toBe(4)
    })
  })
})
