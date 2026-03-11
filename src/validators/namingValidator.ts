/**
 * 命名规范验证器
 * 用于验证和标准化节点、字段、变量等的命名
 * 确保命名符合最佳实践和团队规范
 */

export interface NamingRule {
  id: string
  name: string
  pattern: RegExp
  description: string
  suggestion?: (input: string) => string
}

export interface NamingValidationResult {
  isValid: boolean
  rule?: NamingRule
  message: string
  suggestions: string[]
}

export type NamingConvention =
  | 'PascalCase'
  | 'camelCase'
  | 'snake_case'
  | 'kebab-case'
  | 'UPPER_CASE'
  | 'CONSTANT_CASE'

/**
 * 命名规则定义
 */
export const namingRules: Record<NamingConvention, NamingRule> = {
  PascalCase: {
    id: 'pascal-case',
    name: 'PascalCase',
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: '大驼峰命名，适用于类名、组件名、接口名',
    suggestion: (input: string) => {
      if (!input) return input
      return input
        .split(/[_-\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')
    },
  },
  camelCase: {
    id: 'camel-case',
    name: 'camelCase',
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: '小驼峰命名，适用于变量名、函数名、方法名',
    suggestion: (input: string) => {
      if (!input) return input
      const parts = input.split(/[_-\s]+/)
      return (
        parts[0].toLowerCase() +
        parts
          .slice(1)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('')
      )
    },
  },
  snake_case: {
    id: 'snake-case',
    name: 'snake_case',
    pattern: /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/,
    description: '下划线命名，适用于数据库字段、配置文件',
    suggestion: (input: string) => {
      if (!input) return input
      return input
        .split(/[_-\s]+/)
        .map(word => word.toLowerCase())
        .join('_')
    },
  },
  'kebab-case': {
    id: 'kebab-case',
    name: 'kebab-case',
    pattern: /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    description: '短横线命名，适用于 URL、CSS 类名、文件名',
    suggestion: (input: string) => {
      if (!input) return input
      return input
        .split(/[_-\s]+/)
        .map(word => word.toLowerCase())
        .join('-')
    },
  },
  UPPER_CASE: {
    id: 'upper-case',
    name: 'UPPER_CASE',
    pattern: /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/,
    description: '大写命名，适用于常量、枚举值',
    suggestion: (input: string) => {
      if (!input) return input
      return input
        .split(/[_-\s]+/)
        .map(word => word.toUpperCase())
        .join('_')
    },
  },
  CONSTANT_CASE: {
    id: 'constant-case',
    name: 'CONSTANT_CASE',
    pattern: /^[A-Z_][A-Z0-9_]*$/,
    description: '常量命名，适用于全局常量、配置项',
    suggestion: (input: string) => {
      if (!input) return input
      return input
        .split(/[_-\s]+/)
        .map(word => word.toUpperCase())
        .join('_')
    },
  },
}

/**
 * 节点类型命名规则映射
 */
export const nodeTypeNamingRules: Record<string, NamingConvention> = {
  // 架构组件
  component: 'PascalCase',
  service: 'PascalCase',
  controller: 'PascalCase',
  repository: 'PascalCase',
  model: 'PascalCase',
  interface: 'PascalCase',
  module: 'PascalCase',
  // 数据库相关
  table: 'snake_case',
  database: 'snake_case',
  view: 'snake_case',
  index: 'snake_case',
  // API 相关
  endpoint: 'kebab-case',
  route: 'kebab-case',
  // 变量和配置
  variable: 'camelCase',
  config: 'camelCase',
  constant: 'CONSTANT_CASE',
  env: 'UPPER_CASE',
}

/**
 * 验证命名是否符合指定规则
 */
export function validateNaming(
  input: string,
  convention: NamingConvention
): NamingValidationResult {
  const rule = namingRules[convention]
  const isValid = rule.pattern.test(input)

  const suggestions: string[] = []
  if (!isValid && rule.suggestion) {
    const suggested = rule.suggestion(input)
    if (suggested !== input && rule.pattern.test(suggested)) {
      suggestions.push(suggested)
    }

    // 生成多个变体建议
    const variants = generateNamingVariants(input, convention)
    suggestions.push(...variants.slice(0, 3))
  }

  return {
    isValid,
    rule: isValid ? rule : undefined,
    message: isValid
      ? `命名 "${input}" 符合 ${rule.name} 规范`
      : `命名 "${input}" 不符合 ${rule.name} 规范`,
    suggestions,
  }
}

/**
 * 根据节点类型自动验证命名
 */
export function validateNodeNaming(
  nodeType: string,
  nodeName: string
): NamingValidationResult {
  const convention = nodeTypeNamingRules[nodeType] || 'PascalCase'
  return validateNaming(nodeName, convention)
}

/**
 * 生成命名变体建议
 */
function generateNamingVariants(
  input: string,
  targetConvention: NamingConvention
): string[] {
  const variants: string[] = []

  // 提取单词
  const words = input
    .split(/[_-\s]+/)
    .filter(word => word.length > 0)
    .map(word => word.toLowerCase())

  if (words.length === 0) return variants

  switch (targetConvention) {
    case 'PascalCase':
      variants.push(
        words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
      )
      break
    case 'camelCase':
      variants.push(
        words[0].toLowerCase() +
          words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
      )
      break
    case 'snake_case':
      variants.push(words.join('_'))
      break
    case 'kebab-case':
      variants.push(words.join('-'))
      break
    case 'UPPER_CASE':
    case 'CONSTANT_CASE':
      variants.push(words.map(word => word.toUpperCase()).join('_'))
      break
  }

  return variants
}

/**
 * 智能建议：分析输入并推荐最合适的命名规范
 */
export function suggestNamingConvention(input: string): {
  recommended: NamingConvention
  confidence: number
  alternatives: Array<{ convention: NamingConvention; score: number }>
} {
  const scores: Record<NamingConvention, number> = {
    PascalCase: 0,
    camelCase: 0,
    snake_case: 0,
    'kebab-case': 0,
    UPPER_CASE: 0,
    CONSTANT_CASE: 0,
  }

  // 分析输入特征
  const hasUpperCase = /[A-Z]/.test(input)
  const hasLowerCase = /[a-z]/.test(input)
  const hasUnderscore = /_/.test(input)
  const hasHyphen = /-/.test(input)
  const isAllUpper = input === input.toUpperCase()
  const startsWithUpper = /^[A-Z]/.test(input)

  // 评分逻辑
  if (startsWithUpper && hasLowerCase && !hasUnderscore && !hasHyphen) {
    scores.PascalCase += 10
  }

  if (!startsWithUpper && hasLowerCase && hasUpperCase && !hasUnderscore && !hasHyphen) {
    scores.camelCase += 10
  }

  if (hasLowerCase && hasUnderscore && !hasUpperCase) {
    scores.snake_case += 10
  }

  if (hasLowerCase && hasHyphen && !hasUpperCase) {
    scores['kebab-case'] += 10
  }

  if (isAllUpper && (hasUnderscore || input.length > 3)) {
    scores.CONSTANT_CASE += 10
    scores.UPPER_CASE += 8
  }

  // 排序
  const sorted = (Object.keys(scores) as NamingConvention[])
    .map(convention => ({
      convention,
      score: scores[convention],
    }))
    .sort((a, b) => b.score - a.score)

  const totalScore = sorted.reduce((sum, item) => sum + item.score, 0)

  return {
    recommended: sorted[0].convention,
    confidence: totalScore > 0 ? (sorted[0].score / totalScore) * 100 : 0,
    alternatives: sorted.slice(1, 4).filter(item => item.score > 0),
  }
}

/**
 * 批量验证命名
 */
export function batchValidateNaming(
  items: Array<{ name: string; type?: string }>
): Array<{
  name: string
  type?: string
  result: NamingValidationResult
}> {
  return items.map(item => ({
    name: item.name,
    type: item.type,
    result: item.type
      ? validateNodeNaming(item.type, item.name)
      : validateNaming(item.name, 'PascalCase'),
  }))
}

export default {
  validateNaming,
  validateNodeNaming,
  suggestNamingConvention,
  batchValidateNaming,
  namingRules,
  nodeTypeNamingRules,
}
