import { useState } from 'react'
import type { LayoutConfig } from '../autoLayout'

interface Props {
  config: Partial<LayoutConfig>
  onApply: (config: Partial<LayoutConfig>) => void
  onClose: () => void
}

export default function LayoutConfigPanel({ config, onApply, onClose }: Props) {
  const [localConfig, setLocalConfig] = useState<Partial<LayoutConfig>>(config)

  const updateConfig = <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => {
    setLocalConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleApply = () => {
    onApply(localConfig)
    onClose()
  }

  const handleReset = () => {
    setLocalConfig({})
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 320,
        height: '100%',
        background: '#fff',
        padding: 20,
        boxShadow: '-2px 0 12px rgba(0,0,0,0.15)',
        zIndex: 200,
        overflowY: 'auto',
      }}
    >
      <div style={{ marginBottom: 20, borderBottom: '2px solid #28a745', paddingBottom: 15 }}>
        <h3 style={{ margin: 0, color: '#333' }}>🎨 排版规则配置</h3>
        <p style={{ margin: '5px 0 0', color: '#666', fontSize: 13 }}>
          自定义自动布局的排版规则
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>布局方向</label>
        <select
          value={localConfig.direction || 'horizontal'}
          onChange={(e) => updateConfig('direction', e.target.value as 'horizontal' | 'vertical')}
          style={inputStyle}
        >
          <option value="horizontal">➡️ 水平布局（从左到右）</option>
          <option value="vertical">⬇️ 垂直布局（从上到下）</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>对齐方式</label>
        <select
          value={localConfig.align || 'center'}
          onChange={(e) => updateConfig('align', e.target.value as 'left' | 'center' | 'right')}
          style={inputStyle}
        >
          <option value="center">⬌ 居中对齐</option>
          <option value="left">⬅️ 左对齐</option>
          <option value="right">➡️ 右对齐</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          节点宽度：{localConfig.nodeWidth || 200}px
        </label>
        <input
          type="range"
          min="150"
          max="300"
          value={localConfig.nodeWidth || 200}
          onChange={(e) => updateConfig('nodeWidth', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          节点高度：{localConfig.nodeHeight || 100}px
        </label>
        <input
          type="range"
          min="80"
          max="150"
          value={localConfig.nodeHeight || 100}
          onChange={(e) => updateConfig('nodeHeight', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          层级间距：{localConfig.layerSpacing || 250}px
        </label>
        <input
          type="range"
          min="150"
          max="400"
          value={localConfig.layerSpacing || 250}
          onChange={(e) => updateConfig('layerSpacing', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          水平间距：{localConfig.horizontalSpacing || 50}px
        </label>
        <input
          type="range"
          min="20"
          max="100"
          value={localConfig.horizontalSpacing || 50}
          onChange={(e) => updateConfig('horizontalSpacing', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          垂直间距：{localConfig.verticalSpacing || 30}px
        </label>
        <input
          type="range"
          min="10"
          max="80"
          value={localConfig.verticalSpacing || 30}
          onChange={(e) => updateConfig('verticalSpacing', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ padding: '15px', background: '#f0f7ff', borderRadius: 6, marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 14, color: '#007bff' }}>📋 当前配置预览</h4>
        <div style={{ fontSize: 12, color: '#666' }}>
          <p style={{ margin: '5px 0' }}>
            方向：<strong>{localConfig.direction === 'vertical' ? '垂直' : '水平'}</strong>
          </p>
          <p style={{ margin: '5px 0' }}>
            对齐：<strong>
              {localConfig.align === 'center' ? '居中' : localConfig.align === 'left' ? '左侧' : '右侧'}
            </strong>
          </p>
          <p style={{ margin: '5px 0' }}>
            节点尺寸：<strong>{localConfig.nodeWidth || 200} × {localConfig.nodeHeight || 100}</strong>
          </p>
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={handleApply}
          style={{
            padding: 12,
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ✔️ 应用配置并排版
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: 12,
            background: '#ffc107',
            color: '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          🔄 重置为默认
        </button>
        <button
          onClick={onClose}
          style={{
            padding: 12,
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ✖️ 关闭
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 500,
  color: '#555',
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: 4,
  fontSize: 13,
  boxSizing: 'border-box' as const,
}
