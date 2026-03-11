import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { AgentConfig, AgentType } from '../types'

interface AgentNodeData {
  label: string
  type: 'agent'
  config: AgentConfig
}

const agentTypeIcons: Record<AgentType, string> = {
  rule: '📋',
  workflow: '🔄',
  ml: '🤖',
  llm: '🧠',
}

const agentTypeColors: Record<AgentType, string> = {
  rule: '#4caf50',
  workflow: '#2196f3',
  ml: '#ff9800',
  llm: '#9c27b0',
}

function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  const config = data.config
  const icon = agentTypeIcons[config.agentType]
  const color = agentTypeColors[config.agentType]

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${color}`,
        borderRadius: 12,
        padding: 12,
        minWidth: 200,
        maxWidth: 300,
        boxShadow: selected 
          ? `0 0 0 2px ${color}, 0 4px 12px rgba(0,0,0,0.15)`
          : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* 输入手柄（左侧） */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: color,
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
      />

      {/* 节点内容 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
            {data.label}
          </div>
          <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>
            {config.agentType} Agent
          </div>
        </div>
      </div>

      {/* Agent 状态指示器 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <div
          title="状态：活跃"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#4caf50',
            border: '1px solid white',
          }}
        />
        <div
          title="能力：就绪"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#2196f3',
            border: '1px solid white',
          }}
        />
      </div>

      {/* 简要信息 */}
      <div
        style={{
          fontSize: 11,
          color: '#666',
          background: '#f5f5f5',
          padding: '6px 8px',
          borderRadius: 6,
          marginBottom: 8,
        }}
      >
        <div style={{ marginBottom: 3 }}>
          <strong>触发器:</strong> {config.triggers?.[0]?.type || '手动'}
        </div>
        <div>
          <strong>能力:</strong> {config.capabilities?.inputs?.length || 0} 输入，
          {config.capabilities?.outputs?.length || 0} 输出
        </div>
      </div>

      {/* 资源使用指示器 */}
      <div style={{ fontSize: 10, color: '#999' }}>
        💾 {config.resources?.maxMemoryMB || 256}MB | 
        ⏱️ {config.resources?.maxExecutionTimeMs || 5000}ms
      </div>

      {/* 输出手柄（右侧） */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          background: color,
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
      />

      {/* 事件输出手柄（底部） */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="events"
        style={{
          background: '#ff9800',
          border: '2px solid white',
          width: 10,
          height: 10,
          bottom: -5,
        }}
      />
    </div>
  )
}

export default memo(AgentNode)
