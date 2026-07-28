import { request } from '@umijs/max';

/** ��ȡ�����б� GET /api/workorder */
export async function getWorkOrderList(
  params: API.WorkOrderParams & {
    sorter?: Record<string, string>;
    filter?: Record<string, (string | number)[] | null>;
  },
  options?: Record<string, unknown>,
) {
  return request<API.WorkOrderList>('/api/workorder', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** ɾ������ DELETE /api/workorder */
export async function removeWorkOrders(
  params: { ids: string[] },
  options?: Record<string, unknown>,
) {
  return request<{ success: boolean }>('/api/workorder', {
    method: 'POST',
    data: {
      method: 'delete',
      ids: params.ids,
    },
    ...(options || {}),
  });
}

/** ���¹���״̬ POST /api/workorder */
export async function updateWorkOrderStatus(
  params: { id: string; status: API.WorkOrderStatus },
  options?: Record<string, unknown>,
) {
  return request<{ success: boolean }>('/api/workorder', {
    method: 'POST',
    data: {
      method: 'update',
      id: params.id,
      status: params.status,
    },
    ...(options || {}),
  });
}
