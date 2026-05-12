'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { register as registerApplicant } from '@/services/auth-api';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Enter at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

const inputClassName =
  'mt-1.5 h-11 rounded-xl border-muted bg-background text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-primary dark:border-slate-600 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500';

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await registerApplicant({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success('Request received. You will be notified once provisioned.');
      router.replace('/login');
    } catch (e) {
      setFormError(getApiErrorMessage(e, 'Registration failed'));
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Applicant portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">
            Submit your details. An administrator will review and activate your access.
          </p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <Label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full name
              </Label>
              <Input id="fullName" autoComplete="name" className={inputClassName} {...register('fullName')} />
              {errors.fullName ? (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input id="email" type="email" autoComplete="email" className={inputClassName} {...register('email')} />
              {errors.email ? (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password <span className="font-normal normal-case text-muted-foreground">(min 8 characters)</span>
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
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
              className="h-11 w-full rounded-xl bg-applicant text-base font-semibold text-white shadow-sm hover:bg-applicant-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
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
