/**
 * 依赖管理系统
 * 管理模块间的依赖关系，包括依赖解析、版本冲突检测等
 */

import type { ModuleConfig, ModuleDependencyGraph } from './moduleSystem'

/**
 * 依赖解析结果
 */
export interface DependencyResolution {
  moduleId: string
  resolved: boolean
  version: string
  dependencies: DependencyResolution[]
  conflicts: DependencyConflict[]
}

/**
 * 依赖冲突
 */
export interface DependencyConflict {
  moduleId: string
  conflictingVersions: string[]
  requiredBy: string[]
  severity: 'error' | 'warning'
  suggestion?: string
}

/**
 * 依赖版本范围
 */
export interface VersionRange {
  min?: string
  max?: string
  exact?: string
  pattern?: string
}

/**
 * 依赖图节点
 */
export interface DependencyNode {
  id: string
  version: string
  depth: number
  parent?: string
  children: string[]
}

/**
 * 解析版本范围
 */
export function parseVersionRange(range: string): VersionRange {
  // 支持多种版本格式：
  // "1.0.0" - 精确版本
  // "^1.0.0" - 兼容版本（>=1.0.0 <2.0.0）
  // "~1.0.0" - 近似版本（>=1.0.0 <1.1.0）
  // ">=1.0.0" - 最小版本
  // "<=2.0.0" - 最大版本
  // "1.0.0 - 2.0.0" - 版本范围

  const exactMatch = range.match(/^(\d+\.\d+\.\d+)$/)
  if (exactMatch) {
    return { exact: exactMatch[1] }
  }

  const caretMatch = range.match(/^\^(\d+\.\d+\.\d+)$/)
  if (caretMatch) {
    const [major] = caretMatch[1].split('.').map(Number)
    return {
      min: caretMatch[1],
      max: `${major + 1}.0.0`,
    }
  }

  const tildeMatch = range.match(/^~(\d+\.\d+\.\d+)$/)
  if (tildeMatch) {
    const [major, minor] = tildeMatch[1].split('.').map(Number)
    return {
      min: tildeMatch[1],
      max: `${major}.${minor + 1}.0`,
    }
  }

  const rangeMatch = range.match(/^>=?\s*(\d+\.\d+\.\d+)\s*-?\s*<=?\s*(\d+\.\d+\.\d+)$/)
  if (rangeMatch) {
    return {
      min: rangeMatch[1],
      max: rangeMatch[2],
    }
  }

  return { pattern: range }
}

/**
 * 比较版本号
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0

    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }

  return 0
}

/**
 * 检查版本是否满足范围
 */
export function satisfiesVersionRange(version: string, range: VersionRange): boolean {
  if (range.exact) {
    return version === range.exact
  }

  if (range.pattern) {
    // 简单模式匹配
    const regex = new RegExp(range.pattern.replace(/\*/g, '.*'))
    return regex.test(version)
  }

  if (range.min && compareVersions(version, range.min) < 0) {
    return false
  }

  if (range.max && compareVersions(version, range.max) >= 0) {
    return false
  }

  return true
}

/**
 * 检测依赖冲突
 */
export function detectDependencyConflicts(
  modules: ModuleConfig[]
): DependencyConflict[] {
  const conflicts: DependencyConflict[] = []
  
  // 收集所有依赖及其版本
  const dependencyMap = new Map<string, Map<string, string[]>>()
  // moduleId -> version -> requiredBy[]

  modules.forEach(module => {
    module.dependencies.forEach(dep => {
      if (!dependencyMap.has(dep.moduleId)) {
        dependencyMap.set(dep.moduleId, new Map())
      }

      const versionMap = dependencyMap.get(dep.moduleId)!
      const version = dep.version || 'latest'

      if (!versionMap.has(version)) {
        versionMap.set(version, [])
      }

      versionMap.get(version)!.push(module.id)
    })
  })

  // 检查每个依赖是否有多个版本
  dependencyMap.forEach((versionMap, moduleId) => {
    if (versionMap.size > 1) {
      const versions = Array.from(versionMap.keys())
      const requiredBy = Array.from(versionMap.values()).flat()

      conflicts.push({
        moduleId,
        conflictingVersions: versions,
        requiredBy,
        severity: 'error',
        suggestion: `请统一模块 ${moduleId} 的版本，当前存在 ${versions.length} 个不同版本`,
      })
    }
  })

  return conflicts
}

/**
 * 解析模块依赖树
 */
