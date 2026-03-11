import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ModuleGroupBorder from './ModuleGroupBorder'
import type { ModuleNodeGroup } from '../types'

interface CanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick?: (event: React.MouseEvent, node: Node) => void
  onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void
  onNodeDragStart?: (event: React.DragEvent, node: Node) => void
  moduleGroups?: ModuleNodeGroup[]
  selectedModuleId?: string
  onModuleDoubleClick?: (moduleId: string) => void
}

export default function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeContextMenu,
  onNodeDragStart,
  moduleGroups = [],
  selectedModuleId,
  onModuleDoubleClick,
}: CanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDragStart={onNodeDragStart}
        fitView
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        {/* 模块分组边框层 */}
        {moduleGroups.map(group => (
          <ModuleGroupBorder
            key={group.moduleId}
            group={group}
            isSelected={group.moduleId === selectedModuleId}
            onDoubleClick={() => onModuleDoubleClick?.(group.moduleId)}
          />
        ))}

        <MiniMap 
          nodeColor={(node) => {
            // 根据模块分组设置节点颜色
            const group = moduleGroups.find(g => g.nodes.includes(node.id))
            return group?.color || '#3b82f6'
          }}
        />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}
