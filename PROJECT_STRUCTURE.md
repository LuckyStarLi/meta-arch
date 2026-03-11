# Meta-Arch 项目结构规范

## 项目概述

Meta-Arch 是一款可视化架构设计与代码生成平台，帮助开发者通过图形界面设计系统架构并自动生成代码框架。

## 项目结构

```
meta-arch/
├── src/                          # 源代码目录
│   ├── components/              # React 组件
│   │   ├── Canvas.tsx           # 画布组件
│   │   ├── ConfigPanel.tsx      # 配置面板
│   │   ├── DesignCheckReportPanel.tsx  # 设计检查报告面板
│   │   ├── LayoutConfigPanel.tsx       # 布局配置面板
│   │   ├── ModuleContainer.tsx         # 模块容器组件
│   │   ├── ModuleGroupBorder.tsx       # 模块分组边框
│   │   ├── ModuleManagerPanel.tsx      # 模块管理面板
│   │   ├── NodeContextMenu.tsx         # 节点右键菜单
│   │   ├── Skeleton.tsx                # 骨架屏组件
│   │   ├── TemplateManagerPanel.tsx    # 模板管理面板
│   │   ├── Toast.tsx                   # 通知组件
│   │   ├── TopBar.tsx                  # 顶部工具栏
│   │   └── componentLibrary.ts         # 组件库
│   ├── hooks/                  # React Hooks
│   │   ├── useShortcuts.tsx    # 快捷键管理
│   │   └── useToast.tsx        # 通知管理
│   ├── nodes/                  # 自定义节点组件
│   │   ├── AgentNode.tsx       # Agent 节点
│   │   ├── PersonaNode.tsx     # Persona 节点
│   │   └── index.ts            # 节点导出
│   ├── modules/                # 模块系统
│   │   ├── dependencyManager.ts # 依赖管理
│   │   ├── layerValidator.ts   # 层级验证
│   │   ├── moduleCodeGenerator.ts # 代码生成器
│   │   ├── moduleInterfaces.ts # 模块接口
│   │   ├── moduleNodeIntegration.ts # 模块节点集成
│   │   ├── moduleSystem.ts     # 模块系统核心
│   │   └── index.ts            # 模块导出
│   ├── interaction/            # 交互系统
│   │   ├── flowDiagramGenerator.ts # 流程图生成器
│   │   ├── interactionAnnotator.ts # 交互标注器
│   │   └── stateMachine.ts     # 状态机
│   ├── metadata/               # 元数据管理
│   │   ├── nodeMetadata.ts     # 节点元数据
│   │   └── techStackEnhancer.ts # 技术栈增强
│   ├── responsive/             # 响应式系统
│   │   └── responsiveSystem.ts # 响应式系统
│   ├── validators/             # 验证器
│   │   └── namingValidator.ts  # 命名验证器
│   ├── styles/                 # 样式文件
│   │   ├── design-tokens.css   # 设计令牌
│   │   ├── icon-system.css     # 图标系统
│   │   └── reactflow-nodes.css # ReactFlow 节点样式
│   ├── __tests__/              # 测试文件
│   │   ├── autoLayout.test.ts  # 自动布局测试
│   │   ├── connectionRules.test.ts # 连接规则测试
│   │   └── newNodes.test.ts    # 新节点测试
│   ├── ai/                     # AI 相关功能
│   │   └── promptTemplates.ts  # 提示模板
│   ├── types.ts                # 类型定义
│   ├── App.tsx                 # 主应用组件
│   ├── autoLayout.ts           # 自动布局算法
│   ├── codeGenerator.ts        # 代码生成器
│   ├── connectionRules.ts      # 连接规则
│   ├── designChecker.ts        # 设计检查器
│   ├── designTokens.ts         # 设计令牌
│   ├── exportArchitecture.ts   # 架构导出
│   ├── index.css               # 全局样式
│   ├── layout.ts               # 布局工具
│   ├── main.tsx                # 应用入口
│   ├── nodeConfig.ts           # 节点配置
│   ├── templateManager.ts      # 模板管理器
│   └── index.d.ts              # 类型声明
├── public/                     # 静态资源
│   └── vite.svg                # Vite logo
├── docs/                       # 文档
│   ├── design-improvement-plan/ # 设计改进计划
│   │   ├── CURRENT_STATE_ASSESSMENT.md
│   │   ├── DESIGN_IMPROVEMENT_PLAN.md
│   │   ├── FINAL_REPORT.md
│   │   ├── IMPLEMENTATION_PLAN.md
│   │   ├── ITERATION_1_MIDPOINT_SUMMARY.md
│   │   ├── ITERATION_1_PROGRESS.md
│   │   ├── README.md
│   │   └── USAGE_GUIDE.md
│   ├── DESIGN_CHECK_GUIDE.md   # 设计检查指南
│   ├── DESIGN_CHECK_SUMMARY.md # 设计检查摘要
│   ├── DRAG_DROP_BINDING_GUIDE.md # 拖拽绑定指南
│   ├── EXECUTION_STANDARDS.md  # 执行标准
│   ├── INFINITY_VALUE_FIX.md   # 无限值修复
│   ├── MODULE_CANVAS_INTEGRATION.md # 模块画布集成
│   ├── MODULE_CONTAINER_GUIDE.md # 模块容器指南
│   ├── MODULE_INTEGRATION_EXTENSIONS.md # 模块集成扩展
│   ├── MODULE_MANAGER_FEATURES.md # 模块管理功能
│   ├── MODULE_MANAGER_GUIDE.md # 模块管理指南
│   ├── MODULE_NODE_INTEGRATION_GUIDE.md # 模块节点集成指南
│   ├── MODULE_NODE_INTEGRATION_QUICKSTART.md # 模块节点集成快速入门
│   ├── NODE_CLICK_FIX.md       # 节点点击修复
│   ├── OPTIMIZATION_PLAN.md    # 优化计划
│   ├── PHASE1_IMPLEMENTATION.md # 第一阶段实施
│   ├── PHASE2_IMPLEMENTATION.md # 第二阶段实施
│   ├── PHASE3_IMPLEMENTATION.md # 第三阶段实施
│   ├── PHASE4_IMPLEMENTATION.md # 第四阶段实施
│   ├── PROJECT_STRUCTURE_OVERVIEW.md # 项目结构概览
│   ├── SVG_WARNING_FIX.md      # SVG 警告修复
│   ├── SYSTEM_DESIGN_SPECIFICATION.md # 系统设计规范
│   ├── TECHNICAL_FRAMEWORK.md  # 技术框架
│   ├── TEMPLATE_MANAGER_GUIDE.md # 模板管理指南
│   ├── TEST_CHECK_REPORT.md    # 测试检查报告
│   ├── TYPESCRIPT_IMPORT_FIX.md # TypeScript 导入修复
│   ├── UI_LAYERING_FIX_VERIFICATION.md # UI 分层修复验证
│   ├── screenshots/           # 截图
│   └── user-guide/            # 用户指南
├── user-system/                # 用户系统模板
│   ├── api/                    # FastAPI 实现
│   │   └── main.py             # 主应用文件
│   ├── data/                   # 数据层
│   │   ├── database.py         # 数据库配置
│   │   └── repositories.py     # 仓储实现
│   ├── database/               # 数据库脚本
│   │   └── schema.sql          # 数据库 Schema
│   ├── docs/                   # 用户系统文档
│   │   ├── API.md              # API 文档
│   │   └── DEPLOYMENT.md       # 部署文档
│   ├── services/               # 服务层
│   │   └── __init__.py         # 服务实现
│   ├── README.md               # 用户系统说明
│   ├── requirements.txt        # Python 依赖
│   └── .env.example            # 环境变量示例
├── .gitignore                  # Git 忽略文件
├── eslint-errors.txt           # ESLint 错误记录
├── eslint.config.js            # ESLint 配置
├── index.html                  # HTML 入口
├── load-user-system-arch.js    # 加载用户系统架构
├── package.json                # 项目配置
├── package-lock.json           # 依赖锁定
├── README.md                   # 项目说明
├── tsconfig.json               # TypeScript 配置
├── tsconfig.app.json           # 应用 TypeScript 配置
├── tsconfig.node.json          # Node.js TypeScript 配置
├── vite.config.ts              # Vite 配置
├── user-system-architecture.json # 用户系统架构
├── user-system-template-final.json # 用户系统模板最终版
├── user-system-template-importable.json # 用户系统模板可导入版
├── user-system-template-optimized.json # 用户系统模板优化版
├── BUTTON_FIX.md               # 按钮修复说明
├── BUTTON_FIX_FINAL.md         # 按钮修复最终版
├── OPTIMIZATION_REPORT.md      # 优化报告
├── SIDEBAR_OPTIMIZATION.md     # 侧边栏优化
└── TEST_REPORT.md              # 测试报告
```

