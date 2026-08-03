// @ts-ignore
/* eslint-disable */
import { mallRequest, saveMallAuth, clearMallAuth } from './client';
import { toCurrentUser, toLoginResult } from './adapter';

/** 登录 POST /admin/login（成功后持久化 token，供后续请求注入） */
export async function mallLogin(
  params: Mall.LoginParams,
): Promise<Mall.LoginResult> {
  const token = await mallRequest<Mall.LoginToken>('/admin/login', {
    method: 'POST',
    data: params,
  });
  saveMallAuth(token);
  return toLoginResult(token);
}

/** 获取当前登录用户信息 GET /admin/info */
export async function mallGetUserInfo(): Promise<Mall.CurrentUser> {
  const info = await mallRequest<Mall.AdminInfo>('/admin/info', {
    method: 'GET',
  });
  return toCurrentUser(info);
}

/** 登出 POST /admin/logout */
export async function mallLogout(): Promise<void> {
  try {
    await mallRequest<null>('/admin/logout', { method: 'POST' });
  } finally {
    clearMallAuth();
  }
}
