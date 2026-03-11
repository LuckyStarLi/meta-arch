import type { CustomNode, NodeKind } from './types'
import type { Edge } from 'reactflow'

// ==================== 类型定义 ====================

/**
 * 检查结果的严重程度
 */
export type SeverityLevel = 'critical' | 'warning' | 'info' | 'success'

/**
 * 检查项类型
 */
export type CheckType = 
  | 'architecture-rule'      // 架构规则
  | 'data-integrity'         // 数据完整性
  | 'connection-matching'    // 连接匹配
  | 'performance'            // 性能
  | 'security'               // 安全
  | 'scalability'            // 可扩展性
  | 'best-practice'          // 最佳实践

/**
 * 单个检查问题
 */
export interface CheckIssue {
  id: string
  type: CheckType
  severity: SeverityLevel
  title: string
  description: string
  suggestion: string
  affectedNodes?: string[]    // 受影响的节点 IDs
  affectedEdges?: string[]    // 受影响的边 IDs
  category?: string           // 问题分类
}

/**
 * 检查维度统计
 */
export interface DimensionStats {
  total: number
  passed: number
  failed: number
  warnings: number
  score: number              // 0-100 分
}

/**
 * 完整的检查报告
 */
export interface DesignCheckReport {
  // 基本信息
  timestamp: Date
  totalNodes: number
  totalEdges: number
  
  // 各维度统计
  architectureRule: DimensionStats
  dataIntegrity: DimensionStats
  connectionMatching: DimensionStats
  performance: DimensionStats
  security: DimensionStats
  scalability: DimensionStats
  
  // 总体评分
  overallScore: number
  overallLevel: 'excellent' | 'good' | 'fair' | 'poor'
  
  // 问题列表
  issues: CheckIssue[]
  
  // 汇总信息
  summary: {
    criticalCount: number
    warningCount: number
    infoCount: number
    successCount: number
  }
  
  // 改进建议
  recommendations: string[]
}

/**
 * 检查器配置
 */
export interface CheckerConfig {
  enableArchitectureCheck: boolean
  enableDataIntegrityCheck: boolean
  enableConnectionCheck: boolean
  enablePerformanceCheck: boolean
  enableSecurityCheck: boolean
  enableScalabilityCheck: boolean
  strictMode: boolean        // 严格模式：将更多问题标记为 critical
}

// ==================== 默认配置 ====================

const defaultConfig: CheckerConfig = {
  enableArchitectureCheck: true,
  enableDataIntegrityCheck: true,
  enableConnectionCheck: true,
  enablePerformanceCheck: true,
  enableSecurityCheck: true,
  enableScalabilityCheck: true,
  strictMode: false,
}

// ==================== 检查规则定义 ====================

/**
 * 架构规则检查
 */