## 开发规范

### 代码规范

1. **TypeScript**: 遵循严格模式
2. **React**: 使用函数组件和 Hooks
3. **命名**: 使用 camelCase（变量、函数），PascalCase（组件、类型），UPPER_SNAKE_CASE（常量）
4. **文件命名**: 组件使用 PascalCase，工具函数使用 camelCase
5. **类型定义**: 在 `types.ts` 中集中定义共享类型

### 目录规范

1. **components/**: 可复用的 UI 组件
2. **hooks/**: 自定义 React Hooks
3. **nodes/**: ReactFlow 节点组件
4. **modules/**: 业务模块逻辑
5. **interaction/**: 交互逻辑
6. **metadata/**: 元数据管理
7. **responsive/**: 响应式相关
8. **validators/**: 验证逻辑
9. **styles/**: CSS 样式文件
10. **__tests__/**: 测试文件

### 文档规范

1. **README.md**: 项目总体说明
2. **CONTRIBUTING.md**: 贡献指南
3. **CHANGELOG.md**: 版本更新记录
4. **LICENSE**: 许可证信息
5. **docs/**: 详细技术文档

## 配置文件

- `package.json`: 项目依赖和脚本
- `tsconfig.json`: TypeScript 配置
- `vite.config.ts`: 构建工具配置
- `eslint.config.js`: 代码规范配置

## 资源文件

- `public/`: 静态资源
- `dist/`: 构建输出目录（由构建工具生成）

## 依赖管理

项目使用 npm 进行依赖管理，主要依赖包括：

- **React**: UI 框架
- **ReactFlow**: 流程图组件
- **TypeScript**: 类型检查
- **Vite**: 构建工具
- **Dagre**: 布局算法

## 测试策略

- **单元测试**: 使用 Vitest
- **集成测试**: 组件和模块集成测试
- **端到端测试**: 使用 Playwright（待添加）

## 部署

- **开发**: `npm run dev`
- **构建**: `npm run build`
- **预览**: `npm run preview`
