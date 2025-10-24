# Google Ads CLI 技术文档

> 直接调用 Google Ads API 的命令行工具，专为 LLM (Claude Code) 设计

## 📚 核心文档

### 1. [使用示例](EXAMPLES.md) 🚀 新用户必读

**完整的使用指南和实战示例**

- 📋 准备工作（获取 API 凭据）
- ⚡ 快速开始（安装、配置、登录）
- 💼 账号管理示例
- 📊 广告系列管理示例
- 🔑 关键词分析示例
- 🔍 GAQL 高级查询示例
- 🤖 在 AI 中使用（Claude Code 示例）
- 📝 脚本集成示例

**适合**: 所有用户，特别是首次使用者

---

### 2. [技术设计](technical-design.md) ⭐ 开发者必读

**最新的完整技术方案**

- 🎯 架构设计（直接 API 调用，2 层架构）
- 🔐 OAuth2 认证实现
- 📦 技术栈和依赖（google-ads-api SDK）
- 🛠️ 项目结构
- 🗺️ 开发路线图（12 周）
- 💡 关键挑战和应对

**适合**: 所有开发者，必读文档

---

### 3. [架构决策](architecture-decision.md) 📋

**为什么选择直接调用 API**

- ⚖️ 方案 A (MCP Server) vs 方案 B (直接 API) 对比
- 📊 9 个维度详细分析
- 🎯 决策理由和权衡
- 📖 参考案例（gaql-cli, optima-cli）

**适合**: 想了解架构决策背景的开发者

---

### 4. [gaql-cli 参考分析](gaql-cli-reference.md) 🔍

**从 gaql-cli 项目学到什么**

- 🔬 gaql-cli 深度分析（Python, 26 stars）
- ✅ 可借鉴的设计（多格式输出、配置管理、错误处理）
- ❌ 不适用的部分（REPL 模式）
- 💡 实施建议

**适合**: 想了解设计灵感来源的开发者

---

## 🚀 快速导航

### 我想...

- **快速上手使用** → [使用示例](EXAMPLES.md)
- **查看实战案例** → [使用示例 - GAQL 查询](EXAMPLES.md#gaql-高级查询)
- **在 AI 中使用** → [使用示例 - AI 集成](EXAMPLES.md#在-ai-中使用)
- **了解整体架构** → [技术设计 - 架构设计](technical-design.md#架构设计)
- **看开发计划** → [技术设计 - 开发路线图](technical-design.md#开发路线图更新)
- **理解为什么不用 MCP** → [架构决策](architecture-decision.md)
- **学习 OAuth2 实现** → [技术设计 - 认证流程设计](technical-design.md#认证流程设计关键)
- **查看命令设计** → [技术设计 - 命令实现示例](technical-design.md#命令实现示例)
- **了解双模式** → [技术设计 - 双模式设计详解](technical-design.md#双模式设计详解)

---

## 🎯 核心特性

### 双模式设计

**结构化命令（80%）**
```bash
google-ads campaign list
google-ads campaign create --product-id 123 --budget 100
```

**GAQL 查询（20%）**
```bash
google-ads query "SELECT campaign.name, metrics.clicks FROM campaign"
```

### 技术亮点

- ⚡ **直接 API 调用** - 2 层架构，性能优秀（~500ms）
- 🔐 **完整 OAuth2** - 自动 token 刷新
- 📊 **多格式输出** - table/json/csv/jsonl
- 🤖 **LLM 友好** - 专为 Claude Code 设计
- 💎 **架构简洁** - 单一代码库，易维护

---

## 📖 文档版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v2.0 | 2025-10-24 | 采用直接 API 调用架构（当前版本）|
| v1.0 | 2025-10-24 | 基于 MCP Server 架构（已废弃）|

---

## 🔗 相关资源

### 外部参考

- [Google Ads API 官方文档](https://developers.google.com/google-ads/api/docs/start)
- [google-ads-api (Node.js SDK)](https://github.com/Opteo/google-ads-api)
- [gaql-cli 项目](https://github.com/getyourguide/gaql-cli)
- [optima-cli 项目](https://github.com/Optima-Chat/optima-cli)

### 项目仓库

- **GitHub**: https://github.com/Optima-Chat/google-ads-cli
- **Issues**: https://github.com/Optima-Chat/google-ads-cli/issues

---

## 💡 设计理念

> **"为长远计，我们要保持系统架构简洁优美"**

- 🎯 简洁至上 - 2 层架构，无额外依赖
- ⚡ 性能优先 - 直接调用，减少延迟
- 🤖 AI 友好 - 为 LLM 调用优化设计
- 📦 易于部署 - 一个 npm 包搞定
- 🔧 易于维护 - 单一技术栈，清晰架构

---

**Last Updated**: 2025-10-24
