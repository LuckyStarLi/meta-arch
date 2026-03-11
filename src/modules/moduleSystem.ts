/**
 * 模块定义系统
 * 用于定义和管理架构中的模块，支持模块化的系统设计
 */

/**
 * 模块类型定义
 */
export type ModuleType =
  | 'core'          // 核心模块
  | 'feature'       // 功能模块
  | 'shared'        // 共享模块
  | 'infrastructure' // 基础设施模块
  | 'api'          // API 模块
  | 'ui'           // UI 模块
  | 'domain'       // 领域模块
  | 'application'  // 应用模块

/**
 * 模块层级
 */
export type ModuleLayer =
  | 'presentation'    // 展示层
  | 'application'     // 应用层
  | 'domain'         // 领域层
  | 'infrastructure'  // 基础设施层

/**
 * 模块依赖关系
 */
export interface ModuleDependency {
  moduleId: string
  type: 'required' | 'optional' | 'dev'
  version?: string
}

/**
 * 模块导出定义
 */
export interface ModuleExport {
  name: string
  type: 'component' | 'service' | 'hook' | 'utility' | 'type' | 'constant'
  path: string
  description?: string
}

/**
 * 模块配置接口
 */
export interface ModuleConfig {
  id: string
  name: string
  type: ModuleType
  layer: ModuleLayer
  description: string
  version: string
  author?: string
  dependencies: ModuleDependency[]
  exports: ModuleExport[]
  tags?: string[]
  // 模块容器功能 - 包含的节点 IDs
  nodeIds?: string[]
  // 模块在画布上的位置和大小
  position?: {
    x: number
    y: number
  }
  size?: {
    width: number
    height: number
  }
  // 模块是否展开
  isCollapsed?: boolean
  metadata?: {
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
  }
}

/**
 * 模块边界规则
 */
export interface ModuleBoundaryRule {
  id: string
  name: string
  description: string
  allowedDependencies: Record<ModuleType, ModuleType[]>
  enforced: boolean
}

/**
 * 模块验证结果
 */
