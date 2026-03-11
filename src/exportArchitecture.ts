import { generateFastAPI } from './codeGenerator'
import type { CustomNode } from './types'
import type { Edge } from 'reactflow'

export const exportProject = (nodes: CustomNode[], edges: Edge[]) => {
  const files = generateFastAPI(nodes, edges)

  const blob = new Blob([JSON.stringify(files, null, 2)], {
    type: 'application/json',
  })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  
  // 生成带时间戳的文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  link.download = `FastAPI 项目架构-${timestamp}.json`
  link.click()
}
