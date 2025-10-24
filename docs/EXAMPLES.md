# Google Ads CLI - 使用示例

本文档提供详细的使用示例，帮助你快速上手 Google Ads CLI。

## 目录

- [准备工作](#准备工作)
- [基础操作](#基础操作)
- [账号管理](#账号管理)
- [广告系列管理](#广告系列管理)
- [关键词分析](#关键词分析)
- [GAQL 高级查询](#gaql-高级查询)
- [在 AI 中使用](#在-ai-中使用)

---

## 准备工作

### 1. 获取 Google Ads API 凭据

在使用之前，你需要：

1. **创建 Google Cloud 项目**
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目

2. **启用 Google Ads API**
   - 在 API 库中搜索 "Google Ads API"
   - 点击启用

3. **创建 OAuth2 凭据**
   - 进入 "凭据" 页面
   - 点击 "创建凭据" > "OAuth 客户端 ID"
   - 应用类型选择 "桌面应用"
   - 记录 Client ID 和 Client Secret

4. **申请 Developer Token**
   - 登录 [Google Ads](https://ads.google.com/)
   - 进入 "工具和设置" > "API 中心"
   - 申请 Developer Token（测试账号可立即获得）

详细步骤：[Google Ads API 快速入门](https://developers.google.com/google-ads/api/docs/first-call/overview)

### 2. 安装 CLI 工具

```bash
npm install -g @optima-chat/google-ads-cli
```

### 3. 初始化配置

```bash
google-ads init
```

按提示输入：
- Developer Token
- Client ID
- Client Secret
- Login Customer ID（可选，MCC 账号需要）

配置文件保存在：`~/.config/google-ads-cli/config.json`

### 4. OAuth2 登录

```bash
google-ads auth login
```

这会：
1. 启动本地回调服务器（http://localhost:9001）
2. 打开浏览器进入 Google 授权页面
3. 授权后自动获取并保存 token

Token 保存在：`~/.config/google-ads-cli/token.json`

---

## 基础操作

### 查看版本

```bash
google-ads --version
```

### 查看帮助

```bash
# 主命令帮助
google-ads --help

# 子命令帮助
google-ads auth --help
google-ads campaign --help
```

### 查看认证状态

```bash
google-ads auth status
```

输出示例：
```
┌──────────────────────┬────────────────────────────────────────────────────────────┐
│ 认证状态             │ 值                                                          │
├──────────────────────┼────────────────────────────────────────────────────────────┤
│ 状态                 │ ✓ 已认证                                                    │
│ 过期时间             │ 2024/10/25 23:59:59                                        │
│ 权限范围             │ https://www.googleapis.com/auth/adwords                    │
└──────────────────────┴────────────────────────────────────────────────────────────┘
```

### 查看配置

```bash
google-ads config show
```

### 修改配置

```bash
# 设置默认客户 ID
google-ads config set defaultCustomerId 1234567890

# 设置输出格式
google-ads config set outputFormat json
```

---

## 账号管理

### 列出所有可访问的账号

```bash
# 表格格式
google-ads account list

# JSON 格式
google-ads account list --json
```

输出示例（表格）：
```
┌─────────────────┬────────────────────────┬──────────┬─────────────────────┬────────────┬────────────┐
│ 账号 ID         │ 名称                    │ 货币     │ 时区                │ 管理账号   │ 测试账号   │
├─────────────────┼────────────────────────┼──────────┼─────────────────────┼────────────┼────────────┤
│ 1234567890      │ 我的广告账号            │ CNY      │ Asia/Shanghai       │ 否         │ 否         │
│ 9876543210      │ 测试账号                │ USD      │ America/Los_Angeles │ 否         │ 是         │
└─────────────────┴────────────────────────┴──────────┴─────────────────────┴────────────┴────────────┘

共找到 2 个客户账号
```

### 查看账号详情

```bash
google-ads account info 1234567890
```

---

## 广告系列管理

### 列出所有广告系列

```bash
# 基本用法
google-ads campaign list -c 1234567890

# 只看启用的
google-ads campaign list -c 1234567890 --status ENABLED

# 限制数量
google-ads campaign list -c 1234567890 --limit 10

# JSON 输出
google-ads campaign list -c 1234567890 --json
```

输出示例（表格）：
```
┌────────────┬─────────────────────────┬─────────┬─────────────┬────────────┬──────────┬─────────────┐
│ ID         │ 名称                     │ 状态    │ 类型        │ 展示量     │ 点击量   │ 费用        │
├────────────┼─────────────────────────┼─────────┼─────────────┼────────────┼──────────┼─────────────┤
│ 12345678   │ 搜索广告 - 品牌词        │ ENABLED │ SEARCH      │ 125000     │ 1250     │ 2500.50     │
│ 87654321   │ 展示广告 - 再营销        │ PAUSED  │ DISPLAY     │ 50000      │ 450      │ 890.25      │
└────────────┴─────────────────────────┴─────────┴─────────────┴────────────┴──────────┴─────────────┘

共 2 个广告系列
```

### 查看广告系列详情

```bash
google-ads campaign info -c 1234567890 12345678
```

输出示例：
```
┌─────────────────────────┬────────────────────────────────────────┐
│ 属性                     │ 值                                      │
├─────────────────────────┼────────────────────────────────────────┤
│ 广告系列 ID              │ 12345678                               │
│ 名称                     │ 搜索广告 - 品牌词                       │
│ 状态                     │ ENABLED                                │
│ 广告类型                 │ SEARCH                                 │
│ 出价策略                 │ MAXIMIZE_CONVERSIONS                   │
│ 开始日期                 │ 2024-01-01                             │
│ 结束日期                 │ 未设置                                  │
│ ---                      │ ---                                    │
│ 展示量                   │ 125000                                 │
│ 点击量                   │ 1250                                   │
│ 费用                     │ 2500.50                                │
│ 转化次数                 │ 45                                     │
│ 转化价值                 │ 12500.00                               │
│ 平均每次点击费用         │ 2.00                                   │
│ 点击率                   │ 1.00%                                  │
│ 优化得分                 │ 85.5                                   │
└─────────────────────────┴────────────────────────────────────────┘
```

---

## 关键词分析

### 列出关键词

```bash
# 查看所有关键词
google-ads keyword list -c 1234567890

# 按广告系列过滤
google-ads keyword list -c 1234567890 --campaign-id 12345678

# 只看启用的
google-ads keyword list -c 1234567890 --status ENABLED

# 限制数量（默认 100）
google-ads keyword list -c 1234567890 --limit 20

# JSON 输出
google-ads keyword list -c 1234567890 --json
```

输出示例：
```
┌─────────────────────────┬──────────────┬─────────┬────────────┬────────────┬──────────┬────────────┬──────────┐
│ 关键词                   │ 匹配类型     │ 状态    │ 质量得分   │ 展示量     │ 点击量   │ 费用       │ 点击率   │
├─────────────────────────┼──────────────┼─────────┼────────────┼────────────┼──────────┼────────────┼──────────┤
│ 手机壳                   │ BROAD        │ ENABLED │ 8          │ 15000      │ 150      │ 300.00     │ 1.00%    │
│ [保护壳]                 │ EXACT        │ ENABLED │ 9          │ 8000       │ 120      │ 240.00     │ 1.50%    │
│ "苹果手机壳"             │ PHRASE       │ ENABLED │ 7          │ 5000       │ 75       │ 150.00     │ 1.50%    │
└─────────────────────────┴──────────────┴─────────┴────────────┴────────────┴──────────┴────────────┴──────────┘

共 3 个关键词
```

---

## GAQL 高级查询

### 基本查询

```bash
google-ads query -c 1234567890 -q "
  SELECT
    campaign.id,
    campaign.name,
    campaign.status
  FROM campaign
  LIMIT 5
"
```

### 查询效果数据

```bash
google-ads query -c 1234567890 -q "
  SELECT
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions
  FROM campaign
  WHERE campaign.status = 'ENABLED'
  ORDER BY metrics.impressions DESC
  LIMIT 10
" --pretty
```

### 按日期查询

```bash
google-ads query -c 1234567890 -q "
  SELECT
    campaign.name,
    segments.date,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros
  FROM campaign
  WHERE segments.date DURING LAST_7_DAYS
  ORDER BY segments.date DESC
" --pretty
```

### 关键词效果查询

```bash
google-ads query -c 1234567890 -q "
  SELECT
    ad_group_criterion.keyword.text,
    ad_group_criterion.keyword.match_type,
    ad_group_criterion.quality_info.quality_score,
    metrics.impressions,
    metrics.clicks,
    metrics.ctr,
    metrics.average_cpc
  FROM keyword_view
  WHERE campaign.id = 12345678
    AND ad_group_criterion.status = 'ENABLED'
  ORDER BY metrics.impressions DESC
  LIMIT 20
" --pretty
```

### 从文件执行查询

```bash
# 创建查询文件
cat > campaign_performance.gaql << 'EOF'
SELECT
  campaign.id,
  campaign.name,
  campaign.advertising_channel_type,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.ctr,
  metrics.average_cpc,
  metrics.cost_per_conversion
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND metrics.impressions > 1000
ORDER BY metrics.conversions DESC
LIMIT 50
EOF

# 执行查询
google-ads query -c 1234567890 -f campaign_performance.gaql --pretty
```

### 复杂的多表查询

```bash
google-ads query -c 1234567890 -q "
  SELECT
    campaign.name,
    ad_group.name,
    ad_group_ad.ad.id,
    ad_group_ad.ad.type,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros
  FROM ad_group_ad
  WHERE campaign.status = 'ENABLED'
    AND ad_group.status = 'ENABLED'
    AND ad_group_ad.status = 'ENABLED'
    AND segments.date DURING LAST_30_DAYS
  ORDER BY metrics.impressions DESC
  LIMIT 100
" --pretty
```

---

## 在 AI 中使用

Google Ads CLI 专为 AI 助手（如 Claude Code）设计，提供 JSON 输出便于解析。

### Claude Code 使用示例

#### 场景 1：查看账号概况

**用户**: "帮我看看我有哪些 Google Ads 账号"

**Claude Code**:
```bash
google-ads account list --json
```

然后解析 JSON 结果，用自然语言回复用户。

#### 场景 2：分析广告系列效果

**用户**: "分析一下我的广告系列效果，找出点击率最高的 5 个"

**Claude Code**:
```bash
# 1. 获取账号列表
ACCOUNTS=$(google-ads account list --json)
CUSTOMER_ID=$(echo $ACCOUNTS | jq -r '.[0].id')

# 2. 查询效果数据
google-ads query -c $CUSTOMER_ID -q "
  SELECT
    campaign.id,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.ctr
  FROM campaign
  WHERE campaign.status = 'ENABLED'
    AND metrics.impressions > 100
  ORDER BY metrics.ctr DESC
  LIMIT 5
" --pretty
```

然后分析结果并生成报告。

#### 场景 3：关键词效果优化建议

**用户**: "给我的关键词提供优化建议"

**Claude Code**:
```bash
# 获取关键词数据
google-ads keyword list -c $CUSTOMER_ID --status ENABLED --limit 50 --json
```

然后分析：
- 质量得分低的关键词
- 点击率低的关键词
- 成本高但转化低的关键词

并给出优化建议。

#### 场景 4：生成周报

**用户**: "生成上周的广告效果周报"

**Claude Code**:
```bash
google-ads query -c $CUSTOMER_ID -q "
  SELECT
    segments.date,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM campaign
  WHERE segments.date DURING LAST_7_DAYS
  ORDER BY segments.date DESC, campaign.name
" --pretty
```

然后生成周报，包括：
- 总体数据汇总
- 每日趋势
- Top 表现广告系列
- 优化建议

### 在脚本中使用

```bash
#!/bin/bash

# Google Ads 日报脚本

CUSTOMER_ID="1234567890"
TODAY=$(date +%Y-%m-%d)

echo "📊 Google Ads 日报 - $TODAY"
echo "================================"

# 1. 昨日总览
echo -e "\n📈 昨日数据总览:"
google-ads query -c $CUSTOMER_ID -q "
  SELECT
    SUM(metrics.impressions) as total_impressions,
    SUM(metrics.clicks) as total_clicks,
    SUM(metrics.cost_micros) as total_cost
  FROM campaign
  WHERE segments.date = YESTERDAY
" --pretty | jq '.[0]'

# 2. Top 5 广告系列
echo -e "\n🏆 Top 5 广告系列（按点击量）:"
google-ads query -c $CUSTOMER_ID -q "
  SELECT
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros
  FROM campaign
  WHERE segments.date = YESTERDAY
  ORDER BY metrics.clicks DESC
  LIMIT 5
" --pretty | jq -r '.[] | "\(.campaign.name): \(.metrics.clicks) 次点击"'

# 3. 需要关注的异常
echo -e "\n⚠️  需要关注:"
google-ads query -c $CUSTOMER_ID -q "
  SELECT
    campaign.name,
    metrics.clicks,
    metrics.cost_micros
  FROM campaign
  WHERE segments.date = YESTERDAY
    AND metrics.clicks = 0
    AND metrics.impressions > 1000
" --pretty | jq -r '.[] | "- \(.campaign.name) (有展示但无点击)"'

echo -e "\n✅ 日报生成完成\n"
```

---

## 更多资源

- [Google Ads API 文档](https://developers.google.com/google-ads/api/docs/start)
- [GAQL 查询语言参考](https://developers.google.com/google-ads/api/docs/query/overview)
- [GAQL Cookbook](https://developers.google.com/google-ads/api/docs/query/cookbook)
- [字段查询工具](https://developers.google.com/google-ads/api/fields/v20/overview)

## 疑难解答

### 认证失败

```bash
# 检查认证状态
google-ads auth status

# 如果 token 过期，重新登录
google-ads auth logout
google-ads auth login
```

### 查询出错

常见问题：
1. Customer ID 格式错误（应该是纯数字，如 1234567890）
2. GAQL 语法错误（检查字段名、表名）
3. 权限不足（检查 Developer Token 和账号权限）

### 查看详细错误

```bash
# 设置 DEBUG 环境变量
DEBUG=* google-ads campaign list -c 1234567890
```

---

Happy advertising! 🚀
