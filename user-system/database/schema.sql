-- ============================================
-- 用户系统数据库 Schema
-- ============================================
-- 包含：用户基础信息、积分余额、账户余额、用户标签
-- 设计原则：模块化、可扩展性、安全性
-- ============================================

-- 1. 用户基础信息表
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY COMMENT '用户 ID (UUID)',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希 (bcrypt/argon2)',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    avatar_url VARCHAR(500) COMMENT '头像 URL',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用，-1-已删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) COMMENT '最后登录 IP',
    
    INDEX idx_username (username),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- 2. 用户积分账户表
CREATE TABLE user_points_accounts (
    id VARCHAR(36) PRIMARY KEY COMMENT '积分账户 ID',
    user_id VARCHAR(36) UNIQUE NOT NULL COMMENT '用户 ID',
    balance BIGINT DEFAULT 0 NOT NULL COMMENT '可用积分余额 (单位：分)',
    total_earned BIGINT DEFAULT 0 NOT NULL COMMENT '累计获得积分',
    total_spent BIGINT DEFAULT 0 NOT NULL COMMENT '累计消费积分',
    expires_at TIMESTAMP NULL COMMENT '积分过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_balance (balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分账户表';

-- 3. 积分交易记录表
CREATE TABLE points_transactions (
    id VARCHAR(36) PRIMARY KEY COMMENT '交易记录 ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户 ID',
    amount BIGINT NOT NULL COMMENT '交易金额 (正数：收入，负数：支出)',
    type VARCHAR(50) NOT NULL COMMENT '交易类型：register-注册奖励，daily_checkin-每日签到，task-任务奖励，purchase-消费支出，refund-退款，adjustment-调整，expire-过期',
    balance_before BIGINT NOT NULL COMMENT '交易前余额',
    balance_after BIGINT NOT NULL COMMENT '交易后余额',
    description VARCHAR(500) COMMENT '交易描述',
    reference_id VARCHAR(100) COMMENT '关联业务 ID (订单 ID、任务 ID 等)',
    operator_id VARCHAR(36) COMMENT '操作人 ID (系统操作或管理员操作)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_reference_id (reference_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分交易记录表';

-- 4. 积分规则配置表
CREATE TABLE points_rules (
    id VARCHAR(36) PRIMARY KEY COMMENT '规则 ID',
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_type VARCHAR(50) NOT NULL COMMENT '规则类型：earn-获取，spend-消费',
    action_type VARCHAR(100) NOT NULL COMMENT '动作类型：register，daily_checkin，purchase 等',
    points_amount BIGINT NOT NULL COMMENT '积分数量',
    condition_config JSON COMMENT '条件配置 (如：最低消费金额、每日限制次数等)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    priority INT DEFAULT 0 COMMENT '优先级 (数字越大优先级越高)',
    valid_from TIMESTAMP NULL COMMENT '生效开始时间',
    valid_to TIMESTAMP NULL COMMENT '生效结束时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_type (rule_type),
    INDEX idx_action (action_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分规则配置表';

-- 5. 用户账户余额表
CREATE TABLE user_account_balances (
    id VARCHAR(36) PRIMARY KEY COMMENT '账户 ID',
    user_id VARCHAR(36) UNIQUE NOT NULL COMMENT '用户 ID',
    balance DECIMAL(18, 2) DEFAULT 0.00 NOT NULL COMMENT '可用余额',
    frozen_amount DECIMAL(18, 2) DEFAULT 0.00 NOT NULL COMMENT '冻结金额',
    total_recharged DECIMAL(18, 2) DEFAULT 0.00 NOT NULL COMMENT '累计充值',
    total_withdrawn DECIMAL(18, 2) DEFAULT 0.00 NOT NULL COMMENT '累计提现',
    total_spent DECIMAL(18, 2) DEFAULT 0.00 NOT NULL COMMENT '累计消费',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_balance (balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账户余额表';

-- 6. 账户交易记录表
CREATE TABLE account_transactions (
    id VARCHAR(36) PRIMARY KEY COMMENT '交易记录 ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户 ID',
    amount DECIMAL(18, 2) NOT NULL COMMENT '交易金额 (正数：收入，负数：支出)',
    type VARCHAR(50) NOT NULL COMMENT '交易类型：recharge-充值，withdraw-提现，purchase-消费，refund-退款，transfer-转账，adjustment-调整',
    status VARCHAR(20) NOT NULL COMMENT '状态：pending-待处理，processing-处理中，completed-已完成，failed-失败，cancelled-已取消',
    balance_before DECIMAL(18, 2) NOT NULL COMMENT '交易前余额',
    balance_after DECIMAL(18, 2) NOT NULL COMMENT '交易后余额',
    payment_method VARCHAR(50) COMMENT '支付方式：alipay-支付宝，wechat-微信，bank_card-银行卡',
    transaction_no VARCHAR(100) COMMENT '第三方交易流水号',
    description VARCHAR(500) COMMENT '交易描述',
    reference_id VARCHAR(100) COMMENT '关联业务 ID (订单 ID、提现单 ID 等)',
    operator_id VARCHAR(36) COMMENT '操作人 ID',
    remark VARCHAR(500) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_reference_id (reference_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户交易记录表';

-- 7. 标签定义表
CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY COMMENT '标签 ID',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    category VARCHAR(50) COMMENT '标签分类：demographic-人口统计，behavior-行为，preference-偏好，value-价值',
    color VARCHAR(20) DEFAULT '#3b82f6' COMMENT '标签颜色 (16 进制)',
    description VARCHAR(500) COMMENT '标签描述',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统标签 (系统标签不可删除)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_name (name),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签定义表';

-- 8. 用户标签关联表
CREATE TABLE user_tags (
    id VARCHAR(36) PRIMARY KEY COMMENT '关联 ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户 ID',
    tag_id VARCHAR(36) NOT NULL COMMENT '标签 ID',
    source VARCHAR(50) COMMENT '来源：manual-手动，auto-自动，system-系统',
    score DECIMAL(5, 2) DEFAULT 100.00 COMMENT '关联强度分数 (0-100)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_tag (user_id, tag_id),
    INDEX idx_user_id (user_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户标签关联表';

-- 9. 用户认证令牌表 (用于 JWT 黑名单/刷新令牌管理)
CREATE TABLE user_auth_tokens (
    id VARCHAR(36) PRIMARY KEY COMMENT '令牌 ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户 ID',
    token_hash VARCHAR(255) NOT NULL COMMENT '令牌哈希',
    type VARCHAR(20) NOT NULL COMMENT '类型：access-访问令牌，refresh-刷新令牌',
    expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
    is_revoked BOOLEAN DEFAULT FALSE COMMENT '是否已撤销',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_ip VARCHAR(45) COMMENT '创建 IP',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户认证令牌表';

-- 10. 操作日志表
CREATE TABLE operation_logs (
    id VARCHAR(36) PRIMARY KEY COMMENT '日志 ID',
    user_id VARCHAR(36) COMMENT '用户 ID',
    module VARCHAR(50) NOT NULL COMMENT '模块：user-用户，points-积分，account-账户，tag-标签',
    action VARCHAR(100) NOT NULL COMMENT '操作：create-创建，update-更新，delete-删除，query-查询，login-登录，logout-登出',
    resource_type VARCHAR(50) COMMENT '资源类型',
    resource_id VARCHAR(36) COMMENT '资源 ID',
    request_body JSON COMMENT '请求体',
    response_code INT COMMENT '响应码',
    error_message TEXT COMMENT '错误信息',
    ip_address VARCHAR(45) COMMENT 'IP 地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_module (module),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================
-- 初始化数据
-- ============================================

-- 初始化积分规则
INSERT INTO points_rules (id, rule_name, rule_type, action_type, points_amount, condition_config, is_active, priority) VALUES
('rule-001', '注册奖励', 'earn', 'register', 10000, '{"oneTime": true}', TRUE, 100),
('rule-002', '每日签到', 'earn', 'daily_checkin', 100, '{"dailyLimit": 1}', TRUE, 90),
('rule-003', '消费返积分', 'earn', 'purchase', 10, '{"ratio": 0.01}', TRUE, 80),
('rule-004', '积分消费', 'spend', 'purchase', -1, '{"minPoints": 100}', TRUE, 100);

-- 初始化系统标签
INSERT INTO tags (id, name, category, color, description, is_system, is_active) VALUES
('tag-001', '新用户', 'demographic', '#3b82f6', '注册 7 天内的新用户', TRUE, TRUE),
('tag-002', '活跃用户', 'behavior', '#10b981', '近 30 天有登录记录', TRUE, TRUE),
('tag-003', '高价值用户', 'value', '#f59e0b', '账户余额大于 1000 元', TRUE, TRUE),
('tag-004', 'VIP 用户', 'value', '#8b5cf6', 'VIP 会员用户', TRUE, TRUE),
('tag-005', '风险用户', 'behavior', '#ef4444', '存在异常行为的用户', TRUE, TRUE);
