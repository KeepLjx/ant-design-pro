interface MockRequest {
  query: Record<string, string | undefined>;
  body: Record<string, unknown>;
}

const statuses: API.TicketStatus[] = [
  'pending',
  'processing',
  'resolved',
  'closed',
];
const priorities: API.TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
const creators = ['张三', '李四', '王五', '赵六', '陈七'];
const titles = [
  '系统登录异常报错',
  '数据导出功能失效',
  '页面加载缓慢优化',
  '用户权限配置问题',
  '接口响应超时排查',
  '数据库连接池耗尽',
  '文件上传失败处理',
  '邮件通知未送达',
];

function generateTickets(): API.TicketListItem[] {
  return Array.from({ length: 56 }, (_, i) => {
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    );
    const updatedAt = new Date(
      createdAt.getTime() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    );
    return {
      id: i + 1,
      title: titles[i % titles.length],
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      creator: creators[i % creators.length],
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      description: `这是工单 #${i + 1} 的详细描述信息，用于记录问题详情和处理过程。`,
    };
  });
}

const allTickets = generateTickets();

export default {
  'GET /api/tickets': (
    req: MockRequest,
    res: { json: (data: unknown) => void },
  ) => {
    const {
      current = 1,
      pageSize = 10,
      status,
      priority,
      createdAt,
    } = req.query || {};

    let filtered = [...allTickets];

    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (priority && priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }
    if (createdAt) {
      const [start, end] = (createdAt as string).split(',');
      if (start) {
        filtered = filtered.filter(
          (t) => new Date(t.createdAt) >= new Date(start),
        );
      }
      if (end) {
        filtered = filtered.filter(
          (t) => new Date(t.createdAt) <= new Date(end),
        );
      }
    }

    const total = filtered.length;
    const start = (Number(current) - 1) * Number(pageSize);
    const data = filtered.slice(start, start + Number(pageSize));

    res.json({
      data,
      total,
      success: true,
    });
  },

  'POST /api/ticket/delete': (
    req: { body: Record<string, unknown> },
    res: { json: (data: unknown) => void },
  ) => {
    const { id } = req.body || {};
    const idx = allTickets.findIndex((t) => t.id === id);
    if (idx !== -1) {
      allTickets.splice(idx, 1);
    }
    res.json({ success: true });
  },

  'POST /api/tickets/batch-delete': (
    req: { body: Record<string, unknown> },
    res: { json: (data: unknown) => void },
  ) => {
    const { ids } = req.body || {};
    if (Array.isArray(ids)) {
      for (const id of ids) {
        const idx = allTickets.findIndex((t) => t.id === id);
        if (idx !== -1) {
          allTickets.splice(idx, 1);
        }
      }
    }
    res.json({ success: true });
  },
};