const ARCHITECTURE_RULES = {
  // 规则 1: 必须有前端节点
  mustHaveFrontend: {
    id: 'ARCH-001',
    title: '缺少前端应用',
    description: '系统应该至少包含一个前端应用节点',
    suggestion: '添加前端应用节点（如 Web 应用、移动应用等）',
    check: (nodes: CustomNode[]) => nodes.some(n => n.data.type === 'frontend'),
  },
  
  // 规则 2: 必须有数据库节点
  mustHaveDatabase: {
    id: 'ARCH-002',
    title: '缺少数据库',
    description: '系统应该至少包含一个数据库节点用于数据持久化',
    suggestion: '添加数据库节点（如 MySQL、PostgreSQL、MongoDB 等）',
    check: (nodes: CustomNode[]) => nodes.some(n => n.data.type === 'database'),
  },
  
  // 规则 3: API 节点必须有对应的 Service
  apiNeedsService: {
    id: 'ARCH-003',
    title: 'API 节点缺少服务层支持',
    description: '每个 API 节点应该连接到至少一个 Service 节点',
    suggestion: '为 API 节点添加对应的业务服务节点',
    check: (nodes: CustomNode[], edges: Edge[]) => {
      const apiNodes = nodes.filter(n => n.data.type === 'api')
      if (apiNodes.length === 0) return true
      
      // 优化：Agent 类型的节点可以不遵循 API→Service 规则
      // 因为 Agent 可以直接调用其他服务或外部 API
      return apiNodes.every(api => {
        // 检查是否是 Agent 相关的 API（通过名称或连接判断）
        const connectedToAgent = edges.some(e => 
          e.target === api.id && 
          nodes.find(n => n.id === e.source)?.data.type === 'agent'
        )
        
        // 如果 API 被 Agent 使用，可以不要求连接到 Service
        if (connectedToAgent) return true
        
        // 否则必须连接到 Service
        return edges.some(e => 
          e.source === api.id && 
          nodes.find(n => n.id === e.target)?.data.type === 'service'
        )
      })
    },
  },
  
  // 规则 4: Service 节点应该有 Repository 或 Database 支持
  serviceNeedsData: {
    id: 'ARCH-004',
    title: '服务节点缺少数据层支持',
    description: 'Service 节点应该连接到 Repository 或 Database 节点',
    suggestion: '为 Service 节点添加数据访问层或直接连接数据库',
    check: (nodes: CustomNode[], edges: Edge[]) => {
      const serviceNodes = nodes.filter(n => n.data.type === 'service')
      if (serviceNodes.length === 0) return true
      
      return serviceNodes.every(service => {
        const targets = edges
          .filter(e => e.source === service.id)
          .map(e => nodes.find(n => n.id === e.target))
          .filter(Boolean) as CustomNode[]
        
        return targets.some(t => 
          t.data.type === 'repository' || t.data.type === 'database'
        )
      })
    },
  },
  
  // 规则 5: 避免循环依赖
  noCircularDependency: {
    id: 'ARCH-005',
    title: '检测到循环依赖',
    description: '系统中存在循环依赖，违反分层架构原则',
    suggestion: '重新设计节点连接关系，消除循环依赖',
    check: (nodes: CustomNode[], edges: Edge[]) => {
      // 简化的循环检测（基于层级）
      const layerMap: Record<NodeKind, number> = {
        frontend: 0,
        persona: 0,
        api: 1,
        service: 2,
        agent: 2,
        repository: 3,
        database: 4,
      }
      
      // 检查是否有从低层级到高层级的反向连接
      for (const edge of edges) {
        const sourceNode = nodes.find(n => n.id === edge.source)
        const targetNode = nodes.find(n => n.id === edge.target)
        
        if (!sourceNode || !targetNode) continue
        
        const sourceLayer = layerMap[sourceNode.data.type] ?? 0
        const targetLayer = layerMap[targetNode.data.type] ?? 0
        
        // 允许同层连接，但不允许跨层反向连接（差距>1）
        if (targetLayer - sourceLayer < -1) {
          return false
        }
      }
      
      return true
    },
  },
}

/**
 * 数据完整性检查规则
 */
const DATA_INTEGRITY_RULES = {
  // 规则 1: 节点名称完整性
  nodeNameRequired: {
    id: 'DATA-001',
    title: '节点名称缺失',
    description: '部分节点缺少名称配置',
    suggestion: '为所有节点添加有意义的名称',
    check: (nodes: CustomNode[]) => {
      return nodes.every(n => {
        const name = n.data.config.name || n.data.label
        return name && name.trim().length > 0 && !name.includes('示例')
      })
    },
    getAffectedNodes: (nodes: CustomNode[]) => {
      return nodes
        .filter(n => {
          const name = n.data.config.name || n.data.label
          return !name || name.trim().length === 0 || name.includes('示例')
        })
        .map(n => n.id)
    },
  },
  
  // 规则 2: 关键配置完整性
  criticalConfigRequired: {
    id: 'DATA-002',
    title: '关键配置缺失',
    description: '部分节点缺少关键配置信息',
    suggestion: '完善节点的关键配置参数',
    check: (nodes: CustomNode[]) => {
      return nodes.every(n => {
        const config = n.data.config
        
        // Frontend 需要 framework 和 port
        if (n.data.type === 'frontend') {
          return config.framework && config.port
        }
        
        // API 需要 route 和 method
        if (n.data.type === 'api') {
          return config.route && config.method
        }
        
        // Database 需要 type 和 host
        if (n.data.type === 'database') {
          return config.type && config.host
        }
        
        return true
      })
    },
    getAffectedNodes: (nodes: CustomNode[]) => {
      return nodes
        .filter(n => {
          const config = n.data.config
          
          if (n.data.type === 'frontend') {
            return !config.framework || !config.port
          }
          if (n.data.type === 'api') {
            return !config.route || !config.method
          }
          if (n.data.type === 'database') {
            return !config.type || !config.host
          }
          
          return false
        })
        .map(n => n.id)
    },
  },
  
  // 规则 3: 描述信息完整性
  descriptionRecommended: {
    id: 'DATA-003',
    title: '缺少描述信息',
    description: '建议为关键节点添加描述信息',
    suggestion: '为 API、Service 等节点添加功能描述',
    severity: 'info' as SeverityLevel,
    check: (nodes: CustomNode[]) => {
      const criticalTypes = ['api', 'service', 'agent']
      const criticalNodes = nodes.filter(n => criticalTypes.includes(n.data.type))
      
      if (criticalNodes.length === 0) return true
      
      return criticalNodes.every(n => {
        const desc = n.data.config.description
        return desc && desc.trim().length > 10
      })
    },
    getAffectedNodes: (nodes: CustomNode[]) => {
      const criticalTypes = ['api', 'service', 'agent']
      return nodes
        .filter(n => {
          if (!criticalTypes.includes(n.data.type)) return false
          const desc = n.data.config.description
          return !desc || desc.trim().length <= 10
        })
        .map(n => n.id)
    },
  },
}