export function resolveDependencyTree(
  moduleId: string,
  modules: ModuleConfig[],
  maxDepth: number = 10,
  currentDepth: number = 0,
  visited: Set<string> = new Set()
): DependencyResolution {
  // 防止循环依赖和过深递归
  if (currentDepth >= maxDepth || visited.has(moduleId)) {
    return {
      moduleId,
      resolved: false,
      version: 'circular',
      dependencies: [],
      conflicts: [],
    }
  }

  visited.add(moduleId)

  const module = modules.find(m => m.id === moduleId)
  if (!module) {
    return {
      moduleId,
      resolved: false,
      version: 'missing',
      dependencies: [],
      conflicts: [],
    }
  }

  const dependencies = module.dependencies.map(dep =>
    resolveDependencyTree(dep.moduleId, modules, maxDepth, currentDepth + 1, new Set(visited))
  )

  const conflicts = detectConflictsInTree(dependencies)

  return {
    moduleId,
    resolved: true,
    version: module.version,
    dependencies,
    conflicts,
  }
}

/**
 * 检测依赖树中的冲突
 */
function detectConflictsInTree(
  dependencies: DependencyResolution[]
): DependencyConflict[] {
  const conflicts: DependencyConflict[] = []
  const versionMap = new Map<string, Array<{ version: string; from: string }>>()

  dependencies.forEach(dep => {
    if (!versionMap.has(dep.moduleId)) {
      versionMap.set(dep.moduleId, [])
    }
    versionMap.get(dep.moduleId)!.push({
      version: dep.version,
      from: dep.moduleId,
    })

    // 递归检查子依赖
    const subConflicts = detectConflictsInTree(dep.dependencies)
    conflicts.push(...subConflicts)
  })

  // 检查当前层级的冲突
  versionMap.forEach((entries, moduleId) => {
    const uniqueVersions = new Set(entries.map(e => e.version))
    if (uniqueVersions.size > 1) {
      conflicts.push({
        moduleId,
        conflictingVersions: Array.from(uniqueVersions),
        requiredBy: entries.map(e => e.from),
        severity: 'error',
        suggestion: `统一 ${moduleId} 的版本`,
      })
    }
  })

  return conflicts
}

/**
 * 获取依赖图
 */
export function buildDependencyGraph(
  modules: ModuleConfig[]
): ModuleDependencyGraph {
  const nodes = new Map<string, ModuleConfig>()
  const edges = new Map<string, Set<string>>()

  modules.forEach(module => {
    nodes.set(module.id, module)
    edges.set(module.id, new Set())

    module.dependencies.forEach(dep => {
      const edgeSet = edges.get(module.id)!
      edgeSet.add(dep.moduleId)
    })
  })

  return { nodes, edges }
}

/**
 * 计算依赖深度
 */
export function calculateDependencyDepth(
  moduleId: string,
  modules: ModuleConfig[]
): number {
  const module = modules.find(m => m.id === moduleId)
  if (!module || module.dependencies.length === 0) {
    return 0
  }

  const depths = module.dependencies.map(dep =>
    calculateDependencyDepth(dep.moduleId, modules)
  )

  return 1 + Math.max(...depths)
}

/**
 * 获取所有传递依赖
 */
export function getAllTransitiveDependencies(
  moduleId: string,
  modules: ModuleConfig[]
): string[] {
  const allDeps = new Set<string>()
  const queue = [moduleId]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)

    const module = modules.find(m => m.id === currentId)
    if (!module) continue

    module.dependencies.forEach(dep => {
      if (!allDeps.has(dep.moduleId)) {
        allDeps.add(dep.moduleId)
        queue.push(dep.moduleId)
      }
    })
  }

  allDeps.delete(moduleId) // 移除自身
  return Array.from(allDeps)
}

/**
 * 获取依赖模块列表
 */
export function getDependentModules(
  moduleId: string,
  modules: ModuleConfig[]
): string[] {
  return modules
    .filter(m => m.dependencies.some(d => d.moduleId === moduleId))
    .map(m => m.id)
}

/**
 * 检查依赖是否满足
 */
export function checkDependencySatisfaction(
  module: ModuleConfig,
  availableModules: ModuleConfig[]
): {
  satisfied: boolean
  missing: string[]
  versionConflicts: Array<{
    moduleId: string
    required: string
    available: string
  }>
} {
  const missing: string[] = []
  const versionConflicts: Array<{
    moduleId: string
    required: string
    available: string
  }> = []

  const availableMap = new Map(availableModules.map(m => [m.id, m]))

  module.dependencies.forEach(dep => {
    const availableModule = availableMap.get(dep.moduleId)
    if (!availableModule) {
      missing.push(dep.moduleId)
      return
    }

    if (dep.version) {
      const range = parseVersionRange(dep.version)
      if (!satisfiesVersionRange(availableModule.version, range)) {
        versionConflicts.push({
          moduleId: dep.moduleId,
          required: dep.version,
          available: availableModule.version,
        })
      }
    }
  })

  return {
    satisfied: missing.length === 0 && versionConflicts.length === 0,
    missing,
    versionConflicts,
  }
}

