import type { ProColumns } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Modal, Tag } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import {
  getWorkOrderList,
  removeWorkOrder,
} from '@/services/ant-design-pro/api';
import { useProTable } from '@/hooks/useProTable';
import useStyles from './style.style';

const statusMap: Record<
  API.WorkOrderStatus,
  { color: string; label: string }
> = {
  pending: { color: 'default', label: '待处理' },
  processing: { color: 'processing', label: '处理中' },
  resolved: { color: 'success', label: '已解决' },
  closed: { color: 'default', label: '已关闭' },
};

const priorityMap: Record<
  API.WorkOrderPriority,
  { color: string; label: string }
> = {
  low: { color: 'green', label: '低' },
  medium: { color: 'blue', label: '中' },
  high: { color: 'orange', label: '高' },
  urgent: { color: 'red', label: '紧急' },
};

const WorkOrderList: React.FC = () => {
  const { styles } = useStyles();

  const {
    actionRef,
    contextHolder,
    selectedRows,
    rowSelection,
    deleteMutate: doDelete,
    deleteLoading,
  } = useProTable<API.WorkOrderListItem>({
    queryKey: 'work-order',
    deleteMutationFn: removeWorkOrder,
    deleteSuccessMsg: '删除成功',
    deleteErrorMsg: '删除失败，请重试',
  });

  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRows.length} 条工单吗？此操作不可撤销。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const ids = selectedRows.map((row) => row.id);
        doDelete({ ids });
      },
    });
  };

  const handleSingleDelete = (record: API.WorkOrderListItem) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除工单「${record.title}」吗？此操作不可撤销。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        doDelete({ ids: [record.id] });
      },
    });
  };

  const columns: ProColumns<API.WorkOrderListItem>[] = [
    {
      title: '工单ID',
      dataIndex: 'id',
      width: 120,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 220,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      sorter: true,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待处理', status: 'Default' },
        processing: { text: '处理中', status: 'Processing' },
        resolved: { text: '已解决', status: 'Success' },
        closed: { text: '已关闭', status: 'Default' },
      },
      render: (_: React.ReactNode, record: API.WorkOrderListItem) => {
        const config = statusMap[record.status];
        return (
          <Tag color={config.color} className={styles.statusTag}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 90,
      sorter: true,
      valueType: 'select',
      valueEnum: {
        low: { text: '低' },
        medium: { text: '中' },
        high: { text: '高' },
        urgent: { text: '紧急' },
      },
      render: (_: React.ReactNode, record: API.WorkOrderListItem) => {
        const config = priorityMap[record.priority];
        return (
          <Tag color={config.color} className={styles.priorityTag}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '创建日期',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      hideInTable: true,
      fieldProps: {
        placeholder: ['开始日期', '结束日期'],
      },
      search: {
        transform: (value: [string, string]) => ({
          startTime: value[0],
          endTime: value[1],
        }),
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      sorter: true,
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      width: 100,
      sorter: true,
      ellipsis: true,
    },
    {
      title: '报告人',
      dataIndex: 'reporter',
      width: 100,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      sorter: true,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_: React.ReactNode, record: API.WorkOrderListItem) => [
        <Button
          key="delete"
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleSingleDelete(record)}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.WorkOrderListItem, API.WorkOrderListParams>
        headerTitle="工单列表"
        actionRef={actionRef}
        rowKey="id"
        className={styles.container}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        rowSelection={rowSelection}
        request={async (params, sort) => {
          const sortEntries = Object.entries(sort).find(
            ([_key, order]) => order !== undefined,
          );
          const sortField = sortEntries ? sortEntries[0] : undefined;
          const sortOrder = sortEntries
            ? (sortEntries[1] as 'ascend' | 'descend' | undefined)
            : undefined;

          const queryParams: API.WorkOrderListParams = {
            current: params.current,
            pageSize: params.pageSize,
            status: params.status as API.WorkOrderStatus | undefined,
            priority: params.priority as API.WorkOrderPriority | undefined,
            keyword: params.title as string | undefined,
            startTime: params.startTime,
            endTime: params.endTime,
            sortField,
            sortOrder,
          };

          const result = await getWorkOrderList(queryParams);
          return {
            data: result.data,
            total: result.total,
            success: result.success,
          };
        }}
        columns={columns}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10,
        }}
        dateFormatter="string"
      />
      {selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div className={styles.batchInfo}>
              已选择{' '}
              <strong>{selectedRows.length}</strong>{' '}
              项
            </div>
          }
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deleteLoading}
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default WorkOrderList;
