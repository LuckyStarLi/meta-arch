"""
用户系统 - 数据层 Repository
=====================================
采用 Repository 模式封装数据库操作
提供统一的数据访问接口
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import hashlib
import bcrypt


class BaseRepository(ABC):
    """Repository 基类"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    @abstractmethod
    def find_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def create(self, data: Dict[str, Any]) -> str:
        pass
    
    @abstractmethod
    def update(self, id: str, data: Dict[str, Any]) -> bool:
        pass
    
    @abstractmethod
    def delete(self, id: str) -> bool:
        pass


class UserRepository(BaseRepository):
    """用户信息 Repository"""
    
    def find_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id = %s AND status != -1", (user_id,))
        return cursor.fetchone()
    
    def find_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s AND status != -1", (username,))
        return cursor.fetchone()
    
    def find_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE phone = %s AND status != -1", (phone,))
        return cursor.fetchone()
    
    def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s AND status != -1", (email,))
        return cursor.fetchone()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT id, username, phone, email, avatar_url, status, created_at, updated_at, last_login_at FROM users WHERE status != -1"
        params = []
        
        if filters:
            if 'status' in filters:
                query += " AND status = %s"
                params.append(filters['status'])
            if 'created_after' in filters:
                query += " AND created_at >= %s"
                params.append(filters['created_after'])
        
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        user_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        # 密码加密
        password_hash = self._hash_password(data['password'])
        
        cursor.execute("""
            INSERT INTO users (id, username, password_hash, phone, email, avatar_url, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, data['username'], password_hash, data.get('phone'), 
              data.get('email'), data.get('avatar_url'), data.get('status', 1)))
        
        self.db.commit()
        return user_id
    
    def update(self, user_id: str, data: Dict[str, Any]) -> bool:
        cursor = self.db.cursor()
        
        # 构建动态更新语句
        updates = []
        params = []
        
        allowed_fields = ['username', 'phone', 'email', 'avatar_url', 'status', 'last_login_at', 'last_login_ip']
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates:
            return False
        
        params.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, params)
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, user_id: str) -> bool:
        # 软删除：设置 status = -1
        return self.update(user_id, {'status': -1})
    
    def update_login_info(self, user_id: str, ip: str) -> bool:
        """更新登录信息"""
        cursor = self.db.cursor()
        cursor.execute("""
            UPDATE users 
            SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = %s
            WHERE id = %s
        """, (ip, user_id))
        self.db.commit()
        return cursor.rowcount > 0
    
    @staticmethod
    def _hash_password(password: str) -> str:
        """密码哈希"""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """验证密码"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


class PointsAccountRepository(BaseRepository):
    """积分账户 Repository"""
    
    def find_by_id(self, account_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_points_accounts WHERE id = %s", (account_id,))
        return cursor.fetchone()
    
    def find_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_points_accounts WHERE user_id = %s", (user_id,))
        return cursor.fetchone()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM user_points_accounts WHERE 1=1"
        params = []
        
        if filters:
            if 'min_balance' in filters:
                query += " AND balance >= %s"
                params.append(filters['min_balance'])
            if 'user_id' in filters:
                query += " AND user_id = %s"
                params.append(filters['user_id'])
        
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        account_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO user_points_accounts (id, user_id, balance, total_earned, total_spent, expires_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (account_id, data['user_id'], data.get('balance', 0), 
              data.get('total_earned', 0), data.get('total_spent', 0), data.get('expires_at')))
        
        self.db.commit()
        return account_id
    
    def update(self, account_id: str, data: Dict[str, Any]) -> bool:
        cursor = self.db.cursor()
        
        updates = []
        params = []
        
        allowed_fields = ['balance', 'total_earned', 'total_spent', 'expires_at']
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates:
            return False
        
        params.append(account_id)
        query = f"UPDATE user_points_accounts SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, params)
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, account_id: str) -> bool:
        cursor = self.db.cursor()
        cursor.execute("DELETE FROM user_points_accounts WHERE id = %s", (account_id,))
        self.db.commit()
        return cursor.rowcount > 0
    
    def update_balance(self, user_id: str, amount: int) -> bool:
        """更新积分余额（支持增加和减少）"""
        cursor = self.db.cursor()
        
        if amount > 0:
            cursor.execute("""
                UPDATE user_points_accounts 
                SET balance = balance + %s, total_earned = total_earned + %s
                WHERE user_id = %s
            """, (amount, amount, user_id))
        else:
            cursor.execute("""
                UPDATE user_points_accounts 
                SET balance = balance + %s, total_spent = total_spent + %s
                WHERE user_id = %s AND balance >= %s
            """, (amount, abs(amount), user_id, abs(amount)))
        
        self.db.commit()
        return cursor.rowcount > 0


class PointsTransactionRepository(BaseRepository):
    """积分交易记录 Repository"""
    
    def find_by_id(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM points_transactions WHERE id = %s", (transaction_id,))
        return cursor.fetchone()
    
    def find_by_user_id(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM points_transactions 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (user_id, limit))
        return cursor.fetchall()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM points_transactions WHERE 1=1"
        params = []
        
        if filters:
            if 'user_id' in filters:
                query += " AND user_id = %s"
                params.append(filters['user_id'])
            if 'type' in filters:
                query += " AND type = %s"
                params.append(filters['type'])
            if 'reference_id' in filters:
                query += " AND reference_id = %s"
                params.append(filters['reference_id'])
            if 'start_date' in filters:
                query += " AND created_at >= %s"
                params.append(filters['start_date'])
            if 'end_date' in filters:
                query += " AND created_at <= %s"
                params.append(filters['end_date'])
        
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        transaction_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO points_transactions 
            (id, user_id, amount, type, balance_before, balance_after, description, reference_id, operator_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (transaction_id, data['user_id'], data['amount'], data['type'],
              data['balance_before'], data['balance_after'], data.get('description'),
              data.get('reference_id'), data.get('operator_id')))
        
        self.db.commit()
        return transaction_id
    
    def update(self, transaction_id: str, data: Dict[str, Any]) -> bool:
        # 交易记录通常不允许更新
        return False
    
    def delete(self, transaction_id: str) -> bool:
        # 交易记录不允许删除（审计需求）
        return False


class PointsRulesRepository(BaseRepository):
    """积分规则 Repository"""
    
    def find_by_id(self, rule_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM points_rules WHERE id = %s", (rule_id,))
        return cursor.fetchone()
    
    def find_active_rules(self, rule_type: str = None, action_type: str = None) -> List[Dict[str, Any]]:
        """获取启用的规则"""
        cursor = self.db.cursor(dictionary=True)
        query = """
            SELECT * FROM points_rules 
            WHERE is_active = TRUE 
            AND (valid_from IS NULL OR valid_from <= NOW())
            AND (valid_to IS NULL OR valid_to >= NOW())
        """
        params = []
        
        if rule_type:
            query += " AND rule_type = %s"
            params.append(rule_type)
        
        if action_type:
            query += " AND action_type = %s"
            params.append(action_type)
        
        query += " ORDER BY priority DESC"
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM points_rules WHERE 1=1"
        params = []
        
        if filters:
            if 'rule_type' in filters:
                query += " AND rule_type = %s"
                params.append(filters['rule_type'])
            if 'is_active' in filters:
                query += " AND is_active = %s"
                params.append(filters['is_active'])
        
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        rule_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO points_rules 
            (id, rule_name, rule_type, action_type, points_amount, condition_config, is_active, priority, valid_from, valid_to)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (rule_id, data['rule_name'], data['rule_type'], data['action_type'],
              data['points_amount'], data.get('condition_config'), data.get('is_active', True),
              data.get('priority', 0), data.get('valid_from'), data.get('valid_to')))
        
        self.db.commit()
        return rule_id
    
    def update(self, rule_id: str, data: Dict[str, Any]) -> bool:
        cursor = self.db.cursor()
        
        updates = []
        params = []
        
        allowed_fields = ['rule_name', 'rule_type', 'action_type', 'points_amount', 
                         'condition_config', 'is_active', 'priority', 'valid_from', 'valid_to']
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates:
            return False
        
        params.append(rule_id)
        query = f"UPDATE points_rules SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, params)
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, rule_id: str) -> bool:
        cursor = self.db.cursor()
        cursor.execute("DELETE FROM points_rules WHERE id = %s", (rule_id,))
        self.db.commit()
        return cursor.rowcount > 0


class AccountBalanceRepository(BaseRepository):
    """账户余额 Repository"""
    
    def find_by_id(self, account_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_account_balances WHERE id = %s", (account_id,))
        return cursor.fetchone()
    
    def find_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_account_balances WHERE user_id = %s", (user_id,))
        return cursor.fetchone()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM user_account_balances WHERE 1=1"
        params = []
        
        if filters:
            if 'user_id' in filters:
                query += " AND user_id = %s"
                params.append(filters['user_id'])
            if 'min_balance' in filters:
                query += " AND balance >= %s"
                params.append(filters['min_balance'])
        
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        account_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO user_account_balances (id, user_id, balance, frozen_amount, total_recharged, total_withdrawn, total_spent)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (account_id, data['user_id'], data.get('balance', 0), data.get('frozen_amount', 0),
              data.get('total_recharged', 0), data.get('total_withdrawn', 0), data.get('total_spent', 0)))
        
        self.db.commit()
        return account_id
    
    def update(self, account_id: str, data: Dict[str, Any]) -> bool:
        cursor = self.db.cursor()
        
        updates = []
        params = []
        
        allowed_fields = ['balance', 'frozen_amount', 'total_recharged', 'total_withdrawn', 'total_spent']
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates:
            return False
        
        params.append(account_id)
        query = f"UPDATE user_account_balances SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, params)
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, account_id: str) -> bool:
        cursor = self.db.cursor()
        cursor.execute("DELETE FROM user_account_balances WHERE id = %s", (account_id,))
        self.db.commit()
        return cursor.rowcount > 0
    
    def update_balance(self, user_id: str, amount: float) -> bool:
        """更新账户余额（支持增加和减少）"""
        cursor = self.db.cursor()
        
        if amount > 0:
            cursor.execute("""
                UPDATE user_account_balances 
                SET balance = balance + %s, total_recharged = total_recharged + %s
                WHERE user_id = %s
            """, (amount, amount, user_id))
        else:
            cursor.execute("""
                UPDATE user_account_balances 
                SET balance = balance + %s, total_withdrawn = total_withdrawn + %s
                WHERE user_id = %s AND balance >= %s
            """, (amount, abs(amount), user_id, abs(amount)))
        
        self.db.commit()
        return cursor.rowcount > 0
    
    def freeze_amount(self, user_id: str, amount: float) -> bool:
        """冻结金额"""
        cursor = self.db.cursor()
        cursor.execute("""
            UPDATE user_account_balances 
            SET balance = balance - %s, frozen_amount = frozen_amount + %s
            WHERE user_id = %s AND balance >= %s
        """, (amount, amount, user_id, amount))
        self.db.commit()
        return cursor.rowcount > 0
    
    def unfreeze_amount(self, user_id: str, amount: float) -> bool:
        """解冻金额"""
        cursor = self.db.cursor()
        cursor.execute("""
            UPDATE user_account_balances 
            SET balance = balance + %s, frozen_amount = frozen_amount - %s
            WHERE user_id = %s AND frozen_amount >= %s
        """, (amount, amount, user_id, amount))
        self.db.commit()
        return cursor.rowcount > 0


