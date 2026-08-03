import dayjs from 'dayjs';

/**
 * ============================================================
 * mall 后端 <-> ant-design-pro 前端契约冲突 adapter 层
 * （E1-1 冲突清单 6 项，全部在 adapter 层解决，不修改后端）
 *   C1 响应包装：后端 { code, message, data } vs 前端 { success, data, total }
 *   C2 分页参数：后端 pageNum vs 前端 ProTable current
 *   C3 登录结果：后端 data:{token,tokenHead}+code vs 前端 status==='ok'
 *   C4 字段拼写：后端 recommandStatus vs 前端规范 recommendStatus
 *   C5 日期格式：后端 ISO-8601 UTC 字符串 vs 前端本地时间展示
 *   C6 错误与鉴权：后端业务错误 HTTP 200 + code!=200；401/403 语义 vs 前端统一错误处理
 * ============================================================
 */

const SUCCESS_CODE = 200;

/** 业务错误类：后端 code !== 200 时抛出（对应 C6） */
export class MallBizError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'MallBizError';
    this.code = code;
  }
}

/** C6-1: 校验后端统一包装，code !== 200 抛 MallBizError，成功返回 data */
export function unwrapMallResult<T>(res: API.MallResult<T>): T {
  if (res == null || typeof res !== 'object') {
    throw new MallBizError(-1, '响应格式异常');
  }
  if (res.code !== SUCCESS_CODE) {
    throw new MallBizError(res.code, res.message || `请求失败（code=${res.code}）`);
  }
  return res.data;
}

/** C6-2: 401/403 时跳转登录页 */
export function redirectToLoginIfAuthError(err: unknown): void {
  if (
    err instanceof MallBizError &&
    (err.code === 401 || err.code === 403)
  ) {
    const redirect = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/user/login?redirect=${redirect}`;
  }
}

/** C3: 登录响应 → 前端登录页约定 { status: 'ok' | 'error' } */
export function adaptLoginResult(
  res: API.MallResult<API.MallTokenData | null>,
): API.MallLoginAdapted {
  if (res.code === SUCCESS_CODE && res.data?.token) {
    return {
      status: 'ok',
      code: res.code,
      message: res.message,
      token: res.data.token,
      tokenHead: res.data.tokenHead,
    };
  }
  return {
    status: 'error',
    code: res.code,
    message: res.message || '登录失败',
  };
}

/** C2: ProTable 分页参数 { current, pageSize } → 后端 { pageNum, pageSize } */
export function adaptProductQueryParams(params: {
  current?: number;
  pageSize?: number;
  keyword?: string;
  productSn?: string;
  publishStatus?: number;
  verifyStatus?: number;
  productCategoryId?: number;
  brandId?: number;
}): API.MallProductQueryParams {
  return {
    pageNum: params.current ?? 1,
    pageSize: params.pageSize ?? 5,
    keyword: params.keyword,
    productSn: params.productSn,
    publishStatus: params.publishStatus,
    verifyStatus: params.verifyStatus,
    productCategoryId: params.productCategoryId,
    brandId: params.brandId,
  };
}

/** C5: ISO-8601 UTC 字符串 → 本地时间字符串（dayjs），空值保持 undefined */
function adaptDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : value;
}

/** C4+C5: 单条商品：补充 recommendStatus 规范字段 + 时间本地化 */
export function adaptProductItem(item: API.MallProductItem): API.MallProductItem & {
  recommendStatus?: number;
  promotionStartTimeText?: string;
  promotionEndTimeText?: string;
} {
  return {
    ...item,
    // C4: 后端拼写 recommandStatus → 前端规范 recommendStatus（保留原字段）
    recommendStatus: item.recommandStatus,
    // C5: 时间字段本地化展示文本
    promotionStartTimeText: adaptDateTime(item.promotionStartTime),
    promotionEndTimeText: adaptDateTime(item.promotionEndTime),
  };
}

/** C1+C4+C5: 商品分页响应 → ProTable request 返回值 { data, total, success } */
export function adaptProductPage(
  res: API.MallResult<API.MallProductPage>,
): API.MallProductPageAdapted {
  const page = unwrapMallResult(res);
  const list = Array.isArray(page.list) ? page.list : [];
  return {
    data: list.map(adaptProductItem),
    total: page.total ?? 0,
    success: res.code === SUCCESS_CODE,
  };
}
