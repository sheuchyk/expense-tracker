'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/shared/lib/auth-storage';

// Токен не меняется в течение жизни хука — подписка не нужна, читаем снапшот.
const noopSubscribe = () => () => {};

export function useRequireAuth(): boolean {
  const router = useRouter();
  const hasToken = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(authStorage.getToken()),
    () => false, // на сервере токена нет — рендерим как «не готово»
  );

  useEffect(() => {
    if (!hasToken) {
      router.replace('/login');
    }
  }, [hasToken, router]);

  return hasToken;
}

export function useLogout() {
  const router = useRouter();
  return useCallback(() => {
    authStorage.clearToken();
    router.replace('/login');
  }, [router]);
}
