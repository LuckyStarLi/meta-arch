/**
 * 模块级别代码生成器
 * 根据模块内的节点和连接关系生成完整的模块代码
 */

import type { ModuleConfig, CustomNode, Edge, ModuleNodeGroup } from '../types'

/**
 * 代码生成配置
 */
export interface CodeGenerationConfig {
  language: 'typescript' | 'python' | 'java' | 'go'
  framework: 'fastapi' | 'express' | 'spring' | 'gin' | 'none'
  includeComments: boolean
  includeImports: boolean
  includeTests: boolean
  packageStructure: 'flat' | 'layered' | 'domain'
}

/**
 * 生成的代码文件
 */
export interface GeneratedCodeFile {
  path: string
  content: string
  language: string
  description: string
}

/**
 * 模块代码生成器类
 */
export class ModuleCodeGenerator {
  private config: CodeGenerationConfig

  constructor(config: Partial<CodeGenerationConfig> = {}) {
    this.config = {
      language: 'typescript',
      framework: 'fastapi',
      includeComments: true,
      includeImports: true,
      includeTests: true,
      packageStructure: 'layered',
      ...config,
    }
  }

  /**
   * 生成模块完整代码
   */
  generateModuleCode(
    module: ModuleConfig,
    nodes: CustomNode[],
    edges: Edge[],
    allModules: ModuleConfig[]
  ): GeneratedCodeFile[] {
    const files: GeneratedCodeFile[] = []

    // 1. 生成主模块文件
    files.push(this.generateMainModuleFile(module, nodes, edges))

    // 2. 根据节点类型生成具体代码
    const nodeTypes = this.categorizeNodesByType(nodes)
    
    // 生成 API 层代码
    if (nodeTypes.api.length > 0) {
      files.push(this.generateApiLayer(module, nodeTypes.api, edges))
    }

    // 生成服务层代码
    if (nodeTypes.service.length > 0) {
      files.push(this.generateServiceLayer(module, nodeTypes.service, edges))
    }

    // 生成数据层代码
    if (nodeTypes.database.length > 0 || nodeTypes.repository.length > 0) {
      files.push(this.generateDataLayer(module, [...nodeTypes.database, ...nodeTypes.repository], edges))
    }

    // 生成前端代码
    if (nodeTypes.frontend.length > 0) {
      files.push(this.generateFrontendLayer(module, nodeTypes.frontend))
    }

    // 3. 生成配置文件
    files.push(this.generateConfigFile(module))

    // 4. 生成测试文件
    if (this.config.includeTests) {
      files.push(this.generateTestFile(module, nodes))
    }

    // 5. 生成 README
    files.push(this.generateReadmeFile(module, nodes, allModules))

    return files
  }

  /**
   * 生成主模块文件
   */
  private generateMainModuleFile(
    module: ModuleConfig,
    nodes: CustomNode[],
    edges: Edge[]
  ): GeneratedCodeFile {
    const imports = this.config.includeImports 
      ? this.generateImports(module, nodes)
      : ''

    const comments = this.config.includeComments
      ? this.generateModuleComments(module)
      : ''

    const dependencies = module.dependencies.length > 0
      ? this.generateDependencyDeclarations(module)
      : ''

    const exports = module.exports.length > 0
      ? this.generateExportDeclarations(module)
      : ''

    const content = `${comments}${imports}

${dependencies}
/**
 * ${module.name} 模块主类
 * 版本：${module.version}
 */
export class ${this.toPascalCase(module.name)}Module {
  /**
   * 模块初始化
   */
  async initialize(): Promise<void> {
    ${this.generateInitializationCode(nodes, edges)}
  }

  /**
   * 模块销毁
   */
  async destroy(): Promise<void> {
    // 清理资源
    console.log('Destroying ${module.name} module')
  }

  /**
   * 获取模块信息
   */
  getInfo(): ModuleInfo {
    return {
      id: '${module.id}',
      name: '${module.name}',
      type: '${module.type}',
      layer: '${module.layer}',
      version: '${module.version}',
      nodeCount: ${nodes.length},
    }
  }
}

${exports}
// 导出模块实例
export const ${this.toCamelCase(module.name)}Module = new ${this.toPascalCase(module.name)}Module()
`

    return {
      path: this.getModuleFilePath(module, 'index'),
      content,
      language: 'typescript',
      description: `${module.name} 模块主文件`,
    }
  }

