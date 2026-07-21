'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { transactionsApi, DEFAULT_PAGE_SIZE } from '@/features/transactions';
import type { TransactionsPage } from '@/entities/transaction';
import { cn } from '@/shared/lib/utils';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  // Результат загрузки хранит страницу, к которой он относится, чтобы
  // isLoading/error/data выводились через рендер, а не сбрасывались
  // синхронным setState внутри эффекта.
  const [loaded, setLoaded] = useState<{
    page: number;
    data: TransactionsPage | null;
    error: string | null;
  }>({ page: 0, data: null, error: null });

  const isCurrent = loaded.page === page;
  const isLoading = !isCurrent;
  const error = isCurrent ? loaded.error : null;
  const data = isCurrent ? loaded.data : null;

  const navigate = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    let cancelled = false;
    transactionsApi
      .list({ page, limit: DEFAULT_PAGE_SIZE })
      .then((res) => {
        if (!cancelled) setLoaded({ page, data: res, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setLoaded({
            page,
            data: null,
            error: err instanceof Error ? err.message : 'Ошибка загрузки',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const pageCount = data?.pageCount ?? 1;
  const total = data?.total ?? 0;
  const transactions = data?.transactions ?? [];

  return (
    <section className="rounded-3xl bg-surface p-6 shadow-soft">
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">Последние операции</h2>

      <div className="mt-5">
        {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Загрузка…</p>}
        {!isLoading && error && <p className="py-8 text-center text-sm font-medium text-negative">{error}</p>}
        {!isLoading && !error && transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Операций пока нет. Добавьте первую транзакцию.
          </p>
        )}
        {!isLoading && !error && transactions.length > 0 && (
          <ul className="flex flex-col gap-1">
            {transactions.map((tx) => {
              const income = tx.type === 'income';
              return (
                <li
                  key={tx.id}
                  className="flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-secondary"
                >
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                      income ? 'bg-mint text-mint-ink' : 'bg-peach text-peach-ink',
                    )}
                  >
                    {income ? (
                      <ArrowDownLeft className="h-5 w-5" strokeWidth={2} />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                  <p className={cn('shrink-0 text-sm font-bold tabular-nums', income ? 'text-positive' : 'text-ink')}>
                    {formatAmount(tx.amount, tx.type)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
        <p className="text-xs text-muted-foreground">
          {total > 0 ? `Страница ${page} из ${pageCount} · всего ${total}` : 'Нет данных'}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => navigate(page - 1)}>
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount || isLoading}
            onClick={() => navigate(page + 1)}
          >
            Вперёд
          </Button>
        </div>
      </div>
    </section>
  );
}
