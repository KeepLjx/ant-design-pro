// 由 mall-admin.openapi.yaml（OpenAPI 3.0）手工对齐生成的类型定义。
// 与后端真实返回（{code,message,data} 信封）严格一致。
export declare namespace MallAPI {
  // ================= 后端真实返回结构（勿改） =================

  /** 统一响应信封：code=200 成功；401 未登录；404 参数校验失败；500 业务/系统失败 */
  interface CommonResult<T = unknown> {
    code: number;
    message: string;
    data: T | null;
  }

  /** 后端分页信封：pageNum/pageSize/totalPage/total/list */
  interface CommonPage<T = unknown> {
    pageNum: number;
    pageSize: number;
    totalPage: number;
    total: number;
    list: T[];
  }

  /** /admin/login 返回的 token（tokenHead 为 Authorization 头前缀，通常为 "Bearer "） */
  interface LoginToken {
    token: string;
    tokenHead: string;
  }

  /** /admin/info 返回的当前登录用户信息 */
  interface AdminInfo {
    username: string;
    menus: string[];
    icon?: string;
    roles: string[];
  }

  /** ums_admin 表模型 */
  interface UmsAdmin {
    id?: number;
    username?: string;
    password?: string;
    icon?: string;
    email?: string;
    nickName?: string;
    note?: string;
    createTime?: string;
    loginTime?: string;
    status?: number;
  }

  /** /admin/login 请求体 */
  interface UmsAdminLoginParam {
    username: string;
    password: string;
  }

  /** /admin/register 请求体 */
  interface UmsAdminParam extends UmsAdmin {
    username: string;
    password: string;
  }

  /** /product/list 查询参数（query 透传） */
  interface PmsProductQueryParam {
    keyword?: string;
    pageNum?: number;
    pageSize?: number;
    publishStatus?: number;
    verifyStatus?: number;
    productSn?: string;
    productCategoryId?: number;
    brandId?: number;
  }

  /**
   * 后端 PmsProduct 模型（与 OpenAPI 规范逐字段对齐）。
   * 注意：后端字段名为 recommandStatus（拼写错误，业务语义为「推荐状态」），
   *      前端统一通过 adapter 暴露为 recommendStatus。
   */
  interface PmsProduct {
    id?: number;
    brandId?: number;
    productCategoryId?: number;
    feightTemplateId?: number;
    productAttributeCategoryId?: number;
    name?: string;
    pic?: string;
    productSn?: string;
    deleteStatus?: number;
    publishStatus?: number;
    newStatus?: number;
    /** 后端拼写错误字段（应拼写为 recommendStatus） */
    recommandStatus?: number;
    verifyStatus?: number;
    sort?: number;
    sale?: number;
    /** BigDecimal -> JSON number */
    price?: number;
    /** BigDecimal -> JSON number */
    promotionPrice?: number;
    giftGrowth?: number;
    giftPoint?: number;
    usePointLimit?: number;
    subTitle?: string;
    /** BigDecimal -> JSON number */
    originalPrice?: number;
    stock?: number;
    lowStock?: number;
    unit?: string;
    /** BigDecimal -> JSON number */
    weight?: number;
    previewStatus?: number;
    serviceIds?: string;
    keywords?: string;
    note?: string;
    albumPics?: string;
    detailTitle?: string;
    promotionStartTime?: string;
    promotionEndTime?: string;
    promotionPerLimit?: number;
    promotionType?: number;
    brandName?: string;
    productCategoryName?: string;
    description?: string;
    detailDesc?: string;
    detailHtml?: string;
    detailMobileHtml?: string;
  }

  // ================= 前端 Pro 侧类型（adapter 转换后，页面直接使用） =================

  /**
   * 规范化商品：adapter 转换后的形态。
   * - id：雪花 Long 可能超过 JS Number.MAX_SAFE_INTEGER，统一转为 string|number 保精度
   * - price/originalPrice/weight 等 BigDecimal 统一归一为 number
   * - recommandStatus 修复拼写为 recommendStatus
   */
  type Product = Omit<
    MallAPI.PmsProduct,
    | 'id'
    | 'price'
    | 'promotionPrice'
    | 'originalPrice'
    | 'weight'
    | 'recommandStatus'
  > & {
    id: string | number;
    price?: number;
    promotionPrice?: number;
    originalPrice?: number;
    weight?: number;
    recommendStatus?: number;
  };

  /** ProTable 兼容的分页数据（E1-1-4：pageNum->current，list->data） */
  interface PageData<T> {
    data: T[];
    total: number;
    current: number;
    pageSize: number;
    success: boolean;
  }

  /** 登录页可用的 Pro 登录结果（E1-1-2：status==='ok' 判定） */
  interface ProLoginResult {
    status: 'ok' | 'error';
    type: 'account';
    token?: string;
    tokenHead?: string;
    message?: string;
  }

  /** layout 可用的当前用户（兼容 API.CurrentUser 结构） */
  interface ProCurrentUser {
    name: string;
    avatar?: string;
    userid: string;
    roles: string[];
    menus: string[];
    access: string;
  }
}
