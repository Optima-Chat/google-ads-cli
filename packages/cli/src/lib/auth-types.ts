/**
 * Auth Types - 认证相关类型定义
 */

/**
 * 环境类型
 */
export type Environment = 'ci' | 'stage' | 'prod';

/**
 * 环境配置
 */
export const ENV_CONFIG: Record<
  Environment,
  { authUrl: string; clientId: string; adsApiUrl: string }
> = {
  ci: {
    authUrl: 'https://auth.optima.chat',
    clientId: 'google-ads-cli-dev',
    adsApiUrl: 'https://ads-api.optima.onl', // CI 环境用 prod API
  },
  stage: {
    authUrl: 'https://auth.stage.optima.onl',
    clientId: 'google-ads-cli-stage',
    adsApiUrl: 'https://ads-api.stage.optima.onl',
  },
  prod: {
    authUrl: 'https://auth.optima.onl',
    clientId: 'google-ads-cli-prod',
    adsApiUrl: 'https://ads-api.optima.onl',
  },
};

/**
 * Device Code 响应
 */
export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval: number;
}

/**
 * Token 响应
 */
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

/**
 * 存储的 Token 数据
 */
export interface TokenData {
  env: Environment;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: number;
  user?: UserInfo;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

/**
 * Device Flow 回调
 */
export interface DeviceFlowCallbacks {
  onCodeReceived: (code: string, uri: string) => void;
  onPolling?: () => void;
  onSuccess: (user: UserInfo) => void;
  onError: (error: string) => void;
}

/**
 * 认证状态
 */
export interface AuthStatus {
  loggedIn: boolean;
  env?: Environment;
  user?: UserInfo;
  expiresAt?: number;
}
