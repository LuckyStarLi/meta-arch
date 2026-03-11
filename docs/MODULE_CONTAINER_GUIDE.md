# 模块容器功能实现指南

## ✅ 已完成的工作

### 1. 扩展 ModuleConfig 接口
**文件**: `src/modules/moduleSystem.ts`

添加了以下字段到 `ModuleConfig` 接口：

```typescript
export interface ModuleConfig {
  // ... 现有字段
  
  // 模块容器功能 - 包含的节点 IDs
  nodeIds?: string[]
  
  // 模块在画布上的位置和大小
  position?: {
    x: number
    y: number
  }
  size?: {
    width: number
    height: number
  }
  
  // 模块是否展开
  isCollapsed?: boolean
}
```

### 2. 添加模块管理工具函数
**文件**: `src/modules/moduleSystem.ts`

新增工具函数：

- `addNodeToModule(config, nodeId)` - 添加节点到模块
- `removeNodeFromModule(config, nodeId)` - 从模块移除节点
- `isNodeInModule(config, nodeId)` - 检查节点是否在模块内
- `getModuleDefaultSize(type)` - 获取模块默认尺寸
- `getModuleStyle(type)` - 获取模块颜色样式

### 3. 创建模块容器组件
**文件**: `src/components/ModuleContainer.tsx`

可视化模块容器，包含：
- 带颜色的边框和背景（根据模块类型）
- 模块标题栏（显示名称、类型、层级、节点数量）
- 折叠/展开按钮
- 空状态提示
- 子节点渲染区域

---

## 📋 待完成的工作

### 第一步：在 App.tsx 中集成模块容器

需要修改 `App.tsx`：

1. **添加模块状态管理**
```typescript
const [modules, setModules] = useState<ModuleConfig[]>([])
```

2. **渲染模块容器**
在 ReactFlow 之前渲染模块容器（作为背景层）

3. **节点与模块关联**
- 在 ConfigPanel 中添加"所属模块"选择器
- 节点拖拽时检测是否在模块范围内
- 自动将节点添加到模块的 nodeIds

### 第二步：实现拖拽功能

使用 ReactFlow 的拖拽 API：
- 检测节点是否在模块容器内
- 拖入时高亮模块容器
- 拖出时从模块移除

### 第三步：增强导出功能

修改 `exportArchitecture.ts`：
- 导出时包含模块结构
- 生成模块目录结构
- 创建模块索引文件

---

## 🎯 使用示例

### 创建模块并添加节点

```typescript
import { 
  createModuleConfig, 
  addNodeToModule,
  getModuleDefaultSize 
} from './modules/moduleSystem'

// 1. 创建模块
const cartModule = createModuleConfig(
  'cartModule',
  'feature',
  'domain',
  { description: '购物车功能模块' }
)

// 2. 设置模块位置和大小（在画布上）
const defaultSize = getModuleDefaultSize('feature')
cartModule.position = { x: 100, y: 100 }
cartModule.size = defaultSize

// 3. 添加节点到模块
const node = createNode('service') // 假设这是创建的节点
cartModule = addNodeToModule(cartModule, node.id)

// 4. 检查节点是否在模块内
const isInModule = isNodeInModule(cartModule, node.id) // true
```

### 渲染模块容器

```tsx
import ModuleContainer from './components/ModuleContainer'

// 在 App 组件中
{modules.map(module => (
  <ModuleContainer
    key={module.id}
    module={module}
    onCollapse={() => {
      module.isCollapsed = !module.isCollapsed
      updateModule(module)
    }}
  >
    {/* 渲染属于该模块的节点 */}
    {nodes
      .filter(node => module.nodeIds?.includes(node.id))
      .map(node => (
        <div
          key={node.id}
          style={{
            position: 'absolute',
            left: node.position.x,
            top: node.position.y,
          }}
        >
          <NodeComponent node={node} />
        </div>
      ))
    }
  </ModuleContainer>
))}
```

---

## 🎨 模块样式预览

不同模块类型的颜色：

| 模块类型 | 边框颜色 | 背景颜色 | 标题颜色 |
|---------|---------|---------|---------|
| 核心模块 (core) | #673ab7 | #f3e5f5 | #673ab7 |
| 功能模块 (feature) | #2196f3 | #e3f2fd | #1976d2 |
| 共享模块 (shared) | #4caf50 | #e8f5e9 | #388e3c |
| 基础设施 (infrastructure) | #ff9800 | #fff3e0 | #f57c00 |
| API 模块 (api) | #00bcd4 | #e0f7fa | #0097a7 |
| UI 模块 (ui) | #e91e63 | #fce4ec | #c2185b |
| 领域模块 (domain) | #9c27b0 | #f3e5f5 | #7b1fa2 |
| 应用模块 (application) | #3f51b5 | #e8eaf6 | #303f9f |

---

## 📦 最终导出结构

完成后，导出项目时会生成：

```
exported-project/
├── README.md
├── architecture.json      # 画布节点和连接
├── modules.json          # 模块定义和结构
└── src/
    ├── core/             # 核心模块目录
    │   ├── index.ts
    │   └── ...
    ├── features/         # 功能模块目录
    │   ├── cart/
    │   │   ├── index.ts
    │   │   ├── CartService.ts
    │   │   └── ...
    │   └── order/
    │   └── ...
    ├── domain/           # 领域模块目录
    ├── infrastructure/   # 基础设施模块目录
    └── api/             # API 模块目录
```

---

## 🚀 下一步行动

如果您想继续完成这个功能，需要：

1. **修改 App.tsx** - 添加模块容器渲染和状态管理
2. **实现拖拽检测** - 使用 ReactFlow 的拖拽 API
3. **更新 ConfigPanel** - 添加"所属模块"选择器
4. **增强导出功能** - 生成模块目录结构

或者，我们可以先测试现有的模块管理功能，确保它能正常工作，然后再添加容器功能。

---

## 💡 当前可用的功能

虽然模块容器功能还未完全集成，但以下功能已经可以使用：

✅ **模块定义和管理**
- 创建模块（8 种类型 × 4 个层级）
- 模块验证
- 模块依赖管理
- 模块导出管理

✅ **模块工具函数**
- 添加/移除节点到模块
- 检查节点是否在模块内
- 获取模块样式和尺寸

✅ **模块容器组件**
- 可视化渲染
- 折叠/展开
- 空状态提示

只需要将它们集成到 App.tsx 中即可！
