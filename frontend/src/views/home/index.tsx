'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainMenu } from '@/widgets/main-menu/ui/MainMenu';
import { RecentTransactions } from '@/widgets/recent-transactions/ui/RecentTransactions';
import { UserProfile } from '@/widgets/user-profile/ui/UserProfile';

export function HomePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) return null;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <UserProfile />
        <MainMenu />
        <RecentTransactions />
      </div>
    </main>
  );
}
