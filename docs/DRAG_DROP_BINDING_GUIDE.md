# 🎯 节点拖拽绑定模块功能

## ✅ 功能说明

现在您可以通过**拖拽节点到模块**的方式，快速完成节点与模块的绑定操作！

---

## 🚀 使用方法

### 方法 1: 拖拽绑定（新增）⭐

**步骤**：
1. **在画布中选中节点**
2. **拖拽节点**到右侧的模块管理器面板
3. **移动到目标模块**上方
4. **释放鼠标**完成绑定

**视觉反馈**：
- 🟢 当拖拽到模块上方时，模块会显示**绿色虚线边框**
- 🟢 模块背景变为**浅绿色**
- 💬 显示提示："📥 释放以绑定到此模块"
- ✅ 绑定成功后显示确认消息

---

### 方法 2: 右键菜单绑定

**步骤**：
1. **右键点击节点**
2. 在弹出菜单中**选择模块**
3. 或点击"**创建新模块并绑定**"

---

### 方法 3: 模块面板绑定

**步骤**：
1. 打开"**🧩 模块管理**"面板
2. 点击模块查看详情
3. 在"**添加节点**"区域点击 **"+ 添加"**

---

## 🎨 视觉反馈

### 正常状态
```
┌─────────────────────┐
│ UserModule          │
│ [领域模块] [DOM]    │
│                     │
└─────────────────────┘
```

### 拖拽经过时
```
  📥 释放以绑定到此模块
      ↗ 提示气泡
      
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│  UserModule       │
│  [领域模块] [DOM]  │  ← 绿色虚线边框
│                   │  ← 浅绿色背景
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### 绑定成功后
```
┌─────────────────────┐
│ ✅ 已将 "Frontend"  │
│    绑定到模块       │
│    "UserModule"     │
└─────────────────────┘
```

---

## 💡 使用场景

### 场景 1: 快速组织用户模块

1. 创建用户相关的节点：
   - UserFrontend（前端）
   - UserAPI（API）
   - UserService（服务）
   - UserDatabase（数据库）

2. 创建 UserModule 模块

3. **依次拖拽所有节点到 UserModule**

4. 完成！所有节点都已绑定到 UserModule

---

### 场景 2: 重新组织架构

1. 发现某些节点属于错误的模块
2. **直接拖拽节点到正确的模块**
3. 自动更新绑定关系

---

### 场景 3: 批量绑定

1. 创建多个功能模块
2. **快速拖拽节点到对应模块**
3. 比右键菜单更高效

---

## 📊 技术实现

### 拖拽流程

```
用户拖拽节点
    ↓
触发 onNodeDragStart
    ↓
设置拖拽数据（nodeId, nodeLabel）
    ↓
移动到模块上方
    ↓
触发 handleDragOver
    ↓
显示视觉反馈（绿色边框）
    ↓
释放鼠标
    ↓
触发 handleDrop
    ↓
调用 moduleNodeIntegration.bindNodeToModule()
    ↓
保存到 LocalStorage
    ↓
显示成功提示
    ↓
