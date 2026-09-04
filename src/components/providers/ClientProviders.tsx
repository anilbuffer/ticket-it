'use client';

import React, { ReactNode } from 'react';
import { ToastProvider } from '../ui/ToastContext';

export function ClientProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