/**
 * 连接匹配检查规则
 */
const CONNECTION_RULES = {
  // 规则 1: 孤立节点检测
  noIsolatedNodes: {
    id: 'CONN-001',
    title: '存在孤立节点',
    description: '部分节点没有任何连接关系',
    suggestion: '检查孤立节点是否需要连接到其他节点，或考虑删除',
    check: (nodes: CustomNode[], edges: Edge[]) => {
      if (nodes.length === 0) return true
      if (edges.length === 0) return false
      
      const connectedNodeIds = new Set<string>()
      edges.forEach(e => {
        connectedNodeIds.add(e.source)
        connectedNodeIds.add(e.target)
      })
      
      // 允许前端和数据库节点孤立（可能是边界节点）
      const isolatedNodes = nodes.filter(n => 
        !connectedNodeIds.has(n.id) && 
        n.data.type !== 'frontend' && 
        n.data.type !== 'database'
      )
      
      return isolatedNodes.length === 0
    },
    getAffectedNodes: (nodes: CustomNode[], edges: Edge[]) => {
      const connectedNodeIds = new Set<string>()
      edges.forEach(e => {
        connectedNodeIds.add(e.source)
        connectedNodeIds.add(e.target)
      })
      
      return nodes
        .filter(n => 
          !connectedNodeIds.has(n.id) && 
          n.data.type !== 'frontend' && 
          n.data.type !== 'database'
        )
        .map(n => n.id)
    },
  },
  
  // 规则 2: 重复连接检测
  noDuplicateConnections: {
    id: 'CONN-002',
    title: '存在重复连接',
    description: '两个节点之间存在多条相同的连接',
    suggestion: '移除重复的连接，保持连接关系清晰',
    check: (nodes: CustomNode[], edges: Edge[]) => {
      const connectionSet = new Set<string>()
      
      for (const edge of edges) {
        const key = `${edge.source}->${edge.target}`
        if (connectionSet.has(key)) {
          return false
        }
        connectionSet.add(key)
      }
      
      return true
    },
  },
  
  // 规则 3: 连接方向正确性
  correctConnectionDirection: {
    id: 'CONN-003',
    title: '连接方向可能错误',
    description: '部分连接的方向可能不符合数据流向',
    suggestion: '检查连接方向，确保数据从上游流向下游',
    check: (nodes: CustomNode[], edges: Edge[]) => {
      const layerMap: Record<NodeKind, number> = {
        frontend: 0,
        persona: 0,
        api: 1,
        service: 2,
        agent: 2,
        repository: 3,
        database: 4,
      }
      
      for (const edge of edges) {
        const sourceNode = nodes.find(n => n.id === edge.source)
        const targetNode = nodes.find(n => n.id === edge.target)
        
        if (!sourceNode || !targetNode) continue
        
        const sourceLayer = layerMap[sourceNode.data.type] ?? 0
        const targetLayer = layerMap[targetNode.data.type] ?? 0
        
        // 警告：如果连接是从低层到高层（反向）
        if (targetLayer < sourceLayer - 1) {
          return false
        }
      }
      
      return true
    },
  },
}

