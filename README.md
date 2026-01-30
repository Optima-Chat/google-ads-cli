# Optima Ads

> Google Ads 广告管理平台 - Monorepo 包含 CLI 和 Backend 两个包

[![npm version](https://img.shields.io/npm/v/@optima-chat/ads-cli.svg)](https://www.npmjs.com/package/@optima-chat/ads-cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 项目结构

```
optima-ads/
├── packages/
│   ├── cli/          # @optima-chat/ads-cli - 命令行工具
│   └── backend/      # @optima-chat/ads-backend - REST API 服务
├── docs/             # 文档
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动 CLI 开发
pnpm dev:cli

# 启动 Backend 开发
pnpm dev:backend
```

### 构建

```bash
# 构建所有包
pnpm build

# 只构建特定包
pnpm --filter @optima-chat/ads-cli build
pnpm --filter @optima-chat/ads-backend build
```

## 📦 CLI (@optima-chat/ads-cli)

命令行工具，支持直接调用 Google Ads API 或通过 Backend 代理。

### 安装

```bash
npm install -g @optima-chat/ads-cli@latest
```

### 认证

```bash
# Backend 模式（推荐）- 通过 Optima 平台认证
optima auth login
google-ads auth login --backend

# 直接模式 - 直接调用 Google Ads API
google-ads auth login
```

### 常用命令

```bash
# 列出广告系列
google-ads campaign list --json

# 创建广告系列
google-ads campaign create -n "广告系列名称" -b 100 --status PAUSED --json

# 执行 GAQL 查询
google-ads query -q "SELECT campaign.name, metrics.clicks FROM campaign" --json

# 查看账号状态
google-ads account check

# 广告系列定向
google-ads campaign targeting list --campaign-id 123456
google-ads campaign targeting add --campaign-id 123456 --type location --geo-target 2840
google-ads campaign targeting remove --campaign-id 123456 --criterion-id 789

# 广告组定向
google-ads ad-group targeting list --ad-group-id 123456
google-ads ad-group targeting add --ad-group-id 123456 --type age --range 25-34
```

详细文档：[CLI 使用示例](docs/EXAMPLES.md)

## 🔌 Backend (@optima-chat/ads-backend)

REST API 服务，提供 OAuth2 认证和 Google Ads API 代理。

### 本地开发

```bash
# 启动 PostgreSQL
docker compose up postgres -d

# 启动 Backend
pnpm dev:backend
```

### API 端点

| 端点 | 描述 |
|------|------|
| `GET /health` | 健康检查 |
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
| `GET /api/v1/customers/:id/campaigns/:id/targeting` | 列出广告系列定向 |
| `POST /api/v1/customers/:id/campaigns/:id/targeting` | 添加广告系列定向 |
| `DELETE /api/v1/customers/:id/campaigns/:id/targeting/:criterionId` | 删除广告系列定向 |
| `GET /api/v1/customers/:id/ad-groups/:id/targeting` | 列出广告组定向 |
| `POST /api/v1/customers/:id/ad-groups/:id/targeting` | 添加广告组定向 |
| `DELETE /api/v1/customers/:id/ad-groups/:id/targeting/:criterionId` | 删除广告组定向 |

### 环境变量

Backend 需要以下环境变量：

```bash
# 数据库
DATABASE_URL=postgresql://...

# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_MANAGER_ACCOUNT_ID=...

# Optima 平台
OPTIMA_API_URL=...
```

## 部署

### Stage 环境

```bash
# 通过 GitHub Actions 部署
gh workflow run deploy-ecs.yml -f environment=stage
```

### 生产环境

```bash
# 部署到生产
gh workflow run deploy-ecs.yml -f environment=prod
```

### 发布新版本

```bash
# 推送标签触发 CI/CD
git tag v0.x.0
git push origin v0.x.0
```

## 文档

- [CLI 使用示例](docs/EXAMPLES.md)
- [客户创建账号指南](docs/客户创建账号指南.md)
- [技术设计](docs/technical-design.md)

## 技术栈

- **构建工具**: Turborepo + pnpm workspace
- **语言**: TypeScript 5.0+
- **CLI**: Commander.js
- **Backend**: NestJS
- **数据库**: PostgreSQL
- **部署**: AWS ECS

## 许可证

MIT License

## 联系我们

- 官网: https://www.optima.shop
- 社区: https://optima.chat
- GitHub: https://github.com/Optima-Chat/optima-ads
