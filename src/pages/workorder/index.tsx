import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Empty,
  Modal,
  message,
  Result,
  Space,
  type TablePaginationConfig,
  Tag,
} from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import {
  getWorkOrderList,
  removeWorkOrders,
  updateWorkOrderStatus,
} from '@/services/ant-design-pro/workorder';

/** ״̬��ɫӳ�䣺���� antd Tag Ԥ��ɫ */
const statusColorMap: Record<API.WorkOrderStatus, string> = {
  pending: 'default',
  processing: 'processing',
  resolved: 'success',
  closed: 'error',
};

/** ���ȼ���ɫӳ�� */
const priorityColorMap: Record<API.WorkOrderPriority, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

/** ״̬�İ� */
const statusLabelMap: Record<API.WorkOrderStatus, string> = {
  pending: '������',
  processing: '������',
  resolved: '�ѽ��',
  closed: '�ѹر�',
};

/** ���ȼ��İ� */
const priorityLabelMap: Record<API.WorkOrderPriority, string> = {
  low: '��',
  medium: '��',
  high: '��',
  urgent: '���',
};

/** ��ҳ���� */
const paginationConfig: Partial<TablePaginationConfig> = {
  defaultPageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} / �� ${total} ��`,
};

const WorkOrderList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<API.WorkOrderItem[]>([]);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    retry: () => void;
  } | null>(null);

  // ---- ɾ�� mutation ----
  const { mutateAsync: runRemove, isPending: removing } = useMutation({
    mutationFn: removeWorkOrders,
    onSuccess: () => {
      messageApi.success('ɾ���ɹ�');
      setSelectedRowKeys([]);
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      queryClient.invalidateQueries({ queryKey: ['workorder'] });
    },
    onError: () => {
      messageApi.error('ɾ��ʧ�ܣ�������');
    },
  });

  // ---- ״̬���� mutation ----
  const { mutateAsync: runUpdateStatus, isPending: updating } = useMutation({
    mutationFn: updateWorkOrderStatus,
    onSuccess: () => {
      messageApi.success('״̬���³ɹ�');
      actionRef.current?.reloadAndRest?.();
      queryClient.invalidateQueries({ queryKey: ['workorder'] });
    },
    onError: () => {
      messageApi.error('״̬����ʧ�ܣ�������');
    },
  });

  // ---- ����ɾ�� ----
  const handleBatchDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('����ѡ��Ҫɾ���Ĺ���');
      return;
    }
    Modal.confirm({
      title: 'ȷ������ɾ��',
      content: `ȷ��Ҫɾ��ѡ�е� ${selectedRowKeys.length} �������𣿴˲������ɳ�����`,
      okText: 'ȷ��ɾ��',
      cancelText: 'ȡ��',
      okType: 'danger',
      onOk: async () => {
        await runRemove({ ids: selectedRowKeys });
      },
    });
  }, [selectedRowKeys, runRemove, messageApi]);

  // ---- �����ر� ----
  const handleBatchClose = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('����ѡ��Ҫ�رյĹ���');
      return;
    }
    Modal.confirm({
      title: 'ȷ�������ر�',
      content: `ȷ��Ҫ�ر�ѡ�е� ${selectedRowKeys.length} ��������`,
      okText: 'ȷ�Ϲر�',
      cancelText: 'ȡ��',
      onOk: async () => {
        const promises = selectedRowKeys.map((id) =>
          updateWorkOrderStatus({ id, status: 'closed' }),
        );
        await Promise.all(promises);
        messageApi.success('�����رճɹ�');
        setSelectedRowKeys([]);
        setSelectedRows([]);
        actionRef.current?.reloadAndRest?.();
        queryClient.invalidateQueries({ queryKey: ['workorder'] });
      },
    });
  }, [selectedRowKeys, messageApi, actionRef, queryClient]);

  // ---- ��������������״̬ ----
  const handleSingleStatusChange = useCallback(
    (record: API.WorkOrderItem, newStatus: API.WorkOrderStatus) => {
      Modal.confirm({
        title: 'ȷ�ϸ���״̬',
        content: `ȷ��Ҫ��������${record.title}����״̬�ӡ�${statusLabelMap[record.status]}������Ϊ��${statusLabelMap[newStatus]}����`,
        okText: 'ȷ��',
        cancelText: 'ȡ��',
        onOk: async () => {
          await runUpdateStatus({ id: record.id, status: newStatus });
        },
      });
    },
    [runUpdateStatus],
  );

  // ---- ����������ɾ�� ----
  const handleSingleDelete = useCallback(
    (record: API.WorkOrderItem) => {
      Modal.confirm({
        title: 'ȷ��ɾ��',
        content: `ȷ��Ҫɾ��������${record.title}���𣿴˲������ɳ�����`,
        okText: 'ȷ��ɾ��',
        cancelText: 'ȡ��',
        okType: 'danger',
        onOk: async () => {
          await runRemove({ ids: [record.id] });
        },
      });
    },
    [runRemove],
  );

  // ---- �ж��� ----
  const columns: ProColumns<API.WorkOrderItem>[] = [
    {
      title: '�������',
      dataIndex: 'id',
      width: 140,
      copyable: true,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '��������',
      dataIndex: 'title',
      width: 220,
      ellipsis: true,
      fieldProps: {
        placeholder: '�����빤����������',
      },
    },
    {
      title: '״̬',
      dataIndex: 'status',
      width: 100,
      sorter: true,
      filters: true,
      valueType: 'select',
      valueEnum: {
        pending: { text: '������', status: 'Default' },
        processing: { text: '������', status: 'Processing' },
        resolved: { text: '�ѽ��', status: 'Success' },
        closed: { text: '�ѹر�', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={statusColorMap[record.status]}>
          {statusLabelMap[record.status]}
        </Tag>
      ),
    },
    {
      title: '���ȼ�',
      dataIndex: 'priority',
      width: 90,
      sorter: true,
      filters: true,
      valueType: 'select',
      valueEnum: {
        low: { text: '��' },
        medium: { text: '��' },
        high: { text: '��' },
        urgent: { text: '���' },
      },
      render: (_, record) => (
        <Tag color={priorityColorMap[record.priority]}>
          {priorityLabelMap[record.priority]}
        </Tag>
      ),
    },
    {
      title: '������',
      dataIndex: 'creator',
      width: 100,
      sorter: true,
    },
    {
      title: '������',
      dataIndex: 'assignee',
      width: 100,
      sorter: true,
    },
    {
      title: '����ʱ��',
      dataIndex: 'createdAt',
      width: 180,
      sorter: true,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '����ʱ��',
      dataIndex: 'updatedAt',
      width: 180,
      sorter: true,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: 'ʱ�䷶Χ',
      dataIndex: 'timeRange',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value: [string, string]) => ({
          startTime: value[0],
          endTime: value[1],
        }),
      } as ProColumns<API.WorkOrderItem>['search'],
      fieldProps: {
        placeholder: ['��ʼ����', '��������'],
      },
    },
    {
      title: '����',
      dataIndex: 'option',
      valueType: 'option',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              loading={updating}
              onClick={() => handleSingleStatusChange(record, 'processing')}
            >
              �ӵ�
            </Button>
          )}
          {record.status === 'processing' && (
            <Button
              type="link"
              size="small"
              loading={updating}
              onClick={() => handleSingleStatusChange(record, 'resolved')}
            >
              ���
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'processing') && (
            <Button
              type="link"
              size="small"
              loading={updating}
              onClick={() => handleSingleStatusChange(record, 'closed')}
            >
              �ر�
            </Button>
          )}
          {record.status === 'closed' && (
            <Button
              type="link"
              size="small"
              loading={updating}
              onClick={() => handleSingleStatusChange(record, 'pending')}
            >
              �ؿ�
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            loading={removing}
            onClick={() => handleSingleDelete(record)}
          >
            ɾ��
          </Button>
        </Space>
      ),
    },
  ];

  // ---- �������ݣ������������----
  const handleRequest = useCallback(
    async (
      params: Record<string, unknown> & {
        pageSize?: number;
        current?: number;
        keyword?: string;
      },
      sort: Record<string, unknown>,
      filter: Record<string, (string | number)[] | null>,
    ) => {
      setErrorInfo(null);
      try {
        const result = await getWorkOrderList({
          ...params,
          sorter: sort as Record<string, string>,
          filter: filter as Record<string, (string | number)[] | null>,
        });
        return {
          data: result.data,
          success: result.success,
          total: result.total,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : '��������ʧ�ܣ��������������';
        setErrorInfo({
          message: errorMessage,
          retry: () => actionRef.current?.reload(),
        });
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    },
    [],
  );

  return (
    <PageContainer>
      {contextHolder}
      {errorInfo ? (
        <Result
          status="error"
          title="���ݼ���ʧ��"
          subTitle={errorInfo.message}
          extra={
            <Button type="primary" onClick={errorInfo.retry}>
              ���¼���
            </Button>
          }
        />
      ) : (
        <ProTable<API.WorkOrderItem, API.WorkOrderParams>
          headerTitle="�����б�"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 80,
            defaultCollapsed: false,
            span: 8,
          }}
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true,
          }}
          pagination={paginationConfig}
          request={handleRequest}
          columns={columns}
          scroll={{ x: 1300 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys: React.Key[], rows: API.WorkOrderItem[]) => {
              setSelectedRowKeys(keys as string[]);
              setSelectedRows(rows);
            },
            getCheckboxProps: (record: API.WorkOrderItem) => ({
              disabled: record.status === 'closed',
            }),
          }}
          tableAlertRender={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="���޹�������"
              />
            ),
          }}
          loading={removing}
        />
      )}

      {selectedRowKeys.length > 0 && (
        <FooterToolbar
          extra={
            <span>
              ��ѡ��{' '}
              <span style={{ fontWeight: 600 }}>{selectedRowKeys.length}</span>{' '}
              ���
            </span>
          }
        >
          <Button loading={removing} onClick={handleBatchDelete}>
            ����ɾ��
          </Button>
          <Button type="primary" onClick={handleBatchClose}>
            �����ر�
          </Button>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default WorkOrderList;
