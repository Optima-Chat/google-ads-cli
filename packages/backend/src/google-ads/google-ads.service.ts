import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleAdsApi,
  Customer,
  enums,
  MutateOperation,
  toMicros,
} from 'google-ads-api';

/**
 * Google Ads Service - MCC Mode
 *
 * 使用 Agency 的 refresh_token 管理所有客户账号
 */
@Injectable()
export class GoogleAdsService {
  private api: GoogleAdsApi;
  private refreshToken: string;
  private loginCustomerId: string;

  constructor(private configService: ConfigService) {
    this.refreshToken = configService.get<string>(
      'GOOGLE_ADS_REFRESH_TOKEN',
      '',
    );
    this.loginCustomerId = configService.get<string>(
      'GOOGLE_ADS_MANAGER_ACCOUNT_ID',
      '',
    );

    this.api = new GoogleAdsApi({
      client_id: configService.get<string>('GOOGLE_ADS_CLIENT_ID', ''),
      client_secret: configService.get<string>('GOOGLE_ADS_CLIENT_SECRET', ''),
      developer_token: configService.get<string>(
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        '',
      ),
    });
  }

  /**
   * Get Customer object with MCC authentication
   */
  getCustomer(customerId: string): Customer {
    return this.api.Customer({
      customer_id: customerId,
      refresh_token: this.refreshToken,
      login_customer_id: this.loginCustomerId,
    });
  }

  /**
   * Execute GAQL query
   */
  async query(customerId: string, gaqlQuery: string): Promise<unknown[]> {
    const customer = this.getCustomer(customerId);
    return customer.query(gaqlQuery);
  }

  /**
   * Get customer account info
   */
  async getCustomerInfo(customerId: string): Promise<unknown> {
    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.manager,
        customer.test_account,
        customer.auto_tagging_enabled
      FROM customer
      WHERE customer.id = ${customerId}
    `;

    const results = await this.query(customerId, query);
    return (results[0] as Record<string, unknown>)?.customer || null;
  }

  /**
   * List accessible customer accounts under MCC
   */
  async listAccessibleCustomers(): Promise<string[]> {
    const response = await this.api.listAccessibleCustomers(this.refreshToken);

    const resourceNames = response.resource_names || [];
    return resourceNames
      .map((name: string) => {
        const match = name.match(/customers\/(\d+)/);
        return match ? match[1] : null;
      })
      .filter((id: string | null): id is string => id !== null);
  }

  // ============ Campaign Operations ============

  async listCampaigns(
    customerId: string,
    options?: { status?: string; limit?: number },
  ): Promise<unknown[]> {
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

    return this.query(customerId, query);
  }

  async getCampaign(customerId: string, campaignId: string): Promise<unknown> {
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

  async createCampaign(
    customerId: string,
    data: {
      name: string;
      budgetAmountMicros: number;
      advertisingChannelType?: string;
      status?: string;
    },
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const budgetResourceName = `customers/${customerId}/campaignBudgets/-1`;

    const operations: MutateOperation<unknown>[] = [
      {
        entity: 'campaign_budget',
        operation: 'create',
        resource: {
          resource_name: budgetResourceName,
          name: `${data.name} Budget`,
          delivery_method: enums.BudgetDeliveryMethod.STANDARD,
          amount_micros: data.budgetAmountMicros,
        },
      },
      {
        entity: 'campaign',
        operation: 'create',
        resource: {
          name: data.name,
          advertising_channel_type:
            data.advertisingChannelType || enums.AdvertisingChannelType.SEARCH,
          status: data.status || enums.CampaignStatus.PAUSED,
          campaign_budget: budgetResourceName,
          manual_cpc: { enhanced_cpc_enabled: false },
          contains_eu_political_advertising:
            enums.EuPoliticalAdvertisingStatus
              .DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING,
          network_settings: { target_google_search: true },
        },
      },
    ];

    return customer.mutateResources(operations);
  }

  async updateCampaign(
    customerId: string,
    campaignId: string,
    data: { status?: string; name?: string; budgetAmountMicros?: number },
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/campaigns/${campaignId}`;
    const resource: Record<string, unknown> = {};

    if (data.status) resource.status = data.status;
    if (data.name) resource.name = data.name;

    // Update budget if specified
    if (data.budgetAmountMicros) {
      const campaignQuery = `
        SELECT campaign.campaign_budget FROM campaign WHERE campaign.id = ${campaignId}
      `;
      const campaignResult = await customer.query(campaignQuery);
      const budgetResourceName = (
        campaignResult[0] as Record<string, Record<string, string>>
      )?.campaign?.campaign_budget;

      if (budgetResourceName) {
        await customer.mutateResources([
          {
            entity: 'campaign_budget',
            operation: 'update',
            resource: {
              resource_name: budgetResourceName,
              amount_micros: data.budgetAmountMicros,
            },
          },
        ]);
      }
    }

    if (Object.keys(resource).length > 0) {
      resource.resource_name = resourceName;
      return customer.mutateResources([
        { entity: 'campaign', operation: 'update', resource },
      ]);
    }

    return { success: true };
  }

