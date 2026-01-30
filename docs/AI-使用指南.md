# AI 使用 Google Ads CLI 指南

> 本指南专为 AI（如 Claude Code）设计，说明如何使用 **非交互式模式** 调用 CLI

## 🤖 为什么需要非交互式模式？

AI 无法处理交互式提示（如 `inquirer.prompt`），需要通过命令行参数一次性传递所有信息。

---

## 🎯 核心命令：非交互式创建账号

### 基本语法

```bash
google-ads account create \
  --email <client-email> \
  --name <company-name> \
  --customer-id <customer-id> \
  [--currency <currency>] \
  [--timezone <timezone>] \
  [--json]
```

### 参数说明

| 参数 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `--email` | ✅ | 客户的 Gmail 邮箱 | `client@gmail.com` |
| `--name` | ✅ | 公司/品牌名称 | `"My Company"` |
| `--customer-id` | ✅ | Google Ads Customer ID | `1234567890` 或 `123-456-7890` |
| `--currency` | ❌ | 货币代码（默认 USD） | `USD`, `CNY`, `EUR` |
| `--timezone` | ❌ | 时区（默认美东） | `America/New_York`, `Asia/Shanghai` |
| `--json` | ❌ | JSON 格式输出 | - |

---

## 📋 使用场景

### 场景 1: AI 帮助客户创建账号

**用户请求**:
> "帮我创建一个 Google Ads 账号，邮箱是 john@example.com，公司名是 Acme Corp"

**AI 操作流程**:

#### 步骤 1: 引导用户创建账号

AI 应该告诉用户：

```
我来帮你设置 Google Ads 账号。首先，你需要创建一个 Google Ads 账号：

1. 访问：https://ads.google.com/
2. 用你的 Gmail (john@example.com) 登录
3. 切换到"专家模式"
4. 选择"创建账号而不创建广告系列"
5. 填写信息：
   - 公司名：Acme Corp
   - 货币：USD（创建后不可修改！）
   - 时区：America/New_York
6. 完成后，记录你的 Customer ID（格式：123-456-7890）

详细步骤请查看：docs/客户创建账号指南.md

创建完成后，请告诉我你的 Customer ID。
```

#### 步骤 2: 用户提供 Customer ID

**用户回复**:
> "我创建好了，Customer ID 是 987-654-3210"

#### 步骤 3: AI 保存配置

```bash
google-ads account create \
  --email john@example.com \
  --name "Acme Corp" \
  --customer-id 987-654-3210 \
  --currency USD \
  --timezone "America/New_York"
```

**输出**:
```
✅ Customer ID 验证通过

✅ 配置已保存！

📧 下一步操作:

1. 检查您的邮箱 john@example.com
   查找来自 Google Ads 的邀请邮件（可能在垃圾邮件中）

2. 点击邮件中的 "接受邀请" 链接
3. 使用您的 Google 账号登录并接受邀请
4. 设置账单信息
5. 验证账号配置:
   google-ads account check

💡 提示: Customer ID (987-654-3210) 已保存，后续命令无需指定账号
```

---

### 场景 2: 使用 JSON 输出（推荐 AI 使用）

```bash
google-ads account create \
  --email ai@example.com \
  --name "AI Startup" \
  --customer-id 1234567890 \
  --json
```

**输出**:
```json
{
  "success": true,
  "customer_id": "123-456-7890",
  "account_name": "AI Startup",
  "currency": "USD",
  "timezone": "America/New_York",
  "email": "ai@example.com",
  "next_steps": [
    "检查邮箱中的 Google Ads 邀请邮件",
    "点击邮件中的链接接受邀请",
    "登录 Google Ads 设置账单",
    "运行 google-ads account check 验证配置"
  ]
}
```

**AI 解析 JSON**:
```typescript
const result = JSON.parse(output);
if (result.success) {
  console.log(`账号已配置：${result.customer_id}`);
  console.log(`下一步：${result.next_steps.join('\n')}`);
}
```

