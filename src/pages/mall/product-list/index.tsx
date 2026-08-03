import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { App, Button, Form, Input, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getMallAuth } from '@/services/mall/client';
import { mallFetchProductList } from '@/services/mall/product';
import { mallGetUserInfo, mallLogin, mallLogout } from '@/services/mall/user';

const { Text } = Typography;

/**
 * mall 后端真实接口演示页：
 * 1. 登录（POST /admin/login，token 持久化并注入请求头）
 * 2. 商品分页（GET /product/list，经 adapter 转成 ProTable 结构渲染）
 */
const MallProductList: React.FC = () => {
  const { message } = App.useApp();
  const [user, setUser] = useState<Mall.CurrentUser | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // 已有 token 时自动恢复登录态
  useEffect(() => {
    if (!getMallAuth()) return;
    mallGetUserInfo()
      .then(setUser)
      .catch((e: Error) => message.error(`自动登录失败：${e.message}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (values: Mall.LoginParams) => {
    setLoginLoading(true);
    try {
      await mallLogin(values);
      const info = await mallGetUserInfo();
      setUser(info);
      message.success('登录成功！');
    } catch (e) {
      message.error(e instanceof Error ? e.message : '登录失败');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await mallLogout();
    setUser(null);
    message.success('已登出');
  };

  const columns: ProColumns<Mall.Product>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 64,
    },
    {
      title: '图片',
      dataIndex: 'pic',
      width: 64,
      render: (_, record) =>
        record.pic ? (
          <img
            src={record.pic}
            alt={record.name}
            width={40}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) => (
        <Text ellipsis={{ tooltip: record.name }}>{record.name}</Text>
      ),
    },
    { title: '货号', dataIndex: 'productSn', width: 110 },
    {
      title: '价格',
      dataIndex: 'price',
      width: 90,
      render: (_, record) =>
        record.price != null ? `¥${record.price.toFixed(2)}` : '-',
    },
    { title: '库存', dataIndex: 'stock', width: 70 },
    { title: '品牌', dataIndex: 'brandName', width: 90 },
    {
      title: '上架状态',
      dataIndex: 'publishStatus',
      width: 90,
      render: (_, record) =>
        record.publishStatus === 1 ? (
          <Tag color="green">上架</Tag>
        ) : (
          <Tag color="red">下架</Tag>
        ),
    },
  ];

  return (
    <PageContainer
      title="mall 商品列表（真实后端）"
      subTitle="数据来源：mall-admin POST /admin/login + GET /product/list"
    >
      {!user ? (
        <div style={{ maxWidth: 360 }}>
          <Form<Mall.LoginParams> onFinish={handleLogin} layout="vertical">
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="admin" autoComplete="username" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                placeholder="123456"
                autoComplete="current-password"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loginLoading}
              block
            >
              登录
            </Button>
          </Form>
        </div>
      ) : (
        <ProTable<Mall.Product>
          rowKey="id"
          headerTitle={
            <Space>
              <Text>
                当前用户：{user.name}（角色：{user.roles?.join('、') ?? '-'}）
              </Text>
              <Button size="small" onClick={handleLogout}>
                登出
              </Button>
            </Space>
          }
          columns={columns}
          pagination={{ pageSize: 5 }}
          request={async (params) => {
            return mallFetchProductList({
              pageNum: params.current,
              pageSize: params.pageSize,
              keyword: params.keyword,
            });
          }}
        />
      )}
    </PageContainer>
  );
};

export default MallProductList;
