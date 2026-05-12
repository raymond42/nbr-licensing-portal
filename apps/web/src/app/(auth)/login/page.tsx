'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@nbr/shared';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { homePathForRole } from '@/constants/routes';
import { getApiErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const inputClassName =
  'mt-1.5 h-11 rounded-xl border-muted bg-background text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-primary dark:border-slate-600 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const signedIn = await login({ email: values.email.trim(), password: values.password });
      const next = searchParams.get('next');
      if (next) {
        router.replace(decodeURIComponent(next));
        return;
      }
      router.replace(homePathForRole(signedIn.role as Role));
    } catch (e) {
      setFormError(getApiErrorMessage(e, 'Sign-in failed'));
    }
  }

  return (
    <main
      className={cn(
        'relative flex min-h-screen flex-col items-center justify-center px-4 py-12',
        'bg-gradient-to-b from-slate-50 via-white to-slate-100',
        'dark:from-[#070f1c] dark:via-[#0a1628] dark:to-black',
      )}
    >
      <div className="relative z-[1] w-full max-w-md">
        <div
          className={cn(
            'rounded-2xl border p-8 shadow-card-lg backdrop-blur-md',
            'border-slate-200/80 bg-white/85',
            'dark:border-white/10 dark:bg-slate-900/55',
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm',
                'border-primary/20 bg-primary/10 text-primary',
                'dark:border-primary/30 dark:bg-primary/15',
              )}
            >
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">Sign in</h1>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">
                National Bank of Rwanda — Licensing Portal
              </p>
            </div>
          </div>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                className={inputClassName}
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className={inputClassName}
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <Button
              type="submit"
              className="h-11 w-full rounded-xl text-base font-semibold shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New applicant?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
