# Google Ads CLI 技术方案

## 项目概述

将 google-ads-mcp (MCP Server) 的功能封装成 CLI 工具，供 AI CLI (optima-ai) 调用。参考 optima-cli 的设计模式，实现命令行接口，通过 MCP 协议与 google-ads-mcp 后端通信。

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                         用户交互层                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Claude Code / AI CLI (optima-ai)                            │
│  ↓ (自然语言 → Shell 命令)                                    │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ shell 调用
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    google-ads-cli (新项目)                    │
│                    TypeScript + Commander.js                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📦 命令模块                                                  │
│  ├── account (账号管理)                                       │
│  ├── campaign (广告系列)                                      │
│  ├── ad-group (广告组)                                        │
│  ├── keyword (关键词)                                         │
│  ├── ad-copy (广告文案)                                       │
│  └── performance (效果分析)                                   │
│                                                               │
│  🔧 核心服务                                                  │
│  ├── API Client (HTTP 客户端)                                │
│  ├── Config Manager (配置管理)                               │
│  ├── Auth Service (认证服务)                                 │
│  └── Output Formatter (输出格式化)                           │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ HTTP/SSE
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                 google-ads-mcp (已有项目)                     │
│                 Python + FastMCP                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔌 MCP Tools                                                │
│  ├── manage_account                                          │
│  ├── manage_campaigns                                        │
│  ├── manage_ad_groups                                        │
│  ├── manage_keywords                                         │
│  ├── manage_ad_copy                                          │
│  └── manage_performance                                      │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Google Ads API
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                      Google Ads API                          │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| CLI 框架 | commander.js | 与 optima-cli 一致，成熟稳定 |
| HTTP 客户端 | axios | 与 optima-cli 一致，用于 MCP 通信 |
| 输出格式化 | chalk + cli-table3 | 与 optima-cli 一致，美观的终端输出 |
| 交互提示 | inquirer | 与 optima-cli 一致，交互式输入 |
| 配置存储 | conf | 与 optima-cli 一致，配置持久化 |
| 开发工具 | tsx + TypeScript | 与 optima-cli 一致，类型安全 |
| 加载动画 | ora | 与 optima-cli 一致，命令执行提示 |
| MCP 通信 | SSE (Server-Sent Events) | google-ads-mcp 支持的协议 |

## 项目结构

```
google-ads-cli/
├── package.json              # 包配置，bin: google-ads
├── tsconfig.json            # TypeScript 配置
├── .claude/                 # Claude Code 集成文档
│   └── CLAUDE.md           # CLI 命令文档（供 AI 使用）
├── docs/                    # 技术文档
│   ├── technical-design.md # 技术方案
│   └── api-reference.md    # API 参考
├── src/
│   ├── index.ts            # 入口文件，注册所有命令
│   ├── config.ts           # 配置管理（MCP 服务地址、认证等）
│   ├── commands/           # 命令模块
│   │   ├── account/        # 账号管理命令
│   │   │   ├── index.ts
│   │   │   ├── list.ts     # google-ads account list
│   │   │   ├── status.ts   # google-ads account status
│   │   │   └── billing.ts  # google-ads account billing
│   │   ├── campaign/       # 广告系列命令
│   │   │   ├── index.ts
│   │   │   ├── create.ts   # google-ads campaign create
│   │   │   ├── list.ts     # google-ads campaign list
│   │   │   ├── pause.ts    # google-ads campaign pause
│   │   │   └── resume.ts   # google-ads campaign resume
│   │   ├── ad-group/       # 广告组命令
│   │   ├── keyword/        # 关键词命令
│   │   ├── ad-copy/        # 广告文案命令
│   │   └── performance/    # 效果分析命令
│   ├── api/               # API 客户端
│   │   ├── mcp-client.ts  # MCP 协议客户端
│   │   └── types.ts       # 类型定义
│   └── utils/             # 工具函数
│       ├── auth.ts        # 认证管理
│       ├── config.ts      # 配置读写
│       ├── formatter.ts   # 输出格式化（表格、JSON）
│       └── logger.ts      # 日志
└── dist/                  # 编译输出
```

