'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ArrowLeftRight,
  Tags,
  Settings,
  History,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const nav = [
  { href: '/', label: 'Обзор', icon: LayoutGrid },
  { href: '/transactions', label: 'Транзакции', icon: ArrowLeftRight },
  { href: '/categories', label: 'Категории', icon: Tags },
  { href: '/settings', label: 'Настройки', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-10 px-6 py-8 lg:flex">
      <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
        Кошелёк
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface text-foreground shadow-soft group-hover:bg-accent',
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-3xl bg-panel p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
          <History className="h-5 w-5" strokeWidth={2} />
        </span>
        <p className="mt-4 text-sm font-bold text-white">История доступна</p>
        <p className="mt-1 text-xs leading-relaxed text-panel-muted">
          Смотрите недельные отчёты по своим транзакциям.
        </p>
      </div>
    </aside>
  );
}
