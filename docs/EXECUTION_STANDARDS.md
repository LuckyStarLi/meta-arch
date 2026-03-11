# Meta-Arch 优化执行标准

## 📋 执行标准概述

本文档定义了优化项目的具体执行标准，确保所有团队成员遵循统一的开发流程和质量标准。

---

## 1️⃣ 代码开发标准

### 1.1 TypeScript 编码规范

#### 类型定义标准
```typescript
// ✅ 正确：明确的类型定义
interface UserConfig {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  metadata?: UserMetadata
}

interface UserMetadata {
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

// ❌ 错误：使用 any
interface BadConfig {
  data: any  // 禁止
  value: any // 禁止
}
```

#### 泛型使用标准
```typescript
// ✅ 正确：有意义的泛型约束
function createRepository<T extends Entity, ID = string>(
  entityName: string
): Repository<T, ID> {
  // ...
}

// ❌ 错误：过度复杂的泛型
function process<T, U, V, W, X>(...): ComplexType<T, U, V, W, X> // 避免超过 3 个泛型参数
```

#### 命名规范
```typescript
// 接口：PascalCase
interface UserRepository { }

// 类：PascalCase + 类型后缀
class UserService { }
class OrderController { }

// 函数：camelCase + 动词前缀
function getUserById() { }
function createOrder() { }
function validateInput() { }

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = '/api'

// 变量：camelCase
const userName = 'John'
const orderList: Order[] = []

// 类型：PascalCase + T 后缀
type UserT = { }
type ConfigT = { }
```

---

### 1.2 React 组件标准

#### 组件结构标准
```typescript
// ✅ 正确：标准组件结构
import { useState, useEffect } from 'react'
import type { ComponentProps } from './types'

// 类型定义
interface Props {
  title: string
  items: Item[]
  onItemClick: (item: Item) => void
}

// 显示名称
const ComponentName: React.FC<Props> = ({ title, items, onItemClick }) => {
  // 1. Hooks（按顺序）
  const [state, setState] = useState(initialState)
  const memoizedValue = useMemo(() => computeExpensive(state), [state])
  
  // 2. Effects
  useEffect(() => {
    // side effects
  }, [dependencies])
  
  // 3. Event Handlers
  const handleClick = useCallback((item: Item) => {
    onItemClick(item)
  }, [onItemClick])
  
  // 4. Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'

export default ComponentName
```

#### Props 解构标准
```typescript
// ✅ 正确：在函数参数中解构
const Component: React.FC<Props> = ({ 
  title, 
  items, 
  onItemClick,
  className = '',  // 默认值
  disabled = false,
}) => {
  // ...
}

// ❌ 错误：在函数体内解构
const Component: React.FC<Props> = (props) => {
  const { title, items } = props  // 避免
  // ...
}
```

#### 条件渲染标准
```typescript
// ✅ 正确：清晰的条件渲染
{isLoading && <LoadingSpinner />}

{items.length > 0 ? (
  <ItemList items={items} />
) : (
  <EmptyState />
)}

// ❌ 错误：隐式类型转换
{items.length && <ItemList />}  // 0 会渲染
{value && <Component />}        // 空字符串会渲染
```

---

### 1.3 CSS/样式标准

#### 类名命名标准
```typescript
// ✅ 正确：BEM 命名
<div className="card">
  <div className="card__header">
    <h3 className="card__title">Title</h3>
  </div>
  <div className="card__body">
    <p className="card__text">Content</p>
  </div>
  <button className="card__button card__button--primary">
    Action
  </button>
</div>

// ❌ 错误：随意命名
<div className="box">
  <div className="top">
    <div className="title">Title</div>
  </div>
</div>
```

#### 响应式设计标准
```typescript
// ✅ 正确：使用设计令牌的响应式
const styles = {
  container: {
    padding: designTokens.spacing.md,
    '@media (min-width: 768px)': {
      padding: designTokens.spacing.lg,
    },
    '@media (min-width: 1024px)': {
      padding: designTokens.spacing.xl,
    },
  },
}

// ❌ 错误：硬编码断点
const styles = {
  container: {
    padding: '16px',
    '@media (min-width: 768px)': {
      padding: '24px',  // 应该使用 spacing.lg
    },
  },
}
```

---

## 2️⃣ 测试标准

### 2.1 单元测试标准

