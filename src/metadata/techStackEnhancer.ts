/**
 * 技术栈元数据增强系统
 * 为节点添加详细的技术栈信息，用于 AI 生成更精确的代码
 */

/**
 * 编程语言
 */
export type ProgrammingLanguage =
  | 'TypeScript'
  | 'JavaScript'
  | 'Python'
  | 'Java'
  | 'CSharp'
  | 'Go'
  | 'Rust'
  | 'Ruby'
  | 'PHP'
  | 'Swift'
  | 'Kotlin'
  | 'Scala'

/**
 * 前端框架
 */
export type FrontendFramework =
  | 'React'
  | 'Vue'
  | 'Angular'
  | 'Svelte'
  | 'Solid'
  | 'Next.js'
  | 'Nuxt'
  | 'Remix'
  | 'Astro'

/**
 * 后端框架
 */
export type BackendFramework =
  | 'Express'
  | 'NestJS'
  | 'Fastify'
  | 'Koa'
  | 'Django'
  | 'Flask'
  | 'FastAPI'
  | 'Spring Boot'
  | 'ASP.NET Core'
  | 'Gin'
  | 'Echo'
  | 'Fiber'
  | 'Rails'
  | 'Laravel'
  | 'Symfony'

/**
 * 数据库类型
 */
export type DatabaseType =
  | 'PostgreSQL'
  | 'MySQL'
  | 'MariaDB'
  | 'SQLite'
  | 'MongoDB'
  | 'Redis'
  | 'Elasticsearch'
  | 'Cassandra'
  | 'DynamoDB'
  | 'Snowflake'
  | 'BigQuery'

/**
 * 云服务提供商
 */
export type CloudProvider =
  | 'AWS'
  | 'Azure'
  | 'Google Cloud'
  | 'Alibaba Cloud'
  | 'Tencent Cloud'
  | 'Oracle Cloud'
  | 'IBM Cloud'

/**
 * 技术栈配置
 */
export interface TechStackConfig {
  language: ProgrammingLanguage
  version?: string
  frontend?: {
    framework: FrontendFramework
    version?: string
    libraries: string[]
    styling: ('CSS' | 'Sass' | 'Less' | 'Tailwind' | 'Styled Components' | 'Emotion' | 'MUI' | 'Ant Design')[]
    stateManagement?: ('Redux' | 'Zustand' | 'Jotai' | 'Recoil' | 'MobX' | 'Pinia' | 'Vuex')[]
    buildTool?: ('Vite' | 'Webpack' | 'Rollup' | 'esbuild' | 'Parcel')[]
  }
  backend?: {
    framework: BackendFramework
    version?: string
    libraries: string[]
    apiStyle: ('REST' | 'GraphQL' | 'gRPC' | 'WebSocket')[]
    authentication: ('JWT' | 'OAuth2' | 'Session' | 'API Key' | 'SAML')[]
  }
  database?: {
    type: DatabaseType
    version?: string
    orm?: ('Prisma' | 'TypeORM' | 'Sequelize' | 'Mongoose' | 'SQLAlchemy' | 'Hibernate' | 'Entity Framework')[]
    migration?: ('Flyway' | 'Liquibase' | 'Prisma Migrate' | 'TypeORM Migrations')[]
  }
  cloud?: {
    provider: CloudProvider
    services: string[]
    deployment: ('Docker' | 'Kubernetes' | 'Serverless' | 'App Service')[]
    ci_cd: ('GitHub Actions' | 'GitLab CI' | 'Jenkins' | 'CircleCI' | 'Azure DevOps')[]
  }
  testing?: {
    unit: ('Jest' | 'Vitest' | 'Mocha' | 'pytest' | 'JUnit')[]
    integration: ('Supertest' | 'Testing Library' | 'Cypress')[]
    e2e: ('Playwright' | 'Cypress' | 'Selenium' | 'Puppeteer')[]
    coverage: number // 目标覆盖率百分比
  }
  monitoring?: {
    logging: ('Winston' | 'Bunyan' | 'Pino' | 'Log4j' | 'Serilog')[]
    apm: ('New Relic' | 'Datadog' | 'Sentry' | 'Prometheus' | 'Grafana')[]
    alerting: ('PagerDuty' | 'Opsgenie' | 'Slack')[]
  }
}

