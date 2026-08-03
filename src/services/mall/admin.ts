import { request } from '@umijs/max';
import {
  adaptLoginResult,
  redirectToLoginIfAuthError,
} from '@/services/mall/adapters';
import { clearMallToken, getMallAuthorization, saveMallToken } from '@/services/mall/token';

/**
 * 后台用户 Service（依据 OpenAPI 3.0 规范 /admin/login、/admin/info、/admin/logout 生成）
 * 错误处理：业务错误（HTTP 200 + code!==200）与 401/403 均统一处理（C6）
 */

/** 登录 POST /admin/login；成功后自动保存 token 到 localStorage */
export async function mallLogin(
  params: API.MallLoginParams,
  options?: { [key: string]: any },
): Promise<API.MallLoginAdapted> {
  try {
    const res = await request<API.MallResult<API.MallTokenData | null>>(
      '/admin/login',
      {
        method: 'POST',
        data: params,
        // 业务错误由 adapter 层处理，跳过全局错误弹窗（C6）
        skipErrorHandler: true,
        ...(options || {}),
      },
    );
    const adapted = adaptLoginResult(res);
    if (adapted.status === 'ok' && adapted.token && adapted.tokenHead) {
      saveMallToken(adapted.token, adapted.tokenHead);
    }
    return adapted;
  } catch (err) {
    // HTTP 401/403 等鉴权类错误跳转登录页
    if (err && (err as { response?: { status?: number } }).response?.status === 401) {
      window.location.href = '/user/login';
    }
    throw err;
  }
}

/** 获取当前登录用户信息 GET /admin/info */
export async function mallGetAdminInfo(
  options?: { [key: string]: any },
): Promise<API.MallResult<API.MallAdminInfo | null>> {
  const auth = getMallAuthorization();
  try {
    return await request<API.MallResult<API.MallAdminInfo | null>>('/admin/info', {
      method: 'GET',
      headers: auth ? { Authorization: auth } : undefined,
      skipErrorHandler: true,
      ...(options || {}),
    });
  } catch (err) {
    if (
      err &&
      (err as { response?: { status?: number } }).response?.status === 401
    ) {
      clearMallToken();
      window.location.href = '/user/login';
    }
    throw err;
  }
}

/** 登出 POST /admin/logout */
export async function mallLogout(
  options?: { [key: string]: any },
): Promise<API.MallResult<null>> {
  const auth = getMallAuthorization();
  try {
    const res = await request<API.MallResult<null>>('/admin/logout', {
      method: 'POST',
      headers: auth ? { Authorization: auth } : undefined,
      skipErrorHandler: true,
      ...(options || {}),
    });
    clearMallToken();
    return res;
  } catch (err) {
    redirectToLoginIfAuthError(err);
    clearMallToken();
    throw err;
  }
}
