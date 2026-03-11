/**
 * 交互标注器
 * 为节点和连接添加交互行为标注，用于 AI 理解用户交互逻辑
 */

import { Node, Edge } from 'reactflow'

/**
 * 交互类型
 */
export type InteractionType =
  | 'click'           // 点击
  | 'hover'           // 悬停
  | 'focus'           // 聚焦
  | 'blur'            // 失焦
  | 'change'          // 变更
  | 'submit'          // 提交
  | 'keydown'         // 按键
  | 'scroll'          // 滚动
  | 'drag'            // 拖拽
  | 'drop'            // 放置
  | 'resize'          // 调整大小
  | 'select'          // 选择
  | 'double-click'    // 双击
  | 'context-menu'    // 右键菜单
  | 'touch'           // 触摸
  | 'swipe'           // 滑动
  | 'pinch'           // 捏合
  | 'voice'           // 语音
  | 'gesture'         // 手势

/**
 * 交互目标类型
 */
export type InteractionTargetType =
  | 'navigation'      // 导航
  | 'api'            // API 调用
  | 'state'          // 状态变更
  | 'modal'          // 模态框
  | 'notification'   // 通知
  | 'validation'     // 验证
  | 'animation'      // 动画
  | 'download'       // 下载
  | 'external'       // 外部链接
  | 'custom'         // 自定义

/**
 * 交互标注定义
 */
export interface InteractionAnnotation {
  id: string
  nodeId: string
  interactionType: InteractionType
  targetType: InteractionTargetType
  target?: string
  description?: string
  preconditions?: string[]
  postconditions?: string[]
  sideEffects?: string[]
  errorHandling?: {
    showError: boolean
    errorMessage?: string
    retryable?: boolean
  }
  accessibility?: {
    keyboardShortcut?: string
    ariaLabel?: string
    focusable?: boolean
  }
  performance?: {
    debounce?: number
    throttle?: number
    lazy?: boolean
  }
  metadata?: {
    createdAt?: string
    updatedAt?: string
    author?: string
  }
}

/**
 * 交互序列定义
 */
export interface InteractionSequence {
  id: string
  name: string
  description: string
  steps: Array<{
    order: number
    annotationId: string
    condition?: string
    parallel?: boolean
  }>
  loop?: {
    condition: string
    maxIterations?: number
  }
  branch?: {
    condition: string
    trueBranch: string
    falseBranch: string
  }
}

/**
 * 交互流程图节点
 */
export interface InteractionFlowNode {
  id: string
  type: 'start' | 'action' | 'decision' | 'parallel' | 'end'
  label: string
  annotationId?: string
  sequenceId?: string
  x: number
  y: number
  children?: string[]
}

/**
 * 交互流程图连接
 */
export interface InteractionFlowEdge {
  id: string
  source: string
  target: string
  label?: string
  condition?: string
}

/**
 * 交互流程图
 */
export interface InteractionFlowDiagram {
  id: string
  name: string
  description: string
  nodes: InteractionFlowNode[]
  edges: InteractionFlowEdge[]
  metadata?: {
    createdAt?: string
    updatedAt?: string
  }
}

/**
 * 创建交互标注
 */
