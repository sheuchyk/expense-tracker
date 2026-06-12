import Link from 'next/link';
import { Card, CardContent } from '@/shared/ui/card';

const items = [
  {
    href: '/transactions',
    title: 'Транзакции',
    description: 'Доходы и расходы',
  },
  {
    href: '/categories',
    title: 'Категории',
    description: 'Организация транзакций',
  },
];

export function MainMenu() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="block focus:outline-none">
          <Card className="h-full transition-colors hover:bg-accent">
            <CardContent className="p-6">
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