#### 测试文件组织
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx      // ✅ 同级目录
      Button.stories.tsx
  utils/
    validator/
      namingValidator.ts
      namingValidator.test.ts  // ✅ 同级目录
```

#### 测试用例结构标准
```typescript
// ✅ 正确：标准测试结构
describe('NamingValidator', () => {
  // 测试组：验证功能
  describe('validateNodeName', () => {
    // 测试场景：正常情况
    it('应该通过规范的 PascalCase 命名', () => {
      const result = NamingValidator.validateNodeName('UserService', 'service')
      expect(result.valid).toBe(true)
    })
    
    // 测试场景：异常情况
    it('应该拒绝中文命名', () => {
      const result = NamingValidator.validateNodeName('用户服务', 'service')
      expect(result.valid).toBe(false)
    })
    
    // 测试场景：边界情况
    it('应该拒绝空字符串', () => {
      const result = NamingValidator.validateNodeName('', 'service')
      expect(result.valid).toBe(false)
    })
  })
  
  // 测试组：建议功能
  describe('suggestName', () => {
    it('应该将中文转换为英文 PascalCase', () => {
      const suggestion = NamingValidator.suggestName('用户', 'service')
      expect(suggestion).toBe('UserService')
    })
  })
})
```

#### 测试覆盖率标准
```typescript
// ✅ 必须测试的场景
describe('Service', () => {
  // 1. 正常路径
  it('应该在正常输入时返回正确结果', () => {})
  
  // 2. 异常路径
  it('应该在无效输入时抛出错误', () => {})
  
  // 3. 边界条件
  it('应该处理空输入', () => {})
  it('应该处理极大输入', () => {})
  
  // 4. 副作用
  it('应该调用外部依赖', () => {})
  
  // 5. 状态变化
  it('应该更新内部状态', () => {})
})
```

---

### 2.2 集成测试标准

#### API 测试标准
```typescript
describe('API Integration', () => {
  let apiClient: ApiClient
  
  beforeEach(() => {
    apiClient = new ApiClient(testConfig)
  })
  
  it('应该成功创建用户', async () => {
    // Arrange
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
    }
    
    // Act
    const user = await apiClient.createUser(userData)
    
    // Assert
    expect(user.id).toBeDefined()
    expect(user.name).toBe(userData.name)
    expect(user.email).toBe(userData.email)
  })
  
  it('应该在用户不存在时抛出 404', async () => {
    await expect(apiClient.getUser('non-existent-id'))
      .rejects
      .toThrow(ApiError)
  })
})
```

---

## 3️⃣ 代码审查标准

### 3.1 PR 模板标准

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 性能优化
- [ ] 重构
- [ ] 文档更新

## 变更描述
简要描述此 PR 的目的和变更内容

## 相关 Issue
Fixes #123

## 测试计划
- [ ] 单元测试已添加
- [ ] 集成测试已更新
- [ ] 手动测试已完成

## 测试截图
（如适用）

## 检查清单
- [ ] 代码遵循 TypeScript 规范
- [ ] 代码遵循 React 最佳实践
- [ ] 已添加必要的类型定义
- [ ] 已更新相关文档
- [ ] 测试覆盖率达标
```

---

### 3.2 代码审查清单

#### 功能性审查
- [ ] 功能是否按需求实现
- [ ] 是否处理了异常情况
- [ ] 是否考虑了边界条件
- [ ] 是否有性能问题

#### 代码质量审查
- [ ] 代码是否简洁清晰
- [ ] 命名是否有意义
- [ ] 函数是否单一职责
- [ ] 是否有重复代码

#### 类型安全审查
- [ ] 是否有缺失的类型定义
- [ ] 是否滥用了 `any`
- [ ] 泛型使用是否合理
- [ ] 类型推断是否正确

#### 测试审查
- [ ] 测试是否覆盖主要场景
- [ ] 测试用例是否清晰
- [ ] 断言是否准确
- [ ] 测试是否独立

---

## 4️⃣ 文档标准

### 4.1 API 文档标准

```typescript
/**
 * 验证节点命名是否符合规范
 * 
 * @param name - 待验证的名称
 * @param type - 节点类型
 * @returns 验证结果，包含是否有效和建议
 * 
 * @example
 * ```typescript
 * const result = NamingValidator.validateNodeName('UserService', 'service')
 * if (!result.valid) {
 *   console.log(result.suggestion) // 输出建议名称
 * }
 * ```
 * 
 * @throws {ValidationError} 当名称格式严重错误时抛出
 * 
 * @beta
 */
static validateNodeName(name: string, type: NodeKind): ValidationResult {
  // ...
}
```

