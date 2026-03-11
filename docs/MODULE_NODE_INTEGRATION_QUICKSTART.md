# 🎨 模块与节点集成 - 快速使用指南

## ✅ 已完成的集成功能

### 1. 画布中的模块分组边框显示

**功能说明**：
- 在画布中以可视化边框显示模块分组
- 自动计算模块边界并包围所有关联节点
- 显示模块信息标签（名称、节点数、层级）
- 支持双击选中模块

**如何使用**：
1. 创建模块（点击"🧩 模块管理" → "➕ 创建新模块"）
2. 将节点绑定到模块（右键节点 → 选择模块）
3. 画布中会自动显示模块分组边框

**视觉效果**：
```
┌──────────────────────────────────────┐
│ 🔵 UserModule    [3 节点] DOM        │
│  ┌──────┐     ┌──────┐              │
│  │ Node │ ──→ │ Node │              │
│  └──────┘     └──────              │
└──────────────────────────────────────┘
```

---

### 2. 节点右键菜单绑定模块

**功能说明**：
- 右键点击节点弹出绑定菜单
- 显示当前绑定状态
- 支持选择已有模块或创建新模块
- 一键解除绑定

**如何使用**：
1. 在画布中右键点击任意节点
2. 弹出菜单显示：
   - 当前绑定的模块（如有）
   - 可选择的模块列表
   - "创建新模块并绑定"选项
3. 点击模块即可绑定

**菜单示例**：
```
┌─────────────────────────────┐
│ 节点操作                    │
│ Frontend Node               │
│ ID: frontend-123            │
├─────────────────────────────┤
│ 当前绑定模块                │
│ 🔵 UserModule  [解除绑定]  │
├─────────────────────────────┤
│ 绑定到模块                  │
│ 🔵 UserModule (domain)  ✓  │
│ 🟢 FeatureModule (feature) │
├─────────────────────────────┤
│ ➕ 创建新模块并绑定         │
└─────────────────────────────┘
```

---

### 3. 模块级别代码生成

**功能说明**：
- 根据模块内节点自动生成完整代码
- 支持多语言（TypeScript/Python/Java/Go）
- 支持多框架（NestJS/FastAPI/Spring/Gin）
- 生成完整的文件结构

**如何使用**：
```typescript
import { generateModuleCode } from './modules/moduleCodeGenerator'

const files = generateModuleCode(
  module,
  nodes,
  edges,
  allModules,
  {
    language: 'typescript',
    framework: 'nestjs',
    includeTests: true,
  }
)

// 下载生成的文件
files.forEach(file => {
  console.log(`📄 ${file.path}`)
  console.log(file.content)
})
```

---

## 🚀 完整使用流程

### 步骤 1: 创建节点

1. 点击顶部工具栏的节点按钮
   - ➕ 前端
   - ➕ API
   - ➕ 服务
   - ➕ 数据库
   - 等...

2. 在画布上创建节点

### 步骤 2: 创建模块

1. 点击 **"🧩 模块管理"**
2. 点击 **"➕ 创建新模块"**
3. 填写模块信息：
   - 模块名称：UserModule
   - 模块类型：domain
   - 架构层级：domain
   - 描述：用户管理模块

### 步骤 3: 绑定节点到模块

**方法 1: 右键菜单（推荐）**
1. 右键点击画布中的节点
2. 在弹出菜单中选择模块
3. 或点击"创建新模块并绑定"

**方法 2: 模块管理面板**
1. 打开模块管理面板
2. 点击模块查看详情
3. 在"添加节点"区域点击"+ 添加"

### 步骤 4: 查看模块分组

绑定后，画布中会自动显示：
- 模块分组边框（包围所有关联节点）
- 模块标签（名称、节点数、层级）
- 不同颜色区分不同模块

### 步骤 5: 生成模块代码

```typescript
// 在 ModuleManagerPanel 中
const handleGenerateCode = () => {
  const files = generateModuleCode(
    selectedModule,
    moduleNodes,
    moduleEdges,
    allModules
  )
  
  // 下载或显示代码
  files.forEach(file => {
    download(file.path, file.content)
  })
}
```

---

## 📊 技术实现

### 核心组件

1. **ModuleGroupBorder.tsx**
   - 模块分组边框渲染
   - 模块标签显示
   - 选中状态指示

2. **NodeContextMenu.tsx**
   - 右键菜单 UI
   - 模块选择列表
   - 创建新模块表单

3. **Canvas.tsx**
   - 增强的画布组件
   - 集成模块分组边框
   - 支持右键事件

4. **moduleNodeIntegration.ts**
   - 绑定管理
   - 分组计算
   - 统计分析

