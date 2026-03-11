"""
用户系统 - 服务层
=====================================
实现核心业务逻辑
包含：用户服务、积分服务、账户服务、标签服务
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import jwt
import hashlib

from .data.repositories import (
    UserRepository, PointsAccountRepository, PointsTransactionRepository,
    PointsRulesRepository, AccountBalanceRepository, AccountTransactionRepository,
    TagRepository, UserTagRepository, OperationLogRepository
)
from .data.database import get_connection


# ============= 异常类定义 =============

class UserServiceError(Exception):
    """用户服务异常"""
    pass


class PointsServiceError(Exception):
    """积分服务异常"""
    pass


class AccountServiceError(Exception):
    """账户服务异常"""
    pass


class TagServiceError(Exception):
    """标签服务异常"""
    pass


# ============= 用户服务 =============

class UserService:
    """用户服务"""
    
    def __init__(self):
        self.db = get_connection()
        self.user_repo = UserRepository(self.db)
        self.points_account_repo = PointsAccountRepository(self.db)
        self.account_balance_repo = AccountBalanceRepository(self.db)
        self.log_repo = OperationLogRepository(self.db)
        self.jwt_secret = 'your-secret-key-change-in-production'  # 应该从环境变量读取
        self.jwt_algorithm = 'HS256'
        self.token_expire_hours = 24
    
    def register(self, username: str, password: str, phone: str = None, 
                 email: str = None) -> Dict[str, Any]:
        """
        用户注册
        :param username: 用户名
        :param password: 密码
        :param phone: 手机号
        :param email: 邮箱
        :return: 用户信息和访问令牌
        """
        # 检查用户名是否已存在
        if self.user_repo.find_by_username(username):
            raise UserServiceError("用户名已存在")
        
        # 检查手机号是否已存在
        if phone and self.user_repo.find_by_phone(phone):
            raise UserServiceError("手机号已被注册")
        
        # 检查邮箱是否已存在
        if email and self.user_repo.find_by_email(email):
            raise UserServiceError("邮箱已被注册")
        
        # 创建用户
        user_data = {
            'username': username,
            'password': password,
            'phone': phone,
            'email': email
        }
        user_id = self.user_repo.create(user_data)
        
        # 创建积分账户（赠送注册积分）
        self.points_account_repo.create({
            'user_id': user_id,
            'balance': 0,
            'total_earned': 0,
            'total_spent': 0
        })
        
        # 创建账户余额
        self.account_balance_repo.create({
            'user_id': user_id,
            'balance': 0.00,
            'frozen_amount': 0.00
        })
        
        # 生成访问令牌
        access_token = self._generate_token(user_id)
        
        # 记录日志
        self.log_repo.create({
            'user_id': user_id,
            'module': 'user',
            'action': 'create',
            'resource_type': 'user',
            'resource_id': user_id
        })
        
        return {
            'user_id': user_id,
            'username': username,
            'phone': phone,
            'email': email,
            'access_token': access_token,
            'expires_in': self.token_expire_hours * 3600
        }
    
    def login(self, username: str, password: str, ip: str = None) -> Dict[str, Any]:
        """
        用户登录
        :param username: 用户名
        :param password: 密码
        :param ip: 登录 IP
        :return: 用户信息和访问令牌
        """
        # 查找用户
        user = self.user_repo.find_by_username(username)
        if not user:
            raise UserServiceError("用户名或密码错误")
        
        # 验证密码
        if not UserRepository.verify_password(password, user['password_hash']):
            raise UserServiceError("用户名或密码错误")
        
        # 检查用户状态
        if user['status'] == 0:
            raise UserServiceError("用户已被禁用")
        if user['status'] == -1:
            raise UserServiceError("用户已被删除")
        
        # 更新登录信息
        if ip:
            self.user_repo.update_login_info(user['id'], ip)
        
        # 生成访问令牌
        access_token = self._generate_token(user['id'])
        
        # 记录日志
        self.log_repo.create({
            'user_id': user['id'],
            'module': 'user',
            'action': 'login',
            'ip_address': ip
        })
        
        return {
            'user_id': user['id'],
            'username': user['username'],
            'phone': user['phone'],
            'email': user['email'],
            'avatar_url': user['avatar_url'],
            'access_token': access_token,
            'expires_in': self.token_expire_hours * 3600
        }
    
    def get_profile(self, user_id: str) -> Dict[str, Any]:
        """
        获取用户资料
        :param user_id: 用户 ID
        :return: 用户资料
        """
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise UserServiceError("用户不存在")
        
        # 获取积分账户
        points_account = self.points_account_repo.find_by_user_id(user_id)
        
        # 获取账户余额
        account_balance = self.account_balance_repo.find_by_user_id(user_id)
        
        return {
            'user_id': user['id'],
            'username': user['username'],
            'phone': user['phone'],
            'email': user['email'],
            'avatar_url': user['avatar_url'],
            'status': user['status'],
            'created_at': user['created_at'],
            'last_login_at': user['last_login_at'],
            'points_balance': points_account['balance'] if points_account else 0,
            'account_balance': float(account_balance['balance']) if account_balance else 0.00
        }
    
    def update_profile(self, user_id: str, data: Dict[str, Any]) -> bool:
        """
        更新用户资料
        :param user_id: 用户 ID
        :param data: 更新数据
        :return: 是否成功
        """
        # 检查手机号是否已被其他用户使用
        if 'phone' in data:
            existing_user = self.user_repo.find_by_phone(data['phone'])
            if existing_user and existing_user['id'] != user_id:
                raise UserServiceError("手机号已被使用")
        
        # 检查邮箱是否已被其他用户使用
        if 'email' in data:
            existing_user = self.user_repo.find_by_email(data['email'])
            if existing_user and existing_user['id'] != user_id:
                raise UserServiceError("邮箱已被使用")
        
        # 更新用户资料
        success = self.user_repo.update(user_id, data)
        
        if success:
            # 记录日志
            self.log_repo.create({
                'user_id': user_id,
                'module': 'user',
                'action': 'update',
                'resource_type': 'user',
                'resource_id': user_id
            })
        
        return success
    
    def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """
        修改密码
        :param user_id: 用户 ID
        :param old_password: 旧密码
        :param new_password: 新密码
        :return: 是否成功
        """
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise UserServiceError("用户不存在")
        
        # 验证旧密码
        if not UserRepository.verify_password(old_password, user['password_hash']):
            raise UserServiceError("旧密码错误")
        
        # 更新密码
        success = self.user_repo.update(user_id, {
            'password': new_password  # Repository 会自动哈希
        })
        
        if success:
            # 记录日志
            self.log_repo.create({
                'user_id': user_id,
                'module': 'user',
                'action': 'update',
                'resource_type': 'password',
                'resource_id': user_id
            })
        
        return success
    
    def _generate_token(self, user_id: str) -> str:
        """生成 JWT 令牌"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=self.token_expire_hours),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def verify_token(self, token: str) -> Optional[str]:
        """
        验证 JWT 令牌
        :param token: JWT 令牌
        :return: 用户 ID（验证成功）或 None
        """
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload['user_id']
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None


