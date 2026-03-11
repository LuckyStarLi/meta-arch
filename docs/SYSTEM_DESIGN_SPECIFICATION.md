# 系统架构设计器 - 完整设计规范

**版本**: 1.0.0  
**创建日期**: 2026-02-28  
**最后更新**: 2026-02-28  
**状态**: 设计阶段

---

## 📋 目录

1. [系统概述](#1-系统概述)
2. [节点类型定义](#2-节点类型定义)
3. [节点详细规格](#3-节点详细规格)
4. [连接规则与逻辑流转](#4-连接规则与逻辑流转)
5. [参数系统与数据流](#5-参数系统与数据流)
6. [代码生成规范](#6-代码生成规范)
7. [验证规则](#7-验证规则)
8. [扩展性设计](#8-扩展性设计)

---

## 1. 系统概述

### 1.1 系统定位

本系统是一个**可视化系统架构设计器**，用于：
- 设计多层系统架构
- 定义节点间的逻辑关系
- 自动生成后端代码（FastAPI）
- 为 AI 开发提供标准化输入

### 1.2 核心概念

```
架构 (Architecture) = 节点 (Nodes) + 连接 (Edges) + 规则 (Rules)

节点 (Node)     : 系统组件的抽象表示
连接 (Edge)     : 组件间的调用关系
规则 (Rule)     : 连接的有效性约束
代码生成 (CodeGen): 基于架构生成可执行代码
```

### 1.3 架构层次模型

```
Level 0: Frontend (前端展示层)
         ↓ HTTP/REST API
Level 1: API (路由接口层)
         ↓ Function Call
Level 2: Service (业务逻辑层)
         ↓ Data Access
Level 3: Repository (数据仓库层)
         ↓ SQL/ORM
Level 4: Database (数据存储层)
```

**数据流向**: 单向向下（上层调用下层）  
**依赖关系**: 反向向上（下层被上层依赖）

---

## 2. 节点类型定义

### 2.1 节点类型枚举

```typescript
type NodeKind = 
  | 'frontend'    // 前端应用
  | 'api'         // API 接口
  | 'service'     // 业务服务
  | 'repository'  // 数据仓库
  | 'database'    // 数据库
```

### 2.2 节点通用属性

所有节点共享以下基础属性：

```typescript
interface BaseNode {
  // 身份标识
  id: string              // 唯一标识符，格式：{type}-{timestamp}-{random}
  type: NodeKind          // 节点类型
  
  // 显示属性
  label: string           // 显示名称
  position: {             // 画布位置
    x: number
    y: number
  }
  style?: {               // 样式配置
    background?: string
    border?: string
    borderRadius?: number
    padding?: number
    minWidth?: number
  }
  
  // 数据配置
  data: {
    type: NodeKind        // 节点类型（冗余，便于访问）
    label: string         // 显示名称
    config: NodeConfig    // 节点特定配置
  }
}
```

### 2.3 节点配置联合类型

```typescript
type NodeConfig = 
  | FrontendConfig    // 前端配置
  | ApiConfig         // API 配置
  | ServiceConfig     // 服务配置
  | RepositoryConfig  // 仓库配置
  | DatabaseConfig    // 数据库配置
```

---

## 3. 节点详细规格

### 3.1 Frontend 节点（前端应用）

**层级**: Level 0  
**职责**: 用户界面展示与交互  
**颜色**: `#61dafb` (React Blue)

#### 配置参数

```typescript
interface FrontendConfig {
  // 基础信息
  name: string                    // 应用名称，如："用户管理前端"
  
  // 技术选型
  framework: 'react' | 'vue' | 'angular'  // 前端框架
  
  // 运行配置
  port: number                    // 开发服务器端口，默认 3000
  
  // 扩展参数（可选）
  apiBaseUrl?: string             // API 基础地址
  enableSSR?: boolean             // 是否启用服务端渲染
  enablePWA?: boolean             // 是否启用渐进式 Web 应用
}
```

#### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| name | string | ✅ | - | 应用名称 |
| framework | enum | ✅ | 'react' | 前端框架 |
| port | number | ✅ | 3000 | 端口号 |
| apiBaseUrl | string | ❌ | '/api' | API 地址 |
| enableSSR | boolean | ❌ | false | SSR 支持 |
| enablePWA | boolean | ❌ | false | PWA 支持 |

#### 输出参数

```typescript
interface FrontendOutput {
  generatedFiles: {
    'package.json': string
    'src/App.tsx': string
    'src/main.tsx': string
    'src/config.ts': string
  }
  dependencies: string[]
  devDependencies: string[]
  scripts: {
    dev: string
    build: string
    preview: string
  }
}
```

#### 参数验证规则

```typescript
const FrontendValidationRules = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\s-]+$/
  },
  framework: {
    required: true,
    enum: ['react', 'vue', 'angular']
  },
  port: {
    required: true,
    min: 1024,
    max: 65535,
    default: 3000
  }
}
```

---

### 3.2 API 节点（API 接口）

**层级**: Level 1  
**职责**: 定义 RESTful API 端点  
**颜色**: `#009688` (Teal)

#### 配置参数

```typescript
interface ApiConfig {
  // 基础信息
  name: string                    // API 名称，如："创建用户"
  
  // 路由配置
  route: string                   // 路由路径，如："/api/users"
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'  // HTTP 方法
  
  // 数据模型
  requestModel: string            // 请求模型名称
  responseModel: string           // 响应模型名称
  
  // 安全配置
  requiresAuth: boolean           // 是否需要认证
  
  // 文档
  description: string             // API 描述
  tags?: string[]                 // Swagger 标签
  deprecated?: boolean            // 是否已废弃
}
```

#### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| name | string | ✅ | - | API 名称 |
| route | string | ✅ | - | 路由路径 |
| method | enum | ✅ | 'GET' | HTTP 方法 |
| requestModel | string | ❌ | - | 请求模型 |
| responseModel | string | ✅ | - | 响应模型 |
| requiresAuth | boolean | ✅ | false | 认证要求 |
| description | string | ✅ | - | 描述 |
| tags | string[] | ❌ | [] | 标签 |
| deprecated | boolean | ❌ | false | 废弃标记 |

#### 输出参数

```typescript
interface ApiOutput {
  routerCode: string              // 路由代码
  requestModel: string            // 请求模型定义
  responseModel: string           // 响应模型定义
  swaggerDoc: {
    tags: string[]
    summary: string
    description: string
    requestBody?: any
    responses: {
      [statusCode: string]: {
        description: string
        content?: any
      }
    }
  }
}
```

#### 路由路径验证

```typescript
const RouteValidationRules = {
  pattern: /^\/[a-z0-9/-]*$/,  // 必须以/开头，小写字母数字和斜杠
  reserved: ['/api', '/docs', '/health'],  // 保留路径
  maxDepth: 5,  // 最大路径深度 /a/b/c/d/e
  conventions: {
    plural: true,  // 使用复数 /users 而非 /user
    lowercase: true,  // 使用小写
    kebabCase: true  // 使用短横线 /user-profiles
  }
}
```

---

### 3.3 Service 节点（业务服务）

**层级**: Level 2  
**职责**: 实现业务逻辑  
**颜色**: `#ff9800` (Orange)

#### 配置参数

```typescript
interface ServiceConfig {
  // 基础信息
  name: string                    // 服务名称，如："用户服务"
  
  // 函数定义
  functionName: string            // 主函数名，如："create_user"
  
  // 业务逻辑
  description: string             // 服务描述
  businessRules?: string[]        // 业务规则列表
  
  // 事务配置
  requiresTransaction?: boolean   // 是否需要事务
  isolationLevel?: 'read_committed' | 'read_uncommitted' | 
                   'repeatable_read' | 'serializable'
  
  // 缓存配置
  enableCache?: boolean           // 是否启用缓存
  cacheTTL?: number               // 缓存过期时间（秒）
  cacheKey?: string               // 缓存键
}
```

#### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| name | string | ✅ | - | 服务名称 |
| functionName | string | ✅ | - | 函数名 |
| description | string | ✅ | - | 描述 |
| businessRules | string[] | ❌ | [] | 业务规则 |
| requiresTransaction | boolean | ❌ | false | 事务要求 |
| isolationLevel | enum | ❌ | 'read_committed' | 隔离级别 |
| enableCache | boolean | ❌ | false | 缓存启用 |
| cacheTTL | number | ❌ | 300 | 缓存时间 |
| cacheKey | string | ❌ | - | 缓存键 |

#### 输出参数

```typescript
interface ServiceOutput {
  serviceCode: string             // 服务类代码
  functionCode: string            // 函数代码
  dependencies: string[]          // 依赖的服务/仓库
  transactionConfig: {
    required: boolean
    isolationLevel: string
  }
  cacheConfig: {
    enabled: boolean
    ttl: number
    key: string
  }
}
```

#### 函数命名规范

```typescript
const FunctionNamingConvention = {
  style: 'snake_case',  // Python 风格
  pattern: /^[a-z_][a-z0-9_]*$/,
  prefixes: {
    create: ['create_', 'add_', 'insert_'],
    read: ['get_', 'read_', 'fetch_', 'find_'],
    update: ['update_', 'modify_', 'edit_'],
    delete: ['delete_', 'remove_', 'drop_'],
    list: ['list_', 'get_all_', 'get_many_']
  },
  reserved: ['__init__', '__str__', '__repr__']
}
```

---

### 3.4 Repository 节点（数据仓库）

**层级**: Level 3  
**职责**: 数据访问抽象层  
**颜色**: `#9c27b0` (Purple)

#### 配置参数

```typescript
interface RepositoryConfig {
  // 基础信息
  name: string                    // 仓库名称，如："用户仓库"
  
  // 数据模型
  entity: string                  // 实体名称，如："User"
  
  // 支持的操作
  operations: ('create' | 'read' | 'update' | 'delete')[]
  
  // 查询方法
  customQueries?: {
    name: string
    query: string
    parameters: {
      name: string
      type: string
    }[]
  }[]
  
  // 索引配置
  indexes?: {
    name: string
    fields: string[]
    unique?: boolean
    type?: 'btree' | 'hash' | 'gist' | 'gin'
  }[]
}
```

#### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| name | string | ✅ | - | 仓库名称 |
| entity | string | ✅ | - | 实体名称 |
| operations | enum[] | ✅ | ['read'] | 支持的操作 |
| customQueries | object[] | ❌ | [] | 自定义查询 |
| indexes | object[] | ❌ | [] | 索引配置 |

#### 输出参数

```typescript
interface RepositoryOutput {
  repositoryClass: string         // 仓库类代码
  entityModel: string             // 实体模型定义
  operations: {
    create?: string
    read?: string
    update?: string
    delete?: string
  }
  customQueries: string[]         // 自定义查询代码
  indexes: string[]               // 索引定义
}
```

#### 操作实现模板

```python
# Repository 基类模板
class BaseRepository:
    def __init__(self, db: Database):
        self.db = db
        self.entity = Entity  # 由子类指定

# 标准 CRUD 操作
async def create(self, item: Entity) -> Entity:
    self.db.add(item)
    await self.db.commit()
    await self.db.refresh(item)
    return item

async def get_by_id(self, id: int) -> Optional[Entity]:
    return await self.db.get(self.entity, id)

async def get_all(self, limit: int = 100, offset: int = 0) -> List[Entity]:
    return await self.db.query(self.entity).offset(offset).limit(limit).all()

async def update(self, id: int, item: Entity) -> Optional[Entity]:
    existing = await self.db.get(self.entity, id)
    if existing:
        for key, value in item.dict().items():
            setattr(existing, key, value)
        await self.db.commit()
        await self.db.refresh(existing)
    return existing

async def delete(self, id: int) -> bool:
    existing = await self.db.get(self.entity, id)
    if existing:
        await self.db.delete(existing)
        await self.db.commit()
        return True
    return False
```

---

### 3.5 Database 节点（数据库）

**层级**: Level 4  
**职责**: 数据持久化存储  
**颜色**: `#2196f3` (Blue)

#### 配置参数

```typescript
interface DatabaseConfig {
  // 基础信息
  name: string                    // 数据库名称
  
  // 类型配置
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite'  // 数据库类型
  
  // 连接配置
  host: string                    // 主机地址
  port: number                    // 端口号
  username?: string               // 用户名
  password?: string               // 密码（加密存储）
  database?: string               // 数据库名
  
  // 连接池配置
  poolSize?: number               // 连接池大小
  maxOverflow?: number            // 最大溢出连接数
  poolTimeout?: number            // 连接超时（秒）
  poolRecycle?: number            // 连接回收时间（秒）
  
  // 高级配置
  ssl?: boolean                   // 是否启用 SSL
  timezone?: string               // 时区
  charset?: string                // 字符集
}
```

#### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| name | string | ✅ | - | 数据库名称 |
| type | enum | ✅ | 'postgresql' | 数据库类型 |
| host | string | ✅ | 'localhost' | 主机地址 |
| port | number | ✅ | 5432 | 端口号 |
| username | string | ❌ | - | 用户名 |
| password | string | ❌ | - | 密码 |
| database | string | ❌ | name 字段值 | 数据库名 |
| poolSize | number | ❌ | 10 | 连接池大小 |
| maxOverflow | number | ❌ | 20 | 最大溢出 |
| poolTimeout | number | ❌ | 30 | 超时时间 |
| poolRecycle | number | ❌ | 3600 | 回收时间 |
| ssl | boolean | ❌ | false | SSL 启用 |
| timezone | string | ❌ | 'UTC' | 时区 |
| charset | string | ❌ | 'utf8mb4' | 字符集 |

#### 输出参数

```typescript
interface DatabaseOutput {
  connectionString: string        // 连接字符串（脱敏）
  databaseConfig: string          // 数据库配置代码
  engineConfig: string            // SQLAlchemy engine 配置
  sessionConfig: string           // Session 配置
  models: string[]                // 注册的模型列表
  migrations: {
    enabled: boolean
    tool: 'alembic' | 'sqlalchemy'
  }
}
```

#### 连接字符串格式

```typescript
const ConnectionStringTemplates = {
  postgresql: 'postgresql+asyncpg://{username}:{password}@{host}:{port}/{database}',
  mysql: 'mysql+aiomysql://{username}:{password}@{host}:{port}/{database}',
  sqlite: 'sqlite+aiosqlite:///{database}.db',
  mongodb: 'mongodb://{username}:{password}@{host}:{port}/{database}'
}

// 生成连接字符串（密码脱敏）
function generateConnectionString(config: DatabaseConfig): string {
  const template = ConnectionStringTemplates[config.type]
  return template
    .replace('{username}', config.username || '')
    .replace('{password}', '***')  // 脱敏
    .replace('{host}', config.host)
    .replace('{port}', config.port.toString())
    .replace('{database}', config.database || config.name)
}
```

---

## 4. 连接规则与逻辑流转

### 4.1 连接规则矩阵

```
┌──────────────┬─────────┬─────┬─────────┬────────────┬───────────┐
│ Source \     │         │     │         │            │           │
│ Target       │ API     │ Svc │ Repo    │ DB         │ Frontend  │
├──────────────┼──────────────┼─────────┼────────────┼───────────┤
│ Frontend     │ ✅      │ ❌  │ ❌      │ ❌         │ ❌        │
│ API          │ ❌      │ ✅  │ ❌      │ ❌         │ ❌        │
│ Service      │ ❌      │ ❌  │ ✅      │ ❌         │ ❌        │
│ Repository   │ ❌      │ ❌  │ ❌      │ ✅         │ ❌        │
│ Database     │ ❌      │ ❌  │ ❌      │ ❌         │ ❌        │
└──────────────┴─────────┴─────┴─────────┴────────────┴───────────┘

✅ = 允许连接
❌ = 禁止连接
```

### 4.2 连接规则定义

```typescript
interface ConnectionRule {
  // 规则定义
  source: NodeKind        // 源节点类型
  target: NodeKind        // 目标节点类型
  allowed: boolean        // 是否允许
  
  // 约束条件
  constraints?: {
    maxConnections?: number           // 最大连接数
    requireDirect?: boolean           // 是否要求直接连接
    allowedMethods?: string[]         // 允许的调用方法
  }
  
  // 验证逻辑
  validate?: (source: Node, target: Node) => {
    valid: boolean
    message: string
  }
}

const ConnectionRules: ConnectionRule[] = [
  {
    source: 'frontend',
    target: 'api',
    allowed: true,
    constraints: {
      maxConnections: 10,  // 前端最多连接 10 个 API
      requireDirect: true
    },
    validate: (source, target) => ({
      valid: true,
      message: '前端可以调用 API'
    })
  },
  {
    source: 'api',
    target: 'service',
    allowed: true,
    constraints: {
      maxConnections: 5,  // API 最多调用 5 个服务
      requireDirect: true
    },
    validate: (source, target) => {
      const apiConfig = source.data.config as ApiConfig
      const serviceConfig = target.data.config as ServiceConfig
      
      // 验证业务匹配
      if (!serviceConfig.functionName.includes(apiConfig.name.toLowerCase())) {
        return {
          valid: false,
          message: 'API 名称与服务函数名不匹配'
        }
      }
      
      return {
        valid: true,
        message: 'API 可以调用服务'
      }
    }
  },
  {
    source: 'service',
    target: 'repository',
    allowed: true,
    constraints: {
      maxConnections: 3  // 服务最多使用 3 个仓库
    }
  },
  {
    source: 'repository',
    target: 'database',
    allowed: true,
    constraints: {
      maxConnections: 1  // 仓库只能连接 1 个数据库
    }
  }
]
```

### 4.3 数据流转规则

```typescript
interface DataFlowRule {
  // 数据流方向
  direction: 'downstream' | 'upstream' | 'bidirectional'
  
  // 数据类型转换
  transformations: {
    fromType: string
    toType: string
    transformer: string  // 转换函数名
  }[]
  
  // 数据验证
  validation: {
    atNode: NodeKind
    rules: ValidationRule[]
  }[]
}

// 示例：请求数据流
const RequestDataFlow: DataFlowRule = {
  direction: 'downstream',
  transformations: [
    {
      fromType: 'HTTPRequest',
      toType: 'RequestModel',
      transformer: 'parse_request'
    },
    {
      fromType: 'RequestModel',
      toType: 'ServiceInput',
      transformer: 'prepare_service_input'
    },
    {
      fromType: 'ServiceInput',
      toType: 'Entity',
      transformer: 'map_to_entity'
    }
  ],
  validation: [
    {
      atNode: 'api',
      rules: ['validate_request_schema', 'check_auth']
    },
    {
      atNode: 'service',
      rules: ['validate_business_rules', 'check_permissions']
    },
    {
      atNode: 'repository',
      rules: ['validate_entity', 'check_constraints']
    }
  ]
}

// 示例：响应数据流
const ResponseDataFlow: DataFlowRule = {
  direction: 'upstream',
  transformations: [
    {
      fromType: 'Entity',
      toType: 'ResponseModel',
      transformer: 'map_to_response'
    },
    {
      fromType: 'ResponseModel',
      toType: 'HTTPResponse',
      transformer: 'format_response'
    }
  ]
}
```

### 4.4 调用链追踪

```typescript
interface CallChain {
  // 调用链 ID
  traceId: string
  
  // 调用路径
  path: {
    nodeId: string
    nodeType: NodeKind
    functionName?: string
    timestamp: number
    duration?: number
  }[]
  
  // 上下文数据
  context: {
    userId?: string
    requestId: string
    startTime: number
    endTime?: number
  }
  
  // 错误追踪
  error?: {
    nodeId: string
    message: string
    stackTrace?: string
  }
}

// 调用链生成示例
function generateCallChain(
  startNode: string,
  edges: Edge[]
): CallChain {
  const chain: CallChain = {
    traceId: generateTraceId(),
    path: [],
    context: {
      requestId: generateRequestId(),
      startTime: Date.now()
    }
  }
  
  // 遍历调用路径
  let currentNode = startNode
  while (currentNode) {
    const node =