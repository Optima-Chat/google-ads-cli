# Google Ads CLI

> 为客户创建和管理 Google Ads 广告的专业工具 - 专为服务提供商和 Claude Code 设计

[![npm version](https://img.shields.io/npm/v/@optima-chat/google-ads-cli.svg)](https://www.npmjs.com/package/@optima-chat/google-ads-cli)
[![npm downloads](https://img.shields.io/npm/dm/@optima-chat/google-ads-cli.svg)](https://www.npmjs.com/package/@optima-chat/google-ads-cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 定位

**本工具专为服务提供商设计**，用于为客户创建和管理 Google Ads 广告账号。

- 🏢 **服务提供商视角** - 使用您自己的 OAuth2 凭据（一次性配置）
- 👥 **多客户管理** - 为多个客户创建和管理独立的广告账号
- 🎯 **客户资产** - 广告系列、关键词、广告内容都属于客户
- 🤖 **AI 友好** - 可被 Claude Code 自然语言调用，简化客户服务流程

## 特性

- 🎯 **完整的客户账号管理** - 创建账号、配置账单、管理权限
- 📢 **广告投放管理** - 创建广告系列、广告组、关键词、文案
- 📊 **效果分析** - 查看客户广告表现数据
- ⚡ **直接调用** - 使用 Google Ads API 官方 SDK，性能优秀
- 📋 **多格式输出** - 表格、JSON、CSV 多格式支持
- 🔐 **OAuth2 认证** - 完整的 OAuth2 授权流程，自动 token 刷新
- 💎 **架构简洁** - 2 层架构，无额外依赖，部署简单

## 快速开始（服务提供商）

### 第一步：一次性设置（服务提供商配置）

```bash
# 安装
npm install -g @optima-chat/google-ads-cli@latest

# 查看完整设置指南
google-ads setup

# 初始化 OAuth2 凭据（需要 Developer Token、Client ID、Client Secret）
google-ads init

# OAuth2 登录授权
google-ads auth login

# 验证配置
google-ads account list
```

### 第二步：为客户管理广告

```bash
# 为客户创建 Google Ads 账号
google-ads account create \
  --merchant-id <客户商户ID> \
  --currency USD \
  --timezone "America/New_York" \
  --name "客户公司名称"

# 检查客户账号状态（账单、权限等）
google-ads account check -c <CUSTOMER_ID>

# 为客户创建广告系列
google-ads campaign create \
  -c <CUSTOMER_ID> \
  -n "客户的广告系列名称" \
  -b 50

# 查看客户的广告系列
google-ads campaign list -c <CUSTOMER_ID>

# 为客户添加关键词
google-ads keyword add <AD_GROUP_ID> \
  --keywords "产品关键词1,产品关键词2" \
  --match-type EXACT

# 查看客户的关键词
google-ads keyword list -c <CUSTOMER_ID> --limit 20

# 执行 GAQL 查询分析客户广告表现
google-ads query -c <CUSTOMER_ID> \
  -q "SELECT campaign.id, campaign.name, metrics.impressions FROM campaign" \
  --pretty
```

## 架构

```
服务提供商 (一次性 OAuth2 配置)
        ↓
   Claude Code / AI
        ↓
  google-ads-cli (TypeScript)
        ↓ (Google Ads API SDK)
   Google Ads API
        ↓
  多个客户的广告账号
```

**设计理念**:
- 服务提供商使用自己的凭据（MCC 管理账号）
- 为多个客户创建和管理独立的广告账号
- 架构简洁优美，为长远计

## 命令概览

### 基础命令
- `google-ads init` - 初始化配置
- `google-ads config show` - 查看配置
- `google-ads config set <key> <value>` - 设置配置
- `google-ads --version` - 查看版本
- `google-ads --help` - 查看帮助

### 认证管理 (`google-ads auth`)
- `login` - OAuth2 登录
- `logout` - 退出登录
- `status` - 查看认证状态

### 账号管理 (`google-ads account`)
- `list [--json]` - 列出可访问的账号
- `info <customer-id> [--json]` - 查看账号详情
- `check -c <customer-id> [--json]` - 检查账号配置状态（账单、权限等）
- `create --merchant-id <id> --currency <code> --timezone <tz> --name <name>` - 为客户创建账号

### 广告系列 (`google-ads campaign`)
- `list -c <customer-id> [--status <status>] [--limit <n>] [--json]` - 列出广告系列
- `info -c <customer-id> <campaign-id> [--json]` - 查看广告系列详情
- `create -c <customer-id> -n <name> -b <budget> [--status <status>]` - 创建广告系列
- `delete -c <customer-id> <campaign-id>` - 删除广告系列

### 广告组 (`google-ads ad-group`)
- `list -c <customer-id> --campaign-id <id> [--json]` - 列出广告组
- `create -c <customer-id> --campaign-id <id> -n <name> -b <bid>` - 创建广告组
- `delete -c <customer-id> <ad-group-id>` - 删除广告组

### 关键词 (`google-ads keyword`)
- `list -c <customer-id> [--campaign-id <id>] [--status <status>] [--limit <n>] [--json]` - 列出关键词
- `add <ad-group-id> --keywords <words> [--match-type <type>]` - 添加关键词
- `delete -c <customer-id> <keyword-id>` - 删除关键词

### GAQL 查询 (`google-ads query`)
- `query -c <customer-id> -q "<gaql>" [--json] [--pretty]` - 执行 GAQL 查询
- `query -c <customer-id> -f <file> [--json] [--pretty]` - 从文件执行查询

查看 [完整命令文档](docs/technical-design.md) 了解更多。

## 双模式设计

### 结构化命令（80% 场景）
简单、明确、LLM 易理解

```bash
# 为客户管理广告
google-ads campaign list -c <CUSTOMER_ID>
google-ads campaign create -c <CUSTOMER_ID> -n "广告系列名称" -b 100
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

## 开发状态

🎉 **核心功能已实现**

- [x] 技术方案设计
- [x] 架构决策（直接 API 调用）
- [x] OAuth2 认证实现（login/logout/status）
- [x] 配置管理（init/config）
- [x] 服务提供商设置指南（setup）
- [x] 账号管理命令（account list/info/check/create）
- [x] 广告系列命令（campaign list/info/create/delete）
- [x] 广告组命令（ad-group list/create/delete）
- [x] 关键词管理命令（keyword list/add/delete）
- [x] GAQL 查询支持（query）
- [x] Google Ads Client 封装
- [x] 集成测试
- [x] 发布到 NPM（当前版本 v0.2.0）
- [x] GitHub Actions 自动化发布
- [ ] 客户账号创建 API 实现（当前为手动指引）
- [ ] 更多命令（广告文案、效果分析等）
- [ ] 单元测试

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
