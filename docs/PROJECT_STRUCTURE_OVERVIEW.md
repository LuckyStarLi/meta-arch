# 📊 Meta-Arch 项目完整结构与流程

## 🎯 项目概述

**Meta-Arch** 是一个基于 Web 的可视化架构设计工具，用于：
- 🎨 可视化创建和管理系统架构节点
- 🔗 建立节点间的连接关系
- ✅ 验证架构设计的规范性
- 📦 管理模块和依赖关系
- 📝 导出架构设计为代码

**技术栈**：
- 前端：React + TypeScript + Vite
- 可视化：React Flow
- 布局：Dagre（自动布局算法）
- 存储：LocalStorage

---

## 📁 完整项目结构

```
meta-arch/
├── 📄 配置文件
│   ├── package.json              # 项目依赖和脚本
│   ├── tsconfig.json             # TypeScript 配置
│   ├── vite.config.ts            # Vite 构建配置
│   ├── eslint.config.js          # ESLint 代码检查
│   └── index.html                # 入口 HTML
│
├── 📚 文档 (docs/)
│   ├── MODULE_MANAGER_GUIDE.md   # 模块管理使用指南
│   ├── TEMPLATE_MANAGER_GUIDE.md # 模板管理使用指南
│   ├── DESIGN_CHECK_GUIDE.md     # 设计检查指南
│   └── ... (其他文档)
│
├── 🌐 源代码 (src/)
│   │
│   ├── 📱 核心应用
│   │   ├── main.tsx              # 应用入口
│   │   ├── App.tsx               # 主应用组件 ⭐
│   │   ├── App.css               # 应用样式
│   │   └── index.css             # 全局样式
│   │
│   ├── 🎨 组件 (components/)
│   │   ├── TopBar.tsx            # 顶部工具栏 ⭐
│   │   ├── ConfigPanel.tsx       # 节点配置面板 ⭐
│   │   ├── LayoutConfigPanel.tsx # 布局配置面板
│   │   ├── DesignCheckReportPanel.tsx  # 设计检查报告
│   │   ├── TemplateManagerPanel.tsx    # 模板管理面板
│   │   ├── ModuleManagerPanel.tsx      # 模块管理面板 ⭐
│   │   ├── ModuleContainer.tsx         # 模块容器
│   │   ├── Canvas.tsx                  # 画布组件
│   │   └── componentLibrary.ts         # 组件库定义
│   │
│   ├── 🔧 核心功能模块
│   │   ├── types.ts                    # 类型定义 ⭐
│   │   ├── nodeConfig.ts               # 节点配置 ⭐
│   │   ├── connectionRules.ts          # 连接规则验证 ⭐
│   │   ├── autoLayout.ts               # 自动布局算法 ⭐
│   │   ├── designChecker.ts            # 设计检查器 ⭐
│   │   ├── templateManager.ts          # 模板管理器 ⭐
│   │   ├── exportArchitecture.ts       # 架构导出
│   │   └── codeGenerator.ts            # 代码生成
│   │
│   ├── 🧩 节点系统 (nodes/)
│   │   ├── AgentNode.tsx       # Agent 节点组件
│   │   ├── PersonaNode.tsx     # 数字角色节点组件
│   │   └── index.ts            # 节点导出
│   │
│   ├── 📦 模块系统 (modules/)
│   │   ├── moduleSystem.ts     # 模块系统核心 ⭐
│   │   ├── dependencyManager.ts # 依赖管理 ⭐
│   │   ├── layerValidator.ts    # 层级验证
│   │   └── moduleInterfaces.ts  # 模块接口定义
│   │
│   ├── 🤖 AI 相关 (ai/)
│   │   └── promptTemplates.ts  # AI Prompt 模板
│   │
│   ├── 📊 元数据 (metadata/)
│   │   ├── nodeMetadata.ts     # 节点元数据
│   │   └── techStackEnhancer.ts # 技术栈增强
│   │
│   ├── 🔀 交互系统 (interaction/)
│   │   ├── flowDiagramGenerator.ts  # 流程图生成
│   │   ├── interactionAnnotator.ts  # 交互标注
│   │   └── stateMachine.ts          # 状态机
│   │
│   ├── 📱 响应式系统 (responsive/)
│   │   └── responsiveSystem.ts # 响应式配置
│   │
│   ├── ✅ 验证器 (validators/)
│   │   └── namingValidator.ts  # 命名验证器
│   │
│   ├── 🧪 测试 (__tests__/)
│   │   ├── autoLayout.test.ts
│   │   ├── connectionRules.test.ts
│   │   └── newNodes.test.ts
│   │
│   └── 🎨 设计资源
│       ├── designTokens.ts     # 设计令牌
│       └── layout.ts           # 布局工具
│
└── 🌍 公共资源 (public/)
    └── vite.svg
```

