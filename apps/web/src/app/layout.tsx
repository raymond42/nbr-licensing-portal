import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'NBR Licensing Portal',
  description:
    'Regulatory workflow and compliance management platform for the National Bank of Rwanda.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
