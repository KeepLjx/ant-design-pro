// @ts-ignore
/* eslint-disable */
import { mallRequest } from './client';
import { toProductListResult } from './adapter';

/** 查询商品（分页）GET /product/list */
export async function mallFetchProductList(
  params: Mall.ProductQueryParams = {},
): Promise<Mall.ProductListResult> {
  const page = await mallRequest<Mall.ProductPageData>('/product/list', {
    method: 'GET',
    params: {
      pageNum: 1,
      pageSize: 5,
      ...params,
    },
  });
  return toProductListResult(page);
}
