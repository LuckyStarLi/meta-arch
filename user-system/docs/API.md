# 用户系统 API 文档

## 概述

本文档描述了用户系统的 RESTful API 接口。该系统包含用户基础信息管理、积分余额系统、账户余额系统和用户标签管理四大核心模块。

**基础信息**
- Base URL: `http://localhost:8000/api/v1`
- 认证方式：JWT Bearer Token
- 数据格式：JSON

**统一响应格式**
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

**错误码说明**
- `0`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 用户模块

### 1. 用户注册

**接口**: `POST /users/register`

**请求参数**:
```json
{
  "username": "zhangsan",
  "password": "123456",
  "phone": "13800138000",
  "email": "zhangsan@example.com"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "zhangsan",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### 2. 用户登录

**接口**: `POST /users/login`

**请求参数**:
```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "zhangsan",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### 3. 获取用户资料

**接口**: `GET /users/profile`

**认证**: 需要 JWT Token

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "zhangsan",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "status": 1,
    "created_at": "2024-01-01 12:00:00",
    "last_login_at": "2024-01-02 08:30:00",
    "points_balance": 1000,
    "account_balance": 500.00
  }
}
```

---

### 4. 更新用户资料

**接口**: `PUT /users/profile`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "phone": "13900139000",
  "email": "newemail@example.com",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": null
}
```

---

### 5. 修改密码

**接口**: `POST /users/change-password`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "old_password": "123456",
  "new_password": "newpassword123"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "密码修改成功",
  "data": null
}
```

---

## 积分模块

### 1. 获取积分

**接口**: `POST /users/points/earn`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "action_type": "daily_checkin",
  "reference_id": "checkin-20240102",
  "description": "每日签到"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "积分获取成功",
  "data": {
    "transaction_id": "txn-001",
    "points": 100,
    "balance": 1100,
    "type": "daily_checkin"
  }
}
```

**支持的 action_type**:
- `register`: 注册奖励
- `daily_checkin`: 每日签到
- `purchase`: 消费返积分
- `task`: 任务奖励
- `refund`: 退款
- `adjustment`: 调整

---

### 2. 消费积分

**接口**: `POST /users/points/spend`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "points": 500,
  "action_type": "purchase",
  "reference_id": "order-123456",
  "description": "兑换商品"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "积分消费成功",
  "data": {
    "transaction_id": "txn-002",
    "points": 500,
    "balance": 600,
    "type": "purchase"
  }
}
```

---

### 3. 查询积分余额

**接口**: `GET /users/points/balance`

**认证**: 需要 JWT Token

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": 1000,
    "total_earned": 5000,
    "total_spent": 4000,
    "expires_at": "2024-12-31 23:59:59"
  }
}
```

---

### 4. 查询积分交易记录

**接口**: `GET /users/points/transactions`

**认证**: 需要 JWT Token

**查询参数**:
- `limit`: 记录数量（默认 100）

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "txn-001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 100,
      "type": "daily_checkin",
      "balance_before": 1000,
      "balance_after": 1100,
      "description": "每日签到",
      "created_at": "2024-01-02 08:00:00"
    },
    {
      "id": "txn-002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": -500,
      "type": "purchase",
      "balance_before": 1100,
      "balance_after": 600,
      "description": "兑换商品",
      "created_at": "2024-01-02 10:30:00"
    }
  ]
}
```

---

### 5. 查询积分规则

**接口**: `GET /points/rules`

**查询参数**:
- `rule_type`: 规则类型（`earn` 或 `spend`，不传则返回所有）

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "rule-001",
      "rule_name": "注册奖励",
      "rule_type": "earn",
      "action_type": "register",
      "points_amount": 10000,
      "condition_config": {"oneTime": true},
      "is_active": true,
      "priority": 100
    },
    {
      "id": "rule-002",
      "rule_name": "每日签到",
      "rule_type": "earn",
      "action_type": "daily_checkin",
      "points_amount": 100,
      "condition_config": {"dailyLimit": 1},
      "is_active": true,
      "priority": 90
    }
  ]
}
```

---

## 账户模块

### 1. 充值

**接口**: `POST /users/balance/recharge`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "amount": 100.00,
  "payment_method": "alipay",
  "transaction_no": "alipay-txn-123456"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "充值申请成功",
  "data": {
    "transaction_id": "txn-003",
    "amount": 100.00,
    "status": "pending",
    "payment_method": "alipay"
  }
}
```

**支持的 payment_method**:
- `alipay`: 支付宝
- `wechat`: 微信
- `bank_card`: 银行卡

---

### 2. 提现

**接口**: `POST /users/balance/withdraw`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "amount": 50.00,
  "bank_account": "6222001234567890123",
  "bank_name": "中国工商银行"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "提现申请成功",
  "data": {
    "transaction_id": "txn-004",
    "amount": 50.00,
    "status": "pending",
    "bank_account": "6222001234567890123"
  }
}
```

---

### 3. 查询账户余额

**接口**: `GET /users/balance`

**认证**: 需要 JWT Token

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": 500.00,
    "frozen_amount": 50.00,
    "available_amount": 450.00,
    "total_recharged": 1000.00,
    "total_withdrawn": 200.00,
    "total_spent": 300.00
  }
}
```

---

### 4. 查询账户交易记录

**接口**: `GET /users/balance/transactions`

**认证**: 需要 JWT Token

**查询参数**:
- `limit`: 记录数量（默认 100）

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "txn-003",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 100.00,
      "type": "recharge",
      "status": "completed",
      "balance_before": 400.00,
      "balance_after": 500.00,
      "payment_method": "alipay",
      "description": "充值 100 元",
      "created_at": "2024-01-02 14:00:00",
      "completed_at": "2024-01-02 14:01:00"
    },
    {
      "id": "txn-004",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": -50.00,
      "type": "withdraw",
      "status": "pending",
      "balance_before": 500.00,
      "balance_after": 450.00,
      "description": "提现到中国工商银行",
      "created_at": "2024-01-02 15:00:00"
    }
  ]
}
```

