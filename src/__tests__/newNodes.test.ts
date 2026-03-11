import { describe, it, expect } from 'vitest'
import type { NodeKind, AgentConfig, PersonaConfig } from '../types'

describe('新增节点类型测试', () => {
  // 测试 1: Agent 节点类型定义
  describe('Agent 节点类型', () => {
    it('应该正确定义 Agent 类型', () => {
      const agentTypes: AgentConfig['agentType'][] = ['rule', 'workflow', 'ml', 'llm']
      expect(agentTypes).toHaveLength(4)
      expect(agentTypes).toContain('rule')
      expect(agentTypes).toContain('llm')
    })

    it('应该创建有效的 Agent 配置', () => {
      const agentConfig: AgentConfig = {
        name: '测试 Agent',
        agentType: 'rule',
        description: '测试用规则引擎 Agent',
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
              condition: 'true',
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
      }

      expect(agentConfig.name).toBe('测试 Agent')
      expect(agentConfig.agentType).toBe('rule')
      expect(agentConfig.capabilities.inputs).toHaveLength(1)
      expect(agentConfig.resources.maxMemoryMB).toBe(256)
    })

    it('应该支持所有 Agent 类型', () => {
      const agentTypes: AgentConfig['agentType'][] = ['rule', 'workflow', 'ml', 'llm']
      
      agentTypes.forEach(type => {
        const config: AgentConfig = {
          name: `${type} Agent`,
          agentType: type,
          description: `${type} 类型的 Agent`,
          capabilities: {
            inputs: [],
            outputs: [],
          },
          triggers: [],
          execution: {},
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
        }
        expect(config.agentType).toBe(type)
      })
    })
  })

  // 测试 2: Persona 节点类型定义
  describe('Persona 节点类型', () => {
    it('应该创建有效的 Persona 配置', () => {
      const personaConfig: PersonaConfig = {
        name: '数字助手',
        avatar: '🤖',
        description: '智能数字助手',
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
      }

      expect(personaConfig.name).toBe('数字助手')
      expect(personaConfig.personality.traits.openness).toBe(0.8)
      expect(personaConfig.personality.communication.language).toContain('zh-CN')
    })

    it('应该验证人格特征范围', () => {
      const personaConfig: PersonaConfig = {
        name: '测试角色',
        description: '测试',
        personality: {
          traits: {
            openness: 1.0,
            conscientiousness: 0.0,
            extraversion: 0.5,
            agreeableness: 0.75,
            neuroticism: 0.25,
          },
          communication: {
            tone: 'professional',
            formality: 0.8,
            verbosity: 0.4,
            emoji: false,
            language: ['en'],
          },
          preferences: {
            workingHours: { start: 0, end: 24 },
            autoApproveThreshold: 0,
            escalationPolicy: 'auto_reject',
          },
        },
        agents: [],
        knowledge: { sources: [] },
        goals: [],
        relationships: [],
      }

      // 验证所有特征在 0-1 范围内
      const traits = personaConfig.personality.traits
      expect(traits.openness).toBeGreaterThanOrEqual(0)
      expect(traits.openness).toBeLessThanOrEqual(1)
      expect(traits.conscientiousness).toBeGreaterThanOrEqual(0)
      expect(traits.conscientiousness).toBeLessThanOrEqual(1)
    })
  })

  // 测试 3: 节点类型完整性
  describe('节点类型完整性', () => {
    it('应该包含所有节点类型', () => {
      const allNodeTypes: NodeKind[] = [
        'frontend',
        'api',
        'service',
        'repository',
        'database',
        'agent',      // 新增
        'persona',    // 新增
      ]

      expect(allNodeTypes).toHaveLength(7)
      expect(allNodeTypes).toContain('agent')
      expect(allNodeTypes).toContain('persona')
    })

    it('新增节点类型应该与其他类型区分', () => {
      const newTypes: NodeKind[] = ['agent', 'persona']
      const oldTypes: NodeKind[] = ['frontend', 'api', 'service', 'repository', 'database']

      newTypes.forEach(newType => {
        expect(oldTypes).not.toContain(newType)
      })
    })
  })
})
