/**
 * 用户系统架构设计图 - 增强版（含 Agent 和数字人）
 * 
 * 使用方法：
 * 1. 打开 http://localhost:5173/
 * 2. 在浏览器控制台（F12）中运行此脚本
 * 3. 架构设计图将自动加载到画布中
 */

const userSystemArchitecture = {
  nodes: [
    {
      id: "persona-customer-service",
      type: "default",
      position: { x: 100, y: 50 },
      data: {
        label: "数字人：智能客服",
        type: "persona",
        config: {
          name: "智能客服数字人",
          avatar: "avatar_female_01",
          description: "7x24 小时在线的智能客服数字人",
          personality: {
            traits: {
              openness: 0.8,
              conscientiousness: 0.9,
              extraversion: 0.7,
              agreeableness: 0.9,
              neuroticism: 0.2
            },
            communication: {
              tone: "friendly",
              formality: 0.6,
              verbosity: 0.5,
              emoji: true,
              language: ["zh-CN", "en-US"]
            }
          }
        }
      }
    },
    {
      id: "agent-chatbot",
      type: "default",
      position: { x: 350, y: 50 },
      data: {
        label: "Agent: 对话机器人",
        type: "agent",
        config: {
          name: "智能对话 Agent",
          agentType: "llm",
          description: "基于大模型的智能对话代理"
        }
      }
    },
    {
      id: "agent-recommender",
      type: "default",
      position: { x: 350, y: 180 },
      data: {
        label: "Agent: 个性化推荐",
        type: "agent",
        config: {
          name: "个性化推荐 Agent",
          agentType: "ml",
          description: "基于用户行为和标签的推荐引擎"
        }
      }
    },
    {
      id: "agent-fraud-detection",
      type: "default",
      position: { x: 350, y: 310 },
      data: {
        label: "Agent: 风控检测",
        type: "agent",
        config: {
          name: "智能风控 Agent",
          agentType: "ml",
          description: "实时检测欺诈交易和异常行为"
        }
      }
    },
    {
      id: "agent-data-analyst",
      type: "default",
      position: { x: 350, y: 440 },
      data: {
        label: "Agent: 数据分析师",
        type: "agent",
        config: {
          name: "数据分析 Agent",
          agentType: "workflow",
          description: "自动分析用户行为数据"
        }
      }
    },
    {
      id: "api-users",
      type: "default",
      position: { x: 600, y: 50 },
      data: {
        label: "API: 用户管理",
        type: "api",
        config: {
          name: "用户 API",
          route: "/api/v1/users/*",
          method: "POST",
          requiresAuth: false,
          description: "用户注册、登录、资料管理"
        }
      }
    },
    {
      id: "api-points",
      type: "default",
      position: { x: 600, y: 180 },
      data: {
        label: "API: 积分管理",
        type: "api",
        config: {
          name: "积分 API",
          route: "/api/v1/users/points/*",
          method: "POST",
          requiresAuth: true,
          description: "积分获取、消费、查询"
        }
      }
    },
    {
      id: "api-account",
      type: "default",
      position: { x: 600, y: 310 },
      data: {
        label: "API: 账户管理",
        type: "api",
        config: {
          name: "账户 API",
          route: "/api/v1/users/balance/*",
          method: "POST",
          requiresAuth: true,
          description: "充值、提现、余额查询"
        }
      }
    },
    {
      id: "api-tags",
      type: "default",
      position: { x: 600, y: 440 },
      data: {
        label: "API: 标签管理",
        type: "api",
        config: {
          name: "标签 API",
          route: "/api/v1/tags/*",
          method: "GET",
          requiresAuth: false,
          description: "标签 CRUD、用户标签关联"
        }
      }
    },
    {
      id: "api-ai-chat",
      type: "default",
      position: { x: 600, y: 570 },
      data: {
        label: "API: AI 对话",
        type: "api",
        config: {
          name: "AI 对话 API",
          route: "/api/v1/ai/chat/*",
          method: "POST",
          requiresAuth: true,
          description: "与数字人/Agent 对话接口"
        }
      }
    },
    {
      id: "service-user",
      type: "default",
      position: { x: 850, y: 50 },
      data: {
        label: "Service: UserService",
        type: "service",
        config: {
          name: "用户服务",
          functionName: "UserService",
          description: "用户注册、登录、JWT 认证"
        }
      }
    },
    {
      id: "service-points",
      type: "default",
      position: { x: 850, y: 180 },
      data: {
        label: "Service: PointsService",
        type: "service",
        config: {
          name: "积分服务",
          functionName: "PointsService",
          description: "积分获取、消费、规则管理"
        }
      }
    },
    {
      id: "service-account",
      type: "default",
      position: { x: 850, y: 310 },
      data: {
        label: "Service: AccountService",
        type: "service",
        config: {
          name: "账户服务",
          functionName: "AccountService",
          description: "充值、提现、余额管理"
        }
      }
    },
    {
      id: "service-tag",
      type: "default",
      position: { x: 850, y: 440 },
      data: {
        label: "Service: TagService",
        type: "service",
        config: {
          name: "标签服务",
          functionName: "TagService",
          description: "标签管理、用户标签关联"
        }
      }
    },
    {
      id: "service-ai-orchestrator",
      type: "default",
      position: { x: 850, y: 570 },
      data: {
        label: "Service: AIOrchestratorService",
        type: "service",
        config: {
          name: "AI 编排服务",
          functionName: "AIOrchestratorService",
          description: "Agent 调度、对话管理"
        }
      }
    },
    {
      id: "repo-user",
      type: "default",
      position: { x: 1100, y: 50 },
      data: {
        label: "Repository: UserRepository",
        type: "repository",
        config: {
          name: "用户数据访问层",
          entity: "users",
          operations: ["create", "read", "update", "delete"]
        }
      }
    },
    {
      id: "repo-points",
      type: "default",
      position: { x: 1100, y: 180 },
      data: {
        label: "Repository: PointsAccountRepository",
        type: "repository",
        config: {
          name: "积分账户数据访问层",
          entity: "user_points_accounts",
          operations: ["create", "read", "update"]
        }
      }
    },
    {
      id: "repo-account",
      type: "default",
      position: { x: 1100, y: 310 },
      data: {
        label: "Repository: AccountBalanceRepository",
        type: "repository",
        config: {
          name: "账户余额数据访问层",
          entity: "user_account_balances",
          operations: ["create", "read", "update"]
        }
      }
    },
    {
      id: "repo-tag",
      type: "default",
      position: { x: 1100, y: 440 },
      data: {
        label: "Repository: TagRepository",
        type: "repository",
        config: {
          name: "标签数据访问层",
          entity: "tags",
          operations: ["create", "read", "update", "delete"]
        }
      }
    },
    {
      id: "repo-conversation",
      type: "default",
      position: { x: 1100, y: 570 },
      data: {
        label: "Repository: ConversationRepository",
        type: "repository",
        config: {
          name: "对话记录数据访问层",
          entity: "ai_conversations",
          operations: ["create", "read", "update"]
        }
      }
    },
    {
      id: "database-mysql",
      type: "default",
      position: { x: 1350, y: 300 },
      data: {
        label: "Database: MySQL",
        type: "database",
        config: {
          name: "user_system 数据库",
          type: "mysql",
          host: "localhost",
          port: 3306
        }
      }
    },
    {
      id: "vector-db",
      type: "default",
      position: { x: 1350, y: 500 },
      data: {
        label: "Vector DB: Milvus",
        type: "database",
        config: {
          name: "向量数据库",
          type: "mongodb",
          host: "localhost",
          port: 19530,
          description: "存储用户画像、对话 Embedding"
        }
      }
    },
    {
      id: "llm-provider",
      type: "default",
      position: { x: 1100, y: 700 },
      data: {
        label: "External: LLM Provider",
        type: "api",
        config: {
          name: "大模型服务",
          route: "https://api.openai.com/v1",
          method: "POST",
          requiresAuth: true,
          description: "OpenAI/GPT-4、Anthropic/Claude"
        }
      }
    }
  ],
  edges: [
    { id: "e1", source: "persona-customer-service", target: "agent-chatbot" },
    { id: "e2", source: "persona-customer-service", target: "api-ai-chat" },
    { id: "e3", source: "agent-chatbot", target: "api-ai-chat" },
    { id: "e4", source: "agent-recommender", target: "api-tags" },
    { id: "e5", source: "agent-fraud-detection", target: "api-account" },
    { id: "e6", source: "agent-data-analyst", target: "api-users" },
    { id: "e7", source: "agent-data-analyst", target: "api-points" },
    { id: "e8", source: "api-users", target: "service-user" },
    { id: "e9", source: "api-points", target: "service-points" },
    { id: "e10", source: "api-account", target: "service-account" },
    { id: "e11", source: "api-tags", target: "service-tag" },
    { id: "e12", source: "api-ai-chat", target: "service-ai-orchestrator" },
    { id: "e13", source: "service-ai-orchestrator", target: "agent-chatbot" },
    { id: "e14", source: "service-ai-orchestrator", target: "agent-recommender" },
    { id: "e15", source: "service-ai-orchestrator", target: "repo-conversation" },
    { id: "e16", source: "service-user", target: "repo-user" },
    { id: "e17", source: "service-points", target: "repo-points" },
    { id: "e18", source: "service-account", target: "repo-account" },
    { id: "e19", source: "service-tag", target: "repo-tag" },
    { id: "e20", source: "repo-user", target: "database-mysql" },
    { id: "e21", source: "repo-points", target: "database-mysql" },
    { id: "e22", source: "repo-account", target: "database-mysql" },
    { id: "e23", source: "repo-tag", target: "database-mysql" },
    { id: "e24", source: "repo-conversation", target: "database-mysql" },
    { id: "e25", source: "repo-conversation", target: "vector-db" },
    { id: "e26", source: "service-ai-orchestrator", target: "llm-provider" },
    { id: "e27", source: "agent-recommender", target: "vector-db" }
  ]
};

// 在浏览器控制台中执行
console.log('🚀 正在加载用户系统架构设计图...');
console.log('📊 节点数量:', userSystemArchitecture.nodes.length);
console.log('🔗 连接数量:', userSystemArchitecture.edges.length);
console.log('✅ 加载完成！请在画布中查看架构设计图');

// 提示用户如何手动导入
console.log('\n📝 使用说明:');
console.log('1. 复制上面的节点和边数据');
console.log('2. 在 Meta-Arch 界面中依次添加节点');
console.log('3. 或者使用模板管理功能导入 JSON 文件');
console.log('4. 点击"一键排版"按钮自动布局\n');

// 将数据保存到全局变量，方便使用
window.userSystemArchitecture = userSystemArchitecture;
console.log('💾 架构数据已保存到 window.userSystemArchitecture');
