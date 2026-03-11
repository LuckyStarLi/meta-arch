# GitHub 主分支同步说明

**更新时间**: 2024-01-15  
**当前状态**: ✅ 已同步到主分支

---

## ✅ 完成情况

### 分支信息
- **本地分支**: `main`
- **GitHub 分支**: `main` (默认主分支)
- **Gitee 分支**: `main`
- **状态**: 双平台都已同步到主分支

### 远程仓库
```bash
origin  https://gitee.com/gitee_hyq/meta-arch.git
github  https://github.com/LuckyStarLi/meta-arch.git
```

### 远程分支
- `remotes/github/main` ✅
- `remotes/github/master` (旧分支)
- `remotes/origin/main` ✅
- `remotes/origin/master` (旧分支)

---

## 📋 操作步骤总结

### 1. 重命名本地分支
```bash
git branch -m master main
```

### 2. 强制推送到 GitHub 主分支
```bash
git push -u github main --force
```

### 3. 推送到 Gitee 主分支
```bash
git push origin main
```

### 4. 推送标签
```bash
git push origin v1.0.0
git push github v1.0.0
```

---

## 🚀 后续同步命令

### 日常开发同步

```bash
# 1. 提交更改
git add .
git commit -m "feat: 新功能或修复"

# 2. 同步到双平台主分支
git push origin main
git push github main
```

### 创建新标签

```bash
# 1. 创建标签
git tag -a v1.1.0 -m "版本说明"

# 2. 推送到双平台
git push origin v1.1.0
git push github v1.1.0
```

### 拉取远程更新

```bash
# 拉取 GitHub 更新
git pull github main

# 拉取 Gitee 更新
git pull origin main
```

---

## 📊 分支对比

### 原方案（master）
- ❌ GitHub 默认分支是 main，不匹配
- ❌ 需要手动切换或创建 PR
- ✅ 与 Gitee 一致

### 现方案（main）
- ✅ 与 GitHub 默认分支一致
- ✅ 直接推送到主分支
- ✅ Gitee 也支持 main 分支
- ✅ 符合 Git 新标准

---

## 🎯 最佳实践

### 1. 统一使用 main 分支
GitHub、Gitee、本地都使用 `main` 作为主分支。

### 2. 双平台同步
```bash
# 推送代码
git push origin main
git push github main

# 或使用脚本
git push origin main && git push github main
```

### 3. 标签同步
```bash
# 推送所有标签
git push origin --tags
git push github --tags
```

### 4. 清理旧分支（可选）
```bash
# 删除远程旧分支（谨慎操作）
git push origin --delete master
git push github --delete master

# 删除本地旧分支
git branch -d master
```

---

## 📝 常用命令速查

### 查看分支
```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看远程分支
git branch -r
```

### 切换分支
```bash
# 切换到 main 分支
git checkout main

# 创建并切换新分支
git checkout -b feature/new-feature
```

### 推送分支
```bash
# 首次推送（设置上游）
git push -u origin main
git push -u github main

# 后续推送
git push origin main
git push github main
```

### 强制推送（谨慎使用）
```bash
# 仅在必要时使用
git push origin main --force
git push github main --force
```

---

## ⚠️ 注意事项

### 1. 强制推送风险
强制推送会覆盖远程历史，仅在必要时使用：
- 重命名分支
- 修改提交历史
- 修复错误提交

### 2. 团队协作
如果有多人协作，重命名分支前需通知团队成员。

### 3. 备份
重要操作前建议备份：
```bash
# 创建备份分支
git branch backup-master
```

### 4. 检查状态
操作后检查状态：
```bash
# 查看远程仓库
git remote -v

# 查看分支
git branch -a

# 查看提交历史
git log --oneline --graph --all
```

---

## 🎉 当前状态

### GitHub
- ✅ 主分支：`main`
- ✅ 已推送代码
- ✅ 已推送标签 v1.0.0
- ✅ 地址：https://github.com/LuckyStarLi/meta-arch

### Gitee
- ✅ 主分支：`main`
- ✅ 已推送代码
- ✅ 已推送标签 v1.0.0
- ✅ 地址：https://gitee.com/gitee_hyq/meta-arch

---

## 📞 快速链接

### 仓库地址
- **GitHub**: https://github.com/LuckyStarLi/meta-arch
- **Gitee**: https://gitee.com/gitee_hyq/meta-arch

### 克隆命令
```bash
# GitHub
git clone https://github.com/LuckyStarLi/meta-arch.git

# Gitee
git clone https://gitee.com/gitee_hyq/meta-arch.git
```

### 分支信息
- **默认分支**: `main`
- **当前版本**: v1.0.0

---

**状态**: ✅ 双平台主分支同步完成

**最后更新**: 2024-01-15