---

## 🔄 核心工作流程

### 1️⃣ 应用启动流程

```
index.html
    ↓
main.tsx (React 入口)
    ↓
App.tsx (主应用组件)
    ↓
├─ TopBar (工具栏)
├─ ReactFlow Canvas (画布)
│   ├─ Background (背景)
│   ├─ Controls (控制)
│   ├─ MiniMap (小地图)
│   └─ Custom Nodes (自定义节点)
└─ Panels (侧边面板)
    ├─ ConfigPanel
    ├─ LayoutConfigPanel
    ├─ DesignCheckReportPanel
    ├─ TemplateManagerPanel
    └─ ModuleManagerPanel
```

### 2️⃣ 节点创建流程

```
用户点击 TopBar 的节点按钮
    ↓
App.tsx 调用 addNode(type)
    ↓
创建 CustomNode 对象
├─ id: 唯一标识
├─ type: 节点类型 (frontend/api/service等)
├─ position: 随机位置
├─ data: 
│   ├─ label: 节点标签
│   ├─ type: 节点类型
│   └─ config: 节点配置
└─ style: 样式定义
    ↓
更新 nodes 状态 (useNodesState)
    ↓
ReactFlow 渲染节点到画布
```

### 3️⃣ 节点连接流程

```
用户在画布上拖拽连接线
    ↓
触发 onConnect(connection)
    ↓
获取 sourceNode 和 targetNode
    ↓
调用 validateConnection(source, target)
    ↓
检查连接规则
├─ 前端 → API ✅
├─ API → 服务 ✅
├─ 服务 → 数据库 ✅
└─ 反向连接 ❌
    ↓
验证通过 → addEdge(connection)
验证失败 → 显示错误提示
```

### 4️⃣ 自动布局流程

```
用户点击"🎨 一键排版"
    ↓
App.tsx 调用 handleAutoLayout()
    ↓
获取最优布局配置 getOptimalLayoutConfig()
    ↓
调用 autoLayout(nodes, edges, config)
    ↓
Dagre 算法计算节点位置
├─ 分层：presentation → application → domain → infrastructure
├─ 排序：同层内节点排序
└─ 定位：计算 x, y 坐标
    ↓
验证布局 validateLayout()
    ↓
更新节点位置
    ↓
显示统计信息
```

### 5️⃣ 设计检查流程

```
用户点击"🔍 设计检查"
    ↓
App.tsx 调用 handleDesignCheck()
    ↓
调用 runDesignCheck(nodes, edges)
    ↓
执行 6 维度检查
├─ 1. 架构规则检查 (30 分)
│   ├─ 分层架构验证
│   ├─ 依赖方向验证
│   └─ 模块完整性验证
├─ 2. 数据完整性检查 (20 分)
│   ├─ 数据库存在性
│   └─ 数据流向验证
├─ 3. 连接规则检查 (20 分)
│   ├─ 连接合规性
│   └─ 循环依赖检测
├─ 4. 性能检查 (10 分)
│   ├─ 单点故障检测
│   └─ 负载均衡评估
├─ 5. 可扩展性检查 (10 分)
│   └─ 水平扩展能力
└─ 6. 安全性检查 (10 分)
    ├─ 认证授权
    └─ 数据加密
    ↓
生成 DesignCheckReport
    ↓
显示 DesignCheckReportPanel
```

