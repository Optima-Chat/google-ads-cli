# Google Ads CLI

> 用自然语言管理 Google Ads 广告投放 - 专为 Claude Code 设计的对话式 CLI 工具

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 特性

- 🎯 **完整的广告管理** - 支持广告系列、广告组、关键词、文案和效果分析
- 🤖 **AI 友好** - 可被 Claude Code 自然语言调用
- ⚡ **直接调用** - 使用 Google Ads API 官方 SDK，性能优秀
- 📊 **多格式输出** - 表格、JSON、CSV 多格式支持
- 🔐 **OAuth2 认证** - 完整的 OAuth2 授权流程，自动 token 刷新
- 💎 **架构简洁** - 2 层架构，无额外依赖，部署简单

## 快速开始

```bash
# 安装
npm install -g @optima-chat/google-ads-cli

# 初始化配置（交互式引导）
google-ads init

# OAuth2 登录
google-ads auth login

# 查看账号列表
google-ads account list

# 查看广告系列（替换 YOUR_CUSTOMER_ID）
google-ads campaign list -c YOUR_CUSTOMER_ID

# 查看关键词
google-ads keyword list -c YOUR_CUSTOMER_ID --limit 20

# 执行 GAQL 查询（高级功能）
google-ads query -c YOUR_CUSTOMER_ID -q "SELECT campaign.id, campaign.name FROM campaign" --pretty
```

## 架构

```
Claude Code / AI CLI
        ↓
  google-ads-cli (TypeScript)
        ↓ (Google Ads API SDK)
   Google Ads API
```

**设计理念**: 架构简洁优美，为长远计

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

### 广告系列 (`google-ads campaign`)
- `list -c <customer-id> [--status <status>] [--limit <n>] [--json]` - 列出广告系列
- `info -c <customer-id> <campaign-id> [--json]` - 查看广告系列详情

### 关键词 (`google-ads keyword`)
- `list -c <customer-id> [--campaign-id <id>] [--status <status>] [--limit <n>] [--json]` - 列出关键词

### GAQL 查询 (`google-ads query`)
- `query -c <customer-id> -q "<gaql>" [--json] [--pretty]` - 执行 GAQL 查询
- `query -c <customer-id> -f <file> [--json] [--pretty]` - 从文件执行查询

查看 [完整命令文档](docs/technical-design.md) 了解更多。

## 双模式设计

### 结构化命令（80% 场景）
简单、明确、LLM 易理解

```bash
google-ads campaign list
google-ads campaign create --product-id 123 --budget 100
google-ads keyword add <ad-group-id> --keywords "手机壳,保护壳"
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
- [x] 账号管理命令（account list/info）
- [x] 广告系列命令（campaign list/info）
- [x] 关键词管理命令（keyword list）
- [x] GAQL 查询支持（query）
- [x] Google Ads Client 封装
- [ ] 更多命令（创建、更新、删除等）
- [ ] 单元测试
- [ ] 发布到 NPM

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

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 联系我们

- 官网: https://www.optima.shop
- 社区: https://optima.chat
- GitHub: https://github.com/Optima-Chat/google-ads-cli
