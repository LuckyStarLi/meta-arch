/**
 * 层级验证系统
 * 验证架构设计中的层级关系和依赖规则
 */

import { Node, Edge } from 'reactflow'
import { ModuleConfig, ModuleLayer, ModuleType } from './moduleSystem'

/**
 * 节点层级映射
 */
export interface NodeLayerMapping {
  nodeType: string
  layer: ModuleLayer
  moduleType: ModuleType
}

/**
 * 层级验证规则
 */
export interface LayerValidationRule {
  id: string
  name: string
  description: string
  validator: (nodes: Node[], edges: Edge[], modules: ModuleConfig[]) => ValidationResult
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean
  ruleId: string
  ruleName: string
  message: string
  details: Array<{
    nodeId?: string
    moduleName?: string
    severity: 'error' | 'warning' | 'info'
    message: string
    suggestion?: string
  }>
}

/**
 * 预定义的节点层级映射
 */
export const defaultLayerMappings: NodeLayerMapping[] = [
  // 展示层
  { nodeType: 'component', layer: 'presentation', moduleType: 'ui' },
  { nodeType: 'page', layer: 'presentation', moduleType: 'ui' },
  { nodeType: 'view', layer: 'presentation', moduleType: 'ui' },
  { nodeType: 'layout', layer: 'presentation', moduleType: 'ui' },
  
  // 应用层
  { nodeType: 'service', layer: 'application', moduleType: 'application' },
  { nodeType: 'controller', layer: 'application', moduleType: 'application' },
  { nodeType: 'facade', layer: 'application', moduleType: 'application' },
  { nodeType: 'coordinator', layer: 'application', moduleType: 'application' },
  
  // 领域层
  { nodeType: 'entity', layer: 'domain', moduleType: 'domain' },
  { nodeType: 'aggregate', layer: 'domain', moduleType: 'domain' },
  { nodeType: 'value-object', layer: 'domain', moduleType: 'domain' },
  { nodeType: 'repository', layer: 'domain', moduleType: 'domain' },
  { nodeType: 'domain-service', layer: 'domain', moduleType: 'domain' },
  
  // 基础设施层
  { nodeType: 'database', layer: 'infrastructure', moduleType: 'infrastructure' },
  { nodeType: 'table', layer: 'infrastructure', moduleType: 'infrastructure' },
  { nodeType: 'repository-impl', layer: 'infrastructure', moduleType: 'infrastructure' },
  { nodeType: 'external-service', layer: 'infrastructure', moduleType: 'infrastructure' },
  { nodeType: 'message-queue', layer: 'infrastructure', moduleType: 'infrastructure' },
  { nodeType: 'cache', layer: 'infrastructure', moduleType: 'infrastructure' },
]

/**
 * 层级依赖规则（允许上层依赖下层）
 */
export const layerDependencyRules: Record<ModuleLayer, ModuleLayer[]> = {
  presentation: ['application', 'domain', 'infrastructure'],
  application: ['domain', 'infrastructure'],
  domain: ['infrastructure'],
  infrastructure: [], // 基础设施层不应依赖其他层
}

/**
 * 获取节点的层级
 */
export function getNodeLayer(nodeType: string): ModuleLayer | null {
  const mapping = defaultLayerMappings.find(m => m.nodeType === nodeType)
  return mapping ? mapping.layer : null
}

/**
 * 获取节点的模块类型
 */
export function getNodeModuleType(nodeType: string): ModuleType | null {
  const mapping = defaultLayerMappings.find(m => m.nodeType === nodeType)
  return mapping ? mapping.moduleType : null
}

/**
 * 验证层级依赖规则
 */