## MCP 工具映射

| MCP Tool | CLI 命令结构 | 说明 |
|----------|-------------|------|
| manage_account | `google-ads account <action>` | list/status/billing/invite |
| manage_campaigns | `google-ads campaign <action>` | create/list/update/pause/resume/delete |
| manage_ad_groups | `google-ads ad-group <action>` | create/list/update/delete |
| manage_keywords | `google-ads keyword <action>` | add/list/update/delete/research |
| manage_ad_copy | `google-ads ad-copy <action>` | create/list/update/delete |
| manage_performance | `google-ads performance <action>` | report/analyze |

## 命令设计

### 账号管理 (account)

```bash
# 列出所有账号
google-ads account list

# 查看账号状态
google-ads account status <account-id>

# 查看账单信息
google-ads account billing <account-id>

# 邀请用户
google-ads account invite <account-id> --email user@example.com --role ADMIN
```

### 广告系列管理 (campaign)

```bash
# 创建广告系列
google-ads campaign create \
  --product-id 123 \
  --budget 100 \
  --name "春季促销" \
  --start-date 2025-03-01 \
  --locations "CN,HK" \
  --languages "zh-CN"

# 列出广告系列
google-ads campaign list

# 更新广告系列
google-ads campaign update <campaign-id> --budget 200

# 暂停/恢复广告系列
google-ads campaign pause <campaign-id>
google-ads campaign resume <campaign-id>

# 删除广告系列
google-ads campaign delete <campaign-id> --yes
```

### 广告组管理 (ad-group)

```bash
# 创建广告组
google-ads ad-group create <campaign-id> \
  --name "核心产品组" \
  --cpc 1.5

# 列出广告组
google-ads ad-group list <campaign-id>

# 更新广告组
google-ads ad-group update <ad-group-id> --cpc 2.0

# 删除广告组
google-ads ad-group delete <ad-group-id> --yes
```

### 关键词管理 (keyword)

```bash
# 添加关键词
google-ads keyword add <ad-group-id> \
  --keywords "手机壳,iPhone保护壳" \
  --match-type EXACT \
  --cpc 1.2

# 关键词研究
google-ads keyword research \
  --product-id 123 \
  --language zh-CN \
  --country CN \
  --include-competitors

# 列出关键词
google-ads keyword list <ad-group-id>

# 更新关键词
google-ads keyword update <keyword-id> --cpc 1.5 --status PAUSED

# 删除关键词
google-ads keyword delete <keyword-id> --yes
```

### 广告文案管理 (ad-copy)

```bash
# 创建广告文案
google-ads ad-copy create <ad-group-id> \
  --headlines "优质手机壳,iPhone专用,限时特惠" \
  --descriptions "高品质材料,完美贴合,立即购买" \
  --final-url "https://example.com/product/123"

# 列出广告文案
google-ads ad-copy list <ad-group-id>

# 更新广告文案
google-ads ad-copy update <ad-id> --status PAUSED

# 删除广告文案
google-ads ad-copy delete <ad-id> --yes
```

### 效果分析 (performance)

```bash
# 生成效果报告
google-ads performance report \
  --campaign-id 123 \
  --start-date 2025-01-01 \
  --end-date 2025-01-31 \
  --metrics "impressions,clicks,cost,conversions"

# 综合分析
google-ads performance analyze \
  --level campaign \
  --period last-30-days
```

## MCP 通信实现

### MCP Client 核心类

```typescript
// src/api/mcp-client.ts
import axios, { AxiosInstance } from 'axios';
import { MCPToolRequest, MCPToolResponse } from './types.js';

export class MCPClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8240') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 调用 MCP 工具
   */
  async callTool<T = any>(
    toolName: string,
    params: Record<string, any>,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await this.client.post<MCPToolResponse<T>>(
        `/tools/${toolName}`,
        {
          arguments: params,
          context: context || {},
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `MCP 服务调用失败: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * 检查 MCP 服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}
```

### 类型定义

```typescript
// src/api/types.ts
export interface MCPToolRequest<T = any> {
  arguments: T;
  context?: Record<string, any>;
}

