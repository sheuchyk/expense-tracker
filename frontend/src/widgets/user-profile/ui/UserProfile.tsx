'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { authApi, useLogout } from '@/features/auth';
import type { User } from '@/entities/user';

export function UserProfile() {
  const logout = useLogout();
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
      });
    return () => {
      cancelled = true;
    };
  }, [logout]);

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
        <Button variant="outline" onClick={logout}>
          Выйти
        </Button>
      </CardContent>
    </Card>
  );
}
