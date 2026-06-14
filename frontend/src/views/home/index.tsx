'use client';

import { Suspense } from 'react';
import { MainMenu } from '@/widgets/main-menu';
import { RecentTransactions } from '@/widgets/recent-transactions';
import { UserProfile } from '@/widgets/user-profile';
import { useRequireAuth } from '@/features/auth';

export function HomePage() {
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <UserProfile />
        <MainMenu />
        <Suspense>
          <RecentTransactions />
        </Suspense>
      </div>
    </main>
  );
}
