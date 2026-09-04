'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Store, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/authService';
import { INITIAL_USERS } from '@/mock/initialData';
import { User } from '@/types';
import { ToastProvider, useToast } from '@/components/ui/ToastContext';

function LoginContent() {
  const router = useRouter();
  const { showToast } = useToast();

  const [username, setUsername] = useState('admin.ho');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      label: 'Head Office Super Admin',
      user: INITIAL_USERS.find((u) => u.username === 'admin.ho') || INITIAL_USERS[0],
      badge: 'Super Admin',
      color: 'border-ticketit-pink bg-[#FFF5F8]',
    },
    {
      label: 'Regional Operations Manager',
      user: INITIAL_USERS.find((u) => u.username === 'rm.auckland') || INITIAL_USERS[3],
      badge: 'Regional Manager',
      color: 'border-[#58B97D] bg-[#F2FAF5]',
    },
    {
      label: 'Franchisee Store Operator',
      user: INITIAL_USERS.find((u) => u.username === 'fran.albany') || INITIAL_USERS[6],
      badge: 'Franchisee',
      color: 'border-[#3D3556] bg-gray-50',
    },
  ];

  const handleQuickLogin = (demoUser: User) => {
    AuthService.loginAs(demoUser);
    showToast(
      'success',
      `Welcome, ${demoUser.name}`,
      `Logged into TicketIT as ${demoUser.role} (${demoUser.storeName}).`
    );
    router.push('/');
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const match = INITIAL_USERS.find((u) => u.username === username) || INITIAL_USERS[0];
      AuthService.loginAs(match);
      setIsLoading(false);
      showToast('success', `Welcome back, ${match.name}`, 'Session established.');
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#E7EAEF] flex flex-col justify-between font-sans">
      {/* Top Simple Header */}
      <header className="bg-ticketit-pink py-3 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <img
            src="/images/ticketit-logo.png"
            alt="TicketIT"
            className="h-9 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg bg-white border border-ticketit-border rounded-xl shadow-dropdown p-6 sm:p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-ticketit-navy tracking-tight">
              Retail Console Sign In
            </h1>
            <p className="text-xs text-ticketit-text-muted mt-1">
              “The ticketing solution that ticks all the boxes”
            </p>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mb-6 pb-6 border-b border-ticketit-border">
            <div className="text-xs font-extrabold text-ticketit-navy uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>1-Click Demo Profiles</span>
              <span className="text-[10px] text-ticketit-pink font-semibold">Instant Access</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickLogin(item.user)}
                  className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99] ${item.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-ticketit-navy" />
                    <div>
                      <div className="text-xs font-bold text-ticketit-navy">{item.user.name}</div>
                      <div className="text-[11px] text-ticketit-text-muted">{item.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-ticketit-navy">
                      {item.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-ticketit-pink" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Credential Form */}
          <form onSubmit={handleStandardSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Username / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none font-medium"
                />
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none font-medium"
                />
                <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <Button
              variant="pink"
              size="md"
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Console
            </Button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-ticketit-text-muted">
        TicketIT In-Store Ticketing Platform • v3.8.4 Enterprise Retail Suite
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}
