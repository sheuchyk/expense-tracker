import { apiRequest } from '@/shared/api/base';
import type { TransactionsPage } from '@/entities/transaction/model/types';

export const DEFAULT_PAGE_SIZE = 10;

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
}

function toQuery(params: ListTransactionsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const transactionsApi = {
  list: (params: ListTransactionsParams = {}) =>
    apiRequest<TransactionsPage>(`/transactions${toQuery(params)}`),
};