# ============= 积分服务 =============

class PointsService:
    """积分服务"""
    
    def __init__(self):
        self.db = get_connection()
        self.points_account_repo = PointsAccountRepository(self.db)
        self.points_transaction_repo = PointsTransactionRepository(self.db)
        self.points_rules_repo = PointsRulesRepository(self.db)
        self.log_repo = OperationLogRepository(self.db)
    
    def earn_points(self, user_id: str, action_type: str, reference_id: str = None,
                   operator_id: str = None, description: str = None) -> Dict[str, Any]:
        """
        获取积分
        :param user_id: 用户 ID
        :param action_type: 动作类型（register, daily_checkin, purchase 等）
        :param reference_id: 关联业务 ID
        :param operator_id: 操作人 ID
        :param description: 描述
        :return: 积分变动信息
        """
        # 获取积分账户
        account = self.points_account_repo.find_by_user_id(user_id)
        if not account:
            raise PointsServiceError("积分账户不存在")
        
        # 查找匹配的积分规则
        rules = self.points_rules_repo.find_active_rules(
            rule_type='earn',
            action_type=action_type
        )
        
        if not rules:
            raise PointsServiceError("未找到匹配的积分规则")
        
        # 使用优先级最高的规则
        rule = rules[0]
        points_amount = rule['points_amount']
        
        # 检查条件配置
        condition_config = rule.get('condition_config', {})
        if condition_config.get('oneTime'):
            # 检查是否已经获取过
            existing = self.points_transaction_repo.find_all({
                'user_id': user_id,
                'type': action_type
            })
            if existing:
                raise PointsServiceError("该奖励只能获取一次")
        
        # 更新积分余额
        success = self.points_account_repo.update_balance(user_id, points_amount)
        if not success:
            raise PointsServiceError("积分账户更新失败")
        
        # 获取更新后的余额
        updated_account = self.points_account_repo.find_by_user_id(user_id)
        
        # 创建交易记录
        transaction = self.points_transaction_repo.create({
            'user_id': user_id,
            'amount': points_amount,
            'type': action_type,
            'balance_before': account['balance'],
            'balance_after': updated_account['balance'],
            'description': description or rule['rule_name'],
            'reference_id': reference_id,
            'operator_id': operator_id
        })
        
        # 记录日志
        self.log_repo.create({
            'user_id': user_id,
            'module': 'points',
            'action': 'earn',
            'resource_type': 'points_transaction',
            'resource_id': transaction
        })
        
        return {
            'transaction_id': transaction,
            'points': points_amount,
            'balance': updated_account['balance'],
            'type': action_type
        }
    
    def spend_points(self, user_id: str, points: int, action_type: str,
                    reference_id: str = None, operator_id: str = None,
                    description: str = None) -> Dict[str, Any]:
        """
        消费积分
        :param user_id: 用户 ID
        :param points: 消费积分数
        :param action_type: 动作类型
        :param reference_id: 关联业务 ID
        :param operator_id: 操作人 ID
        :param description: 描述
        :return: 积分变动信息
        """
        if points <= 0:
            raise PointsServiceError("消费积分必须大于 0")
        
        # 获取积分账户
        account = self.points_account_repo.find_by_user_id(user_id)
        if not account:
            raise PointsServiceError("积分账户不存在")
        
        # 检查积分余额
        if account['balance'] < points:
            raise PointsServiceError("积分余额不足")
        
        # 查找匹配的积分规则
        rules = self.points_rules_repo.find_active_rules(
            rule_type='spend',
            action_type=action_type
        )
        
        # 检查条件配置
        if rules:
            rule = rules[0]
            condition_config = rule.get('condition_config', {})
            min_points = condition_config.get('minPoints', 0)
            if points < min_points:
                raise PointsServiceError(f"最少需要使用{min_points}积分")
        
        # 更新积分余额（减少）
        success = self.points_account_repo.update_balance(user_id, -points)
        if not success:
            raise PointsServiceError("积分账户更新失败")
        
        # 获取更新后的余额
        updated_account = self.points_account_repo.find_by_user_id(user_id)
        
        # 创建交易记录
        transaction = self.points_transaction_repo.create({
            'user_id': user_id,
            'amount': -points,
            'type': action_type,
            'balance_before': account['balance'],
            'balance_after': updated_account['balance'],
            'description': description,
            'reference_id': reference_id,
            'operator_id': operator_id
        })
        
        # 记录日志
        self.log_repo.create({
            'user_id': user_id,
            'module': 'points',
            'action': 'spend',
            'resource_type': 'points_transaction',
            'resource_id': transaction
        })
        
        return {
            'transaction_id': transaction,
            'points': points,
            'balance': updated_account['balance'],
            'type': action_type
        }
    
    def get_balance(self, user_id: str) -> Dict[str, Any]:
        """
        查询积分余额
        :param user_id: 用户 ID
        :return: 积分余额信息
        """
        account = self.points_account_repo.find_by_user_id(user_id)
        if not account:
            raise PointsServiceError("积分账户不存在")
        
        return {
            'balance': account['balance'],
            'total_earned': account['total_earned'],
            'total_spent': account['total_spent'],
            'expires_at': account['expires_at']
        }
    
    def get_transactions(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        查询积分交易记录
        :param user_id: 用户 ID
        :param limit: 记录数量
        :return: 交易记录列表
        """
        return self.points_transaction_repo.find_by_user_id(user_id, limit)
    
    def get_rules(self, rule_type: str = None) -> List[Dict[str, Any]]:
        """
        查询积分规则
        :param rule_type: 规则类型（earn 或 spend）
        :return: 规则列表
        """
        return self.points_rules_repo.find_active_rules(rule_type=rule_type)


# ============= 账户服务 =============

class AccountService:
    """账户余额服务"""
    
    def __init__(self):
        self.db = get_connection()
        self.account_balance_repo = AccountBalanceRepository(self.db)
        self.account_transaction_repo = AccountTransactionRepository(self.db)
        self.log_repo = OperationLogRepository(self.db)
    
    def recharge(self, user_id: str, amount: float, payment_method: str,
                transaction_no: str = None, operator_id: str = None) -> Dict[str, Any]:
        """
        充值
        :param user_id: 用户 ID
        :param amount: 充值金额
        :param payment_method: 支付方式（alipay, wechat, bank_card）
        :param transaction_no: 第三方交易流水号
        :param operator_id: 操作人 ID
        :return: 充值结果
        """
        if amount <= 0:
            raise AccountServiceError("充值金额必须大于 0")
        
        # 获取账户余额
        account = self.account_balance_repo.find_by_user_id(user_id)
        if not account:
            raise AccountServiceError("账户不存在")
        
        # 创建交易记录（状态：pending）
        transaction_id = self.account_transaction_repo.create({
            'user_id': user_id,
            'amount': amount,
            'type': 'recharge',
            'status': 'pending',
            'balance_before': float(account['balance']),
            'balance_after': float(account['balance']) + amount,
            'payment_method': payment_method,
            'transaction_no': transaction_no,
            'description': f'充值 {amount} 元',
            'operator_id': operator_id
        })
        
        # 记录日志
        self.log_repo.create({
            'user_id': user_id,
            'module': 'account',
            'action': 'recharge',
            'resource_type': 'account_transaction',
            'resource_id': transaction_id
        })
        
        return {
            'transaction_id': transaction_id,
            'amount': amount,
            'status': 'pending',
            'payment_method': payment_method
        }
    
    def confirm_recharge(self, transaction_id: str) -> bool:
        """
        确认充值（更新交易状态为 completed 并增加余额）
        :param transaction_id: 交易 ID
        :return: 是否成功
        """
        transaction = self.account_transaction_repo.find_by_id(transaction_id)
        if not transaction:
            raise AccountServiceError("交易记录不存在")
        
        if transaction['status'] != 'pending':
            raise AccountServiceError("交易状态不正确")
        
        # 更新余额
        success = self.account_balance_repo.update_balance(
            transaction['user_id'], 
            transaction['amount']
        )
        
        if not success:
            raise AccountServiceError("更新余额失败")
        
        # 更新交易状态
        success = self.account_transaction_repo.update_status(
            transaction_id, 
            'completed'
        )
        
        if not success:
            raise AccountServiceError("更新交易状态失败")
        
        return True
    
    def withdraw(self, user_id: str, amount: float, bank_account: str,
                bank_name: str = None, operator_id: str = None) -> Dict[str, Any]:
        """
        提现
        :param user_id: 用户 ID
        :param amount: 提现金额
        :param bank_account: 收款银行账户
        :param bank_name: 银行名称
        :param operator_id: 操作人 ID
        :return: 提现结果
        """
        if amount <= 0:
            raise AccountServiceError("提现金额必须大于 0")
        
        # 获取账户余额
        account = self.account_balance_repo.find_by_user_id(user_id)
        if not account:
            raise AccountServiceError("账户不存在")
        
        # 检查余额是否充足
        if float(account['balance']) < amount:
            raise AccountServiceError("可用余额不足")
        
        # 冻结金额
        success = self.account_balance_repo.freeze_amount(user_id, amount)
        if not success:
            raise AccountServiceError("冻结金额失败")
        
        # 创建交易记录（状态：pending）
        transaction_id = self.account_transaction_repo.create({
            'user_id': user_id,
            'amount': -amount,
            'type': 'withdraw',
            'status': 'pending',
            'balance_before': float(account['balance']),
            'balance_after': float(account['balance']) - amount,
            'description': f'提现到{bank_name or "银行账户"}',
            'remark': f'收款账户：{bank_account}',
            'operator_id': operator_id
        })
        
        # 记录日志
        self.log_repo.create({
            'user_id': user_id,
            'module': 'account',
            'action': 'withdraw',
            'resource_type': 'account_transaction',
            'resource_id': transaction_id
        })
        
        return {
            'transaction_id': transaction_id,
            'amount': amount,
            'status': 'pending',
            'bank_account': bank_account
        }
    
    def confirm_withdraw(self, transaction_id: str) -> bool:
        """
        确认提现（更新交易状态为 completed）
        :param transaction_id: 交易 ID
        :return: 是否成功
        """
        transaction = self.account_transaction_repo.find_by_id(transaction_id)
        if not transaction:
            raise AccountServiceError("交易记录不存在")
        
        if transaction['status'] != 'pending':
            raise AccountServiceError("交易状态不正确")
        
        # 更新交易状态为 completed（余额已在冻结时扣除）
        success = self.account_transaction_repo.update_status(
            transaction_id, 
            'completed'
        )
        
        # 解冻并扣除金额（实际扣款）
        self.account_balance_repo.unfreeze_amount(
            transaction['user_id'], 
            abs(transaction['amount'])
        )
        
        return success
    
    def reject_withdraw(self, transaction_id: str, reason: str = None) -> bool:
        """
        拒绝提现（解冻金额）
        :param transaction_id: 交易 ID
        :param reason: 拒绝原因
        :return: 是否成功
        """
        transaction = self.account_transaction_repo.find_by_id(transaction_id)
        if not transaction:
            raise AccountServiceError("交易记录不存在")
        
        if transaction['status'] != 'pending':
            raise AccountServiceError("交易状态不正确")
        
        # 解冻金额
        success = self.account_balance_repo.unfreeze_amount(
            transaction['user_id'], 
            abs(transaction['amount'])
        )
        
        if not success:
            raise AccountServiceError("解冻金额失败")
        
        # 更新交易状态为 failed
        success = self.account_transaction_repo.update_status(
            transaction_id, 
            'failed'
        )
        
        # 更新备注
        if reason:
            self.account_transaction_repo.create({
                'user_id': transaction['user_id'],
                'amount': 0,
                'type': 'adjustment',
                'status': 'completed',
                'balance_before': 0,
                'balance_after': 0,
                'description': f'拒绝提现：{reason}',
                'reference_id': transaction_id
            })
        
        return success
    
    def get_balance(self, user_id: str) -> Dict[str, Any]:
        """
        查询账户余额
        :param user_id: 用户 ID
        :return: 余额信息
        """
        account = self.account_balance_repo.find_by_user_id(user_id)
        if not account:
            raise AccountServiceError("账户不存在")
        
        return {
            'balance': float(account['balance']),
            'frozen_amount': float(account['frozen_amount']),
            'available_amount': float(account['balance']) - float(account['frozen_amount']),
            'total_recharged': float(account['total_recharged']),
            'total_withdrawn': float(account['total_withdrawn']),
            'total_spent': float(account['total_spent'])
        }
    
    def get_transactions(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        查询账户交易记录
        :param user_id: 用户 ID
        :param limit: 记录数量
        :return: 交易记录列表
        """
        return self.account_transaction_repo.find_by_user_id(user_id, limit)


# ============= 标签服务 =============

class TagService:
    """标签服务"""
    
    def __init__(self):
        self.db = get_connection()
        self.tag_repo = TagRepository(self.db)
        self.user_tag_repo = UserTagRepository(self.db)
        self.log_repo = OperationLogRepository(self.db)
    
    def create_tag(self, name: str, category: str = None, color: str = None,
                  description: str = None, is_system: bool = False) -> Dict[str, Any]:
        """
        创建标签
        :param name: 标签名称
        :param category: 标签分类
        :param color: 标签颜色
        :param description: 标签描述
        :param is_system: 是否系统标签
        :return: 标签信息
        """
        # 检查标签名称是否已存在
        if self.tag_repo.find_by_name(name):
            raise TagServiceError("标签名称已存在")
        
        # 创建标签
        tag_data = {
            'name': name,
            'category': category,
            'color': color,
            'description': description,
            'is_system': is_system,
            'is_active': True
        }
        tag_id = self.tag_repo.create(tag_data)
        
        # 记录日志
        self.log_repo.create({
            'module': 'tag',
            'action': 'create',
            'resource_type': 'tag',
            'resource_id': tag_id
        })
        
        return {
            'tag_id': tag_id,
            'name': name,
            'category': category,
            'color': color,
            'description': description
        }
    
    def get_tag(self, tag_id: str) -> Dict[str, Any]:
        """
        获取标签详情
        :param tag_id: 标签 ID
        :return: 标签信息
        """
        tag = self.tag_repo.find_by_id(tag_id)
        if not tag:
            raise TagServiceError("标签不存在")
        
        return tag
    
    def get_all_tags(self, filters: Dict = None) -> List[Dict[str, Any]]:
        """
        获取所有标签
        :param filters: 过滤条件
        :return: 标签列表
        """
        return self.tag_repo.find_all(filters)
    
    def update_tag(self, tag_id: str, data: Dict[str, Any]) -> bool:
        """
        更新标签
        :param tag_id: 标签 ID
        :param data: 更新数据
        :return: 是否成功
        """
        tag = self.tag_repo.find_by_id(tag_id)
        if not tag:
            raise TagServiceError("标签不存在")
        
        # 系统标签不可更新
        if tag.get('is_system'):
            raise TagServiceError("系统标签不可更新")
        
        success = self.tag_repo.update(tag_id, data)
        
        if success:
            self.log_repo.create({
                'module': 'tag',
                'action': 'update',
                'resource_type': 'tag',
                'resource_id': tag_id
            })
        
        return success
    
    def delete_tag(self, tag_id: str) -> bool:
        """
        删除标签
        :param tag_id: 标签 ID
        :return: 是否成功
        """
        tag = self.tag_repo.find_by_id(tag_id)
        if not tag:
            raise TagServiceError("标签不存在")
        
        # 系统标签不可删除
        if tag.get('is_system'):
            raise TagServiceError("系统标签不可删除")
        
        success = self.tag_repo.delete(tag_id)
        
        if success:
            self.log_repo.create({
                'module': 'tag',
                'action': 'delete',
                'resource_type': 'tag',
                'resource_id': tag_id
            })
        
        return success
    
    def add_tag_to_user(self, user_id: str, tag_id: str, source: str = 'manual',
                       score: float = 100.0) -> Dict[str, Any]:
        """
        给用户添加标签
        :param user_id: 用户 ID
        :param tag_id: 标签 ID
        :param source: 来源（manual, auto, system）
        :param score: 关联强度分数
        :return: 关联信息
        """
        # 检查标签是否存在
        tag = self.tag_repo.find_by_id(tag_id)
        if not tag:
            raise TagServiceError("标签不存在")
        
        # 检查标签是否启用
        if not tag.get('is_active'):
            raise TagServiceError("标签未启用")
        
        # 添加标签关联
        user_tag_id = self.user_tag_repo.create({
            'user_id': user_id,
            'tag_id': tag_id,
            'source': source,
            'score': score
        })
        
        # 记录日志
        self.log_repo.create({
            'module': 'tag',
            'action': 'add_to_user',
            'resource_type': 'user_tag',
            'resource_id': user_tag_id
        })
        
        return {
            'user_tag_id': user_tag_id,
            'user_id': user_id,
            'tag_id': tag_id,
            'tag_name': tag['name'],
            'source': source
        }
    
    def remove_tag_from_user(self, user_id: str, tag_id: str) -> bool:
        """
        移除用户标签
        :param user_id: 用户 ID
        :param tag_id: 标签 ID
        :return: 是否成功
        """
        success = self.user_tag_repo.delete_by_user_tag(user_id, tag_id)
        
        if success:
            self.log_repo.create({
                'module': 'tag',
                'action': 'remove_from_user',
                'resource_type': 'user_tag',
                'resource_id': f"{user_id}_{tag_id}"
            })
        
        return success
    
    def get_user_tags(self, user_id: str) -> List[Dict[str, Any]]:
        """
        获取用户的所有标签
        :param user_id: 用户 ID
        :return: 标签列表
        """
        return self.user_tag_repo.find_by_user_id(user_id)
    
    def find_users_by_tags(self, tag_ids: List[str], 
                          operator: str = 'AND') -> List[Dict[str, Any]]:
        """
        根据标签查询用户
        :param tag_ids: 标签 ID 列表
        :param operator: 逻辑运算符（AND 或 OR）
        :return: 用户列表
        """
        return self.user_tag_repo.find_users_by_tags(tag_ids, operator)
