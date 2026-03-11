import type { CustomNode } from './types'
import type { Edge } from 'reactflow'

// ==================== 类型定义 ====================

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  version: number
  thumbnail?: string          // 缩略图（base64）
  tags: string[]              // 标签
  category: 'ecommerce' | 'cms' | 'saas' | 'api' | 'other'  // 分类
}

/**
 * 模板内容（架构图数据）
 */
export interface TemplateContent {
  nodes: CustomNode[]
  edges: Edge[]
}

/**
 * 完整的模板对象
 */
export interface ArchitectureTemplate {
  metadata: TemplateMetadata
  content: TemplateContent
  snapshots?: TemplateSnapshot[]  // 版本快照
}

/**
 * 模板快照（版本历史）
 */
export interface TemplateSnapshot {
  id: string
  timestamp: Date
  changes: string            // 变更描述
  content: TemplateContent
}

/**
 * 模板存储键
 */
export const TEMPLATE_STORAGE_KEY = 'meta-arch-templates'
export const CURRENT_PROJECT_KEY = 'meta-arch-current-project'

/**
 * 模板管理器接口
 */
export interface TemplateManager {
  // 模板管理
  saveTemplate(template: ArchitectureTemplate): Promise<string>
  loadTemplate(templateId: string): Promise<ArchitectureTemplate | null>
  deleteTemplate(templateId: string): Promise<void>
  listTemplates(): Promise<ArchitectureTemplate[]>
  
  // 当前项目
  saveCurrentProject(nodes: CustomNode[], edges: Edge[]): Promise<void>
  loadCurrentProject(): Promise<{ nodes: CustomNode[]; edges: Edge[] } | null>
  
  // 导出/导入
  exportTemplate(templateId: string): Promise<Blob>
  importTemplate(file: File): Promise<string>
  
  // 版本管理
  createSnapshot(templateId: string, changes: string): Promise<void>
  getSnapshots(templateId: string): Promise<TemplateSnapshot[]>
  restoreSnapshot(templateId: string, snapshotId: string): Promise<void>
}

// ==================== 存储引擎 ====================

class LocalStorageTemplateManager implements TemplateManager {
  private readonly maxSnapshots = 5  // 最多保留 5 个快照
  
  /**
   * 保存模板
   */
  async saveTemplate(template: ArchitectureTemplate): Promise<string> {
    const templates = await this.listTemplates()
    
    const existingIndex = templates.findIndex(t => t.metadata.id === template.metadata.id)
    
    if (existingIndex >= 0) {
      // 更新现有模板
      template.metadata.updatedAt = new Date()
      template.metadata.version++
      templates[existingIndex] = template
    } else {
      // 添加新模板
      templates.push(template)
    }
    
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
    return template.metadata.id
  }
  
  /**
   * 加载模板
   */
  async loadTemplate(templateId: string): Promise<ArchitectureTemplate | null> {
    const templates = await this.listTemplates()
    return templates.find(t => t.metadata.id === templateId) || null
  }
  
  /**
   * 删除模板
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const templates = await this.listTemplates()
    const filtered = templates.filter(t => t.metadata.id !== templateId)
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(filtered))
  }
  
  /**
   * 列出所有模板
   */
  async listTemplates(): Promise<ArchitectureTemplate[]> {
    const data = localStorage.getItem(TEMPLATE_STORAGE_KEY)
    if (!data) return []
    
    const templates = JSON.parse(data) as ArchitectureTemplate[]
    // 转换日期字符串为 Date 对象
    return templates.map((t) => ({
      ...t,
      metadata: {
        ...t.metadata,
        createdAt: new Date(t.metadata.createdAt),
        updatedAt: new Date(t.metadata.updatedAt),
      },
      snapshots: t.snapshots?.map((s) => ({
        ...s,
        timestamp: new Date(s.timestamp),
      })),
    }))
  }
  
  /**
   * 保存当前项目
   */
  async saveCurrentProject(nodes: CustomNode[], edges: Edge[]): Promise<void> {
    const project = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(project))
  }
  
  /**
   * 加载当前项目
   */
  async loadCurrentProject(): Promise<{ nodes: CustomNode[]; edges: Edge[] } | null> {
    const data = localStorage.getItem(CURRENT_PROJECT_KEY)
    if (!data) return null
    
    const project = JSON.parse(data)
    return {
      nodes: project.nodes,
      edges: project.edges,
    }
  }
  
  /**
   * 导出模板为 JSON
   */
  async exportTemplate(templateId: string): Promise<Blob> {
    const template = await this.loadTemplate(templateId)
    if (!template) throw new Error('模板不存在')
    
    const jsonString = JSON.stringify(template, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }
  
  /**
   * 从文件导入模板
   */
  async importTemplate(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const template = JSON.parse(event.target?.result as string) as ArchitectureTemplate
          
          // 验证模板结构
          if (!template.metadata || !template.content) {
            throw new Error('无效的模板格式')
          }
          
          // 生成新 ID，避免冲突
          template.metadata.id = `template-${Date.now()}`
          template.metadata.createdAt = new Date()
          template.metadata.updatedAt = new Date()
          
          await this.saveTemplate(template)
          resolve(template.metadata.id)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }
  
  /**
   * 创建快照
   */
  async createSnapshot(templateId: string, changes: string): Promise<void> {
    const template = await this.loadTemplate(templateId)
    if (!template) throw new Error('模板不存在')
    
    const snapshot: TemplateSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: new Date(),
      changes,
      content: { ...template.content },
    }
    
    if (!template.snapshots) {
      template.snapshots = []
    }
    
    // 添加新快照到开头
    template.snapshots.unshift(snapshot)
    
    // 保留最近的 N 个快照
    if (template.snapshots.length > this.maxSnapshots) {
      template.snapshots = template.snapshots.slice(0, this.maxSnapshots)
    }
    
    await this.saveTemplate(template)
  }
  
  /**
   * 获取快照列表
   */
  async getSnapshots(templateId: string): Promise<TemplateSnapshot[]> {
    const template = await this.loadTemplate(templateId)
    return template?.snapshots || []
  }
  
  /**
   * 恢复快照
   */
  async restoreSnapshot(templateId: string, snapshotId: string): Promise<void> {
    const template = await this.loadTemplate(templateId)
    if (!template) throw new Error('模板不存在')
    
    const snapshot = template.snapshots?.find(s => s.id === snapshotId)
    if (!snapshot) throw new Error('快照不存在')
    
    // 恢复内容
    template.content = { ...snapshot.content }
    template.metadata.updatedAt = new Date()
    template.metadata.version++
    
    await this.saveTemplate(template)
  }
}

// ==================== 单例实例 ====================

export const templateManager = new LocalStorageTemplateManager()

// ==================== 便捷函数 ====================

/**
 * 快速保存当前架构为模板
 */
export async function saveAsTemplate(
  name: string,
  description: string,
  nodes: CustomNode[],
  edges: Edge[],
  tags: string[] = [],
  category: ArchitectureTemplate['metadata']['category'] = 'other'
): Promise<string> {
  const template: ArchitectureTemplate = {
    metadata: {
      id: `template-${Date.now()}`,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      tags,
      category,
    },
    content: {
      nodes,
      edges,
    },
  }
  
  return await templateManager.saveTemplate(template)
}

/**
 * 加载模板到当前画布
 */
export async function loadTemplateToCanvas(
  templateId: string
): Promise<{ nodes: CustomNode[]; edges: Edge[] } | null> {
  const template = await templateManager.loadTemplate(templateId)
  return template?.content || null
}
