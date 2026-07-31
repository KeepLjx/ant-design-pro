import type { ActionType } from '@ant-design/pro-components';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useCallback, useRef, useState } from 'react';

export interface UseProTableOptions {
  /** react-query 查询 key，用于删除成功后自动失效缓存 */
  queryKey: string;
}

/**
 * ProTable 公共逻辑 Hook
 * 抽取 table-list / ticket-list 等页面中重复的：
 * - actionRef / selectedRows / rowSelection 状态管理
 * - 删除成功后的清空选中 → 重载 → 失效缓存 → 提示 通用流程
 */
export function useProTable<T = any>(options: UseProTableOptions) {
  const { queryKey } = options;
  const actionRef = useRef<ActionType | null>(null);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const clearSelected = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const reload = useCallback(() => {
    actionRef.current?.reloadAndRest?.();
  }, []);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }, [queryClient, queryKey]);

  /** 删除成功后的统一处理：清空选中 → 重载表格 → 失效缓存 */
  const onDeleteSuccess = useCallback(
    (successMsg: string) => {
      clearSelected();
      reload();
      invalidate();
      messageApi.success(successMsg);
    },
    [clearSelected, reload, invalidate, messageApi],
  );

  /** 删除失败后的统一处理 */
  const onDeleteError = useCallback(
    (errorMsg: string) => {
      messageApi.error(errorMsg);
    },
    [messageApi],
  );

  const rowSelection = {
    onChange: (_: React.Key[], rows: T[]) => {
      setSelectedRows(rows);
    },
  };

  return {
    actionRef,
    selectedRows,
    setSelectedRows,
    messageApi,
    contextHolder,
    rowSelection,
    clearSelected,
    reload,
    invalidate,
    onDeleteSuccess,
    onDeleteError,
  };
}
