# Google Ads CLI - Claude Code 使用指南

> 本工具专为 Claude Code 和其他 AI 设计，提供非交互式 API

## 🤖 核心功能

管理 Google Ads 账号和广告投放的命令行工具。

---

## ⚡ 快速开始（非交互式模式）

### 1. 创建账号配置

```bash
google-ads account create \
  --email <client-email> \
  --name <company-name> \
  --customer-id <customer-id> \
  --json
```

**参数**:
- `--email`: 客户的 Gmail 邮箱
- `--name`: 公司名称
- `--customer-id`: Google Ads Customer ID（10位数字）
- `--json`: JSON 格式输出（推荐 AI 使用）

**示例**:
```bash
google-ads account create \
  --email john@example.com \
  --name "Acme Corp" \
  --customer-id 1234567890 \
  --json
```

**输出**:
```json
{
  "success": true,
  "customer_id": "123-456-7890",
  "account_name": "Acme Corp",
  "currency": "USD",
  "timezone": "America/New_York",
  "email": "john@example.com"
}
```

---

## 📋 常用命令

### 账号管理

```bash
# 查看配置
google-ads config show --json

# 检查账号状态
google-ads account check --json

# 重置配置
google-ads config reset --force
```

### 广告系列管理

```bash
# 列出广告系列
google-ads campaign list --json

# 创建广告系列
google-ads campaign create \
  -n "广告系列名称" \
  -b 100 \
  --status PAUSED \
  --json

# 删除广告系列
google-ads campaign delete <campaign-id>
```

### 关键词管理

```bash
# 列出关键词
google-ads keyword list --json

# 添加关键词
google-ads keyword add <ad-group-id> \
  --keywords "关键词1,关键词2" \
  --match-type EXACT \
  --json
```

### GAQL 查询

```bash
# 执行查询
google-ads query -q "SELECT campaign.name, metrics.clicks FROM campaign" --json

# 从文件查询
google-ads query -f query.gaql --json
```

---

## 🎯 AI 使用流程

### 场景：用户要创建 Google Ads 账号

**步骤 1: 收集信息**
```
AI: 请提供以下信息：
    - Gmail 邮箱
    - 公司名称
```

**步骤 2: 引导创建账号**
```
AI: 请访问 https://ads.google.com/ 创建账号：
    1. 用你的 Gmail 登录
    2. 切换到"专家模式"
    3. 选择"创建账号而不创建广告系列"
    4. 填写公司名称和货币（USD，创建后不可修改）
    5. 记录 Customer ID（10位数字）

    详细教程：docs/客户创建账号指南.md
```

**步骤 3: 用户提供 Customer ID**
```
用户: Customer ID 是 123-456-7890
```

**步骤 4: 保存配置**
```bash
google-ads account create \
  --email user@gmail.com \
  --name "Company" \
  --customer-id 1234567890 \
  --json
```

**步骤 5: 解析结果并提示下一步**
```
AI: ✅ 配置成功！
    Customer ID: 123-456-7890

    下一步：
    1. 检查邮箱接受邀请
    2. 设置账单信息
    3. 开始投放广告
```

---

## ⚠️ 重要提示

### 1. 始终使用非交互式模式

❌ **错误**（会卡住）:
```bash
google-ads account create --email a@b.com --name "X"
# 会提示输入 Customer ID，AI 无法响应
```

✅ **正确**:
```bash
google-ads account create --email a@b.com --name "X" --customer-id 1234567890
# 非交互式，直接完成
```

### 2. 使用 `--json` 输出

便于解析结果：
```bash
google-ads campaign list --json | jq '.[] | {id: .campaign.id, name: .campaign.name}'
```

### 3. Customer ID 格式

接受两种格式：
- `1234567890`（10位数字）
- `123-456-7890`（带连字符）

验证：必须是 10 位数字

---

## 🔧 配置文件

### 环境变量 (.env)

由 Agency 提供：
```bash
GOOGLE_ADS_DEVELOPER_TOKEN=xxx
GOOGLE_ADS_CLIENT_ID=xxx
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_MANAGER_ACCOUNT_ID=xxx
GOOGLE_ADS_REFRESH_TOKEN=xxx
```

### CLI 配置 (~/.config/google-ads-cli/config.json)

自动生成：
```json
{
  "customerId": "1234567890",
  "accountName": "Company Name",
  "currency": "USD",
  "timezone": "America/New_York",
  "email": "user@example.com"
}
```

---

## 📚 完整文档

- **AI 使用指南**: `docs/AI-使用指南.md`
- **客户创建账号指南**: `docs/客户创建账号指南.md`
- **技术设计**: `docs/technical-design.md`
- **命令参考**: `docs/EXAMPLES.md`

---

## 🆘 故障排除

### 问题 1: 命令卡住不动

**原因**: 使用了交互式模式
**解决**: 添加 `--customer-id` 参数

### 问题 2: Customer ID 格式错误

**原因**: 不是 10 位数字
**解决**: 检查格式，去掉连字符应该是 10 位

### 问题 3: 账号已存在

**原因**: 已经配置过账号
**解决**: 运行 `google-ads config reset --force`

---

## ✅ 快速测试

```bash
# 1. 查看帮助
google-ads --help

# 2. 查看账号创建帮助
google-ads account create --help

# 3. 测试非交互式创建（需要真实 Customer ID）
google-ads account create \
  --email test@example.com \
  --name "Test Company" \
  --customer-id 1234567890 \
  --json

# 4. 查看配置
google-ads config show --json
```

---

## 🎯 核心原则

1. **非交互式优先**: 所有命令支持完全非交互式调用
2. **JSON 输出**: 使用 `--json` 便于 AI 解析
3. **明确错误**: 错误信息清晰，便于 AI 理解和反馈
4. **文档完整**: 每个命令都有 `--help` 说明

---

Happy coding! 🚀
