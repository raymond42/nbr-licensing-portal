'use client';

import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

/** Matches app shell: light UI with gold/green brand (Stepper, etc.). */
export function MantineThemeProvider({ children }: { children: ReactNode }) {
  return <MantineProvider forceColorScheme="light">{children}</MantineProvider>;
}