// ==================== 主检查器类 ====================

export class DesignChecker {
  private config: CheckerConfig
  
  constructor(config: Partial<CheckerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }
  
  /**
   * 执行完整的设计检查
   */
  async checkDesign(
    nodes: CustomNode[],
    edges: Edge[]
  ): Promise<DesignCheckReport> {
    const issues: CheckIssue[] = []
    
    // 1. 架构规则检查
    if (this.config.enableArchitectureCheck) {
      const archIssues = await this.checkArchitectureRules(nodes, edges)
      issues.push(...archIssues)
    }
    
    // 2. 数据完整性检查
    if (this.config.enableDataIntegrityCheck) {
      const dataIssues = await this.checkDataIntegrity(nodes)
      issues.push(...dataIssues)
    }
    
    // 3. 连接匹配检查
    if (this.config.enableConnectionCheck) {
      const connIssues = await this.checkConnections(nodes, edges)
      issues.push(...connIssues)
    }
    
    // 4. 性能检查
    if (this.config.enablePerformanceCheck) {
      const perfIssues = await this.checkPerformance(nodes, edges)
      issues.push(...perfIssues)
    }
    
    // 5. 安全检查
    if (this.config.enableSecurityCheck) {
      const secIssues = await this.checkSecurity(nodes, edges)
      issues.push(...secIssues)
    }
    
    // 6. 可扩展性检查
    if (this.config.enableScalabilityCheck) {
      const scaleIssues = await this.checkScalability(nodes, edges)
      issues.push(...scaleIssues)
    }
    
    // 生成报告
    return this.generateReport(nodes, edges, issues)
  }
  
  /**
   * 架构规则检查
   */
  private async checkArchitectureRules(
    nodes: CustomNode[],
    edges: Edge[]
  ): Promise<CheckIssue[]> {
    const issues: CheckIssue[] = []
    
    for (const [key, rule] of Object.entries(ARCHITECTURE_RULES)) {
      const passed = rule.check(nodes, edges)
      
      if (!passed) {
        issues.push({
          id: rule.id,
          type: 'architecture-rule',
          severity: this.config.strictMode ? 'critical' : 'warning',
          title: rule.title,
          description: rule.description,
          suggestion: rule.suggestion,
          category: '架构设计',
        })
      } else {
        // 添加成功状态的检查项，用于统计
        issues.push({
          id: `${rule.id}-PASS`,
          type: 'architecture-rule',
          severity: 'success',
          title: `${rule.title} ✓`,
          description: '通过检查',
          suggestion: '',
          category: '架构设计',
        })
      }
    }
    
    return issues
  }
  
  /**
   * 数据完整性检查
   */
  private async checkDataIntegrity(
    nodes: CustomNode[]
  ): Promise<CheckIssue[]> {
    const issues: CheckIssue[] = []
    
    for (const [, rule] of Object.entries(DATA_INTEGRITY_RULES)) {
      const passed = rule.check(nodes, [] as Edge[])
      
      if (!passed) {
        const affectedNodes = rule.getAffectedNodes 
          ? rule.getAffectedNodes(nodes, [] as Edge[]) 
          : []
        
        issues.push({
          id: rule.id,
          type: 'data-integrity',
          severity: rule.severity || 'warning',
          title: rule.title,
          description: rule.description,
          suggestion: rule.suggestion,
          affectedNodes,
          category: '数据完整性',
        })
      } else {
        // 添加成功状态的检查项
        issues.push({
          id: `${rule.id}-PASS`,
          type: 'data-integrity',
          severity: 'success',
          title: `${rule.title} ✓`,
          description: '通过检查',
          suggestion: '',
          category: '数据完整性',
        })
      }
    }
    
    return issues
  }
  
