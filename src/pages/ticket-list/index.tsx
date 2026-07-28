import { ExclamationCircleFilled } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Modal, message, Popconfirm, Tag, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import {
  batchDeleteTickets,
  deleteTicket,
  fetchTicketList,
} from '@/services/ant-design-pro/api';

const statusColorMap: Record<API.TicketStatus, string> = {
  pending: 'default',
  processing: 'processing',
  resolved: 'success',
  closed: 'default',
};

const priorityColorMap: Record<API.TicketPriority, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const queryClient = useQueryClient();
  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedRowsState, setSelectedRows] = useState<API.TicketListItem[]>(
    [],
  );

  const { mutate: delSingle, isPending: singleDeleting } = useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      messageApi.success(
        intl.formatMessage({
          id: 'pages.ticketList.deleteSuccess',
          defaultMessage: '删除成功',
        }),
      );
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => {
      messageApi.error(
        intl.formatMessage({
          id: 'pages.ticketList.deleteFailed',
          defaultMessage: '删除失败，请重试',
        }),
      );
    },
  });

  const { mutate: delBatch, isPending: batchDeleting } = useMutation({
    mutationFn: batchDeleteTickets,
    onSuccess: () => {
      messageApi.success(
        intl.formatMessage({
          id: 'pages.ticketList.deleteSuccess',
          defaultMessage: '删除成功',
        }),
      );
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => {
      messageApi.error(
        intl.formatMessage({
          id: 'pages.ticketList.deleteFailed',
          defaultMessage: '删除失败，请重试',
        }),
      );
    },
  });

  const handleSingleDelete = useCallback(
    (record: API.TicketListItem) => {
      delSingle({ data: { id: record.id } });
    },
    [delSingle],
  );

  const handleBatchDelete = useCallback(() => {
    Modal.confirm({
      title: intl.formatMessage(
        {
          id: 'pages.ticketList.batchDeleteConfirm',
          defaultMessage: '确认删除选中的 {count} 个工单？',
        },
        { count: selectedRowsState.length },
      ),
      icon: <ExclamationCircleFilled />,
      content: intl.formatMessage(
        {
          id: 'pages.ticketList.totalItems',
          defaultMessage: '共 {total} 条工单',
        },
        { total: selectedRowsState.length },
      ),
      okText: intl.formatMessage({
        id: 'pages.ticketList.delete',
        defaultMessage: '删除',
      }),
      cancelText: intl.formatMessage({
        id: 'pages.ticketList.status.closed',
        defaultMessage: '取消',
      }),
      onOk: () => {
        delBatch({
          data: {
            ids: selectedRowsState.map((row) => row.id),
          },
        });
      },
    });
  }, [intl, selectedRowsState, delBatch]);

  const columns: ProColumns<API.TicketListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.ticketList.titleColumn"
          defaultMessage="工单标题"
        />
      ),
      dataIndex: 'title',
      ellipsis: true,
      width: 200,
      render: (_: ReactNode, record: API.TicketListItem) => (
        <Tooltip title={record.description}>
          <span>{record.title}</span>
        </Tooltip>
      ),
    },
    {
      title: (
        <FormattedMessage id="pages.ticketList.status" defaultMessage="状态" />
      ),
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        pending: {
          text: intl.formatMessage({
            id: 'pages.ticketList.status.pending',
            defaultMessage: '待处理',
          }),
          status: 'Default' as const,
        },
        processing: {
          text: intl.formatMessage({
            id: 'pages.ticketList.status.processing',
            defaultMessage: '处理中',
          }),
          status: 'Processing' as const,
        },
        resolved: {
          text: intl.formatMessage({
            id: 'pages.ticketList.status.resolved',
            defaultMessage: '已解决',
          }),
          status: 'Success' as const,
        },
        closed: {
          text: intl.formatMessage({
            id: 'pages.ticketList.status.closed',
            defaultMessage: '已关闭',
          }),
          status: 'Default' as const,
        },
      },
      render: (_: ReactNode, record: API.TicketListItem) => (
        <Tag color={statusColorMap[record.status]}>
          {intl.formatMessage({
            id: `pages.ticketList.status.${record.status}`,
          })}
        </Tag>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.ticketList.priority"
          defaultMessage="优先级"
        />
      ),
      dataIndex: 'priority',
      width: 100,
      valueEnum: {
        low: {
          text: intl.formatMessage({
            id: 'pages.ticketList.priority.low',
            defaultMessage: '低',
          }),
          status: 'Default',
        },
        medium: {
          text: intl.formatMessage({
            id: 'pages.ticketList.priority.medium',
            defaultMessage: '中',
          }),
          status: 'Processing',
        },
        high: {
          text: intl.formatMessage({
            id: 'pages.ticketList.priority.high',
            defaultMessage: '高',
          }),
          status: 'Warning',
        },
        urgent: {
          text: intl.formatMessage({
            id: 'pages.ticketList.priority.urgent',
            defaultMessage: '紧急',
          }),
          status: 'Error',
        },
      },
      render: (_: ReactNode, record: API.TicketListItem) => (
        <Tag color={priorityColorMap[record.priority]}>
          {intl.formatMessage({
            id: `pages.ticketList.priority.${record.priority}`,
          })}
        </Tag>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.ticketList.creator"
          defaultMessage="创建人"
        />
      ),
      dataIndex: 'creator',
      width: 100,
      search: false,
    },
    {
      title: (
        <FormattedMessage
          id="pages.ticketList.createdAt"
          defaultMessage="创建时间"
        />
      ),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      width: 180,
      search: false,
    },
    {
      title: (
        <FormattedMessage
          id="pages.ticketList.updatedAt"
          defaultMessage="更新时间"
        />
      ),
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      sorter: true,
      width: 180,
      search: false,
    },
    {
      title: (
        <FormattedMessage
          id="pages.ticketList.operation"
          defaultMessage="操作"
        />
      ),
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      render: (_: ReactNode, record: API.TicketListItem) => [
        <Button
          type="link"
          key="view"
          onClick={() => {
            Modal.info({
              title: record.title,
              content: (
                <div>
                  <p>
                    <strong>
                      {intl.formatMessage({
                        id: 'pages.ticketList.status',
                        defaultMessage: '状态',
                      })}
                      ：
                    </strong>
                    {intl.formatMessage({
                      id: `pages.ticketList.status.${record.status}`,
                    })}
                  </p>
                  <p>
                    <strong>
                      {intl.formatMessage({
                        id: 'pages.ticketList.priority',
                        defaultMessage: '优先级',
                      })}
                      ：
                    </strong>
                    {intl.formatMessage({
                      id: `pages.ticketList.priority.${record.priority}`,
                    })}
                  </p>
                  <p>
                    <strong>
                      {intl.formatMessage({
                        id: 'pages.ticketList.creator',
                        defaultMessage: '创建人',
                      })}
                      ：
                    </strong>
                    {record.creator}
                  </p>
                  <p>
                    <strong>
                      {intl.formatMessage({
                        id: 'pages.ticketList.description',
                        defaultMessage: '描述',
                      })}
                      ：
                    </strong>
                    {record.description}
                  </p>
                </div>
              ),
            });
          }}
        >
          <FormattedMessage id="pages.ticketList.view" defaultMessage="查看" />
        </Button>,
        <Popconfirm
          key="delete"
          title={intl.formatMessage({
            id: 'pages.ticketList.deleteConfirm',
            defaultMessage: '确认删除该工单？',
          })}
          onConfirm={() => handleSingleDelete(record)}
        >
          <Button type="link" danger loading={singleDeleting}>
            <FormattedMessage
              id="pages.ticketList.delete"
              defaultMessage="删除"
            />
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.TicketListItem, API.TicketQueryParams>
        headerTitle={intl.formatMessage({
          id: 'pages.ticketList.title',
          defaultMessage: '工单列表',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        request={async (params, sort) => {
          const { current, pageSize, status, priority } = params;
          const queryParams: API.TicketQueryParams = {
            current,
            pageSize,
            status: status as API.TicketStatus | undefined,
            priority: priority as API.TicketPriority | undefined,
          };
          if (params.createdAt) {
            queryParams.createdAt = params.createdAt as [string, string];
          }
          return fetchTicketList(queryParams);
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows: API.TicketListItem[]) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage
                id="pages.ticketList.chosen"
                defaultMessage="已选择"
              />
              <span style={{ fontWeight: 600, marginInline: 8 }}>
                {selectedRowsState.length}
              </span>
              <FormattedMessage
                id="pages.ticketList.item"
                defaultMessage="项"
              />
            </div>
          }
        >
          <Button loading={batchDeleting} onClick={handleBatchDelete}>
            <FormattedMessage
              id="pages.ticketList.batchDelete"
              defaultMessage="批量删除"
            />
          </Button>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default TableList;
