'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  Sparkles,
  X,
  Users,
  Store,
  Layers,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ClientService } from '@/services/clientService';
import { Client } from '@/types';

/* ──────────────── Brand Palette ──────────────── */
const BRAND = {
  pink:      '#F73582',
  pinkHover: '#E02772',
  navy:      '#2B253E',
  navyHover: '#1E192D',
  blush:     '#FF7B83',
  bg:        '#E7EAEF',
  border:    '#D9DDE5',
  headerBg:  '#E8EDF5',
  muted:     '#8A92A3',
  rowEven:   '#F8FAFD',
  rowOdd:    '#FFFFFF',
  hoverRow:  '#FFF2F7',
};

/* ──────────────── Small UI Helpers ──────────────── */
const ClientAvatar: React.FC<{ client: Client }> = ({ client }) => {
  if (client.wizardConfig?.logoUrl) {
    return (
      <div className="w-9 h-9 rounded-lg border border-[#E0E6ED] bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={client.wizardConfig.logoUrl} alt={client.name} className="w-full h-full object-contain" />
      </div>
    );
  }

  // Generate a subtle brand-tinted avatar from client initials
  const hue = client.name.charCodeAt(0) * 7 % 360;
  const bg  = `hsl(${hue}, 45%, 92%)`;
  const fg  = `hsl(${hue}, 50%, 35%)`;

  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm border"
      style={{ background: bg, color: fg, borderColor: `hsl(${hue}, 35%, 85%)` }}
    >
      {client.name.slice(0, 2).toUpperCase()}
    </div>
  );
};

