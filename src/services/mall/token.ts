/**
 * mall 后端 token 存取工具
 * 后端登录返回 { token, tokenHead }，请求头约定为 tokenHeader: 'Authorization'
 * 值为 `${tokenHead}${token}`，如 "Bearer eyJhbGciOi..."
 */
const TOKEN_KEY = 'mall_admin_token';
const TOKEN_HEAD_KEY = 'mall_admin_token_head';

/** 保存登录凭证（含 tokenHead，如 "Bearer "） */
export function saveMallToken(token: string, tokenHead: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_HEAD_KEY, tokenHead);
}

/** 读取完整 Authorization 头值；未登录返回 null */
export function getMallAuthorization(): string | null {
  if (typeof localStorage === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const tokenHead = localStorage.getItem(TOKEN_HEAD_KEY) ?? 'Bearer ';
  return `${tokenHead}${token}`;
}

/** 清除登录凭证（登出） */
export function clearMallToken(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_HEAD_KEY);
}
