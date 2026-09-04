'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserCheck, Check, ChevronDown } from 'lucide-react';
import { AuthService } from '@/services/authService';
import { INITIAL_USERS } from '@/mock/initialData';
import { User } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [username, setUsername] = useState('admin.ho');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState<User>(
    INITIAL_USERS.find((u) => u.username === 'admin.ho') || INITIAL_USERS[0]
  );

  const demoAccounts = [
    {
      label: 'Head Office Super Admin',
      user: INITIAL_USERS.find((u) => u.username === 'admin.ho') || INITIAL_USERS[0],
      roleBadge: 'Super Admin',
      store: 'StandardStoreSetup',
    },
    {
      label: 'Regional Operations Manager',
      user: INITIAL_USERS.find((u) => u.username === 'rm.auckland') || INITIAL_USERS[3],
      roleBadge: 'Regional Manager',
      store: 'Auckland Operations',
    },
    {
      label: 'Franchisee Store Operator',
      user: INITIAL_USERS.find((u) => u.username === 'fran.albany') || INITIAL_USERS[6],
      roleBadge: 'Franchisee Operator',
      store: 'Albany Branch',
    },
  ];

  const handleSelectDemo = (demoUser: User) => {
    setSelectedDemoUser(demoUser);
    setUsername(demoUser.username);
    setPassword('password123');
    setShowDemoSelector(false);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const match =
        INITIAL_USERS.find((u) => u.username.toLowerCase() === username.trim().toLowerCase()) ||
        selectedDemoUser ||
        INITIAL_USERS[0];

      AuthService.loginAs(match);
      setIsLoading(false);
      showToast('success', `Welcome back, ${match.name}!`, `Logged in as ${match.role} (${match.storeName}).`);
      router.push('/');
    }, 450);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('info', 'Password Assistance', 'Reset instructions have been sent to your administrator email.');
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('info', 'Enterprise Registration', 'Please contact your retail IT administrator for access provision.');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative select-none font-sans"
      style={{
        backgroundColor: '#EAEFF5',
        backgroundImage: "url('/images/retail-doodle-bg.svg')",
        backgroundRepeat: 'repeat',
        backgroundSize: '360px 360px',
      }}
    >
      {/* Main Ticket Card */}
      <div className="w-full max-w-[840px] bg-white rounded-[16px] md:rounded-[20px] shadow-[0_12px_36px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] relative z-10 flex flex-col md:flex-row border border-gray-100/80">
        
        {/* Desktop Ticket Notch: Top */}
        <div
          className="hidden md:block absolute -top-[18px] left-[52%] -translate-x-1/2 w-9 h-9 rounded-full z-20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.06)] border-b border-gray-200/50"
          style={{
            backgroundColor: '#EAEFF5',
            backgroundImage: "url('/images/retail-doodle-bg.svg')",
            backgroundRepeat: 'repeat',
            backgroundSize: '360px 360px',
          }}
        />

        {/* Desktop Ticket Vertical Perforation Line */}
        <div className="hidden md:block absolute top-[18px] bottom-[18px] left-[52%] -translate-x-1/2 w-0 border-r border-dashed border-gray-300 z-10 pointer-events-none" />

        {/* Desktop Ticket Notch: Bottom */}
        <div
          className="hidden md:block absolute -bottom-[18px] left-[52%] -translate-x-1/2 w-9 h-9 rounded-full z-20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border-t border-gray-200/50"
          style={{
            backgroundColor: '#EAEFF5',
            backgroundImage: "url('/images/retail-doodle-bg.svg')",
            backgroundRepeat: 'repeat',
            backgroundSize: '360px 360px',
          }}
        />

        {/* Mobile Horizontal Notches & Line */}
        <div className="md:hidden">
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-[16px] w-8 h-8 rounded-full z-20 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.06)]"
            style={{
              backgroundColor: '#EAEFF5',
              backgroundImage: "url('/images/retail-doodle-bg.svg')",
              backgroundRepeat: 'repeat',
              backgroundSize: '360px 360px',
            }}
          />
          <div className="absolute left-[16px] right-[16px] top-1/2 -translate-y-1/2 h-0 border-b border-dashed border-gray-300 z-10 pointer-events-none" />
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-[16px] w-8 h-8 rounded-full z-20 shadow-[inset_2px_0_4px_rgba(0,0,0,0.06)]"
            style={{
              backgroundColor: '#EAEFF5',
              backgroundImage: "url('/images/retail-doodle-bg.svg')",
              backgroundRepeat: 'repeat',
              backgroundSize: '360px 360px',
            }}
          />
        </div>

        {/* LEFT COLUMN: Brand Identity & Pitch */}
        <div className="w-full md:w-[52%] p-8 sm:p-10 md:p-12 flex flex-col justify-between">
          {/* Logo Section */}
          <div className="flex flex-col items-start select-none">
            <img
              src="/images/ticketit-login-logo.svg"
              alt="TicketIT - Content Automation Display"
              className="h-14 sm:h-16 w-auto object-contain -ml-1.5"
            />
          </div>

          {/* Copy Body */}
          <div className="my-8 md:my-10">
            <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1E192D] leading-snug tracking-tight">
              The ticketing solution that ticks all the boxes
            </h2>
            <p className="text-xs sm:text-[13px] text-[#555E6D] leading-relaxed mt-3.5 font-normal">
              In-store tickets are critical as part of the path to purchase. In any retail transaction,
              communicating accurate pricing, savings, product details and benefits can be the difference
              between getting a profitable sale and not getting a sale at all.
            </p>
          </div>

          {/* 1-Click Role Switcher */}
          <div className="relative pt-2">
            <button
              type="button"
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100/90 border border-gray-200 text-xs text-[#4B5565] transition-colors"
            >
              <div className="flex items-center gap-1.5 truncate">
                <UserCheck className="w-3.5 h-3.5 text-[#F73582] shrink-0" />
                <span className="font-semibold text-[#1E192D]">{selectedDemoUser.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 truncate">{selectedDemoUser.role}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDemoSelector ? 'rotate-180' : ''}`} />
            </button>

            {showDemoSelector && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-white rounded-lg shadow-dropdown border border-gray-200 p-1.5 z-30 flex flex-col gap-1">
                <div className="text-[10px] font-bold text-gray-400 px-2 py-0.5 uppercase tracking-wider">
                  Switch Demo User
                </div>
                {demoAccounts.map((item) => {
                  const isSelected = selectedDemoUser.username === item.user.username;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectDemo(item.user)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#FFF5F8] text-[#F73582] font-semibold'
                          : 'hover:bg-gray-50 text-[#1E192D]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{item.user.name}</div>
                        <div className="text-[10px] text-gray-500">{item.label}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F73582]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Form */}
        <div className="w-full md:w-[48%] p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-[22px] font-bold text-[#1E192D] tracking-tight">
              Welcome back!
            </h1>
            <p className="text-xs sm:text-[13px] text-[#717A8C] mt-0.5">
              Login to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="flex flex-col">
            {/* Username Field */}
            <div className="mb-3">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-[#3D4556] mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3.5 py-2 text-xs sm:text-[13px] text-[#1E192D] placeholder-[#9CA3AF] bg-white border border-[#D9DDE5] rounded focus:border-[#F73582] focus:ring-1 focus:ring-[#F73582] focus:outline-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="mb-2.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#3D4556] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2 text-xs sm:text-[13px] text-[#1E192D] placeholder-[#9CA3AF] bg-white border border-[#D9DDE5] rounded focus:border-[#F73582] focus:ring-1 focus:ring-[#F73582] focus:outline-none transition-all"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between my-2 text-xs">
              <label className="flex items-center gap-1.5 text-xs text-[#4B5565] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#F73582] focus:ring-[#F73582] w-3.5 h-3.5 cursor-pointer accent-[#F73582]"
                />
                <span className="text-[12px] text-[#4B5565]">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[12px] text-[#F73582] hover:text-[#E2246F] font-medium transition-colors"
              >
                Forgot Password
              </button>
            </div>

            {/* Sign In Button with Icon */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 w-full bg-[#F73582] hover:bg-[#E2246F] active:bg-[#CC195E] text-white rounded flex items-center justify-center relative py-2.5 px-4 font-semibold text-xs tracking-wide transition-all shadow-[0_2px_4px_rgba(247,53,130,0.25)] disabled:opacity-75 cursor-pointer group"
            >
              {/* Left icon badge matching reference */}
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-[#E2246F] group-hover:bg-[#CC195E] w-6 h-6 rounded flex items-center justify-center text-white transition-colors">
                <LogIn className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>

              <span className="text-xs sm:text-[13px] font-bold">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </span>
            </button>

            {/* Don't have an account? Register */}
            <div className="mt-4 text-center text-xs text-[#4B5565]">
              <span>Don't have an account?</span>{' '}
              <button
                type="button"
                onClick={handleRegister}
                className="text-[#F73582] hover:text-[#E2246F] font-semibold hover:underline transition-colors"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