  /**
   * 生成 API 层代码
   */
  private generateApiLayer(
    module: ModuleConfig,
    nodes: CustomNode[],
    edges: Edge[]
  ): GeneratedCodeFile {
    const routes = nodes.map(node => {
      const config = node.data.config as any
      return `
  /**
   * ${node.data.label} 接口
   * ${config?.description || ''}
   */
  @${this.getApiDecorator(node)}('${this.getNodePath(node)}')
  async ${this.toCamelCase(node.data.label)}(
    @Body() body: ${this.toPascalCase(node.data.label)}Request
  ): Promise<${this.toPascalCase(node.data.label)}Response> {
    return this.${this.toCamelCase(module.name)}Service.${this.toCamelCase(node.data.label)}(body)
  }
`
    }).join('\n')

    const content = `import { Controller, Get, Post, Body } from '@nestjs/common'
import { ${this.toPascalCase(module.name)}Service } from './${this.toCamelCase(module.name)}.service'

/**
 * ${module.name} API 控制器
 */
@Controller('${this.toKebabCase(module.name)}')
export class ${this.toPascalCase(module.name)}Controller {
  constructor(
    private readonly ${this.toCamelCase(module.name)}Service: ${this.toPascalCase(module.name)}Service
  ) {}
${routes}
}
`

    return {
      path: this.getModuleFilePath(module, `${module.name}.controller.ts`),
      content,
      language: 'typescript',
      description: `${module.name} API 控制器`,
    }
  }

  /**
   * 生成服务层代码
   */
  private generateServiceLayer(
    module: ModuleConfig,
    nodes: CustomNode[],
    edges: Edge[]
  ): GeneratedCodeFile {
    const services = nodes.map(node => {
      return `
  /**
   * ${node.data.label} 业务逻辑
   */
  async ${this.toCamelCase(node.data.label)}(data: any): Promise<any> {
    // TODO: 实现业务逻辑
    console.log('Processing ${node.data.label}')
    
    // 1. 数据验证
    // 2. 业务处理
    // 3. 数据持久化
    
    return { success: true, data }
  }
`
    }).join('\n')

    const content = `import { Injectable } from '@nestjs/common'
import { ${this.toPascalCase(module.name)}Repository } from './${this.toCamelCase(module.name)}.repository'

/**
 * ${module.name} 服务层
 */
@Injectable()
export class ${this.toPascalCase(module.name)}Service {
  constructor(
    private readonly repository: ${this.toPascalCase(module.name)}Repository
  ) {}
${services}
}
`

    return {
      path: this.getModuleFilePath(module, `${module.name}.service.ts`),
      content,
      language: 'typescript',
      description: `${module.name} 服务层`,
    }
  }

  /**
   * 生成数据层代码
   */
  private generateDataLayer(
    module: ModuleConfig,
    nodes: CustomNode[],
    edges: Edge[]
  ): GeneratedCodeFile {
    const repositories = nodes
      .filter(n => n.data.type === 'repository' || n.data.type === 'database')
      .map(node => {
        return `
  /**
   * ${node.data.label} 数据访问
   */
  async ${this.toCamelCase(node.data.label)}(criteria: any): Promise<any> {
    // TODO: 实现数据访问逻辑
    return this.dataSource.query('SELECT * FROM ...')
  }
`
      }).join('\n')

    const content = `import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

/**
 * ${module.name} 数据仓库层
 */
@Injectable()
export class ${this.toPascalCase(module.name)}Repository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}
${repositories}
}
`

    return {
      path: this.getModuleFilePath(module, `${module.name}.repository.ts`),
      content,
      language: 'typescript',
      description: `${module.name} 数据仓库层`,
    }
  }

  /**
   * 生成前端代码
   */
  private generateFrontendLayer(
    module: ModuleConfig,
    nodes: CustomNode[]
  ): GeneratedCodeFile {
    const components = nodes.map(node => {
      return `
/**
 * ${node.data.label} 组件
 */
export const ${this.toPascalCase(node.data.label)}: React.FC = () => {
  return (
    <div className="${this.toKebabCase(node.data.label)}">
      <h1>${node.data.label}</h1>
      {/* TODO: 实现组件内容 */}
    </div>
  )
}
`
    }).join('\n')

    const content = `import React from 'react'
${components}
export default ${this.toPascalCase(module.name)}Components
`

    return {
      path: this.getModuleFilePath(module, `${module.name}.components.tsx`),
      content,
      language: 'typescript',
      description: `${module.name} 前端组件`,
    }
  }

