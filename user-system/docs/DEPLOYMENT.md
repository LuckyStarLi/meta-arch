# 用户系统部署文档

## 目录

1. [系统要求](#系统要求)
2. [环境准备](#环境准备)
3. [数据库初始化](#数据库初始化)
4. [安装依赖](#安装依赖)
5. [配置说明](#配置说明)
6. [启动服务](#启动服务)
7. [生产环境部署](#生产环境部署)
8. [监控与维护](#监控与维护)
9. [常见问题](#常见问题)

---

## 系统要求

### 硬件要求
- CPU: 2 核心或更高
- 内存：4GB RAM 或更高
- 磁盘：10GB 可用空间或更高

### 软件要求
- Python 3.9+
- MySQL 8.0+ 或 MariaDB 10.5+
- Nginx（生产环境）
- Redis（可选，用于缓存）

---

## 环境准备

### 1. 安装 Python 3.9+

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3-pip
```

**CentOS/RHEL**:
```bash
sudo yum install python39 python39-devel
```

**Windows**:
从 [Python 官网](https://www.python.org/downloads/) 下载安装程序

**macOS**:
```bash
brew install python@3.9
```

### 2. 安装 MySQL 8.0+

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install mysql-server-8.0
sudo mysql_secure_installation
```

**CentOS/RHEL**:
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

**Windows/macOS**:
从 [MySQL 官网](https://dev.mysql.com/downloads/) 下载安装程序

### 3. 创建虚拟环境

```bash
cd user-system
python3 -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

---

## 数据库初始化

### 1. 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE user_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'user_system'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON user_system.* TO 'user_system'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. 执行 Schema

```bash
# 方法 1：使用命令行
mysql -u user_system -p user_system < database/schema.sql

# 方法 2：使用 Python 脚本
python data/database.py
```

### 3. 验证数据库

```bash
mysql -u user_system -p user_system

SHOW TABLES;
-- 应该看到以下表：
-- users
-- user_points_accounts
-- points_transactions
-- points_rules
-- user_account_balances
-- account_transactions
-- tags
-- user_tags
-- user_auth_tokens
-- operation_logs
```

---

## 安装依赖

### 1. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 2. requirements.txt 内容

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
mysql-connector-python==8.2.0
pyjwt==2.8.0
bcrypt==4.1.2
pydantic==2.5.0
pydantic[email]==2.5.0
python-multipart==0.0.6
python-dotenv==1.0.0
```

安装：
```bash
pip install -r requirements.txt
```

---

## 配置说明

### 1. 环境变量配置

创建 `.env` 文件在项目根目录：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=user_system
DB_USER=user_system
DB_PASSWORD=your_secure_password
DB_POOL_SIZE=5

# JWT 配置
JWT_SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_HOURS=24

# 服务器配置
HOST=0.0.0.0
PORT=8000
WORKERS=4
DEBUG=false

# CORS 配置（生产环境修改为具体域名）
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### 2. 配置说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机地址 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_NAME | 数据库名称 | user_system |
| DB_USER | 数据库用户名 | user_system |
| DB_PASSWORD | 数据库密码 | - |
| DB_POOL_SIZE | 连接池大小 | 5 |
| JWT_SECRET_KEY | JWT 密钥（至少 32 字符） | - |
| JWT_ALGORITHM | JWT 算法 | HS256 |
| TOKEN_EXPIRE_HOURS | Token 过期时间（小时） | 24 |
| HOST | 服务监听地址 | 0.0.0.0 |
| PORT | 服务端口 | 8000 |
| WORKERS | 工作进程数 | 4 |
| DEBUG | 调试模式 | false |
| ALLOWED_ORIGINS | 允许的 CORS 源 | * |
| LOG_LEVEL | 日志级别 | INFO |
| LOG_FILE | 日志文件路径 | logs/app.log |

---

## 启动服务

### 1. 开发环境

```bash
# 激活虚拟环境
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# 启动服务（单进程）
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# 或启动多进程
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 --workers 2
```

访问：
- API 文档：http://localhost:8000/docs
- 备用文档：http://localhost:8000/redoc
- 健康检查：http://localhost:8000/health

### 2. 生产环境

```bash
# 启动多进程服务
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4

# 或使用 gunicorn（推荐）
gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 3. 使用 systemd 管理（Linux）

创建服务文件 `/etc/systemd/system/user-system.service`:

```ini
[Unit]
Description=User System API Service
After=network.target mysql.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/user-system
Environment="PATH=/path/to/user-system/venv/bin"
ExecStart=/path/to/user-system/venv/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=user-system

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl start user-system
sudo systemctl enable user-system
sudo systemctl status user-system
```

---

## 生产环境部署

### 1. Nginx 反向代理配置

创建 `/etc/nginx/sites-available/user-system`:

```nginx
upstream user_system {
    server 127.0.0.1:8000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # 强制 HTTPS（可选）
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 日志
    access_log /var/log/nginx/user-system-access.log;
    error_log /var/log/nginx/user-system-error.log;
    
    # 客户端上传大小限制
    client_max_body_size 10M;
    
    # 代理配置
    location / {
        proxy_pass http://user_system;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲配置
        proxy_buffering off;
    }
    
    # 健康检查端点
    location /health {
        proxy_pass http://user_system;
        access_log off;
    }
    
    # 静态文件（如果有）
    location /static {
        alias /path/to/user-system/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/user-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. 使用 Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: user_system_db
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: user_system
      MYSQL_USER: user_system
      MYSQL_PASSWORD: user_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    networks:
      - user_system_network
    restart: always

  api:
    build: .
    container_name: user_system_api
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: user_system
      DB_USER: user_system
      DB_PASSWORD: user_password
      JWT_SECRET_KEY: your-super-secret-key-change-in-production
      WORKERS: 4
    ports:
      - "8000:8000"
    depends_on:
      - db
    networks:
      - user_system_network
    restart: always
    volumes:
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    container_name: user_system_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - user_system_network
    restart: always

volumes:
  mysql_data:

networks:
  user_system_network:
    driver: bridge
```

启动：
```bash
docker-compose up -d
```

### 3. 使用 Supervisor 管理进程

安装 Supervisor：
```bash
sudo apt install supervisor
```

创建配置文件 `/etc/supervisor/conf.d/user-system.conf`:

```ini
[program:user-system]
command=/path/to/user-system/venv/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
directory=/path/to/user-system
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/user-system/out.log
stopwaitsecs=60
```

启动：
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start user-system
sudo supervisorctl status
```

---

## 监控与维护

### 1. 日志管理

**查看日志**:
```bash
# 应用日志
tail -f logs/app.log

# Nginx 日志
tail -f /var/log/nginx/user-system-access.log
tail -f /var/log/nginx/user-system-error.log

# Systemd 日志
journalctl -u user-system -f
```

**日志轮转** (/etc/logrotate.d/user-system):
```
/path/to/user-system/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload user-system
    endscript
}
```

### 2. 数据库备份

创建备份脚本 `backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backups/user_system"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="user_system"
DB_USER="user_system"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 压缩
gzip $BACKUP_DIR/backup_$DATE.sql

# 删除 30 天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

设置定时任务：
```bash
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

### 3. 性能监控

**使用 Prometheus + Grafana**:

安装导出器：
```bash
pip install prometheus-client
```

在应用中添加监控端点：
```python
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

**监控指标**:
- 请求量 (QPS)
- 响应时间 (P95, P99)
- 错误率
- 数据库连接池使用率
- 内存使用率

### 4. 健康检查

```bash
# 检查服务状态
curl http://localhost:8000/health

# 检查数据库连接
curl http://localhost:8000/api/v1/users/profile \
  -H "Authorization: Bearer <token>"
```

---

## 常见问题

### 1. 数据库连接失败

**问题**: `Can't connect to MySQL server`

**解决方案**:
```bash
# 检查 MySQL 服务状态
sudo systemctl status mysql

# 检查数据库用户权限
mysql -u root -p
SELECT User, Host FROM mysql.user;
SHOW GRANTS FOR 'user_system'@'localhost';

# 检查防火墙
sudo ufw status
sudo ufw allow 3306/tcp
```

### 2. 端口被占用

**问题**: `Address already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :8000

# 杀死进程
kill -9 <PID>

# 或修改配置使用其他端口
PORT=8001
```

### 3. JWT Token 验证失败

**问题**: `Invalid token` 或 `Token expired`

**解决方案**:
- 检查 `JWT_SECRET_KEY` 是否一致
- 检查服务器时间是否同步
- 重新登录获取新 token

### 4. 跨域问题 (CORS)

**问题**:浏览器报 CORS 错误

**解决方案**:
在 `.env` 中配置 `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

或在 `api/main.py` 中修改 CORS 配置：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. 数据库字符集问题

**问题**: 中文乱码

**解决方案**:
```sql
-- 检查数据库字符集
SHOW CREATE DATABASE user_system;

-- 应该是：CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
-- 如果不是，重新创建数据库或修改：
ALTER DATABASE user_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. 内存泄漏

**问题**: 服务运行一段时间后内存占用过高

**解决方案**:
```bash
# 重启服务
sudo systemctl restart user-system

# 或设置自动重启（systemd 配置中已包含）
Restart=always

# 检查代码中的内存泄漏
# 使用 memory_profiler 等工具分析
```

### 7. 数据库连接池耗尽

**问题**: `Too many connections`

**解决方案**:
```bash
# 增加连接池大小
DB_POOL_SIZE=10

# 或增加 MySQL 最大连接数
# 编辑 /etc/mysql/mysql.conf.d/mysqld.cnf
max_connections = 500

# 重启 MySQL
sudo systemctl restart mysql
```

### 8. 静态文件 404

**问题**: 静态文件无法访问

**解决方案**:
```bash
# 检查 Nginx 配置中的静态文件路径
# 确保路径正确且有读取权限
ls -la /path/to/user-system/static

# 重新加载 Nginx 配置
sudo nginx -t
sudo systemctl reload nginx
```

---

## 快速部署脚本

创建 `deploy.sh`:
```bash
#!/bin/bash

set -e

echo "=== 用户系统快速部署脚本 ==="

# 1. 检查 Python 版本
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python 版本：$python_version"

# 2. 创建虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 3. 激活虚拟环境
source venv/bin/activate

# 4. 安装依赖
echo "安装依赖..."
pip install --upgrade pip
pip install -r requirements.txt

# 5. 初始化数据库
echo "初始化数据库..."
python data/database.py

# 6. 创建日志目录
mkdir -p logs

# 7. 启动服务
echo "启动服务..."
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4

echo "=== 部署完成 ==="
echo "访问：http://localhost:8000/docs"
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 联系支持

如遇到问题，请检查：
1. 日志文件：`logs/app.log`
2. 系统日志：`journalctl -u user-system`
3. 数据库日志：`/var/log/mysql/error.log`

---

**文档版本**: 1.0.0  
**最后更新**: 2024-01-01  
**维护者**: 用户系统开发团队
