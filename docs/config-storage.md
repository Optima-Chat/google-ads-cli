# Google Ads CLI 配置存储说明

## 📁 Customer ID 存储位置

Customer ID 和其他账号配置信息存储在 **本地 JSON 文件** 中。

---

## 🗂️ 配置文件位置

### macOS / Linux
```
~/.config/google-ads-cli-nodejs/config.json
```

### Windows
```
%APPDATA%\google-ads-cli-nodejs\config.json
```

### 查看完整路径
```bash
google-ads config path
```

**输出示例**（macOS）:
```
/Users/username/Library/Preferences/google-ads-cli-nodejs/config.json
```

---

## 📋 配置文件内容

### config.json 文件结构

```json
{
  "customerId": "1234567890",
  "accountName": "My Company",
  "currency": "USD",
  "timezone": "America/New_York",
  "email": "user@example.com",
  "createdAt": "2026-01-13T11:11:52.783Z"
}
```

### 字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `customerId` | string | Google Ads Customer ID（10位数字） | `"1234567890"` |
| `accountName` | string | 账号名称（公司/品牌） | `"My Company"` |
| `currency` | string | 货币代码（创建后不可修改） | `"USD"`, `"CNY"` |
| `timezone` | string | 时区 | `"America/New_York"` |
| `email` | string | Gmail 邮箱 | `"user@example.com"` |
| `createdAt` | string | 创建时间（ISO 8601） | `"2026-01-13T..."` |

---

## 🔧 配置管理

### 查看当前配置

```bash
# 表格格式
google-ads config show

# JSON 格式
google-ads config show --json
```

**输出示例**:
```
┌─────────────┬────────────────────┐
│ Customer ID │ 123-456-7890       │
├─────────────┼────────────────────┤
│ 账号名称    │ My Company         │
├─────────────┼────────────────────┤
│ 货币        │ USD                │
├─────────────┼────────────────────┤
│ 时区        │ America/New_York   │
├─────────────┼────────────────────┤
│ 邮箱        │ user@example.com   │
├─────────────┼────────────────────┤
│ 创建时间    │ 2026/1/13 11:11:52 │
└─────────────┴────────────────────┘

配置文件路径: /Users/username/.config/google-ads-cli-nodejs/config.json
```

### 查看配置文件路径

```bash
google-ads config path
```

### 重置配置

```bash
# 交互式确认
google-ads config reset

# 强制重置（无需确认）
google-ads config reset --force
```

---

## 🔍 Customer ID 的使用

### 自动使用

配置保存后，**所有命令自动使用**保存的 Customer ID，无需每次指定：

```bash
# ✅ 无需指定 customer-id
google-ads campaign list
google-ads keyword list
google-ads query -q "SELECT campaign.name FROM campaign"
```

### 手动指定（覆盖保存的配置）

如果需要临时使用不同的 Customer ID：

```bash
# ⚠️ 大多数命令不支持手动指定（因为是单账号模式）
# 如需切换账号，使用 config reset 重新配置
```

### 查看使用中的 Customer ID

```bash
google-ads config show | grep "Customer ID"
```

---

## 🔐 配置安全性

### 本地存储

- ✅ 配置文件**仅存储在本地**
- ✅ 文件权限由操作系统管理
- ✅ **不包含敏感凭据**（如 access token）

### 敏感凭据存储

敏感凭据（API 凭据、Token）存储在**环境变量**中：

**文件**: `.env`（项目根目录）

```bash
GOOGLE_ADS_DEVELOPER_TOKEN=xxx      # Agency 提供
GOOGLE_ADS_CLIENT_ID=xxx            # Agency 提供
GOOGLE_ADS_CLIENT_SECRET=xxx        # Agency 提供
GOOGLE_ADS_MANAGER_ACCOUNT_ID=xxx   # Agency 提供
GOOGLE_ADS_REFRESH_TOKEN=xxx        # 自动生成
```

**安全措施**:
- ✅ `.env` 文件在 `.gitignore` 中
- ✅ 不会提交到 Git
- ✅ 不会在日志中显示

---

## 📊 配置层级

### 完整的配置来源

```
┌─────────────────────────────────────────┐
│ 1. 环境变量 (.env)                       │
│    - Agency 提供的 API 凭据              │
│    - OAuth2 认证 Token                   │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│ 2. CLI 配置 (config.json)                │
│    - Customer ID                         │
│    - 账号基本信息                         │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│ 3. 命令行参数（可选）                     │
│    - --json 输出格式                      │
│    - --limit 限制数量                     │
└─────────────────────────────────────────┘
```

---

## 🔄 配置同步

### 跨设备使用

配置文件是**本地的**，不会自动同步。如需在多台设备使用：

#### 方法 1: 手动复制配置文件

