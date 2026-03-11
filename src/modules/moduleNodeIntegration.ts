/**
 * 模块与节点集成管理器
 * 负责模块与节点之间的双向绑定、依赖映射、统计分析
 */

import type {
  ModuleConfig,
  CustomNode,
  Edge,
  NodeModuleBinding,
  ModuleNodeGroup,
  ModuleDependencyMapping,
  ModuleStatistics,
  NodeOwnership
} from '../types'

/**
 * 节点与模块集成管理器类
 */
export class ModuleNodeIntegrationManager {
  private bindings: Map<string, NodeModuleBinding> = new Map()
  private modules: Map<string, ModuleConfig> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  // ==================== 绑定管理 ====================

  /**
   * 将节点绑定到模块
   */
  bindNodeToModule(
    nodeId: string,
    moduleId: string,
    bindingType: 'primary' | 'secondary' = 'primary'
  ): boolean {
    // 检查模块是否存在
    if (!this.modules.has(moduleId)) {
      console.error(`Module ${moduleId} does not exist`)
      return false
    }

    const existingBinding = this.bindings.get(nodeId)
    
    if (existingBinding) {
      // 更新现有绑定
      if (bindingType === 'primary') {
        existingBinding.primaryModule = moduleId
        existingBinding.isOrphan = false
      } else {
        if (!existingBinding.secondaryModules) {
          existingBinding.secondaryModules = []
        }
        if (!existingBinding.secondaryModules.includes(moduleId)) {
          existingBinding.secondaryModules.push(moduleId)
        }
      }
    } else {
      // 创建新绑定
      const ownership: NodeOwnership = {
        primaryModule: bindingType === 'primary' ? moduleId : undefined,
        secondaryModules: bindingType === 'secondary' ? [moduleId] : [],
        isOrphan: false
      }
      // 存储到 bindings
      this.bindings.set(nodeId, ownership as any)
    }

    this.saveToStorage()
    return true
  }

  /**
   * 解除节点与模块的绑定
   */
  unbindNodeFromModule(nodeId: string, moduleId: string): boolean {
    const ownership = this.bindings.get(nodeId)
    if (!ownership) return false

    if (ownership.primaryModule === moduleId) {
      ownership.primaryModule = undefined
      ownership.isOrphan = !ownership.secondaryModules?.length
    }

    if (ownership.secondaryModules) {
      ownership.secondaryModules = ownership.secondaryModules.filter(id => id !== moduleId)
      ownership.isOrphan = !ownership.primaryModule && !ownership.secondaryModules.length
    }

    this.saveToStorage()
    return true
  }

  /**
   * 获取节点的归属信息
   */
  getNodeOwnership(nodeId: string): NodeOwnership | null {
    return this.bindings.get(nodeId) || null
  }

  /**
   * 获取模块包含的所有节点
   */
  getModuleNodes(moduleId: string, nodes: CustomNode[]): CustomNode[] {
    return nodes.filter(node => {
      const ownership = this.bindings.get(node.id)
      return ownership?.primaryModule === moduleId || 
             ownership?.secondaryModules?.includes(moduleId)
    })
  }

  /**
   * 获取未归属任何模块的节点
   */
  getOrphanNodes(nodes: CustomNode[]): CustomNode[] {
    return nodes.filter(node => {
      const ownership = this.bindings.get(node.id)
      return !ownership || ownership.isOrphan
    })
  }

  // ==================== 模块分组 ====================

  /**
   * 创建模块节点分组
   */
  createModuleGroup(
    module: ModuleConfig,
    nodes: CustomNode[]
  ): ModuleNodeGroup {
    const moduleNodes = this.getModuleNodes(module.id, nodes)
    
    // 如果模块没有节点，不计算位置
    if (moduleNodes.length === 0) {
      return {
        moduleId: module.id,
        moduleName: module.name,
        moduleType: module.type,
        moduleLayer: module.layer,
        nodes: [],
        color: this.getModuleColor(module.type),
        position: undefined  // 没有节点时不设置位置
      }
    }
    
    // 计算模块边界
    const positions = moduleNodes.map(n => n.position)
    const minX = Math.min(...positions.map(p => p.x))
    const minY = Math.min(...positions.map(p => p.y))
    const maxX = Math.max(...moduleNodes.map(n => n.position.x + (n.data.config?.width || 200)))
    const maxY = Math.max(...moduleNodes.map(n => n.position.y + (n.data.config?.height || 150)))

    return {
      moduleId: module.id,
      moduleName: module.name,
      moduleType: module.type,
      moduleLayer: module.layer,
      nodes: moduleNodes.map(n => n.id),
      color: this.getModuleColor(module.type),
      position: {
        x: minX - 20,
        y: minY - 20,
        width: maxX - minX + 40,
        height: maxY - minY + 40
      }
    }
  }

  /**
   * 获取所有模块分组
   */
  getAllModuleGroups(
    modules: ModuleConfig[],
    nodes: CustomNode[]
  ): ModuleNodeGroup[] {
    return modules.map(module => this.createModuleGroup(module, nodes))
  }

  // ==================== 依赖映射 ====================

