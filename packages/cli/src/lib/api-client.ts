/**
 * API Client - 调用 ads-backend REST API
 *
 * 使用 ~/.optima/token.json 中的 token，与 optima-agent 兼容
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { getToken, getAdsApiUrl } from './token-store.js';

export interface ApiClientConfig {
  baseUrl?: string;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config?: ApiClientConfig) {
    const baseUrl = config?.baseUrl || getAdsApiUrl();

    this.client = axios.create({
      baseURL: `${baseUrl}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw new Error(
            '未授权访问。请运行 `google-ads auth login` 登录。',
          );
        }
        const message =
          (error.response?.data as { message?: string })?.message ||
          error.message;
        throw new Error(message);
      },
    );
  }

  // ============ Auth ============

  async getAuthStatus(): Promise<{
    connected: boolean;
    accessibleCustomerIds: string[];
  }> {
    const { data } = await this.client.get('/auth/google-ads/status');
    return data;
  }

  getConnectUrl(): string {
    const baseUrl = getAdsApiUrl();
    return `${baseUrl}/api/v1/auth/google-ads/connect`;
  }

  async disconnect(): Promise<void> {
    await this.client.delete('/auth/google-ads/disconnect');
  }

  // ============ Accounts ============

  async listAccounts(): Promise<{ accounts: Array<{ customerId: string }> }> {
    const { data } = await this.client.get('/accounts');
    return data;
  }

  async getAccount(customerId: string): Promise<unknown> {
    const { data } = await this.client.get(`/accounts/${customerId}`);
    return data;
  }

  async checkAccount(
    customerId: string,
  ): Promise<{ connected: boolean; customerId: string; info?: unknown }> {
    const { data } = await this.client.get(`/accounts/${customerId}/check`);
    return data;
  }

  // ============ Campaigns ============

  async listCampaigns(
    customerId: string,
    options?: { status?: string; limit?: number },
  ): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', String(options.limit));

    const { data } = await this.client.get(
      `/customers/${customerId}/campaigns?${params}`,
    );
    return data;
  }

  async getCampaign(customerId: string, campaignId: string): Promise<unknown> {
    const { data } = await this.client.get(
      `/customers/${customerId}/campaigns/${campaignId}`,
    );
    return data;
  }

  async createCampaign(
    customerId: string,
    campaign: {
      name: string;
      budgetAmountMicros: number;
      advertisingChannelType?: string;
      status?: string;
    },
  ): Promise<unknown> {
    const { data } = await this.client.post(
      `/customers/${customerId}/campaigns`,
      campaign,
    );
    return data;
  }

  async updateCampaign(
    customerId: string,
    campaignId: string,
    update: { name?: string; status?: string; budgetAmountMicros?: number },
  ): Promise<unknown> {
    const { data } = await this.client.patch(
      `/customers/${customerId}/campaigns/${campaignId}`,
      update,
    );
    return data;
  }

  async deleteCampaign(
    customerId: string,
    campaignId: string,
  ): Promise<unknown> {
    const { data } = await this.client.delete(
      `/customers/${customerId}/campaigns/${campaignId}`,
    );
    return data;
  }

  // ============ Ad Groups ============

  async listAdGroups(
    customerId: string,
    options?: { campaignId?: string; status?: string; limit?: number },
  ): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (options?.campaignId) params.append('campaignId', options.campaignId);
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', String(options.limit));

    const { data } = await this.client.get(
      `/customers/${customerId}/ad-groups?${params}`,
    );
    return data;
  }

  async getAdGroup(customerId: string, adGroupId: string): Promise<unknown> {
    const { data } = await this.client.get(
      `/customers/${customerId}/ad-groups/${adGroupId}`,
    );
    return data;
  }

  async createAdGroup(
    customerId: string,
    adGroup: {
      name: string;
      campaignId: string;
      cpcBidMicros?: number;
      status?: string;
    },
  ): Promise<unknown> {
    const { data } = await this.client.post(
      `/customers/${customerId}/ad-groups`,
      adGroup,
    );
    return data;
  }

  async updateAdGroup(
    customerId: string,
    adGroupId: string,
    update: { name?: string; status?: string; cpcBidMicros?: number },
  ): Promise<unknown> {
    const { data } = await this.client.patch(
      `/customers/${customerId}/ad-groups/${adGroupId}`,
      update,
    );
    return data;
  }

  async deleteAdGroup(customerId: string, adGroupId: string): Promise<unknown> {
    const { data } = await this.client.delete(
      `/customers/${customerId}/ad-groups/${adGroupId}`,
    );
    return data;
  }

  // ============ Keywords ============

  async listKeywords(
    customerId: string,
    options?: { campaignId?: string; status?: string; limit?: number },
  ): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (options?.campaignId) params.append('campaignId', options.campaignId);
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', String(options.limit));

    const { data } = await this.client.get(
      `/customers/${customerId}/keywords?${params}`,
    );
    return data;
  }

  async addKeywords(
    customerId: string,
    adGroupId: string,
    keywords: Array<{ text: string; matchType?: string }>,
  ): Promise<unknown> {
    const { data } = await this.client.post(
      `/customers/${customerId}/keywords`,
      { adGroupId, keywords },
    );
    return data;
  }

  async updateKeyword(
    customerId: string,
    adGroupId: string,
    criterionId: string,
    update: { status?: string; cpcBidMicros?: number },
  ): Promise<unknown> {
    const { data } = await this.client.patch(
      `/customers/${customerId}/keywords/${adGroupId}/${criterionId}`,
      update,
    );
    return data;
  }

  async deleteKeyword(
    customerId: string,
    adGroupId: string,
    criterionId: string,
  ): Promise<unknown> {
    const { data } = await this.client.delete(
      `/customers/${customerId}/keywords/${adGroupId}/${criterionId}`,
    );
    return data;
  }

  // ============ Ads ============

  async listAds(
    customerId: string,
    options?: {
      campaignId?: string;
      adGroupId?: string;
      status?: string;
      limit?: number;
    },
  ): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (options?.campaignId) params.append('campaignId', options.campaignId);
    if (options?.adGroupId) params.append('adGroupId', options.adGroupId);
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', String(options.limit));

    const { data } = await this.client.get(
      `/customers/${customerId}/ads?${params}`,
    );
    return data;
  }

  async getAd(
    customerId: string,
    adGroupId: string,
    adId: string,
  ): Promise<unknown> {
    const { data } = await this.client.get(
      `/customers/${customerId}/ads/${adGroupId}/${adId}`,
    );
    return data;
  }

  async createAd(
    customerId: string,
    ad: {
      adGroupId: string;
      headlines: string[];
      descriptions: string[];
      finalUrl: string;
      path1?: string;
      path2?: string;
      status?: string;
    },
  ): Promise<unknown> {
    const { data } = await this.client.post(
      `/customers/${customerId}/ads`,
      ad,
    );
    return data;
  }

  async updateAd(
    customerId: string,
    adGroupId: string,
    adId: string,
    update: { status?: string },
  ): Promise<unknown> {
    const { data } = await this.client.patch(
      `/customers/${customerId}/ads/${adGroupId}/${adId}`,
      update,
    );
    return data;
  }

  async deleteAd(
    customerId: string,
    adGroupId: string,
    adId: string,
  ): Promise<unknown> {
    const { data } = await this.client.delete(
      `/customers/${customerId}/ads/${adGroupId}/${adId}`,
    );
    return data;
  }

  // ============ Query ============

  async query(customerId: string, gaqlQuery: string): Promise<unknown[]> {
    const { data } = await this.client.post(
      `/customers/${customerId}/query`,
      { query: gaqlQuery },
    );
    return data;
  }
}

// Singleton instance
let apiClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = new ApiClient();
  }
  return apiClient;
}