class AccountTransactionRepository(BaseRepository):
    """账户交易记录 Repository"""
    
    def find_by_id(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM account_transactions WHERE id = %s", (transaction_id,))
        return cursor.fetchone()
    
    def find_by_user_id(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM account_transactions 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (user_id, limit))
        return cursor.fetchall()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM account_transactions WHERE 1=1"
        params = []
        
        if filters:
            if 'user_id' in filters:
                query += " AND user_id = %s"
                params.append(filters['user_id'])
            if 'type' in filters:
                query += " AND type = %s"
                params.append(filters['type'])
            if 'status' in filters:
                query += " AND status = %s"
                params.append(filters['status'])
            if 'reference_id' in filters:
                query += " AND reference_id = %s"
                params.append(filters['reference_id'])
        
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        transaction_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO account_transactions 
            (id, user_id, amount, type, status, balance_before, balance_after, payment_method, 
             transaction_no, description, reference_id, operator_id, remark)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (transaction_id, data['user_id'], data['amount'], data['type'], data['status'],
              data['balance_before'], data['balance_after'], data.get('payment_method'),
              data.get('transaction_no'), data.get('description'), data.get('reference_id'),
              data.get('operator_id'), data.get('remark')))
        
        self.db.commit()
        return transaction_id
    
    def update_status(self, transaction_id: str, status: str, completed_at: datetime = None) -> bool:
        """更新交易状态"""
        cursor = self.db.cursor()
        cursor.execute("""
            UPDATE account_transactions 
            SET status = %s, completed_at = %s
            WHERE id = %s
        """, (status, completed_at or datetime.now(), transaction_id))
        self.db.commit()
        return cursor.rowcount > 0
    
    def update(self, transaction_id: str, data: Dict[str, Any]) -> bool:
        # 交易记录通常不允许直接更新，使用 update_status
        return False
    
    def delete(self, transaction_id: str) -> bool:
        # 交易记录不允许删除（审计需求）
        return False


