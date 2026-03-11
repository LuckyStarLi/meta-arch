import { useState, useEffect } from 'react'
import type { CustomNode, NodeKind } from '../types'
import type { NodeConfig, FrontendConfig, ApiConfig, ServiceConfig, RepositoryConfig, DatabaseConfig, AgentConfig, PersonaConfig } from '../types'
import { validateNodeNaming } from '../validators/namingValidator'

interface Props {
  node: CustomNode
  onUpdate: (nodeId: string, config: NodeConfig) => void
  onClose: () => void
  onDelete: (nodeId: string) => void
}

export default function ConfigPanel({ node, onUpdate, onClose, onDelete }: Props) {
  const { label, type, config } = node.data
  const [editedLabel, setEditedLabel] = useState(label)
  const [editedConfig, setEditedConfig] = useState<NodeConfig>(config)
  const [activeTab, setActiveTab] = useState<'config' | 'naming'>('config')
  const [namingValidation, setNamingValidation] = useState<{
    isValid: boolean
    message: string
    suggestions: string[]
    rule?: { name: string; description: string }
  } | null>(null)

  // 使用 useEffect 同步节点变化（这是合理的用例，用于同步外部状态）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditedLabel(label)
    setEditedConfig(config)
  }, [node.id, label, config])

  const handleNamingValidation = () => {
    const result = validateNodeNaming(type, editedLabel)
    setNamingValidation(result)
  }

  const handleApplySuggestion = (suggestion: string) => {
    setEditedLabel(suggestion)
    const result = validateNodeNaming(type, suggestion)
    setNamingValidation(result)
  }

  const handleDelete = () => {
    if (confirm(`确定要删除节点 "${label}" 吗？`)) {
      onDelete(node.id)
      onClose()
    }
  }

  const updateConfig = <K extends keyof NodeConfig>(key: K, value: NodeConfig[K]) => {
    setEditedConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const getTypeLabel = (type: NodeKind): string => {
    const labels: Record<NodeKind, string> = {
      frontend: '前端应用',
      api: 'API 接口',
      service: '业务服务',
      repository: '数据仓库',
      database: '数据库',
      agent: 'AI Agent',
      persona: '数字角色',
    }
    return labels[type]
  }

  const renderConfigFields = () => {
    switch (type) {
      case 'frontend': {
        const frontendConfig = editedConfig as FrontendConfig
        return (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>应用名称</label>
              <input
                type="text"
                value={frontendConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>框架</label>
              <select
                value={frontendConfig.framework}
                onChange={(e) => updateConfig('framework', e.target.value)}
                style={inputStyle}
              >
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>端口</label>
              <input
                type="number"
                value={frontendConfig.port}
                onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                style={inputStyle}
              />
            </div>
          </>
        )
      }

      case 'api': {
        const apiConfig = editedConfig as ApiConfig
        return (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>API 名称</label>
              <input
                type="text"
                value={apiConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>路由路径</label>
              <input
                type="text"
                value={apiConfig.route}
                onChange={(e) => updateConfig('route', e.target.value)}
                style={inputStyle}
                placeholder="/api/example"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>请求方法</label>
              <select
                value={apiConfig.method}
                onChange={(e) => updateConfig('method', e.target.value)}
                style={inputStyle}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>请求模型</label>
              <input
                type="text"
                value={apiConfig.requestModel}
                onChange={(e) => updateConfig('requestModel', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>响应模型</label>
              <input
                type="text"
                value={apiConfig.responseModel}
                onChange={(e) => updateConfig('responseModel', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>需要认证</label>
              <input
                type="checkbox"
                checked={apiConfig.requiresAuth}
                onChange={(e) => updateConfig('requiresAuth', e.target.checked)}
                style={{ marginRight: 8 }}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>描述</label>
              <textarea
                value={apiConfig.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              />
            </div>
          </>
        )
      }

      case 'service': {
        const serviceConfig = editedConfig as ServiceConfig
        return (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>服务名称</label>
              <input
                type="text"
                value={serviceConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>函数名</label>
              <input
                type="text"
                value={serviceConfig.functionName}
                onChange={(e) => updateConfig('functionName', e.target.value)}
                style={inputStyle}
                placeholder="example_function"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>描述</label>
              <textarea
                value={serviceConfig.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              />
            </div>
          </>
        )
      }

      case 'repository': {
        const repoConfig = editedConfig as RepositoryConfig
        return (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>仓库名称</label>
              <input
                type="text"
                value={repoConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>实体名</label>
              <input
                type="text"
                value={repoConfig.entity}
                onChange={(e) => updateConfig('entity', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>支持的操作</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(['create', 'read', 'update', 'delete'] as const).map((op) => (
                  <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={repoConfig.operations?.includes(op)}
                      onChange={(e) => {
                        const ops = repoConfig.operations || []
                        const newOps = e.target.checked
                          ? [...ops, op]
                          : ops.filter((o: string) => o !== op)
                        updateConfig('operations', newOps)
                      }}
                    />
                    {op === 'create' && '创建'}
                    {op === 'read' && '读取'}
                    {op === 'update' && '更新'}
                    {op === 'delete' && '删除'}
                  </label>
                ))}
              </div>
            </div>
          </>
        )
      }

      case 'database': {
        const dbConfig = editedConfig as DatabaseConfig
        return (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>数据库名称</label>
              <input
                type="text"
                value={dbConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>数据库类型</label>
              <select
                value={dbConfig.type}
                onChange={(e) => updateConfig('type', e.target.value)}
                style={inputStyle}
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mongodb">MongoDB</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>主机地址</label>
              <input
                type="text"
                value={dbConfig.host}
                onChange={(e) => updateConfig('host', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>端口</label>
              <input
                type="number"
                value={dbConfig.port}
                onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                style={inputStyle}
              />
            </div>
          </>
        )
      }

      case 'agent': {
        const agentConfig = editedConfig as AgentConfig
        return (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Agent 名称</label>
              <input
                type="text"
                value={agentConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Agent 类型</label>
              <select
                value={agentConfig.agentType}
                onChange={(e) => updateConfig('agentType', e.target.value)}
                style={inputStyle}
              >
                <option value="rule">规则驱动</option>
                <option value="workflow">工作流</option>
                <option value="ml">机器学习</option>
                <option value="llm">大语言模型</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>功能描述</label>
              <textarea
                value={agentConfig.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              />
            </div>
            {agentConfig.agentType === 'llm' && (
              <>
                <div style={fieldStyle}>
                  <label style={labelStyle}>模型名称</label>
                  <input
                    type="text"
                    value={agentConfig.model}
                    onChange={(e) => updateConfig('model', e.target.value)}
                    style={inputStyle}
                    placeholder="例如：gpt-4, claude-3"
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>系统提示词</label>
                  <textarea
                    value={agentConfig.systemPrompt}
                    onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                    style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                    placeholder="定义 Agent 的行为和角色..."
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>温度参数</label>
                  <input
                    type="number"
                    value={agentConfig.temperature || 0.7}
                    onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                    style={inputStyle}
                    step="0.1"
                    min="0"
                    max="2"
                  />
                </div>
              </>
            )}
          </>
        )
      }

      case 'persona': {
        const personaConfig = editedConfig as PersonaConfig
        return (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>角色名称</label>
              <input
                type="text"
                value={personaConfig.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>角色描述</label>
              <textarea
                value={personaConfig.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>头像</label>
              <input
                type="text"
                value={personaConfig.avatar || '🤖'}
                onChange={(e) => updateConfig('avatar', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>人格特征（大五人格）</label>
              <div style={{ marginBottom: 8 }}>
                <input
                  value={personaConfig.personality?.traits?.openness || 0.5}
                  onChange={(e) => updateConfig('personality', {
                    ...personaConfig.personality,
                    traits: { ...personaConfig.personality?.traits, openness: parseFloat(e.target.value) || 0.5 }
                  })}
                  style={{ ...inputStyle, marginBottom: 4 }}
                  placeholder="开放性（0-1）"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                />
                <input
                  value={personaConfig.personality?.traits?.conscientiousness || 0.5}
                  onChange={(e) => updateConfig('personality', {
                    ...personaConfig.personality,
                    traits: { ...personaConfig.personality?.traits, conscientiousness: parseFloat(e.target.value) || 0.5 }
                  })}
                  style={{ ...inputStyle, marginBottom: 4 }}
                  placeholder="尽责性（0-1）"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                />
                <input
                  value={personaConfig.personality?.traits?.extraversion || 0.5}
                  onChange={(e) => updateConfig('personality', {
                    ...personaConfig.personality,
                    traits: { ...personaConfig.personality?.traits, extraversion: parseFloat(e.target.value) || 0.5 }
                  })}
                  style={{ ...inputStyle, marginBottom: 4 }}
                  placeholder="外向性（0-1）"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                />
                <input
                  value={personaConfig.personality?.traits?.agreeableness || 0.5}
                  onChange={(e) => updateConfig('personality', {
                    ...personaConfig.personality,
                    traits: { ...personaConfig.personality?.traits, agreeableness: parseFloat(e.target.value) || 0.5 }
                  })}
                  style={{ ...inputStyle, marginBottom: 4 }}
                  placeholder="宜人性（0-1）"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                />
                <input
                  value={personaConfig.personality?.traits?.neuroticism || 0.5}
                  onChange={(e) => updateConfig('personality', {
                    ...personaConfig.personality,
                    traits: { ...personaConfig.personality?.traits, neuroticism: parseFloat(e.target.value) || 0.5 }
                  })}
                  style={inputStyle}
                  placeholder="神经质（0-1）"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                />
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>沟通风格</label>
              <select
                value={personaConfig.personality?.communication?.tone || 'friendly'}
                onChange={(e) => updateConfig('personality', {
                  ...personaConfig.personality,
                  communication: { ...personaConfig.personality?.communication, tone: e.target.value }
                })}
                style={inputStyle}
              >
                <option value="friendly">友好亲切</option>
                <option value="professional">专业正式</option>
                <option value="casual">轻松随意</option>
                <option value="assertive">坚定自信</option>
                <option value="empathetic">同理关怀</option>
              </select>
            </div>
          </>
        )
      }

      default:
        return (
          <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
            <p>⚠️ 该节点类型暂不支持配置</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>类型：{type}</p>
          </div>
        )
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 350,
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
      <div style={{ marginBottom: 20, borderBottom: '2px solid #007bff', paddingBottom: 15 }}>
        <h3 style={{ margin: 0, color: '#333' }}>📋 节点配置</h3>
        <p style={{ margin: '5px 0 0', color: '#666', fontSize: 13 }}>
          类型：{getTypeLabel(type)}
        </p>
      </div>

      {/* 选项卡切换 */}
      <div style={{ display: 'flex', marginBottom: 20, borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('config')}
          style={{
            flex: 1,
            padding: '10px 15px',
            background: activeTab === 'config' ? '#007bff' : 'transparent',
            color: activeTab === 'config' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'config' ? '2px solid #007bff' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: -2,
          }}
        >
          ⚙️ 配置
        </button>
        <button
          onClick={() => setActiveTab('naming')}
          style={{
            flex: 1,
            padding: '10px 15px',
            background: activeTab === 'naming' ? '#007bff' : 'transparent',
            color: activeTab === 'naming' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'naming' ? '2px solid #007bff' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: -2,
          }}
        >
          📝 命名验证
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'config' ? (
          <div>
            <h4 style={{ margin: '0 0 15px', color: '#333', fontSize: 15 }}>⚙️ 配置详情</h4>
            {renderConfigFields()}
          </div>
        ) : (
          <div>
            <h4 style={{ margin: '0 0 15px', color: '#333', fontSize: 15 }}>📝 命名验证</h4>
            
            {/* 命名验证区域 */}
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: 8, marginBottom: 20 }}>
              <div style={{ marginBottom: 15 }}>
                <label style={labelStyle}>当前名称</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={editedLabel}
                    onChange={(e) => setEditedLabel(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="输入节点名称"
                  />
                  <button
                    onClick={handleNamingValidation}
                    style={{
                      padding: '8px 16px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    🔍 验证
                  </button>
                </div>
              </div>

              {namingValidation && (
                <div>
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: 6, 
                    marginBottom: 15,
                    background: namingValidation.isValid ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${namingValidation.isValid ? '#c3e6cb' : '#f5c6cb'}`,
                    color: namingValidation.isValid ? '#155724' : '#721c24',
                  }}>
                    <strong>{namingValidation.isValid ? '✅ 验证通过' : '❌ 验证失败'}</strong>
                    <p style={{ margin: '8px 0 0', fontSize: 13 }}>{namingValidation.message}</p>
                  </div>

                  {!namingValidation.isValid && namingValidation.suggestions.length > 0 && (
                    <div style={{ marginBottom: 15 }}>
                      <label style={labelStyle}>💡 建议的命名</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {namingValidation.suggestions.map((suggestion: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleApplySuggestion(suggestion)}
                            style={{
                              padding: '10px 15px',
                              background: 'white',
                              border: '1px solid #007bff',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 13,
                              color: '#007bff',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>{suggestion}</span>
                            <span style={{ fontSize: 12, opacity: 0.7 }}>📋 应用此建议</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {namingValidation.rule && (
                    <div style={{ padding: '12px', background: '#e7f3ff', borderRadius: 6 }}>
                      <label style={{ ...labelStyle, marginBottom: 8 }}>📖 命名规范说明</label>
                      <p style={{ margin: 0, fontSize: 13, color: '#004085' }}>
                        <strong>{namingValidation.rule.name}</strong>: {namingValidation.rule.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!namingValidation && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  <p style={{ margin: 0, fontSize: 14 }}>👆 输入名称后点击"验证"按钮</p>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#999' }}>
                    系统将自动检查命名是否符合规范并提供建议
                  </p>
                </div>
              )}
            </div>

            {/* 命名规范参考 */}
            <div style={{ padding: '15px', background: '#fff3cd', borderRadius: 8 }}>
              <h5 style={{ margin: '0 0 12px', fontSize: 14, color: '#856404' }}>📚 命名规范参考</h5>
              <div style={{ fontSize: 12, color: '#856404', lineHeight: 1.8 }}>
                <div><strong>PascalCase</strong>（大驼峰）: 适用于类名、组件名、接口名</div>
                <div><strong>camelCase</strong>（小驼峰）: 适用于变量名、函数名、方法名</div>
                <div><strong>snake_case</strong>（下划线）: 适用于数据库字段、配置文件</div>
                <div><strong>kebab-case</strong>（短横线）: 适用于 URL、CSS 类名、文件名</div>
                <div><strong>CONSTANT_CASE</strong>（常量）: 适用于全局常量、配置项</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => {
            onUpdate(node.id, { ...editedConfig, name: editedLabel })
            onClose()
          }}
          style={{
            padding: 12,
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          💾 保存{activeTab === 'config' ? '配置' : '命名'}
        </button>
        <button
          onClick={handleDelete}
          style={{
            padding: 12,
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          🗑️ 删除节点
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
  marginBottom: 6,
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

const fieldStyle = {
  marginBottom: 15,
}
