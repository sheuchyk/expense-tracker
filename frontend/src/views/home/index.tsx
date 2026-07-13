'use client';

import { Suspense } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { SummaryCards } from '@/widgets/summary-cards';
import { RecentTransactions } from '@/widgets/recent-transactions';
import { useRequireAuth } from '@/features/auth';

export function HomePage() {
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-canvas p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-[1400px]">
        <Sidebar />

        <main className="min-w-0 flex-1 rounded-[2rem] bg-surface p-5 shadow-card sm:p-8">
          <Topbar />

          <div className="mt-8 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Обзор
            </h1>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Фильтры
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-6">
            <Suspense>
              <SummaryCards />
            </Suspense>
          </div>

          <div className="mt-6">
            <Suspense>
              <RecentTransactions />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
