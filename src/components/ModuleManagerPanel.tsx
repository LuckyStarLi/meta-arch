import { useState, useEffect } from 'react'
import { 
  createModuleConfig, 
  validateModuleConfig,
  type ModuleConfig,
  type ModuleType,
  type ModuleLayer
} from '../modules/moduleSystem'
import { generateDependencyReport } from '../modules/dependencyManager'
import { moduleNodeIntegration } from '../modules/moduleNodeIntegration'
import type { CustomNode } from '../types'

interface Props {
  onClose: () => void
  modules: ModuleConfig[]
  setModules: (modules: ModuleConfig[]) => void
  nodes: CustomNode[]
  onModuleSelect?: (moduleId: string) => void
}

export default function ModuleManagerPanel({ 
  onClose, 
  modules, 
  setModules,
  nodes,
  onModuleSelect 
}: Props) {
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newModule, setNewModule] = useState<{
    name: string
    type: ModuleType
    layer: ModuleLayer
    description: string
  }>({
    name: '',
    type: 'core',
    layer: 'application',
    description: '',
  })
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors: string[]
  } | null>(null)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null)

  const handleCreateModule = () => {
    const module = createModuleConfig(
      newModule.name,
      newModule.type,
      newModule.layer,
      {
        description: newModule.description,
      }
    )
    
    const validation = validateModuleConfig(module)
    setValidationResult(validation)
    
    if (validation.isValid) {
      const updatedModules = [...modules, module]
      setModules(updatedModules)
      // 保存到 LocalStorage
      localStorage.setItem('meta-arch-modules', JSON.stringify(updatedModules))
      setShowCreateForm(false)
      setNewModule({ name: '', type: 'core', layer: 'application', description: '' })
      setValidationResult(null)
    }
  }

  const handleDeleteModule = (moduleId: string) => {
    const updatedModules = modules.filter(m => m.id !== moduleId)
    setModules(updatedModules)
    // 保存到 LocalStorage
    localStorage.setItem('meta-arch-modules', JSON.stringify(updatedModules))
    if (selectedModule?.id === moduleId) {
      setSelectedModule(null)
    }
  }

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedNodeId(nodeId)
    e.dataTransfer.setData('nodeId', nodeId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, moduleId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverModuleId(moduleId)
  }

  const handleDragLeave = () => {
    setDragOverModuleId(null)
  }

  const handleDrop = (e: React.DragEvent, moduleId: string) => {
    e.preventDefault()
    setDragOverModuleId(null)
    
    const nodeId = e.dataTransfer.getData('nodeId') || draggedNodeId
    if (!nodeId) return

    // 使用集成管理器绑定节点到模块
    import('../modules/moduleNodeIntegration').then(({ moduleNodeIntegration }) => {
      moduleNodeIntegration.bindNodeToModule(nodeId, moduleId, 'primary')
      
      // 显示提示
      const node = nodes.find(n => n.id === nodeId)
      const module = modules.find(m => m.id === moduleId)
      if (node && module) {
        alert(`✅ 已将 "${node.data.label}" 绑定到模块 "${module.name}"`)
      }
      
      // 通知父组件选中该模块
      if (onModuleSelect) {
        onModuleSelect(moduleId)
      }
    })
    
    setDraggedNodeId(null)
  }

  const moduleTypeLabels: Record<ModuleType, string> = {
    core: '核心模块',
    feature: '功能模块',
    shared: '共享模块',
    infrastructure: '基础设施',
    api: 'API 模块',
    ui: 'UI 模块',
    domain: '领域模块',
    application: '应用模块',
  }

  const moduleLayerLabels: Record<ModuleLayer, string> = {
    presentation: '展示层',
    application: '应用层',
    domain: '领域层',
    infrastructure: '基础设施层',
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 450,
        height: '100%',
        background: '#fff',
        padding: 20,
        boxShadow: '-2px 0 12px rgba(0,0,0,0.15)',
        zIndex: 200,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 头部 */}
      <div style={{ 
        marginBottom: 20, 
        borderBottom: '2px solid #007bff', 
        paddingBottom: 15,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>📦 模块管理</h3>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: 13 }}>
            管理架构中的模块和依赖关系
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '8px 12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ✖️ 关闭
        </button>
      </div>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            flex: 1,
            padding: '12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ➕ 创建新模块
        </button>
        {modules.length > 0 && (
          <button
            onClick={() => {
              if (confirm('确定要清空所有模块吗？此操作不可恢复！')) {
                setModules([])
                localStorage.removeItem('meta-arch-modules')
                setSelectedModule(null)
              }
            }}
            style={{
              padding: '12px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            🗑️ 清空所有
          </button>
        )}
      </div>

      {/* 创建模块表单 */}
      {showCreateForm && (
        <div style={{ 
          marginBottom: 20, 
          padding: 15, 
          background: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #e9ecef',
        }}>
          <h4 style={{ margin: '0 0 15px', fontSize: 14, color: '#333' }}>📝 创建模块</h4>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              模块名称
            </label>
            <input
              type="text"
              value={newModule.name}
              onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                boxSizing: 'border-box',
              }}
              placeholder="例如：UserModule"
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              模块类型
            </label>
            <select
              value={newModule.type}
              onChange={(e) => setNewModule({ ...newModule, type: e.target.value as ModuleType })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            >
              {Object.entries(moduleTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              架构层级
            </label>
            <select
              value={newModule.layer}
              onChange={(e) => setNewModule({ ...newModule, layer: e.target.value as ModuleLayer })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            >
              {Object.entries(moduleLayerLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              描述
            </label>
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                minHeight: 80,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
              placeholder="模块的功能描述..."
            />
          </div>

          {validationResult && (
            <div style={{ 
              marginBottom: 15,
              padding: 12,
              borderRadius: 6,
              background: validationResult.isValid ? '#d4edda' : '#f8d7da',
              border: `1px solid ${validationResult.isValid ? '#c3e6cb' : '#f5c6cb'}`,
              color: validationResult.isValid ? '#155724' : '#721c24',
            }}>
              <strong>{validationResult.isValid ? '✅ 验证通过' : '❌ 验证失败'}</strong>
              {!validationResult.isValid && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12 }}>
                  {validationResult.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCreateModule}
              style={{
                flex: 1,
                padding: '10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              ✅ 创建
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setValidationResult(null)
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              ✖️ 取消
            </button>
          </div>
        </div>
      )}

      {/* 模块列表 */}
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 15px', fontSize: 14, color: '#333' }}>
          📋 模块列表 ({modules.length})
        </h4>

        {modules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <p style={{ margin: 0, fontSize: 14 }}>暂无模块</p>
            <p style={{ margin: '8px 0 0', fontSize: 12 }}>点击"创建新模块"开始</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modules.map((module) => (
              <div
                key={module.id}
                onClick={() => setSelectedModule(module)}
                onDragOver={(e) => handleDragOver(e, module.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, module.id)}
                style={{
                  position: 'relative',
                  padding: '12px 15px',
                  background: dragOverModuleId === module.id 
                    ? '#d4edda' 
                    : selectedModule?.id === module.id 
                      ? '#e7f3ff' 
                      : '#f8f9fa',
                  borderRadius: 6,
                  cursor: 'pointer',
                  border: dragOverModuleId === module.id 
                    ? '2px dashed #28a745' 
                    : selectedModule?.id === module.id 
                      ? '2px solid #007bff' 
                      : '1px solid #e9ecef',
                  transition: 'all 0.2s',
                  opacity: draggedNodeId && dragOverModuleId !== module.id ? 0.6 : 1,
                  overflow: 'visible',
                }}
              >
                {/* 拖拽提示 */}
                {dragOverModuleId === module.id && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#28a745',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}>
                    📥 释放以绑定到此模块
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h5 style={{ margin: 0, fontSize: 14, color: '#333' }}>{module.name}</h5>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteModule(module.id)
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    🗑️ 删除
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, marginBottom: 6 }}>
                  <span style={{ 
                    padding: '2px 6px', 
                    background: '#007bff', 
                    color: 'white', 
                    borderRadius: 3 
                  }}>
                    {moduleTypeLabels[module.type]}
                  </span>
                  <span style={{ 
                    padding: '2px 6px', 
                    background: '#6c757d', 
                    color: 'white', 
                    borderRadius: 3 
                  }}>
                    {moduleLayerLabels[module.layer]}
                  </span>
                </div>
                {module.description && (
                  <p style={{ margin: 0, fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                    {module.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 模块信息面板 */}
      {selectedModule && (
        <div style={{ 
          marginTop: 20, 
          paddingTop: 20, 
          borderTop: '2px solid #007bff',
          background: '#f8f9fa',
          padding: 15,
          borderRadius: 8,
        }}>
          <h4 style={{ margin: '0 0 15px', fontSize: 14, color: '#333' }}>📊 模块详情</h4>
          
          <div style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: 12, color: '#666' }}>ID:</strong>
            <p style={{ margin: '4px 0', fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {selectedModule.id}
            </p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: 12, color: '#666' }}>版本:</strong>
            <p style={{ margin: '4px 0', fontSize: 12 }}>{selectedModule.version}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: 12, color: '#666' }}>依赖:</strong>
            <p style={{ margin: '4px 0', fontSize: 12 }}>
              {selectedModule.dependencies.length === 0 ? '无' : `${selectedModule.dependencies.length} 个`}
            </p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: 12, color: '#666' }}>导出:</strong>
            <p style={{ margin: '4px 0', fontSize: 12 }}>
              {selectedModule.exports.length === 0 ? '无' : `${selectedModule.exports.length} 个`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
            <button
              onClick={() => {
                const report = generateDependencyReport([selectedModule])
                console.log(report)
                alert('依赖报告已生成，请查看控制台')
              }}
              style={{
                flex: 1,
                padding: '8px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              📄 查看依赖报告
            </button>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(selectedModule, null, 2)
                const dataBlob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(dataBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${selectedModule.name}.json`
                link.click()
                URL.revokeObjectURL(url)
              }}
              style={{
                flex: 1,
                padding: '8px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              📥 导出模块
            </button>
            <button
              onClick={() => setSelectedModule(null)}
              style={{
                flex: 1,
                padding: '8px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              ✖️ 关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
