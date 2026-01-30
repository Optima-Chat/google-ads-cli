import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleAdsApi,
  Customer,
  enums,
  MutateOperation,
  toMicros,
} from 'google-ads-api';
import {
  TargetingType,
  DeviceType,
  DayOfWeek,
  AgeRangeType,
  GenderType,
  IncomeRangeType,
  ParentalStatusType,
  ProximityRadiusUnits,
} from './targeting/targeting-types';

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
    try {
      return await customer.query(gaqlQuery);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
  }

  /**
   * Execute mutate operations with error handling
   */
  async mutate(
    customerId: string,
    operations: MutateOperation<unknown>[],
  ): Promise<unknown> {
    const customer = this.getCustomer(customerId);
    try {
      return await customer.mutateResources(operations);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
  }

  /**
   * Handle Google Ads API errors and convert to NestJS exceptions
   */
  private handleGoogleAdsError(error: unknown): never {
    const err = error as {
      errors?: Array<{ error_code?: Record<string, number>; message?: string }>;
      message?: string;
    };

    if (err.errors && err.errors.length > 0) {
      const firstError = err.errors[0];
      const errorCode = firstError.error_code || {};
      const message = firstError.message || 'Google Ads API error';

      // Authorization errors -> 403
      if ('authorization_error' in errorCode) {
        throw new ForbiddenException(message);
      }

      // Request errors -> 400
      if (
        'request_error' in errorCode ||
        'query_error' in errorCode ||
        'field_error' in errorCode
      ) {
        throw new BadRequestException(message);
      }

      // Other errors -> 500 with message
      throw new InternalServerErrorException(message);
    }

    // Fallback for non-standard errors
    throw new InternalServerErrorException(
      err.message || 'Unknown Google Ads API error',
    );
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
   * Get client link status from MCC perspective
   *
   * Status values (ManagerLinkStatus):
   * - 2: ACTIVE (已接受，可访问)
   * - 4: PENDING (已发邀请，待接受)
   * - 5: REFUSED (已拒绝)
   * - 6: CANCELED (已取消)
   */
  async getClientLinkStatus(
    customerId: string,
  ): Promise<{ status: string; managerLinkId?: string }> {
    const query = `
      SELECT
        customer_client_link.client_customer,
        customer_client_link.status,
        customer_client_link.manager_link_id
      FROM customer_client_link
      WHERE customer_client_link.client_customer = 'customers/${customerId}'
    `;

    try {
      // Query from MCC account perspective
      const results = await this.query(this.loginCustomerId, query);

      if (results.length === 0) {
        return { status: 'not_linked' };
      }

      const link = results[0] as {
        customer_client_link?: {
          status?: number;
          manager_link_id?: string;
        };
      };

      const statusCode = link.customer_client_link?.status;
      const managerLinkId = link.customer_client_link?.manager_link_id;

      // Map status code to string
      const statusMap: Record<number, string> = {
        2: 'active',
        4: 'pending',
        5: 'refused',
        6: 'canceled',
      };

      return {
        status: statusMap[statusCode as number] || 'unknown',
        managerLinkId,
      };
    } catch {
      // If query fails, the link doesn't exist
      return { status: 'not_linked' };
    }
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
        campaign_budget.amount_micros,
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
        campaign_budget.amount_micros,
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

    return this.mutate(customerId, operations);
  }

  async updateCampaign(
    customerId: string,
    campaignId: string,
    data: { status?: string; name?: string; budgetAmountMicros?: number },
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/campaigns/${campaignId}`;
    const resource: Record<string, unknown> = {};

    if (data.status) resource.status = data.status;
    if (data.name) resource.name = data.name;

    // Update budget if specified
    if (data.budgetAmountMicros) {
      const campaignQuery = `
        SELECT campaign.campaign_budget FROM campaign WHERE campaign.id = ${campaignId}
      `;
      const campaignResult = await this.query(customerId, campaignQuery);
      const budgetResourceName = (
        campaignResult[0] as Record<string, Record<string, string>>
      )?.campaign?.campaign_budget;

      if (budgetResourceName) {
        await this.mutate(customerId, [
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
      return this.mutate(customerId, [
        { entity: 'campaign', operation: 'update', resource },
      ]);
    }

    return { success: true };
  }

  async deleteCampaign(
    customerId: string,
    campaignId: string,
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/campaigns/${campaignId}`;
    try {
      const customer = this.getCustomer(customerId);
      return await customer.campaigns.remove([resourceName]);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
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
    const campaignResourceName = `customers/${customerId}/campaigns/${data.campaignId}`;

    return this.mutate(customerId, [
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
    const resourceName = `customers/${customerId}/adGroups/${adGroupId}`;

    const resource: Record<string, unknown> = { resource_name: resourceName };
    if (data.status) resource.status = data.status;
    if (data.name) resource.name = data.name;
    if (data.cpcBidMicros) resource.cpc_bid_micros = data.cpcBidMicros;

    return this.mutate(customerId, [
      { entity: 'ad_group', operation: 'update', resource },
    ]);
  }

  async deleteAdGroup(
    customerId: string,
    adGroupId: string,
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/adGroups/${adGroupId}`;
    try {
      const customer = this.getCustomer(customerId);
      return await customer.adGroups.remove([resourceName]);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
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

    return this.mutate(customerId, operations);
  }

  async updateKeyword(
    customerId: string,
    adGroupId: string,
    criterionId: string,
    data: { status?: string; cpcBidMicros?: number },
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;

    const resource: Record<string, unknown> = { resource_name: resourceName };
    if (data.status) resource.status = data.status;
    if (data.cpcBidMicros) resource.cpc_bid_micros = data.cpcBidMicros;

    return this.mutate(customerId, [
      { entity: 'ad_group_criterion', operation: 'update', resource },
    ]);
  }

  async deleteKeyword(
    customerId: string,
    adGroupId: string,
    criterionId: string,
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;
    try {
      const customer = this.getCustomer(customerId);
      return await customer.adGroupCriteria.remove([resourceName]);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
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
    return this.mutate(customerId, [
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
    const resourceName = `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`;

    const resource: Record<string, unknown> = { resource_name: resourceName };
    if (data.status) resource.status = data.status;

    return this.mutate(customerId, [
      { entity: 'ad_group_ad', operation: 'update', resource },
    ]);
  }

  async deleteAd(
    customerId: string,
    adGroupId: string,
    adId: string,
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`;
    try {
      const customer = this.getCustomer(customerId);
      return await customer.adGroupAds.remove([resourceName]);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
  }

  // ============ Campaign Targeting Operations ============

  /**
   * Query geo target constant names by IDs
   */
  async getGeoTargetConstantNames(
    customerId: string,
    geoTargetIds: string[],
  ): Promise<Map<string, string>> {
    if (geoTargetIds.length === 0) {
      return new Map();
    }

    const idsString = geoTargetIds.join(', ');
    const query = `
      SELECT
        geo_target_constant.id,
        geo_target_constant.name,
        geo_target_constant.country_code
      FROM geo_target_constant
      WHERE geo_target_constant.id IN (${idsString})
    `;

    const results = await this.query(customerId, query);
    const nameMap = new Map<string, string>();

    for (const row of results as Array<{
      geo_target_constant?: { id?: number; name?: string; country_code?: string };
    }>) {
      const id = row.geo_target_constant?.id;
      const name = row.geo_target_constant?.name;
      if (id !== undefined && name) {
        nameMap.set(String(id), name);
      }
    }

    return nameMap;
  }

  /**
   * List campaign targeting criteria
   */
  async listCampaignCriteria(
    customerId: string,
    campaignId: string,
  ): Promise<unknown[]> {
    const query = `
      SELECT
        campaign_criterion.criterion_id,
        campaign_criterion.type,
        campaign_criterion.status,
        campaign_criterion.negative,
        campaign_criterion.bid_modifier,
        campaign_criterion.location.geo_target_constant,
        campaign_criterion.proximity.geo_point.latitude_in_micro_degrees,
        campaign_criterion.proximity.geo_point.longitude_in_micro_degrees,
        campaign_criterion.proximity.radius,
        campaign_criterion.proximity.radius_units,
        campaign_criterion.device.type,
        campaign_criterion.ad_schedule.day_of_week,
        campaign_criterion.ad_schedule.start_hour,
        campaign_criterion.ad_schedule.start_minute,
        campaign_criterion.ad_schedule.end_hour,
        campaign_criterion.ad_schedule.end_minute,
        campaign_criterion.age_range.type,
        campaign_criterion.gender.type,
        campaign_criterion.income_range.type,
        campaign_criterion.parental_status.type,
        campaign_criterion.user_list.user_list
      FROM campaign_criterion
      WHERE campaign.id = ${campaignId}
    `;

    const results = await this.query(customerId, query);

    // Collect geo target constant IDs from location criteria
    const geoTargetIds: string[] = [];
    for (const row of results as Array<{
      campaign_criterion?: { location?: { geo_target_constant?: string } };
    }>) {
      const geoTargetConstant = row.campaign_criterion?.location?.geo_target_constant;
      if (geoTargetConstant) {
        // Extract ID from resource name like "geoTargetConstants/2840"
        const id = geoTargetConstant.split('/').pop();
        if (id) {
          geoTargetIds.push(id);
        }
      }
    }

    // Batch query geo target constant names
    const geoNameMap = await this.getGeoTargetConstantNames(customerId, geoTargetIds);

    // Enrich results with geo target constant names
    for (const row of results as Array<{
      campaign_criterion?: {
        location?: { geo_target_constant?: string; geo_target_constant_name?: string };
      };
    }>) {
      const geoTargetConstant = row.campaign_criterion?.location?.geo_target_constant;
      if (geoTargetConstant && row.campaign_criterion?.location) {
        const id = geoTargetConstant.split('/').pop();
        if (id) {
          row.campaign_criterion.location.geo_target_constant_name = geoNameMap.get(id);
        }
      }
    }

    return results;
  }

  /**
   * Add campaign targeting criterion
   */
  async addCampaignCriterion(
    customerId: string,
    campaignId: string,
    criterion: {
      type: TargetingType;
      geoTargetConstant?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
      radiusUnits?: ProximityRadiusUnits;
      device?: DeviceType;
      dayOfWeek?: DayOfWeek;
      startHour?: number;
      startMinute?: number;
      endHour?: number;
      endMinute?: number;
      ageRange?: AgeRangeType;
      gender?: GenderType;
      incomeRange?: IncomeRangeType;
      parentalStatus?: ParentalStatusType;
      userListId?: string;
      negative?: boolean;
      bidModifier?: number;
    },
  ): Promise<unknown> {
    const campaignResourceName = `customers/${customerId}/campaigns/${campaignId}`;
    const resource: Record<string, unknown> = {
      campaign: campaignResourceName,
      negative: criterion.negative || false,
    };

    if (criterion.bidModifier !== undefined) {
      resource.bid_modifier = criterion.bidModifier;
    }

    // Build criterion based on type
    switch (criterion.type) {
      case TargetingType.LOCATION:
        resource.location = {
          geo_target_constant: `geoTargetConstants/${criterion.geoTargetConstant}`,
        };
        break;

      case TargetingType.PROXIMITY:
        resource.proximity = {
          geo_point: {
            latitude_in_micro_degrees: Math.round(
              (criterion.latitude || 0) * 1000000,
            ),
            longitude_in_micro_degrees: Math.round(
              (criterion.longitude || 0) * 1000000,
            ),
          },
          radius: criterion.radius,
          radius_units:
            criterion.radiusUnits === ProximityRadiusUnits.KILOMETERS
              ? enums.ProximityRadiusUnits.KILOMETERS
              : enums.ProximityRadiusUnits.MILES,
        };
        break;

      case TargetingType.DEVICE:
        resource.device = {
          type: this.mapDeviceType(criterion.device),
        };
        break;

      case TargetingType.SCHEDULE:
        resource.ad_schedule = {
          day_of_week: this.mapDayOfWeek(criterion.dayOfWeek),
          start_hour: criterion.startHour,
          start_minute: this.mapMinute(criterion.startMinute),
          end_hour: criterion.endHour,
          end_minute: this.mapMinute(criterion.endMinute),
        };
        break;

      case TargetingType.AGE_RANGE:
        resource.age_range = {
          type: this.mapAgeRangeType(criterion.ageRange),
        };
        break;

      case TargetingType.GENDER:
        resource.gender = {
          type: this.mapGenderType(criterion.gender),
        };
        break;

      case TargetingType.INCOME_RANGE:
        resource.income_range = {
          type: this.mapIncomeRangeType(criterion.incomeRange),
        };
        break;

      case TargetingType.PARENTAL_STATUS:
        resource.parental_status = {
          type: this.mapParentalStatusType(criterion.parentalStatus),
        };
        break;

      case TargetingType.USER_LIST:
        resource.user_list = {
          user_list: `customers/${customerId}/userLists/${criterion.userListId}`,
        };
        break;
    }

    return this.mutate(customerId, [
      {
        entity: 'campaign_criterion',
        operation: 'create',
        resource,
      },
    ]);
  }

  /**
   * Remove campaign targeting criterion
   */
  async removeCampaignCriterion(
    customerId: string,
    campaignId: string,
    criterionId: string,
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/campaignCriteria/${campaignId}~${criterionId}`;
    try {
      const customer = this.getCustomer(customerId);
      return await customer.campaignCriteria.remove([resourceName]);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
  }

  // ============ Ad Group Targeting Operations ============

  /**
   * List ad group targeting criteria (excluding keywords)
   */
  async listAdGroupCriteria(
    customerId: string,
    adGroupId: string,
  ): Promise<unknown[]> {
    const query = `
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.type,
        ad_group_criterion.status,
        ad_group_criterion.negative,
        ad_group_criterion.bid_modifier,
        ad_group_criterion.age_range.type,
        ad_group_criterion.gender.type,
        ad_group_criterion.income_range.type,
        ad_group_criterion.parental_status.type,
        ad_group_criterion.user_list.user_list
      FROM ad_group_criterion
      WHERE ad_group.id = ${adGroupId}
        AND ad_group_criterion.type IN (
          'AGE_RANGE',
          'GENDER',
          'INCOME_RANGE',
          'PARENTAL_STATUS',
          'USER_LIST',
          'CUSTOM_AUDIENCE',
          'COMBINED_AUDIENCE'
        )
    `;

    return this.query(customerId, query);
  }

  /**
   * Add ad group targeting criterion
   */
  async addAdGroupCriterion(
    customerId: string,
    adGroupId: string,
    criterion: {
      type: TargetingType;
      ageRange?: AgeRangeType;
      gender?: GenderType;
      incomeRange?: IncomeRangeType;
      parentalStatus?: ParentalStatusType;
      userListId?: string;
      negative?: boolean;
      bidModifier?: number;
    },
  ): Promise<unknown> {
    const adGroupResourceName = `customers/${customerId}/adGroups/${adGroupId}`;
    const resource: Record<string, unknown> = {
      ad_group: adGroupResourceName,
      negative: criterion.negative || false,
      status: enums.AdGroupCriterionStatus.ENABLED,
    };

    if (criterion.bidModifier !== undefined) {
      resource.bid_modifier = criterion.bidModifier;
    }

    // Build criterion based on type
    switch (criterion.type) {
      case TargetingType.AGE_RANGE:
        resource.age_range = {
          type: this.mapAgeRangeType(criterion.ageRange),
        };
        break;

      case TargetingType.GENDER:
        resource.gender = {
          type: this.mapGenderType(criterion.gender),
        };
        break;

      case TargetingType.INCOME_RANGE:
        resource.income_range = {
          type: this.mapIncomeRangeType(criterion.incomeRange),
        };
        break;

      case TargetingType.PARENTAL_STATUS:
        resource.parental_status = {
          type: this.mapParentalStatusType(criterion.parentalStatus),
        };
        break;

      case TargetingType.USER_LIST:
        resource.user_list = {
          user_list: `customers/${customerId}/userLists/${criterion.userListId}`,
        };
        break;
    }

    return this.mutate(customerId, [
      {
        entity: 'ad_group_criterion',
        operation: 'create',
        resource,
      },
    ]);
  }

  /**
   * Remove ad group targeting criterion
   */
  async removeAdGroupCriterion(
    customerId: string,
    adGroupId: string,
    criterionId: string,
  ): Promise<unknown> {
    const resourceName = `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;
    try {
      const customer = this.getCustomer(customerId);
      return await customer.adGroupCriteria.remove([resourceName]);
    } catch (error) {
      this.handleGoogleAdsError(error);
    }
  }

  // ============ Helper Methods for Enum Mapping ============

  private mapDeviceType(device?: DeviceType): number {
    const map: Record<DeviceType, number> = {
      [DeviceType.MOBILE]: enums.Device.MOBILE,
      [DeviceType.DESKTOP]: enums.Device.DESKTOP,
      [DeviceType.TABLET]: enums.Device.TABLET,
      [DeviceType.CONNECTED_TV]: enums.Device.CONNECTED_TV,
    };
    return device ? map[device] : enums.Device.UNSPECIFIED;
  }

  private mapDayOfWeek(day?: DayOfWeek): number {
    const map: Record<DayOfWeek, number> = {
      [DayOfWeek.MONDAY]: enums.DayOfWeek.MONDAY,
      [DayOfWeek.TUESDAY]: enums.DayOfWeek.TUESDAY,
      [DayOfWeek.WEDNESDAY]: enums.DayOfWeek.WEDNESDAY,
      [DayOfWeek.THURSDAY]: enums.DayOfWeek.THURSDAY,
      [DayOfWeek.FRIDAY]: enums.DayOfWeek.FRIDAY,
      [DayOfWeek.SATURDAY]: enums.DayOfWeek.SATURDAY,
      [DayOfWeek.SUNDAY]: enums.DayOfWeek.SUNDAY,
    };
    return day ? map[day] : enums.DayOfWeek.UNSPECIFIED;
  }

  private mapMinute(minute?: number): number {
    const map: Record<number, number> = {
      0: enums.MinuteOfHour.ZERO,
      15: enums.MinuteOfHour.FIFTEEN,
      30: enums.MinuteOfHour.THIRTY,
      45: enums.MinuteOfHour.FORTY_FIVE,
    };
    return minute !== undefined ? (map[minute] ?? enums.MinuteOfHour.ZERO) : enums.MinuteOfHour.ZERO;
  }

  private mapAgeRangeType(ageRange?: AgeRangeType): number {
    const map: Record<AgeRangeType, number> = {
      [AgeRangeType.AGE_RANGE_18_24]: enums.AgeRangeType.AGE_RANGE_18_24,
      [AgeRangeType.AGE_RANGE_25_34]: enums.AgeRangeType.AGE_RANGE_25_34,
      [AgeRangeType.AGE_RANGE_35_44]: enums.AgeRangeType.AGE_RANGE_35_44,
      [AgeRangeType.AGE_RANGE_45_54]: enums.AgeRangeType.AGE_RANGE_45_54,
      [AgeRangeType.AGE_RANGE_55_64]: enums.AgeRangeType.AGE_RANGE_55_64,
      [AgeRangeType.AGE_RANGE_65_UP]: enums.AgeRangeType.AGE_RANGE_65_UP,
      [AgeRangeType.AGE_RANGE_UNDETERMINED]:
        enums.AgeRangeType.AGE_RANGE_UNDETERMINED,
    };
    return ageRange ? map[ageRange] : enums.AgeRangeType.UNSPECIFIED;
  }

  private mapGenderType(gender?: GenderType): number {
    const map: Record<GenderType, number> = {
      [GenderType.MALE]: enums.GenderType.MALE,
      [GenderType.FEMALE]: enums.GenderType.FEMALE,
      [GenderType.UNDETERMINED]: enums.GenderType.UNDETERMINED,
    };
    return gender ? map[gender] : enums.GenderType.UNSPECIFIED;
  }

  private mapIncomeRangeType(incomeRange?: IncomeRangeType): number {
    const map: Record<IncomeRangeType, number> = {
      [IncomeRangeType.INCOME_RANGE_0_50]:
        enums.IncomeRangeType.INCOME_RANGE_0_50,
      [IncomeRangeType.INCOME_RANGE_50_60]:
        enums.IncomeRangeType.INCOME_RANGE_50_60,
      [IncomeRangeType.INCOME_RANGE_60_70]:
        enums.IncomeRangeType.INCOME_RANGE_60_70,
      [IncomeRangeType.INCOME_RANGE_70_80]:
        enums.IncomeRangeType.INCOME_RANGE_70_80,
      [IncomeRangeType.INCOME_RANGE_80_90]:
        enums.IncomeRangeType.INCOME_RANGE_80_90,
      [IncomeRangeType.INCOME_RANGE_90_UP]:
        enums.IncomeRangeType.INCOME_RANGE_90_UP,
      [IncomeRangeType.INCOME_RANGE_UNDETERMINED]:
        enums.IncomeRangeType.INCOME_RANGE_UNDETERMINED,
    };
    return incomeRange ? map[incomeRange] : enums.IncomeRangeType.UNSPECIFIED;
  }

  private mapParentalStatusType(parentalStatus?: ParentalStatusType): number {
    const map: Record<ParentalStatusType, number> = {
      [ParentalStatusType.PARENT]: enums.ParentalStatusType.PARENT,
      [ParentalStatusType.NOT_A_PARENT]: enums.ParentalStatusType.NOT_A_PARENT,
      [ParentalStatusType.UNDETERMINED]: enums.ParentalStatusType.UNDETERMINED,
    };
    return parentalStatus
      ? map[parentalStatus]
      : enums.ParentalStatusType.UNSPECIFIED;
  }
}
