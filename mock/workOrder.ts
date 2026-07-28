import type { Request, Response } from 'express';

const statusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const assigneeList = ['张三', '李四', '王五', '赵六', '钱七'];
const categoryList = ['硬件故障', '软件问题', '网络问题', '账号权限', '其他'];

const generateWorkOrders = (): API.WorkOrderListItem[] => {
  const statuses: API.WorkOrderStatus[] = ['pending', 'processing', 'resolved', 'closed'];
  const priorities: API.WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent'];

  return Array.from({ length: 68 }, (_, i) => {
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    ).toISOString();
    const updatedAt = new Date(
      new Date(createdAt).getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
    ).toISOString();

    return {
      id: `WO-${String(i + 1).padStart(4, '0')}`,
      title: `工单标题-${i + 1}`,
      status,
      priority,
      assignee: assigneeList[i % assigneeList.length],
      reporter: `用户${i + 1}`,
      category: categoryList[i % categoryList.length],
      description: `这是第 ${i + 1} 号工单的详细描述信息`,
      createdAt,
      updatedAt,
      resolvedAt: status === 'resolved' || status === 'closed' ? updatedAt : undefined,
      callNo: Math.floor(Math.random() * 1000),
    };
  });
};

const allOrders = generateWorkOrders();

function getWorkOrderList(req: Request, res: Response) {
  const params = req.query as Record<string, string | undefined>;

  let filtered = [...allOrders];

  // 状态筛选
  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  // 优先级筛选
  if (params.priority) {
    filtered = filtered.filter((item) => item.priority === params.priority);
  }

  // 时间范围筛选
  if (params.startTime) {
    filtered = filtered.filter(
      (item) => new Date(item.createdAt) >= new Date(params.startTime!),
    );
  }
  if (params.endTime) {
    filtered = filtered.filter(
      (item) => new Date(item.createdAt) <= new Date(params.endTime!),
    );
  }

  // 关键词搜索
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.id.toLowerCase().includes(kw) ||
        item.assignee.includes(kw) ||
        item.reporter.includes(kw),
    );
  }

  // 排序
  if (params.sortField && params.sortOrder) {
    const field = params.sortField as keyof API.WorkOrderListItem;
    const order = params.sortOrder === 'ascend' ? 1 : -1;

    filtered.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
  }

  const current = Number(params.current) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const start = (current - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  res.json({
    data: paged,
    total: filtered.length,
    success: true,
  });
}

function postWorkOrder(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;
  const { method, ids, id, status } = body;

  if (method === 'delete' && Array.isArray(ids)) {
    const idSet = new Set(ids as string[]);
    for (let i = allOrders.length - 1; i >= 0; i--) {
      if (idSet.has(allOrders[i].id)) {
        allOrders.splice(i, 1);
      }
    }
    res.json({
      data: allOrders,
      total: allOrders.length,
      success: true,
    });
  } else if (method === 'update' && typeof id === 'string' && typeof status === 'string') {
    const order = allOrders.find((o) => o.id === id);
    if (order) {
      order.status = status as API.WorkOrderStatus;
      order.updatedAt = new Date().toISOString();
      if (status === 'resolved' || status === 'closed') {
        order.resolvedAt = new Date().toISOString();
      }
    }
    res.json(order);
  } else {
    res.status(400).json({ success: false, errorMessage: 'Invalid request' });
  }
}

export default {
  'GET /api/work-order': getWorkOrderList,
  'POST /api/work-order': postWorkOrder,
};
