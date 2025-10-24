# Google Ads CLI - 最终技术方案

> 基于 google-ads-mcp 的命令行工具，专为 LLM（Claude Code）调用设计

**版本**: v1.0
**日期**: 2025-10-24
**状态**: Ready for Implementation

## 核心定位

### 设计目标

1. **LLM 友好** - 简洁命令，结构化输出，易于 AI 理解和调用
2. **双模式设计** - 结构化命令（80% 场景）+ GAQL 查询（20% 高级场景）
3. **即时返回** - 每个命令独立执行，立即返回结果（无交互式 REPL）
4. **多格式输出** - 支持 table/json/csv，满足 AI 和人类不同需求

### 目标用户

| 用户类型 | 使用方式 | 需求 |
|---------|---------|------|
| **AI (主要)** | 通过 ShellTool 调用 | JSON 输出、清晰错误、结构化命令 |
| **开发者** | 直接命令行 | Table 输出、友好提示、批量操作 |
| **数据分析师** | GAQL 查询 | CSV 导出、复杂查询、灵活过滤 |

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                         用户交互层                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Claude Code (LLM)              开发者 (Human)               │
│  ↓ ShellTool                    ↓ Terminal                   │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 命令调用（独立进程）
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    google-ads-cli (本项目)                    │
│                    TypeScript + Commander.js                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🎯 双模式设计                                                │
│  ├─ 结构化命令模式 (80%)                                      │
│  │   • google-ads campaign list                             │
│  │   • google-ads keyword add <id> --keywords "..."         │
│  │   • LLM 易理解，参数明确                                  │
│  │                                                            │
│  └─ GAQL 查询模式 (20%)                                       │
│      • google-ads query "SELECT ... FROM ... WHERE ..."      │
│      • 灵活强大，适合复杂分析                                 │
│                                                               │
│  📦 命令模块                                                  │
│  ├── account (账号管理)                                       │
│  ├── campaign (广告系列)                                      │
│  ├── ad-group (广告组)                                        │
│  ├── keyword (关键词)                                         │
│  ├── ad-copy (广告文案)                                       │
│  ├── performance (效果分析)                                   │
│  └── query (GAQL 查询)        ← 新增                         │
│                                                               │
│  🔧 核心服务                                                  │
│  ├── MCP Client (HTTP/SSE 通信)                              │
│  ├── Config Manager (环境变量 > 文件 > 提示)                 │
│  ├── Output Formatter (table/json/csv)                       │
│  └── Error Handler (友好的错误信息)                          │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ HTTP/SSE (MCP Protocol)
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                 google-ads-mcp (已有 + 新增)                  │
│                 Python + FastMCP                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔌 现有 MCP Tools                                           │
│  ├── manage_account                                          │
│  ├── manage_campaigns                                        │
│  ├── manage_ad_groups                                        │
│  ├── manage_keywords                                         │
│  ├── manage_ad_copy                                          │
│  └── manage_performance                                      │
│                                                               │
│  🆕 新增 MCP Tool                                            │
│  └── execute_gaql         ← 需要实现                         │
│      • 接受 GAQL 查询字符串                                   │
│      • 返回结构化结果                                         │
│      • 支持多格式输出                                         │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Google Ads API
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                      Google Ads API                          │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈选型

### CLI 层（本项目）

| 组件 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **语言** | TypeScript | 5.0+ | 类型安全，与 optima-cli 一致 |
| **CLI 框架** | commander | 12.0+ | 成熟稳定，命令解析 |
| **HTTP 客户端** | axios | 1.6+ | MCP 通信 |
| **输出格式化** | chalk + cli-table3 | 最新 | 终端美化 |
| **交互提示** | inquirer | 9.0+ | 可选参数输入 |
| **配置存储** | conf | 12.0+ | 配置持久化 |
| **加载动画** | ora | 8.0+ | 命令执行提示 |
| **开发工具** | tsx | 4.0+ | 开发调试 |

### MCP 层（需要扩展）

| 组件 | 说明 |
|------|------|
| **现有** | 6 个 MCP tools（manage_*） |
| **新增** | `execute_gaql` tool |

## 项目结构

