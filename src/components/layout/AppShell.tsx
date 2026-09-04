'use client';

import React, { useState, ReactNode } from 'react';
import { TopHeader } from './TopHeader';
import { PrimaryNav } from './PrimaryNav';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ticketit-bg flex flex-col font-sans text-ticketit-navy">
      {/* Top Branded Pink Header */}
      <TopHeader
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />

      {/* Primary Navigation Bar */}
      <PrimaryNav
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {children}
      </main>

      {/* Clean Enterprise Footer */}
      <footer className="bg-[#DCE1E9] border-t border-ticketit-border py-3 text-xs text-ticketit-text-muted mt-auto">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ticketit-navy">TicketIT</span>
            <span>— “The ticketing solution that ticks all the boxes”</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ticketit-green inline-block animate-pulse" />
              All Systems Operational
            </span>
            <span>v3.8.4 Enterprise</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