### 6️⃣ 模块管理流程

```
用户点击"🧩 模块管理"
    ↓
App.tsx 打开 ModuleManagerPanel
    ↓
从 LocalStorage 加载模块数据
    ↓
用户可以：
├─ 创建模块
│   ├─ 填写模块信息
│   ├─ validateModuleConfig()
│   └─ 保存到 LocalStorage
├─ 查看模块列表
│   └─ 显示模块卡片
├─ 删除模块
│   └─ 从 LocalStorage 移除
├─ 导出模块
│   └─ 下载 JSON 文件
└─ 清空所有
    └─ 清空 LocalStorage
```

### 7️⃣ 模板管理流程

```
用户点击"📁 模板管理"
    ↓
App.tsx 打开 TemplateManagerPanel
    ↓
加载架构模板
├─ 从 LocalStorage 加载用户模板
└─ 内置模板
    ↓
用户可以：
├─ 保存当前架构为模板
│   ├─ 收集 nodes 和 edges
│   ├─ 填写模板信息
│   └─ 保存到 LocalStorage
├─ 加载模板
│   ├─ 应用模板的 nodes
│   └─ 应用模板的 edges
└─ 删除模板
    └─ 从 LocalStorage 移除
```

---

## 🏗️ 核心数据结构

### 1. 节点结构 (CustomNode)

```typescript
interface CustomNode {
  id: string                      // 唯一标识：frontend-123456
  type: string                    // ReactFlow 节点类型：'default'
  position: { x: number, y: number }
  data: {
    label: string                 // 显示标签
    type: NodeKind                // 节点类型
    config: NodeConfig            // 节点配置
  }
  style: CSSProperties
}

type NodeKind = 
  | 'frontend' | 'api' | 'service' 
  | 'repository' | 'database' 
  | 'agent' | 'persona'
```

### 2. 连接结构 (Edge)

```typescript
interface Edge {
  id: string
  source: string                  // 源节点 ID
  target: string                  // 目标节点 ID
  type: string                    // 连线类型
  style: CSSProperties
}
```

### 3. 模块结构 (ModuleConfig)

```typescript
interface ModuleConfig {
  id: string
  name: string
  type: ModuleType                // core/feature/shared/等
  layer: ModuleLayer              // presentation/application/等
  version: string
  description?: string
  dependencies: string[]          // 依赖的模块 ID
  exports: ModuleExport[]
  nodes?: string[]                // 关联的节点 ID
  metadata: {
    createdAt?: string
    updatedAt?: string
  }
}
```

### 4. 设计检查报告 (DesignCheckReport)

```typescript
interface DesignCheckReport {
  totalScore: number              // 总分 (0-100)
  maxScore: number                // 满分 (100)
  percentage: number              // 百分比
  level: '优秀' | '良好' | '合格' | '不合格'
  dimensions: {
    name: string
    score: number
    maxScore: number
    issues: CheckIssue[]
  }[]
  issues: CheckIssue[]
  suggestions: string[]
}
```

---

## 🎯 核心功能模块详解

### 1. 节点配置系统 (nodeConfig.ts)

**功能**：
- 定义 7 种节点类型的默认配置
- 提供节点标签生成
- 提供节点颜色映射

**核心函数**：
```typescript
getDefaultConfig(type: NodeKind): NodeConfig
getNodeLabel(type: NodeKind): string
getNodeColor(type: NodeKind): string
```

### 2. 连接验证系统 (connectionRules.ts)

**功能**：
- 验证节点连接是否合规
- 检查架构规则
- 提供错误信息

**核心规则**：
```typescript
validateConnection(source, target)  // 验证单个连接
validateArchitecture(nodes, edges)  // 验证整体架构
getValidationError(type): string    // 获取错误信息
```

### 3. 自动布局系统 (autoLayout.ts)

