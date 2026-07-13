'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { transactionsApi } from '@/features/transactions';
import type { TransactionsSummary } from '@/entities/transaction';
import { cn } from '@/shared/lib/utils';

function formatMoney(value: string | number): string {
  return Number(value).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Hand-drawn-style sparkline that gives each tile its accent gesture. */
function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 90 40" className="h-10 w-24" fill="none" aria-hidden>
      <path
        d="M2 30 C 12 30, 16 12, 26 14 S 40 32, 50 26 S 66 6, 78 12 88 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tiles = [
  {
    key: 'balance' as const,
    label: 'Баланс',
    bg: 'bg-lilac',
    spark: '#4a58c9',
    icon: Wallet,
  },
  {
    key: 'income' as const,
    label: 'Доходы',
    bg: 'bg-mint',
    spark: '#1f7a4d',
    icon: ArrowDownLeft,
  },
  {
    key: 'expense' as const,
    label: 'Расходы',
    bg: 'bg-peach',
    spark: '#c9702f',
    icon: ArrowUpRight,
  },
];

export function SummaryCards() {
  const [summary, setSummary] = useState<TransactionsSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    transactionsApi
      .list({ page: 1, limit: 1 })
      .then((res) => {
        if (!cancelled) setSummary(res.summary);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const values: Record<'balance' | 'income' | 'expense', string> = {
    balance: summary?.balance ?? '0',
    income: summary?.totalIncome ?? '0',
    expense: summary?.totalExpense ?? '0',
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tiles.map(({ key, label, bg, spark, icon: Icon }) => (
        <div key={key} className={cn('rounded-3xl p-5', bg)}>
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-panel text-white">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <Sparkline color={spark} />
          </div>
          <p className="mt-5 font-display text-2xl font-bold tracking-tight text-ink tabular-nums sm:text-[28px]">
            {summary || error ? formatMoney(values[key]) : '—'}
            <span className="ml-1 align-baseline text-base font-semibold text-ink/50">₽</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-ink/60">{label}</p>
        </div>
      ))}
    </div>
  );
}
