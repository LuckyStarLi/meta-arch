# Meta-Arch - 可视化架构设计与代码生成平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff.svg)](https://vitejs.dev/)

**Meta-Arch** 是一款功能强大的可视化架构设计与代码生成工具，帮助您通过拖拽式界面设计系统架构，并自动生成高质量的代码框架。

![Meta-Arch Screenshot](./docs/screenshots/overview.png)

## ✨ 核心特性

### 🎨 可视化架构设计
- **拖拽式节点编辑**：直观地创建和连接架构节点
- **多种节点类型**：支持 Frontend、API、Service、Repository、Database、Agent、Persona 等
- **智能连接规则**：自动验证架构连接的合法性
- **一键自动排版**：基于 DAG 的智能布局算法

### 🤖 AI 增强功能
- **Agent 节点支持**：集成 AI Agent 设计和编排能力
- **Persona 数字角色**：定义具有人格特征的数字角色
- **智能代码生成**：根据架构设计自动生成代码框架

### 📦 模块化系统
- **模块管理**：创建、编辑和管理功能模块
- **节点绑定**：将架构节点绑定到具体模块
- **依赖追踪**：自动分析模块间依赖关系
- **模块分组**：可视化展示模块包含的节点

### 🔍 设计质量检查
- **架构规则验证**：检查分层架构合规性
- **数据完整性验证**：确保节点配置完整
- **连接关系检查**：发现孤立节点和重复连接
- **性能与安全建议**：提供优化建议

### 🎯 模板管理
- **预设模板**：内置常用架构模板
- **自定义模板**：保存和复用您的设计
- **模板导入导出**：方便团队协作和分享

### 📱 响应式设计
- **多设备适配**：完善的响应式布局系统
- **断点配置**：支持 xs/sm/md/lg/xl/2xl 断点
- **布局组件**：容器、栅格、Flex 布局等

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- 现代浏览器（Chrome、Firefox、Edge、Safari）

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/your-org/meta-arch.git
cd meta-arch

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

## 📖 使用指南

### 1. 创建架构节点

点击顶部工具栏的节点类型按钮，或右键画布选择节点类型：

- **Frontend**：前端应用（React/Vue/Angular）
- **API**：API 接口层
- **Service**：业务服务层
- **Repository**：数据访问层
- **Database**：数据库
- **Agent**：AI Agent（规则/工作流/ML/LLM）
- **Persona**：数字角色

### 2. 连接节点

从一个节点拖拽连接线到另一个节点，系统会自动验证连接是否符合架构规则。

**合法连接示例**：
- Frontend → API
- API → Service
- Service → Repository → Database
- Service → Agent
- Persona → Agent

### 3. 配置节点

点击节点打开右侧配置面板，填写详细信息：

**Frontend 节点配置**：
```typescript
{
  name: "用户前端",
  framework: "react",
  port: 3000
}
```

**API 节点配置**：
```typescript
{
  name: "用户信息 API",
  route: "/api/users",
  method: "GET",
  requiresAuth: true,
  description: "获取用户详细信息"
}
```

**Agent 节点配置**：
```typescript
{
  name: "智能推荐 Agent",
  agentType: "llm",
  description: "基于用户行为进行个性化推荐",
  capabilities: {
    inputs: [{ name: "userId", type: "string", required: true }],
    outputs: [{ name: "recommendations", type: "array" }]
  }
}
```

### 4. 模块管理

1. 点击顶部工具栏的"模块管理"按钮
2. 创建新模块，选择模块类型和层级
3. 右键节点，选择"绑定到模块"
4. 查看模块分组和依赖关系

### 5. 设计检查

点击"设计检查"按钮，系统会自动分析：
- 架构规则合规性
- 数据完整性
- 连接关系
- 性能与安全
- 可扩展性

检查完成后会生成详细报告和改进建议。

### 6. 导出项目

点击"导出项目"按钮，生成包含以下内容的 ZIP 文件：
- 架构设计文档
- 模块定义文件
- 代码框架
- 数据库 Schema
- API 文档

## 🏗️ 项目结构

