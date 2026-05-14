'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LICENSE_CATEGORY_OPTIONS, LICENSE_CATEGORY_VALUES } from '@/constants/license-categories';
import { getApiErrorMessage } from '@/lib/api-client';
import { TrackedLink, useNavigationLoading } from '@/providers/navigation-loading-provider';
import { register as registerApplicant } from '@/services/auth-api';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Enter at least 2 characters'),
  institutionName: z
    .string()
    .min(1, 'Institution name is required')
    .min(2, 'Enter at least 2 characters'),
  institutionCategory: z
    .string()
    .min(1, 'Select an institution category')
    .refine(
      (value) => LICENSE_CATEGORY_VALUES.includes(value as (typeof LICENSE_CATEGORY_VALUES)[number]),
      'Select a valid institution category',
    ),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

const inputClassName =
  'mt-1.5 h-11 rounded-xl border-input bg-background text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-ring';

export default function RegisterPage() {
  const router = useRouter();
  const { startNavigation, stopNavigation } = useNavigationLoading();
  const [formError, setFormError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { institutionCategory: '' },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await registerApplicant({
        fullName: values.fullName.trim(),
        institutionName: values.institutionName.trim(),
        institutionCategory: values.institutionCategory,
        email: values.email.trim(),
        password: values.password,
      });
      toast.success('Request received. You will be notified once provisioned.');
      setIsRedirecting(true);
      startNavigation('/login');
      router.replace('/login');
    } catch (e) {
      setIsRedirecting(false);
      stopNavigation();
      setFormError(getApiErrorMessage(e, 'Registration failed'));
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="relative z-[1] w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card-lg backdrop-blur-md">
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
              <Label htmlFor="institutionName" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Institution / bank name
              </Label>
              <Input
                id="institutionName"
                autoComplete="organization"
                className={inputClassName}
                {...register('institutionName')}
              />
              {errors.institutionName ? (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.institutionName.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="institutionCategory" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Institution category
              </Label>
              <Select
                value={watch('institutionCategory')}
                onValueChange={(value) =>
                  setValue('institutionCategory', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="institutionCategory" className="mt-1.5">
                  <SelectValue placeholder="Select an institution category" />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.institutionCategory ? (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.institutionCategory.message}
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
              variant="applicant"
              className="h-11 w-full rounded-xl text-base font-semibold shadow-sm"
              disabled={isSubmitting || isRedirecting}
            >
              {isSubmitting || isRedirecting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <TrackedLink href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </TrackedLink>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <TrackedLink href="/" className="hover:text-foreground hover:underline">
            Back to home
          </TrackedLink>
        </p>
      </div>
    </main>
  );
}
