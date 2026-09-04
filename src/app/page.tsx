'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Tag,
  Activity,
  UploadCloud,
  FileBarChart2,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Store,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ClientService } from '@/services/clientService';
import { UserService } from '@/services/userService';
import { ESLService } from '@/services/eslService';
import { UsageService } from '@/services/usageService';
import { INITIAL_ACTIVITY_LOGS } from '@/mock/initialData';
import { ActivityLog } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function HomePage() {
  const { showToast } = useToast();
  const [clientsCount, setClientsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [eslsCount, setEslsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setClientsCount(ClientService.getClients().length);
    setUsersCount(UserService.getUsers().length);
    setEslsCount(ESLService.getTags().length);
    setSessionsCount(UsageService.getSessions().length);
  }, []);

  const handleQuickSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      ESLService.forceUpdateAll();
      setIsSyncing(false);
      showToast('success', 'Global Catalog Synchronized', 'All store devices and ESL tags received updated pricing parameters.');
    }, 1200);
  };

  const metricCards = [
    {
      title: 'Active Retail Clients',
      value: clientsCount,
      sublabel: 'Enterprise store chains',
      icon: <Building2 className="w-5 h-5 text-ticketit-pink" />,
      href: '/DynamicClient',
      bg: 'bg-white',
    },
    {
      title: 'Total System Users',
      value: usersCount,
      sublabel: 'HQ, Regional & Franchisees',
      icon: <Users className="w-5 h-5 text-[#58B97D]" />,
      href: '/users',
      bg: 'bg-white',
    },
    {
      title: 'Active ESL Tags / Tickets',
      value: `${eslsCount * 12500}+`,
      sublabel: 'In-store shelf display tags',
      icon: <Tag className="w-5 h-5 text-[#FF7B83]" />,
      href: '/ESL/Management',
      bg: 'bg-white',
    },
    {
      title: 'Today\'s In-Store Sessions',
      value: sessionsCount,
      sublabel: 'Active POS & admin terminals',
      icon: <Activity className="w-5 h-5 text-ticketit-navy" />,
      href: '/Report/Usage',
      bg: 'bg-white',
    },
  ];

  const quickActions = [
    {
      title: 'User Administration',
      description: 'Manage Head Office, Regional Managers, and Franchisee accounts, spreadsheets, and invoicing.',
      href: '/users',
      icon: <Users className="w-5 h-5 text-white" />,
      color: 'bg-ticketit-pink',
      badge: 'Admin',
    },
    {
      title: 'ESL Management',
      description: 'Direct shelf-edge ESL assignment, model mapping, flash identification, and pricing push.',
      href: '/ESL/Management',
      icon: <Tag className="w-5 h-5 text-white" />,
      color: 'bg-[#58B97D]',
      badge: 'Live Tags',
    },
    {
      title: 'Import Client Data',
      description: 'Ingest and validate store catalogs, user spreadsheets, and pricing feeds with automated error detection.',
      href: '/Admin/ImportClient',
      icon: <UploadCloud className="w-5 h-5 text-white" />,
      color: 'bg-ticketit-navy',
      badge: 'Ingestion',
    },
    {
      title: 'Session Usage Report',
      description: 'Audit system usage, duration, user logins, and store activity across any date window.',
      href: '/Report/Usage',
      icon: <FileBarChart2 className="w-5 h-5 text-white" />,
      color: 'bg-[#FF7B83]',
      badge: 'Reports',
    },
    {
      title: 'Client Administration',
      description: 'Configure corporate retail clients, license tiers, active store allocations, and brand setups.',
      href: '/DynamicClient',
      icon: <Layers className="w-5 h-5 text-white" />,
      color: 'bg-[#3D3556]',
      badge: 'Directory',
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
              Communicate accurate in-store pricing, savings, promotional benefits, and electronic shelf labels (ESL) across your retail network in real time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Button
              variant="coral"
              size="md"
              onClick={handleQuickSync}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Sync All Stores
            </Button>
            <Link href="/ESL/Management">
              <Button variant="pink" size="md" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Open ESL Console
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Main Grid: Quick Access & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access Modules (2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ticketit-navy uppercase tracking-wider">
              Administration Modules
            </h2>
            <span className="text-xs text-ticketit-text-muted">StandardStoreSetup • HeadOffice</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {quickActions.map((action, idx) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.15 + idx * 0.04 }}
              >
                <Link
                  href={action.href}
                  className="flex items-start gap-3.5 p-4 bg-white border border-ticketit-border rounded-lg shadow-sm hover:border-ticketit-pink hover:shadow-md transition-all h-full group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="text-sm font-bold text-ticketit-navy group-hover:text-ticketit-pink transition-colors">
                        {action.title}
                      </h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-ticketit-navy uppercase">
                        {action.badge}
                      </span>
                    </div>
                    <p className="text-xs text-ticketit-text-muted leading-relaxed line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Activity & System Health (1 column) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ticketit-navy uppercase tracking-wider">
              Recent Store Activity
            </h2>
            <button
              onClick={() => showToast('info', 'Activity Stream Refreshed', 'Synced latest operational events.')}
              className="text-xs font-semibold text-ticketit-pink hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white border border-ticketit-border rounded-lg shadow-sm p-4 divide-y divide-[#EAEFF5]">
            {activities.map((act) => (
              <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                <div className="mt-0.5">
                  {act.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-ticketit-green" />}
                  {act.severity === 'warning' && <Activity className="w-4 h-4 text-ticketit-coral" />}
                  {act.severity === 'info' && <ShieldCheck className="w-4 h-4 text-ticketit-pink" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ticketit-navy truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-ticketit-text-muted whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-ticketit-text-muted mt-0.5 leading-snug">
                    {act.description}
                  </p>
                  <div className="text-[11px] text-gray-400 mt-1">
                    By <strong className="text-ticketit-navy">{act.user}</strong> • {act.storeName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