export interface MCPToolResponse<T = any> {
  result?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface MCPContext {
  accountId?: string;
  merchantId?: string;
  authToken?: string;
}
```

## 配置管理

### 配置结构

```typescript
// src/config.ts
export interface GoogleAdsConfig {
  // MCP 服务配置
  mcpServerUrl: string;      // 默认: http://localhost:8240
  mcpServerPort: number;     // 默认: 8240

  // 默认账号配置
  defaultAccountId?: string; // 默认 Google Ads 账号 ID
  defaultMerchantId?: string; // 默认商户 ID

  // 输出配置
  outputFormat: 'table' | 'json'; // 默认: table
  colorOutput: boolean;      // 默认: true

  // 认证配置（如需要）
  authToken?: string;
}

// 配置文件位置：~/.config/google-ads-cli/config.json
```

### 配置初始化命令

```bash
# 初始化配置
google-ads init \
  --mcp-url http://localhost:8240 \
  --account-id 1234567890

# 查看当前配置
google-ads config show

# 更新配置
google-ads config set mcp-url http://production.example.com:8240
```

## 输出格式化

### 表格输出示例

```typescript
// src/utils/formatter.ts
import Table from 'cli-table3';
import chalk from 'chalk';

export function formatCampaignTable(campaigns: Campaign[]): string {
  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('名称'),
      chalk.cyan('状态'),
      chalk.cyan('预算'),
      chalk.cyan('展示次数'),
      chalk.cyan('点击次数'),
      chalk.cyan('费用'),
    ],
    colWidths: [15, 30, 10, 10, 12, 10, 10],
  });

  campaigns.forEach(campaign => {
    table.push([
      campaign.id,
      campaign.name,
      formatStatus(campaign.status),
      `$${campaign.budget}`,
      campaign.impressions.toLocaleString(),
      campaign.clicks.toLocaleString(),
      `$${campaign.cost.toFixed(2)}`,
    ]);
  });

  return table.toString();
}

function formatStatus(status: string): string {
  switch (status) {
    case 'ENABLED':
      return chalk.green('启用');
    case 'PAUSED':
      return chalk.yellow('暂停');
    case 'REMOVED':
      return chalk.red('删除');
    default:
      return status;
  }
}
```

### JSON 输出

```bash
# 所有命令支持 --json 参数
google-ads campaign list --json

# 输出格式
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "春季促销",
      "status": "ENABLED",
      "budget": 100,
      "impressions": 50000,
      "clicks": 1250,
      "cost": 87.50
    }
  ]
}
```

## AI CLI 集成

### .claude/CLAUDE.md 文档

```markdown
## Google Ads CLI

Google Ads 广告投放管理工具 - 支持广告系列、关键词、文案和效果分析。

**版本**: v0.1.0 | **安装**: `npm install -g @optima-chat/google-ads-cli@latest`

### 可用命令

**账号** (`google-ads account`)
- `list` - 账号列表
- `status <id>` - 账号状态
- `billing <id>` - 账单信息
- `invite <id>` - 邀请用户

**广告系列** (`google-ads campaign`)
- `create` - 创建广告系列
- `list` - 系列列表
- `update <id>` - 更新系列
- `pause <id>` - 暂停系列
- `resume <id>` - 恢复系列
- `delete <id>` - 删除系列

**广告组** (`google-ads ad-group`)
- `create <campaign-id>` - 创建广告组
- `list <campaign-id>` - 广告组列表
- `update <id>` - 更新广告组
- `delete <id>` - 删除广告组

**关键词** (`google-ads keyword`)
- `add <ad-group-id>` - 添加关键词
- `research` - 关键词研究
- `list <ad-group-id>` - 关键词列表
- `update <id>` - 更新关键词
- `delete <id>` - 删除关键词

**广告文案** (`google-ads ad-copy`)
- `create <ad-group-id>` - 创建广告
- `list <ad-group-id>` - 广告列表
- `update <id>` - 更新广告
- `delete <id>` - 删除广告

**效果分析** (`google-ads performance`)
- `report` - 生成报告
- `analyze` - 综合分析