/**
 * 技术栈推荐规则
 */
export interface TechStackRecommendation {
  nodeType: string
  recommended: Partial<TechStackConfig>
  alternatives: Array<{
    name: string
    config: Partial<TechStackConfig>
    pros: string[]
    cons: string[]
  }>
}

/**
 * 技术栈兼容性矩阵
 */
export interface CompatibilityMatrix {
  language: Record<ProgrammingLanguage, {
    compatibleFrontend: FrontendFramework[]
    compatibleBackend: BackendFramework[]
    compatibleORM: string[]
  }>
}

/**
 * 技术栈元数据
 */
export interface TechStackMetadata {
  id: string
  nodeId: string
  config: TechStackConfig
  rationale?: string
  alternatives?: Array<{
    name: string
    reason: string
  }>
  constraints?: string[]
  metadata?: {
    createdAt?: string
    updatedAt?: string
    author?: string
  }
}

/**
 * 创建技术栈配置
 */
export function createTechStackConfig(
  language: ProgrammingLanguage,
  overrides?: Partial<TechStackConfig>
): TechStackConfig {
  const baseConfig: TechStackConfig = {
    language,
    version: 'latest',
    frontend: undefined,
    backend: undefined,
    database: undefined,
    cloud: undefined,
    testing: undefined,
    monitoring: undefined,
  }

  if (overrides) {
    Object.assign(baseConfig, overrides)
  }

  return baseConfig
}

/**
 * 创建技术栈元数据
 */