---

### 4.2 组件文档标准

```typescript
/**
 * Button 组件 - 可定制的按钮组件
 * 
 * 支持多种变体（variant）、尺寸（size）和状态（loading、disabled）
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <Button>点击我</Button>
 * 
 * // 主要按钮
 * <Button variant="primary">主要操作</Button>
 * 
 * // 加载状态
 * <Button loading>加载中...</Button>
 * 
 * // 禁用状态
 * <Button disabled>不可用</Button>
 * ```
 * 
 * @remarks
 * 按钮组件遵循 WAI-ARIA 规范，支持键盘导航
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/button/} ARIA Button Pattern
 */
interface ButtonProps {
  /** 按钮变体，决定颜色和样式 */
  variant?: 'primary' | 'secondary' | 'danger'
  
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  
  /** 加载状态，显示 spinner */
  loading?: boolean
  
  /** 禁用状态 */
  disabled?: boolean
  
  /** 点击事件处理 */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  
  /** 子元素 */
  children?: ReactNode
}
```

---

## 5️⃣ Git 提交标准

### 5.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 5.2 提交类型

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响代码运行）
refactor: 重构（既不是新功能也不是修复）
perf:     性能优化
test:     测试相关
chore:    构建过程或辅助工具变动
```

### 5.3 提交示例

```bash
# ✅ 正确的提交信息
git commit -m "feat(design-tokens): 添加颜色系统和间距系统

- 实现完整的颜色 palette（5 个色阶）
- 添加 6 个间距定义
- 导出为 JSON 格式供 AI 使用

Closes #45"

git commit -m "fix(naming-validator): 修复中文转换逻辑

- 修正'用户'到'User'的映射
- 添加更多中文到英文的映射
- 更新相关测试

Fixes #52"

# ❌ 错误的提交信息
git commit -m "更新代码"  # 太模糊
git commit -m "修复 bug"  # 没有说明修复什么
git commit -m "asdf"      # 无意义
```

---

## 6️⃣ 性能标准

### 6.1 加载性能标准

```typescript
// 性能预算
const performanceBudget = {
  // Bundle 大小
  maxBundleSize: 200 * 1024,      // 200KB (gzip)
  maxInitialJS: 150 * 1024,       // 150KB
  maxInitialCSS: 50 * 1024,       // 50KB
  
  // 加载时间
  maxFCP: 1500,                   // 1.5s
  maxLCP: 2500,                   // 2.5s
  maxTTI: 3000,                   // 3.0s
  
  // 运行时性能
  maxFrameTime: 16,               // 60fps
  maxLongTask: 50,                // 50ms
}
```

### 6.2 代码性能标准

```typescript
// ✅ 正确：使用 memo 优化
const ExpensiveComponent: React.FC<Props> = React.memo(({ items }) => {
  // 复杂计算
  const processed = useMemo(() => {
    return items.map(item => expensiveComputation(item))
  }, [items])
  
  return <div>{processed.map(render)}</div>
})

// ❌ 错误：每次渲染都重新计算
const BadComponent: React.FC<Props> = ({ items }) => {
  const processed = items.map(item => expensiveComputation(item))  // 性能问题
  return <div>{processed.map(render)}</div>
}
```

---

## 7️⃣ 安全标准

### 7.1 输入验证标准

```typescript
// ✅ 正确：验证所有输入
function createUser(data: CreateUserInput) {
  // 验证必填字段
  if (!data.name || data.name.trim().length === 0) {
    throw new ValidationError('Name is required')
  }
  
  // 验证格式
  if (!isValidEmail(data.email)) {
    throw new ValidationError('Invalid email format')
  }
  
  // 验证长度
  if (data.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters')
  }
  
  // 验证范围
  if (data.age < 0 || data.age > 150) {
    throw new ValidationError('Invalid age')
  }
  
  // 验证白名单
  if (!['admin', 'user', 'guest'].includes(data.role)) {
    throw new ValidationError('Invalid role')
  }
  
  // ...
}
```

### 7.2 XSS 防护标准