  /**
   * 分析模块依赖与节点连接的映射
   */
  analyzeModuleDependencies(
    modules: ModuleConfig[],
    nodes: CustomNode[],
    edges: Edge[]
  ): ModuleDependencyMapping[] {
    const mappings: ModuleDependencyMapping[] = []

    modules.forEach(sourceModule => {
      const sourceNodes = this.getModuleNodes(sourceModule.id, nodes)
      const sourceNodeIds = new Set(sourceNodes.map(n => n.id))

      sourceModule.dependencies.forEach((dep) => {
        const targetModuleId = typeof dep === 'string' ? dep : dep.moduleId
        const targetModule = modules.find(m => m.id === targetModuleId)
        if (!targetModule) return

        const targetNodes = this.getModuleNodes(targetModuleId, nodes)
        const targetNodeIds = new Set(targetNodes.map(n => n.id))

        // 查找跨模块的连接
        const connections = edges.filter(edge => {
          const isSourceToTarget = 
            sourceNodeIds.has(edge.source) && targetNodeIds.has(edge.target)
          const isTargetToSource = 
            targetNodeIds.has(edge.source) && sourceNodeIds.has(edge.target)
          return isSourceToTarget || isTargetToSource
        }).map(edge => ({
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          edgeId: edge.id
        }))

        // 验证依赖有效性
        const validationErrors: string[] = []
        
        // 检查是否有反向依赖（下层依赖上层）
        if (this.isLayerViolation(sourceModule.layer, targetModule.layer)) {
          validationErrors.push(
            `Layer violation: ${sourceModule.layer} cannot depend on ${targetModule.layer}`
          )
        }

        mappings.push({
          sourceModuleId: sourceModule.id,
          targetModuleId: targetModuleId,
          connections,
          isValid: validationErrors.length === 0,
          validationErrors
        })
      })
    })

    return mappings
  }

  /**
   * 检查层级依赖是否违规
   */
  private isLayerViolation(sourceLayer: string, targetLayer: string): boolean {
    const layerOrder: Record<string, number> = {
      'infrastructure': 0,
      'domain': 1,
      'application': 2,
      'presentation': 3
    }

    const sourceOrder = layerOrder[sourceLayer] ?? 0
    const targetOrder = layerOrder[targetLayer] ?? 0

    // 上层不能依赖下层（反向依赖）
    return sourceOrder < targetOrder
  }

  // ==================== 统计分析 ====================

  /**
   * 计算模块统计信息
   */
  calculateModuleStatistics(
    module: ModuleConfig,
    modules: ModuleConfig[],
    nodes: CustomNode[],
    edges: Edge[]
  ): ModuleStatistics {
    const moduleNodes = this.getModuleNodes(module.id, nodes)
    const moduleNodeIds = new Set(moduleNodes.map(n => n.id))

    // 按类型统计
    const nodesByType: Record<string, number> = {}
    moduleNodes.forEach(node => {
      const type = node.data.type
      nodesByType[type] = (nodesByType[type] || 0) + 1
    })

    // 统计连接
    let internalConnections = 0
    let externalConnections = 0

    edges.forEach(edge => {
      const sourceInModule = moduleNodeIds.has(edge.source)
      const targetInModule = moduleNodeIds.has(edge.target)

      if (sourceInModule && targetInModule) {
        internalConnections++
      } else if (sourceInModule || targetInModule) {
        externalConnections++
      }
    })

    // 计算依赖数
    const dependencyCount = module.dependencies.length
    const dependentCount = modules.filter(m => 
      m.dependencies.includes(module.id)
    ).length

    // 计算健康度评分
    const healthScore = this.calculateHealthScore({
      totalNodes: moduleNodes.length,
      internalConnections,
      externalConnections,
      dependencyCount,
      dependentCount,
      nodesByType
    })

    return {
      moduleId: module.id,
      totalNodes: moduleNodes.length,
      nodesByType,
      internalConnections,
      externalConnections,
      dependencyCount,
      dependentCount,
      healthScore
    }
  }

  /**
   * 计算模块健康度评分
   */
  private calculateHealthScore(stats: {
    totalNodes: number
    internalConnections: number
    externalConnections: number
    dependencyCount: number
    dependentCount: number
    nodesByType: Record<string, number>
  }): number {
    let score = 100

    // 节点数量评分（理想 5-15 个节点）
    if (stats.totalNodes < 3) score -= 10
    if (stats.totalNodes > 20) score -= 10

    // 内外连接比例评分（理想内部连接多于外部连接）
    const totalConnections = stats.internalConnections + stats.externalConnections
    if (totalConnections > 0) {
      const internalRatio = stats.internalConnections / totalConnections
      if (internalRatio < 0.5) score -= 15
      if (internalRatio < 0.3) score -= 10
    }

    // 依赖复杂度评分
    if (stats.dependencyCount > 5) score -= 10
    if (stats.dependentCount > 10) score -= 5

    // 类型多样性评分
    const typeCount = Object.keys(stats.nodesByType).length
    if (typeCount === 1) score -= 5  // 单一类型可能不够灵活

    return Math.max(0, Math.min(100, score))
  }

  // ==================== 工具方法 ====================

  /**
   * 获取模块主题色
   */
  private getModuleColor(moduleType: string): string {
    const colors: Record<string, string> = {
      'core': '#3b82f6',
      'feature': '#10b981',
      'shared': '#f59e0b',
      'infrastructure': '#6b7280',
      'api': '#ef4444',
      'ui': '#8b5cf6',
      'domain': '#ec4899',
      'application': '#06b6d4'
    }
    return colors[moduleType] || '#6b7280'
  }

  // ==================== 持久化 ====================

  /**
   * 从 LocalStorage 加载
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('module-node-bindings')
      if (saved) {
        this.bindings = new Map(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load bindings from storage:', error)
    }
  }

  /**
   * 保存到 LocalStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        'module-node-bindings',
        JSON.stringify(Array.from(this.bindings.entries()))
      )
    } catch (error) {
      console.error('Failed to save bindings to storage:', error)
    }
  }

  /**
   * 清空所有绑定
   */
  clearAllBindings(): void {
    this.bindings.clear()
    this.saveToStorage()
  }
}

// 导出单例实例
export const moduleNodeIntegration = new ModuleNodeIntegrationManager()
