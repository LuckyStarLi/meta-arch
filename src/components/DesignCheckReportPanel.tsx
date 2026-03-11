import type { DesignCheckReport } from '../designChecker'

interface Props {
  report: DesignCheckReport
  onClose: () => void
}

export default function DesignCheckReportPanel({ report, onClose }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50'
    if (score >= 75) return '#8bc34a'
    if (score >= 60) return '#ff9800'
    return '#f44336'
  }

  const getLevelConfig = (level: string) => {
    const configs = {
      excellent: { color: '#4caf50', stars: '⭐⭐⭐⭐⭐', label: '优秀' },
      good: { color: '#8bc34a', stars: '⭐⭐⭐⭐', label: '良好' },
      fair: { color: '#ff9800', stars: '⭐⭐⭐', label: '一般' },
      poor: { color: '#f44336', stars: '⭐⭐', label: '需改进' },
    }
    return configs[level as keyof typeof configs] || configs.poor
  }

  const getSeverityStyle = (severity: string) => {
    const styles = {
      critical: { bg: '#ffebee', color: '#c62828', icon: '🔴' },
      warning: { bg: '#fff3e0', color: '#ef6c00', icon: '🟡' },
      info: { bg: '#e3f2fd', color: '#1976d2', icon: '🔵' },
      success: { bg: '#e8f5e9', color: '#388e3c', icon: '✅' },
    }
    return styles[severity as keyof typeof styles] || styles.info
  }

  const levelConfig = getLevelConfig(report.overallLevel)

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
          <h2 style={{ margin: 0, fontSize: 20 }}>📋 设计检查报告</h2>
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
          检查时间：{report.timestamp.toLocaleString('zh-CN')}
        </div>
      </div>

      {/* 总体评分 */}
      <div style={{ padding: 20, borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ textAlign: 'center', marginBottom: 15 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(report.overallScore)} ${report.overallScore}%, #e0e0e0 ${report.overallScore}%)`,
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 'bold', color: getScoreColor(report.overallScore) }}>
                {report.overallScore}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>分</div>
            </div>
          </div>
          
          <div style={{ fontSize: 18, fontWeight: 500, color: levelConfig.color, marginBottom: 5 }}>
            {levelConfig.label} {levelConfig.stars}
          </div>
          
          <div style={{ fontSize: 13, color: '#666' }}>
            共 {report.totalNodes} 个节点，{report.totalEdges} 条连接
          </div>
        </div>

        {/* 问题统计 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            padding: 15,
            background: '#f5f5f5',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              padding: 12,
              background: '#ffebee',
              borderRadius: 6,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🔴</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#c62828' }}>
              {report.summary.criticalCount}
            </div>
            <div style={{ fontSize: 12, color: '#c62828' }}>严重问题</div>
          </div>
          
          <div
            style={{
              padding: 12,
              background: '#fff3e0',
              borderRadius: 6,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🟡</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ef6c00' }}>
              {report.summary.warningCount}
            </div>
            <div style={{ fontSize: 12, color: '#ef6c00' }}>警告</div>
          </div>
          
          <div
            style={{
              padding: 12,
              background: '#e3f2fd',
              borderRadius: 6,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🔵</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1976d2' }}>
              {report.summary.infoCount}
            </div>
            <div style={{ fontSize: 12, color: '#1976d2' }}>建议</div>
          </div>
        </div>
      </div>

      {/* 维度评分 */}
      <div style={{ padding: 20, borderBottom: '1px solid #e0e0e0' }}>
        <h3 style={{ margin: '0 0 15px', fontSize: 16, color: '#333' }}>📊 维度评分</h3>
        
        <DimensionBar 
          label="架构规则" 
          score={report.architectureRule.score}
          total={report.architectureRule.total}
          passed={report.architectureRule.passed}
        />
        <DimensionBar 
          label="数据完整性" 
          score={report.dataIntegrity.score}
          total={report.dataIntegrity.total}
          passed={report.dataIntegrity.passed}
        />
        <DimensionBar 
          label="连接匹配" 
          score={report.connectionMatching.score}
          total={report.connectionMatching.total}
          passed={report.connectionMatching.passed}
        />
        <DimensionBar 
          label="性能" 
          score={report.performance.score}
          total={report.performance.total}
          passed={report.performance.passed}
        />
        <DimensionBar 
          label="安全" 
          score={report.security.score}
          total={report.security.total}
          passed={report.security.passed}
        />
        <DimensionBar 
          label="可扩展性" 
          score={report.scalability.score}
          total={report.scalability.total}
          passed={report.scalability.passed}
        />
      </div>

      {/* 问题详情 */}
      {report.issues.length > 0 && (
        <div style={{ padding: 20, borderBottom: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 15px', fontSize: 16, color: '#333' }}>
            ⚠️ 问题详情 ({report.issues.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.issues.map((issue) => {
              const style = getSeverityStyle(issue.severity)
              return (
                <div
                  key={issue.id}
                  style={{
                    padding: 12,
                    background: style.bg,
                    borderRadius: 6,
                    borderLeft: `4px solid ${style.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{style.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: style.color, marginBottom: 4 }}>
                        {issue.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                        {issue.description}
                      </div>
                      <div style={{ fontSize: 12, color: style.color }}>
                        💡 {issue.suggestion}
                      </div>
                      {issue.affectedNodes && issue.affectedNodes.length > 0 && (
                        <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                          影响节点：{issue.affectedNodes.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      <div style={{ padding: 20, paddingBottom: 40 }}>
        <h3 style={{ margin: '0 0 15px', fontSize: 16, color: '#333' }}>
          💡 改进建议
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {report.recommendations.map((rec, index) => (
            <div
              key={index}
              style={{
                padding: 12,
                background: '#f5f5f5',
                borderRadius: 6,
                borderLeft: '4px solid #667eea',
              }}
            >
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>
                {index + 1}. {rec}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 维度评分条组件
function DimensionBar({ 
  label, 
  score, 
  total, 
  passed 
}: { 
  label: string
  score: number
  total: number
  passed: number
}) {
  const getColor = (score: number) => {
    if (score >= 90) return '#4caf50'
    if (score >= 75) return '#8bc34a'
    if (score >= 60) return '#ff9800'
    return '#f44336'
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
        <span style={{ fontSize: 13, color: '#999' }}>
          {passed}/{total}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 8,
            background: '#e0e0e0',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${score}%`,
              height: '100%',
              background: getColor(score),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: getColor(score),
            minWidth: 35,
            textAlign: 'right',
          }}
        >
          {score}分
        </span>
      </div>
    </div>
  )
}