```
google-ads-cli/
├── package.json              # npm 包配置
├── tsconfig.json            # TypeScript 配置
├── .gitignore               # Git 忽略文件
├── README.md                # 项目说明
├── LICENSE                  # MIT 许可证
│
├── .claude/                 # Claude Code 集成
│   └── CLAUDE.md           # AI 命令文档（关键！）
│
├── docs/                    # 技术文档
│   ├── final-technical-design.md      # 本文档
│   ├── gaql-cli-analysis.md          # gaql-cli 分析
│   ├── command-reference.md          # 命令参考
│   └── gaql-examples.md              # GAQL 示例
│
├── src/
│   ├── index.ts            # CLI 入口，注册所有命令
│   ├── config.ts           # 全局配置类型定义
│   │
│   ├── commands/           # 命令模块（结构化）
│   │   ├── init.ts        # 初始化配置
│   │   ├── config.ts      # 配置管理命令
│   │   │
│   │   ├── account/       # 账号管理
│   │   │   ├── index.ts
│   │   │   ├── list.ts
│   │   │   ├── status.ts
│   │   │   └── billing.ts
│   │   │
│   │   ├── campaign/      # 广告系列
│   │   │   ├── index.ts
│   │   │   ├── create.ts
│   │   │   ├── list.ts
│   │   │   ├── get.ts
│   │   │   ├── update.ts
│   │   │   ├── pause.ts
│   │   │   ├── resume.ts
│   │   │   └── delete.ts
│   │   │
│   │   ├── ad-group/      # 广告组
│   │   │   ├── index.ts
│   │   │   ├── create.ts
│   │   │   ├── list.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   │
│   │   ├── keyword/       # 关键词管理
│   │   │   ├── index.ts
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   ├── update.ts
│   │   │   ├── delete.ts
│   │   │   └── research.ts  # AI 关键词研究
│   │   │
│   │   ├── ad-copy/       # 广告文案
│   │   │   ├── index.ts
│   │   │   ├── create.ts
│   │   │   ├── list.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   │
│   │   ├── performance/   # 效果分析
│   │   │   ├── index.ts
│   │   │   ├── report.ts
│   │   │   └── analyze.ts
│   │   │
│   │   └── query/         # GAQL 查询（新增）
│   │       └── index.ts
│   │
│   ├── api/               # API 客户端
│   │   ├── mcp-client.ts  # MCP 协议客户端
│   │   ├── types.ts       # 类型定义
│   │   └── errors.ts      # 错误类型
│   │
│   └── utils/             # 工具函数
│       ├── config.ts      # 配置加载（优先级链）
│       ├── formatter.ts   # 输出格式化
│       ├── logger.ts      # 日志工具
│       ├── validator.ts   # 参数验证
│       └── suggestions.ts # 智能建议
│
└── dist/                  # 编译输出（gitignore）
    └── index.js
```

## 双模式设计详解

### 模式 1: 结构化命令（主要，80% 场景）

#### 设计原则

1. **命令格式**: `google-ads <resource> <action> [options]`
2. **资源名词**: campaign, keyword, ad-copy 等
3. **动作动词**: create, list, get, update, delete, pause, resume
4. **选项参数**: 使用 `--key value` 格式

#### 命令示例

```bash
# 账号管理
google-ads account list
google-ads account status <account-id>
google-ads account billing <account-id>

# 广告系列
google-ads campaign create --product-id 123 --budget 100 --name "春季促销"
google-ads campaign list --status ENABLED
google-ads campaign get <campaign-id>
google-ads campaign update <campaign-id> --budget 200
google-ads campaign pause <campaign-id>
google-ads campaign resume <campaign-id>
google-ads campaign delete <campaign-id> --yes

# 关键词
google-ads keyword add <ad-group-id> --keywords "手机壳,iPhone保护壳" --match-type EXACT
google-ads keyword list <ad-group-id>
google-ads keyword research --product-id 123 --language zh-CN --country CN
google-ads keyword update <keyword-id> --cpc 1.5
google-ads keyword delete <keyword-id> --yes

# 广告文案
google-ads ad-copy create <ad-group-id> \
  --headlines "优质手机壳,iPhone专用,限时特惠" \
  --descriptions "高品质材料,完美贴合,立即购买" \
  --final-url "https://example.com/product/123"

# 效果分析
google-ads performance report --campaign-id 123 --start-date 2025-01-01 --end-date 2025-01-31
google-ads performance analyze --level campaign --period last-30-days
```

#### LLM 调用示例