export interface ModuleValidationResult {
  isValid: boolean
  moduleId: string
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * 模块依赖图
 */
export interface ModuleDependencyGraph {
  nodes: Map<string, ModuleConfig>
  edges: Map<string, Set<string>>
}

/**
 * 预定义的模块边界规则
 */
export const defaultBoundaryRules: ModuleBoundaryRule[] = [
  {
    id: 'layer-dependency',
    name: '层级依赖规则',
    description: '上层模块可以依赖下层模块，下层模块不应依赖上层模块',
    allowedDependencies: {
      core: ['infrastructure'],
      feature: ['core', 'shared', 'infrastructure'],
      shared: ['core', 'infrastructure'],
      infrastructure: [],
      api: ['core', 'domain', 'infrastructure'],
      ui: ['core', 'shared', 'ui'],
      domain: ['core', 'infrastructure'],
      application: ['domain', 'core', 'infrastructure'],
    },
    enforced: true,
  },
  {
    id: 'circular-dependency',
    name: '循环依赖检测',
    description: '禁止模块间的循环依赖',
    allowedDependencies: {
      core: [],
      feature: [],
      shared: [],
      infrastructure: [],
      api: [],
      ui: [],
      domain: [],
      application: [],
    },
    enforced: true,
  },
]

/**
 * 创建模块配置
 */
export function createModuleConfig(
  name: string,
  type: ModuleType,
  layer: ModuleLayer,
  overrides?: Partial<ModuleConfig>
): ModuleConfig {
  const baseConfig: ModuleConfig = {
    id: generateModuleId(),
    name,
    type,
    layer,
    description: '',
    version: '1.0.0',
    dependencies: [],
    exports: [],
    tags: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  if (overrides) {
    Object.assign(baseConfig, overrides)
  }

  return baseConfig
}

/**
 * 生成模块 ID
 */
function generateModuleId(): string {
  return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 添加模块依赖
 */
export function addModuleDependency(
  config: ModuleConfig,
  moduleId: string,
  type: 'required' | 'optional' | 'dev' = 'required',
  version?: string
): ModuleConfig {
  // 检查是否已存在
  const exists = config.dependencies.some(dep => dep.moduleId === moduleId)
  if (exists) {
    throw new Error(`模块 ${moduleId} 已存在于依赖列表中`)
  }

  return {
    ...config,
    dependencies: [
      ...config.dependencies,
      { moduleId, type, version },
    ],
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 移除模块依赖
 */
export function removeModuleDependency(
  config: ModuleConfig,
  moduleId: string
): ModuleConfig {
  return {
    ...config,
    dependencies: config.dependencies.filter(
      dep => dep.moduleId !== moduleId
    ),
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 添加模块导出
 */
export function addModuleExport(
  config: ModuleConfig,
  exportItem: ModuleExport
): ModuleConfig {
  return {
    ...config,
    exports: [...config.exports, exportItem],
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 验证模块配置
 */
export function validateModuleConfig(config: ModuleConfig): ModuleValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // 必填字段检查
  if (!config.id) errors.push('缺少模块 ID')
  if (!config.name) errors.push('缺少模块名称')
  if (!config.type) errors.push('缺少模块类型')
  if (!config.layer) errors.push('缺少模块层级')
  if (!config.description) warnings.push('建议添加模块描述')
  if (config.dependencies.length === 0) warnings.push('模块没有任何依赖')
  if (config.exports.length === 0) warnings.push('模块没有任何导出')

  // 命名规范检查
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(config.name)) {
    errors.push(`模块名称 "${config.name}" 不符合命名规范`)
  }

  // 版本号检查
  if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
    warnings.push(`版本号 "${config.version}" 建议遵循 semver 规范 (x.y.z)`)
  }

  // 依赖检查
  const dependencyIds = config.dependencies.map(d => d.moduleId)
  const uniqueIds = new Set(dependencyIds)
  if (uniqueIds.size !== dependencyIds.length) {
    errors.push('存在重复的模块依赖')
  }

  // 导出检查
  const exportNames = config.exports.map(e => e.name)
  const uniqueExports = new Set(exportNames)
  if (uniqueExports.size !== exportNames.length) {
    errors.push('存在重复的模块导出')
  }

  // 建议
  if (!config.tags || config.tags.length === 0) {
    suggestions.push('建议添加标签以便更好地分类和搜索')
  }

  if (!config.author) {
    suggestions.push('建议添加作者信息')
  }

  return {
    isValid: errors.length === 0,
    moduleId: config.id,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * 构建模块依赖图
 */
export function buildDependencyGraph(
  modules: ModuleConfig[]
): ModuleDependencyGraph {
  const nodes = new Map<string, ModuleConfig>()
  const edges = new Map<string, Set<string>>()

  // 添加所有节点
  modules.forEach(module => {
    nodes.set(module.id, module)
    edges.set(module.id, new Set())
  })

  // 添加边
  modules.forEach(module => {
    const moduleEdges = edges.get(module.id)!
    module.dependencies.forEach(dep => {
      if (nodes.has(dep.moduleId)) {
        moduleEdges.add(dep.moduleId)
      }
    })
  })

  return {
    nodes,
    edges,
  }
}

/**
 * 检测循环依赖
 */
export function detectCircularDependencies(
  graph: ModuleDependencyGraph
): string[][] {
  const cycles: string[][] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const path: string[] = []

  function dfs(moduleId: string): void {
    if (recursionStack.has(moduleId)) {
      // 找到循环
      const cycleStart = path.indexOf(moduleId)
      const cycle = path.slice(cycleStart)
      cycles.push(cycle)
      return
    }

    if (visited.has(moduleId)) {
      return
    }

    visited.add(moduleId)
    recursionStack.add(moduleId)
    path.push(moduleId)

    const neighbors = graph.edges.get(moduleId) || new Set()
    neighbors.forEach(neighborId => {
      dfs(neighborId)
    })

    path.pop()
    recursionStack.delete(moduleId)
  }

  graph.nodes.forEach((_, moduleId) => {
    if (!visited.has(moduleId)) {
      dfs(moduleId)
    }
  })

  return cycles
}

/**
 * 验证模块依赖规则
 */
export function validateModuleDependencies(
  config: ModuleConfig,
  allModules: ModuleConfig[],
  rules: ModuleBoundaryRule[] = defaultBoundaryRules
): ModuleValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const moduleMap = new Map(allModules.map(m => [m.id, m]))

  // 检查每个依赖
  config.dependencies.forEach(dep => {
    const targetModule = moduleMap.get(dep.moduleId)
    if (!targetModule) {
      errors.push(`依赖的模块 ${dep.moduleId} 不存在`)
      return
    }

    // 检查层级依赖规则
    const layerRule = rules.find(r => r.id === 'layer-dependency')
    if (layerRule && layerRule.enforced) {
      const allowedTypes = layerRule.allowedDependencies[config.type] || []
      if (!allowedTypes.includes(targetModule.type)) {
        errors.push(
          `模块 ${config.name} (${config.type}) 不允许依赖模块 ${targetModule.name} (${targetModule.type})`
        )
      }
    }
  })

  return {
    isValid: errors.length === 0,
    moduleId: config.id,
    errors,
    warnings,
    suggestions: [],
  }
}

/**
 * 获取模块的传递依赖
 */
export function getTransitiveDependencies(
  moduleId: string,
  graph: ModuleDependencyGraph,
  visited: Set<string> = new Set()
): string[] {
  if (visited.has(moduleId)) {
    return []
  }

  visited.add(moduleId)
  const dependencies: string[] = []
  const directDeps = graph.edges.get(moduleId) || new Set()

  directDeps.forEach(depId => {
    dependencies.push(depId)
    const transitiveDeps = getTransitiveDependencies(depId, graph, visited)
    dependencies.push(...transitiveDeps)
  })

  // 去重
  return [...new Set(dependencies)]
}

/**
 * 获取模块依赖树
 */
export function getDependencyTree(
  moduleId: string,
  graph: ModuleDependencyGraph,
  depth: number = 0,
  visited: Set<string> = new Set()
): {
  moduleId: string
  depth: number
  children: Array<{ moduleId: string; depth: number }>
} {
  if (visited.has(moduleId)) {
    return { moduleId, depth, children: [] }
  }

  visited.add(moduleId)
  const directDeps = graph.edges.get(moduleId) || new Set()
  const children = Array.from(directDeps).map(depId =>
    getDependencyTree(depId, graph, depth + 1, new Set(visited))
  )

  return {
    moduleId,
    depth,
    children,
  }
}

/**
 * 拓扑排序模块（用于构建顺序）
 */
export function topologicalSortModules(
  graph: ModuleDependencyGraph
): string[] {
  const sorted: string[] = []
  const visited = new Set<string>()
  const tempVisited = new Set<string>()

  function visit(moduleId: string): boolean {
    if (tempVisited.has(moduleId)) {
      return false // 循环依赖
    }
    if (visited.has(moduleId)) {
      return true
    }

    tempVisited.add(moduleId)
    const neighbors = graph.edges.get(moduleId) || new Set()

    for (const neighborId of neighbors) {
      if (!visit(neighborId)) {
        return false
      }
    }

    tempVisited.delete(moduleId)
    visited.add(moduleId)
    sorted.push(moduleId)
    return true
  }

  graph.nodes.forEach((_, moduleId) => {
    if (!visited.has(moduleId)) {
      visit(moduleId)
    }
  })

  return sorted
}

/**
 * 导出模块配置为 JSON
 */
export function exportModuleAsJSON(config: ModuleConfig): string {
  return JSON.stringify(config, null, 2)
}

/**
 * 从 JSON 导入模块配置
 */
export function importModuleFromJSON(json: string): ModuleConfig {
  return JSON.parse(json) as ModuleConfig
}

/**
 * 添加节点到模块
 */
export function addNodeToModule(
  config: ModuleConfig,
  nodeId: string
): ModuleConfig {
  const nodeIds = config.nodeIds || []
  if (nodeIds.includes(nodeId)) {
    return config // 节点已在模块中
  }
  
  return {
    ...config,
    nodeIds: [...nodeIds, nodeId],
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 从模块移除节点
 */
export function removeNodeFromModule(
  config: ModuleConfig,
  nodeId: string
): ModuleConfig {
  return {
    ...config,
    nodeIds: (config.nodeIds || []).filter(id => id !== nodeId),
    metadata: {
      ...config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 检查节点是否在模块内
 */
export function isNodeInModule(
  config: ModuleConfig,
  nodeId: string
): boolean {
  return (config.nodeIds || []).includes(nodeId)
}

/**
 * 获取模块的默认尺寸
 */
export function getModuleDefaultSize(type: ModuleType): { width: number; height: number } {
  const sizes: Record<ModuleType, { width: number; height: number }> = {
    core: { width: 600, height: 400 },
    feature: { width: 500, height: 350 },
    shared: { width: 450, height: 300 },
    infrastructure: { width: 500, height: 350 },
    api: { width: 450, height: 300 },
    ui: { width: 500, height: 350 },
    domain: { width: 550, height: 400 },
    application: { width: 500, height: 350 },
  }
  return sizes[type]
}

/**
 * 获取模块的颜色样式
 */
export function getModuleStyle(type: ModuleType): { border: string; background: string; header: string } {
  const styles: Record<ModuleType, { border: string; background: string; header: string }> = {
    core: { border: '#673ab7', background: '#f3e5f5', header: '#673ab7' },
    feature: { border: '#2196f3', background: '#e3f2fd', header: '#1976d2' },
    shared: { border: '#4caf50', background: '#e8f5e9', header: '#388e3c' },
    infrastructure: { border: '#ff9800', background: '#fff3e0', header: '#f57c00' },
    api: { border: '#00bcd4', background: '#e0f7fa', header: '#0097a7' },
    ui: { border: '#e91e63', background: '#fce4ec', header: '#c2185b' },
    domain: { border: '#9c27b0', background: '#f3e5f5', header: '#7b1fa2' },
    application: { border: '#3f51b5', background: '#e8eaf6', header: '#303f9f' },
  }
  return styles[type]
}

export default {
  createModuleConfig,
  addModuleDependency,
  removeModuleDependency,
  addModuleExport,
  validateModuleConfig,
  buildDependencyGraph,
  detectCircularDependencies,
  validateModuleDependencies,
  getTransitiveDependencies,
  getDependencyTree,
  topologicalSortModules,
  exportModuleAsJSON,
  importModuleFromJSON,
  addNodeToModule,
  removeNodeFromModule,
  isNodeInModule,
  getModuleDefaultSize,
  getModuleStyle,
  defaultBoundaryRules,
}
