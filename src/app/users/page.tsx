'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  Building,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { SecondaryTabs } from '@/components/layout/SecondaryTabs';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableRowActions } from '@/components/ui/ActionIcons';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserService } from '@/services/userService';
import { ClientService } from '@/services/clientService';
import { AuthService } from '@/services/authService';
import { User, UserGroup, UserRole } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function UsersPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeGroupTab, setActiveGroupTab] = useState<UserGroup>('Head Office');
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isUploadNewModalOpen, setIsUploadNewModalOpen] = useState(false);
  const [isUploadUpdateModalOpen, setIsUploadUpdateModalOpen] = useState(false);

  // New User Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    region: 'Auckland North',
    storeCategory: 'Supermarket Metro',
    group: 'Head Office' as UserGroup,
    role: 'Super Admin' as UserRole,
    invoicing: true,
    storeName: 'StandardStoreSetup',
    phone: '',
    department: '',
  });

  useEffect(() => {
    refreshUsers();
    const allClients = ClientService.getClients().map((c) => c.name);
    setClients(['All Clients', ...allClients]);
  }, []);

  const refreshUsers = () => {
    setUsers(UserService.getUsers());
  };

  const handleToggleInvoicing = (user: User) => {
    UserService.toggleInvoicing(user.id);
    refreshUsers();
    showToast(
      'info',
      'Invoicing Setting Updated',
      `Invoicing for ${user.name} set to ${!user.invoicing ? 'Active (Yes)' : 'Disabled (No)'}.`
    );
  };

  const handleLogInAs = (user: User) => {
    AuthService.loginAs(user);
    showToast(
      'success',
      `Logged in as ${user.name}`,
      `Switched active session to role [${user.role}] for ${user.storeName}.`
    );
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    UserService.deleteUser(deletingUser.id);
    refreshUsers();
    showToast('success', 'User Deleted', `Account ${deletingUser.username} has been removed.`);
    setDeletingUser(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.name) {
      showToast('error', 'Validation Failed', 'Please fill in all required user details.');
      return;
    }

    if (editingUser) {
      UserService.updateUser(editingUser.id, formData);
      showToast('success', 'User Updated', `Account ${formData.username} saved successfully.`);
      setEditingUser(null);
    } else {
      UserService.createUser({
        ...formData,
        status: 'Active',
      });
      showToast('success', 'User Created', `New account ${formData.username} created.`);
      setIsAddUserModalOpen(false);
    }
    refreshUsers();
  };

  const handleDownloadInvoice = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Invoice No,Client,User Count,Invoicing Active,Billing Period,Amount Due\n' +
      'INV-2026-0901,SuperValu Stores NZ,142,Yes,Sep 2026,$14,200.00\n' +
      'INV-2026-0902,Metro Retail Group,89,Yes,Sep 2026,$8,900.00\n' +
      'INV-2026-0903,FreshChoice Supermarkets,38,Yes,Sep 2026,$3,800.00\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TicketIT_Invoice_Summary_Sep2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Invoice Downloaded', 'Exported monthly franchisee invoicing report.');
  };

  const handleSimulateSpreadsheetUpload = (type: 'new' | 'update') => {
    showToast(
      'success',
      type === 'new' ? 'New Users Spreadsheet Ingested' : 'User Updates Processed',
      'Batch processing finished. 14 user accounts synchronized with head office directory.'
    );
    setIsUploadNewModalOpen(false);
    setIsUploadUpdateModalOpen(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.group !== activeGroupTab) return false;
      if (selectedClient !== 'All Clients' && !u.email.includes(selectedClient.split(' ')[0].toLowerCase())) {
        // loose match for demo
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.region.toLowerCase().includes(q) ||
          u.storeCategory.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, activeGroupTab, selectedClient, searchQuery]);

  const groupTabs = [
    { id: 'Head Office', label: 'Head Office', badge: users.filter((u) => u.group === 'Head Office').length },
    { id: 'Regional Managers', label: 'Regional Managers', badge: users.filter((u) => u.group === 'Regional Managers').length },
    { id: 'Franchisees', label: 'Franchisees', badge: users.filter((u) => u.group === 'Franchisees').length },
  ];

  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      render: (row) => <span className="font-bold text-ticketit-navy">{row.username}</span>,
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      render: (row) => <span className="text-ticketit-navy">{row.email}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => <span className="font-semibold text-ticketit-navy">{row.name}</span>,
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      render: (row) => <span className="text-ticketit-navy">{row.region}</span>,
    },
    {
      key: 'storeCategory',
      header: 'Store Category',
      sortable: true,
      render: (row) => <span className="text-ticketit-navy">{row.storeCategory}</span>,
    },
    {
      key: 'group',
      header: 'Group',
      sortable: true,
      render: (row) => (
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-ticketit-navy font-medium">
          {row.group}
        </span>
      ),
    },
    {
      key: 'invoicing',
      header: 'Invoicing',
      sortable: true,
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <ToggleSwitch
            size="sm"
            checked={row.invoicing}
            onChange={() => handleToggleInvoicing(row)}
          />
          <span className="text-[11px] font-bold text-ticketit-navy w-6">
            {row.invoicing ? 'Yes' : 'No'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <TableRowActions
          onLogIn={() => handleLogInAs(row)}
          onEdit={() => {
            setFormData({
              username: row.username,
              email: row.email,
              name: row.name,
              region: row.region,
              storeCategory: row.storeCategory,
              group: row.group,
              role: row.role,
              invoicing: row.invoicing,
              storeName: row.storeName,
              phone: row.phone || '',
              department: row.department || '',
            });
            setEditingUser(row);
          }}
          onResetPassword={() =>
            showToast('info', 'Password Reset Link Sent', `Sent password reset email to ${row.email}`)
          }
          onDelete={() => setDeletingUser(row)}
        />
      ),
    },
  ];

  return (
    <AppShell>
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black text-ticketit-navy tracking-tight">Users</h1>
          <p className="text-xs text-ticketit-text-muted mt-0.5">
            Manage administrative hierarchy, regional permissions, franchisee accounts, and billing dispatch.
          </p>
        </div>

        <Button
          variant="green"
          size="sm"
          onClick={() => {
            setFormData({
              username: '',
              email: '',
              name: '',
              region: 'Auckland North',
              storeCategory: 'Supermarket Metro',
              group: activeGroupTab,
              role: activeGroupTab === 'Head Office' ? 'Super Admin' : activeGroupTab === 'Regional Managers' ? 'Regional Manager' : 'Franchisee Operator',
              invoicing: true,
              storeName: 'StandardStoreSetup',
              phone: '',
              department: '',
            });
            setIsAddUserModalOpen(true);
          }}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add New User
        </Button>
      </div>

      {/* Upload panel titled "Adding and Updating Accounts" */}
      <div className="bg-white border border-ticketit-border rounded-lg p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-ticketit-border mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-ticketit-pink" />
            <h2 className="text-sm font-extrabold text-ticketit-navy uppercase tracking-wider">
              Adding and Updating Accounts
            </h2>
          </div>
          <span className="text-xs text-ticketit-text-muted">Batch Spreadsheet Dispatch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Upload New Users Spreadsheet */}
          <div className="p-3.5 rounded border border-ticketit-border bg-[#F8FAFD] flex flex-col justify-between h-full">
            <div>
              <div className="font-bold text-xs text-ticketit-navy mb-1">
                Upload New Users Spreadsheet
              </div>
              <p className="text-[11px] text-ticketit-text-muted mb-3 leading-relaxed">
                Bulk provision new employee, franchisee, and regional manager accounts from CSV/Excel.
              </p>
            </div>
            <Button
              variant="green"
              size="sm"
              onClick={() => setIsUploadNewModalOpen(true)}
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Upload New Users Spreadsheet
            </Button>
          </div>

          {/* Upload Users Update Spreadsheet */}
          <div className="p-3.5 rounded border border-ticketit-border bg-[#F8FAFD] flex flex-col justify-between h-full">
            <div>
              <div className="font-bold text-xs text-ticketit-navy mb-1">
                Upload Users Update Spreadsheet
              </div>
              <p className="text-[11px] text-ticketit-text-muted mb-3 leading-relaxed">
                Update existing user regions, categories, active status, or invoicing flags in bulk.
              </p>
            </div>
            <Button
              variant="green"
              size="sm"
              onClick={() => setIsUploadUpdateModalOpen(true)}
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Upload Users Update Spreadsheet
            </Button>
          </div>

          {/* Download Invoice */}
          <div className="p-3.5 rounded border border-ticketit-border bg-[#F8FAFD] flex flex-col justify-between h-full">
            <div>
              <div className="font-bold text-xs text-ticketit-navy mb-1">
                Franchisee Invoicing
              </div>
              <p className="text-[11px] text-ticketit-text-muted mb-3 leading-relaxed">
                Export current month billing breakdown for all franchised stores and invoicing toggles.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInvoice}
              icon={<Download className="w-3.5 h-3.5 text-ticketit-pink" />}
            >
              Download Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Client Selection Area (Grid / List of Clients) */}
      <div className="bg-white border border-ticketit-border rounded-lg p-3 sm:p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-ticketit-navy" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-ticketit-navy">
              Filter By Retail Client
            </span>
          </div>
          <div className="text-xs text-ticketit-text-muted">
            Showing users for: <strong className="text-ticketit-pink">{selectedClient}</strong>
          </div>
        </div>

        {/* Compact grid/list of client names */}
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-[#F9FAFC] border border-ticketit-border rounded">
          {clients.map((client) => {
            const isSelected = selectedClient === client;
            return (
              <button
                key={client}
                type="button"
                onClick={() => setSelectedClient(client)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-ticketit-pink text-white shadow-sm'
                    : 'bg-white text-ticketit-navy border border-ticketit-border hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {client}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Tables grouped into Head Office, Regional Managers, Franchisees */}
      <div className="bg-white border border-ticketit-border rounded-lg p-3 sm:p-4 shadow-sm">
        {/* Secondary Tab Switcher */}
        <SecondaryTabs
          tabs={groupTabs}
          activeTab={activeGroupTab}
          onTabChange={(id) => setActiveGroupTab(id as UserGroup)}
          rightActions={
            <div className="relative w-64">
              <input
                type="text"
                placeholder={`Search ${activeGroupTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-ticketit-border rounded text-ticketit-navy placeholder-gray-400 focus:border-ticketit-pink focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          }
        />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredUsers}
          keyField="id"
          selectable={true}
          selectedIds={selectedUserIds}
          onSelectionChange={setSelectedUserIds}
          initialRowsPerPage={10}
        />
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isAddUserModalOpen || !!editingUser}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? `Edit User: ${editingUser.username}` : 'Add New Account'}
        subtitle="Configure role, store assignment, and invoicing permissions"
        headerColor="pink"
      >
        <form onSubmit={handleSaveUser} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Username <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Full Name <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ticketit-navy mb-1">
              Email Address <span className="text-ticketit-coral">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Group</label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value as UserGroup })}
                className="w-full px-2.5 py-2 text-xs border border-ticketit-border rounded bg-white focus:border-ticketit-pink focus:outline-none"
              >
                <option value="Head Office">Head Office</option>
                <option value="Regional Managers">Regional Managers</option>
                <option value="Franchisees">Franchisees</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Store Category</label>
              <input
                type="text"
                value={formData.storeCategory}
                onChange={(e) => setFormData({ ...formData, storeCategory: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Assigned Store</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-ticketit-border">
            <ToggleSwitch
              checked={formData.invoicing}
              onChange={(checked) => setFormData({ ...formData, invoicing: checked })}
            />
            <div>
              <div className="text-xs font-bold text-ticketit-navy">Enable Monthly Invoicing</div>
              <div className="text-[11px] text-ticketit-text-muted">
                Include store in automated franchisee fee billing schedule.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-ticketit-border">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsAddUserModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="green" size="sm" type="submit">
              {editingUser ? 'Update Account' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to delete "${deletingUser?.name}" (${deletingUser?.username})? This action cannot be undone.`}
        confirmText="Delete Account"
      />

      {/* Upload New Users Modal */}
      <Modal
        isOpen={isUploadNewModalOpen}
        onClose={() => setIsUploadNewModalOpen(false)}
        title="Upload New Users Spreadsheet"
        subtitle="Batch import new store managers, franchisees, and operations staff"
        headerColor="pink"
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 border-2 border-dashed border-ticketit-border rounded text-center bg-gray-50">
            <FileSpreadsheet className="w-8 h-8 text-ticketit-green mx-auto mb-2" />
            <div className="text-xs font-bold text-ticketit-navy">Select or drop CSV/Excel file</div>
            <div className="text-[11px] text-gray-500 mt-1">Columns: Username, Email, Name, Region, Store Category, Group</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsUploadNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="green" size="sm" onClick={() => handleSimulateSpreadsheetUpload('new')}>
              Process New Users
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Update Users Modal */}
      <Modal
        isOpen={isUploadUpdateModalOpen}
        onClose={() => setIsUploadUpdateModalOpen(false)}
        title="Upload Users Update Spreadsheet"
        subtitle="Synchronize bulk changes across existing accounts"
        headerColor="pink"
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 border-2 border-dashed border-ticketit-border rounded text-center bg-gray-50">
            <FileSpreadsheet className="w-8 h-8 text-ticketit-pink mx-auto mb-2" />
            <div className="text-xs font-bold text-ticketit-navy">Select update spreadsheet</div>
            <div className="text-[11px] text-gray-500 mt-1">Keyed by Username or Email address</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsUploadUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="green" size="sm" onClick={() => handleSimulateSpreadsheetUpload('update')}>
              Apply Updates
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
