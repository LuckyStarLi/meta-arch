# 贡献指南

首先，感谢您考虑为 Meta-Arch 做出贡献！

## 行为准则

本项目采用开源社区通用行为准则。请尊重他人，保持专业友好的交流氛围。

## 如何贡献

### 报告 Bug

如果您发现 Bug，请创建 Issue 并包含以下信息：

1. **清晰的标题**：简明扼要地描述问题
2. **复现步骤**：详细说明如何复现问题
3. **期望行为**：描述您期望发生什么
4. **实际行为**：描述实际发生了什么
5. **环境信息**：操作系统、浏览器、Node.js 版本等
6. **截图或录屏**（如果适用）

### 提出新功能建议

我们欢迎新功能建议！请创建 Issue 并包含：

1. **功能描述**：清晰描述您想要的功能
2. **使用场景**：说明这个功能的使用场景
3. **实现思路**（可选）：如果您有实现想法
4. **替代方案**（可选）：您考虑过的其他方案

### 提交代码

#### 1. Fork 项目

```bash
# 点击 GitHub 页面上的 Fork 按钮
git clone https://github.com/YOUR_USERNAME/meta-arch.git
cd meta-arch
git remote add upstream https://github.com/your-org/meta-arch.git
```

#### 2. 创建分支

```bash
# 保持主分支最新
git checkout main
git pull upstream main

# 创建特性分支
git checkout -b feature/your-feature-name

# 或者修复分支
git checkout -b fix/your-bug-fix
```

#### 3. 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行代码检查
npm run lint

# 运行类型检查
npx tsc --noEmit
```

#### 4. 提交更改

```bash
# 添加更改的文件
git add .

# 提交（请使用有意义的提交信息）
git commit -m "feat: 添加新功能"
# 或
git commit -m "fix: 修复某个问题"
```

**提交信息规范**：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整（不影响功能）
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具链相关

#### 5. 推送到 GitHub

```bash
git push origin feature/your-feature-name
```

#### 6. 创建 Pull Request

1. 访问您的 Fork 项目页面
2. 点击 "Compare & pull request"
3. 填写 PR 描述
4. 等待代码审查

### Pull Request 指南

好的 PR 应该包含：

- [ ] **清晰的标题**：简明描述更改内容
- [ ] **详细描述**：说明更改的原因和内容
- [ ] **关联 Issue**：如果有关联的 Issue，请引用
- [ ] **测试说明**：说明您如何测试这些更改
- [ ] **截图**（如果适用）：UI 更改请提供截图
- [ ] **检查清单**：确保代码通过 lint 和类型检查

### 代码审查流程

1. 项目维护者会审查您的 PR
2. 可能会提出修改建议
3. 根据反馈更新您的 PR
4. 审查通过后合并到主分支

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
npm run build
```

### 运行检查

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

## 代码风格

### TypeScript

- 使用 TypeScript 严格模式
- 明确定义类型，避免使用 `any`
- 使用接口定义数据结构
- 遵循现有的代码组织方式

### React

- 使用函数组件和 Hooks
- 合理拆分组件
- 使用 TypeScript 定义 Props 类型
- 遵循 React 最佳实践

### 命名规范

- 文件名：PascalCase（组件）、camelCase（工具）
- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 类型/接口：PascalCase

### 注释

- 为复杂逻辑添加注释
- 使用 JSDoc 风格注释公共 API
- 保持注释简洁明了

## 测试

我们鼓励为新功能添加测试：

```bash
# 运行测试（需要配置测试框架）
npm run test
```

测试应该：

- 覆盖核心功能
- 包含边界情况
- 快速执行
- 可重复

## 文档

如果您添加了新功能或更改了现有功能，请更新相关文档：

- README.md - 项目总体说明
- 代码注释 - API 文档
- docs/ - 详细指南和示例

## 常见问题

### Q: 我可以同时处理多个 Issue 吗？

A: 当然可以！但请确保每个 Issue 都在独立的分支上开发。

### Q: 我的 PR 多久会被审查？

A: 通常在 1-3 个工作日内，请耐心等待。

### Q: 我如何知道哪些 Issue 可以被认领？

A: 查看标记为 "good first issue" 或 "help wanted" 的 Issue。

### Q: 我可以添加新的依赖吗？

A: 可以，但请在 PR 中说明为什么需要这个依赖。

## 许可证

通过贡献代码，您同意您的贡献遵循本项目的 MIT 许可证。

## 需要帮助？

如果您有任何问题，可以通过以下方式联系我们：

- 创建 Issue
- 加入讨论区
- 发送邮件至 maintainers@example.com

## 致谢

感谢所有为 Meta-Arch 做出贡献的开发者！

---

再次感谢您的贡献！🎉