export function validateLayerDependencies(
  nodes: Node[],
  edges: Edge[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modules: ModuleConfig[]
): ValidationResult {
  const details: ValidationResult['details'] = []
  let isValid = true

  // 创建节点 ID 到层级的映射
  const nodeLayerMap = new Map<string, ModuleLayer>()
  nodes.forEach(node => {
    const layer = getNodeLayer(node.type || 'component')
    if (layer) {
      nodeLayerMap.set(node.id, layer)
    }
  })

  // 检查每条边的依赖关系
  edges.forEach(edge => {
    const sourceLayer = nodeLayerMap.get(edge.source)
    const targetLayer = nodeLayerMap.get(edge.target)

    if (sourceLayer && targetLayer) {
      const allowedLayers = layerDependencyRules[sourceLayer]
      
      // 如果目标层级不在允许列表中，则是违规
      if (!allowedLayers.includes(targetLayer)) {
        isValid = false
        details.push({
          nodeId: edge.id,
          severity: 'error',
          message: `层级依赖违规：${sourceLayer} 层的节点不能依赖 ${targetLayer} 层的节点`,
          suggestion: `请确保依赖关系遵循：展示层 → 应用层 → 领域层 → 基础设施层`,
        })
      }
    }
  })

  return {
    isValid,
    ruleId: 'layer-dependency',
    ruleName: '层级依赖规则',
    message: isValid ? '所有层级依赖关系均符合规范' : `发现 ${details.length} 处层级依赖违规`,
    details,
  }
}

/**
 * 验证同一层级内的依赖
 */
export function validateIntraLayerDependencies(
  nodes: Node[],
  edges: Edge[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modules: ModuleConfig[]
): ValidationResult {
  const details: ValidationResult['details'] = []
  const isValid = true

  // 创建节点 ID 到层级的映射
  const nodeLayerMap = new Map<string, ModuleLayer>()
  nodes.forEach(node => {
    const layer = getNodeLayer(node.type || 'component')
    if (layer) {
      nodeLayerMap.set(node.id, layer)
    }
  })

  // 检查同一层级内的依赖
  edges.forEach(edge => {
    const sourceLayer = nodeLayerMap.get(edge.source)
    const targetLayer = nodeLayerMap.get(edge.target)

    if (sourceLayer && targetLayer && sourceLayer === targetLayer) {
      // 同一层级内的依赖通常是允许的，但可以添加警告
      details.push({
        nodeId: edge.id,
        severity: 'info',
        message: `同一层级内的依赖：${sourceLayer} 层内部存在依赖关系`,
        suggestion: '确保同一层级内的依赖不会导致循环依赖',
      })
    }
  })

  return {
    isValid,
    ruleId: 'intra-layer-dependency',
    ruleName: '同层依赖检查',
    message: `发现 ${details.length} 处同层依赖`,
    details,
  }
}

/**
 * 验证层级完整性
 */
export function validateLayerCompleteness(
  nodes: Node[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  edges: Edge[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modules: ModuleConfig[]
): ValidationResult {
  const details: ValidationResult['details'] = []
  let isValid = true

  // 统计每个层级的节点数量
  const layerCounts: Record<ModuleLayer, number> = {
    presentation: 0,
    application: 0,
    domain: 0,
    infrastructure: 0,
  }

  nodes.forEach(node => {
    const layer = getNodeLayer(node.type || 'component')
    if (layer) {
      layerCounts[layer]++
    }
  })

  // 检查是否有缺失的层级
  const layers = Object.keys(layerCounts) as ModuleLayer[]
  layers.forEach(layer => {
    if (layerCounts[layer] === 0) {
      details.push({
        severity: 'warning',
        message: `架构中缺少 ${layer} 层的节点`,
        suggestion: `考虑添加 ${layer} 层的组件以完善架构`,
      })
    }
  })

  // 检查是否只有单一层级
  const nonEmptyLayers = layers.filter(layer => layerCounts[layer] > 0)
  if (nonEmptyLayers.length === 1) {
    isValid = false
    details.push({
      severity: 'error',
      message: '架构设计只包含单一层级，不符合分层架构原则',
      suggestion: '建议采用分层架构设计，至少包含 2-3 个层级',
    })
  }

  return {
    isValid,
    ruleId: 'layer-completeness',
    ruleName: '层级完整性检查',
    message: isValid ? '架构层级完整' : '架构层级不完整',
    details,
  }
}

/**
 * 验证跨层跳跃（跳过中间层）
 */
export function validateLayerSkipping(
  nodes: Node[],
  edges: Edge[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modules: ModuleConfig[]
): ValidationResult {
  const details: ValidationResult['details'] = []
  const isValid = true

  // 定义层级顺序
  const layerOrder: ModuleLayer[] = [
    'presentation',
    'application',
    'domain',
    'infrastructure',
  ]

  // 创建节点 ID 到层级的映射
  const nodeLayerMap = new Map<string, ModuleLayer>()
  nodes.forEach(node => {
    const layer = getNodeLayer(node.type || 'component')
    if (layer) {
      nodeLayerMap.set(node.id, layer)
    }
  })

  // 检查是否有跨层跳跃
  edges.forEach(edge => {
    const sourceLayer = nodeLayerMap.get(edge.source)
    const targetLayer = nodeLayerMap.get(edge.target)

    if (sourceLayer && targetLayer) {
      const sourceIndex = layerOrder.indexOf(sourceLayer)
      const targetIndex = layerOrder.indexOf(targetLayer)

      // 如果是向下依赖（sourceIndex < targetIndex）
      if (sourceIndex < targetIndex) {
        const skippedLayers = targetIndex - sourceIndex - 1
        if (skippedLayers > 0) {
          details.push({
            nodeId: edge.id,
            severity: 'warning',
            message: `跨层跳跃：${sourceLayer} 层直接依赖 ${targetLayer} 层，跳过了 ${skippedLayers} 个中间层`,
            suggestion: '建议通过中间层进行依赖，保持清晰的层级边界',
          })
        }
      }
    }
  })

  return {
    isValid,
    ruleId: 'layer-skipping',
    ruleName: '跨层跳跃检查',
    message: details.length === 0 ? '未发现跨层跳跃' : `发现 ${details.length} 处跨层跳跃`,
    details,
  }
}

/**
 * 验证模块层级分配
 */
export function validateModuleLayerAssignment(
  modules: ModuleConfig[]
): ValidationResult {
  const details: ValidationResult['details'] = []
  let isValid = true

  modules.forEach(module => {
    // 检查模块类型和层级是否匹配
    const typeLayerCompatibility: Record<ModuleType, ModuleLayer[]> = {
      core: ['application', 'domain'],
      feature: ['application', 'domain'],
      shared: ['presentation', 'application', 'domain', 'infrastructure'],
      infrastructure: ['infrastructure'],
      api: ['application'],
      ui: ['presentation'],
      domain: ['domain'],
      application: ['application'],
    }

    const allowedLayers = typeLayerCompatibility[module.type]
    if (!allowedLayers.includes(module.layer)) {
      isValid = false
      details.push({
        moduleName: module.name,
        severity: 'error',
        message: `模块 "${module.name}" 的类型 (${module.type}) 与层级 (${module.layer}) 不匹配`,
        suggestion: `${module.type} 类型模块应该位于 ${allowedLayers.join(' 或 ')} 层`,
      })
    }
  })

  return {
    isValid,
    ruleId: 'module-layer-assignment',
    ruleName: '模块层级分配检查',
    message: isValid ? '所有模块的层级分配正确' : `发现 ${details.length} 处模块层级分配错误`,
    details,
  }
}

/**
 * 执行所有层级验证
 */
export function performLayerValidation(
  nodes: Node[],
  edges: Edge[],
  modules: ModuleConfig[]
): {
  overallValid: boolean
  results: ValidationResult[]
  summary: {
    errors: number
    warnings: number
    infos: number
  }
} {
  const rules: LayerValidationRule[] = [
    {
      id: 'layer-dependency',
      name: '层级依赖规则',
      description: '验证上层模块可以依赖下层模块',
      validator: validateLayerDependencies,
    },
    {
      id: 'intra-layer-dependency',
      name: '同层依赖检查',
      description: '检查同一层级内的依赖关系',
      validator: validateIntraLayerDependencies,
    },
    {
      id: 'layer-completeness',
      name: '层级完整性检查',
      description: '验证架构包含完整的层级',
      validator: validateLayerCompleteness,
    },
    {
      id: 'layer-skipping',
      name: '跨层跳跃检查',
      description: '检查是否存在跨层跳跃依赖',
      validator: validateLayerSkipping,
    },
    {
      id: 'module-layer-assignment',
      name: '模块层级分配检查',
      description: '验证模块的类型和层级匹配',
      validator: () => validateModuleLayerAssignment(modules),
    },
  ]

  const results = rules.map(rule => rule.validator(nodes, edges, modules))

  const summary = {
    errors: 0,
    warnings: 0,
    infos: 0,
  }

  results.forEach(result => {
    result.details.forEach(detail => {
      if (detail.severity === 'error') summary.errors++
      else if (detail.severity === 'warning') summary.warnings++
      else if (detail.severity === 'info') summary.infos++
    })
  })

  return {
    overallValid: summary.errors === 0,
    results,
    summary,
  }
}

/**
 * 生成层级验证报告
 */
export function generateLayerValidationReport(
  nodes: Node[],
  edges: Edge[],
  modules: ModuleConfig[]
): string {
  const { overallValid, results, summary } = performLayerValidation(
    nodes,
    edges,
    modules
  )

  let report = `# 层级验证报告\n\n`
  report += `## 总体结果\n`
  report += overallValid ? '✅ 验证通过\n\n' : '❌ 验证失败\n\n'
  report += `- 错误：${summary.errors}\n`
  report += `- 警告：${summary.warnings}\n`
  report += `- 提示：${summary.infos}\n\n`

  report += `## 详细结果\n\n`

  results.forEach(result => {
    report += `### ${result.ruleName}\n`
    report += result.message + '\n\n'

    if (result.details.length > 0) {
      result.details.forEach((detail, index) => {
        const icon = detail.severity === 'error' ? '❌' : detail.severity === 'warning' ? '⚠️' : 'ℹ️'
        report += `${icon} **${index + 1}.** ${detail.message}\n`
        if (detail.suggestion) {
          report += `   💡 建议：${detail.suggestion}\n`
        }
        report += '\n'
      })
    }
  })

  return report
}

export default {
  getNodeLayer,
  getNodeModuleType,
  validateLayerDependencies,
  validateIntraLayerDependencies,
  validateLayerCompleteness,
  validateLayerSkipping,
  validateModuleLayerAssignment,
  performLayerValidation,
  generateLayerValidationReport,
  defaultLayerMappings,
  layerDependencyRules,
}
