import dayjs from 'dayjs';
import type { Request, Response } from 'express';

const statuses: API.WorkOrderStatus[] = ['pending', 'processing', 'resolved', 'closed'];
const priorities: API.WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent'];
const creators = ['����', '����', '����', '����', '����'];
const assignees = ['�¹�', '����', '�ܹ�', '�⹤', '֣��'];
const titlePrefixes = ['ϵͳ����', '�����쳣', '�˺�����', 'Ȩ������', '���ݵ���', '�豸����', '�����װ', '��������'];

const generateWorkOrders = (count: number): API.WorkOrderItem[] => {
  const items: API.WorkOrderItem[] = [];
  for (let i = 0; i < count; i++) {
    const status = statuses[i % 4];
    const createdAt = dayjs()
      .subtract(Math.floor(Math.random() * 30), 'day')
      .format('YYYY-MM-DD HH:mm:ss');
    items.push({
      id: `WO-${String(i + 1).padStart(5, '0')}`,
      title: `${titlePrefixes[i % titlePrefixes.length]}����-${i + 1}`,
      status,
      priority: priorities[i % 4],
      creator: creators[i % creators.length],
      assignee: assignees[i % assignees.length],
      createdAt,
      updatedAt: dayjs(createdAt)
        .add(Math.floor(Math.random() * 5), 'hour')
        .format('YYYY-MM-DD HH:mm:ss'),
      description: `���ǹ��� WO-${String(i + 1).padStart(5, '0')} ����ϸ������Ϣ��`,
    });
  }
  return items;
};

const totalItems = 86;
let workOrderDataSource = generateWorkOrders(totalItems);

function getWorkOrders(req: Request, res: Response) {
  const { current = '1', pageSize = '10', status, priority, keyword, startTime, endTime, sorter } =
    req.query as Record<string, string>;

  let filteredData = [...workOrderDataSource];

  // ״̬ɸѡ
  if (status && statuses.includes(status as API.WorkOrderStatus)) {
    filteredData = filteredData.filter((item) => item.status === status);
  }

  // ���ȼ�ɸѡ
  if (priority && priorities.includes(priority as API.WorkOrderPriority)) {
    filteredData = filteredData.filter((item) => item.priority === priority);
  }

  // �ؼ�������������/������/�����ˣ�
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    filteredData = filteredData.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.creator.toLowerCase().includes(kw) ||
        item.assignee.toLowerCase().includes(kw),
    );
  }

  // ʱ�䷶Χɸѡ
  if (startTime) {
    filteredData = filteredData.filter((item) => item.createdAt >= startTime);
  }
  if (endTime) {
    filteredData = filteredData.filter((item) => item.createdAt <= endTime);
  }

  // ����
  if (sorter) {
    try {
      const sortObj = JSON.parse(sorter) as Record<string, string>;
      const keys = Object.keys(sortObj);
      if (keys.length > 0) {
        const sortKey = keys[0] as keyof API.WorkOrderItem;
        const sortOrder = sortObj[keys[0]];
        filteredData.sort((a, b) => {
          const aVal = a[sortKey];
          const bVal = b[sortKey];
          if (aVal == null || bVal == null) return 0;
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortOrder === 'descend' ? -cmp : cmp;
        });
      }
    } catch {
      // ignore invalid sorter
    }
  }

  const total = filteredData.length;
  const cur = parseInt(current, 10) || 1;
  const size = parseInt(pageSize, 10) || 10;
  const start = (cur - 1) * size;
  const pagedData = filteredData.slice(start, start + size);

  res.json({
    data: pagedData,
    total,
    success: true,
  });
}

function postWorkOrder(req: Request, res: Response) {
  const body = req.body as { method?: string; ids?: string[]; id?: string; status?: API.WorkOrderStatus };

  switch (body.method) {
    case 'delete':
      if (body.ids && body.ids.length > 0) {
        workOrderDataSource = workOrderDataSource.filter((item) => !body.ids!.includes(item.id));
      }
      res.json({ success: true });
      break;
    case 'update':
      if (body.id && body.status) {
        workOrderDataSource = workOrderDataSource.map((item) =>
          item.id === body.id
            ? { ...item, status: body.status!, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') }
            : item,
        );
      }
      res.json({ success: true });
      break;
    default:
      res.json({ success: false });
  }
}

export default {
  'GET /api/workorder': getWorkOrders,
  'POST /api/workorder': postWorkOrder,
};
