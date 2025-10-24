/**
 * Google Ads Client - 封装 Google Ads API
 */

import { GoogleAdsApi, Customer } from 'google-ads-api';
import { loadConfig } from '../utils/config.js';
import { OAuth2Manager } from './oauth2-manager.js';
import { GoogleAdsError } from '../utils/errors.js';

/**
 * Google Ads Client 封装类
 */
export class GoogleAdsClient {
  private api: GoogleAdsApi;
  private oauth: OAuth2Manager;
  private config: ReturnType<typeof loadConfig>;

  constructor() {
    this.config = loadConfig();
    this.oauth = new OAuth2Manager();

    // 初始化 Google Ads API
    this.api = new GoogleAdsApi({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      developer_token: this.config.developerToken,
    });
  }

  /**
   * 获取 Customer 对象（带认证）
   */
  async getCustomer(customerId: string): Promise<Customer> {
    try {
      // 获取 refresh token
      const refreshToken = await this.oauth.getRefreshToken();

      // 创建 Customer 对象
      const customer = this.api.Customer({
        customer_id: customerId,
        refresh_token: refreshToken,
        login_customer_id: this.config.loginCustomerId,
      });

      return customer;
    } catch (error: any) {
      throw new GoogleAdsError(
        `无法连接到客户账号 ${customerId}: ${error.message}`,
        error
      );
    }
  }

  /**
   * 执行 GAQL 查询
   */
  async query(customerId: string, gaqlQuery: string): Promise<any[]> {
    try {
      const customer = await this.getCustomer(customerId);
      const results = await customer.query(gaqlQuery);
      return results;
    } catch (error: any) {
      throw new GoogleAdsError(`查询失败: ${error.message}`, error);
    }
  }

