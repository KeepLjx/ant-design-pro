// @ts-ignore
/* eslint-disable */
/**
 * E1-1 adapter 层
 * 后端返回结构（OpenAPI：openapi/mall-admin.openapi.yaml）与 ant-design-pro 前端约定不一致，
 * 在前端 adapter 层做转换，不允许修改后端。转换点与冲突清单一一对应：
 *
 *   E1-1-01 响应外层包装：{ code, message, data }（code=200 成功） → { success, data, errorMessage }
 *   E1-1-02 错误消息字段：message → errorMessage（见 client.ts mallRequest）
 *   E1-1-03 分页结构：CommonPage{ list, pageNum, pageSize, totalPage, total }
 *                     → ProTable{ data, current, pageSize, total, success }
 *   E1-1-04 登录返回：{ token, tokenHead } → LoginResult{ status:'ok', currentAuthority }
 *   E1-1-05 用户信息：{ username, icon, roles, menus } → CurrentUser{ name, avatar, access }
 */

/** E1-1-04 登录返回转换：token/tokenHead → LoginResult */
export function toLoginResult(token: Mall.LoginToken): Mall.LoginResult {
  return {
    status: 'ok',
    currentAuthority: 'admin',
    token: token.token,
    tokenHead: token.tokenHead,
  };
}

/** E1-1-05 用户信息转换：username/icon/roles → name/avatar/access */
export function toCurrentUser(info: Mall.AdminInfo): Mall.CurrentUser {
  const roles = info.roles ?? [];
  return {
    name: info.username,
    avatar: info.icon,
    // 后端角色名 → 前端 access 权限标识
    access: roles.includes('超级管理员') ? 'admin' : (roles[0] ?? 'user'),
    roles,
    menus: info.menus,
  };
}

/** E1-1-03 分页结构转换：CommonPage{list,pageNum} → ProTable{data,current} */
export function toProductListResult(
  page: Mall.ProductPageData,
): Mall.ProductListResult {
  return {
    data: page.list ?? [],
    total: page.total ?? 0,
    current: page.pageNum ?? 1,
    pageSize: page.pageSize ?? 5,
    success: true,
  };
}
