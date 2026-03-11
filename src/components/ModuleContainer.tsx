import type { ModuleConfig } from '../modules/moduleSystem'
import { getModuleStyle } from '../modules/moduleSystem'

interface Props {
  module: ModuleConfig
  children: React.ReactNode
  onCollapse?: () => void
}

export default function ModuleContainer({ module, children, onCollapse }: Props) {
  const style = getModuleStyle(module.type)
  
  return (
    <div
      style={{
        position: 'absolute',
        left: module.position?.x || 0,
        top: module.position?.y || 0,
        width: module.size?.width || 500,
        minHeight: module.isCollapsed ? 'auto' : (module.size?.height || 350),
        border: `2px solid ${style.border}`,
        borderRadius: 8,
        background: style.background,
        zIndex: 0,
      }}
    >
      {/* 模块标题栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: style.header,
          color: 'white',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          cursor: 'move',
        }}
        onDoubleClick={onCollapse}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📦</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{module.name}</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>
              {module.type} • {module.layer}
              {module.nodeIds && module.nodeIds.length > 0 && (
                <span> • {module.nodeIds.length} 个节点</span>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={onCollapse}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
            title={module.isCollapsed ? '展开' : '折叠'}
          >
            {module.isCollapsed ? '➕' : '➖'}
          </button>
        </div>
      </div>
      
      {/* 模块内容区域 */}
      {!module.isCollapsed && (
        <div
          style={{
            padding: 12,
            height: 'calc(100% - 60px)',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {children}
          
          {/* 空状态提示 */}
          {(!module.nodeIds || module.nodeIds.length === 0) && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#999',
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📥</div>
              <div>将节点拖入此模块</div>
              <div style={{ fontSize: 11, marginTop: 4, color: '#ccc' }}>
                或从模块管理面板添加
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
