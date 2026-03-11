import { useState, useEffect } from 'react'
import { templateManager, type ArchitectureTemplate } from '../templateManager'
import type { CustomNode } from '../types'
import type { Edge } from 'reactflow'

interface Props {
  nodes: CustomNode[]
  edges: Edge[]
  onLoadTemplate: (nodes: CustomNode[], edges: Edge[]) => void
  onClose: () => void
}

export default function TemplateManagerPanel({ nodes, edges, onLoadTemplate, onClose }: Props) {
  const [templates, setTemplates] = useState<ArchitectureTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [importing, setImporting] = useState(false)
  
  // 保存表单状态
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateCategory, setTemplateCategory] = useState<ArchitectureTemplate['metadata']['category']>('other')
  const [templateTags, setTemplateTags] = useState('')

  // 加载模板列表
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const list = await templateManager.listTemplates()
      setTemplates(list)
    } catch (error) {
      console.error('加载模板失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 保存当前架构为模板
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('请输入模板名称')
      return
    }

    try {
      const { saveAsTemplate } = await import('../templateManager')
      await saveAsTemplate(
        templateName,
        templateDescription,
        nodes,
        edges,
        templateTags.split(',').map(t => t.trim()).filter(Boolean),
        templateCategory
      )
      
      // 清空表单
      setTemplateName('')
      setTemplateDescription('')
      setTemplateCategory('other')
      setTemplateTags('')
      setShowSaveDialog(false)
      
      // 重新加载列表
      await loadTemplates()
    } catch (error) {
      console.error('保存模板失败:', error)
      alert('保存失败，请重试')
    }
  }

  // 加载模板
  const handleLoadTemplate = async (templateId: string) => {
    try {
      const content = await import('../templateManager').then(m => m.loadTemplateToCanvas(templateId))
      if (content) {
        onLoadTemplate(content.nodes, content.edges)
        onClose()
      }
    } catch (error) {
      console.error('加载模板失败:', error)
      alert('加载失败，请重试')
    }
  }

  // 删除模板
  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`确定要删除模板 "${templateName}" 吗？`)) return

    try {
      await templateManager.deleteTemplate(templateId)
      await loadTemplates()
    } catch (error) {
      console.error('删除模板失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 导出模板
  const handleExportTemplate = async (templateId: string, templateName: string) => {
    try {
      const blob = await templateManager.exportTemplate(templateId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${templateName}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出模板失败:', error)
      alert('导出失败，请重试')
    }
  }

  // 导入模板
  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      await templateManager.importTemplate(file)
      await loadTemplates()
    } catch (error) {
      console.error('导入模板失败:', error)
      alert('导入失败：文件格式不正确')
    } finally {
      setImporting(false)
      // 清空 input
      event.target.value = ''
    }
  }

  // 自动保存当前项目
  const handleAutoSave = async () => {
    try {
      await templateManager.saveCurrentProject(nodes, edges)
      alert('✅ 当前项目已保存')
    } catch (error) {
      console.error('自动保存失败:', error)
      alert('保存失败，请重试')
    }
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
        padding: 0,
        boxShadow: '-2px 0 12px rgba(0,0,0,0.15)',
        zIndex: 200,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 头部 */}
      <div
        style={{
          padding: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>📁 模板管理</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ✕ 关闭
          </button>
        </div>
        
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          管理和保存您的系统架构模板
        </div>
      </div>

      {/* 快捷操作 */}
      <div style={{ padding: 20, borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{
              flex: 1,
              padding: '10px 15px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            💾 保存为模板
          </button>
          <button
            onClick={handleAutoSave}
            style={{
              flex: 1,
              padding: '10px 15px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            💿 保存当前项目
          </button>
        </div>
        
        <div style={{ position: 'relative' }}>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
            disabled={importing}
          />
          <div
            style={{
              padding: '10px 15px',
              background: '#f5f5f5',
              borderRadius: 6,
              textAlign: 'center',
              color: importing ? '#999' : '#666',
              fontSize: 13,
              cursor: importing ? 'not-allowed' : 'pointer',
            }}
          >
            {importing ? '⏳ 导入中...' : '📥 导入模板（点击选择 JSON 文件）'}
          </div>
        </div>
      </div>

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div
          style={{
            padding: 20,
            background: '#fff',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <h3 style={{ margin: '0 0 15px', fontSize: 16, color: '#333' }}>💾 保存为新模板</h3>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, color: '#555' }}>
              模板名称 *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="例如：电商系统架构"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, color: '#555' }}>
              描述
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="描述这个模板的用途和特点..."
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
            />
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, color: '#555' }}>
              分类
            </label>
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value as ArchitectureTemplate['metadata']['category'])}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              <option value="other">其他</option>
              <option value="ecommerce">电商系统</option>
              <option value="cms">内容管理</option>
              <option value="saas">SaaS 应用</option>
              <option value="api">API 服务</option>
            </select>
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, color: '#555' }}>
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              value={templateTags}
              onChange={(e) => setTemplateTags(e.target.value)}
              placeholder="例如：微服务，MySQL, Redis"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSaveTemplate}
              style={{
                flex: 1,
                padding: '10px 15px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              保存
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              style={{
                flex: 1,
                padding: '10px 15px',
                background: '#9e9e9e',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 模板列表 */}
      <div style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 15px', fontSize: 16, color: '#333' }}>
          📋 我的模板 ({templates.length})
        </h3>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            ⏳ 加载中...
          </div>
        )}
        
        {!loading && templates.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: '#999',
              background: '#f5f5f5',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>📁</div>
            <div style={{ fontSize: 14 }}>暂无模板</div>
            <div style={{ fontSize: 12, marginTop: 5 }}>点击"保存为模板"创建第一个模板</div>
          </div>
        )}
        
        {!loading && templates.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {templates.map((template) => (
              <TemplateCard
                key={template.metadata.id}
                template={template}
                onLoad={() => handleLoadTemplate(template.metadata.id)}
                onDelete={() => handleDeleteTemplate(template.metadata.id, template.metadata.name)}
                onExport={() => handleExportTemplate(template.metadata.id, template.metadata.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 模板卡片组件
function TemplateCard({
  template,
  onLoad,
  onDelete,
  onExport,
}: {
  template: ArchitectureTemplate
  onLoad: () => void
  onDelete: () => void
  onExport: () => void
}) {
  const { metadata } = template
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ecommerce: '🛒 电商系统',
      cms: '📝 内容管理',
      saas: '💼 SaaS 应用',
      api: '🔌 API 服务',
      other: '📄 其他',
    }
    return labels[category] || '📄 其他'
  }

  return (
    <div
      style={{
        padding: 15,
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
        e.currentTarget.style.borderColor = '#667eea'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#e0e0e0'
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h4 style={{ margin: 0, fontSize: 15, color: '#333' }}>{metadata.name}</h4>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              background: '#e3f2fd',
              color: '#1976d2',
              borderRadius: 4,
            }}
          >
            v{metadata.version}
          </span>
        </div>
        
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          {metadata.description || '暂无描述'}
        </div>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span
            style={{
              fontSize: 11,
              padding: '2px 6px',
              background: '#f5f5f5',
              color: '#666',
              borderRadius: 4,
            }}
          >
            {getCategoryLabel(metadata.category)}
          </span>
          {metadata.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                fontSize: 11,
                padding: '2px 6px',
                background: '#e8f5e9',
                color: '#388e3c',
                borderRadius: 4,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <div style={{ fontSize: 11, color: '#999' }}>
          更新于：{metadata.updatedAt.toLocaleString('zh-CN')}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onLoad}
          style={{
            flex: 1,
            padding: '6px 12px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          加载
        </button>
        <button
          onClick={onExport}
          style={{
            padding: '6px 12px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          导出
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '6px 12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          删除
        </button>
      </div>
    </div>
  )
}
