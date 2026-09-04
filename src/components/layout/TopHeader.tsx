'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Settings, LogOut, Menu, X, Store } from 'lucide-react';
import { AuthService, CurrentUserProfile } from '@/services/authService';

interface TopHeaderProps {
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileNav,
  isMobileNavOpen = false,
}) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(AuthService.getCurrentUser());
  }, []);

  return (
    <header className="bg-ticketit-pink text-white w-full shadow-sm z-40 relative">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 h-20 flex items-center justify-between">
        {/* Left: Home Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded hover:bg-white/15 transition-colors flex items-center justify-center text-white"
            title="TicketIT Home"
            aria-label="TicketIT Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* Mobile navigation toggle */}
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="md:hidden p-1.5 rounded hover:bg-white/15 transition-colors text-white"
              aria-label="Toggle navigation menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Center: Brand Logo using actual brand asset */}
        <div className="flex-1 flex justify-center items-center select-none">
          <Link href="/" className="flex flex-col items-center group py-0.5">
            <img
              src="/images/ticketit-logo.png"
              alt="TicketIT - The ticketing solution that ticks all the boxes"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>
        </div>

        {/* Right: Store info & controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm sm:text-lg font-bold text-white leading-tight">
              {currentUser?.storeName || 'StandardStoreSetup'}
            </div>
            <div className="text-[12px] text-white/80 font-medium leading-none mt-0.5">
              {currentUser?.branchInfo || 'HeadOffice'}
            </div>
          </div>

          {/* Store visual thumbnail / frame matching screenshot */}
          <div className="w-10 h-10 rounded-xl bg-white border border-white/40 hidden md:flex items-center justify-center p-0.5 shadow-sm overflow-hidden" title="Active Branch Storefront">
            <div className="w-full h-full bg-[#EBF7F0] rounded-[2px] flex items-center justify-center text-ticketit-green">
              <Store className="w-6 h-6" />
            </div>
          </div>

          {/* Settings Icon Button */}
          <Link
            href="/Account/Edit/1"
            className="w-10 h-10 rounded-xl bg-white hover:bg-[#F2F5F8] text-ticketit-navy flex items-center justify-center transition-transform active:scale-95 shadow-sm"
            title="Settings / Account Administration"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 text-ticketit-navy" />
          </Link>

          {/* Logout Icon Button */}
          <Link
            href="/Account/Logout"
            className="w-10 h-10 rounded-xl bg-white hover:bg-[#F2F5F8] text-ticketit-navy flex items-center justify-center transition-transform active:scale-95 shadow-sm"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-6 h-6 text-ticketit-navy" />
          </Link>
        </div>
      </div>
    </header>
  );
};