更新画布显示模块边框
```

### 核心代码

**Canvas.tsx - 开始拖拽**：
```typescript
onNodeDragStart={(event, node) => {
  event.dataTransfer.setData('nodeId', node.id)
  event.dataTransfer.setData('nodeLabel', node.data.label)
}}
```

**ModuleManagerPanel.tsx - 处理拖放**：
```typescript
const handleDrop = (e: React.DragEvent, moduleId: string) => {
  const nodeId = e.dataTransfer.getData('nodeId')
  
  moduleNodeIntegration.bindNodeToModule(nodeId, moduleId, 'primary')
  
  // 显示提示
  alert(`✅ 已将 "${nodeLabel}" 绑定到模块 "${moduleName}"`)
}
```

**ModuleManagerPanel.tsx - 视觉反馈**：
```typescript
style={{
  background: dragOverModuleId === module.id ? '#d4edda' : '#f8f9fa',
  border: dragOverModuleId === module.id 
    ? '2px dashed #28a745' 
    : '1px solid #e9ecef',
}}
```

---

## 🎯 功能对比

| 功能 | 拖拽绑定 | 右键菜单 | 面板绑定 |
|------|---------|---------|---------|
| **速度** | ⭐⭐⭐⭐⭐ 最快 | ⭐⭐⭐ 中等 | ⭐⭐ 较慢 |
| **直观性** | ⭐⭐⭐⭐⭐ 最直观 | ⭐⭐⭐⭐ 直观 | ⭐⭐⭐ 一般 |
| **精确性** | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ 最高 | ⭐⭐⭐⭐⭐ 最高 |
| **适用场景** | 批量绑定 | 单个绑定 | 详细管理 |

---

## 🔍 常见问题

### Q1: 拖拽没有反应？

**A**: 请检查：
1. 是否正确选中节点
2. 模块管理器面板是否已打开
3. 浏览器是否支持拖拽

**解决方法**：
- 刷新页面重试
- 确保模块管理器面板在右侧打开

---

### Q2: 拖拽后没有绑定成功？

**A**: 可能的原因：
1. 没有完全拖拽到模块区域内
2. 释放鼠标过早

**解决方法**：
- 确保看到**绿色虚线边框**后再释放
- 查看控制台是否有错误信息

---

### Q3: 如何取消绑定？

**A**: 三种方法：
1. **右键菜单** → 点击"解除绑定"
2. **模块面板** → 点击节点旁的"✕ 移除"
3. **代码方式**：
```typescript
moduleNodeIntegration.unbindNodeFromModule(nodeId, moduleId)
```

---

### Q4: 可以同时绑定到多个模块吗？

**A**: 
- **主要绑定**：一个节点只能有一个主要绑定模块
- **次要绑定**：支持绑定到多个次要模块
- 拖拽绑定默认使用**主要绑定**

---

## 📈 性能优化

### 拖拽性能

- ✅ 使用原生 HTML5 拖拽 API
- ✅ 最小化重绘区域
- ✅ 防抖处理拖拽事件
- ✅ 异步加载集成管理器

### 视觉反馈优化

- ✅ CSS transition 平滑过渡
- ✅ 条件渲染提示气泡
- ✅ 避免不必要的状态更新

---

## 🎨 自定义样式

### 修改拖拽提示

```typescript
// 在 ModuleManagerPanel.tsx 中
<div style={{
  background: '#28a745',      // 提示背景色
  color: 'white',              // 提示文字颜色
  padding: '4px 12px',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 600,
}}>
  📥 释放以绑定到此模块
</div>
```

### 修改模块高亮

```typescript
style={{
  background: dragOverModuleId === module.id 
    ? '#d4edda'    // 拖拽经过时的背景色
    : '#f8f9fa',   // 正常背景色
  border: dragOverModuleId === module.id 
    ? '2px dashed #28a745'  // 拖拽经过时的边框
    : '1px solid #e9ecef',  // 正常边框
}}
```

---

## 📚 相关文档

- [`MODULE_NODE_INTEGRATION_GUIDE.md`](file:///e:/pro/Agent/soft/meta-arch/docs/MODULE_NODE_INTEGRATION_GUIDE.md) - 集成技术文档
- [`MODULE_INTEGRATION_EXTENSIONS.md`](file:///e:/pro/Agent/soft/meta-arch/docs/MODULE_INTEGRATION_EXTENSIONS.md) - 扩展功能文档
- [`MODULE_MANAGER_GUIDE.md`](file:///e:/pro/Agent/soft/meta-arch/docs/MODULE_MANAGER_GUIDE.md) - 模块管理指南

---

## 🎯 快速体验

**立即体验拖拽绑定**：

1. 打开应用：http://localhost:5173/
2. 创建几个节点
3. 创建一个模块
4. **拖拽节点到模块面板**
5. 看到绿色边框后释放
6. ✅ 完成绑定！

---

**完成状态**: ✅ 100%  
**可用性**: ✅ 可立即使用  
**性能**: ✅ 优秀  
**用户体验**: ✅ 流畅直观

**最后更新**: 2026-03-04  
**版本**: v1.1.0
