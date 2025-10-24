# Google Ads CLI

> 用自然语言管理 Google Ads 广告投放 - 专为 Claude Code 设计的对话式 CLI 工具

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 特性

- 🎯 **完整的广告管理** - 支持广告系列、广告组、关键词、文案和效果分析
- 🤖 **AI 友好** - 可被 Claude Code 和 AI CLI 自然语言调用
- 🔌 **MCP 集成** - 基于 google-ads-mcp 的 MCP 协议通信
- 📊 **美观输出** - 表格和 JSON 双格式输出
- ⚡ **快速响应** - 实时反馈命令执行状态

## 快速开始

```bash
# 安装
npm install -g @optima-chat/google-ads-cli

# 初始化配置
google-ads init --mcp-url http://localhost:8240

# 查看账号列表
google-ads account list

# 创建广告系列
google-ads campaign create --product-id 123 --budget 100
```

## 架构

```
Claude Code / AI CLI
        ↓
  google-ads-cli (TypeScript)
        ↓ (MCP/SSE)
  google-ads-mcp (Python)
        ↓
   Google Ads API
```

## 命令概览

### 账号管理 (`google-ads account`)
- `list` - 账号列表
- `status <id>` - 账号状态
- `billing <id>` - 账单信息
- `invite <id>` - 邀请用户

### 广告系列 (`google-ads campaign`)
- `create` - 创建广告系列
- `list` - 系列列表
- `update <id>` - 更新系列
- `pause <id>` - 暂停系列
- `resume <id>` - 恢复系列
- `delete <id>` - 删除系列

### 关键词 (`google-ads keyword`)
- `add <ad-group-id>` - 添加关键词
- `research` - 关键词研究（AI 驱动）
- `list <ad-group-id>` - 关键词列表
- `update <id>` - 更新关键词
- `delete <id>` - 删除关键词

查看 [完整命令文档](docs/technical-design.md) 了解更多。

## 开发状态

🚧 **项目处于早期开发阶段**

- [x] 技术方案设计
- [ ] 项目基础设施
- [ ] 核心功能实现
- [ ] AI CLI 集成
- [ ] 测试和文档

## 相关项目

- [google-ads-mcp](https://github.com/Optima-Chat/google-ads-mcp) - Google Ads MCP Server
- [optima-cli](https://github.com/Optima-Chat/optima-cli) - 电商管理 CLI（参考项目）
- [optima-ai-shell](https://github.com/Optima-Chat/optima-ai-shell) - AI CLI 工具

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
