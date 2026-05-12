'use client';

import { Role } from '@nbr/shared';
import { FileText, ShieldCheck, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { homePathForRole } from '@/constants/routes';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { ready, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated && user) {
      router.replace(homePathForRole(user.role as Role));
    }
  }, [ready, isAuthenticated, user, router]);

  if (!ready) {
    return <FullPageLoader />;
  }

  if (isAuthenticated && user) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center text-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </div>
            <span className="text-sm font-medium text-foreground">NBR Licensing Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/applicant/applications/new"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Apply for a license
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-14 text-center sm:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Bank Licensing &amp; Compliance Portal
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Demo portal for bank licensing–style workflows: submit, review, and approve applications with a tamper-evident audit trail. For assessment
            purposes only; not an official regulator product.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/applicant/applications/new"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Start an application
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Staff sign in
            </Link>
          </div>
        </div>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-foreground">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold text-card-foreground">Versioned documents</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every resubmission preserves prior versions. Nothing is silently overwritten.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-foreground">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold text-card-foreground">Segregation of duties</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The reviewer who recommends approval can never be the approver who issues it.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-foreground">
              <Zap className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold text-card-foreground">Tamper-evident history</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every action is recorded in an audit trail you can verify at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