**提示**:
- 使用 `google-ads <命令> --help` 查看详细用法
- 使用 `--json` 参数获取 JSON 格式输出
- 首次使用需要运行 `google-ads init` 配置 MCP 服务地址
```

## 开发步骤

### Phase 1: 基础设施 (第1-2周)

1. **项目初始化**
   - 创建 package.json，配置 TypeScript
   - 设置构建脚本和开发环境
   - 配置 ESLint、Prettier

2. **核心服务实现**
   - MCP Client (HTTP/SSE 通信)
   - Config Manager (配置读写)
   - Output Formatter (表格、JSON)
   - Logger (日志记录)

3. **基础命令**
   - `google-ads init` (初始化配置)
   - `google-ads config` (配置管理)
   - `google-ads version` (版本信息)

### Phase 2: 核心功能 (第3-6周)

4. **账号管理命令**
   - account list/status/billing/invite

5. **广告系列命令**
   - campaign create/list/update/pause/resume/delete

6. **广告组命令**
   - ad-group create/list/update/delete

7. **关键词命令**
   - keyword add/list/update/delete/research

8. **广告文案命令**
   - ad-copy create/list/update/delete

9. **效果分析命令**
   - performance report/analyze

### Phase 3: 优化和发布 (第7-8周)

10. **AI 集成**
    - 编写 .claude/CLAUDE.md
    - 测试 AI CLI 调用
    - 优化命令提示词

11. **测试和文档**
    - 单元测试
    - 集成测试
    - API 文档
    - 使用示例

12. **打包发布**
    - npm publish
    - GitHub Release
    - 使用文档

## 与 optima-cli 的对比

| 特性 | optima-cli | google-ads-cli |
|------|-----------|----------------|
| 后端协议 | REST API | MCP (SSE) |
| 认证方式 | JWT Token | OAuth2 (通过 MCP) |
| 数据存储 | 云端数据库 | Google Ads |
| 业务领域 | 电商管理 | 广告投放 |
| 命令数量 | 72 个 | ~35 个（预估）|
| 依赖项 | 7 个核心库 | 7 个核心库（相同） |
| 输出格式 | Table/JSON | Table/JSON（相同） |

## 技术挑战与解决方案

### 1. MCP 协议通信

**挑战**: google-ads-mcp 使用 SSE 协议，与传统 REST API 不同

**解决方案**:
- 使用 axios 发送 HTTP POST 请求到 MCP 服务
- MCP 服务端已支持 HTTP 接口调用工具
- 封装统一的 MCPClient 类处理所有通信

### 2. 认证管理

**挑战**: Google Ads OAuth2 认证流程复杂

**解决方案**:
- 认证逻辑完全由 MCP Server 处理
- CLI 只需配置 MCP 服务地址
- 可选：传递 merchant context 用于多租户

### 3. 复杂参数传递

**挑战**: 某些命令（如创建广告系列）参数众多

**解决方案**:
- 使用 inquirer 提供交互式输入
- 支持配置文件批量操作
- 提供合理的默认值

### 4. 错误处理

**挑战**: MCP 和 Google Ads API 的双层错误

**解决方案**:
- 统一错误格式化
- 提供清晰的错误信息和建议
- 支持 --verbose 模式查看详细日志

## 预期成果

1. **功能完整的 CLI 工具**
   - 覆盖 google-ads-mcp 所有 MCP 工具
   - ~35 个命令，6 个模块
   - 支持交互式和脚本化使用

2. **AI 友好的设计**
   - 完整的 .claude/CLAUDE.md 文档
   - 可被 AI CLI 自然语言调用
   - 清晰的命令结构和参数

3. **良好的开发者体验**
   - 美观的终端输出
   - 清晰的错误提示
   - 完善的帮助文档
   - TypeScript 类型支持

4. **可扩展的架构**
   - 模块化命令结构
   - 易于添加新功能
   - 可复用的工具函数

## 下一步行动

1. 初始化项目结构和配置
2. 实现 MCP Client 和配置管理
3. 开发第一个命令模块（account）
4. 测试 MCP 通信是否正常
5. 逐步完成其他模块