  /**
   * 获取客户账号信息
   */
  async getCustomerInfo(customerId: string): Promise<any> {
    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.manager,
        customer.test_account,
        customer.auto_tagging_enabled,
        customer.tracking_url_template
      FROM customer
      WHERE customer.id = ${customerId}
    `;

    const results = await this.query(customerId, query);
    return results[0]?.customer || null;
  }

  /**
   * 列出可访问的客户账号
   */
  async listAccessibleCustomers(): Promise<string[]> {
    try {
      const refreshToken = await this.oauth.getRefreshToken();

      // 使用 client.listAccessibleCustomers() 方法
      const response = await this.api.listAccessibleCustomers(refreshToken);

      // response 是 ListAccessibleCustomersResponse 对象，包含 resource_names 数组
      const resourceNames = response.resource_names || [];

      // 提取 customer ID
      const customerIds = resourceNames
        .map((name: string) => {
          const match = name.match(/customers\/(\d+)/);
          return match ? match[1] : null;
        })
        .filter((id: string | null): id is string => id !== null);

      return customerIds;
    } catch (error: any) {
      throw new GoogleAdsError(`获取可访问账号列表失败: ${error.message}`, error);
    }
  }

  /**
   * 列出广告系列
   */
  async listCampaigns(customerId: string, options?: {
    status?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.campaign_budget,
        campaign.start_date,
        campaign.end_date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
    `;

    const conditions: string[] = [];
    if (options?.status) {
      conditions.push(`campaign.status = '${options.status}'`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY campaign.id';

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    return await this.query(customerId, query);
  }

  /**
   * 获取广告系列详情
   */
  async getCampaign(customerId: string, campaignId: string): Promise<any> {
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.campaign_budget,
        campaign.start_date,
        campaign.end_date,
        campaign.target_cpa.target_cpa_micros,
        campaign.target_roas.target_roas,
        campaign.optimization_score,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.average_cpc,
        metrics.average_cpm,
        metrics.ctr
      FROM campaign
      WHERE campaign.id = ${campaignId}
    `;

    const results = await this.query(customerId, query);
    return results[0] || null;
  }

  /**
   * 列出关键词
   */
  async listKeywords(customerId: string, campaignId?: string, options?: {
    status?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = `
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group_criterion.negative,
        ad_group_criterion.quality_info.quality_score,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM keyword_view
    `;

    const conditions: string[] = [];
    if (campaignId) {
      conditions.push(`campaign.id = ${campaignId}`);
    }
    if (options?.status) {
      conditions.push(`ad_group_criterion.status = '${options.status}'`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY metrics.impressions DESC';

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    return await this.query(customerId, query);
  }

  /**
   * 获取广告文案
   */
  async listAds(customerId: string, campaignId?: string, options?: {
    status?: string;
    adType?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = `
      SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.ad.expanded_text_ad.headline_part1,
        ad_group_ad.ad.expanded_text_ad.headline_part2,
        ad_group_ad.ad.expanded_text_ad.headline_part3,
        ad_group_ad.ad.expanded_text_ad.description,
        ad_group_ad.ad.expanded_text_ad.description2,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.ad.final_urls,
        ad_group_ad.status,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr
      FROM ad_group_ad
    `;

    const conditions: string[] = [];
    if (campaignId) {
      conditions.push(`campaign.id = ${campaignId}`);
    }
    if (options?.status) {
      conditions.push(`ad_group_ad.status = '${options.status}'`);
    }
    if (options?.adType) {
      conditions.push(`ad_group_ad.ad.type = '${options.adType}'`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY metrics.impressions DESC';

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    return await this.query(customerId, query);
  }

  /**
   * 获取效果数据
   */
  async getPerformanceMetrics(customerId: string, options: {
    level: 'campaign' | 'ad_group' | 'keyword' | 'ad';
    dateRange?: string; // 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS'
    campaignId?: string;
    limit?: number;
  }): Promise<any[]> {
    const resourceMap = {
      campaign: 'campaign',
      ad_group: 'ad_group',
      keyword: 'keyword_view',
      ad: 'ad_group_ad',
    };

    const resource = resourceMap[options.level];
    let query = `SELECT `;

    // 添加基础字段
    const fields: string[] = [];
    if (options.level === 'campaign') {
      fields.push('campaign.id', 'campaign.name', 'campaign.status');
    } else if (options.level === 'ad_group') {
      fields.push('campaign.id', 'campaign.name', 'ad_group.id', 'ad_group.name', 'ad_group.status');
    } else if (options.level === 'keyword') {
      fields.push(
        'campaign.id',
        'campaign.name',
        'ad_group.id',
        'ad_group.name',
        'ad_group_criterion.criterion_id',
        'ad_group_criterion.keyword.text',
        'ad_group_criterion.keyword.match_type'
      );
    } else if (options.level === 'ad') {
      fields.push(
        'campaign.id',
        'campaign.name',
        'ad_group.id',
        'ad_group.name',
        'ad_group_ad.ad.id',
        'ad_group_ad.ad.type'
      );
    }

    // 添加指标
    fields.push(
      'metrics.impressions',
      'metrics.clicks',
      'metrics.cost_micros',
      'metrics.conversions',
      'metrics.conversions_value',
      'metrics.ctr',
      'metrics.average_cpc',
      'metrics.average_cpm',
      'metrics.cost_per_conversion'
    );

    // 如果有日期范围，添加日期字段
    if (options.dateRange) {
      fields.push('segments.date');
    }

    query += fields.join(', ') + ` FROM ${resource}`;

    // 添加条件
    const conditions: string[] = [];
    if (options.campaignId) {
      conditions.push(`campaign.id = ${options.campaignId}`);
    }
    if (options.dateRange) {
      conditions.push(`segments.date DURING ${options.dateRange}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY metrics.impressions DESC';

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    return await this.query(customerId, query);
  }

  /**
   * 创建广告系列
   *
   * 使用 mutateResources API 批量创建预算和广告系列
   */
  async createCampaign(customerId: string, campaignData: {
    name: string;
    budget_amount_micros: number;
    advertising_channel_type: string;
    status?: string;
  }): Promise<any> {
    try {
      const customer = await this.getCustomer(customerId);

      // 使用 mutateResources 批量创建（待实现）
      // TODO: 实现完整的 mutateResources 操作
      throw new Error('createCampaign 方法待实现');
    } catch (error: any) {
      throw new GoogleAdsError(`创建广告系列失败: ${error.message}`, error);
    }
  }

  /**
   * 更新广告系列状态
   */
  async updateCampaignStatus(customerId: string, campaignId: string, status: 'ENABLED' | 'PAUSED' | 'REMOVED'): Promise<any> {
    try {
      const customer = await this.getCustomer(customerId);

      // 使用 mutateResources 更新（待实现）
      // TODO: 实现完整的 mutateResources 操作
      throw new Error('updateCampaignStatus 方法待实现');
    } catch (error: any) {
      throw new GoogleAdsError(`更新广告系列失败: ${error.message}`, error);
    }
  }
}
