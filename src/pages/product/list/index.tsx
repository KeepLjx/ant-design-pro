import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { queryProductList } from '@/services/mall';
import type { MallAPI } from '@/services/mall/typings';

/**
 * 商品分页列表页：对接 mall 后端 GET /product/list。
 * 数据流：后端 CommonResult<CommonPage<PmsProduct>> -> adapter(E1-1) -> ProTable。
 */
const ProductList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);

  const columns: ProColumns<MallAPI.Product>[] = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      search: true,
    },
    {
      title: '货号',
      dataIndex: 'productSn',
      key: 'productSn',
      search: true,
    },
    {
      title: '品牌',
      dataIndex: 'brandName',
      key: 'brandName',
      search: false,
    },
    {
      title: '分类',
      dataIndex: 'productCategoryName',
      key: 'productCategoryName',
      search: false,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      search: false,
      render: (_, record) => (record.price != null ? `￥${record.price}` : '-'),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      search: false,
    },
    {
      title: '销量',
      dataIndex: 'sale',
      key: 'sale',
      search: false,
    },
    {
      title: '推荐状态',
      dataIndex: 'recommendStatus',
      key: 'recommendStatus',
      search: false,
      valueEnum: {
        0: { text: '否', status: 'Default' },
        1: { text: '是', status: 'Success' },
      },
    },
    {
      title: '上架状态',
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      search: false,
      valueEnum: {
        0: { text: '下架', status: 'Default' },
        1: { text: '上架', status: 'Success' },
      },
    },
  ];

  return (
    <ProTable<MallAPI.Product>
      headerTitle="商品列表（mall 后端真实数据）"
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        defaultPageSize: 5,
        showSizeChanger: true,
      }}
      request={async (params) => {
        const { current, pageSize, ...rest } = params;
        // E1-1-4：ProTable current/pageSize -> 后端 pageNum/pageSize
        const data = await queryProductList({
          pageNum: current ?? 1,
          pageSize: pageSize ?? 5,
          keyword: rest.keyword as string | undefined,
          productSn: rest.productSn as string | undefined,
        });
        return data;
      }}
    />
  );
};

export default ProductList;
