'use client';

import { useEffect } from 'react';

/** Dev-only LocatorJS overlay; see https://www.locatorjs.com/install/react */
export function LocatorDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    void import('@locator/runtime').then((mod) => {
      mod.default();
    });
  }, []);

  return null;
}