---

### 场景 3: 错误处理

#### 无效的 Customer ID

```bash
google-ads account create \
  --email test@example.com \
  --name "Test" \
  --customer-id invalid
```

**输出**:
```
✖ 操作失败
✗ 无效的 Customer ID 格式
请提供 10 位数字的 Customer ID（可带或不带连字符）
例如: 1234567890 或 123-456-7890
```

**AI 处理**:
```
AI: 看起来 Customer ID 格式不正确。
    Customer ID 应该是 10 位数字，如：1234567890 或 123-456-7890
    请检查并重新输入。
```

#### 账号已存在

```bash
google-ads account create \
  --email test@example.com \
  --name "Test" \
  --customer-id 1234567890
```

**输出**:
```
⚠ 您已经创建过账号

⚠️  检测到已存在的账号配置
Customer ID: 1234567890

如果需要重新创建，请先运行:
  google-ads config reset
```

**AI 处理**:
```
AI: 检测到你已经配置过账号（Customer ID: 1234567890）。
    如果需要更换账号，请先运行：
    google-ads config reset
```

---

## 🔍 验证配置

创建账号后，AI 可以验证配置是否成功：

```bash
google-ads config show --json
```

**输出**:
```json
{
  "customerId": "1234567890",
  "accountName": "AI Startup",
  "currency": "USD",
  "timezone": "America/New_York",
  "email": "ai@example.com",
  "createdAt": "2026-01-13T18:41:35.000Z",
  "configPath": "/Users/user/.config/google-ads-cli/config.json"
}
```

---

## 📊 完整 AI 对话示例

### 示例对话

```
用户: 帮我创建一个 Google Ads 账号

AI: 好的！我来帮你创建 Google Ads 账号。

    首先，你需要提供以下信息：
    1. 你的 Gmail 邮箱
    2. 公司或品牌名称

    请告诉我这些信息。

用户: 邮箱是 startup@gmail.com，公司名叫 StartupCo

AI: 收到！现在请按照以下步骤创建账号：

    1. 访问 https://ads.google.com/
    2. 用 startup@gmail.com 登录
    3. 在页面底部找到"切换到专家模式"并点击
    4. 选择"创建账号而不创建广告系列"
    5. 填写：
       - 公司名：StartupCo
       - 货币：USD（重要：创建后不可修改！）
       - 时区：America/New_York
    6. 完成后记录 Customer ID（格式：123-456-7890）

    详细图文教程：docs/客户创建账号指南.md

    创建好后告诉我 Customer ID，我会帮你完成配置。

用户: 好了，Customer ID 是 555-666-7777

AI: [运行命令]
    google-ads account create \
      --email startup@gmail.com \
      --name "StartupCo" \
      --customer-id 555-666-7777 \
      --json

    [解析结果]

    ✅ 账号配置成功！

    Customer ID: 555-666-7777
    账号名称: StartupCo
    货币: USD
    时区: America/New_York

    下一步请完成：
    1. 检查邮箱 startup@gmail.com，查找 Google Ads 邀请邮件
    2. 点击邮件中的链接接受邀请
    3. 登录 Google Ads 设置账单信息

    完成后，你就可以开始投放广告了！需要我帮你创建第一个广告系列吗？

用户: 好的，帮我创建一个广告系列

AI: [继续后续操作...]
    google-ads campaign create -n "首次广告系列" -b 50
```

---

## 🛠️ AI 最佳实践

### 1. 总是使用 `--json` 输出

便于解析结果：

```bash
google-ads account create \
  --email user@example.com \
  --name "Company" \
  --customer-id 1234567890 \
  --json
```

### 2. 验证 Customer ID 格式

在调用前验证：