export function createTechStackMetadata(
  nodeId: string,
  config: TechStackConfig,
  overrides?: Partial<TechStackMetadata>
): TechStackMetadata {
  const baseMetadata: TechStackMetadata = {
    id: generateTechStackId(),
    nodeId,
    config,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  if (overrides) {
    Object.assign(baseMetadata, overrides)
  }

  return baseMetadata
}

/**
 * 根据节点类型推荐技术栈
 */
export function recommendTechStack(nodeType: string): TechStackRecommendation {
  const recommendations: Record<string, TechStackRecommendation> = {
    component: {
      nodeType: 'component',
      recommended: {
        language: 'TypeScript',
        frontend: {
          framework: 'React',
          libraries: ['React Hooks', 'React Router'],
          styling: ['Tailwind', 'CSS Modules'],
          stateManagement: ['Zustand'],
          buildTool: ['Vite'],
        },
        testing: {
          unit: ['Vitest', 'Testing Library'],
          integration: ['Testing Library'],
          e2e: ['Playwright'],
          coverage: 80,
        },
      },
      alternatives: [
        {
          name: 'Vue 方案',
          config: {
            language: 'TypeScript',
            frontend: {
              framework: 'Vue',
              libraries: ['Vue Router', 'Pinia'],
              styling: ['Tailwind', 'Sass'],
              stateManagement: ['Pinia'],
              buildTool: ['Vite'],
            },
          },
          pros: ['学习曲线较低', '生态系统完善'],
          cons: ['大型企业应用案例相对较少'],
        },
        {
          name: 'Angular 方案',
          config: {
            language: 'TypeScript',
            frontend: {
              framework: 'Angular',
              libraries: ['RxJS', 'Angular Router'],
              styling: ['Sass', 'Angular Material'],
              buildTool: ['Webpack'],
            },
          },
          pros: ['企业级框架', '完整的解决方案'],
          cons: ['学习曲线陡峭', '配置复杂'],
        },
      ],
    },

    service: {
      nodeType: 'service',
      recommended: {
        language: 'TypeScript',
        backend: {
          framework: 'NestJS',
          libraries: ['@nestjs/common', '@nestjs/core', 'RxJS'],
          apiStyle: ['REST', 'GraphQL'],
          authentication: ['JWT', 'OAuth2'],
        },
        testing: {
          unit: ['Jest'],
          integration: ['Supertest', 'Testing Library'],
          e2e: ['Playwright'],
          coverage: 85,
        },
      },
      alternatives: [
        {
          name: 'Express 方案',
          config: {
            language: 'TypeScript',
            backend: {
              framework: 'Express',
              libraries: ['express', 'cors', 'helmet', 'compression'],
              apiStyle: ['REST'],
              authentication: ['JWT', 'Session'],
            },
          },
          pros: ['简单灵活', '生态系统最大'],
          cons: ['缺少内置架构', '需要手动配置'],
        },
        {
          name: 'Fastify 方案',
          config: {
            language: 'TypeScript',
            backend: {
              framework: 'Fastify',
              libraries: ['fastify', '@fastify/cors', '@fastify/helmet'],
              apiStyle: ['REST', 'GraphQL'],
              authentication: ['JWT'],
            },
          },
          pros: ['性能优秀', '低开销'],
          cons: ['生态系统相对较小'],
        },
      ],
    },

    database: {
      nodeType: 'database',
      recommended: {
        language: 'TypeScript',
        database: {
          type: 'PostgreSQL',
          orm: ['Prisma'],
          migration: ['Prisma Migrate'],
        },
      },
      alternatives: [
        {
          name: 'MySQL 方案',
          config: {
            database: {
              type: 'MySQL',
              orm: ['TypeORM', 'Sequelize'],
              migration: ['TypeORM Migrations'],
            },
          },
          pros: ['广泛使用', '文档丰富'],
          cons: ['高级特性相对较少'],
        },
        {
          name: 'MongoDB 方案',
          config: {
            database: {
              type: 'MongoDB',
              orm: ['Mongoose'],
            },
          },
          pros: ['灵活的文档模型', '水平扩展容易'],
          cons: ['事务支持有限', 'JOIN 操作复杂'],
        },
      ],
    },

    api: {
      nodeType: 'api',
      recommended: {
        language: 'TypeScript',
        backend: {
          framework: 'NestJS',
          libraries: ['@nestjs/common', '@nestjs/platform-express'],
          apiStyle: ['REST', 'GraphQL'],
          authentication: ['JWT', 'OAuth2'],
        },
        testing: {
          unit: ['Jest'],
          integration: ['Supertest'],
          coverage: 90,
        },
      },
      alternatives: [
        {
          name: 'GraphQL 专用方案',
          config: {
            backend: {
              framework: 'NestJS',
              libraries: ['@nestjs/graphql', 'apollo-server', 'type-graphql'],
              apiStyle: ['GraphQL'],
            },
          },
          pros: ['灵活的查询', '类型安全'],
          cons: ['学习曲线', '缓存复杂'],
        },
      ],
    },
  }

  return recommendations[nodeType] || {
    nodeType,
    recommended: {
      language: 'TypeScript',
    },
    alternatives: [],
  }
}

/**
 * 验证技术栈配置
 */
export function validateTechStackConfig(
  config: TechStackConfig
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // 语言检查
  if (!config.language) {
    errors.push('缺少编程语言配置')
  }

  // 前后端一致性检查
  if (config.frontend && !['TypeScript', 'JavaScript'].includes(config.language)) {
    warnings.push('前端开发通常使用 TypeScript 或 JavaScript')
  }

  if (config.backend && !['TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'CSharp', 'Ruby', 'PHP'].includes(config.language)) {
    warnings.push('后端框架与语言可能不匹配')
  }

  // ORM 与数据库一致性检查
  if (config.database && config.database.orm) {
    const orm = config.database.orm[0]
    const dbType = config.database.type

    const ormCompatibility: Record<string, DatabaseType[]> = {
      'Prisma': ['PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'MongoDB'],
      'TypeORM': ['PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'MongoDB'],
      'Sequelize': ['PostgreSQL', 'MySQL', 'MariaDB', 'SQLite'],
      'Mongoose': ['MongoDB'],
      'SQLAlchemy': ['PostgreSQL', 'MySQL', 'MariaDB', 'SQLite'],
      'Hibernate': ['PostgreSQL', 'MySQL', 'MariaDB', 'SQLite'],
      'Entity Framework': ['PostgreSQL', 'MySQL', 'SQLite'],
    }

    const compatibleDBs = ormCompatibility[orm] || []
    if (compatibleDBs.length > 0 && !compatibleDBs.includes(dbType)) {
      errors.push(`ORM "${orm}" 不支持数据库 "${dbType}"`)
    }
  }

  // 测试覆盖率建议
  if (config.testing) {
    if (config.testing.coverage < 70) {
      warnings.push('测试覆盖率目标低于 70%，建议提高到 80% 以上')
    }
    if (config.testing.coverage > 95) {
      suggestions.push('测试覆盖率目标超过 95%，可能增加维护成本')
    }
  }

  // 云服务检查
  if (config.cloud) {
    if (config.cloud.deployment.includes('Kubernetes') && !config.cloud.deployment.includes('Docker')) {
      errors.push('Kubernetes 部署需要 Docker 容器化')
    }
  }

  // 监控建议
  if (!config.monitoring) {
    suggestions.push('建议配置监控和日志系统')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * 生成技术栈文档
 */
export function generateTechStackDocumentation(
  metadata: TechStackMetadata
): string {
  const { config } = metadata
  let doc = `# 技术栈文档\n\n`

  if (metadata.rationale) {
    doc += `## 技术选型理由\n\n`
    doc += `${metadata.rationale}\n\n`
  }

  // 核心语言
  doc += `## 核心语言\n\n`
  doc += `- **语言**: ${config.language}`
  if (config.version) {
    doc += ` ${config.version}`
  }
  doc += '\n\n'

  // 前端技术栈
  if (config.frontend) {
    doc += `## 前端技术栈\n\n`
    doc += `- **框架**: ${config.frontend.framework}`
    if (config.frontend.version) {
      doc += ` ${config.frontend.version}`
    }
    doc += '\n'

    if (config.frontend.libraries.length > 0) {
      doc += `- **核心库**: ${config.frontend.libraries.join(', ')}\n`
    }

    if (config.frontend.styling.length > 0) {
      doc += `- **样式方案**: ${config.frontend.styling.join(', ')}\n`
    }

    if (config.frontend.stateManagement && config.frontend.stateManagement.length > 0) {
      doc += `- **状态管理**: ${config.frontend.stateManagement.join(', ')}\n`
    }

    if (config.frontend.buildTool && config.frontend.buildTool.length > 0) {
      doc += `- **构建工具**: ${config.frontend.buildTool.join(', ')}\n`
    }

    doc += '\n'
  }

  // 后端技术栈
  if (config.backend) {
    doc += `## 后端技术栈\n\n`
    doc += `- **框架**: ${config.backend.framework}`
    if (config.backend.version) {
      doc += ` ${config.backend.version}`
    }
    doc += '\n'

    if (config.backend.libraries.length > 0) {
      doc += `- **核心库**: ${config.backend.libraries.join(', ')}\n`
    }

    if (config.backend.apiStyle.length > 0) {
      doc += `- **API 风格**: ${config.backend.apiStyle.join(', ')}\n`
    }

    if (config.backend.authentication.length > 0) {
      doc += `- **认证方式**: ${config.backend.authentication.join(', ')}\n`
    }

    doc += '\n'
  }

  // 数据库技术栈
  if (config.database) {
    doc += `## 数据库技术栈\n\n`
    doc += `- **数据库**: ${config.database.type}`
    if (config.database.version) {
      doc += ` ${config.database.version}`
    }
    doc += '\n'

    if (config.database.orm && config.database.orm.length > 0) {
      doc += `- **ORM**: ${config.database.orm.join(', ')}\n`
    }

    if (config.database.migration && config.database.migration.length > 0) {
      doc += `- **迁移工具**: ${config.database.migration.join(', ')}\n`
    }

    doc += '\n'
  }

  // 云服务
  if (config.cloud) {
    doc += `## 云服务\n\n`
    doc += `- **提供商**: ${config.cloud.provider}\n`

    if (config.cloud.services.length > 0) {
      doc += `- **服务**: ${config.cloud.services.join(', ')}\n`
    }

    if (config.cloud.deployment.length > 0) {
      doc += `- **部署方式**: ${config.cloud.deployment.join(', ')}\n`
    }

    if (config.cloud.ci_cd.length > 0) {
      doc += `- **CI/CD**: ${config.cloud.ci_cd.join(', ')}\n`
    }

    doc += '\n'
  }

  // 测试策略
  if (config.testing) {
    doc += `## 测试策略\n\n`

    if (config.testing.unit.length > 0) {
      doc += `- **单元测试**: ${config.testing.unit.join(', ')}\n`
    }

    if (config.testing.integration.length > 0) {
      doc += `- **集成测试**: ${config.testing.integration.join(', ')}\n`
    }

    if (config.testing.e2e.length > 0) {
      doc += `- **端到端测试**: ${config.testing.e2e.join(', ')}\n`
    }

    doc += `- **目标覆盖率**: ${config.testing.coverage}%\n`
    doc += '\n'
  }

  // 监控和日志
  if (config.monitoring) {
    doc += `## 监控和日志\n\n`

    if (config.monitoring.logging.length > 0) {
      doc += `- **日志框架**: ${config.monitoring.logging.join(', ')}\n`
    }

    if (config.monitoring.apm.length > 0) {
      doc += `- **应用性能监控**: ${config.monitoring.apm.join(', ')}\n`
    }

    if (config.monitoring.alerting.length > 0) {
      doc += `- **告警服务**: ${config.monitoring.alerting.join(', ')}\n`
    }

    doc += '\n'
  }

  // 替代方案
  if (metadata.alternatives && metadata.alternatives.length > 0) {
    doc += `## 考虑的替代方案\n\n`
    metadata.alternatives.forEach(alt => {
      doc += `### ${alt.name}\n`
      doc += `${alt.reason}\n\n`
    })
  }

  // 约束条件
  if (metadata.constraints && metadata.constraints.length > 0) {
    doc += `## 技术约束\n\n`
    metadata.constraints.forEach(constraint => {
      doc += `- ${constraint}\n`
    })
    doc += '\n'
  }

  return doc
}

/**
 * 生成技术栈 ID
 */
function generateTechStackId(): string {
  return `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 技术栈兼容性矩阵
 */
export const techStackCompatibility: CompatibilityMatrix = {
  TypeScript: {
    compatibleFrontend: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'Remix'],
    compatibleBackend: ['Express', 'NestJS', 'Fastify', 'Koa'],
    compatibleORM: ['Prisma', 'TypeORM', 'Sequelize', 'Mongoose'],
  },
  JavaScript: {
    compatibleFrontend: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt'],
    compatibleBackend: ['Express', 'NestJS', 'Fastify', 'Koa'],
    compatibleORM: ['Prisma', 'TypeORM', 'Sequelize', 'Mongoose'],
  },
  Python: {
    compatibleFrontend: [],
    compatibleBackend: ['Django', 'Flask', 'FastAPI'],
    compatibleORM: ['SQLAlchemy', 'Django ORM', 'Tortoise ORM'],
  },
  Java: {
    compatibleFrontend: [],
    compatibleBackend: ['Spring Boot'],
    compatibleORM: ['Hibernate', 'JPA', 'MyBatis'],
  },
  CSharp: {
    compatibleFrontend: [],
    compatibleBackend: ['ASP.NET Core'],
    compatibleORM: ['Entity Framework', 'Dapper'],
  },
  Go: {
    compatibleFrontend: [],
    compatibleBackend: ['Gin', 'Echo', 'Fiber'],
    compatibleORM: ['GORM', 'sqlx', 'ent'],
  },
}

/**
 * 获取兼容的技术栈
 */
export function getCompatibleTechStack(language: ProgrammingLanguage): {
  frontend: FrontendFramework[]
  backend: BackendFramework[]
  orm: string[]
} {
  const compatibility = techStackCompatibility[language]
  
  if (!compatibility) {
    return {
      frontend: [],
      backend: [],
      orm: [],
    }
  }

  return {
    frontend: compatibility.compatibleFrontend,
    backend: compatibility.compatibleBackend,
    orm: compatibility.compatibleORM,
  }
}

export default {
  createTechStackConfig,
  createTechStackMetadata,
  recommendTechStack,
  validateTechStackConfig,
  generateTechStackDocumentation,
  getCompatibleTechStack,
  techStackCompatibility,
}