```bash
# 在设备 A 导出
cat ~/.config/google-ads-cli-nodejs/config.json

# 在设备 B 导入
mkdir -p ~/.config/google-ads-cli-nodejs
echo '{...}' > ~/.config/google-ads-cli-nodejs/config.json
```

#### 方法 2: 重新运行 account create

```bash
# 在设备 B
google-ads account create \
  --email your@gmail.com \
  --name "Your Company" \
  --customer-id 1234567890
```

---

## 🛠️ 编程访问配置

### 在代码中读取 Customer ID

如果你在开发集成：

```typescript
import Conf from 'conf';

const config = new Conf({ projectName: 'google-ads-cli' });

// 读取 Customer ID
const customerId = config.get('customerId') as string | undefined;

if (!customerId) {
  console.error('未配置账号，请运行: google-ads account create');
  process.exit(1);
}

console.log(`当前 Customer ID: ${customerId}`);
```

---

## 📝 配置文件示例

### 完整配置示例

```json
{
  "customerId": "5412608760",
  "accountName": "Acme Corporation",
  "currency": "USD",
  "timezone": "America/Los_Angeles",
  "email": "ads@acme.com",
  "createdAt": "2026-01-13T18:30:00.000Z"
}
```

### 中文用户配置示例

```json
{
  "customerId": "9876543210",
  "accountName": "北京科技公司",
  "currency": "CNY",
  "timezone": "Asia/Shanghai",
  "email": "marketing@company.cn",
  "createdAt": "2026-01-13T10:00:00.000Z"
}
```

---

## ⚠️ 常见问题

### Q1: 找不到配置文件？

**A**: 运行以下命令创建配置：
```bash
google-ads account create --email your@gmail.com --name "Company" --customer-id 1234567890
```

### Q2: 可以手动编辑配置文件吗？

**A**: 可以，但**不推荐**。建议使用 CLI 命令：
- ✅ 使用 `google-ads account create` 创建
- ✅ 使用 `google-ads config reset` 重置
- ❌ 避免手动编辑（可能导致格式错误）

### Q3: 如何备份配置？

**A**: 复制配置文件：
```bash
# macOS/Linux
cp ~/.config/google-ads-cli-nodejs/config.json ~/backup-config.json

# 或使用命令输出
google-ads config show --json > backup-config.json
```

### Q4: 配置文件会自动同步吗？

**A**: 不会。配置是**本地的**，需要手动复制或重新配置。

### Q5: 删除 CLI 后配置还在吗？

**A**: 是的。卸载 CLI 不会删除配置文件，需要手动删除：
```bash
# macOS/Linux
rm -rf ~/.config/google-ads-cli-nodejs

# Windows
del /f /s /q %APPDATA%\google-ads-cli-nodejs
```

---

## 🔍 调试配置问题

### 检查配置是否存在

```bash
# macOS/Linux
ls -la ~/.config/google-ads-cli-nodejs/config.json

# 查看内容
cat ~/.config/google-ads-cli-nodejs/config.json
```

### 检查配置权限

```bash
# macOS/Linux
ls -l ~/.config/google-ads-cli-nodejs/config.json

# 应该显示类似：
# -rw-r--r--  1 username staff 234 Jan 13 11:11 config.json
```

### 重建配置

如果配置损坏：

```bash
# 1. 删除旧配置
rm -rf ~/.config/google-ads-cli-nodejs

# 2. 重新创建
google-ads account create \
  --email your@gmail.com \
  --name "Your Company" \
  --customer-id 1234567890
```

---

## 📚 相关命令

```bash
# 查看配置
google-ads config show
google-ads config show --json

# 查看配置文件路径
google-ads config path

# 重置配置
google-ads config reset
google-ads config reset --force

# 创建/更新配置
google-ads account create \
  --email <email> \
  --name <name> \
  --customer-id <id>
```

---

## 🎯 总结

**Customer ID 存储位置**:
```
macOS:    ~/.config/google-ads-cli-nodejs/config.json
Linux:    ~/.config/google-ads-cli-nodejs/config.json
Windows:  %APPDATA%\google-ads-cli-nodejs\config.json
```

**存储内容**:
- Customer ID（10位数字）
- 账号名称
- 货币、时区
- 邮箱、创建时间

**管理命令**:
- `google-ads config show` - 查看配置
- `google-ads config path` - 查看路径
- `google-ads config reset` - 重置配置

**安全性**:
- ✅ 本地存储，不包含敏感凭据
- ✅ API 凭据在 `.env` 文件中
- ✅ 不会自动同步或上传

---

有问题？查看：
- 配置管理：`google-ads config --help`
- 账号创建：`google-ads account create --help`
- 完整文档：`docs/technical-design.md`
