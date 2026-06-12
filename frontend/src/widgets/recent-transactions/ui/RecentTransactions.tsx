'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { transactionsApi } from '@/features/transactions/api/transactionsApi';
import type { TransactionsPage } from '@/entities/transaction/model/types';

const PAGE_SIZE = 10;

function formatAmount(amount: string, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '−';
  return `${sign} ${Number(amount).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function RecentTransactions() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TransactionsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    transactionsApi
      .list({ page, limit: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const pageCount = data?.pageCount ?? 1;
  const total = data?.total ?? 0;
  const transactions = data?.transactions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние транзакции</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Загрузка...</p>}
        {!isLoading && error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
        {!isLoading && !error && transactions.length === 0 && (
          <p className="text-sm text-muted-foreground">Транзакций пока нет.</p>
        )}
        {!isLoading && !error && transactions.length > 0 && (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                </div>
                <p
                  className={
                    tx.type === 'income'
                      ? 'shrink-0 text-sm font-semibold text-emerald-600'
                      : 'shrink-0 text-sm font-semibold text-destructive'
                  }
                >
                  {formatAmount(tx.amount, tx.type)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {total > 0
              ? `Страница ${page} из ${pageCount} · всего ${total}`
              : 'Нет данных'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
