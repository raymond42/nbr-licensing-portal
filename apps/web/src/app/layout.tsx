import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { LocatorDevTools } from '@/components/locator-dev-tools';
import { GlobalThemeToggle } from '@/components/global-theme-toggle';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <LocatorDevTools />
              <GlobalThemeToggle />
              {children}
              <Toaster richColors position="bottom-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
