'use client';

import React, { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CreateClientWizard } from '@/components/wizard/CreateClientWizard';

export default function AdminCreateClientPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Loading Wizard...</div>}>
        <CreateClientWizard />
      </Suspense>
    </AppShell>
  );
}
