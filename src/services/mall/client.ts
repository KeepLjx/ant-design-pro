// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/**
 * mall-admin 请求客户端
 * - token 注入：登录成功后由 saveMallAuth 持久化，所有请求自动携带 Authorization 头
 * - 错误处理：解包后端 { code, message, data }，code !== 200 抛出 MallBizError；
 *   同时 skipErrorHandler 避免与 pro 全局 errorHandler 重复提示
 */

const TOKEN_KEY = 'mall_admin_token';
const TOKEN_HEAD_KEY = 'mall_admin_token_head';

export interface MallAuth {
  token: string;
  tokenHead: string;
}

export function getMallAuth(): MallAuth | null {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  return {
    token,
    tokenHead: window.localStorage.getItem(TOKEN_HEAD_KEY) ?? '',
  };
}

export function saveMallAuth(auth: MallAuth): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, auth.token);
  window.localStorage.setItem(TOKEN_HEAD_KEY, auth.tokenHead);
}

export function clearMallAuth(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_HEAD_KEY);
}

/** mall 业务错误（code !== 200）或 HTTP 错误 */
export class MallBizError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'MallBizError';
    this.code = code;
  }
}

/**
 * 统一请求入口：携带 token、解包 CommonResult、业务错误抛出 MallBizError
 */
export async function mallRequest<T>(
  url: string,
  options: { [key: string]: any } = {},
): Promise<T> {
  const auth = getMallAuth();
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };
  if (auth) {
    headers.Authorization = `${auth.tokenHead}${auth.token}`;
  }
  try {
    const res = await request<Mall.CommonResult<T>>(url, {
      method: 'GET',
      ...options,
      headers,
      skipErrorHandler: true,
    });
    if (res?.code === 200) {
      return res.data;
    }
    throw new MallBizError(res?.code ?? -1, res?.message || '请求失败');
  } catch (e) {
    if (e instanceof MallBizError) throw e;
    // HTTP 层错误（如 401/500），给出可读信息
    const status = (e as any)?.response?.status;
    throw new MallBizError(
      status ?? -1,
      status ? `请求失败（HTTP ${status}）` : '网络异常，请稍后重试',
    );
  }
}