```typescript
// ✅ 正确：使用 React 的内置防护
function SafeComponent({ userContent }: { userContent: string }) {
  // React 自动转义
  return <div>{userContent}</div>
  
  // 如需渲染 HTML，使用 DOMPurify
  // const sanitized = DOMPurify.sanitize(userContent)
  // return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}

// ❌ 错误：直接渲染危险 HTML
function UnsafeComponent({ userContent }: { userContent: string }) {
  return <div dangerouslySetInnerHTML={{ __html: userContent }} />  // XSS 风险
}
```

---

## 8️⃣ 可访问性标准

### 8.1 ARIA 标准

```typescript
// ✅ 正确：完整的 ARIA 支持
const AccessibleButton: React.FC<ButtonProps> = ({ 
  label, 
  loading, 
  disabled 
}) => {
  return (
    <button
      aria-label={label}
      aria-busy={loading}
      aria-disabled={disabled}
      disabled={disabled}
      type="button"
    >
      {loading && <span aria-hidden="true">⏳</span>}
      {label}
    </button>
  )
}

// ❌ 错误：缺少 ARIA 属性
const InaccessibleButton: React.FC<ButtonProps> = ({ label }) => {
  return <button>{label}</button>  // 缺少必要的 ARIA 属性
}
```

### 8.2 键盘导航标准

```typescript
// ✅ 正确：支持键盘导航
const KeyboardNavigableList: React.FC<ListProps> = ({ items }) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        // 移动到下一项
        focusNextItem()
        event.preventDefault()
        break
      case 'ArrowUp':
        // 移动到上一项
        focusPreviousItem()
        event.preventDefault()
        break
      case 'Enter':
        // 激活当前项
        activateCurrentItem()
        event.preventDefault()
        break
    }
  }, [])
  
  return (
    <ul 
      role="listbox" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {items.map(renderItem)}
    </ul>
  )
}
```

---

## 9️⃣ 部署标准

### 9.1 构建标准

```bash
# 构建流程
npm run lint          # 代码检查
npm run type-check    # 类型检查
npm run test          # 运行测试
npm run build         # 构建生产版本

# 构建验证
- 无 TypeScript 错误
- 无 ESLint 警告
- 测试覆盖率 >85%
- Bundle 大小 <200KB
```

### 9.2 发布检查清单

```markdown
## 发布前检查
- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档已更新
- [ ] 版本号已更新（遵循 SemVer）
- [ ] CHANGELOG 已更新
- [ ] 性能测试通过
- [ ] 安全扫描通过

## 发布后检查
- [ ] 部署成功
- [ ] 冒烟测试通过
- [ ] 监控正常
- [ ] 用户反馈收集
```

---

## 🔟 质量门禁标准

### 代码质量门禁

```yaml
# GitHub Actions 配置
name: Quality Gates

on: [push, pull_request]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
        continue-on-error: false  # 必须通过
      
      - name: Type check
        run: npm run type-check
        continue-on-error: false  # 必须通过
      
      - name: Test
        run: npm run test -- --coverage
        continue-on-error: false  # 必须通过
      
      - name: Check coverage
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 85" | bc -l) )); then
            echo "Coverage $coverage% is below 85%"
            exit 1
          fi
      
      - name: Build
        run: npm run build
        continue-on-error: false  # 必须通过
      
      - name: Check bundle size
        run: |
          size=$(gzip -c dist/main.js | wc -c)
          if [ $size -gt 204800 ]; then  # 200KB
            echo "Bundle size $size exceeds 200KB"
            exit 1
          fi
```

---

## 📊 执行标准符合度检查

### 每周自查清单

```markdown
## 代码质量自查
- [ ] 遵循 TypeScript 编码规范
- [ ] 遵循 React 组件标准
- [ ] 遵循 CSS 样式标准
- [ ] 添加必要的类型定义
- [ ] 编写清晰的注释

## 测试自查
- [ ] 单元测试覆盖率 >85%
- [ ] 测试用例清晰完整
- [ ] 覆盖正常和异常场景
- [ ] 测试独立可重复

## 文档自查
- [ ] API 文档完整
- [ ] 组件文档清晰
- [ ] 使用示例充分
- [ ] 更新 CHANGELOG

## 性能自查
- [ ] 无明显性能问题
- [ ] Bundle 大小合理
- [ ] 加载时间达标
- [ ] 运行时性能良好
```

---

**文档批准**:

| 角色 | 姓名 | 日期 |
|------|------|------|
| 技术负责人 | | |
| 质量负责人 | | |

**最后更新**: 2026-03-01  
**版本**: v1.0.0  
**状态**: ✅ 已批准
