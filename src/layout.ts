import type { Node } from 'reactflow'

export function autoLayout(nodes: Node[]) {
  const layerMap: Record<string, number> = {
    frontend: 0,
    api: 1,
    service: 2,
    repository: 3,
    database: 4,
  }

  return nodes.map((node, index) => {
    const layer = layerMap[node.data.type] ?? 0

    return {
      ...node,
      position: {
        x: layer * 300,
        y: index * 120,
      },
    }
  })
}
