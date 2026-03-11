# Meta-Arch 设计系统使用指南

**版本**: 2.0  
**更新日期**: 2026-03-04  
**状态**: ✅ 已完成

---

## 🚀 快速开始

### 1. 使用设计令牌

所有设计令牌都已在 CSS 变量中定义，可以直接在任何组件中使用：

```css
/* 在 CSS 文件中使用 */
.my-component {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  padding: var(--spacing-4);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
```

```tsx
// 在 React 组件中使用内联样式
<div style={{
  background: 'var(--color-primary-500)',
  padding: 'var(--spacing-4)',
  borderRadius: 'var(--radius-base)',
}}>
  内容
</div>
```

### 2. 使用全局工具类

直接在 JSX 中使用预定义的 CSS 类：

```tsx
<div className="flex items-center justify-center gap-4 p-6 bg-primary text-white rounded-lg shadow-md">
  <span className="text-lg font-semibold">Hello World</span>
</div>
```

**可用工具类**:
- 文本：`.text-sm`, `.text-base`, `.text-lg`, `.text-xl`
- 字体：`.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`
- 颜色：`.text-primary`, `.bg-success`, `.text-error` 等
- 间距：`.p-1` ~ `.p-6`, `.m-1` ~ `.m-6`
- 阴影：`.shadow-xs` ~ `.shadow-xl`
- 圆角：`.rounded-none` ~ `.rounded-full`
- 布局：`.flex`, `.flex-col`, `.items-center`, `.justify-center` 等

---

## 🎨 Toast 通知系统

### 基本使用

```tsx
import { useToast } from './hooks/useToast'

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast()

  const handleSave = () => {
    // 保存逻辑
    showSuccess('保存成功', '数据已成功保存')
  }

  const handleDelete = () => {
    // 删除逻辑
    showWarning('确认删除', '此操作不可恢复', {
      duration: 5000,
      action: {
        label: '撤销',
        onClick: () => console.log('撤销删除'),
      },
    })
  }

  const handleError = () => {
    showError('操作失败', '网络连接超时，请重试')
  }

  const handleInfo = () => {
    showInfo('提示信息', '系统将于今晚 22:00 进行维护')
  }

  return (
    <div>
      <button onClick={handleSave}>保存</button>
      <button onClick={handleDelete}>删除</button>
      <button onClick={handleError}>测试错误</button>
      <button onClick={handleInfo}>信息提示</button>
    </div>
  )
}
```

### 高级用法

```tsx
// 自定义 Toast
const { showToast } = useToast()

showToast({
  type: 'success',
  title: '自定义标题',
  message: '自定义消息内容',
  duration: 3000,
  position: 'top-center',
  closable: true,
  action: {
    label: '查看详情',
    onClick: () => window.open('/details'),
  },
})
```

### 位置选项
- `top-right` (默认)
- `top-center`
- `top-left`
- `bottom-right`
- `bottom-center`
- `bottom-left`

---

## 🦴 骨架屏加载

### 基本使用

```tsx
import Skeleton from './components/Skeleton'

function LoadingState() {
  return (
    <div>
      <Skeleton variant="text" size="lg" />
      <Skeleton variant="text" size="base" width="80%" />
      <Skeleton variant="circle" size="lg" />
      <Skeleton variant="rectangle" size="lg" />
    </div>
  )
}
```

### 复合组件

```tsx
import { SkeletonList, SkeletonTable, SkeletonCards, SkeletonPage } from './components/Skeleton'

function ComplexLoading() {
  return (
    <div>
      {/* 列表骨架屏 */}
      <SkeletonList count={5} avatar={true} />
      
      {/* 表格骨架屏 */}
      <SkeletonTable rows={5} columns={4} />
      
      {/* 卡片骨架屏 */}
      <SkeletonCards count={4} columns={3} />
      
      {/* 页面骨架屏 */}
      <SkeletonPage showHeader={true} cardCount={6} />
    </div>
  )
}
```

### 自定义样式

```tsx
<Skeleton
  variant="custom"
  width="200px"
  height="100px"
  className="my-custom-class"
  style={{ borderRadius: '12px' }}
  animation="wave" // 'wave' | 'pulse' | 'shimmer' | 'none'
  delay={1} // 0 | 1 | 2 | 3
/>
```

---

## ⌨️ 快捷键系统

### 基本使用

```tsx
import { useShortcutManager, PRESET_SHORTCUTS } from './hooks/useShortcuts'

function MyComponent() {
  const shortcutManager = useShortcutManager()

  // 注册自定义快捷键
  shortcutManager.register({
    key: 's',
    ctrl: true,
    handler: (event) => {
      console.log('Ctrl+S 被按下')
      // 执行保存操作
    },
    description: '保存当前内容',
  })

  // 注册组合键
  shortcutManager.register({
    key: 'z',
    ctrl: true,
    shift: true,
    handler: (event) => {
      console.log('Ctrl+Shift+Z 被按下')
      // 执行重做操作
    },
    description: '重做',
  })

  return <div>...</div>
}
```

### 使用预定义快捷键