**功能**：
- 使用 Dagre 算法自动排版
- 支持水平/垂直布局
- 支持节点间距配置

**核心函数**：
```typescript
autoLayout(nodes, edges, config)        // 执行布局
getOptimalLayoutConfig(nodes)           // 获取最优配置
validateLayout(original, laidOut)       // 验证布局
```

### 4. 设计检查系统 (designChecker.ts)

**功能**：
- 6 维度架构评估
- 问题检测和定位
- 改进建议生成

**检查维度**：
1. 架构规则 (30 分)
2. 数据完整性 (20 分)
3. 连接规则 (20 分)
4. 性能 (10 分)
5. 可扩展性 (10 分)
6. 安全性 (10 分)

### 5. 模块系统 (modules/)

**功能**：
- 创建和管理模块
- 管理模块依赖
- 验证层级规则

**核心模块**：
- `moduleSystem.ts`: 模块定义和基础操作
- `dependencyManager.ts`: 依赖图和管理
- `layerValidator.ts`: 层级验证

### 6. 模板系统 (templateManager.ts)

**功能**：
- 保存架构为模板
- 加载模板到画布
- 管理模板库

**存储**：LocalStorage

---

## 📊 数据流图

```
用户操作
    ↓
TopBar (按钮点击)
    ↓
App.tsx (状态管理中枢)
    ↓
├─ nodes 状态 ←→ ReactFlow Canvas
├─ edges 状态 ←→ ReactFlow Canvas
├─ modules 状态 ←→ LocalStorage
├─ templates 状态 ←→ LocalStorage
    ↓
各种功能面板
├─ ConfigPanel → 更新节点配置
├─ LayoutConfigPanel → 更新布局配置
├─ DesignCheckReportPanel → 显示检查结果
├─ TemplateManagerPanel → 管理模板
└─ ModuleManagerPanel → 管理模块
```

---

## 🔑 关键特性

### ✅ 已实现功能

1. **节点管理**
   - ✅ 7 种节点类型
   - ✅ 自定义节点样式
   - ✅ 节点配置面板
   - ✅ 节点删除

2. **连接管理**
   - ✅ 拖拽创建连接
   - ✅ 连接规则验证
   - ✅ 连接删除

3. **布局系统**
   - ✅ 自动布局 (Dagre)
   - ✅ 布局配置
   - ✅ 布局验证

4. **设计验证**
   - ✅ 6 维度检查
   - ✅ 问题定位
   - ✅ 改进建议

5. **模块管理**
   - ✅ 创建/删除模块
   - ✅ 模块验证
   - ✅ 数据持久化
   - ✅ 导出模块

6. **模板管理**
   - ✅ 保存模板
   - ✅ 加载模板
   - ✅ 删除模板

7. **数据持久化**
   - ✅ LocalStorage 存储
   - ✅ 自动保存

### 🚧 规划中功能

- [ ] 代码生成 (codeGenerator.ts)
- [ ] AI Prompt 集成
- [ ] 模块与节点完全集成
- [ ] 导出 FastAPI 项目
- [ ] 导入/导出项目

---

## 📝 开发规范

### 代码风格
- TypeScript 严格模式
- ESLint 零警告
- React Hooks 规范
- 组件化开发

### 文件命名
- 组件：PascalCase (`.tsx`)
- 工具函数：camelCase (`.ts`)
- 类型定义：PascalCase (`.ts`)

### 状态管理
- 使用 React useState/useReducer
- LocalStorage 持久化
- 单向数据流

---

## 🎓 学习路径

### 新人入门
1. 阅读 `README.md` - 项目介绍
2. 查看 `types.ts` - 了解数据结构
3. 阅读 `App.tsx` - 理解主流程
4. 查看组件 - 学习具体实现

### 深入理解
1. `connectionRules.ts` - 连接规则
2. `autoLayout.ts` - 布局算法
3. `designChecker.ts` - 设计检查
4. `modules/` - 模块系统

---

**最后更新**: 2026-03-03  
**版本**: v1.0.0  
**状态**: ✅ 核心功能完成
