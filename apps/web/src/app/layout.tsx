import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/providers/auth-provider';
import { MantineThemeProvider } from '@/providers/mantine-theme-provider';
import { NavigationLoadingProvider } from '@/providers/navigation-loading-provider';
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
            <NavigationLoadingProvider>
              <AuthProvider>
                {children}
                <Toaster richColors position="top-right" />
              </AuthProvider>
            </NavigationLoadingProvider>
          </QueryProvider>
        </MantineThemeProvider>
      </body>
    </html>
  );
}