  async deleteCampaign(
    customerId: string,
    campaignId: string,
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/campaigns/${campaignId}`;
    return customer.campaigns.remove([resourceName]);
  }

  // ============ Ad Group Operations ============

  async listAdGroups(
    customerId: string,
    options?: { campaignId?: string; status?: string; limit?: number },
  ): Promise<unknown[]> {
    let query = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group.type,
        ad_group.cpc_bid_micros,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr
      FROM ad_group
    `;

    const conditions: string[] = [];
    if (options?.campaignId)
      conditions.push(`campaign.id = ${options.campaignId}`);
    if (options?.status)
      conditions.push(`ad_group.status = '${options.status}'`);
    else conditions.push(`ad_group.status != 'REMOVED'`);

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` LIMIT ${options?.limit || 100}`;

    return this.query(customerId, query);
  }

  async getAdGroup(customerId: string, adGroupId: string): Promise<unknown> {
    const query = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group.type,
        ad_group.cpc_bid_micros,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM ad_group
      WHERE ad_group.id = ${adGroupId}
    `;

    const results = await this.query(customerId, query);
    return results[0] || null;
  }

  async createAdGroup(
    customerId: string,
    data: {
      name: string;
      campaignId: string;
      cpcBidMicros?: number;
      status?: string;
    },
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const campaignResourceName = `customers/${customerId}/campaigns/${data.campaignId}`;

    return customer.mutateResources([
      {
        entity: 'ad_group',
        operation: 'create',
        resource: {
          name: data.name,
          campaign: campaignResourceName,
          status: data.status || enums.AdGroupStatus.ENABLED,
          cpc_bid_micros: data.cpcBidMicros || toMicros(1),
        },
      },
    ]);
  }

  async updateAdGroup(
    customerId: string,
    adGroupId: string,
    data: { status?: string; name?: string; cpcBidMicros?: number },
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/adGroups/${adGroupId}`;

    const resource: Record<string, unknown> = { resource_name: resourceName };
    if (data.status) resource.status = data.status;
    if (data.name) resource.name = data.name;
    if (data.cpcBidMicros) resource.cpc_bid_micros = data.cpcBidMicros;

    return customer.mutateResources([
      { entity: 'ad_group', operation: 'update', resource },
    ]);
  }

