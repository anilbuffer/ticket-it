'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Activity,
  UploadCloud,
  FileBarChart2,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ClientService } from '@/services/clientService';
import { UserService } from '@/services/userService';
import { UsageService } from '@/services/usageService';
import { useToast } from '@/components/ui/ToastContext';

export default function HomePage() {
  const { showToast } = useToast();
  const [clientsCount, setClientsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);

  useEffect(() => {
    setClientsCount(ClientService.getClients().length);
    setUsersCount(UserService.getUsers().length);
    setSessionsCount(UsageService.getSessions().length);
  }, []);

  const metricCards = [
    {
      title: 'Active Retail Clients',
      value: clientsCount,
      sublabel: 'Enterprise store chains',
      icon: <Building2 className="w-5 h-5 text-ticketit-pink" />,
      href: '/DynamicClient',
    },
    {
      title: 'Total System Users',
      value: usersCount,
      sublabel: 'HQ, Regional & Franchisees',
      icon: <Users className="w-5 h-5 text-[#58B97D]" />,
      href: '/users',
    },
    {
      title: 'In-Store Sessions',
      value: sessionsCount,
      sublabel: 'Active POS & admin terminals',
      icon: <Activity className="w-5 h-5 text-[#0084B4]" />,
      href: '/Report/Usage',
    },
    {
      title: 'Data Import Feeds',
      value: '4 Active',
      sublabel: 'Catalogs & price feeds',
      icon: <UploadCloud className="w-5 h-5 text-ticketit-navy" />,
      href: '/Admin/ImportClient',
    },
  ];

  return (
    <AppShell>
      {/* Welcome Banner */}
      <div className="bg-white border border-ticketit-border rounded-lg p-5 sm:p-7 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-ticketit-pink/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-ticketit-pink/10 text-ticketit-pink text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              TicketIT Enterprise Retail Hub
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-ticketit-navy tracking-tight">
              “The ticketing solution that ticks all the boxes”
            </h1>
            <p className="text-xs sm:text-sm text-ticketit-text-muted mt-1.5 max-w-3xl leading-relaxed">
              Communicate accurate in-store pricing, savings, promotional benefits, and branch catalog updates across your retail network in real time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link href="/DynamicClient">
              <Button
                variant="pink"
                size="md"
                icon={<Layers className="w-4 h-4" />}
              >
                Client Administration
              </Button>
            </Link>
            <Link href="/users">
              <Button
                variant="outline"
                size="md"
                icon={<Users className="w-4 h-4 text-ticketit-navy" />}
              >
                User Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
          >
            <Link
              href={card.href}
              className="block bg-white border border-ticketit-border rounded-lg p-4 sm:p-5 shadow-sm hover:border-ticketit-pink hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-ticketit-text-muted uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="p-2 rounded-md bg-gray-50 group-hover:bg-ticketit-pink/10 transition-colors">
                  {card.icon}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-ticketit-navy">
                {card.value}
              </div>
              <div className="text-[11px] text-ticketit-text-muted mt-1 flex items-center justify-between">
                <span>{card.sublabel}</span>
                <span className="text-ticketit-pink font-semibold group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
