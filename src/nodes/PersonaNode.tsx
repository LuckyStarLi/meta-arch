import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { PersonaConfig } from '../types'

interface PersonaNodeData {
  label: string
  type: 'persona'
  config: PersonaConfig
}

function PersonaNode({ data, selected }: NodeProps<PersonaNodeData>) {
  const config = data.config
  const activeAgents = config.agents.filter(a => a.autoActivate).length
  const totalAgents = config.agents.length

  return (
    <div
      style={{
        background: 'white',
        border: '2px solid #e91e63',
        borderRadius: 16,
        padding: 16,
        minWidth: 240,
        maxWidth: 350,
        boxShadow: selected 
          ? '0 0 0 2px #e91e63, 0 6px 20px rgba(233, 30, 99, 0.3)'
          : '0 4px 16px rgba(233, 30, 99, 0.15)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* 输入手柄（左侧） */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#e91e63',
          border: '2px solid white',
          width: 14,
          height: 14,
        }}
      />

      {/* 节点内容 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        {/* 头像 */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e91e63 0%, #ff4081 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(233, 30, 99, 0.3)',
          }}
        >
          {config.avatar || '👤'}
        </div>

        {/* 信息 */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#333', marginBottom: 4 }}>
            {data.label}
          </div>
          <div style={{ fontSize: 11, color: '#e91e63', fontWeight: 500 }}>
            DIGITAL PERSONA
          </div>
        </div>
      </div>

      {/* 人格特征指标 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 6, fontWeight: 500 }}>
          人格特征
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
          <div style={{ background: '#f5f5f5', padding: '4px 6px', borderRadius: 4 }}>
            开放性：{(config.personality.traits.openness * 100).toFixed(0)}%
          </div>
          <div style={{ background: '#f5f5f5', padding: '4px 6px', borderRadius: 4 }}>
            尽责性：{(config.personality.traits.conscientiousness * 100).toFixed(0)}%
          </div>
          <div style={{ background: '#f5f5f5', padding: '4px 6px', borderRadius: 4 }}>
            外向性：{(config.personality.traits.extraversion * 100).toFixed(0)}%
          </div>
          <div style={{ background: '#f5f5f5', padding: '4px 6px', borderRadius: 4 }}>
            宜人性：{(config.personality.traits.agreeableness * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Agent 团队状态 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 11, color: '#880e4f', fontWeight: 600, marginBottom: 6 }}>
          🤖 Agent 团队
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#880e4f', marginBottom: 3 }}>
              活跃 Agent: {activeAgents} / {totalAgents}
            </div>
            <div
              style={{
                height: 6,
                background: 'rgba(255,255,255,0.5)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(activeAgents / totalAgents) * 100}%`,
                  height: '100%',
                  background: '#4caf50',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 沟通风格 */}
      <div style={{ fontSize: 10, color: '#666', marginBottom: 8 }}>
        <div style={{ marginBottom: 3 }}>
          <strong>风格:</strong> {config.personality.communication.tone}
        </div>
        <div>
          <strong>语言:</strong> {config.personality.communication.language.join(', ')}
        </div>
      </div>

      {/* 状态指示器 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#4caf50',
              border: '1px solid white',
              boxShadow: '0 0 4px #4caf50',
            }}
          />
          <span style={{ color: '#666' }}>在线</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚡</span>
          <span style={{ color: '#666' }}>
            能量：80%
          </span>
        </div>
      </div>

      {/* 输出手柄（右侧） */}
      <Handle
        type="source"
        position={Position.Right}
        id="actions"
        style={{
          background: '#e91e63',
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
      />

      {/* 消息输出手柄（底部） */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="messages"
        style={{
          background: '#2196f3',
          border: '2px solid white',
          width: 10,
          height: 10,
          bottom: -5,
        }}
      />
    </div>
  )
}

export default memo(PersonaNode)
