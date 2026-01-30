/**
 * Device Flow - OAuth2 设备授权流程
 *
 * 参考 optima-agent 实现，使用 Device Flow 进行登录
 */

import type {
  DeviceCodeResponse,
  TokenResponse,
  DeviceFlowCallbacks,
  Environment,
} from './auth-types.js';
import { ENV_CONFIG } from './auth-types.js';
import { saveToken, fetchUserInfo } from './token-store.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface DeviceFlowError {
  error: string;
  error_description?: string;
}

/**
 * 启动 Device Flow 登录
 */
export async function startDeviceFlow(
  env: Environment,
  callbacks: DeviceFlowCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const { authUrl, clientId } = ENV_CONFIG[env];

  // 1. 请求 device code
  const codeRes = await fetch(`${authUrl}/api/v1/oauth/device/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId }),
    signal,
  });

  if (!codeRes.ok) {
    const errorText = await codeRes.text();
    throw new Error(`Failed to get device code: ${codeRes.status} ${errorText}`);
  }

  const codeData = (await codeRes.json()) as DeviceCodeResponse;

  // 2. 通知 UI 显示 code（优先使用带 code 的完整 URL）
  const verificationUrl =
    codeData.verification_uri_complete || codeData.verification_uri;
  callbacks.onCodeReceived(codeData.user_code, verificationUrl);

  // 3. 轮询获取 token
  const pollInterval = (codeData.interval || 5) * 1000;
  const expiresAt = Date.now() + codeData.expires_in * 1000;

  while (Date.now() < expiresAt) {
    if (signal?.aborted) {
      throw new Error('Login cancelled');
    }

    callbacks.onPolling?.();

    await sleep(pollInterval);

    if (signal?.aborted) {
      throw new Error('Login cancelled');
    }

    const tokenRes = await fetch(`${authUrl}/api/v1/oauth/device/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        device_code: codeData.device_code,
        client_id: clientId,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
      signal,
    });

    // 解析响应
    let responseBody: string;
    try {
      responseBody = await tokenRes.text();
    } catch {
      responseBody = '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = JSON.parse(responseBody);
    } catch {
      callbacks.onError(`Invalid response: ${responseBody}`);
      return;
    }

    // 成功获取 token（有 access_token 且无 error）
    if (data.access_token && !data.error) {
      const tokenData = data as TokenResponse;

      // 获取用户信息
      let userInfo;
      try {
        userInfo = await fetchUserInfo(tokenData.access_token, env);
      } catch {
        // 用户信息获取失败不影响登录
      }

      // 保存 token
      saveToken(tokenData, env, userInfo);

      callbacks.onSuccess(userInfo || { id: '', email: '' });
      return;
    }

    // 处理错误响应
    const error = data as DeviceFlowError;

    // authorization_pending 是正常状态，继续轮询
    if (error.error === 'authorization_pending') {
      continue;
    }

    if (error.error === 'slow_down') {
      await sleep(5000); // 额外等待
      continue;
    }

    if (error.error === 'expired_token') {
      callbacks.onError('登录超时，请重试');
      return;
    }

    if (error.error === 'access_denied') {
      callbacks.onError('登录被拒绝');
      return;
    }

    // 其他错误，显示详情
    const errorMsg =
      error.error_description || error.error || `HTTP ${tokenRes.status}`;
    callbacks.onError(errorMsg);
    return;
  }

  callbacks.onError('登录超时');
}
