# GAQL CLI 项目分析与借鉴

## 项目概述

**项目**: [gaql-cli](https://github.com/getyourguide/gaql-cli)
**语言**: Python
**Star**: 26
**版本**: v1.14.0
**定位**: Google Ads Query Language (GAQL) 查询工具

## 核心特性

### 1. 简洁的 CLI 设计

```bash
# REPL 交互模式
gaql 1-000-000-000

# 单次查询模式
gaql 1-000-000-000 'SELECT campaign.id FROM campaign'

# 输出到文件（自动推断格式）
gaql -o campaigns.jsonl 1-000-000-000 'SELECT campaign.id FROM campaign'
```

**可借鉴**:
- ✅ 支持 REPL 交互模式和单次命令模式
- ✅ 根据输出文件扩展名自动推断格式
- ✅ 简洁的命令行参数设计

### 2. 多格式输出支持

支持的输出格式：
- `csv` - CSV 格式
- `json` - JSON 格式（美化）
- `jsonl` - JSON Lines 格式（流式）
- `proto` - Protobuf 格式（原始）

**实现亮点**:
```python
# gaql/lib/output.py
def write_rows(rows, state):
    if state.format == 'json':
        write_json(state.output, rows)
    elif state.format == 'jsonl':
        write_json_lines(state.output, rows)
    elif state.format == 'csv':
        write_csv(state.output, rows)
    else:
        write_proto(state.output, rows)
```

**可借鉴**:
- ✅ 支持多种输出格式（我们已计划 table/json）
- ✅ 可扩展到 csv/jsonl
- ✅ 统一的输出接口设计

### 3. 认证管理的优先级链

```python
# gaql/lib/google_clients/config.py
def load_credentials():
    """优先级: 环境变量 > Google yaml > 自定义 JSON 文件"""
    try:
        return config.load_from_env()
    except:
        try:
            return config.load_from_yaml_file()  # ~/google-ads.yaml
        except:
            return read_credentials_from_file()  # ~/.config/gaql/credentials.json
```

**配置文件位置**: `~/.config/gaql/`
- `credentials.json` - 认证凭据
- `history` - REPL 历史记录
- `settings.toml` - 配置设置

**可借鉴**:
- ✅ 多层级认证配置（环境变量 > 配置文件）
- ✅ 配置存储在标准位置 `~/.config/`
- ⚠️ 我们的情况：认证由 MCP Server 处理，CLI 只需配置 MCP 地址

### 4. REPL 交互模式

使用 `prompt_toolkit` 实现：
- **多行输入**: 支持按 Enter 换行，`;` 结束
- **历史记录**: 持久化命令历史
- **语法高亮**: GAQL 语法高亮显示
- **自动补全**: 基于 Google Ads 字段的智能补全

```python
# gaql/lib/repl.py
_SESSION = PromptSession(
    multiline=True,
    key_bindings=bindings,
    lexer=lexer,
    history=FileHistory(HISTORY_FILE),
    completer=GoogleCompleter(),  # 智能补全
)
```

**可借鉴**:
- ⭐ **REPL 模式非常适合我们的场景**
- ✅ 多行输入支持复杂命令
- ✅ 历史记录提升用户体验
- ✅ 语法高亮提升可读性
- 🤔 自动补全（可选实现，成本较高）

### 5. 智能查询处理

```python
def parse_query(query, unlimited=False):
    base_query = query.replace(';', '')
    # 自动添加 LIMIT 100（如果用户未指定）
    if unlimited or 'limit' in base_query.lower():
        return base_query
    else:
        return base_query + ' LIMIT ' + DEFAULT_LIMIT
```

**可借鉴**:
- ✅ 自动添加合理的默认值
- ✅ 保护性限制（防止返回过多数据）

### 6. 辅助工具命令

```bash
gaql-tools queries clients  # 列出 MCC 下的所有客户
```

**可借鉴**:
- ✅ 分离核心命令和辅助工具
- ✅ 我们可以有 `google-ads` (主命令) 和 `google-ads-tools` (辅助工具)

## 架构对比

| 特性 | gaql-cli | google-ads-cli (我们的方案) |
|------|----------|----------------------------|
| **语言** | Python | TypeScript/Node.js |
| **CLI 框架** | Click | Commander.js |
| **主要功能** | 执行 GAQL 查询 | 完整广告管理（系列/组/关键词/文案） |
| **认证方式** | 直接 OAuth2 | 通过 MCP Server |
| **后端依赖** | Google Ads API | google-ads-mcp (MCP Server) |
| **输出格式** | CSV/JSON/JSONL/Proto | Table/JSON (可扩展) |
| **交互模式** | REPL | 计划支持 |
| **自动补全** | 支持 | 可选 |
| **目标用户** | 数据分析师/开发者 | AI + 营销人员 |

## 关键差异

### 1. 功能范围

**gaql-cli**:
- 专注于 **查询** Google Ads 数据
- 只读操作
- 数据分析导向

**google-ads-cli** (我们):
- **完整的广告管理** CRUD 操作
- 创建/更新/删除广告系列、关键词、文案等
- 营销管理导向

### 2. 架构模式

**gaql-cli**:
```
CLI → Google Ads API (直接)
```

**google-ads-cli**:
```
CLI → MCP Server → Google Ads API
```

### 3. AI 集成

**gaql-cli**:
- 无 AI 集成
- 手动编写 GAQL 查询

**google-ads-cli**:
- 设计为 AI 可调用
- 自然语言 → Shell 命令
- .claude/CLAUDE.md 文档供 AI 理解

## 可借鉴的设计模式

### 1. REPL 模式 ⭐⭐⭐⭐⭐

**强烈推荐实现**，因为：
- 广告管理是连续的工作流（创建系列 → 添加关键词 → 写文案 → 查看效果）
- 避免每次输入 `google-ads` 前缀
- 保留历史记录，方便重复操作

**实现建议**:
```bash
# 进入交互模式
google-ads shell

# 在交互模式下
> campaign create --product-id 123 --budget 100
> keyword add <ad-group-id> --keywords "手机壳"
> performance report --campaign-id 123
```

使用 `inquirer` 或 `prompt-toolkit` (Node.js port) 实现。

### 2. 配置管理优先级链 ⭐⭐⭐⭐

```typescript
// 配置加载优先级
export function loadConfig(): GoogleAdsConfig {
  // 1. 环境变量优先
  if (process.env.GOOGLE_ADS_MCP_URL) {
    return loadFromEnv();
  }

  // 2. 配置文件
  if (configFileExists()) {
    return loadFromFile();
  }

  // 3. 引导用户初始化
  return promptForInit();
}
```

### 3. 多格式输出 ⭐⭐⭐⭐

```typescript
// src/utils/formatter.ts
export function outputResults(data: any, format: OutputFormat, output?: string) {
  const writer = getWriter(format);
  const stream = output ? createWriteStream(output) : process.stdout;
  writer(stream, data);
}
```

支持:
- `--json` - JSON 输出
- `--csv` - CSV 输出
- `--table` - 表格输出（默认）
- `-o file.json` - 自动推断格式

### 4. 自动添加保护性参数 ⭐⭐⭐

```typescript
// 自动添加分页限制
export function normalizeCampaignListParams(params: any) {
  return {
    ...params,
    limit: params.limit || 100,  // 默认限制 100
  };
}
```

### 5. 辅助工具命令 ⭐⭐⭐

可以创建 `google-ads-tools` 提供：
- 批量操作脚本
- 数据导入/导出
- 配置验证
- 健康检查

## 不适用的部分

### 1. 直接 Google Ads API 调用

**gaql-cli** 直接使用 `google-ads` Python SDK。

**我们的情况**: 通过 MCP Server 中转，不直接调用 Google Ads API。

### 2. GAQL 查询解析

**gaql-cli** 需要解析 GAQL 语法、提供自动补全。

**我们的情况**: 使用结构化命令，无需查询语言解析。

### 3. Protobuf 输出

**gaql-cli** 支持原始 Protobuf 格式。

**我们的情况**: JSON/Table 足够，无需 Protobuf。

## 具体实施建议

### Phase 1: 基础 CLI（参考 gaql-cli）

1. **配置管理**
   ```typescript
   // 参考 gaql-cli 的配置优先级
   // 环境变量 > 配置文件 > 交互提示
   ```

2. **输出格式**
   ```typescript
   // 实现 table/json/csv 三种格式
   // 支持 -o 输出到文件
   ```

3. **错误处理**
   ```typescript
   // 参考 handle_google_ads_error 的友好错误提示
   ```

### Phase 2: REPL 模式（新增）

```bash
google-ads shell [--account-id 123]

# 进入交互模式
> campaign list
> campaign create --product-id 456 --budget 200
> exit
```

**技术栈**:
- `inquirer` 或 `@inquirer/prompts` (交互输入)
- `node-persist` (历史记录)
- `chalk` (语法高亮)

### Phase 3: 高级特性（可选）

1. **命令别名**
   ```bash
   google-ads c list  # campaign list
   google-ads k add   # keyword add
   ```

2. **批量操作**
   ```bash
   google-ads campaign create --batch campaigns.json
   ```

3. **配置预设**
   ```bash
   google-ads config preset create production --mcp-url https://prod.example.com
   google-ads config preset use production
   ```

## 推荐的项目结构调整

基于 gaql-cli 的启发，建议的结构：

```
google-ads-cli/
├── src/
│   ├── index.ts                 # 主命令入口
│   ├── shell.ts                 # REPL 模式 (新增)
│   ├── commands/                # 命令模块
│   ├── lib/                     # 核心库 (参考 gaql-cli)
│   │   ├── config.ts           # 配置加载（优先级链）
│   │   ├── output.ts           # 输出格式化
│   │   ├── repl.ts             # REPL 实现
│   │   └── errors.ts           # 错误处理
│   ├── api/                     # API 客户端
│   └── utils/                   # 工具函数
└── bin/
    ├── google-ads               # 主命令
    └── google-ads-tools         # 辅助工具 (可选)
```

## 最终评估

### 高价值借鉴 ⭐⭐⭐⭐⭐

1. **REPL 交互模式** - 极大提升用户体验
2. **配置优先级链** - 灵活的配置管理
3. **多格式输出** - 满足不同场景需求
4. **友好的错误处理** - Google Ads API 错误友好化

### 中等价值借鉴 ⭐⭐⭐

1. **辅助工具命令** - 分离核心功能和辅助功能
2. **自动保护参数** - 防止用户错误
3. **历史记录持久化** - 提升命令行体验

### 不适用 ❌

1. **GAQL 查询解析** - 我们使用结构化命令
2. **直接 API 调用** - 我们通过 MCP Server
3. **Protobuf 输出** - 无此需求

## 行动计划

### 立即实施 (Week 1-2)

- [ ] 实现配置优先级链（ENV > File > Prompt）
- [ ] 支持多格式输出（table/json/csv）
- [ ] 实现错误友好化处理

### 短期实施 (Week 3-4)

- [ ] 实现 REPL 交互模式
- [ ] 支持命令历史记录
- [ ] 添加输出文件支持

### 长期规划 (Week 5+)

- [ ] 命令别名
- [ ] 批量操作
- [ ] 配置预设
- [ ] google-ads-tools 辅助命令

## 总结

gaql-cli 是一个**高质量的参考项目**，虽然功能定位不同（查询 vs 管理），但其：

1. **CLI 设计理念** 非常值得学习
2. **REPL 模式** 特别适合我们的场景
3. **配置管理** 和 **输出格式化** 可以直接借鉴
4. **代码组织** 清晰，值得参考

建议将 **REPL 模式** 作为重点特性实现，这将是我们相对于纯命令行工具的重要差异化优势。