/* ──────────────── Page Component ──────────────── */
export default function DynamicClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setClients(ClientService.getClients());
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const totalRows = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-12">
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative mb-6 rounded-xl overflow-hidden shadow-md"
          style={{
            background: `linear-gradient(135deg, ${BRAND.pink} 0%, #C8235F 50%, ${BRAND.navy} 100%)`,
          }}
        >
          {/* Decorative dots */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10 px-6 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white/90 text-[11px] font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                Client Administration
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Clients
              </h1>
              <p className="text-xs text-white/70 mt-1 max-w-lg leading-relaxed">
                Manage enterprise retail partitions, wizard configurations, and store deployment settings.
              </p>
            </div>

            {/* Create Client CTA */}
            <Link
              href="/DynamicClient/Create"
              className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg transition-all duration-200 self-start sm:self-center"
              style={{
                background: BRAND.pink,
                color: '#fff',
                boxShadow: '0 4px 14px rgba(247, 53, 130, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = BRAND.pinkHover;
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(247, 53, 130, 0.55)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = BRAND.pink;
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(247, 53, 130, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
              <span>Create Client</span>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="relative z-10 bg-white/10 backdrop-blur-sm border-t border-white/10 px-6 py-2.5 flex items-center gap-6 text-white/80 text-[11px] font-medium">
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> <strong className="text-white font-black">{clients.length}</strong> Total Clients</span>
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> <strong className="text-white font-black">{clients.filter(c => c.status === 'Active').length}</strong> Active</span>
            <span className="flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> <strong className="text-white font-black">{clients.reduce((a, c) => a + (c.activeStores || 0), 0).toLocaleString()}</strong> Stores</span>
          </div>
        </motion.div>

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-4"
        >
          <div
            className="relative max-w-md transition-all duration-200"
            style={{
              boxShadow: isSearchFocused ? `0 0 0 3px ${BRAND.pink}33` : 'none',
              borderRadius: '8px',
            }}
          >
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: isSearchFocused ? BRAND.pink : BRAND.muted }} />
            <input
              type="text"
              placeholder="Search clients by name or code..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-9 py-2 text-xs bg-white border rounded-lg font-medium transition-colors duration-200 focus:outline-none"
              style={{
                borderColor: isSearchFocused ? BRAND.pink : BRAND.border,
                color: BRAND.navy,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors"
                style={{ color: BRAND.muted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.pink)}
                onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.muted)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-xl overflow-hidden shadow-sm border"
          style={{ borderColor: BRAND.border, background: '#fff' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: BRAND.headerBg, borderBottom: `1px solid ${BRAND.border}` }}>
                  <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: BRAND.navy }}>
                    Client
                  </th>
                  <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-right w-52" style={{ color: BRAND.navy }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginatedClients.length === 0 ? (
                    <tr key="empty">
                      <td colSpan={2} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${BRAND.pink}12` }}>
                            <Building2 className="w-7 h-7" style={{ color: `${BRAND.pink}88` }} />
                          </div>
                          <div className="font-bold text-sm" style={{ color: BRAND.navy }}>
                            No clients found
                          </div>
                          <p className="text-xs max-w-xs leading-relaxed" style={{ color: BRAND.muted }}>
                            {searchQuery
                              ? `No matches for "${searchQuery}". Try a different search term.`
                              : 'Get started by creating your first client.'}
                          </p>
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="text-xs font-bold hover:underline"
                              style={{ color: BRAND.pink }}
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedClients.map((client, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <motion.tr
                          key={client.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15, delay: idx * 0.015 }}
                          className="group transition-colors duration-150 cursor-default"
                          style={{
                            background: isEven ? BRAND.rowEven : BRAND.rowOdd,
                            borderBottom: `1px solid #EDF1F7`,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = BRAND.hoverRow)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = isEven ? BRAND.rowEven : BRAND.rowOdd)}
                        >
                          {/* Client Name + Avatar */}
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-3">
                              <ClientAvatar client={client} />
                              <div>
                                <span
                                  className="font-bold text-[13px] transition-colors duration-150 group-hover:text-[#F73582]"
                                  style={{ color: BRAND.navy }}
                                >
                                  {client.name}
                                </span>
                                <span className="block text-[11px] font-medium" style={{ color: BRAND.muted }}>
                                  {client.code} · {client.industry || 'Retail'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-2.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/DynamicClient/Create?clientId=${encodeURIComponent(client.id)}&step=1&readOnly=true`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-150 shadow-xs"
                                style={{
                                  background: BRAND.navy,
                                  color: '#fff',
                                }}
                                title={`Read ${client.name}`}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = BRAND.navyHover;
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(43,37,62,.35)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = BRAND.navy;
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <Eye className="w-3 h-3" />
                                Read
                              </Link>

                              <Link
                                href={`/DynamicClient/Create?clientId=${encodeURIComponent(client.id)}&step=1`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-150 shadow-xs"
                                style={{
                                  background: BRAND.pink,
                                  color: '#fff',
                                }}
                                title={`Edit ${client.name}`}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = BRAND.pinkHover;
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(247,53,130,.35)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = BRAND.pink;
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div
            className="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t"
            style={{ borderColor: BRAND.border, color: BRAND.navy }}
          >
            <div style={{ color: BRAND.muted }} className="text-[11px]">
              Showing{' '}
              <strong style={{ color: BRAND.navy }}>{totalRows === 0 ? 0 : startIndex + 1}</strong>
              {' '}–{' '}
              <strong style={{ color: BRAND.navy }}>{endIndex}</strong>
              {' '}of{' '}
              <strong style={{ color: BRAND.navy }}>{totalRows}</strong> clients
            </div>

            <div className="flex items-center gap-4">
              {/* Rows per page */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: BRAND.muted }}>Rows</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="appearance-none bg-white border rounded-md px-2 py-1 pr-6 text-[11px] font-bold cursor-pointer focus:outline-none transition-colors"
                    style={{ borderColor: BRAND.border, color: BRAND.navy }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = BRAND.pink)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = BRAND.border)}
                  >
                    {[10, 25, 50, 100].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: BRAND.muted }} />
                </div>
              </div>

              {/* Page nav */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[11px]" style={{ color: BRAND.navy }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || totalRows === 0}
                  className="p-1 rounded-md border transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  style={{ borderColor: BRAND.border, color: BRAND.navy }}
                  aria-label="Previous page"
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = BRAND.pink; }}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = BRAND.border)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalRows === 0}
                  className="p-1 rounded-md border transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  style={{ borderColor: BRAND.border, color: BRAND.navy }}
                  aria-label="Next page"
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = BRAND.pink; }}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = BRAND.border)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5"
        >
          <Link
            href="/DynamicClient/Create"
            className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-200"
            style={{
              background: BRAND.pink,
              color: '#fff',
              boxShadow: '0 2px 8px rgba(247,53,130,.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = BRAND.pinkHover;
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(247,53,130,.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = BRAND.pink;
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(247,53,130,.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
            <span>Create Client</span>
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