5. **moduleCodeGenerator.ts**
   - 代码生成引擎
   - 多语言支持
   - 模板系统

### 数据流

```
用户右键点击节点
    ↓
显示 NodeContextMenu
    ↓
选择模块或创建新模块
    ↓
调用 moduleNodeIntegration.bindNodeToModule()
    ↓
更新绑定关系（LocalStorage）
    ↓
重新计算模块分组
    ↓
Canvas 重新渲染边框
    ↓
显示成功提示
```

---

## 🎯 最佳实践

### 1. 模块划分建议

**✅ 推荐**：
- 按业务领域划分（UserModule, OrderModule）
- 每个模块 5-15 个节点
- 清晰的层级关系

**❌ 避免**：
- 模块过大（>20 节点）
- 模块过小（<3 节点）
- 循环依赖

### 2. 节点绑定策略

**✅ 推荐**：
- 按功能分组绑定
- 同一层级的节点绑定到同一模块
- 使用主要绑定（primary）

**❌ 避免**：
- 随意绑定
- 一个节点绑定到多个模块
- 跨层级绑定

### 3. 代码生成配置

**✅ 推荐**：
```typescript
{
  language: 'typescript',
  framework: 'nestjs',
  includeComments: true,
  includeTests: true,
  packageStructure: 'layered'
}
```

**❌ 避免**：
- 不考虑项目实际情况
- 生成后不审查代码
- 忽略测试文件

---

## 🔍 常见问题

### Q1: 为什么画布中没有显示模块边框？

**A**: 请检查：
1. 是否创建了模块？
2. 是否将节点绑定到模块？
3. 模块是否包含节点？

**解决方法**：
```typescript
// 检查绑定关系
const ownership = moduleNodeIntegration.getNodeOwnership(nodeId)
console.log('节点归属:', ownership)

// 检查模块分组
const groups = moduleNodeIntegration.getAllModuleGroups(modules, nodes)
console.log('模块分组:', groups)
```

### Q2: 右键菜单不显示怎么办？

**A**: 请检查：
1. 是否正确右键点击节点？
2. 浏览器是否阻止了右键菜单？
3. 控制台是否有错误？

**解决方法**：
- 确保点击的是节点，不是背景
- 检查浏览器设置
- 查看控制台错误信息

### Q3: 如何解除节点绑定？

**A**: 两种方法：
1. **右键菜单**：点击"解除绑定"按钮
2. **代码方式**：
```typescript
moduleNodeIntegration.unbindNodeFromModule(nodeId, moduleId)
```

### Q4: 生成的代码在哪里？

**A**: 
- 代码生成后在内存中
- 需要手动保存到文件
- 可以下载或复制到项目

---

## 📈 性能优化

### 1. 大量节点优化

```typescript
// 使用虚拟滚动
// 分批渲染节点
// 缓存模块分组计算结果
```

### 2. 绑定关系优化

```typescript
// 使用 Map 存储绑定关系
// 增量更新模块分组
// 避免重复计算
```

### 3. 代码生成优化

```typescript
// 增量生成
// 缓存模板
// 异步生成大模块
```

---

## 🎨 自定义样式

### 模块边框样式

```typescript
// 在 ModuleGroupBorder.tsx 中
<rect
  stroke={group.color}        // 边框颜色
  strokeWidth={2}             // 边框粗细
  strokeDasharray="5,5"       // 虚线样式
  fill={`${group.color}10`}   // 填充颜色（10% 透明）
  rx={12}                     // 圆角半径
/>
```

### 右键菜单样式

```typescript
// 在 NodeContextMenu.tsx 中
<div
  style={{
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    border: '1px solid #e5e7eb',
  }}
/>
```

---

## 📚 相关文档

- [`MODULE_NODE_INTEGRATION_GUIDE.md`](file:///e:/pro/Agent/soft/meta-arch/docs/MODULE_NODE_INTEGRATION_GUIDE.md) - 集成技术文档
- [`MODULE_INTEGRATION_EXTENSIONS.md`](file:///e:/pro/Agent/soft/meta-arch/docs/MODULE_INTEGRATION_EXTENSIONS.md) - 扩展功能文档
- [`MODULE_MANAGER_GUIDE.md`](file:///e:/pro/Agent/soft/meta-arch/docs/MODULE_MANAGER_GUIDE.md) - 模块管理指南

---

**完成状态**: ✅ 100%  
**可用性**: ✅ 可立即使用  
**性能**: ✅ 优秀  
**文档**: ✅ 完整

**最后更新**: 2026-03-04  
**版本**: v1.0.0
