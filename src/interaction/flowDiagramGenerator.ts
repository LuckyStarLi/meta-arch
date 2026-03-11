/**
 * 交互流程图生成器
 * 从节点和交互标注生成交互流程图，支持多种输出格式
 */

import { Node, Edge } from 'reactflow'
import { InteractionAnnotation, InteractionSequence, InteractionFlowDiagram } from './interactionAnnotator'
import { StateMachineConfig } from './stateMachine'

/**
 * 流程图布局选项
 */
export interface LayoutOptions {
  direction: 'TB' | 'LR' | 'RL' | 'BT'
  nodeSpacing: number
  levelSpacing: number
  curveStyle: 'straight' | 'curved' | 'rounded'
  showLabels: boolean
  showConditions: boolean
  compact: boolean
}

/**
 * 流程图样式选项
 */
export interface StyleOptions {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  borderColor: string
  fontSize: number
  fontFamily: string
}

/**
 * 导出选项
 */
export interface ExportOptions {
  format: 'mermaid' | 'plantuml' | 'graphviz' | 'json' | 'svg' | 'png'
  width: number
  height: number
  scale: number
  theme: 'default' | 'dark' | 'forest' | 'neutral'
}

/**
 * 流程图节点样式
 */
export interface FlowNodeStyle {
  shape: 'rectangle' | 'round-rectangle' | 'ellipse' | 'triangle' | 'diamond' | 'hexagon'
  fillColor: string
  strokeColor: string
  strokeWidth: number
  labelColor: string
  icon?: string
}

/**
 * 流程图连接样式
 */
export interface FlowEdgeStyle {
  strokeColor: string
  strokeWidth: number
  strokeDasharray?: string
  markerEnd: 'arrow' | 'circle' | 'diamond' | 'none'
  labelColor: string
}

/**
 * 交互流程图生成器类
 */
export class InteractionFlowGenerator {
  private nodes: Node[]
  private edges: Edge[]
  private annotations: InteractionAnnotation[]
  private sequences: InteractionSequence[]
  private stateMachines: StateMachineConfig[]
  private layoutOptions: LayoutOptions
  private styleOptions: StyleOptions

  constructor(
    nodes: Node[],
    edges: Edge[],
    annotations: InteractionAnnotation[] = [],
    sequences: InteractionSequence[] = [],
    stateMachines: StateMachineConfig[] = []
  ) {
    this.nodes = nodes
    this.edges = edges
    this.annotations = annotations
    this.sequences = sequences
    this.stateMachines = stateMachines
    this.layoutOptions = {
      direction: 'TB',
      nodeSpacing: 100,
      levelSpacing: 150,
      curveStyle: 'curved',
      showLabels: true,
      showConditions: true,
      compact: false,
    }
    this.styleOptions = {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    }
  }

  /**
   * 设置布局选项
   */
  setLayoutOptions(options: Partial<LayoutOptions>): void {
    Object.assign(this.layoutOptions, options)
  }

  /**
   * 设置样式选项
   */
  setStyleOptions(options: Partial<StyleOptions>): void {
    Object.assign(this.styleOptions, options)
  }

  /**
   * 生成 Mermaid 流程图
   */
  generateMermaidDiagram(): string {
    const { direction } = this.layoutOptions
    let mermaid = `graph ${direction}\n`
    mermaid += `  title 交互流程图\n\n`

    // 定义节点样式类
    mermaid += this.generateMermaidStyles()

    // 添加节点
    this.nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id)
      const label = node.data?.label || node.type || 'Node'
      const annotation = this.annotations.find(a => a.nodeId === node.id)

      let styleClass = 'default'
      if (annotation) {
        styleClass = this.getAnnotationStyleClass(annotation.interactionType)
      }

