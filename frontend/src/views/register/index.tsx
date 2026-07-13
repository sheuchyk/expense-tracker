import { RegisterForm } from '@/features/auth/ui/RegisterForm';

export function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas p-4">
      <span className="font-display text-2xl font-bold tracking-tight text-ink">Кошелёк</span>
      <RegisterForm />
    </main>
  );
}
