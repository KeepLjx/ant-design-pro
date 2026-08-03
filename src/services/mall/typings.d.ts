// @ts-ignore
/* eslint-disable */
/**
 * mall-admin OpenAPI 生成的 TS 类型（openapi/mall-admin.openapi.yaml）
 * 覆盖：/admin/login、/admin/info、/product/list
 * 说明：后端统一返回 { code, message, data }，前端经 adapter（./adapter.ts）转换为
 *       ant-design-pro 约定的 { success, data, errorMessage } 结构。
 */

declare namespace Mall {
  // ==================== 后端原始类型（OpenAPI schema） ====================

  /** 后端统一返回包装：code=200 表示成功 */
  interface CommonResult<T = unknown> {
    code: number;
    message: string;
    data: T;
  }

  /** 用户登录参数 POST /admin/login */
  interface LoginParams {
    username: string;
    password: string;
  }

  /** 登录成功返回的 token 信息 */
  interface LoginToken {
    tokenHead: string;
    token: string;
  }

  /** 后台菜单节点 */
  interface MenuNode {
    id?: number;
    parentId?: number;
    createTime?: string;
    title?: string;
    level?: number;
    sort?: number;
    name?: string;
    icon?: string;
    hidden?: number;
  }

  /** 当前登录用户信息 GET /admin/info */
  interface AdminInfo {
    username?: string;
    menus?: MenuNode[];
    icon?: string;
    roles?: string[];
  }

  /** 商品查询参数 GET /product/list */
  interface ProductQueryParams {
    publishStatus?: number;
    verifyStatus?: number;
    keyword?: string;
    productSn?: string;
    productCategoryId?: number;
    brandId?: number;
    pageNum?: number;
    pageSize?: number;
  }

  /** 商品信息（PmsProduct） */
  interface Product {
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
    recommandStatus?: number;
    verifyStatus?: number;
    sort?: number;
    sale?: number;
    price?: number;
    promotionPrice?: number | null;
    giftGrowth?: number;
    giftPoint?: number;
    usePointLimit?: number;
    subTitle?: string;
    originalPrice?: number;
    stock?: number;
    lowStock?: number;
    unit?: string;
    weight?: number;
    previewStatus?: number;
    serviceIds?: string;
    keywords?: string;
    note?: string;
    albumPics?: string;
    detailTitle?: string;
    promotionStartTime?: string | null;
    promotionEndTime?: string | null;
    promotionPerLimit?: number;
    promotionType?: number;
    brandName?: string;
    productCategoryName?: string;
    description?: string | null;
    detailDesc?: string | null;
    detailHtml?: string | null;
    detailMobileHtml?: string | null;
  }

  /** 通用分页数据封装（CommonPage<PmsProduct>） */
  interface ProductPageData {
    pageNum?: number;
    pageSize?: number;
    totalPage?: number;
    total?: number;
    list?: Product[];
  }

  // ==================== adapter 转换后的前端类型（ant-design-pro 约定） ====================

  /** 登录结果（ant-design-pro LoginResult 约定：status=ok 登录成功） */
  interface LoginResult {
    status: 'ok' | 'error';
    type?: string;
    currentAuthority?: string;
    /** 后端返回的原始 token 信息（供持久化后注入请求头） */
    token?: string;
    tokenHead?: string;
  }

  /** 当前登录用户（ant-design-pro CurrentUser 约定） */
  interface CurrentUser {
    name?: string;
    avatar?: string;
    /** 由后端 roles 映射，用于 access 权限判断 */
    access?: string;
    /** 后端原始字段保留 */
    roles?: string[];
    menus?: MenuNode[];
  }

  /** 商品分页结果（ProTable request 返回结构） */
  interface ProductListResult {
    data: Product[];
    total: number;
    current: number;
    pageSize: number;
    success: boolean;
  }
}