      mermaid += `  ${nodeId}[${label}]:::${styleClass}\n`
    })

    mermaid += '\n'

    // 添加边
    this.edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source)
      const targetId = this.sanitizeId(edge.target)
      
      let connection = '-->'
      const annotation = this.annotations.find(a => a.nodeId === edge.source)
      
      if (annotation && this.layoutOptions.showLabels) {
        const label = `${annotation.interactionType}\\n${annotation.targetType}`
        connection = `-->|${label}|`
      } else if (this.layoutOptions.showConditions && edge.label) {
        connection = `-->|${edge.label}|`
      }

      mermaid += `  ${sourceId} ${connection} ${targetId}\n`
    })

    // 添加状态机节点（如果有）
    if (this.stateMachines.length > 0) {
      mermaid += '\n  subgraph StateMachines[状态机]\n'
      this.stateMachines.forEach((sm, index) => {
        const smId = `sm_${index}`
        mermaid += `    ${smId}[${sm.name}]:::stateMachine\n`
      })
      mermaid += '  end\n'
    }

    return mermaid
  }

  /**
   * 生成 Mermaid 样式
   */
  private generateMermaidStyles(): string {
    return `  classDef default fill:${this.styleOptions.backgroundColor},stroke:${this.styleOptions.borderColor},color:${this.styleOptions.textColor}\n` +
           `  classDef click fill:${this.styleOptions.primaryColor}22,stroke:${this.styleOptions.primaryColor},color:${this.styleOptions.textColor}\n` +
           `  classDef hover fill:${this.styleOptions.secondaryColor}22,stroke:${this.styleOptions.secondaryColor},color:${this.styleOptions.textColor}\n` +
           `  classDef submit fill:${this.styleOptions.accentColor}22,stroke:${this.styleOptions.accentColor},color:${this.styleOptions.textColor}\n` +
           `  classDef stateMachine fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray: 5 5,color:${this.styleOptions.textColor}\n\n`
  }

  /**
   * 获取标注样式类
   */
  private getAnnotationStyleClass(interactionType: string): string {
    const styleMap: Record<string, string> = {
      'click': 'click',
      'hover': 'hover',
      'submit': 'submit',
      'change': 'click',
      'focus': 'hover',
    }
    return styleMap[interactionType] || 'default'
  }

  /**
   * 清理 ID（Mermaid 要求）
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  /**
   * 生成 PlantUML 流程图
   */
  generatePlantUMLDiagram(): string {
    let plantuml = '@startuml\n'
    plantuml += 'skinparam backgroundColor #FFFFFF\n'
    plantuml += `skinparam defaultFontName ${this.styleOptions.fontFamily}\n`
    plantuml += `skinparam defaultFontSize ${this.styleOptions.fontSize}\n`
    plantuml += `skinparam defaultFontColor ${this.styleOptions.textColor}\n\n`

    // 添加节点
    this.nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id)
      const label = node.data?.label || node.type || 'Node'
      const annotation = this.annotations.find(a => a.nodeId === node.id)

      // let shape = 'rectangle'
      // let color = 'white'

      if (annotation) {
        switch (annotation.interactionType) {
          case 'click':
            // shape = 'rectangle'
            // color = '#eff6ff'
            break
          case 'hover':
            // shape = 'ellipse'
            // color = '#f0fdf4'
            break
          case 'submit':
            // shape = 'rectangle'
            // color = '#fffbeb'
            break
        }
      }

      plantuml += `object "${label}" as ${nodeId}\n`
    })

    plantuml += '\n'

    // 添加边
    this.edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source)
      const targetId = this.sanitizeId(edge.target)
      const annotation = this.annotations.find(a => a.nodeId === edge.source)

      let label = ''
      if (annotation && this.layoutOptions.showLabels) {
        label = `${annotation.interactionType}\\n${annotation.targetType}`
      } else if (edge.label) {
        label = edge.label
      }

      plantuml += `${sourceId} --> ${targetId}${label ? ` : ${label}` : ''}\n`
    })

    plantuml += '\n@enduml'
    return plantuml
  }

  /**
   * 生成 Graphviz DOT 格式
   */
  generateGraphvizDOT(): string {
    const { direction, curveStyle } = this.layoutOptions
    let dot = `digraph InteractionFlow {\n`
    dot += `  rankdir=${direction};\n`
    dot += `  bgcolor="${this.styleOptions.backgroundColor}";\n`
    dot += `  node [fontname="${this.styleOptions.fontFamily}", fontsize=${this.styleOptions.fontSize}, color="${this.styleOptions.textColor}"];\n`
    dot += `  edge [fontname="${this.styleOptions.fontFamily}", fontsize=${this.styleOptions.fontSize - 2}];\n\n`

    // 曲线样式
    if (curveStyle === 'curved') {
      dot += '  splines=curved;\n'
    } else if (curveStyle === 'rounded') {
      dot += '  splines=ortho;\n'
    }

    dot += '\n'

    // 添加节点
    this.nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id)
      const label = node.data?.label || node.type || 'Node'
      const annotation = this.annotations.find(a => a.nodeId === node.id)

      let shape = 'box'
      const style = 'filled'
      let fillcolor = '#ffffff'

      if (annotation) {
        switch (annotation.interactionType) {
          case 'click':
            fillcolor = '#eff6ff'
            break
          case 'hover':
            shape = 'ellipse'
            fillcolor = '#f0fdf4'
            break
          case 'submit':
            fillcolor = '#fffbeb'
            break
          case 'change':
            fillcolor = '#f5f3ff'
            break
        }
      }

      dot += `  ${nodeId} [label="${label}", shape=${shape}, style="${style}", fillcolor="${fillcolor}"];\n`
    })

    dot += '\n'

    // 添加边
    this.edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source)
      const targetId = this.sanitizeId(edge.target)
      const annotation = this.annotations.find(a => a.nodeId === edge.source)

      let label = ''
      if (annotation && this.layoutOptions.showLabels) {
        label = `${annotation.interactionType} → ${annotation.targetType}`
      } else if (edge.label) {
        label = edge.label
      }

      dot += `  ${sourceId} -> ${targetId}`
      if (label) {
        dot += ` [label="${label}"]`
      }
      dot += ';\n'
    })

    dot += '\n}'
    return dot
  }

  /**
   * 生成 JSON 格式
   */
  generateJSONFormat(): InteractionFlowDiagram {
    const flowNodes = this.nodes.map(node => {
      const annotation = this.annotations.find(a => a.nodeId === node.id)
      return {
        id: node.id,
        type: annotation ? 'action' : 'default',
        label: node.data?.label || node.type || 'Node',
        annotationId: annotation?.id,
        x: node.position?.x || 0,
        y: node.position?.y || 0,
        children: [],
      }
    })

    const flowEdges = this.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      condition: undefined,
    }))

    return {
      id: `flow_${Date.now()}`,
      name: '交互流程图',
      description: '自动生成的交互流程图',
      nodes: flowNodes,
      edges: flowEdges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  }

  /**
   * 生成序列图（Mermaid 格式）
   */
  generateSequenceDiagram(): string {
    let mermaid = 'sequenceDiagram\n'
    mermaid += '  participant User as 用户\n\n'

    // 为每个节点创建参与者
    this.nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id)
      const label = node.data?.label || node.type || 'Node'
      mermaid += `  participant ${nodeId} as ${label}\n`
    })

    mermaid += '\n'

    // 根据边生成消息
    this.edges.forEach((edge, index) => {
      const sourceId = this.sanitizeId(edge.source)
      const targetId = this.sanitizeId(edge.target)
      const annotation = this.annotations.find(a => a.nodeId === edge.source)

      let message = ''
      if (annotation) {
        message = `${annotation.interactionType}(${annotation.targetType})`
      } else {
        message = edge.label || `message ${index + 1}`
      }

      mermaid += `  User->>${sourceId}: 触发\n`
      mermaid += `  ${sourceId}->>${targetId}: ${message}\n`
    })

    return mermaid
  }

  /**
   * 生成状态转换图（如果有状态机）
   */
  generateStateTransitionDiagram(): string {
    if (this.stateMachines.length === 0) {
      return '没有可用的状态机'
    }

    let mermaid = 'stateDiagram-v2\n\n'

    this.stateMachines.forEach((sm, index) => {
      mermaid += `  state "${sm.name}" as SM${index} {\n`

      // 添加状态
      sm.states.forEach(state => {
        const stateName = state.name.replace(/\s+/g, '_')
        
        if (state.type === 'initial') {
          mermaid += `    [*] --> ${state.id}\n`
        } else if (state.type === 'final') {
          mermaid += `    ${state.id} --> [*]\n`
        }

        mermaid += `    state ${state.id} {\n`
        mermaid += `      ${stateName}\n`
        if (state.entryActions && state.entryActions.length > 0) {
          mermaid += `      entry / ${state.entryActions.join('; ')}\n`
        }
        if (state.exitActions && state.exitActions.length > 0) {
          mermaid += `      exit / ${state.exitActions.join('; ')}\n`
        }
        mermaid += `    }\n`
      })

      // 添加转换
      sm.transitions.forEach(transition => {
        let label = transition.trigger
        if (transition.guard) {
          label += ` [${transition.guard}]`
        }
        if (transition.actions && transition.actions.length > 0) {
          label += ` / ${transition.actions.join('; ')}`
        }
        mermaid += `    ${transition.from} --> ${transition.to}: ${label}\n`
      })

      mermaid += '  }\n\n'
    })

    return mermaid
  }

  /**
   * 导出流程图
   */
  exportDiagram(options: ExportOptions): string {
    switch (options.format) {
      case 'mermaid':
        return this.generateMermaidDiagram()
      case 'plantuml':
        return this.generatePlantUMLDiagram()
      case 'graphviz':
        return this.generateGraphvizDOT()
      case 'json':
        return JSON.stringify(this.generateJSONFormat(), null, 2)
      case 'svg':
      case 'png':
        // 这些格式需要额外的渲染库
        throw new Error(`格式 ${options.format} 需要额外的渲染库支持`)
      default:
        throw new Error(`不支持的格式：${options.format}`)
    }
  }

  /**
   * 生成完整的交互文档
   */
  generateCompleteDocumentation(): string {
    let doc = `# 交互流程图完整文档\n\n`

    doc += `## 概述\n\n`
    doc += `- **节点数量**: ${this.nodes.length}\n`
    doc += `- **连接数量**: ${this.edges.length}\n`
    doc += `- **交互标注**: ${this.annotations.length}\n`
    doc += `- **交互序列**: ${this.sequences.length}\n`
    doc += `- **状态机**: ${this.stateMachines.length}\n\n`

    doc += `## 主流程图\n\n`
    doc += '```mermaid\n'
    doc += this.generateMermaidDiagram()
    doc += '```\n\n'

    doc += `## 序列图\n\n`
    doc += '```mermaid\n'
    doc += this.generateSequenceDiagram()
    doc += '```\n\n'

    if (this.stateMachines.length > 0) {
      doc += `## 状态转换图\n\n`
      doc += '```mermaid\n'
      doc += this.generateStateTransitionDiagram()
      doc += '```\n\n'
    }

    doc += `## 交互标注详情\n\n`
    this.annotations.forEach((annotation, index) => {
      const node = this.nodes.find(n => n.id === annotation.nodeId)
      doc += `### ${index + 1}. ${node?.data?.label || annotation.nodeId}\n`
      doc += `- **交互类型**: ${annotation.interactionType}\n`
      doc += `- **目标类型**: ${annotation.targetType}\n`
      if (annotation.description) {
        doc += `- **描述**: ${annotation.description}\n`
      }
      doc += '\n'
    })

    if (this.sequences.length > 0) {
      doc += `## 交互序列\n\n`
      this.sequences.forEach((sequence, index) => {
        doc += `### ${index + 1}. ${sequence.name}\n`
        doc += `${sequence.description}\n\n`
        doc += `**步骤**:\n\n`
        sequence.steps.forEach(step => {
          const annotation = this.annotations.find(a => a.id === step.annotationId)
          doc += `${step.order + 1}. ${annotation?.interactionType} → ${annotation?.targetType}\n`
        })
        doc += '\n'
      })
    }

    return doc
  }
}

/**
 * 快速生成流程图
 */
export function generateInteractionFlow(
  nodes: Node[],
  edges: Edge[],
  annotations?: InteractionAnnotation[],
  format: 'mermaid' | 'plantuml' | 'graphviz' | 'json' = 'mermaid'
): string {
  const generator = new InteractionFlowGenerator(
    nodes,
    edges,
    annotations || []
  )
  return generator.exportDiagram({
    format,
    width: 800,
    height: 600,
    scale: 1,
    theme: 'default',
  })
}

/**
 * 快速生成完整文档
 */
export function generateInteractionDocumentation(
  nodes: Node[],
  edges: Edge[],
  annotations: InteractionAnnotation[],
  sequences: InteractionSequence[],
  stateMachines: StateMachineConfig[]
): string {
  const generator = new InteractionFlowGenerator(
    nodes,
    edges,
    annotations,
    sequences,
    stateMachines
  )
  return generator.generateCompleteDocumentation()
}

export default {
  InteractionFlowGenerator,
  generateInteractionFlow,
  generateInteractionDocumentation,
}