  /**
   * 连接匹配检查
   */
  private async checkConnections(
    nodes: CustomNode[],
    edges: Edge[]
  ): Promise<CheckIssue[]> {
    const issues: CheckIssue[] = []
    
    for (const [, rule] of Object.entries(CONNECTION_RULES)) {
      const passed = rule.check(nodes, edges)
      
      if (!passed) {
        const affectedNodes = rule.getAffectedNodes 
          ? rule.getAffectedNodes(nodes, edges) 
          : []
        
        issues.push({
          id: rule.id,
          type: 'connection-matching',
          severity: 'warning',
          title: rule.title,
          description: rule.description,
          suggestion: rule.suggestion,
          affectedNodes,
          category: '连接关系',
        })
      } else {
        // 添加成功状态的检查项
        issues.push({
          id: `${rule.id}-PASS`,
          type: 'connection-matching',
          severity: 'success',
          title: `${rule.title} ✓`,
          description: '通过检查',
          suggestion: '',
          category: '连接关系',
        })
      }
    }
    
    return issues
  }
  
  /**
   * 性能检查
   */
  private async checkPerformance(
    nodes: CustomNode[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    edges: Edge[]
  ): Promise<CheckIssue[]> {
    const issues: CheckIssue[] = []
    
    // 检查 1: 单点故障风险
    const serviceNodes = nodes.filter(n => n.data.type === 'service')
    if (serviceNodes.length === 1 && serviceNodes[0]) {
      issues.push({
        id: 'PERF-001',
        type: 'performance',
        severity: 'warning',
        title: '存在单点故障风险',
        description: '系统只有一个服务节点，可能存在单点故障',
        suggestion: '考虑添加多个服务节点实现负载均衡',
        affectedNodes: serviceNodes.map(n => n.id),
        category: '性能与可用性',
      })
    }
    
    // 检查 2: 数据库连接数
    const dbNodes = nodes.filter(n => n.data.type === 'database')
    const repoNodes = nodes.filter(n => n.data.type === 'repository')
    
    if (dbNodes.length > 0 && repoNodes.length > dbNodes.length * 3) {
      issues.push({
        id: 'PERF-002',
        type: 'performance',
        severity: 'info',
        title: '数据库连接可能过载',
        description: '单个数据库被过多仓库节点连接',
        suggestion: '考虑使用数据库连接池或分库设计',
        category: '性能优化',
      })
    }
    
    return issues
  }
  
  /**
   * 安全检查
   */
  private async checkSecurity(
    nodes: CustomNode[],
    edges: Edge[]
  ): Promise<CheckIssue[]> {
    const issues: CheckIssue[] = []
    
    // 检查 1: API 认证
    // 优化：区分敏感 API 和公开 API
    const apiNodes = nodes.filter(n => n.data.type === 'api')
    
    // 定义公开 API 的路径模式（这些 API 通常不需要认证）
    const publicApiPatterns = [
      /\/login/i,           // 登录
      /\/register/i,        // 注册
      /\/public\//i,        // 公开接口
      /\/health/i,          // 健康检查
      /\/tags\/\*$/i,       // 标签查询（公开）
    ]
    
    // 筛选出应该需要认证但未启用的敏感 API
    const sensitiveUnauthApis = apiNodes.filter(api => {
      const route = api.data.config.route || ''
      const requiresAuth = api.data.config.requiresAuth
      
      // 如果是公开 API，不需要认证
      const isPublic = publicApiPatterns.some(pattern => pattern.test(route))
      if (isPublic) return false
      
      // 如果是敏感 API 但未启用认证，标记为问题
      return !requiresAuth
    })
    
    if (sensitiveUnauthApis.length > 0) {
      issues.push({
        id: 'SEC-001',
        type: 'security',
        severity: 'warning',
        title: '部分敏感 API 缺少认证',
        description: `${sensitiveUnauthApis.length} 个敏感 API 节点未启用认证（公开 API 除外）`,
        suggestion: '为敏感 API 接口（如资金、积分、用户数据等）启用认证机制',
        affectedNodes: sensitiveUnauthApis.map(n => n.id),
        category: '安全性',
      })
    }
    
    // 检查 2: 数据库暴露风险
    const exposedDb = edges.some(e => {
      const source = nodes.find(n => n.id === e.source)
      return source?.data.type === 'frontend' && 
             nodes.find(n => n.id === e.target)?.data.type === 'database'
    })
    
    if (exposedDb) {
      issues.push({
        id: 'SEC-002',
        type: 'security',
        severity: 'critical',
        title: '数据库直接暴露给前端',
        description: '检测到前端节点直接连接数据库，存在严重安全隐患',
        suggestion: '前端应该通过 API 层访问数据，严禁直接连接数据库',
        category: '安全性',
      })
    }
    
    return issues
  }
  
  /**
   * 可扩展性检查
   */
  private async checkScalability(
    nodes: CustomNode[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    edges: Edge[]
  ): Promise<CheckIssue[]> {
    const issues: CheckIssue[] = []
    
    // 检查 1: 是否使用 Repository 模式
    const serviceNodes = nodes.filter(n => n.data.type === 'service')
    const repoNodes = nodes.filter(n => n.data.type === 'repository')
    
    if (serviceNodes.length > 0 && repoNodes.length === 0) {
      issues.push({
        id: 'SCALE-001',
        type: 'scalability',
        severity: 'info',
        title: '未使用 Repository 模式',
        description: '服务节点直接连接数据库，不利于扩展和维护',
        suggestion: '考虑引入 Repository 层封装数据访问逻辑',
        category: '可扩展性',
      })
    }
    
    // 检查 2: 是否考虑缓存
    // （这里简化处理，实际应该检查是否有 Redis 等缓存节点）
    
    return issues
  }
  
  /**
   * 生成检查报告
   */
  private generateReport(
    nodes: CustomNode[],
    edges: Edge[],
    issues: CheckIssue[]
  ): DesignCheckReport {
    // 统计各维度
    const stats = {
      architectureRule: this.calculateDimensionStats(issues, 'architecture-rule'),
      dataIntegrity: this.calculateDimensionStats(issues, 'data-integrity'),
      connectionMatching: this.calculateDimensionStats(issues, 'connection-matching'),
      performance: this.calculateDimensionStats(issues, 'performance'),
      security: this.calculateDimensionStats(issues, 'security'),
      scalability: this.calculateDimensionStats(issues, 'scalability'),
    }
    
    // 计算总体评分
    const overallScore = this.calculateOverallScore(stats)
    const overallLevel = this.getOverallLevel(overallScore)
    
    // 统计严重程度
    const summary = {
      criticalCount: issues.filter(i => i.severity === 'critical').length,
      warningCount: issues.filter(i => i.severity === 'warning').length,
      infoCount: issues.filter(i => i.severity === 'info').length,
      successCount: issues.filter(i => i.severity === 'success').length,
    }
    
    // 生成改进建议
    const recommendations = this.generateRecommendations(issues)
    
    return {
      timestamp: new Date(),
      totalNodes: nodes.length,
      totalEdges: edges.length,
      ...stats,
      overallScore,
      overallLevel,
      issues,
      summary,
      recommendations,
    }
  }
  
  /**
   * 计算维度统计
   */
  private calculateDimensionStats(
    issues: CheckIssue[],
    type: CheckType
  ): DimensionStats {
    const typeIssues = issues.filter(i => i.type === type)
    const failed = typeIssues.filter(i => i.severity === 'critical' || i.severity === 'warning').length
    const warnings = typeIssues.filter(i => i.severity === 'warning').length
    const passed = typeIssues.filter(i => i.severity === 'success' || i.severity === 'info').length
    
    // 总检查项数 = 失败项 + 通过项
    const total = failed + passed
    
    // 计算分数（100 分制）
    // 如果没有检查项，得分为 100 分（完美）
    const score = total === 0 ? 100 : Math.round((passed / total) * 100)
    
    return {
      total,
      passed,
      failed,
      warnings,
      score,
    }
  }
  
  /**
   * 计算总体评分
   */
  private calculateOverallScore(stats: Record<string, DimensionStats>): number {
    const weights = {
      architectureRule: 0.25,
      dataIntegrity: 0.20,
      connectionMatching: 0.20,
      performance: 0.15,
      security: 0.15,
      scalability: 0.05,
    }
    
    let totalScore = 0
    let totalWeight = 0
    
    for (const [key, stat] of Object.entries(stats)) {
      const weight = weights[key as keyof typeof weights] || 0
      totalScore += stat.score * weight
      totalWeight += weight
    }
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }
  
  /**
   * 获取总体等级
   */
  private getOverallLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'fair'
    return 'poor'
  }
  
  /**
   * 生成改进建议
   */
  private generateRecommendations(issues: CheckIssue[]): string[] {
    const recommendations: string[] = []
    
    // 按严重程度排序
    const sortedIssues = [...issues].sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
    
    // 取前 5 个最重要的问题生成建议
    sortedIssues.slice(0, 5).forEach(issue => {
      if (issue.severity !== 'success') {
        recommendations.push(`【${issue.category}】${issue.suggestion}`)
      }
    })
    
    if (recommendations.length === 0) {
      recommendations.push('✅ 设计质量优秀，继续保持！')
    }
    
    return recommendations
  }
}

// ==================== 导出工具函数 ====================

/**
 * 快速执行设计检查
 */
export async function runDesignCheck(
  nodes: CustomNode[],
  edges: Edge[],
  config?: Partial<CheckerConfig>
): Promise<DesignCheckReport> {
  const checker = new DesignChecker(config)
  return checker.checkDesign(nodes, edges)
}

/**
 * 格式化检查报告为文本
 */
export function formatReport(report: DesignCheckReport): string {
  const lines: string[] = []
  
  lines.push('════════════════════════════════════════')
  lines.push('       系统设计检查报告')
  lines.push('════════════════════════════════════════')
  lines.push(`检查时间：${report.timestamp.toLocaleString('zh-CN')}`)
  lines.push(`节点总数：${report.totalNodes}`)
  lines.push(`连接总数：${report.totalEdges}`)
  lines.push('')
  lines.push('────────────────────────────────────────')
  lines.push('总体评分')
  lines.push('────────────────────────────────────────')
  lines.push(`得分：${report.overallScore}/100`)
  lines.push(`等级：${getLevelLabel(report.overallLevel)}`)
  lines.push('')
  lines.push('问题统计:')
  lines.push(`  🔴 严重问题：${report.summary.criticalCount}`)
  lines.push(`  🟡 警告：${report.summary.warningCount}`)
  lines.push(`  🔵 建议：${report.summary.infoCount}`)
  lines.push('')
  lines.push('────────────────────────────────────────')
  lines.push('维度评分')
  lines.push('────────────────────────────────────────')
  lines.push(`架构规则：   ${report.architectureRule.score}/100 (${report.architectureRule.passed}/${report.architectureRule.total})`)
  lines.push(`数据完整性： ${report.dataIntegrity.score}/100 (${report.dataIntegrity.passed}/${report.dataIntegrity.total})`)
  lines.push(`连接匹配：   ${report.connectionMatching.score}/100 (${report.connectionMatching.passed}/${report.connectionMatching.total})`)
  lines.push(`性能：       ${report.performance.score}/100 (${report.performance.passed}/${report.performance.total})`)
  lines.push(`安全：       ${report.security.score}/100 (${report.security.passed}/${report.security.total})`)
  lines.push(`可扩展性：   ${report.scalability.score}/100 (${report.scalability.passed}/${report.scalability.total})`)
  lines.push('')
  
  if (report.issues.length > 0) {
    lines.push('────────────────────────────────────────')
    lines.push('问题详情')
    lines.push('────────────────────────────────────────')
    
    report.issues.forEach((issue, index) => {
      const icon = getSeverityIcon(issue.severity)
      lines.push(`${index + 1}. ${icon} [${issue.category}] ${issue.title}`)
      lines.push(`   描述：${issue.description}`)
      lines.push(`   建议：${issue.suggestion}`)
      if (issue.affectedNodes && issue.affectedNodes.length > 0) {
        lines.push(`   影响节点：${issue.affectedNodes.join(', ')}`)
      }
      lines.push('')
    })
  }
  
  if (report.recommendations.length > 0) {
    lines.push('────────────────────────────────────────')
    lines.push('改进建议')
    lines.push('────────────────────────────────────────')
    report.recommendations.forEach((rec, index) => {
      lines.push(`${index + 1}. ${rec}`)
    })
  }
  
  lines.push('')
  lines.push('════════════════════════════════════════')
  
  return lines.join('\n')
}

function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    excellent: '优秀 ⭐⭐⭐⭐⭐',
    good: '良好 ⭐⭐⭐⭐',
    fair: '一般 ⭐⭐⭐',
    poor: '需改进 ⭐⭐',
  }
  return labels[level] || level
}

function getSeverityIcon(severity: SeverityLevel): string {
  const icons: Record<SeverityLevel, string> = {
    critical: '🔴',
    warning: '🟡',
    info: '🔵',
    success: '✅',
  }
  return icons[severity]
}