  /**
   * 生成配置文件
   */
  private generateConfigFile(module: ModuleConfig): GeneratedCodeFile {
    const content = `/**
 * ${module.name} 模块配置
 */
export interface ${this.toPascalCase(module.name)}Config {
  /**
   * 模块启用状态
   */
  enabled: boolean

  /**
   * 日志级别
   */
  logLevel: 'debug' | 'info' | 'warn' | 'error'

  /**
   * 缓存配置
   */
  cache: {
    enabled: boolean
    ttl: number
  }

  /**
   * 数据库配置
   */
  database: {
    host: string
    port: number
    name: string
  }
}

/**
 * 默认配置
 */
export const default${this.toPascalCase(module.name)}Config: ${this.toPascalCase(module.name)}Config = {
  enabled: true,
  logLevel: 'info',
  cache: {
    enabled: true,
    ttl: 3600,
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: '${this.toSnakeCase(module.name)}',
  },
}
`

    return {
      path: this.getModuleFilePath(module, `${module.name}.config.ts`),
      content,
      language: 'typescript',
      description: `${module.name} 模块配置`,
    }
  }

  /**
   * 生成测试文件
   */
  private generateTestFile(
    module: ModuleConfig,
    nodes: CustomNode[]
  ): GeneratedCodeFile {
    const tests = nodes.map(node => {
      return `
  it('should process ${node.data.label}', async () => {
    const result = await module.${this.toCamelCase(node.data.label)}(testData)
    expect(result).toBeDefined()
    expect(result.success).toBe(true)
  })
`
    }).join('\n')

    const content = `import { Test, TestingModule } from '@nestjs/testing'
import { ${this.toPascalCase(module.name)}Module } from './${this.toCamelCase(module.name)}'

describe('${this.toPascalCase(module.name)}Module', () => {
  let module: ${this.toPascalCase(module.name)}Module

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [${this.toPascalCase(module.name)}Module],
    }).compile()

    module = app.get<${this.toPascalCase(module.name)}Module>(${this.toPascalCase(module.name)}Module)
  })

  describe('module functionality', () => {
${tests}
  })
})
`

    return {
      path: this.getModuleFilePath(module, `${module.name}.spec.ts`),
      content,
      language: 'typescript',
      description: `${module.name} 单元测试`,
    }
  }

  /**
   * 生成 README 文件
   */
  private generateReadmeFile(
    module: ModuleConfig,
    nodes: CustomNode[],
    allModules: ModuleConfig[]
  ): GeneratedCodeFile {
    const dependentModules = allModules.filter(m => 
      m.dependencies.includes(module.id)
    )

    const content = `# ${module.name}

## 概述

${module.description || `**${module.name}** 模块 - ${module.type} 类型，属于 ${module.layer} 层`}

- **版本**: ${module.version}
- **类型**: ${module.type}
- **层级**: ${module.layer}
- **节点数**: ${nodes.length}

## 功能特性

${nodes.map(n => `- ${n.data.label} (${n.data.type})`).join('\n')}

## 依赖关系

### 依赖的模块
${module.dependencies.length > 0 
  ? module.dependencies.map(depId => {
      const dep = allModules.find(m => m.id === depId)
      return `- ${dep?.name || depId}`
    }).join('\n')
  : '无'
}

### 被以下模块依赖
${dependentModules.length > 0
  ? dependentModules.map(m => `- ${m.name}`).join('\n')
  : '无'
}

## 使用示例

\`\`\`typescript
import { ${this.toPascalCase(module.name)}Module } from './${this.toCamelCase(module.name)}'

// 初始化模块
await ${this.toCamelCase(module.name)}Module.initialize()

// 获取模块信息
const info = ${this.toCamelCase(module.name)}Module.getInfo()
console.log(info)
\`\`\`

## API 文档

${nodes.map(n => `### ${n.data.label}
${n.data.config?.description || '暂无描述'}
`).join('\n')}

## 开发指南

### 前置要求

- Node.js >= 18
- TypeScript >= 5.0

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 运行测试

\`\`\`bash
npm test
\`\`\`

## 变更日志

- v${module.version} - 初始版本

## 维护者

Generated by Meta-Arch
`

    return {
      path: this.getModuleFilePath(module, 'README.md'),
      content,
      language: 'markdown',
      description: `${module.name} 模块文档`,
    }
  }

