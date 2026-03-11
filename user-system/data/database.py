"""
数据库连接配置
"""

import mysql.connector
from mysql.connector import pooling
import os
from typing import Optional


class DatabaseConfig:
    """数据库配置"""
    
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = int(os.getenv('DB_PORT', 3306))
        self.database = os.getenv('DB_NAME', 'user_system')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.charset = 'utf8mb4'
        self.pool_size = int(os.getenv('DB_POOL_SIZE', 5))
        self.pool_name = 'user_system_pool'
    
    def get_connection(self) -> mysql.connector.MySQLConnection:
        """获取数据库连接"""
        return mysql.connector.connect(
            host=self.host,
            port=self.port,
            database=self.database,
            user=self.user,
            password=self.password,
            charset=self.charset
        )
    
    def get_connection_pool(self) -> pooling.MySQLConnectionPool:
        """获取连接池"""
        return pooling.MySQLConnectionPool(
            pool_name=self.pool_name,
            pool_size=self.pool_size,
            host=self.host,
            port=self.port,
            database=self.database,
            user=self.user,
            password=self.password,
            charset=self.charset
        )


# 全局连接池实例
_connection_pool: Optional[pooling.MySQLConnectionPool] = None


def get_connection_pool() -> pooling.MySQLConnectionPool:
    """获取全局连接池"""
    global _connection_pool
    if _connection_pool is None:
        config = DatabaseConfig()
        _connection_pool = config.get_connection_pool()
    return _connection_pool


def get_connection() -> mysql.connector.MySQLConnection:
    """从连接池获取连接"""
    pool = get_connection_pool()
    return pool.get_connection()


def init_database():
    """初始化数据库（执行 schema.sql）"""
    config = DatabaseConfig()
    
    # 先连接到 MySQL 服务器（不指定数据库）
    conn = mysql.connector.connect(
        host=config.host,
        port=config.port,
        user=config.user,
        password=config.password,
        charset=config.charset
    )
    
    cursor = conn.cursor()
    
    # 创建数据库（如果不存在）
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.execute(f"USE {config.database}")
    
    # 读取并执行 schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql')
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    # 分割 SQL 语句（按分号分割）
    statements = schema_sql.split(';')
    
    for statement in statements:
        statement = statement.strip()
        if statement and not statement.startswith('--'):
            cursor.execute(statement)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"数据库 '{config.database}' 初始化完成")


if __name__ == '__main__':
    init_database()