class TagRepository(BaseRepository):
    """标签 Repository"""
    
    def find_by_id(self, tag_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tags WHERE id = %s", (tag_id,))
        return cursor.fetchone()
    
    def find_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tags WHERE name = %s", (name,))
        return cursor.fetchone()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM tags WHERE 1=1"
        params = []
        
        if filters:
            if 'category' in filters:
                query += " AND category = %s"
                params.append(filters['category'])
            if 'is_active' in filters:
                query += " AND is_active = %s"
                params.append(filters['is_active'])
            if 'is_system' in filters:
                query += " AND is_system = %s"
                params.append(filters['is_system'])
        
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        tag_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO tags (id, name, category, color, description, is_system, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (tag_id, data['name'], data.get('category'), data.get('color', '#3b82f6'),
              data.get('description'), data.get('is_system', False), data.get('is_active', True)))
        
        self.db.commit()
        return tag_id
    
    def update(self, tag_id: str, data: Dict[str, Any]) -> bool:
        cursor = self.db.cursor()
        
        updates = []
        params = []
        
        allowed_fields = ['name', 'category', 'color', 'description', 'is_active']
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates:
            return False
        
        params.append(tag_id)
        query = f"UPDATE tags SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, params)
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, tag_id: str) -> bool:
        # 检查是否是系统标签
        tag = self.find_by_id(tag_id)
        if tag and tag.get('is_system'):
            return False  # 系统标签不可删除
        
        cursor = self.db.cursor()
        cursor.execute("DELETE FROM tags WHERE id = %s", (tag_id,))
        self.db.commit()
        return cursor.rowcount > 0
    
    def increment_usage(self, tag_id: str) -> bool:
        """增加标签使用次数"""
        cursor = self.db.cursor()
        cursor.execute("UPDATE tags SET usage_count = usage_count + 1 WHERE id = %s", (tag_id,))
        self.db.commit()
        return cursor.rowcount > 0


