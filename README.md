# Google Ads CLI

> 为客户创建和管理 Google Ads 广告的专业工具 - 专为服务提供商和 Claude Code 设计

[![npm version](https://img.shields.io/npm/v/@optima-chat/google-ads-cli.svg)](https://www.npmjs.com/package/@optima-chat/google-ads-cli)
[![npm downloads](https://img.shields.io/npm/dm/@optima-chat/google-ads-cli.svg)](https://www.npmjs.com/package/@optima-chat/google-ads-cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 定位

**本工具专为 Google Ads 广告主设计**，让您轻松管理自己的广告投放。

- 🎯 **客户专用** - 安装在客户环境，管理自己的 Google Ads 账号
- 🚀 **一键注册** - 通过 CLI 创建账号，自动发送邀请邮件
- ⚡ **自动配置** - 账号信息自动保存，无需手动输入 Customer ID
- 🤖 **AI 友好** - 可被 Claude Code 自然语言调用，对话式管理广告
- 📊 **完整功能** - 创建/查看/删除广告系列、广告组、关键词等

## 特性

- 🎯 **单账号模式** - 专为客户设计，一键配置自动保存
- 📢 **广告投放管理** - 创建广告系列、广告组、关键词
- 📊 **效果分析** - 查看广告表现数据
- ⚡ **直接调用** - 使用 Google Ads API 官方 SDK v21
- 📋 **多格式输出** - 表格、JSON 格式支持
- 🔐 **OAuth2 认证** - 完整的 OAuth2 授权流程，自动 token 刷新
- ⚙️ **配置管理** - CLI config 自动管理账号信息
- 💎 **架构简洁** - TypeScript + Google Ads API，无额外依赖

## 快速开始

### 步骤 1：安装并配置 Agency 凭据

```bash
# 安装
npm install -g @optima-chat/google-ads-cli@latest

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入 Agency 提供的凭据：
# - GOOGLE_ADS_DEVELOPER_TOKEN
# - GOOGLE_ADS_CLIENT_ID
# - GOOGLE_ADS_CLIENT_SECRET
# - GOOGLE_ADS_MANAGER_ACCOUNT_ID (MCC 账号 ID)

# OAuth2 登录授权
google-ads auth login
```

### 步骤 2：创建您的 Google Ads 账号

#### 方式 1: 非交互式模式（推荐 AI/自动化使用）

```bash
# 一次性提供所有参数（无需交互）
google-ads account create \
  --email your@gmail.com \
  --name "Your Company Name" \
  --customer-id 1234567890 \
  --json

# Customer ID 从哪里来？
# 1. 访问 https://ads.google.com/
# 2. 用 Gmail 登录，切换到"专家模式"
# 3. 创建账号（不创建广告系列）
# 4. 记录 Customer ID（10位数字）
```

#### 方式 2: 交互式模式（人类用户）

```bash
# 运行命令，CLI 会引导你创建账号
google-ads account create --email your@gmail.com --name "Your Company Name"

# CLI 会：
# 1. 显示手动创建步骤（引导在 Google Ads UI 中操作）
# 2. 交互式提示输入 Customer ID
# 3. 自动保存配置到 CLI config
```

#### 完成创建后

```bash
# 验证账号配置
google-ads account check
```

**下一步**：
- 检查邮箱中的 Google Ads 邀请邮件
- 点击邮件中的链接接受邀请
- 登录 Google Ads 设置账单信息

**详细教程**：
- 客户创建账号：`docs/客户创建账号指南.md`
- AI 使用指南：`docs/AI-使用指南.md`

### 步骤 3：管理您的广告

```bash
# 查看广告系列
google-ads campaign list

# 创建广告系列
google-ads campaign create -n "我的广告系列" -b 50

# 查看关键词
google-ads keyword list

# 执行 GAQL 查询分析广告表现
google-ads query -q "SELECT campaign.id, campaign.name, metrics.impressions FROM campaign" --pretty
```

### 💡 配置管理

```bash
# 查看当前配置
google-ads config show

# 重置配置（重新创建账号）
google-ads config reset

# 查看配置文件路径
google-ads config path
```

## 使用示例

### 完整广告投放流程

```bash
# 1. 创建广告系列
google-ads campaign create -n "春季促销活动" -b 100

# 2. 创建广告组
google-ads ad-group create --campaign-id 12345678 -n "iPhone 15" -b 2.5

# 3. 添加关键词
google-ads keyword add 98765432 --keywords "iPhone 15,iPhone 15 Pro,苹果手机"

# 4. 查看广告系列表现
google-ads query -q "SELECT campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros FROM campaign WHERE segments.date DURING LAST_7_DAYS" --pretty

# 5. 暂停表现不佳的广告系列
google-ads campaign delete 12345678
```

### 使用 Claude Code 自然语言管理

Claude Code 可以直接调用这些命令：

```
你：帮我创建一个预算 50 美元的春季促销广告系列
Claude：google-ads campaign create -n "春季促销" -b 50

你：查看最近 7 天表现最好的 5 个广告系列
Claude：google-ads query -q "SELECT campaign.name, metrics.clicks FROM campaign WHERE segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 5" --pretty
```

## 架构

```
Agency (提供 MCC 凭据)
        ↓
客户安装 google-ads-cli
        ↓
运行 account create → 创建子账号 + 发送邀请
        ↓
客户接受邀请 + 设置账单
        ↓
Claude Code / AI 调用 CLI
        ↓
google-ads-cli (TypeScript)
        ↓ (Google Ads API SDK)
Google Ads API
        ↓
客户的 Google Ads 账号
```

**设计理念**:
- Agency 提供 MCC 凭据，客户使用 CLI 创建自己的子账号
- 账号信息自动保存到 CLI config，无需手动配置
- 每个客户独立管理自己的广告，互不影响
- 架构简洁，客户体验流畅

## 配置说明

### 环境变量（.env 文件）

**由 Agency 提供**，客户只需复制粘贴到 `.env` 文件：

```bash
# Developer Token（Agency 提供）
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token

# OAuth2 客户端凭据（Agency 提供）
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret

# MCC 管理账号 ID（Agency 提供）
GOOGLE_ADS_MANAGER_ACCOUNT_ID=123-456-7890

# OAuth2 Refresh Token（运行 google-ads auth login 后自动生成）
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
```

### CLI 配置（自动管理）

运行 `google-ads account create` 后，以下信息会自动保存：

- Customer ID（您的 Google Ads 账号 ID）
- 账号名称
- 货币代码
- 时区
- 邮箱地址

配置文件位置：`~/.config/google-ads-cli/config.json`

查看配置：`google-ads config show`

### Agency 获取凭据

1. **创建 MCC 账号**：访问 https://ads.google.com
2. **获取 Developer Token**：访问 https://ads.google.com/aw/apicenter
3. **配置 OAuth2**：
   - 访问 https://console.cloud.google.com
   - 创建项目并启用 Google Ads API
   - 创建 OAuth 2.0 客户端 ID（桌面应用类型）
   - 获取 Client ID 和 Client Secret

## 命令概览

### 基础命令
- `google-ads --version` - 查看版本
- `google-ads --help` - 查看帮助

### 认证管理 (`google-ads auth`)
- `login` - OAuth2 登录
- `logout` - 退出登录
- `status` - 查看认证状态

### 账号管理 (`google-ads account`)
- `create --email <email> --name <name> [--currency <code>] [--timezone <tz>]` - 创建您的 Google Ads 账号
- `check [--json]` - 检查账号配置状态（账单、权限等）

### 广告系列 (`google-ads campaign`)
- `list [--status <status>] [--limit <n>] [--json]` - 列出广告系列
- `info <campaign-id> [--json]` - 查看广告系列详情
- `create -n <name> -b <budget> [--status <status>]` - 创建广告系列
- `delete <campaign-id>` - 删除广告系列

### 广告组 (`google-ads ad-group`)
- `list --campaign-id <id> [--json]` - 列出广告组
- `create --campaign-id <id> -n <name> -b <bid>` - 创建广告组
- `delete <ad-group-id>` - 删除广告组

### 关键词 (`google-ads keyword`)
- `list [--campaign-id <id>] [--status <status>] [--limit <n>] [--json]` - 列出关键词
- `add <ad-group-id> --keywords <words> [--match-type <type>]` - 添加关键词
- `delete <keyword-id>` - 删除关键词

### 配置管理 (`google-ads config`)
- `show [--json]` - 显示当前配置
- `reset [--force]` - 重置配置
- `path` - 显示配置文件路径

### GAQL 查询 (`google-ads query`)
- `query -q "<gaql>" [--json] [--pretty]` - 执行 GAQL 查询
- `query -f <file> [--json] [--pretty]` - 从文件执行查询

查看 [完整命令文档](docs/technical-design.md) 了解更多。

## 双模式设计

### 结构化命令（80% 场景）
简单、明确、LLM 易理解

```bash
# 管理您的广告
google-ads campaign list
google-ads campaign create -n "广告系列名称" -b 100
google-ads keyword add <ad-group-id> --keywords "产品关键词1,产品关键词2"
```

### GAQL 查询（20% 场景）
灵活、强大、适合复杂分析

```bash
google-ads query "
  SELECT
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros
  FROM campaign
  WHERE segments.date DURING LAST_7_DAYS
  ORDER BY metrics.clicks DESC
"
```

## 版本说明

**当前版本：v0.4.0**

### ✅ 已实现功能

- ✅ 客户专用架构（单账号模式）
- ✅ OAuth2 认证（login/logout/status）
- ✅ 混合配置管理（.env + CLI config）
- ✅ 账号管理（account create/check）
- ✅ 配置管理（config show/reset/path）
- ✅ 广告系列管理（campaign list/info/create/delete）
- ✅ 广告组管理（ad-group list/create/delete）
- ✅ 关键词管理（keyword list/add/delete）
- ✅ GAQL 查询支持（query）
- ✅ 自动发布到 NPM

### 🚧 开发中功能

- 🚧 账号创建 API 调用（当前通过 UI 手动创建 + CLI 保存配置）
- 🚧 广告文案管理命令
- 🚧 效果分析和报表命令

### ⚠️ 已知限制

1. **账号创建**：当前需要手动在 Google Ads UI 中创建账号，然后通过 CLI 保存配置。API 自动创建功能正在开发中。
2. **EU 政治广告**：创建广告系列时默认设置为不包含 EU 政治广告（符合 2025 年 9 月新规）
3. **单账号模式**：每个客户只能配置一个 Google Ads 账号，如需管理多账号请使用 `google-ads config reset` 切换

## 相关项目

- [gaql-cli](https://github.com/getyourguide/gaql-cli) - GAQL 查询工具（设计参考）
- [optima-cli](https://github.com/Optima-Chat/optima-cli) - 电商管理 CLI（技术栈参考）

## 技术栈

- **CLI 框架**: commander.js
- **HTTP 客户端**: axios
- **输出格式化**: chalk + cli-table3
- **交互提示**: inquirer
- **配置管理**: conf
- **开发工具**: TypeScript + tsx

## 发布流程

本项目使用 GitHub Actions 自动发布到 NPM：

```bash
# 更新版本号（patch/minor/major）
npm version patch

# 推送 tag 触发自动发布
git push --follow-tags
```

GitHub Actions 会自动：
- 运行测试和构建
- 发布到 NPM
- 创建 GitHub Release
- 生成 changelog

查看最新发布：https://github.com/Optima-Chat/google-ads-cli/releases

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 联系我们

- 官网: https://www.optima.shop
- 社区: https://optima.chat
- GitHub: https://github.com/Optima-Chat/google-ads-cli