```tsx
import { useShortcutManager, PRESET_SHORTCUTS } from './hooks/useShortcuts'

function Editor() {
  const shortcutManager = useShortcutManager()

  // 注册撤销快捷键
  shortcutManager.register({
    ...PRESET_SHORTCUTS.UNDO,
    handler: () => {
      // 执行撤销逻辑
      console.log('撤销')
    },
  })

  // 注册重做快捷键
  shortcutManager.register({
    ...PRESET_SHORTCUTS.REDO,
    handler: () => {
      // 执行重做逻辑
      console.log('重做')
    },
  })

  return <div>编辑器内容</div>
}
```

### 显示快捷键帮助

```tsx
import { ShortcutHelp, PRESET_SHORTCUTS } from './hooks/useShortcuts'

function HelpPanel() {
  const shortcuts = [
    PRESET_SHORTCUTS.UNDO,
    PRESET_SHORTCUTS.REDO,
    PRESET_SHORTCUTS.SAVE,
    PRESET_SHORTCUTS.DELETE,
    // ... 其他快捷键
  ]

  return (
    <div>
      <h2>快捷键帮助</h2>
      <ShortcutHelp shortcuts={shortcuts} title="可用快捷键" />
    </div>
  )
}
```

---

## 🎯 最佳实践

### 1. 使用设计令牌保持一致性

```css
/* ✅ 推荐：使用设计令牌 */
.button {
  background: var(--color-primary-500);
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
}

/* ❌ 不推荐：硬编码值 */
.button {
  background: #2196f3;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### 2. 使用工具类简化样式

```tsx
/* ✅ 推荐：使用工具类 */
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
  内容
</div>

/* ❌ 不推荐：写完整 CSS */
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
}}>
  内容
</div>
```

### 3. Toast 使用场景

```tsx
// ✅ 成功操作后立即显示
showSuccess('创建成功', '模块已成功创建')

// ✅ 错误操作后显示详细信息
showError('保存失败', '数据库连接超时，请检查网络连接')

// ✅ 警告操作提供撤销选项
showWarning('删除确认', '确定要删除这个项目吗？', {
  duration: 5000,
  action: {
    label: '撤销',
    onClick: undoDelete,
  },
})

// ✅ 重要信息提示
showInfo('系统通知', '系统将于今晚 22:00 进行维护，预计持续 2 小时')
```

### 4. 骨架屏使用场景

```tsx
// ✅ 数据加载时显示
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)

useEffect(() => {
  fetchData().then(result => {
    setData(result)
    setLoading(false)
  })
}, [])

if (loading) {
  return <SkeletonList count={5} />
}

return <DataList data={data} />
```

### 5. 快捷键命名规范

```tsx
// ✅ 推荐：清晰的命名
shortcutManager.register({
  key: 's',
  ctrl: true,
  handler: handleSave,
  description: '保存当前内容',
})

// ❌ 不推荐：模糊的命名
shortcutManager.register({
  key: 's',
  ctrl: true,
  handler: () => {},
  description: '操作',
})
```

---

## 📊 可用设计令牌

### 颜色系统

```css
/* 主色调 */
var(--color-primary-50) ~ var(--color-primary-900)

/* 辅助色 */
var(--color-accent-50) ~ var(--color-accent-900)

/* 中性色 */
var(--color-neutral-0) ~ var(--color-neutral-900)

/* 语义色 */
var(--color-success-50) ~ var(--color-success-900)
var(--color-warning-50) ~ var(--color-warning-900)
var(--color-error-50) ~ var(--color-error-900)
var(--color-info-50) ~ var(--color-info-900)

/* 节点类型色 */
var(--color-node-frontend)
var(--color-node-api)
var(--color-node-service)
var(--color-node-repository)
var(--color-node-database)
var(--color-node-agent)
var(--color-node-persona)

/* 模块类型色 */
var(--color-module-core)
var(--color-module-feature)
var(--color-module-shared)
var(--color-module-infrastructure)
var(--color-module-api)
var(--color-module-ui)
var(--color-module-domain)
var(--color-module-application)
```

### 间距系统

```css
var(--spacing-0)   /* 0 */
var(--spacing-1)   /* 4px */
var(--spacing-2)   /* 8px */
var(--spacing-3)   /* 12px */
var(--spacing-4)   /* 16px */
var(--spacing-5)   /* 20px */
var(--spacing-6)   /* 24px */
/* ... 更多间距 */
```

### 字体系统

```css
/* 字体大小 */
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */
var(--font-size-2xl)   /* 24px */
var(--font-size-3xl)   /* 30px */
var(--font-size-4xl)   /* 36px */

/* 字体粗细 */
var(--font-weight-normal)    /* 400 */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */
```

### 阴影系统

```css
/* 深度层级 */
var(--shadow-xs)
var(--shadow-sm)
var(--shadow-base)
var(--shadow-md)
var(--shadow-lg)
var(--shadow-xl)
var(--shadow-2xl)

/* 彩色阴影 */
var(--shadow-primary)
var(--shadow-accent)
var(--shadow-success)
var(--shadow-warning)
var(--shadow-error)
```

---

## 🔗 相关文档

- [设计提升总计划](./DESIGN_IMPROVEMENT_PLAN.md)
- [现状评估报告](./CURRENT_STATE_ASSESSMENT.md)
- [最终报告](./FINAL_REPORT.md)
- [设计令牌系统](../../src/styles/design-tokens.css)

---

**文档版本**: 1.0  
**最后更新**: 2026-03-04  
**维护者**: AI Assistant