export function createInteractionAnnotation(
  nodeId: string,
  interactionType: InteractionType,
  targetType: InteractionTargetType,
  overrides?: Partial<InteractionAnnotation>
): InteractionAnnotation {
  const baseAnnotation: InteractionAnnotation = {
    id: generateAnnotationId(),
    nodeId,
    interactionType,
    targetType,
    description: '',
    preconditions: [],
    postconditions: [],
    sideEffects: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  if (overrides) {
    Object.assign(baseAnnotation, overrides)
  }

  return baseAnnotation
}

/**
 * 创建交互序列
 */
export function createInteractionSequence(
  name: string,
  description: string,
  overrides?: Partial<InteractionSequence>
): InteractionSequence {
  const baseSequence: InteractionSequence = {
    id: generateSequenceId(),
    name,
    description,
    steps: [],
  }

  if (overrides) {
    Object.assign(baseSequence, overrides)
  }

  return baseSequence
}

/**
 * 添加序列步骤
 */
export function addSequenceStep(
  sequence: InteractionSequence,
  annotationId: string,
  order: number,
  condition?: string,
  parallel?: boolean
): InteractionSequence {
  return {
    ...sequence,
    steps: [
      ...sequence.steps,
      { order, annotationId, condition, parallel },
    ].sort((a, b) => a.order - b.order),
  }
}

/**
 * 从节点和边生成交互标注
 */
export function generateAnnotationsFromNodes(
  nodes: Node[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  edges: Edge[]
): InteractionAnnotation[] {
  const annotations: InteractionAnnotation[] = []

  nodes.forEach(node => {
    const nodeType = node.type || 'component'

    // 根据节点类型推断可能的交互
    if (nodeType === 'button' || nodeType === 'component') {
      annotations.push(
        createInteractionAnnotation(node.id, 'click', 'api', {
          description: `点击 ${node.data?.label || node.id} 触发 API 调用`,
        })
      )
    }

    if (nodeType === 'form' || nodeType === 'input') {
      annotations.push(
        createInteractionAnnotation(node.id, 'change', 'validation', {
          description: `输入变更时触发验证`,
        }),
        createInteractionAnnotation(node.id, 'submit', 'api', {
          description: `表单提交触发 API 调用`,
        })
      )
    }

    if (nodeType === 'link' || nodeType === 'navigation') {
      annotations.push(
        createInteractionAnnotation(node.id, 'click', 'navigation', {
          description: `点击导航到目标页面`,
        })
      )
    }

    if (nodeType === 'modal' || nodeType === 'dialog') {
      annotations.push(
        createInteractionAnnotation(node.id, 'click', 'modal', {
          description: `点击打开/关闭模态框`,
        })
      )
    }
  })

  return annotations
}

/**
 * 验证交互标注
 */
export function validateInteractionAnnotation(
  annotation: InteractionAnnotation,
  nodes: Node[]
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查节点是否存在
  const nodeExists = nodes.some(n => n.id === annotation.nodeId)
  if (!nodeExists) {
    errors.push(`标注引用的节点 ${annotation.nodeId} 不存在`)
  }

  // 检查必填字段
  if (!annotation.interactionType) {
    errors.push('缺少交互类型')
  }

  if (!annotation.targetType) {
    errors.push('缺少目标类型')
  }

  // 检查交互类型和目标类型的兼容性
  const compatibleTargets: Record<InteractionType, InteractionTargetType[]> = {
    click: ['navigation', 'api', 'modal', 'external', 'custom'],
    hover: ['animation', 'notification', 'custom'],
    focus: ['validation', 'animation', 'custom'],
    change: ['validation', 'api', 'state', 'custom'],
    submit: ['api', 'validation', 'navigation', 'custom'],
    keydown: ['navigation', 'api', 'state', 'custom'],
    scroll: ['animation', 'api', 'custom'],
    drag: ['state', 'custom'],
    drop: ['api', 'state', 'custom'],
    // ... 更多映射
  }

  const allowedTargets = compatibleTargets[annotation.interactionType] || []
  if (allowedTargets.length > 0 && !allowedTargets.includes(annotation.targetType)) {
    warnings.push(
      `交互类型 ${annotation.interactionType} 通常不与 ${annotation.targetType} 配合使用`
    )
  }

  // 检查可访问性
  if (!annotation.accessibility?.keyboardShortcut && annotation.interactionType === 'click') {
    warnings.push('建议为点击交互添加键盘快捷键')
  }

  if (!annotation.accessibility?.ariaLabel && annotation.interactionType === 'click') {
    warnings.push('建议为点击交互添加 ARIA 标签')
  }

  // 检查性能优化
  if (['change', 'scroll', 'keydown'].includes(annotation.interactionType)) {
    if (!annotation.performance?.debounce && !annotation.performance?.throttle) {
      warnings.push('建议为高频交互添加防抖或节流')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 生成交互流程图
 */
export function generateInteractionFlowDiagram(
  annotations: InteractionAnnotation[],
  sequences: InteractionSequence[]
): InteractionFlowDiagram {
  const nodes: InteractionFlowNode[] = []
  const edges: InteractionFlowEdge[] = []

  // 添加开始节点
  const startNode: InteractionFlowNode = {
    id: 'start',
    type: 'start',
    label: '开始',
    x: 0,
    y: 0,
  }
  nodes.push(startNode)

  const yOffset = 100

  // 为每个序列创建节点
  sequences.forEach((sequence, seqIndex) => {
    const sequenceNodes: string[] = []

    sequence.steps.forEach((step, stepIndex) => {
      const annotation = annotations.find(a => a.id === step.annotationId)
      if (!annotation) return

      const flowNode: InteractionFlowNode = {
        id: `step_${sequence.id}_${step.order}`,
        type: step.parallel ? 'parallel' : 'action',
        label: `${annotation.interactionType} → ${annotation.targetType}`,
        annotationId: step.annotationId,
        sequenceId: sequence.id,
        x: stepIndex * 200,
        y: yOffset + seqIndex * 300,
      }

      nodes.push(flowNode)
      sequenceNodes.push(flowNode.id)

      // 添加连接
      if (stepIndex === 0) {
        edges.push({
          id: `edge_start_${sequence.id}`,
          source: 'start',
          target: flowNode.id,
          label: sequence.name,
        })
      } else {
        const prevStep = sequence.steps[stepIndex - 1]
        if (prevStep) {
          edges.push({
            id: `edge_${sequence.id}_${prevStep.order}_${step.order}`,
            source: `step_${sequence.id}_${prevStep.order}`,
            target: flowNode.id,
            condition: step.condition,
          })
        }
      }
    })

    // 添加结束节点
    if (sequenceNodes.length > 0) {
      const endNode: InteractionFlowNode = {
        id: `end_${sequence.id}`,
        type: 'end',
        label: '结束',
        x: sequence.steps.length * 200,
        y: yOffset + seqIndex * 300,
      }
      nodes.push(endNode)

      edges.push({
        id: `edge_last_${sequence.id}`,
        source: sequenceNodes[sequenceNodes.length - 1],
        target: endNode.id,
      })
    }
  })

  return {
    id: generateDiagramId(),
    name: '交互流程图',
    description: '自动生成的交互流程图',
    nodes,
    edges,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 生成交互流程图（Mermaid 格式）
 */
export function generateInteractionFlowMermaid(
  diagram: InteractionFlowDiagram
): string {
  let mermaid = 'graph LR\n'
  mermaid += `  title ${diagram.name}\n\n`

  // 定义节点
  diagram.nodes.forEach(node => {
    const shape = {
      start: '([ ])',
      end: '([ ])',
      action: '[ ]',
      decision: '{ }',
      parallel: '[[ ]]',
    }[node.type] || '[ ]'

    const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '_')
    mermaid += `  ${nodeId}${shape} "${node.label}"\n`
  })

  mermaid += '\n'

  // 定义连接
  diagram.edges.forEach(edge => {
    const sourceId = edge.source.replace(/[^a-zA-Z0-9]/g, '_')
    const targetId = edge.target.replace(/[^a-zA-Z0-9]/g, '_')
    
    let connection = '-->'
    if (edge.condition) {
      connection = `-->|${edge.condition}|`
    } else if (edge.label) {
      connection = `-->|${edge.label}|`
    }

    mermaid += `  ${sourceId} ${connection} ${targetId}\n`
  })

  return mermaid
}

/**
 * 生成交互文档
 */
export function generateInteractionDocumentation(
  annotations: InteractionAnnotation[],
  sequences: InteractionSequence[],
  nodes: Node[]
): string {
  let doc = `# 交互设计文档\n\n`

  // 交互标注列表
  doc += `## 交互标注列表\n\n`
  annotations.forEach(annotation => {
    const node = nodes.find(n => n.id === annotation.nodeId)
    doc += `### ${annotation.id}\n\n`
    doc += `- **节点**: ${node?.data?.label || annotation.nodeId}\n`
    doc += `- **交互类型**: ${annotation.interactionType}\n`
    doc += `- **目标类型**: ${annotation.targetType}\n`
    if (annotation.target) {
      doc += `- **目标**: ${annotation.target}\n`
    }
    if (annotation.description) {
      doc += `- **描述**: ${annotation.description}\n`
    }

    if (annotation.preconditions && annotation.preconditions.length > 0) {
      doc += `- **前置条件**:\n`
      annotation.preconditions.forEach(condition => {
        doc += `  - ${condition}\n`
      })
    }

    if (annotation.postconditions && annotation.postconditions.length > 0) {
      doc += `- **后置条件**:\n`
      annotation.postconditions.forEach(condition => {
        doc += `  - ${condition}\n`
      })
    }

    if (annotation.sideEffects && annotation.sideEffects.length > 0) {
      doc += `- **副作用**:\n`
      annotation.sideEffects.forEach(effect => {
        doc += `  - ${effect}\n`
      })
    }

    if (annotation.errorHandling) {
      doc += `- **错误处理**:\n`
      doc += `  - 显示错误：${annotation.errorHandling.showError ? '是' : '否'}\n`
      if (annotation.errorHandling.errorMessage) {
        doc += `  - 错误消息：${annotation.errorHandling.errorMessage}\n`
      }
      if (annotation.errorHandling.retryable) {
        doc += `  - 可重试：是\n`
      }
    }

    if (annotation.accessibility) {
      doc += `- **可访问性**:\n`
      if (annotation.accessibility.keyboardShortcut) {
        doc += `  - 键盘快捷键：${annotation.accessibility.keyboardShortcut}\n`
      }
      if (annotation.accessibility.ariaLabel) {
        doc += `  - ARIA 标签：${annotation.accessibility.ariaLabel}\n`
      }
      doc += `  - 可聚焦：${annotation.accessibility.focusable ? '是' : '否'}\n`
    }

    if (annotation.performance) {
      doc += `- **性能优化**:\n`
      if (annotation.performance.debounce) {
        doc += `  - 防抖：${annotation.performance.debounce}ms\n`
      }
      if (annotation.performance.throttle) {
        doc += `  - 节流：${annotation.performance.throttle}ms\n`
      }
      if (annotation.performance.lazy) {
        doc += `  - 懒加载：是\n`
      }
    }

    doc += '\n'
  })

  // 交互序列
  if (sequences.length > 0) {
    doc += `## 交互序列\n\n`
    sequences.forEach(sequence => {
      doc += `### ${sequence.name}\n\n`
      doc += `${sequence.description}\n\n`
      doc += `**步骤**:\n\n`
      
      sequence.steps.forEach(step => {
        const annotation = annotations.find(a => a.id === step.annotationId)
        const parallelMark = step.parallel ? '∥ ' : ''
        const conditionMark = step.condition ? ` [${step.condition}]` : ''
        
        doc += `${parallelMark}${step.order + 1}. ${annotation?.interactionType} → ${annotation?.targetType}${conditionMark}\n`
      })

      if (sequence.loop) {
        doc += `\n**循环**: ${sequence.loop.condition}`
        if (sequence.loop.maxIterations) {
          doc += ` (最多 ${sequence.loop.maxIterations} 次)`
        }
        doc += '\n'
      }

      if (sequence.branch) {
        doc += `\n**分支**: ${sequence.branch.condition}\n`
        doc += `- 真：${sequence.branch.trueBranch}\n`
        doc += `- 假：${sequence.branch.falseBranch}\n`
      }

      doc += '\n'
    })
  }

  // 交互流程图
  const diagram = generateInteractionFlowDiagram(annotations, sequences)
  doc += `## 交互流程图\n\n`
  doc += '```mermaid\n'
  doc += generateInteractionFlowMermaid(diagram)
  doc += '```\n\n'

  return doc
}

/**
 * 生成标注 ID
 */
function generateAnnotationId(): string {
  return `ia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成序列 ID
 */
function generateSequenceId(): string {
  return `is_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成流程图 ID
 */
function generateDiagramId(): string {
  return `ifd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 预定义的交互模式
 */
export const commonInteractionPatterns: Record<string, Partial<InteractionAnnotation>> = {
  // 表单提交
  formSubmit: {
    interactionType: 'submit',
    targetType: 'api',
    description: '表单提交触发 API 调用',
    preconditions: ['表单验证通过'],
    postconditions: ['数据保存到服务器', '显示成功通知'],
    sideEffects: ['重置表单', '导航到结果页面'],
    errorHandling: {
      showError: true,
      retryable: true,
    },
    performance: {
      debounce: 300,
    },
  },

  // 导航点击
  navigationClick: {
    interactionType: 'click',
    targetType: 'navigation',
    description: '点击导航到目标页面',
    preconditions: ['用户已认证'],
    postconditions: ['页面路由变更'],
    sideEffects: ['更新浏览器历史', '滚动到顶部'],
    accessibility: {
      keyboardShortcut: 'Enter',
      focusable: true,
    },
  },

  // 搜索输入
  searchInput: {
    interactionType: 'change',
    targetType: 'api',
    description: '搜索输入触发自动补全',
    preconditions: ['输入长度 >= 2'],
    postconditions: ['显示搜索结果'],
    sideEffects: ['更新搜索历史'],
    errorHandling: {
      showError: false,
    },
    performance: {
      debounce: 500,
      lazy: true,
    },
  },

  // 模态框打开
  modalOpen: {
    interactionType: 'click',
    targetType: 'modal',
    description: '点击打开模态框',
    preconditions: [],
    postconditions: ['模态框显示', '背景遮罩显示'],
    sideEffects: ['禁用背景滚动', '聚焦到模态框'],
    accessibility: {
      keyboardShortcut: 'Esc',
      ariaLabel: '关闭模态框',
      focusable: true,
    },
  },

  // 文件上传
  fileUpload: {
    interactionType: 'change',
    targetType: 'api',
    description: '选择文件后自动上传',
    preconditions: ['文件格式正确', '文件大小 < 限制'],
    postconditions: ['文件上传成功', '显示预览'],
    sideEffects: ['更新文件列表'],
    errorHandling: {
      showError: true,
      errorMessage: '文件上传失败',
      retryable: true,
    },
  },
}

export default {
  createInteractionAnnotation,
  createInteractionSequence,
  addSequenceStep,
  generateAnnotationsFromNodes,
  validateInteractionAnnotation,
  generateInteractionFlowDiagram,
  generateInteractionFlowMermaid,
  generateInteractionDocumentation,
  commonInteractionPatterns,
}
