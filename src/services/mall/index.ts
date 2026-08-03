/**
 * mall 后端 service 层（依据 mall-admin.openapi.yaml 生成）。
 *
 * - 统一响应信封为 CommonResult{code,message,data}（code=200 成功），与 ant-design-pro
 *   模板的 {success,data,...} 信封不一致，故所有请求 skipErrorHandler 后在此自行解析；
 * - token 注入由 src/requestErrorConfig.ts 的请求拦截器统一完成（E1-1-3）；
 * - 返回前经 adapter.ts 转换（E1-1 六处），页面直接消费 Pro 侧结构。
 */
import { request } from '@umijs/max';
import {
  clearToken,
  toProCurrentUser,
  toProLoginResult,
  toProPageData,
  toProducts,
} from './adapter';
import type { MallAPI } from './typings';

interface MallRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  data?: unknown;
}

/**
 * 统一请求封装：
 * 1. skipErrorHandler 跳过全局 errorThrower（其期望 {success,...} 信封，后端不满足）；
 * 2. HTTP 非 2xx 时尝试从错误响应中还原后端 {code,message,data} 信封；
 * 3. 其余异常原样抛出。
 */
async function mallRequest<T>(
  url: string,
  options: MallRequestOptions = {},
): Promise<MallAPI.CommonResult<T>> {
  try {
    return await request<MallAPI.CommonResult<T>>(url, {
      skipErrorHandler: true,
      ...options,
    });
  } catch (err) {
    // umi-request 对 4xx/5xx 会 reject：可能是 ResponseError（.response）或 Response
    const response = (err as { response?: Response })?.response ??
      (err instanceof Response ? err : undefined);
    if (response) {
      try {
        const body = (await response.json()) as MallAPI.CommonResult<T>;
        if (body && typeof body.code === 'number') {
          return body;
        }
      } catch {
        // 响应体不是 JSON 时忽略，继续抛原始错误
      }
    }
    throw err;
  }
}

/** 登录：POST /admin/login（返回 Pro 登录结果，成功后 token 已持久化） */
export async function login(
  params: MallAPI.UmsAdminLoginParam,
): Promise<MallAPI.ProLoginResult> {
  const res = await mallRequest<MallAPI.LoginToken>('/admin/login', {
    method: 'POST',
    data: params,
  });
  return toProLoginResult(res);
}

/** 当前登录用户信息：GET /admin/info（未登录/失败返回 undefined） */
export async function getAdminInfo(): Promise<MallAPI.ProCurrentUser | undefined> {
  const res = await mallRequest<MallAPI.AdminInfo>('/admin/info', { method: 'GET' });
  return toProCurrentUser(res);
}

/** 登出：POST /admin/logout（无论后端结果如何都清除本地 token） */
export async function logout(): Promise<void> {
  try {
    await mallRequest<null>('/admin/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

/** 商品分页列表：GET /product/list（ProTable 直接可用的分页数据） */
export async function queryProductList(
  params: MallAPI.PmsProductQueryParam = {},
): Promise<MallAPI.PageData<MallAPI.Product>> {
  const res = await mallRequest<MallAPI.CommonPage<MallAPI.PmsProduct>>('/product/list', {
    method: 'GET',
    params,
  });
  const pageData = toProPageData(res);
  return {
    ...pageData,
    data: toProducts(pageData.data),
  };
}

/** 获取全部商品（不分页）：GET /product/simpleList */
export async function querySimpleProductList(): Promise<MallAPI.Product[]> {
  const res = await mallRequest<MallAPI.PmsProduct[]>('/product/simpleList', {
    method: 'GET',
  });
  return toProducts(res.data ?? []);
}

/** 创建商品：POST /product/create */
export async function createProduct(
  params: MallAPI.PmsProduct,
): Promise<MallAPI.Product | undefined> {
  const res = await mallRequest<MallAPI.PmsProduct>('/product/create', {
    method: 'POST',
    data: params,
  });
  return res.data ? toProducts([res.data])[0] : undefined;
}