```typescript
// Claude Code 理解用户意图后生成命令
用户: "创建一个每天预算 100 美元的广告系列推广商品 123"
AI 生成: google-ads campaign create --product-id 123 --budget 100

用户: "给这个系列添加关键词：手机壳、保护壳"
AI 生成: google-ads keyword add <ad-group-id> --keywords "手机壳,保护壳"

用户: "看看最近 7 天的效果"
AI 生成: google-ads performance report --campaign-id <id> --period last-7-days
```

### 模式 2: GAQL 查询（高级，20% 场景）

#### 设计原则

1. **命令格式**: `google-ads query <gaql-string> [options]`
2. **灵活性**: 支持任意 GAQL 语法
3. **输出格式**: 默认 table，支持 json/csv/jsonl
4. **文件输出**: 支持 `-o file.csv` 自动推断格式

#### GAQL 查询示例

```bash
# 基础查询
google-ads query "SELECT campaign.id, campaign.name FROM campaign"

# 带过滤
google-ads query "
  SELECT campaign.id, campaign.name, campaign.status
  FROM campaign
  WHERE campaign.status = 'ENABLED'
"

# 带指标
google-ads query "
  SELECT
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.ctr,
    metrics.cost_micros
  FROM campaign
  WHERE segments.date DURING LAST_7_DAYS
  ORDER BY metrics.clicks DESC
  LIMIT 10
"

# 关键词分析
google-ads query "
  SELECT
    ad_group_criterion.keyword.text,
    ad_group_criterion.keyword.match_type,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions
  FROM keyword_view
  WHERE campaign.id = 123
    AND metrics.impressions > 100
  ORDER BY metrics.conversions DESC
" --format csv -o keywords-report.csv

# 搜索词报告（找到用户真实搜索）
google-ads query "
  SELECT
    search_term_view.search_term,
    metrics.impressions,
    metrics.clicks,
    metrics.ctr
  FROM search_term_view
  WHERE segments.date DURING LAST_30_DAYS
    AND metrics.impressions > 10
  ORDER BY metrics.impressions DESC
" -o search-terms.csv

# 跨日期聚合
google-ads query "
  SELECT
    segments.date,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros
  FROM campaign
  WHERE segments.date BETWEEN '2025-01-01' AND '2025-01-31'
  ORDER BY segments.date
" --format jsonl
```

#### 何时使用 GAQL

| 场景 | 使用 GAQL | 原因 |
|------|----------|------|
| **创建/更新操作** | ❌ 用结构化命令 | 简单明确 |
| **简单列表查询** | ❌ 用结构化命令 | 更快捷 |
| **复杂过滤** | ✅ 用 GAQL | 灵活 |
| **多表关联** | ✅ 用 GAQL | GAQL 独有 |
| **数据导出** | ✅ 用 GAQL | 格式化好 |
| **自定义字段** | ✅ 用 GAQL | 精确控制 |
| **聚合分析** | ✅ 用 GAQL | SQL 语法强大 |

## 输出格式设计

### 多格式支持

| 格式 | 用途 | 触发方式 |
|------|------|---------|
| **table** | 人类查看（默认） | 无参数 / `--table` |
| **json** | LLM 解析 | `--json` |
| **csv** | Excel 导入 | `--csv` / `-o file.csv` |
| **jsonl** | 流式处理 | `--format jsonl` |

### 示例输出

#### Table 格式（默认）

```bash
$ google-ads campaign list

┌────────────┬─────────────┬────────┬──────────┬────────────┬──────────┬────────────┐
│ ID         │ 名称        │ 状态   │ 预算     │ 展示次数   │ 点击次数 │ 费用       │
├────────────┼─────────────┼────────┼──────────┼────────────┼──────────┼────────────┤
│ camp_123   │ 春季促销    │ 启用   │ $100     │ 50,000     │ 1,250    │ $87.50     │
│ camp_456   │ 夏季新品    │ 暂停   │ $150     │ 35,000     │ 890      │ $65.20     │
└────────────┴─────────────┴────────┴──────────┴────────────┴──────────┴────────────┘

✓ 共 2 个广告系列
```

#### JSON 格式（LLM 使用）

```bash
$ google-ads campaign list --json

{
  "success": true,
  "data": [
    {
      "id": "camp_123",
      "name": "春季促销",
      "status": "ENABLED",
      "budget": 100,
      "metrics": {
        "impressions": 50000,
        "clicks": 1250,
        "cost": 87.50,
        "ctr": 2.5,
        "conversions": 45
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### CSV 格式（数据分析）

```bash
$ google-ads campaign list --csv -o campaigns.csv