---

### 5. 确认充值（管理员）

**接口**: `POST /admin/recharge/confirm`

**认证**: 需要管理员权限

**请求参数**:
```json
{
  "transaction_id": "txn-003"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "充值确认成功",
  "data": null
}
```

---

### 6. 确认提现（管理员）

**接口**: `POST /admin/withdraw/confirm`

**认证**: 需要管理员权限

**请求参数**:
```json
{
  "transaction_id": "txn-004"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "提现确认成功",
  "data": null
}
```

---

### 7. 拒绝提现（管理员）

**接口**: `POST /admin/withdraw/reject`

**认证**: 需要管理员权限

**请求参数**:
```json
{
  "transaction_id": "txn-004",
  "reason": "银行账户信息错误"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "已拒绝提现",
  "data": null
}
```

---

## 标签模块

### 1. 创建标签

**接口**: `POST /tags`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "name": "高价值用户",
  "category": "value",
  "color": "#f59e0b",
  "description": "账户余额大于 1000 元的用户"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "标签创建成功",
  "data": {
    "tag_id": "tag-001",
    "name": "高价值用户",
    "category": "value",
    "color": "#f59e0b",
    "description": "账户余额大于 1000 元的用户"
  }
}
```

**支持的 category**:
- `demographic`: 人口统计
- `behavior`: 行为
- `preference`: 偏好
- `value`: 价值

---

### 2. 获取所有标签

**接口**: `GET /tags`

**查询参数**:
- `category`: 标签分类（可选）
- `is_active`: 是否启用（默认 true）

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "tag-001",
      "name": "新用户",
      "category": "demographic",
      "color": "#3b82f6",
      "description": "注册 7 天内的新用户",
      "is_system": true,
      "is_active": true,
      "usage_count": 150
    },
    {
      "id": "tag-002",
      "name": "活跃用户",
      "category": "behavior",
      "color": "#10b981",
      "description": "近 30 天有登录记录",
      "is_system": true,
      "is_active": true,
      "usage_count": 500
    }
  ]
}
```

---

### 3. 获取标签详情

**接口**: `GET /tags/{tag_id}`

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "tag-001",
    "name": "高价值用户",
    "category": "value",
    "color": "#f59e0b",
    "description": "账户余额大于 1000 元的用户",
    "is_system": false,
    "is_active": true,
    "usage_count": 50
  }
}
```

---

### 4. 更新标签

**接口**: `PUT /tags/{tag_id}`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "name": "超高价值用户",
  "color": "#ef4444",
  "is_active": true
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "标签更新成功",
  "data": null
}
```

**注意**: 系统标签不可更新

---

### 5. 删除标签

**接口**: `DELETE /tags/{tag_id}`

**认证**: 需要 JWT Token

**响应示例**:
```json
{
  "code": 0,
  "message": "标签删除成功",
  "data": null
}
```

**注意**: 系统标签不可删除

---

### 6. 给用户添加标签

**接口**: `POST /users/tags`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "tag_id": "tag-001",
  "source": "manual",
  "score": 100.0
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "标签添加成功",
  "data": {
    "user_tag_id": "ut-001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "tag_id": "tag-001",
    "tag_name": "高价值用户",
    "source": "manual"
  }
}
```

**支持的 source**:
- `manual`: 手动添加
- `auto`: 自动添加
- `system`: 系统添加

---

### 7. 移除用户标签

**接口**: `DELETE /users/{user_id}/tags/{tag_id}`

**认证**: 需要 JWT Token

**响应示例**:
```json
{
  "code": 0,
  "message": "标签移除成功",
  "data": null
}
```

---

### 8. 获取用户标签

**接口**: `GET /users/{user_id}/tags`

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "ut-001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "tag_id": "tag-001",
      "tag_name": "高价值用户",
      "category": "value",
      "color": "#f59e0b",
      "source": "manual",
      "score": 100.00,
      "created_at": "2024-01-01 12:00:00"
    },
    {
      "id": "ut-002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "tag_id": "tag-002",
      "tag_name": "活跃用户",
      "category": "behavior",
      "color": "#10b981",
      "source": "auto",
      "score": 95.00,
      "created_at": "2024-01-02 08:00:00"
    }
  ]
}
```

---

### 9. 根据标签查询用户

**接口**: `POST /users/find-by-tags`

**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "tag_ids": ["tag-001", "tag-002"],
  "operator": "AND"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "tag_count": 2
    }
  ]
}
```

**operator 说明**:
- `AND`: 同时拥有所有标签
- `OR`: 拥有任意标签

---

## 错误处理

所有接口在发生错误时都会返回统一的错误格式：

```json
{
  "detail": "错误描述信息"
}
```

**常见错误**:
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权或令牌无效
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

---

## 认证说明

### JWT Token 使用

1. 用户登录成功后会获得 `access_token`
2. 在请求需要认证的接口时，在 HTTP Header 中添加：
   ```
   Authorization: Bearer <access_token>
   ```

### Token 有效期

- 默认有效期：24 小时
- 过期后需要重新登录获取新 token

---

## 版本历史

- **v1.0.0** (2024-01-01): 初始版本
  - 用户基础信息管理
  - 积分余额系统
  - 账户余额系统
  - 用户标签管理