class UserTagRepository(BaseRepository):
    """用户标签关联 Repository"""
    
    def find_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_tags WHERE id = %s", (id,))
        return cursor.fetchone()
    
    def find_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        """获取用户的所有标签"""
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("""
            SELECT ut.*, t.name, t.category, t.color 
            FROM user_tags ut
            JOIN tags t ON ut.tag_id = t.id
            WHERE ut.user_id = %s
            ORDER BY ut.created_at DESC
        """, (user_id,))
        return cursor.fetchall()
    
    def find_by_tag_id(self, tag_id: str) -> List[Dict[str, Any]]:
        """获取拥有某标签的所有用户"""
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("""
            SELECT ut.*, u.username 
            FROM user_tags ut
            JOIN users u ON ut.user_id = u.id
            WHERE ut.tag_id = %s
        """, (tag_id,))
        return cursor.fetchall()
    
    def find_all(self, filters: Dict = None) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = """
            SELECT ut.*, t.name as tag_name, t.category, t.color 
            FROM user_tags ut
            JOIN tags t ON ut.tag_id = t.id
            WHERE 1=1
        """
        params = []
        
        if filters:
            if 'user_id' in filters:
                query += " AND ut.user_id = %s"
                params.append(filters['user_id'])
            if 'tag_id' in filters:
                query += " AND ut.tag_id = %s"
                params.append(filters['tag_id'])
            if 'source' in filters:
                query += " AND ut.source = %s"
                params.append(filters['source'])
        
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        user_tag_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        # 检查是否已存在
        cursor.execute("""
            SELECT id FROM user_tags WHERE user_id = %s AND tag_id = %s
        """, (data['user_id'], data['tag_id']))
        
        if cursor.fetchone():
            # 已存在，更新
            cursor.execute("""
                UPDATE user_tags 
                SET source = %s, score = %s, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s AND tag_id = %s
            """, (data.get('source', 'manual'), data.get('score', 100), 
                  data['user_id'], data['tag_id']))
            self.db.commit()
            return cursor.lastrowid
        
        cursor.execute("""
            INSERT INTO user_tags (id, user_id, tag_id, source, score)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_tag_id, data['user_id'], data['tag_id'], 
              data.get('source', 'manual'), data.get('score', 100)))
        
        # 更新标签使用次数
        tag_repo = TagRepository(self.db)
        tag_repo.increment_usage(data['tag_id'])
        
        self.db.commit()
        return user_tag_id
    
    def update(self, id: str, data: Dict[str, Any]) -> bool:
        cursor = self.db.cursor()
        
        updates = []
        params = []
        
        allowed_fields = ['source', 'score']
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates:
            return False
        
        params.append(id)
        query = f"UPDATE user_tags SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, params)
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, id: str) -> bool:
        cursor = self.db.cursor()
        cursor.execute("DELETE FROM user_tags WHERE id = %s", (id,))
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete_by_user_tag(self, user_id: str, tag_id: str) -> bool:
        """删除用户与标签的关联"""
        cursor = self.db.cursor()
        cursor.execute("DELETE FROM user_tags WHERE user_id = %s AND tag_id = %s", 
                      (user_id, tag_id))
        self.db.commit()
        return cursor.rowcount > 0
    
    def find_users_by_tags(self, tag_ids: List[str], operator: str = 'AND') -> List[Dict[str, Any]]:
        """
        根据多个标签查询用户
        operator: 'AND' - 同时拥有所有标签，'OR' - 拥有任意标签
        """
        cursor = self.db.cursor(dictionary=True)
        
        if not tag_ids:
            return []
        
        placeholders = ','.join(['%s'] * len(tag_ids))
        
        if operator == 'AND':
            query = f"""
                SELECT user_id, COUNT(DISTINCT tag_id) as tag_count
                FROM user_tags
                WHERE tag_id IN ({placeholders})
                GROUP BY user_id
                HAVING tag_count = %s
            """
            params = tag_ids + [len(tag_ids)]
        else:  # OR
            query = f"""
                SELECT DISTINCT user_id
                FROM user_tags
                WHERE tag_id IN ({placeholders})
            """
            params = tag_ids
        
        cursor.execute(query, params)
        return cursor.fetchall()


class OperationLogRepository(BaseRepository):
    """操作日志 Repository"""
    
    def find_by_id(self, log_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM operation_logs WHERE id = %s", (log_id,))
        return cursor.fetchone()
    
    def find_all(self, filters: Dict = None, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM operation_logs WHERE 1=1"
        params = []
        
        if filters:
            if 'user_id' in filters:
                query += " AND user_id = %s"
                params.append(filters['user_id'])
            if 'module' in filters:
                query += " AND module = %s"
                params.append(filters['module'])
            if 'action' in filters:
                query += " AND action = %s"
                params.append(filters['action'])
            if 'start_date' in filters:
                query += " AND created_at >= %s"
                params.append(filters['start_date'])
            if 'end_date' in filters:
                query += " AND created_at <= %s"
                params.append(filters['end_date'])
        
        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)
        
        cursor.execute(query, params)
        return cursor.fetchall()
    
    def create(self, data: Dict[str, Any]) -> str:
        log_id = str(uuid.uuid4())
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO operation_logs 
            (id, user_id, module, action, resource_type, resource_id, 
             request_body, response_code, error_message, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (log_id, data.get('user_id'), data['module'], data['action'],
              data.get('resource_type'), data.get('resource_id'), data.get('request_body'),
              data.get('response_code'), data.get('error_message'), 
              data.get('ip_address'), data.get('user_agent')))
        
        self.db.commit()
        return log_id
    
    def update(self, log_id: str, data: Dict[str, Any]) -> bool:
        # 日志不允许更新
        return False
    
    def delete(self, log_id: str) -> bool:
        # 日志不允许删除（审计需求）
        return False