id,name,status,budget,impressions,clicks,cost
camp_123,春季促销,ENABLED,100,50000,1250,87.50
camp_456,夏季新品,PAUSED,150,35000,890,65.20
```

### 智能输出推断

```typescript
// 根据 -o 参数自动推断格式
google-ads campaign list -o report.csv   // 自动使用 CSV
google-ads campaign list -o data.json    // 自动使用 JSON
google-ads campaign list -o logs.jsonl   // 自动使用 JSON Lines
```

## 配置管理设计

### 配置优先级链

```typescript
export function loadConfig(): GoogleAdsConfig {
  // 1. 环境变量（最高优先级，适合 CI/CD）
  if (process.env.GOOGLE_ADS_MCP_URL) {
    return {
      mcpUrl: process.env.GOOGLE_ADS_MCP_URL,
      mcpPort: parseInt(process.env.GOOGLE_ADS_MCP_PORT || '8240'),
      defaultAccountId: process.env.GOOGLE_ADS_ACCOUNT_ID,
    };
  }

  // 2. 配置文件（用户本地配置）
  const configPath = path.join(os.homedir(), '.config/google-ads-cli/config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  // 3. 引导初始化
  console.error('未找到配置，请先运行: google-ads init');
  process.exit(1);
}
```

### 配置文件结构

```json
// ~/.config/google-ads-cli/config.json
{
  "mcpUrl": "http://localhost:8240",
  "mcpPort": 8240,
  "defaultAccountId": "1234567890",
  "outputFormat": "table",
  "colorOutput": true
}
```

### 配置命令

```bash
# 初始化配置
google-ads init
# 交互式提示输入 MCP 服务地址、账号 ID 等

# 查看配置
google-ads config show

# 设置单个配置项
google-ads config set mcp-url http://production:8240
google-ads config set default-account 9876543210

# 重置配置
google-ads config reset
```

## 错误处理设计

### 友好的错误信息

#### 示例 1: MCP 服务不可达

```bash
$ google-ads campaign list

✗ 无法连接到 MCP 服务
  地址: http://localhost:8240

建议:
  1. 检查 MCP 服务是否运行: curl http://localhost:8240/health
  2. 验证配置: google-ads config show
  3. 更新配置: google-ads config set mcp-url <正确地址>
```

#### 示例 2: 参数错误

```bash
$ google-ads campaign create --budget -100

✗ 参数错误: budget 必须大于 0
  当前值: -100

建议: google-ads campaign create --product-id 123 --budget 100
```

#### 示例 3: 资源不存在

```bash
$ google-ads campaign get camp_999

✗ 广告系列不存在
  Campaign ID: camp_999

建议:
  1. 查看所有系列: google-ads campaign list
  2. 检查 ID 是否正确
```

#### 示例 4: Google Ads API 错误

```bash
$ google-ads campaign create --product-id 123 --budget 0.5

✗ Google Ads API 错误
  Request ID: abc123xyz
  错误代码: BUDGET_AMOUNT_TOO_LOW

详细信息:
  • 每日预算至少为 $1.00
  • 当前值: $0.50

建议: 设置更高的预算，如 --budget 10
```

### JSON 格式错误（给 LLM）

```json
{
  "success": false,
  "error": {
    "code": "BUDGET_AMOUNT_TOO_LOW",
    "message": "每日预算至少为 $1.00",
    "details": {
      "field": "budget",
      "currentValue": 0.5,
      "minValue": 1.0
    },
    "suggestions": [
      "使用 --budget 10 设置更高的预算"
    ]
  }
}
```

## 智能建议功能

### 命令完成后的建议

```bash
$ google-ads campaign create --product-id 123 --budget 100

✓ 广告系列创建成功
  Campaign ID: camp_789
  状态: PAUSED (暂停中)
  预算: $100/天

⚠️  注意: 系列创建后默认为暂停状态

下一步建议:
  1. 添加关键词:
     google-ads keyword add <ad-group-id> --keywords "手机壳,保护壳"

  2. 创建广告文案:
     google-ads ad-copy create <ad-group-id> --headlines "..." --descriptions "..."

  3. 启用广告系列:
     google-ads campaign resume camp_789
```

### 健康检查建议

```bash
$ google-ads campaign analyze camp_789

📊 广告系列健康检查

✗ 关键问题:
  • 没有关键词 - 广告无法展示
  • 缺少广告文案 - 至少需要 1 个广告

⚠️  警告:
  • 预算较低 ($50/天) - 建议提高到 $150+ 以获得更多展示
  • 只有 1 个广告组 - 考虑按产品类型分组

✓ 正常:
  • 地理位置定位: CN, HK
  • 语言设置: zh-CN

建议操作:
  1. google-ads keyword add <ad-group-id> --keywords "..."
  2. google-ads ad-copy create <ad-group-id> ...
  3. google-ads campaign update camp_789 --budget 150
```

## MCP 通信实现

### MCP Client 核心类

```typescript
// src/api/mcp-client.ts
import axios, { AxiosInstance } from 'axios';
import { MCPToolRequest, MCPToolResponse, MCPContext } from './types.js';

export class MCPClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config?: { url?: string; port?: number }) {
    const url = config?.url || process.env.GOOGLE_ADS_MCP_URL || 'http://localhost';
    const port = config?.port || parseInt(process.env.GOOGLE_ADS_MCP_PORT || '8240');