```
meta-arch/
├── src/                      # 源代码目录
│   ├── components/           # React 组件
│   │   ├── Canvas.tsx        # 画布组件
│   │   ├── ConfigPanel.tsx   # 配置面板
│   │   ├── ModuleManagerPanel.tsx  # 模块管理
│   │   ├── TemplateManagerPanel.tsx # 模板管理
│   │   └── ...
│   ├── modules/              # 模块系统
│   │   ├── moduleSystem.ts   # 模块定义
│   │   ├── moduleNodeIntegration.ts # 节点集成
│   │   ├── moduleCodeGenerator.ts # 代码生成
│   │   └── layerValidator.ts # 层级验证
│   ├── nodes/                # 自定义节点
│   │   ├── AgentNode.tsx     # Agent 节点
│   │   └── PersonaNode.tsx   # Persona 节点
│   ├── hooks/                # React Hooks
│   ├── interaction/          # 交互系统
│   ├── metadata/             # 元数据管理
│   ├── responsive/           # 响应式系统
│   ├── validators/           # 验证器
│   ├── autoLayout.ts         # 自动布局
│   ├── connectionRules.ts    # 连接规则
│   ├── designChecker.ts      # 设计检查
│   ├── codeGenerator.ts      # 代码生成
│   ├── types.ts              # 类型定义
│   └── App.tsx               # 主应用
├── docs/                     # 文档目录
│   ├── design-improvement-plan/ # 设计改进计划
│   ├── DESIGN_CHECK_GUIDE.md # 设计检查指南
│   └── ...
├── user-system/              # 用户系统模板
│   ├── api/                  # FastAPI 实现
│   ├── data/                 # 数据层
│   ├── services/             # 服务层
│   └── database/             # 数据库 Schema
├── public/                   # 静态资源
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
└── vite.config.ts            # Vite 配置
```

## 🛠️ 开发指南

### 添加新节点类型

1. 在 `src/types.ts` 中定义节点类型和配置接口
2. 在 `src/nodes/` 创建节点组件
3. 在 `src/App.tsx` 中注册节点类型
4. 更新 `src/connectionRules.ts` 添加连接规则

### 扩展现有功能

```bash
# 运行开发服务器
npm run dev

# 运行 ESLint 检查
npm run lint

# 运行类型检查
npx tsc --noEmit
```

### 测试

```bash
# 运行单元测试（需要配置 Vitest）
npm run test
```

## 📝 示例项目

### 用户系统模板

项目内置了完整的用户系统模板，包含：
- 用户基础信息管理
- 积分余额系统
- 账户余额系统
- 用户标签管理

**快速使用**：
1. 点击"模板管理"
2. 选择"用户系统模板"
3. 加载模板查看完整架构

详细文档请参考 [user-system/README.md](./user-system/README.md)

## 🔧 配置选项

### 环境变量

创建 `.env` 文件（可选）：

```bash
# 开发服务器端口
VITE_PORT=5173

# API 端点（如果使用后端服务）
VITE_API_URL=http://localhost:8000
```

### TypeScript 配置

编辑 `tsconfig.json` 自定义 TypeScript 行为。

### Vite 配置

编辑 `vite.config.ts` 自定义构建选项。

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循 TypeScript 严格模式
- 代码需通过 ESLint 检查
- 编写必要的单元测试
- 更新相关文档

详细指南请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新历史。

## 🙏 致谢

感谢以下开源项目：

- [React](https://reactjs.org/) - 用户界面库
- [React Flow](https://reactflow.dev/) - 流程图组件库
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [Vite](https://vitejs.dev/) - 构建工具

## 📧 联系方式

- **项目地址**: https://github.com/your-org/meta-arch
- **问题反馈**: https://github.com/your-org/meta-arch/issues
- **讨论区**: https://github.com/your-org/meta-arch/discussions

## 🗺️ 路线图

- [ ] 支持更多节点类型（消息队列、缓存等）
- [ ] 实时协作编辑功能
- [ ] 导入导出更多格式（JSON、YAML 等）
- [ ] 插件系统
- [ ] 云端存储和分享
- [ ] 更多代码生成模板

---

**Made with ❤️ by Meta-Arch Team**
