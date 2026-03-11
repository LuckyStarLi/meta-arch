import { useCallback, useState, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
} from 'reactflow'

import 'reactflow/dist/style.css'
import './styles/reactflow-nodes.css'
import './styles/icon-system.css'

import { getDefaultConfig, getNodeLabel, getNodeColor } from './nodeConfig'
import { validateConnection, validateArchitecture, getValidationError } from './connectionRules'
import { exportProject } from './exportArchitecture'
import { autoLayout, getOptimalLayoutConfig, validateLayout, type LayoutConfig } from './autoLayout'
import TopBar from './components/TopBar'
import ConfigPanel from './components/ConfigPanel'
import LayoutConfigPanel from './components/LayoutConfigPanel'
import DesignCheckReportPanel from './components/DesignCheckReportPanel'
import TemplateManagerPanel from './components/TemplateManagerPanel'
import ModuleManagerPanel from './components/ModuleManagerPanel'
import { runDesignCheck } from './designChecker'
import type { DesignCheckReport } from './designChecker'
import type { CustomNode as NodeType } from './types'
import type { Edge as EdgeType } from 'reactflow'
import { AgentNode, PersonaNode } from './nodes'
import type { BaseNodeData, NodeKind, CustomNode, NodeConfig } from './types'
import type { ModuleConfig } from './modules/moduleSystem'
import { moduleNodeIntegration } from './modules/moduleNodeIntegration'
import Canvas from './components/Canvas'
import NodeContextMenu from './components/NodeContextMenu'

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<BaseNodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null)
  const [showLayoutConfig, setShowLayoutConfig] = useState(false)
  const [layoutConfig, setLayoutConfig] = useState<Partial<LayoutConfig>>({})
  const [showDesignCheck, setShowDesignCheck] = useState(false)
  const [checkReport, setCheckReport] = useState<DesignCheckReport | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showModuleManager, setShowModuleManager] = useState(false)
  const [modules, setModules] = useState<ModuleConfig[]>(() => {
    const saved = localStorage.getItem('meta-arch-modules')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    nodeId: string
  } | null>(null)

  // 选中的模块 ID
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  const addNode = (type: NodeKind) => {
    const newNode: CustomNode = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: getNodeLabel(type),
        type,
        config: getDefaultConfig(type),
      },
    }

    setNodes((nds) => [...nds, newNode] as CustomNode[])
  }

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) return

      const valid = validateConnection(sourceNode as CustomNode, targetNode as CustomNode)

      if (valid) {
        setEdges((eds) => addEdge(connection, eds))
        setErrorMessage(null)
      } else {
        const error = getValidationError(sourceNode as CustomNode, targetNode as CustomNode)
        setErrorMessage(error || '连接不符合架构规则，请检查连接关系')
      }
    },
    [nodes, setEdges]
  )

  const handleNodeClick = (_: React.MouseEvent, node: CustomNode) => {
    console.log('🖱️ 节点被点击:', node.id, node.data.type)
    setSelectedNode(node)
    setErrorMessage(null)
    // 确保关闭其他面板
    setShowLayoutConfig(false)
    setShowDesignCheck(false)
    setCheckReport(null)
  }

  const handleUpdateNode = (nodeId: string, newConfig: NodeConfig) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: newConfig,
            },
          }
        }
        return node
      }) as CustomNode[]
    )

    setSelectedNode(null)
    setErrorMessage('✅ 配置已保存')
    setTimeout(() => setErrorMessage(null), 2000)
  }

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId) as CustomNode[])
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setErrorMessage('✅ 节点已删除')
    setTimeout(() => setErrorMessage(null), 2000)
  }

  // 将节点绑定到模块（使用集成管理器）
  const handleBindNodeToModule = (nodeId: string, moduleId: string) => {
    moduleNodeIntegration.bindNodeToModule(nodeId, moduleId, 'primary')
    setErrorMessage('✅ 节点已绑定到模块')
    setTimeout(() => setErrorMessage(null), 2000)
  }

  // 创建新模块并绑定节点
  const handleCreateModuleAndBind = (moduleName: string) => {
    if (!contextMenu) return
    
    const { nodeId } = contextMenu
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    // 创建新模块
    const newModule: ModuleConfig = {
      id: `${moduleName.toLowerCase()}-${Date.now()}`,
      name: moduleName,
      type: 'feature',
      layer: 'application',
      version: '1.0.0',
      dependencies: [],
      exports: [],
      nodes: [nodeId],
      metadata: {
        createdAt: new Date().toISOString(),
      },
    }

    const updatedModules = [...modules, newModule]
    setModules(updatedModules)
    localStorage.setItem('meta-arch-modules', JSON.stringify(updatedModules))

    // 绑定节点
    moduleNodeIntegration.bindNodeToModule(nodeId, newModule.id, 'primary')

    setErrorMessage(`✅ 已创建模块 "${moduleName}" 并绑定节点`)
    setTimeout(() => setErrorMessage(null), 2000)
    setContextMenu(null)
  }

  // 一键排版功能（带验证）
  const handleAutoLayout = () => {
    if (nodes.length === 0) {
      setErrorMessage('⚠️ 画布中没有节点，无法排版')
      setTimeout(() => setErrorMessage(null), 2000)
      return
    }

    console.log('🔍 排版前节点数量:', nodes.length)
    console.log('🔍 排版前节点 IDs:', nodes.map(n => n.id))

    // 获取最优布局配置
    const optimalConfig = getOptimalLayoutConfig(nodes as CustomNode[])
    
    // 应用自动布局（合并自定义配置）
    const { nodes: laidOutNodes, edges: laidOutEdges, stats } = autoLayout(
      nodes as CustomNode[],
      edges,
      { ...optimalConfig, ...layoutConfig }
    )

    console.log('🔍 排版后节点数量:', laidOutNodes.length)
    console.log('🔍 排版后节点 IDs:', laidOutNodes.map(n => n.id))

    // 验证布局结果
    const validation = validateLayout(nodes as CustomNode[], laidOutNodes as CustomNode[])
    
    if (!validation.valid) {
      setErrorMessage(`❌ ${validation.message}`)
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }

    // 更新节点位置
    setNodes(laidOutNodes as CustomNode[])
    setEdges(laidOutEdges)
    
    // 显示排版统计信息
    const statsMessage = `✅ 排版完成！共 ${stats.totalNodes} 个节点，${stats.totalEdges} 条连接，分布在 ${stats.layers} 个层级`
    setErrorMessage(statsMessage)
    setTimeout(() => setErrorMessage(null), 3000)
    
    console.log('📊 排版统计:', stats)
    console.log('✅ 验证结果:', validation)
  }

  // 应用布局配置
  const handleApplyLayoutConfig = (config: Partial<LayoutConfig>) => {
    setLayoutConfig(config)
    handleAutoLayout()
  }

  const handleExport = () => {
    if (!validateArchitecture(nodes as CustomNode[], edges)) {
      alert('架构不合适，请检查节点连接关系是否符合规范')
      return
    }

    exportProject(nodes as CustomNode[], edges)
  }

  const handleDesignCheck = async () => {
    if (nodes.length === 0) {
      setErrorMessage('⚠️ 画布中没有节点，无法进行检查')
      setTimeout(() => setErrorMessage(null), 2000)
      return
    }

    setIsChecking(true)
    setShowDesignCheck(true)

    try {
      const report = await runDesignCheck(nodes as CustomNode[], edges)
      setCheckReport(report)
      console.log('📊 设计检查报告:', report)
    } catch (error) {
      console.error('设计检查失败:', error)
      setErrorMessage('❌ 设计检查失败，请重试')
      setTimeout(() => setErrorMessage(null), 3000)
      setShowDesignCheck(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleLoadTemplate = (newNodes: NodeType[], newEdges: EdgeType[], newModules?: ModuleConfig[]) => {
    setNodes(newNodes as CustomNode[])
    setEdges(newEdges)
    if (newModules && newModules.length > 0) {
      setModules(newModules)
    }
    setShowTemplateManager(false)
  }

  // 使用 useMemo 缓存 nodeTypes 对象，避免每次渲染都重新创建
  const nodeTypes = useMemo(() => ({
    agent: AgentNode,
    persona: PersonaNode,
  }), [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <TopBar 
        onAddNode={addNode} 
        onExport={handleExport} 
        onAutoLayout={handleAutoLayout}
        onLayoutConfig={() => setShowLayoutConfig(true)}
        onDesignCheck={handleDesignCheck}
        onTemplateManager={() => setShowTemplateManager(true)}
        onModuleManager={() => setShowModuleManager(true)}
      />

      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            background: errorMessage.includes('已保存') || errorMessage.includes('已删除') || errorMessage.includes('排版完成') || errorMessage.includes('验证通过')
              ? '#d4edda'
              : errorMessage.includes('没有节点')
              ? '#fff3cd'
              : '#ffebee',
            color: errorMessage.includes('已保存') || errorMessage.includes('已删除') || errorMessage.includes('排版完成') || errorMessage.includes('验证通过')
              ? '#155724'
              : errorMessage.includes('没有节点')
              ? '#856404'
              : '#c62828',
            padding: '12px 24px',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10,
            maxWidth: '80%',
            textAlign: 'center' as const,
          }}
        >
          {errorMessage}
        </div>
      )}

      <Canvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={(event, node) => {
          event.preventDefault()
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
            nodeId: node.id,
          })
        }}
        onNodeDragStart={(event, node) => {
          // 设置拖拽数据
          event.dataTransfer.setData('nodeId', node.id)
          event.dataTransfer.setData('nodeLabel', node.data.label)
        }}
        moduleGroups={moduleNodeIntegration.getAllModuleGroups(modules, nodes)}
        selectedModuleId={selectedModuleId || undefined}
        onModuleDoubleClick={setSelectedModuleId}
      />

      {/* 右键菜单 */}
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          nodeName={nodes.find(n => n.id === contextMenu.nodeId)?.data.label || ''}
          modules={modules}
          currentModuleId={moduleNodeIntegration.getNodeOwnership(contextMenu.nodeId)?.primaryModule}
          onClose={() => setContextMenu(null)}
          onBindToModule={handleBindNodeToModule}
          onCreateNewModule={handleCreateModuleAndBind}
        />
      )}

      {/* 右侧面板 - 单实例管理 */}
      {selectedNode && !showLayoutConfig && !showDesignCheck && !showTemplateManager && !showModuleManager && (
        <ConfigPanel
          node={selectedNode}
          onUpdate={handleUpdateNode}
          onClose={() => setSelectedNode(null)}
          onDelete={handleDeleteNode}
        />
      )}

      {showLayoutConfig && (
        <LayoutConfigPanel
          config={layoutConfig}
          onApply={handleApplyLayoutConfig}
          onClose={() => {
            setShowLayoutConfig(false)
            setSelectedNode(null)
          }}
        />
      )}

      {showDesignCheck && checkReport && (
        <DesignCheckReportPanel
          report={checkReport}
          onClose={() => {
            setShowDesignCheck(false)
            setCheckReport(null)
            setSelectedNode(null)
          }}
        />
      )}

      {isChecking && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: 30,
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 15 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 10 }}>
            正在进行设计检查...
          </div>
          <div style={{ fontSize: 13, color: '#666' }}>
            正在分析架构设计、数据完整性、连接关系等
          </div>
        </div>
      )}

      {showTemplateManager && (
        <TemplateManagerPanel
          nodes={nodes as NodeType[]}
          edges={edges}
          onLoadTemplate={handleLoadTemplate}
          onClose={() => {
            setShowTemplateManager(false)
            setSelectedNode(null)
          }}
        />
      )}

      {showModuleManager && (
        <ModuleManagerPanel
          modules={modules}
          setModules={setModules}
          nodes={nodes}
          onModuleSelect={setSelectedModuleId}
          onClose={() => {
            setShowModuleManager(false)
            setSelectedNode(null)
          }}
        />
      )}
    </div>
  )
}
