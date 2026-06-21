'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/shared/lib/auth-storage';

export function useRequireAuth(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authStorage.getToken()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  return ready;
}

export function useLogout() {
  const router = useRouter();
  return useCallback(() => {
    authStorage.clearToken();
    router.replace('/login');
  }, [router]);
}