```typescript
function isValidCustomerId(id: string): boolean {
  const clean = id.replace(/-/g, '');
  return /^\d{10}$/.test(clean);
}

// AI 使用
if (!isValidCustomerId(userProvidedId)) {
  console.log('Customer ID 格式不正确，应该是 10 位数字');
  return;
}
```

### 3. 捕获错误并友好提示

```bash
# 如果命令失败，检查退出码
if [ $? -ne 0 ]; then
  echo "配置失败，请检查 Customer ID 格式"
fi
```

### 4. 提供清晰的下一步指引

配置成功后，告诉用户：
- ✅ 配置已完成
- 📧 检查邮件接受邀请
- 💳 设置账单信息
- 🚀 可以开始创建广告了

---

## 🔗 相关命令

### 查看配置

```bash
google-ads config show [--json]
```

### 重置配置

```bash
google-ads config reset [--force]
```

### 检查账号状态

```bash
google-ads account check [--json]
```

### 创建广告系列

```bash
google-ads campaign create \
  -n "广告系列名称" \
  -b 100 \
  [--status PAUSED|ENABLED] \
  [--json]
```

---

## 📚 AI 提示词模板

### Claude Code 提示词

```
当用户要创建 Google Ads 账号时：

1. 询问邮箱和公司名
2. 引导用户访问 https://ads.google.com/ 创建账号
3. 强调货币选择不可修改
4. 等待用户提供 Customer ID
5. 使用非交互式命令保存配置：
   google-ads account create --email <email> --name <name> --customer-id <id> --json
6. 解析 JSON 结果并告知下一步

重要：
- 始终使用 --customer-id 参数（非交互式）
- 始终使用 --json 便于解析
- 货币和时区使用合理默认值
```

---

## ✅ 测试清单

AI 开发者可以使用以下测试：

- [ ] 非交互式创建账号（带 --customer-id）
- [ ] JSON 输出格式正确
- [ ] 无效 Customer ID 格式报错
- [ ] 账号已存在时提示正确
- [ ] 配置成功保存到 config.json
- [ ] 后续命令可以正常使用（无需再指定 customer-id）

---

## 🆘 常见问题

### Q1: AI 卡在交互式提示怎么办？

**A**: 确保使用 `--customer-id` 参数：

```bash
# ✅ 正确（非交互式）
google-ads account create --email a@b.com --name "X" --customer-id 1234567890

# ❌ 错误（会进入交互式提示）
google-ads account create --email a@b.com --name "X"
```

### Q2: 如何让 AI 识别用户提供的 Customer ID？

**A**: AI 应该识别以下格式：
- `123-456-7890`（带连字符）
- `1234567890`（不带连字符）
- `my customer id is 123-456-7890`（从文本中提取）

```typescript
// AI 提取逻辑
const customerIdRegex = /\d{3}-?\d{3}-?\d{4}/;
const match = userMessage.match(customerIdRegex);
if (match) {
  const customerId = match[0];
  // 使用 customerId
}
```

### Q3: 如何处理多账号切换？

**A**: 使用 `config reset` 重置配置：

```bash
# 1. 重置当前配置
google-ads config reset --force

# 2. 配置新账号
google-ads account create --email new@example.com --name "New Co" --customer-id 9999999999
```

---

## 🎯 总结

**核心要点**:
1. ✅ 使用 `--customer-id` 参数实现非交互式
2. ✅ 使用 `--json` 输出便于 AI 解析
3. ✅ 引导用户在 UI 创建账号并提供 Customer ID
4. ✅ 验证格式并保存配置
5. ✅ 友好的错误提示和下一步指引

**AI 调用示例**:
```bash
google-ads account create \
  --email user@gmail.com \
  --name "Company Name" \
  --customer-id 1234567890 \
  --currency USD \
  --timezone "America/New_York" \
  --json
```

---

有问题？查看：
- 客户创建账号指南：`docs/客户创建账号指南.md`
- 技术设计文档：`docs/technical-design.md`
- 命令帮助：`google-ads account create --help`
