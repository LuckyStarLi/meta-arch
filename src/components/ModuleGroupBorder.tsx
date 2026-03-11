/**
 * 模块分组边框组件
 * 在画布中显示模块的可视化边界
 */

import { memo } from 'react'
import type { ModuleNodeGroup } from '../types'

interface ModuleGroupBorderProps {
  group: ModuleNodeGroup
  isSelected?: boolean
  onDoubleClick?: () => void
}

function ModuleGroupBorder({ group, isSelected, onDoubleClick }: ModuleGroupBorderProps) {
  // 检查 position 是否存在且有效
  if (!group.position) {
    return null
  }

  const { x, y, width, height } = group.position

  // 检查位置值是否为有效数字（不是 Infinity 或 NaN）
  if (
    !isFinite(x) || 
    !isFinite(y) || 
    !isFinite(width) || 
    !isFinite(height) ||
    width <= 0 || 
    height <= 0
  ) {
    console.warn('⚠️ ModuleGroupBorder: 无效的位置值', { 
      moduleId: group.moduleId,
      moduleName: group.moduleName,
      position: group.position,
      nodes: group.nodes 
    })
    return null
  }

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <g
        onDoubleClick={onDoubleClick}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      >
        {/* 模块分组边框 */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={12}
          ry={12}
          fill={`${group.color}10`}  // 10% 透明度的填充
          stroke={group.color}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={isSelected ? 'none' : '5,5'}
          className="module-group-border"
        />

        {/* 模块标签 */}
        <foreignObject
          x={x + 15}
          y={y + 10}
          width={200}
          height={40}
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              color: group.color,
              background: 'white',
              padding: '4px 8px',
              borderRadius: 4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              width: 'fit-content',
            }}
          >
            {/* 模块类型图标 */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: group.color,
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {getModuleTypeIcon(group.moduleType)}
            </span>

            {/* 模块名称 */}
            <span>{group.moduleName}</span>

            {/* 节点数量 */}
            <span
              style={{
                marginLeft: 8,
                padding: '2px 6px',
                background: `${group.color}20`,
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {group.nodes.length} 节点
            </span>

            {/* 层级标识 */}
            <span
              style={{
                padding: '2px 6px',
                background: '#6b728020',
                borderRadius: 4,
                fontSize: 9,
                color: '#6b7280',
                textTransform: 'uppercase',
              }}
            >
              {getLayerAbbr(group.moduleLayer)}
            </span>
          </div>
        </foreignObject>

        {/* 选中时的角标 */}
        {isSelected && (
          <>
            {/* 左上角装饰 */}
            <path
              d={`M ${x + 20} ${y} L ${x} ${y} L ${x} ${y + 20}`}
              stroke={group.color}
              strokeWidth={3}
              fill="none"
            />
            {/* 右下角装饰 */}
            <path
              d={`M ${x + width - 20} ${y + height} L ${x + width} ${y + height} L ${x + width} ${y + height - 20}`}
              stroke={group.color}
              strokeWidth={3}
              fill="none"
            />
          </>
        )}
      </g>
    </svg>
  )
}

// 获取模块类型图标
function getModuleTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'core': 'C',
    'feature': 'F',
    'shared': 'S',
    'infrastructure': 'I',
    'api': 'A',
    'ui': 'U',
    'domain': 'D',
    'application': 'A',
  }
  return icons[type] || 'M'
}

// 获取层级缩写
function getLayerAbbr(layer: string): string {
  const abbrs: Record<string, string> = {
    'presentation': 'PRES',
    'application': 'APP',
    'domain': 'DOM',
    'infrastructure': 'INFRA',
  }
  return abbrs[layer] || layer.substring(0, 3).toUpperCase()
}

export default memo(ModuleGroupBorder)
