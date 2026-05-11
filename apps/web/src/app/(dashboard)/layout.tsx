import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r border-gray-200 bg-white p-6 md:block">
        <p className="text-lg font-semibold text-brand-dark">NBR Licensing Portal</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">Dashboard</p>
      </aside>
      <section className="flex-1 p-6">{children}</section>
    </div>
  );
}
