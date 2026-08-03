import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Result, Space, type TablePaginationConfig, Tag } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import {
  adaptProductQueryParams,
  MallBizError,
} from '@/services/mall/adapters';
import { getMallProductList } from '@/services/mall/product';

/** 上架状态枚举 */
const publishStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: '下架', color: 'default' },
  1: { text: '上架', color: 'success' },
};

/** 推荐状态枚举（adapter 已补充 recommendStatus 规范字段） */
const recommendStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: '不推荐', color: 'default' },
  1: { text: '推荐', color: 'blue' },
};

/** 审核状态枚举 */
const verifyStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: '未审核', color: 'default' },
  1: { text: '审核通过', color: 'success' },
};

/** 分页配置 */
const paginationConfig: Partial<TablePaginationConfig> = {
  defaultPageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50'],
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} / 共 ${total} 条`,
};

const ProductList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    retry: () => void;
  } | null>(null);

  /** 页面行类型：MallProductItem + adapter 补充字段（recommendStatus / 时间文本） */
  type ProductRow = API.MallProductItem & {
    recommendStatus?: number;
    promotionStartTimeText?: string;
    promotionEndTimeText?: string;
  };

  const columns: ProColumns<ProductRow>[] = [
    {
      title: '商品ID',
      dataIndex: 'id',
      width: 80,
      search: false,
      ellipsis: true,
    },
    {
      title: '商品图片',
      dataIndex: 'pic',
      width: 100,
      search: false,
      render: (_, record) =>
        record.pic ? (
          <img
            src={record.pic}
            alt={record.name}
            style={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      width: 240,
      ellipsis: true,
      fieldProps: { placeholder: '请输入商品名称' },
      // 查询字段名 name -> 后端参数 keyword（C2 参数名适配）
      search: {
        transform: (value: string) => ({ keyword: value }),
      } as ProColumns<ProductRow>['search'],
    },
    {
      title: '货号',
      dataIndex: 'productSn',
      width: 110,
      ellipsis: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      search: false,
      render: (_, record) => (record.price != null ? `¥${record.price}` : '-'),
    },
    {
      title: '促销价',
      dataIndex: 'promotionPrice',
      width: 100,
      search: false,
      render: (_, record) =>
        record.promotionPrice != null ? `¥${record.promotionPrice}` : '-',
    },
    {
      title: '品牌',
      dataIndex: 'brandName',
      width: 100,
      search: false,
    },
    {
      title: '分类',
      dataIndex: 'productCategoryName',
      width: 120,
      search: false,
    },
    {
      title: '上架状态',
      dataIndex: 'publishStatus',
      width: 100,
      valueType: 'select',
      valueEnum: {
        0: { text: '下架', status: 'Default' },
        1: { text: '上架', status: 'Success' },
      },
      render: (_, record) =>
        record.publishStatus != null ? (
          <Tag color={publishStatusMap[record.publishStatus]?.color}>
            {publishStatusMap[record.publishStatus]?.text ??
              record.publishStatus}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '推荐状态',
      dataIndex: 'recommendStatus',
      width: 100,
      valueType: 'select',
      valueEnum: {
        0: { text: '不推荐', status: 'Default' },
        1: { text: '推荐', status: 'Processing' },
      },
      render: (_, record) =>
        record.recommendStatus != null ? (
          <Tag color={recommendStatusMap[record.recommendStatus]?.color}>
            {recommendStatusMap[record.recommendStatus]?.text ??
              record.recommendStatus}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '审核状态',
      dataIndex: 'verifyStatus',
      width: 100,
      search: false,
      render: (_, record) =>
        record.verifyStatus != null ? (
          <Tag color={verifyStatusMap[record.verifyStatus]?.color}>
            {verifyStatusMap[record.verifyStatus]?.text ?? record.verifyStatus}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '销量',
      dataIndex: 'sale',
      width: 80,
      search: false,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 80,
      search: false,
    },
    {
      title: '促销开始时间',
      dataIndex: 'promotionStartTimeText',
      width: 170,
      search: false,
    },
    {
      title: '促销结束时间',
      dataIndex: 'promotionEndTimeText',
      width: 170,
      search: false,
    },
  ];

  /** 表格请求：ProTable 参数 -> adapter（current->pageNum）-> mall service -> adapter 响应 */
  const handleRequest = useCallback(
    async (
      params: Record<string, unknown> & {
        pageSize?: number;
        current?: number;
        keyword?: string;
        publishStatus?: number;
        verifyStatus?: number;
        productSn?: string;
      },
    ) => {
      setErrorInfo(null);
      try {
        const queryParams = adaptProductQueryParams({
          current: params.current,
          pageSize: params.pageSize,
          keyword: params.keyword,
          productSn: params.productSn,
          publishStatus: params.publishStatus,
          verifyStatus: params.verifyStatus,
        });
        const result = await getMallProductList(queryParams);
        return {
          data: result.data,
          success: result.success,
          total: result.total,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof MallBizError || err instanceof Error
            ? err.message
            : '商品列表加载失败，请稍后重试';
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
      {errorInfo ? (
        <Result
          status="error"
          title="数据加载失败"
          subTitle={errorInfo.message}
          extra={
            <Space>
              <Button type="primary" onClick={errorInfo.retry}>
                重新加载
              </Button>
              <Button onClick={() => (window.location.href = '/user/login')}>
                去登录
              </Button>
            </Space>
          }
        />
      ) : (
        <ProTable<ProductRow, API.MallProductQueryParams>
          headerTitle="商品列表（mall 后端真实数据）"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 90,
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
          scroll={{ x: 1500 }}
          locale={{
            emptyText: '暂无商品数据',
          }}
        />
      )}
    </PageContainer>
  );
};

export default ProductList;
