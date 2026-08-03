/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  // 本地开发代理：mall 后端接口（localhost:8080）经 dev server 转发。
  // 注意：使用精确 API 路径前缀，避免与前端 SPA 路由（如 /admin/sub-page、/product/manage）冲突。
  dev: {
    '/admin/login': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/admin/info': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/admin/logout': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/admin/register': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/admin/list': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/product/list': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/product/simpleList': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/product/create': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/product/update': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/product/delete': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    // demo 接口（ant-design-pro 模板自带）
    '/api/': {
      target: 'https://pro-api.ant-design-demo.workers.dev',
      changeOrigin: true,
    },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://pro-api.ant-design-demo.workers.dev/api/**
    '/api/': {
      target: 'https://pro-api.ant-design-demo.workers.dev',
      changeOrigin: true,
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
    },
  },
};
