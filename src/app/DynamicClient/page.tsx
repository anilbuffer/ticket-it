'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  SlidersHorizontal,
  Mail,
  Phone,
  Store,
  Tag,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableRowActions } from '@/components/ui/ActionIcons';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ClientService } from '@/services/clientService';
import { Client, ClientStatus } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function DynamicClientPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    industry: 'Supermarket & Grocery',
    activeStores: 10,
    activeESLs: 5000,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    region: 'Auckland & North Island',
    status: 'Active' as ClientStatus,
    licenseTier: 'Enterprise' as 'Enterprise' | 'Professional' | 'Starter',
    currency: 'NZD',
  });

  useEffect(() => {
    refreshClients();
  }, []);

  const refreshClients = () => {
    setClients(ClientService.getClients());
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.contactEmail) {
      showToast('error', 'Validation Error', 'Client Name, Code, and Contact Email are required.');
      return;
    }

    if (editingClient) {
      ClientService.updateClient(editingClient.id, formData);
      showToast('success', 'Client Updated', `${formData.name} settings saved.`);
      setEditingClient(null);
    } else {
      ClientService.createClient(formData);
      showToast('success', 'Client Created', `${formData.name} registered into TicketIT.`);
      setIsCreateModalOpen(false);
    }
    refreshClients();
  };

  const handleDeleteClient = () => {
    if (!deletingClient) return;
    ClientService.deleteClient(deletingClient.id);
    refreshClients();
    showToast('success', 'Client Removed', `${deletingClient.name} has been deleted.`);
    setDeletingClient(null);
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.contactEmail.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [clients, statusFilter, searchQuery]);

  const columns: Column<Client>[] = [
    {
      key: 'code',
      header: 'Client Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-ticketit-navy px-2 py-0.5 bg-gray-100 rounded text-xs">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Client Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-ticketit-navy text-sm">{row.name}</div>
          <div className="text-[11px] text-ticketit-text-muted">{row.industry}</div>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region / Territory',
      sortable: true,
      render: (row) => <span className="text-ticketit-navy">{row.region}</span>,
    },
    {
      key: 'activeStores',
      header: 'Active Stores',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 font-bold text-ticketit-navy">
          <Store className="w-3.5 h-3.5 text-gray-400" />
          <span>{row.activeStores}</span>
        </div>
      ),
    },
    {
      key: 'activeESLs',
      header: 'Active ESLs',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 font-semibold text-ticketit-navy">
          <Tag className="w-3.5 h-3.5 text-ticketit-pink" />
          <span>{row.activeESLs.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'contactEmail',
      header: 'Primary Contact',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-ticketit-navy">{row.contactName}</div>
          <div className="text-[11px] text-ticketit-text-muted flex items-center gap-1">
            <Mail className="w-3 h-3 text-gray-400" /> {row.contactEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-ticketit-text-muted whitespace-nowrap">
          {row.lastActivity}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Link
            href={`/DynamicClient/Create?clientId=${row.id}`}
            className="px-2.5 py-1 text-[11px] font-bold text-[#0084B4] bg-[#E8F4F9] hover:bg-[#D5EBF5] rounded border border-[#BCE1F0] transition-colors whitespace-nowrap flex items-center gap-1"
            title="Read / Edit Menu Steps Wizard"
          >
            <span>Wizard Steps</span>
          </Link>
          <TableRowActions
            onEdit={() => {
              setFormData({
                code: row.code,
                name: row.name,
                industry: row.industry,
                activeStores: row.activeStores,
                activeESLs: row.activeESLs,
                contactName: row.contactName,
                contactEmail: row.contactEmail,
                contactPhone: row.contactPhone,
                region: row.region,
                status: row.status,
                licenseTier: row.licenseTier,
                currency: row.currency,
              });
              setEditingClient(row);
            }}
            onDelete={() => setDeletingClient(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ticketit-navy tracking-tight">Clients</h1>
          <p className="text-xs text-ticketit-text-muted mt-0.5">
            Configure enterprise retail partitions, branch allocation limits, and active ESL fleet capacities.
          </p>
        </div>

        {/* Prominent Green CREATE CLIENT Button - Opens 9-Step Wizard */}
        <Link
          href="/DynamicClient/Create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[#4BAA38] hover:bg-[#3f912e] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CREATE CLIENT</span>
        </Link>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-ticketit-border rounded-lg p-4 sm:p-5 shadow-sm">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search clients by name, code, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-ticketit-border rounded text-ticketit-navy placeholder-gray-400 focus:border-ticketit-pink focus:outline-none font-medium"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="px-3 py-2 text-xs font-semibold border border-ticketit-border rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-ticketit-pink hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Large Client Data Table */}
        <DataTable
          columns={columns}
          data={filteredClients}
          keyField="id"
          selectable={true}
          selectedIds={selectedClientIds}
          onSelectionChange={setSelectedClientIds}
          initialRowsPerPage={10}
        />
      </div>

      {/* Create / Edit Client Modal */}
      <Modal
        isOpen={isCreateModalOpen || !!editingClient}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingClient(null);
        }}
        title={editingClient ? `Edit Client: ${editingClient.name}` : 'Create New Retail Client'}
        subtitle="Establish tenant partition, licensing tier, and hardware caps"
        headerColor="pink"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveClient} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Client Code <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SUP-NZ"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Client Name <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SuperValu Stores NZ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Industry Sector</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Region / Territory</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Active Stores</label>
              <input
                type="number"
                min="1"
                value={formData.activeStores}
                onChange={(e) => setFormData({ ...formData, activeStores: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Licensed ESL Tags</label>
              <input
                type="number"
                min="100"
                step="500"
                value={formData.activeESLs}
                onChange={(e) => setFormData({ ...formData, activeESLs: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full px-2.5 py-2 text-xs border border-ticketit-border rounded bg-white focus:border-ticketit-pink focus:outline-none font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Contact Name</label>
              <input
                type="text"
                placeholder="e.g. David Sterling"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Contact Email <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. ops@client.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-ticketit-border mt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingClient(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="green" size="sm" type="submit">
              {editingClient ? 'Save Client Changes' : 'Register Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteClient}
        title="Delete Retail Client Partition"
        message={`Are you sure you want to delete "${deletingClient?.name}" (${deletingClient?.code})? All associated stores and ESL links will be detached.`}
        confirmText="Delete Client"
      />
    </AppShell>
  );
}
