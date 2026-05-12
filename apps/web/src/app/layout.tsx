import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { LocatorDevTools } from '@/components/locator-dev-tools';
import { AuthProvider } from '@/providers/auth-provider';
import { MantineThemeProvider } from '@/providers/mantine-theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import '@mantine/core/styles.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'NBR Licensing Portal',
  description:
    'Assessment demo: regulatory workflow UI for licensing-style applications (not affiliated with the National Bank of Rwanda).',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <MantineThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <LocatorDevTools />
              {children}
              <Toaster richColors position="bottom-right" />
            </AuthProvider>
          </QueryProvider>
        </MantineThemeProvider>
      </body>
    </html>
  );
}
