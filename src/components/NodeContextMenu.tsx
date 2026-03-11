/**
 * 节点右键菜单组件
 * 提供节点绑定到模块的功能
 */

import { useState, useEffect } from 'react'
import type { ModuleConfig } from '../modules/moduleSystem'

interface NodeContextMenuProps {
  x: number
  y: number
  nodeId: string
  nodeName: string
  modules: ModuleConfig[]
  currentModuleId?: string
  onClose: () => void
  onBindToModule: (nodeId: string, moduleId: string) => void
  onCreateNewModule: (moduleName: string) => void
}

export default function NodeContextMenu({
  x,
  y,
  nodeId,
  nodeName,
  modules,
  currentModuleId,
  onClose,
  onBindToModule,
  onCreateNewModule,
}: NodeContextMenuProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newModuleName, setNewModuleName] = useState('')

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = () => onClose()
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  // 获取当前绑定的模块
  const currentModule = modules.find(m => m.id === currentModuleId)

  const handleBind = (moduleId: string) => {
    onBindToModule(nodeId, moduleId)
    onClose()
  }

  const handleCreateModule = () => {
    if (newModuleName.trim()) {
      onCreateNewModule(newModuleName.trim())
      onClose()
    }
  }

  // 菜单位置调整（确保不超出屏幕）
  const menuX = Math.min(x, window.innerWidth - 320)
  const menuY = Math.min(y, window.innerHeight - 400)

  return (
    <div
      style={{
        position: 'fixed',
        left: menuX,
        top: menuY,
        zIndex: 1000,
        minWidth: 300,
        maxHeight: 400,
        overflowY: 'auto',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        border: '1px solid #e5e7eb',
        padding: 8,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 菜单头部 */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
          节点操作
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
          {nodeName}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
          ID: {nodeId}
        </div>
      </div>

      {!showCreateForm ? (
        <>
          {/* 当前绑定状态 */}
          {currentModule && (
            <div
              style={{
                padding: '8px 12px',
                background: '#f3f4f6',
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                当前绑定模块
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getModuleColor(currentModule.type),
                    }}
                  />
                  {currentModule.name}
                </div>
                <button
                  onClick={() => handleBind('')}
                  style={{
                    padding: '2px 8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  解除绑定
                </button>
              </div>
            </div>
          )}

          {/* 模块列表 */}
          <div
            style={{
              padding: '8px 12px',
              fontSize: 12,
              color: '#6b7280',
              marginBottom: 4,
            }}
          >
            绑定到模块
          </div>

          {modules.length === 0 ? (
            <div
              style={{
                padding: 12,
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: 12,
              }}
            >
              暂无模块，请创建新模块
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {modules.map(module => (
                <button
                  key={module.id}
                  onClick={() => handleBind(module.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: currentModuleId === module.id ? '#f3f4f6' : 'white',
                    border: `1px solid ${currentModuleId === module.id ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#3b82f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentModuleId === module.id ? '#f3f4f6' : 'white'
                    e.currentTarget.style.borderColor = currentModuleId === module.id ? '#3b82f6' : '#e5e7eb'
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: getModuleColor(module.type),
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                      {module.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {module.type} · {module.layer}
                    </div>
                  </div>
                  {currentModuleId === module.id && (
                    <span style={{ color: '#3b82f6', fontSize: 16 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 创建新模块 */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              ➕ 创建新模块并绑定
            </button>
          </div>
        </>
      ) : (
        /* 创建新模块表单 */
        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
            创建新模块
          </div>

          <input
            type="text"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
            placeholder="输入模块名称"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateModule()
              if (e.key === 'Escape') setShowCreateForm(false)
            }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCreateModule}
              disabled={!newModuleName.trim()}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: newModuleName.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: newModuleName.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              创建并绑定
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              style={{
                padding: '8px 12px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 快捷键提示 */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #e5e7eb',
          fontSize: 10,
          color: '#9ca3af',
          textAlign: 'center',
        }}
      >
        ESC 关闭菜单 · ENTER 确认
      </div>
    </div>
  )
}

// 获取模块颜色
function getModuleColor(type: string): string {
  const colors: Record<string, string> = {
    'core': '#3b82f6',
    'feature': '#10b981',
    'shared': '#f59e0b',
    'infrastructure': '#6b7280',
    'api': '#ef4444',
    'ui': '#8b5cf6',
    'domain': '#ec4899',
    'application': '#06b6d4',
  }
  return colors[type] || '#6b7280'
}