    this.baseUrl = `${url}:${port}`;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000, // 60s 超时
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
    context?: MCPContext
  ): Promise<T> {
    try {
      const response = await this.client.post<MCPToolResponse<T>>(
        `/tools/${toolName}`,
        {
          arguments: params,
          context: context || {},
        }
      );

      // MCP 返回的是字符串结果，需要解析
      if (typeof response.data === 'string') {
        try {
          return JSON.parse(response.data);
        } catch {
          return response.data as any;
        }
      }

      if (response.data.error) {
        throw new MCPError(
          response.data.error.code,
          response.data.error.message
        );
      }

      return response.data.result || response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error(
            `无法连接到 MCP 服务 (${this.baseUrl})\\n` +
            `请检查服务是否运行: curl ${this.baseUrl}/health`
          );
        }
        throw new Error(`MCP 服务调用失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 健康检查
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

export class MCPError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
}
```

### 类型定义

```typescript
// src/api/types.ts
export interface MCPToolRequest<T = any> {
  arguments: T;
  context?: MCPContext;
}

export interface MCPToolResponse<T = any> {
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface MCPContext {
  accountId?: string;
  merchantId?: string;
  authToken?: string;
}

// 配置类型
export interface GoogleAdsConfig {
  mcpUrl: string;
  mcpPort: number;
  defaultAccountId?: string;
  outputFormat: 'table' | 'json' | 'csv' | 'jsonl';
  colorOutput: boolean;
}
```

## 命令实现示例

### 示例 1: campaign list

```typescript
// src/commands/campaign/list.ts
import { Command } from 'commander';
import { MCPClient } from '../../api/mcp-client.js';
import { formatTable, formatJSON } from '../../utils/formatter.js';
import ora from 'ora';

export const listCommand = new Command('list')
  .description('列出广告系列')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--json', '以 JSON 格式输出')
  .option('--csv', '以 CSV 格式输出')
  .option('-o, --output <file>', '输出到文件')
  .action(async (options) => {
    const spinner = ora('正在获取广告系列列表...').start();

    try {
      const mcpClient = new MCPClient();

      // 调用 MCP manage_campaigns tool
      const result = await mcpClient.callTool('manage_campaigns', {
        action: 'list',
        // status: options.status, // 可选过滤
      });

      spinner.succeed('获取成功');

      // 解析结果
      const campaigns = parseResult(result);

      // 根据输出格式显示
      if (options.json) {
        console.log(formatJSON(campaigns));
      } else if (options.csv) {
        console.log(formatCSV(campaigns));
      } else {
        console.log(formatTable(campaigns, {
          columns: ['ID', '名称', '状态', '预算', '展示', '点击', '费用'],
        }));
      }

      // 输出到文件
      if (options.output) {
        writeToFile(options.output, campaigns);
      }

      // 智能建议
      if (campaigns.length === 0) {
        console.log('\\n提示: 还没有广告系列，使用以下命令创建:');
        console.log('  google-ads campaign create --product-id <id> --budget 100');
      }

    } catch (error) {
      spinner.fail('获取失败');
      console.error(formatError(error));
      process.exit(1);
    }
  });
```

### 示例 2: GAQL query

```typescript
// src/commands/query/index.ts
import { Command } from 'commander';
import { MCPClient } from '../../api/mcp-client.js';
import { formatTable, formatJSON, formatCSV } from '../../utils/formatter.js';
import ora from 'ora';
import fs from 'fs';
import path from 'path';

export const queryCommand = new Command('query')
  .description('执行 GAQL 查询（高级功能）')
  .argument('<query>', 'GAQL 查询语句')
  .option('-f, --format <type>', '输出格式 (table|json|csv|jsonl)', 'table')
  .option('-o, --output <file>', '输出到文件（自动推断格式）')
  .option('--customer-id <id>', '客户账号 ID')
  .action(async (query: string, options) => {
    const spinner = ora('正在执行查询...').start();

    try {
      const mcpClient = new MCPClient();

      // 调用 MCP execute_gaql tool（需要在 MCP Server 实现）
      const result = await mcpClient.callTool('execute_gaql', {
        query,
        customer_id: options.customerId,
        output_format: options.format,
      });

      spinner.succeed('查询完成');

      // 自动推断输出格式
      let format = options.format;
      if (options.output) {
        const ext = path.extname(options.output).toLowerCase();
        if (ext === '.csv') format = 'csv';
        else if (ext === '.json') format = 'json';
        else if (ext === '.jsonl') format = 'jsonl';
      }

      // 格式化输出
      let output: string;
      switch (format) {
        case 'json':
          output = formatJSON(result);
          break;
        case 'csv':
          output = formatCSV(result);
          break;
        case 'jsonl':
          output = formatJSONL(result);
          break;
        default:
          output = formatTable(result);
      }

      // 输出到文件或终端
      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(`✓ 结果已保存到: ${options.output}`);
      } else {
        console.log(output);
      }

      // 显示统计信息
      if (Array.isArray(result)) {
        console.log(`\\n✓ 共 ${result.length} 条记录`);
      }

    } catch (error) {
      spinner.fail('查询失败');
      console.error(formatError(error));
      process.exit(1);
    }
  });
```

## AI 集成文档

### .claude/CLAUDE.md

```markdown
## Google Ads CLI

Google Ads 广告投放管理工具 - 支持结构化命令和 GAQL 查询。

**版本**: v1.0.0
**安装**: `npm install -g @optima-chat/google-ads-cli@latest`

---

### 🎯 双模式设计

#### 结构化命令（80% 场景，推荐）
简单、明确、易于理解的命令，适合大多数操作。

#### GAQL 查询（20% 场景，高级）
灵活、强大的 SQL 式查询，适合复杂分析和数据导出。

---

### 📦 可用命令

#### 配置管理
- `init` - 初始化配置
- `config show` - 查看配置
- `config set <key> <value>` - 设置配置

#### 账号管理 (`account`)
- `list` - 账号列表
- `status <id>` - 账号状态
- `billing <id>` - 账单信息
- `invite <id>` - 邀请用户

#### 广告系列 (`campaign`)
- `create` - 创建广告系列
  ```bash
  google-ads campaign create --product-id 123 --budget 100 --name "春季促销"
  ```
- `list` - 系列列表
  ```bash
  google-ads campaign list --status ENABLED --json
  ```
- `get <id>` - 系列详情
- `update <id>` - 更新系列
  ```bash
  google-ads campaign update camp_123 --budget 200
  ```
- `pause <id>` - 暂停系列
- `resume <id>` - 恢复系列
- `delete <id>` - 删除系列（需要 --yes 确认）

#### 广告组 (`ad-group`)
- `create <campaign-id>` - 创建广告组
- `list <campaign-id>` - 广告组列表
- `update <id>` - 更新广告组
- `delete <id>` - 删除广告组

#### 关键词 (`keyword`)
- `add <ad-group-id>` - 添加关键词
  ```bash
  google-ads keyword add adgroup_456 --keywords "手机壳,iPhone保护壳" --match-type EXACT
  ```
- `research` - AI 关键词研究
  ```bash
  google-ads keyword research --product-id 123 --language zh-CN --country CN
  ```
- `list <ad-group-id>` - 关键词列表
- `update <id>` - 更新关键词
- `delete <id>` - 删除关键词

#### 广告文案 (`ad-copy`)
- `create <ad-group-id>` - 创建广告
  ```bash
  google-ads ad-copy create adgroup_456 \
    --headlines "优质手机壳,iPhone专用,限时特惠" \
    --descriptions "高品质材料,完美贴合" \
    --final-url "https://example.com/product/123"
  ```
- `list <ad-group-id>` - 广告列表
- `update <id>` - 更新广告
- `delete <id>` - 删除广告

#### 效果分析 (`performance`)
- `report` - 生成效果报告
  ```bash
  google-ads performance report --campaign-id 123 --period last-7-days
  ```
- `analyze` - 综合分析
  ```bash
  google-ads performance analyze --level campaign
  ```

#### GAQL 查询 (`query`)
- 执行原始 GAQL 查询
  ```bash
  google-ads query "SELECT campaign.id, campaign.name FROM campaign WHERE campaign.status = 'ENABLED'"
  ```
- 导出 CSV
  ```bash
  google-ads query "SELECT ... FROM ..." -o report.csv
  ```

---

### 💡 使用技巧

#### 1. 输出格式
```bash
google-ads campaign list              # 表格（默认）
google-ads campaign list --json       # JSON（LLM 使用）
google-ads campaign list --csv        # CSV
google-ads campaign list -o data.csv  # 保存到文件
```

#### 2. 命令链
```bash
# 创建并启用广告系列
CAMPAIGN_ID=$(google-ads campaign create --product-id 123 --budget 100 --json | jq -r '.data.id')
google-ads campaign resume $CAMPAIGN_ID
```

#### 3. 批量操作
```bash
# 暂停所有广告系列
google-ads campaign list --json | jq -r '.data[].id' | xargs -I {} google-ads campaign pause {}
```

---

### ⚠️ 注意事项

- 所有删除操作需要 `--yes` 确认
- 预算单位为美元
- 创建的广告系列默认为 PAUSED 状态
- 使用 `--json` 获取结构化输出供程序处理
- 首次使用需运行 `google-ads init` 配置 MCP 服务地址

---

### 🔗 相关链接

- GitHub: https://github.com/Optima-Chat/google-ads-cli
- 文档: https://github.com/Optima-Chat/google-ads-cli/tree/main/docs
- MCP Server: https://github.com/Optima-Chat/google-ads-mcp
```

## 开发路线图

### Phase 1: 基础设施（第1-2周）

**目标**: 建立项目框架和核心服务

- [ ] 项目初始化
  - [ ] package.json、tsconfig.json 配置
  - [ ] ESLint、Prettier 配置
  - [ ] Git hooks (husky)

- [ ] 核心服务实现
  - [ ] MCP Client (HTTP 通信)
  - [ ] Config Manager (配置加载优先级链)
  - [ ] Output Formatter (table/json/csv)
  - [ ] Error Handler (友好错误信息)
  - [ ] Logger (日志工具)

- [ ] 基础命令
  - [ ] `google-ads init` (初始化配置)
  - [ ] `google-ads config` (配置管理)
  - [ ] `google-ads version` (版本信息)
  - [ ] `google-ads --help` (帮助文档)

### Phase 2: 结构化命令（第3-6周）

**目标**: 实现核心 CRUD 命令

- [ ] 账号管理命令 (account)
  - [ ] list, status, billing, invite

- [ ] 广告系列命令 (campaign)
  - [ ] create, list, get, update, pause, resume, delete

- [ ] 广告组命令 (ad-group)
  - [ ] create, list, update, delete

- [ ] 关键词命令 (keyword)
  - [ ] add, list, update, delete, research

- [ ] 广告文案命令 (ad-copy)
  - [ ] create, list, update, delete

- [ ] 效果分析命令 (performance)
  - [ ] report, analyze

### Phase 3: GAQL 查询支持（第7-8周）

**目标**: 添加 GAQL 高级查询功能

- [ ] MCP Server 扩展
  - [ ] 实现 `execute_gaql` tool
  - [ ] 支持多格式输出
  - [ ] 错误处理和验证

- [ ] CLI 实现
  - [ ] `google-ads query` 命令
  - [ ] 格式自动推断
  - [ ] 文件输出支持
  - [ ] GAQL 语法验证

- [ ] 文档和示例
  - [ ] GAQL 语法说明
  - [ ] 常用查询示例
  - [ ] 最佳实践

### Phase 4: 增强功能（第9-10周）

**目标**: 完善用户体验和高级特性

- [ ] 智能建议
  - [ ] 命令完成后的建议
  - [ ] 健康检查和诊断
  - [ ] 错误修复建议

- [ ] 批量操作
  - [ ] 批量配置文件支持
  - [ ] 批量验证

- [ ] 性能优化
  - [ ] 结果缓存
  - [ ] 并发请求

- [ ] 测试
  - [ ] 单元测试
  - [ ] 集成测试
  - [ ] E2E 测试

### Phase 5: 发布和文档（第11-12周）

**目标**: 正式发布和完善文档

- [ ] 文档完善
  - [ ] API 参考文档
  - [ ] 使用示例
  - [ ] 故障排查指南
  - [ ] .claude/CLAUDE.md 完善

- [ ] 发布准备
  - [ ] npm package 配置
  - [ ] GitHub Release
  - [ ] Changelog

- [ ] 持续优化
  - [ ] 用户反馈收集
  - [ ] Bug 修复
  - [ ] 性能优化

## 成功指标

### 功能完整性

- ✅ 覆盖所有 MCP tools（6 个 manage_* + 1 个 execute_gaql）
- ✅ 支持 ~35 个结构化命令
- ✅ 支持 GAQL 查询
- ✅ 多格式输出（table/json/csv/jsonl）

### 用户体验

- ✅ 命令执行响应时间 < 3 秒
- ✅ 错误信息清晰友好
- ✅ 智能建议和提示
- ✅ 完善的帮助文档

### AI 友好度

- ✅ JSON 输出结构化
- ✅ 命令语义清晰
- ✅ 参数命名一致
- ✅ .claude/CLAUDE.md 完整

### 代码质量

- ✅ TypeScript 类型覆盖率 > 90%
- ✅ 单元测试覆盖率 > 80%
- ✅ 无 ESLint 错误
- ✅ 代码文档完整

## 技术风险和应对

### 风险 1: MCP 通信稳定性

**风险**: MCP Server 可能超时、崩溃或返回异常

**应对**:
- 实现重试机制（3 次重试）
- 设置合理超时（60s）
- 友好的错误提示
- 健康检查命令

### 风险 2: Google Ads API 限制

**风险**: API 速率限制、配额限制

**应对**:
- 遵循 Google Ads API 最佳实践
- 实现请求节流
- 缓存常用查询结果
- 清晰的限额错误提示

### 风险 3: GAQL 查询安全性

**风险**: 用户可能输入恶意或错误的 GAQL

**应对**:
- GAQL 语法验证
- 只读操作限制（query 命令不支持 UPDATE/DELETE）
- 查询超时限制
- 结果大小限制

### 风险 4: 配置管理复杂性

**风险**: 多环境配置可能冲突

**应对**:
- 清晰的优先级链文档
- `google-ads config show` 显示当前生效配置
- 配置验证命令
- 示例配置文件

## 参考项目对比

| 特性 | gaql-cli | optima-cli | google-ads-cli (我们) |
|------|----------|-----------|----------------------|
| **定位** | GAQL 查询 | 电商管理 | 广告管理 + GAQL |
| **语言** | Python | TypeScript | TypeScript |
| **后端** | Google Ads API | REST API | MCP Server |
| **命令数** | 2 个主命令 | 72 个 | ~40 个 |
| **REPL** | ✅ 支持 | ❌ 无 | ❌ 不适合 LLM |
| **结构化命令** | ❌ 无 | ✅ 支持 | ✅ 支持 |
| **GAQL 查询** | ✅ 核心 | ❌ 无 | ✅ 支持 |
| **LLM 集成** | ❌ 无 | ✅ 支持 | ✅ 重点 |
| **输出格式** | 4 种 | 2 种 | 4 种 |

## 总结

### 核心亮点

1. **🎯 双模式设计** - 结构化命令（简单）+ GAQL 查询（灵活）
2. **🤖 LLM 友好** - 专为 AI 调用设计，JSON 输出，清晰语义
3. **📊 多格式输出** - table/json/csv/jsonl，满足不同场景
4. **⚡ 即时返回** - 无交互式 REPL，每个命令独立执行
5. **🔧 灵活配置** - 环境变量 > 文件 > 提示，多层级优先级

### 与竞品差异

- **vs gaql-cli**: 我们有结构化命令，更易用；gaql-cli 只有查询
- **vs optima-cli**: 我们支持 GAQL 查询，更灵活；optima-cli 更专注于电商

### 技术特色

- TypeScript + Commander.js（与 optima-cli 技术栈一致）
- MCP 协议通信（与 google-ads-mcp 集成）
- 友好的错误处理（借鉴 gaql-cli）
- 智能建议功能（原创设计）

---

**Ready to Build** 🚀

下一步: 开始 Phase 1 实施
