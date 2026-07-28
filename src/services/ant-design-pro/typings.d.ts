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
    /** 鍒楄〃鐨勫唴瀹规�绘暟 */
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
    /** 涓氬姟绾﹀畾鐨勯敊璇爜 */
    errorCode: string;
    /** 涓氬姟涓婄殑閿欒淇℃伅 */
    errorMessage?: string;
    /** 涓氬姟涓婄殑璇锋眰鏄惁鎴愬姛 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 鍒楄〃鐨勫唴瀹规�绘暟 */
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
}
