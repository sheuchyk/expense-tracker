'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { authApi } from '@/features/auth/api/authApi';
import type { User } from '@/entities/user/model/types';

export function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Не удалось загрузить профиль');
        localStorage.removeItem('accessToken');
        router.replace('/login');
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.replace('/login');
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">Привет,</p>
          <p className="text-xl font-semibold">
            {user ? user.name : error ? '—' : 'Загрузка...'}
          </p>
          {user && <p className="text-sm text-muted-foreground">{user.email}</p>}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Выйти
        </Button>
      </CardContent>
    </Card>
  );
}
