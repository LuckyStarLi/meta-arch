# 用户系统模板

一个功能完整、架构全面的用户系统模板，包含用户基础信息管理、积分余额系统、账户余额系统和用户标签管理。

## 核心功能

### 1. 用户基础信息模块
- ✅ 用户注册（支持用户名、手机号、邮箱）
- ✅ 用户登录（JWT 令牌认证）
- ✅ 用户资料查询/修改
- ✅ 密码加密存储（bcrypt）
- ✅ 登录记录追踪

### 2. 积分余额系统
- ✅ 积分获取（注册奖励、签到、消费返利等）
- ✅ 积分消费（兑换商品、抵扣等）
- ✅ 积分余额查询
- ✅ 积分交易记录
- ✅ 积分规则配置
- ✅ 积分有效期管理

### 3. 账户余额系统
- ✅ 账户充值（支持多种支付方式）
- ✅ 账户提现（银行转账）
- ✅ 余额查询
- ✅ 交易记录查询
- ✅ 资金安全验证
- ✅ 冻结/解冻金额

### 4. 用户标签管理
- ✅ 标签创建/修改/删除
- ✅ 用户 - 标签关联
- ✅ 标签查询
- ✅ 批量操作
- ✅ 多标签组合查询
- ✅ 可扩展标签系统

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    API 层 (FastAPI)                      │
│  - RESTful 接口                                          │
│  - JWT 认证                                              │
│  - 请求验证 (Pydantic)                                   │
│  - 错误处理                                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   服务层 (Services)                      │
│  - UserService (用户服务)                                │
│  - PointsService (积分服务)                              │
│  - AccountService (账户服务)                             │
│  - TagService (标签服务)                                 │
│  - 业务逻辑、事务管理、数据验证                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  数据层 (Repositories)                   │
│  - UserRepository                                       │
│  - PointsAccountRepository                              │
│  - PointsTransactionRepository                          │
│  - AccountBalanceRepository                             │
│  - AccountTransactionRepository                         │
│  - TagRepository                                        │
│  - UserTagRepository                                    │
│  - OperationLogRepository                               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  数据库 (MySQL 8.0+)                     │
│  - users (用户表)                                       │
│  - user_points_accounts (积分账户表)                     │
│  - points_transactions (积分交易表)                      │
│  - points_rules (积分规则表)                            │
│  - user_account_balances (账户余额表)                    │
│  - account_transactions (账户交易表)                     │
│  - tags (标签表)                                        │
│  - user_tags (用户标签关联表)                            │
│  - user_auth_tokens (认证令牌表)                         │
│  - operation_logs (操作日志表)                          │
└─────────────────────────────────────────────────────────┘
```

## 技术栈

- **编程语言**: Python 3.9+
- **Web 框架**: FastAPI 0.104+
- **数据库**: MySQL 8.0+ / MariaDB 10.5+
- **ORM**: 原生 SQL (Repository 模式)
- **认证**: JWT (PyJWT)
- **密码加密**: bcrypt
- **数据验证**: Pydantic 2.5+
- **服务器**: Uvicorn / Gunicorn

## 快速开始

### 1. 环境准备

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

### 2. 数据库初始化

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE user_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 执行 schema
mysql -u root -p user_system < database/schema.sql

# 或使用 Python 脚本
python data/database.py
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=user_system
DB_USER=user_system
DB_PASSWORD=your_secure_password
DB_POOL_SIZE=5

# JWT 配置
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_HOURS=24

# 服务器配置
HOST=0.0.0.0
PORT=8000
WORKERS=4
```

### 4. 启动服务

