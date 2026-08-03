import { request } from '@umijs/max';
import {
  adaptProductPage,
  redirectToLoginIfAuthError,
} from '@/services/mall/adapters';
import { getMallAuthorization } from '@/services/mall/token';

/**
 * 商品管理 Service（依据 OpenAPI 3.0 规范 /product/list 生成）
 * token 注入：请求头 Authorization: Bearer <token>（C6）
 * 错误处理：业务错误（code!==200）抛 MallBizError；401/403 跳转登录页
 */

/** 查询商品分页 GET /product/list（返回 ProTable request 可直接消费的结构） */
export async function getMallProductList(
  params: API.MallProductQueryParams,
  options?: { [key: string]: any },
): Promise<API.MallProductPageAdapted> {
  const auth = getMallAuthorization();
  try {
    const res = await request<API.MallResult<API.MallProductPage>>(
      '/product/list',
      {
        method: 'GET',
        params: {
          ...params,
        },
        // 未登录时直接透传 401 语义（不走全局 errorHandler 弹窗）
        headers: auth ? { Authorization: auth } : undefined,
        skipErrorHandler: true,
        ...(options || {}),
      },
    );
    // C1 响应包装解包 + C4 字段拼写 + C5 日期转换
    return adaptProductPage(res);
  } catch (err) {
    // C6: 401/403 跳转登录页
    redirectToLoginIfAuthError(err);
    throw err;
  }
}