/**
 * 优化依赖顺序（拓扑排序）
 */
export function optimizeDependencyOrder(
  modules: ModuleConfig[]
): ModuleConfig[] {
  const graph = buildDependencyGraph(modules)
  const sorted = topological(graph)
  
  // 根据排序结果重新排列模块
  const moduleMap = new Map(modules.map(m => [m.id, m]))
  return sorted.map(id => moduleMap.get(id)!).filter(Boolean)
}

/**
 * 拓扑排序
 */
function topological(graph: ModuleDependencyGraph): string[] {
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
 * 生成依赖报告
 */
export function generateDependencyReport(modules: ModuleConfig[]): string {
  const conflicts = detectDependencyConflicts(modules)
  const graph = buildDependencyGraph(modules)

  let report = `# 依赖管理报告\n\n`

  // 总体统计
  report += `## 总体统计\n\n`
  report += `- 模块总数：${modules.length}\n`
  report += `- 依赖冲突：${conflicts.length}\n`
  report += `- 最大依赖深度：${calculateMaxDepth(graph)}\n\n`

  // 冲突详情
  if (conflicts.length > 0) {
    report += `## 依赖冲突\n\n`
    conflicts.forEach((conflict, index) => {
      report += `### ${index + 1}. 模块 ${conflict.moduleId}\n`
      report += `- 冲突版本：${conflict.conflictingVersions.join(', ')}\n`
      report += `- 需求方：${conflict.requiredBy.join(', ')}\n`
      report += `- 严重程度：${conflict.severity === 'error' ? '❌ 错误' : '⚠️ 警告'}\n`
      if (conflict.suggestion) {
        report += `- 💡 建议：${conflict.suggestion}\n`
      }
      report += '\n'
    })
  } else {
    report += `## ✅ 无依赖冲突\n\n`
  }

  // 模块依赖列表
  report += `## 模块依赖列表\n\n`
  modules.forEach(module => {
    report += `### ${module.name} (${module.version})\n`
    if (module.dependencies.length === 0) {
      report += `- 无依赖\n`
    } else {
      module.dependencies.forEach(dep => {
        const versionInfo = dep.version ? `@${dep.version}` : ''
        const typeInfo = dep.type === 'optional' ? '(可选)' : dep.type === 'dev' ? '(开发)' : '(必需)'
        report += `- ${dep.moduleId} ${versionInfo} ${typeInfo}\n`
      })
    }
    report += '\n'
  })

  return report
}

/**
 * 计算最大依赖深度
 */
function calculateMaxDepth(graph: ModuleDependencyGraph): number {
  let maxDepth = 0

  function dfs(moduleId: string, depth: number, visited: Set<string>): void {
    if (visited.has(moduleId)) return
    visited.add(moduleId)

    maxDepth = Math.max(maxDepth, depth)

    const neighbors = graph.edges.get(moduleId) || new Set()
    neighbors.forEach(neighborId => {
      dfs(neighborId, depth + 1, new Set(visited))
    })
  }

  graph.nodes.forEach((_, moduleId) => {
    dfs(moduleId, 0, new Set())
  })

  return maxDepth
}

/**
 * 可视化依赖关系（ASCII 艺术）
 */
export function visualizeDependencies(
  moduleId: string,
  modules: ModuleConfig[],
  prefix: string = '',
  isLast: boolean = true,
  visited: Set<string> = new Set()
): string {
  if (visited.has(moduleId)) {
    return `${prefix}${isLast ? '└─' : '├─'} ${moduleId} (circular)\n`
  }

  visited.add(moduleId)
  const module = modules.find(m => m.id === moduleId)

  if (!module) {
    return `${prefix}${isLast ? '└─' : '├─'} ${moduleId} (missing)\n`
  }

  let result = `${prefix}${isLast ? '└─' : '├─'} ${module.name} (${module.version})\n`

  const children = module.dependencies
  children.forEach((child, index) => {
    const childIsLast = index === children.length - 1
    const newPrefix = prefix + (isLast ? '  ' : '│ ')
    result += visualizeDependencies(
      child.moduleId,
      modules,
      newPrefix,
      childIsLast,
      new Set(visited)
    )
  })

  return result
}

export default {
  parseVersionRange,
  compareVersions,
  satisfiesVersionRange,
  detectDependencyConflicts,
  resolveDependencyTree,
  buildDependencyGraph,
  calculateDependencyDepth,
  getAllTransitiveDependencies,
  getDependentModules,
  checkDependencySatisfaction,
  optimizeDependencyOrder,
  generateDependencyReport,
  visualizeDependencies,
}
