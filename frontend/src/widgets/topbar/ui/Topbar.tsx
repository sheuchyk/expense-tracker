'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { authApi, useLogout } from '@/features/auth';
import type { User } from '@/entities/user';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Topbar() {
  const logout = useLogout();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        /* handled by useRequireAuth */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Привет,</p>
        <p className="font-display text-xl font-bold tracking-tight text-ink">
          {user ? user.name : 'Загрузка…'}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm text-muted-foreground md:flex">
          <Search className="h-4 w-4" strokeWidth={2} />
          <input
            type="search"
            placeholder="Поиск"
            aria-label="Поиск по транзакциям"
            className="w-40 bg-transparent placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <button
          type="button"
          aria-label="Уведомления"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground shadow-soft transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        <div className="flex items-center gap-3 rounded-full bg-surface py-1 pl-1 pr-2 shadow-soft">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {user ? initials(user.name) : '—'}
          </span>
          <button
            type="button"
            onClick={logout}
            aria-label="Выйти"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
