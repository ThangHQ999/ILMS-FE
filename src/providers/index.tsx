'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmProvider } from '@/components/shared/ConfirmProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ConfirmProvider>
          {children}
          <Toaster />
        </ConfirmProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
