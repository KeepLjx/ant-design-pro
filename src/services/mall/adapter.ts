/**
 * mall 后端 <-> ant-design-pro 前端 的 adapter 转换层。
 *
 * 对应 E1-1 冲突清单（6 处）：
 *   E1-1-1 响应信封：CommonResult{code,message,data} -> {success,errorCode,errorMessage,data}
 *   E1-1-2 登录结果：LoginToken -> ProLoginResult（status==='ok'，供登录页判定 + token 持久化）
 *   E1-1-3 token 注入：Authorization: Bearer <token>（请求拦截器实现，此处提供读写工具）
 *   E1-1-4 分页字段：CommonPage{pageNum,...} -> PageData{current,...}
 *   E1-1-5 字段拼写：recommandStatus -> recommendStatus
 *   E1-1-6 数值类型：Long/BigDecimal 的 number 归一化 + id 保精度（string|number）
 *
 * 约定：本层只允许转换、不允许修改后端（后端保持不变）。
 */
import type { MallAPI } from './typings';

// ================= E1-1-1 响应信封转换 =================

/** 将后端 CommonResult 统一为前端 errorHandler 可识别的 {success,errorCode,errorMessage,data} */
export function toProResult<T>(
  res: MallAPI.CommonResult<T>,
): { success: boolean; data: T | null; errorCode: number; errorMessage: string } {
  return {
    success: res.code === 200,
    data: res.data,
    errorCode: res.code,
    errorMessage: res.message,
  };
}

// ================= E1-1-2 登录结果转换 =================

/**
 * 后端 login 返回 CommonResult<LoginToken>{token,tokenHead}，code===200 表示成功。
 * 登录页判定 `msg.status === 'ok'` 才视为成功，故转换为 Pro 形态，
 * 并把 token 写入 localStorage（供 E1-1-3 token 注入使用）。
 */
export function toProLoginResult(
  res: MallAPI.CommonResult<MallAPI.LoginToken>,
): MallAPI.ProLoginResult {
  const ok = res.code === 200 && !!res.data?.token;
  if (ok && res.data) {
    // 只存 token（tokenHead 固定为 "Bearer "，见后端 application.yml: jwt.tokenHead）
    saveToken(res.data.token);
  }
  return {
    status: ok ? 'ok' : 'error',
    type: 'account',
    token: res.data?.token,
    tokenHead: res.data?.tokenHead,
    message: ok ? undefined : res.message,
  };
}

// ================= E1-1-3 token 存储 / 注入 =================

const TOKEN_KEY = 'mall_admin_token';

export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage 不可用时静默失败（如隐私模式）
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** 是否属于 mall 后端路径（需要注入 token） */
export function isMallApiUrl(url: string): boolean {
  return (
    url.startsWith('/admin') ||
    url.startsWith('/product') ||
    url.startsWith('/brand') ||
    url.startsWith('/pms') ||
    url.startsWith('/oms') ||
    url.startsWith('/sms') ||
    url.startsWith('/cms')
  );
}

// ================= E1-1-4 分页转换 =================

/** 后端 CommonPage{pageNum,pageSize,totalPage,total,list} -> ProTable {data,total,current,pageSize,success} */
export function toProPageData<T>(
  res: MallAPI.CommonResult<MallAPI.CommonPage<T>>,
): MallAPI.PageData<T> {
  const page = res.data;
  return {
    data: page?.list ?? [],
    total: page?.total ?? 0,
    current: page?.pageNum ?? 1,
    pageSize: page?.pageSize ?? 10,
    success: res.code === 200,
  };
}

// ================= E1-1-5/6 商品字段拼写 + 数值归一化 =================

/** 单条商品转换：recommandStatus->recommendStatus；id/price 等数值归一化 */
export function toProduct(p: MallAPI.PmsProduct): MallAPI.Product {
  const { recommandStatus, id, price, promotionPrice, originalPrice, weight, ...rest } = p;
  return {
    ...rest,
    id: toSafeId(id),
    price: toNumber(price),
    promotionPrice: toNumber(promotionPrice),
    originalPrice: toNumber(originalPrice),
    weight: toNumber(weight),
    recommendStatus: toNumber(recommandStatus),
  };
}

/** 列表批量转换 */
export function toProducts(list: MallAPI.PmsProduct[]): MallAPI.Product[] {
  return (list ?? []).map(toProduct);
}

// ================= E1-1-6 数值工具 =================

/** 雪花 Long id 可能超过 2^53，保精度转为 string；小 id 转 number 便于比较 */
function toSafeId(id: number | undefined): string | number {
  if (id === undefined || id === null) return '';
  return Number.isSafeInteger(id) ? id : String(id);
}

/** BigDecimal/Long -> number，null/undefined -> undefined */
function toNumber(v: number | undefined): number | undefined {
  return v === undefined || v === null ? undefined : Number(v);
}

// ================= /admin/info -> ProCurrentUser =================

/** 后端 AdminInfo{username,menus,icon,roles} -> ProCurrentUser（兼容 API.CurrentUser） */
export function toProCurrentUser(
  res: MallAPI.CommonResult<MallAPI.AdminInfo>,
): MallAPI.ProCurrentUser | undefined {
  if (res.code !== 200 || !res.data) return undefined;
  const { username, menus, icon, roles } = res.data;
  return {
    name: username,
    userid: username,
    avatar: icon,
    roles: roles ?? [],
    menus: menus ?? [],
    access: roles?.[0] ?? 'admin',
  };
}
