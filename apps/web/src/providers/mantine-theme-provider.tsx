'use client';

import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

export function MantineThemeProvider({ children }: { children: ReactNode }) {
  return <MantineProvider forceColorScheme="light">{children}</MantineProvider>;
}