  async deleteAdGroup(
    customerId: string,
    adGroupId: string,
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/adGroups/${adGroupId}`;
    return customer.adGroups.remove([resourceName]);
  }

  // ============ Keyword Operations ============

  async listKeywords(
    customerId: string,
    options?: { campaignId?: string; status?: string; limit?: number },
  ): Promise<unknown[]> {
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
    if (options?.campaignId)
      conditions.push(`campaign.id = ${options.campaignId}`);
    if (options?.status)
      conditions.push(`ad_group_criterion.status = '${options.status}'`);

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY metrics.impressions DESC';
    if (options?.limit) query += ` LIMIT ${options.limit}`;

    return this.query(customerId, query);
  }

  async addKeywords(
    customerId: string,
    adGroupId: string,
    keywords: Array<{ text: string; matchType?: string }>,
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const adGroupResourceName = `customers/${customerId}/adGroups/${adGroupId}`;

    const operations: MutateOperation<unknown>[] = keywords.map((keyword) => ({
      entity: 'ad_group_criterion',
      operation: 'create',
      resource: {
        ad_group: adGroupResourceName,
        keyword: {
          text: keyword.text,
          match_type: keyword.matchType || enums.KeywordMatchType.BROAD,
        },
        status: enums.AdGroupCriterionStatus.ENABLED,
      },
    }));

    return customer.mutateResources(operations);
  }

  async updateKeyword(
    customerId: string,
    adGroupId: string,
    criterionId: string,
    data: { status?: string; cpcBidMicros?: number },
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;

    const resource: Record<string, unknown> = { resource_name: resourceName };
    if (data.status) resource.status = data.status;
    if (data.cpcBidMicros) resource.cpc_bid_micros = data.cpcBidMicros;

    return customer.mutateResources([
      { entity: 'ad_group_criterion', operation: 'update', resource },
    ]);
  }

  async deleteKeyword(
    customerId: string,
    adGroupId: string,
    criterionId: string,
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;
    return customer.adGroupCriteria.remove([resourceName]);
  }

  // ============ Ad Operations ============

  async listAds(
    customerId: string,
    options?: {
      campaignId?: string;
      adGroupId?: string;
      status?: string;
      limit?: number;
    },
  ): Promise<unknown[]> {
    let query = `
      SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.ad.responsive_search_ad.path1,
        ad_group_ad.ad.responsive_search_ad.path2,
        ad_group_ad.status,
        ad_group_ad.policy_summary.approval_status,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM ad_group_ad
    `;

    const conditions: string[] = [];
    if (options?.campaignId)
      conditions.push(`campaign.id = ${options.campaignId}`);
    if (options?.adGroupId)
      conditions.push(`ad_group.id = ${options.adGroupId}`);
    if (options?.status)
      conditions.push(`ad_group_ad.status = '${options.status}'`);
    else conditions.push(`ad_group_ad.status != 'REMOVED'`);

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` LIMIT ${options?.limit || 100}`;

    return this.query(customerId, query);
  }

  async getAd(
    customerId: string,
    adGroupId: string,
    adId: string,
  ): Promise<unknown> {
    const query = `
      SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.ad.responsive_search_ad.path1,
        ad_group_ad.ad.responsive_search_ad.path2,
        ad_group_ad.status,
        ad_group_ad.policy_summary.approval_status,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM ad_group_ad
      WHERE ad_group.id = ${adGroupId} AND ad_group_ad.ad.id = ${adId}
    `;

    const results = await this.query(customerId, query);
    return results[0] || null;
  }

  async createAd(
    customerId: string,
    data: {
      adGroupId: string;
      headlines: string[];
      descriptions: string[];
      finalUrl: string;
      path1?: string;
      path2?: string;
      status?: string;
    },
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);

    return customer.mutateResources([
      {
        entity: 'ad_group_ad',
        operation: 'create',
        resource: {
          ad_group: `customers/${customerId}/adGroups/${data.adGroupId}`,
          status:
            data.status === 'ENABLED'
              ? enums.AdGroupAdStatus.ENABLED
              : enums.AdGroupAdStatus.PAUSED,
          ad: {
            responsive_search_ad: {
              headlines: data.headlines.map((text) => ({ text })),
              descriptions: data.descriptions.map((text) => ({ text })),
              path1: data.path1,
              path2: data.path2,
            },
            final_urls: [data.finalUrl],
          },
        },
      },
    ]);
  }

  async updateAd(
    customerId: string,
    adGroupId: string,
    adId: string,
    data: { status?: string },
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`;

    const resource: Record<string, unknown> = { resource_name: resourceName };
    if (data.status) resource.status = data.status;

    return customer.mutateResources([
      { entity: 'ad_group_ad', operation: 'update', resource },
    ]);
  }

  async deleteAd(
    customerId: string,
    adGroupId: string,
    adId: string,
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    const resourceName = `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`;
    return customer.adGroupAds.remove([resourceName]);
  }
}
