# Optima Ads Monorepo - Claude Code 使用指南

> Monorepo 包含 CLI 和 Backend 两个包

## 🏗️ 项目结构

```
optima-ads/
├── packages/
│   ├── cli/          # @optima-chat/ads-cli - 命令行工具
│   └── backend/      # @optima-chat/ads-backend - REST API 服务
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## 🛠️ 开发命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式
pnpm dev:cli      # 启动 CLI 开发
pnpm dev:backend  # 启动 Backend 开发

# 只构建特定包
pnpm --filter @optima-chat/ads-cli build
pnpm --filter @optima-chat/ads-backend build
```

---

## 📦 CLI 使用指南 (@optima-chat/ads-cli)

### 常用命令

```bash
# 登录
google-ads auth login

# 列出广告系列
google-ads campaign list --json

# 创建广告系列
google-ads campaign create \
  -n "广告系列名称" \
  -b 100 \
  --status PAUSED \
  --json

# 执行 GAQL 查询
google-ads query -q "SELECT campaign.name, metrics.clicks FROM campaign" --json
```

### 非交互式模式（重要）

❌ **错误**（会卡住）:
```bash
google-ads account create --email a@b.com --name "X"
```

✅ **正确**:
```bash
google-ads account create --email a@b.com --name "X" --customer-id 1234567890 --json
```

---

## 🔌 Backend API 端点 (@optima-chat/ads-backend)

| 端点 | 描述 |
|------|------|
| `GET /api/v1/auth/google-ads/connect` | 开始 OAuth2 连接 |
| `DELETE /api/v1/auth/google-ads/disconnect` | 断开连接 |
| `GET /api/v1/accounts` | 列出可访问账号 |
| `GET /api/v1/customers/:id/campaigns` | 列出广告系列 |
| `POST /api/v1/customers/:id/campaigns` | 创建广告系列 |
| `PATCH /api/v1/customers/:id/campaigns/:id` | 更新广告系列 |
| `DELETE /api/v1/customers/:id/campaigns/:id` | 删除广告系列 |
| `GET /api/v1/customers/:id/ad-groups` | 列出广告组 |
| `GET /api/v1/customers/:id/keywords` | 列出关键词 |
| `GET /api/v1/customers/:id/ads` | 列出广告 |
| `POST /api/v1/customers/:id/query` | 执行 GAQL 查询 |

---

## 🔐 认证模式

### Backend 模式（推荐）

```bash
# 先登录 Optima
optima auth login

# 再连接 Google Ads
google-ads auth login --backend
```

### 直接模式（Legacy）

CLI 直接调用 Google Ads API，需要在 .env 中配置 secrets。

```bash
google-ads auth login
```

---

## 🚀 部署

### 本地开发

```bash
# 启动 PostgreSQL
docker compose up postgres -d

# 启动 Backend
pnpm --filter @optima-chat/ads-backend dev
```

### 生产部署

```bash
# 推送标签触发 CI/CD
git tag v0.5.0
git push origin v0.5.0
```

---

## 📚 完整文档

- **CLI 使用示例**: `docs/EXAMPLES.md`
- **客户创建账号指南**: `docs/客户创建账号指南.md`
- **技术设计**: `docs/technical-design.md`

---

## 🎯 核心原则

1. **非交互式优先**: 所有命令支持完全非交互式调用
2. **JSON 输出**: 使用 `--json` 便于 AI 解析
3. **明确错误**: 错误信息清晰，便于 AI 理解和反馈
4. **pnpm workspace**: 使用 pnpm 管理依赖
