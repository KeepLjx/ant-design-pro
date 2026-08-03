// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  /** 工单状态 */
  type WorkOrderStatus = 'pending' | 'processing' | 'resolved' | 'closed';

  /** 工单优先级 */
  type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

  /** 工单条目 */
  type WorkOrderItem = {
    id: string;
    title: string;
    status: WorkOrderStatus;
    priority: WorkOrderPriority;
    creator: string;
    assignee: string;
    createdAt: string;
    updatedAt: string;
    description: string;
  };

  /** 工单列表响应 */
  type WorkOrderList = {
    data: WorkOrderItem[];
    total: number;
    success: boolean;
  };

  /** 工单查询参数 */
  type WorkOrderParams = {
    current?: number;
    pageSize?: number;
    status?: WorkOrderStatus;
    priority?: WorkOrderPriority;
    keyword?: string;
    startTime?: string;
    endTime?: string;
  };

  // ==================== mall 后端契约类型（依据 OpenAPI 3.0 与真实响应生成） ====================

  /** 后端统一响应包装：{ code, message, data }，code === 200 成功 */
  type MallResult<T = null> = {
    code: number;
    message: string;
    data: T;
  };

  /** 登录参数 POST /admin/login */
  type MallLoginParams = {
    username: string;
    password: string;
  };

  /** 登录成功返回的 token 数据 */
  type MallTokenData = {
    token: string;
    /** 如 "Bearer "（含尾随空格） */
    tokenHead: string;
  };

  /** 当前登录用户信息 GET /admin/info */
  type MallAdminInfo = {
    username?: string;
    menus?: MallMenu[];
    icon?: string;
    roles?: string[];
  };

  /** 菜单 */
  type MallMenu = {
    id?: number;
    parentId?: number;
    createTime?: string;
    title?: string;
    level?: number;
    sort?: number;
    name?: string;
    icon?: string;
    hidden?: number;
  };

  /** 商品查询参数（后端 /product/list query，真实字段） */
  type MallProductQueryParams = {
    publishStatus?: number;
    verifyStatus?: number;
    keyword?: string;
    productSn?: string;
    productCategoryId?: number;
    brandId?: number;
    /** 每页数量，默认 5 */
    pageSize?: number;
    /** 当前页码，默认 1（前端 current 经 adapter 转换为 pageNum） */
    pageNum?: number;
  };

  /** 商品实体（PmsProduct 真实字段：recommandStatus 为后端拼写） */
  type MallProductItem = {
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
    /** 推荐状态（后端字段拼写） */
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
    promotionStartTime?: string;
    promotionEndTime?: string;
    promotionPerLimit?: number;
    promotionType?: number;
    brandName?: string;
    productCategoryName?: string;
    description?: string | null;
    detailDesc?: string | null;
    detailHtml?: string | null;
    detailMobileHtml?: string | null;
  };

  /** 分页数据（CommonPage 真实字段） */
  type MallProductPage = {
    pageNum: number;
    pageSize: number;
    totalPage: number;
    total: number;
    list: MallProductItem[];
  };

  // ==================== adapter 层输出的前端消费类型 ====================

  /** 登录 adapter 输出（对齐 ant-design-pro 登录页 status 约定） */
  type MallLoginAdapted = {
    status: 'ok' | 'error';
    code: number;
    message?: string;
    token?: string;
    tokenHead?: string;
  };

  /** 商品列表 adapter 输出（对齐 ProTable request 返回值） */
  type MallProductPageAdapted = {
    data: MallProductItem[];
    total: number;
    success: boolean;
  };
}
