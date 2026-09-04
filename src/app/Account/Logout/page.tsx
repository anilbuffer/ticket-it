'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/authService';
import { useToast } from '@/components/ui/ToastContext';

export default function LogoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      AuthService.logout();
      showToast('info', 'Logged Out', 'Your session has been securely terminated.');
      router.push('/login');
    }, 600);
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto my-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-ticketit-border rounded-lg shadow-dropdown p-6 sm:p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-[#FFF0F2] text-ticketit-coral flex items-center justify-center mx-auto mb-4 border border-[#FFCDD5]">
            <LogOut className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h1 className="text-xl font-black text-ticketit-navy tracking-tight mb-2">
            Confirm Sign Out
          </h1>

          <p className="text-xs text-ticketit-text-muted leading-relaxed mb-6">
            Are you sure you want to log out of <strong>TicketIT</strong>? Any unsaved changes in current batch editors or tag pairing lists will be discarded.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                icon={<ArrowLeft className="w-4 h-4" />}
                disabled={isLoggingOut}
              >
                Cancel & Return
              </Button>
            </Link>

            <Button
              variant="coral"
              size="md"
              className="w-full sm:w-auto"
              onClick={handleConfirmLogout}
              isLoading={isLoggingOut}
              icon={<LogOut className="w-4 h-4" />}
            >
              Log Out Now
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-ticketit-border text-[11px] text-gray-400">
            StandardStoreSetup • HeadOffice Terminal
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