  // ==================== 工具方法 ====================

  private categorizeNodesByType(nodes: CustomNode[]) {
    return {
      frontend: nodes.filter(n => n.data.type === 'frontend'),
      api: nodes.filter(n => n.data.type === 'api'),
      service: nodes.filter(n => n.data.type === 'service'),
      repository: nodes.filter(n => n.data.type === 'repository'),
      database: nodes.filter(n => n.data.type === 'database'),
      agent: nodes.filter(n => n.data.type === 'agent'),
      persona: nodes.filter(n => n.data.type === 'persona'),
    }
  }

  private generateImports(module: ModuleConfig, nodes: CustomNode[]): string {
    const imports = new Set<string>()
    
    // 添加模块依赖的导入
    module.dependencies.forEach(depId => {
      imports.add(`import { ${this.toPascalCase(depId)}Module } from '../${depId}'`)
    })

    // 添加节点相关的导入
    nodes.forEach(node => {
      if (node.data.type === 'api') {
        imports.add("import { Controller, Get, Post, Body } from '@nestjs/common'")
      }
      if (node.data.type === 'service') {
        imports.add("import { Injectable } from '@nestjs/common'")
      }
      if (node.data.type === 'database' || node.data.type === 'repository') {
        imports.add("import { Injectable, InjectDataSource } from '@nestjs/typeorm'")
        imports.add("import { DataSource } from 'typeorm'")
      }
    })

    return Array.from(imports).join('\n') + '\n'
  }

  private generateModuleComments(module: ModuleConfig): string {
    return `/**
 * @module ${module.name}
 * @version ${module.version}
 * @type ${module.type}
 * @layer ${module.layer}
 * @description ${module.description || `Generated ${module.name} module`}
 */
`
  }

  private generateDependencyDeclarations(module: ModuleConfig): string {
    return `// 模块依赖
const dependencies = ${JSON.stringify(module.dependencies, null, 2)}
`
  }

  private generateExportDeclarations(module: ModuleConfig): string {
    return `// 模块导出
const exports = ${JSON.stringify(module.exports.map(e => e.name), null, 2)}
`
  }

  private generateInitializationCode(nodes: CustomNode[], edges: Edge[]): string {
    const initSteps = nodes.map(node => {
      return `// 初始化 ${node.data.label}
    await this.initialize${this.toPascalCase(node.data.label)}()`
    }).join('\n\n    ')

    return `// 模块初始化步骤
    console.log('Initializing ${module.name} module...')
    
${initSteps}
    
    console.log('${module.name} module initialized successfully')`
  }

  private getApiDecorator(node: CustomNode): string {
    const config = node.data.config as any
    if (config?.methods?.includes('POST')) return 'Post'
    if (config?.methods?.includes('PUT')) return 'Put'
    if (config?.methods?.includes('DELETE')) return 'Delete'
    return 'Get'
  }

  private getNodePath(node: CustomNode): string {
    return `/${this.toKebabCase(node.data.label)}`
  }

  private getModuleFilePath(module: ModuleConfig, filename: string): string {
    const baseDir = `src/modules/${this.toKebabCase(module.name)}`
    return `${baseDir}/${filename}`
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  }

  private toCamelCase(str: string): string {
    return this.toPascalCase(str).replace(/^[A-Z]/, c => c.toLowerCase())
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toLowerCase()
  }
}

// 导出便捷函数
export function generateModuleCode(
  module: ModuleConfig,
  nodes: CustomNode[],
  edges: Edge[],
  allModules: ModuleConfig[],
  config?: Partial<CodeGenerationConfig>
): GeneratedCodeFile[] {
  const generator = new ModuleCodeGenerator(config)
  return generator.generateModuleCode(module, nodes, edges, allModules)
}