```bash
# 开发环境
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# 生产环境
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- 健康检查：http://localhost:8000/health

## 项目结构

```
user-system/
├── api/                      # API 层
│   └── main.py              # FastAPI 应用入口
├── data/                     # 数据层
│   ├── database.py          # 数据库连接配置
│   └── repositories.py      # Repository 实现
├── services/                 # 服务层
│   └── __init__.py          # 服务实现
├── database/                 # 数据库脚本
│   └── schema.sql           # 数据库 Schema
├── docs/                     # 文档
│   ├── API.md               # API 文档
│   └── DEPLOYMENT.md        # 部署文档
├── .env                     # 环境变量
├── requirements.txt         # Python 依赖
├── README.md                # 项目说明
└── README_ZH.md            # 中文说明
```

## API 使用示例

### 用户注册

```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "password": "123456",
    "phone": "13800138000",
    "email": "zhangsan@example.com"
  }'
```

### 用户登录

```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "password": "123456"
  }'
```

### 获取用户资料

```bash
curl -X GET http://localhost:8000/api/v1/users/profile \
  -H "Authorization: Bearer <access_token>"
```

### 获取积分

```bash
curl -X POST http://localhost:8000/api/v1/users/points/earn \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "daily_checkin",
    "description": "每日签到"
  }'
```

### 充值

```bash
curl -X POST http://localhost:8000/api/v1/users/balance/recharge \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "payment_method": "alipay",
    "transaction_no": "alipay-txn-123456"
  }'
```

### 添加用户标签

```bash
curl -X POST http://localhost:8000/api/v1/users/tags \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-id",
    "tag_id": "tag-id",
    "source": "manual"
  }'
```

## 安全特性

- ✅ 密码加密存储（bcrypt，12 轮）
- ✅ JWT 令牌认证
- ✅ SQL 注入防护（参数化查询）
- ✅ CORS 配置
- ✅ 输入验证（Pydantic）
- ✅ 操作日志记录
- ✅ 交易审计追踪

## 扩展性设计

### 1. 水平扩展
- 无状态服务设计
- 支持多实例部署
- 数据库读写分离（可配置）
- Redis 缓存支持（可选）

### 2. 模块化设计
- 清晰的分层架构
- Repository 模式
- 服务解耦
- 易于添加新功能

### 3. 可配置性
- 环境变量配置
- 积分规则可配置
- 标签系统可扩展

## 性能优化建议

1. **数据库优化**
   - 添加合适的索引
   - 使用连接池
   - 定期清理日志表
   - 分区大表（如交易记录）

2. **缓存策略**
   - 用户资料缓存（Redis）
   - 积分规则缓存
   - 标签数据缓存

3. **异步处理**
   - 使用 Celery 处理耗时操作
   - 邮件通知异步发送
   - 报表生成异步处理

## 监控与日志

### 1. 日志配置

```python
# 日志级别：DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### 2. 监控指标

- QPS (每秒请求数)
- 响应时间 (P95, P99)
- 错误率
- 数据库连接池使用率
- 内存使用率

### 3. 健康检查端点

```bash
GET http://localhost:8000/health
```

## 常见问题

### 1. 数据库连接失败
检查 MySQL 服务状态和连接配置

### 2. JWT Token 验证失败
确保 `JWT_SECRET_KEY` 配置一致

### 3. 跨域问题
在 `.env` 中配置 `ALLOWED_ORIGINS`

### 4. 中文乱码
确保数据库字符集为 `utf8mb4`

详细问题解决方案请参考 [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 测试

```bash
# 运行测试
pytest

# 运行特定测试
pytest tests/test_user_service.py

# 生成覆盖率报告
pytest --cov=api --cov=services --cov=data
```

## 部署

详细部署步骤请参考 [DEPLOYMENT.md](docs/DEPLOYMENT.md)

### 快速部署

```bash
chmod +x deploy.sh
./deploy.sh
```

### Docker 部署

```bash
docker-compose up -d
```

## 许可证

MIT License

## 联系方式

- 项目地址：[GitHub](https://github.com/your-org/user-system)
- 问题反馈：[Issues](https://github.com/your-org/user-system/issues)
- 邮箱：support@example.com

---

**版本**: 1.0.0  
**创建日期**: 2024-01-01  
**最后更新**: 2024-01-01  
**维护者**: 用户系统开发团队
