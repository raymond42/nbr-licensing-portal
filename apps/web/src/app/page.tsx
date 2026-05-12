'use client';

import { Role } from '@nbr/shared';
import { FileText, ShieldCheck, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { homePathForRole } from '@/constants/routes';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gradient-to-b dark:from-[#0B1B3A] dark:via-[#040915] dark:to-[#020617] dark:text-gray-100">
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#020617]/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 pr-12 sm:pr-14">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200/70 bg-white/60 text-gray-900 dark:border-white/10 dark:bg-white/5">
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">BNR Licensing Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/applicant/applications/new"
              className="inline-flex items-center justify-center rounded-lg bg-[#0B3D91] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#072A66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91]"
            >
              Apply for a license
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-14 text-center sm:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white">
            Bank Licensing &amp; Compliance Portal
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300">
            A single source of truth for the National Bank of Rwanda&apos;s licensing of commercial banks and financial institutions. Submit, review,
            and approve applications with a permanent, tamper-evident audit trail.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/applicant/applications/new"
              className="inline-flex items-center justify-center rounded-lg bg-[#0B3D91] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#072A66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91]"
            >
              Start an application
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
            >
              Staff sign in
            </Link>
          </div>
        </div>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white/90">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">Versioned documents</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Every resubmission preserves prior versions. Nothing is silently overwritten.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white/90">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">Segregation of duties</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              The reviewer who recommends approval can never be the approver who issues it.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white/90">
              <Zap className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">Tamper-evident history</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Every action is recorded in an audit trail you can verify at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
