'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', exact: true },
  { label: 'User Administration', href: '/users' },
  { label: 'Import Client Data', href: '/Admin/ImportClient' },
  { label: 'Use Report', href: '/Report/Usage' },
  { label: 'Client Administration', href: '/DynamicClient' },
  { label: 'ESL Management', href: '/ESL/Management' },
  { label: 'Your Account', href: '/Account/Edit/1' },
  { label: 'Log out', href: '/Account/Logout' },
];

interface PrimaryNavProps {
  isMobileNavOpen?: boolean;
  onCloseMobileNav?: () => void;
}

export const PrimaryNav: React.FC<PrimaryNavProps> = ({
  isMobileNavOpen = false,
  onCloseMobileNav,
}) => {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav className="bg-[#E7EAEF] border-b border-ticketit-border w-full hidden md:block">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-3 px-3.5 text-xs sm:text-[13px] font-bold tracking-wider uppercase whitespace-nowrap transition-colors duration-150 ${
                    active
                      ? 'text-ticketit-pink'
                      : 'text-ticketit-navy hover:text-ticketit-pink hover:bg-black/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-ticketit-pink" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={onCloseMobileNav}>
          <div
            className="w-4/5 max-w-xs h-full bg-[#E7EAEF] p-4 flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-ticketit-border mb-3">
              <div className="text-sm font-extrabold text-ticketit-navy uppercase tracking-wider">
                Menu Navigation
              </div>
              <button
                type="button"
                onClick={onCloseMobileNav}
                className="text-gray-500 hover:text-ticketit-navy font-bold text-sm px-2 py-1"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobileNav}
                    className={`px-3.5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-ticketit-pink text-white shadow-sm'
                        : 'text-ticketit-navy hover:bg-black/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && <span className="text-xs">▶</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
