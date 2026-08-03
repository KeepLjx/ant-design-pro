import type { ActionType } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useCallback, useRef, useState } from 'react';

export interface UseProTableOptions {
  /**
   * React Query cache key, used to invalidate queries after delete
   */
  queryKey?: string;
  /**
   * Optional delete API function.
   * If provided, the hook creates a useMutation for delete operations.
   */
  deleteMutationFn?: (params: any) => Promise<any>;
  /**
   * Custom success/error messages for delete
   */
  deleteSuccessMsg?: string;
  deleteErrorMsg?: string;
}

export interface UseProTableReturn<T = any> {
  /** ProTable ActionType ref, pass to ProTable.actionRef */
  actionRef: React.MutableRefObject<ActionType | null>;
  /** React Query client instance */
  queryClient: ReturnType<typeof useQueryClient>;
  /** message.useMessage API, for custom message calls like .warning() */
  messageApi: ReturnType<typeof message.useMessage>[0];
  /** message.useMessage contextHolder, render in component JSX */
  contextHolder: React.ReactElement;
  /** Currently selected rows */
  selectedRows: T[];
  /** Set selected rows */
  setSelectedRows: React.Dispatch<React.SetStateAction<T[]>>;
  /** Pre-configured rowSelection prop for ProTable */
  rowSelection: {
    onChange: (_: React.Key[], rows: T[]) => void;
  };
  /** Delete mutation trigger (undefined if deleteMutationFn not provided) */
  deleteMutate?: (params: any) => void;
  /** Whether delete mutation is in progress */
  deleteLoading?: boolean;
  /** Reload ProTable (reload without resetting to page 1) */
  reload: () => void;
  /** Reload ProTable and reset to page 1 */
  reloadAndRest: () => void;
}

/**
 * useProTable - Reusable hook encapsulating common ProTable patterns
 *
 * Extracts repeated logic across table-list and work-order pages:
 * - actionRef management
 * - message API (contextHolder)
 * - row selection state + rowSelection handler
 * - optional delete mutation with cache invalidation
 *
 * @example
 * ```tsx
 * const {
 *   actionRef, contextHolder, selectedRows, rowSelection,
 *   deleteMutate, deleteLoading, reload, reloadAndRest,
 * } = useProTable<API.RuleListItem>({
 *   queryKey: 'rule',
 *   deleteMutationFn: removeRule,
 * });
 * ```
 */
export function useProTable<T = any>(
  options?: UseProTableOptions,
): UseProTableReturn<T> {
  const actionRef = useRef<ActionType | null>(null);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const rowSelection = {
    onChange: (_: React.Key[], rows: T[]) => {
      setSelectedRows(rows);
    },
  };

  // Delete mutation (hook must be called unconditionally; mutationFn
  // throws at runtime if deleteMutationFn was not provided)
  const deleteMutation = useMutation({
    mutationFn: async (params: any) => {
      if (!options?.deleteMutationFn) {
        throw new Error('deleteMutationFn is not provided');
      }
      return options.deleteMutationFn(params);
    },
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      if (options?.queryKey) {
        queryClient.invalidateQueries({ queryKey: [options.queryKey] });
      }
      messageApi.success(options?.deleteSuccessMsg ?? '删除成功');
    },
    onError: () => {
      messageApi.error(options?.deleteErrorMsg ?? '删除失败，请重试');
    },
  });

  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);

  const reloadAndRest = useCallback(() => {
    actionRef.current?.reloadAndRest?.();
  }, []);

  return {
    actionRef,
    queryClient,
    messageApi,
    contextHolder,
    selectedRows,
    setSelectedRows,
    rowSelection,
    deleteMutate: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
    reload,
    reloadAndRest,
  };
}
