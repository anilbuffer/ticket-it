'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, RefreshCw, Zap, Check } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { SecondaryTabs } from '@/components/layout/SecondaryTabs';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ESLActionIcons } from '@/components/ui/ActionIcons';
import { Modal } from '@/components/ui/Modal';
import { ESLService } from '@/services/eslService';
import { ESLTag } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function ESLManagementPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('assignment');
  const [tags, setTags] = useState<ESLTag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onPromotionOnly, setOnPromotionOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingTagId, setSyncingTagId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewingTag, setViewingTag] = useState<ESLTag | null>(null);

  // Filter criteria
  const [filterModel, setFilterModel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // New Tag Form State
  const [newTag, setNewTag] = useState({
    barcode: '',
    model: 'ZKC26B-NA',
    productSku: '',
    productName: '',
    productPrice: '',
    status: 'Offline' as const,
    isPromo: false,
    storeName: 'StandardStoreSetup',
  });

  useEffect(() => {
    setTags(ESLService.getTags());
  }, []);

  const refreshData = () => {
    setTags(ESLService.getTags());
  };

  const handleForceUpdate = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      const updated = ESLService.forceUpdateAll();
      setTags(updated);
      setIsSyncingAll(false);
      showToast('success', 'Force Update Completed', 'All active ESL tags updated to the latest pricing schema.');
    }, 1000);
  };

  const handleFlash = (tag: ESLTag) => {
    showToast(
      'info',
      `Flashing ESL ${tag.barcode}`,
      `Hardware LED flashing triggered on shelf for "${tag.productName}".`
    );
  };

  const handleConnect = (tag: ESLTag) => {
    showToast(
      'success',
      `Gateway Connected: ${tag.barcode}`,
      `Sub-GHz RF connection verified with gateway (Signal: ${tag.signalStrength || '-62dBm'}).`
    );
  };

  const handleSyncSingle = (tag: ESLTag) => {
    setSyncingTagId(tag.id);
    setTimeout(() => {
      ESLService.updateTag(tag.id, {
        status: 'Online',
        lastUpdatedTime: new Date().toLocaleString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      });
      refreshData();
      setSyncingTagId(null);
      showToast('success', 'ESL Synchronized', `Tag ${tag.barcode} updated successfully.`);
    }, 800);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.barcode || !newTag.productSku || !newTag.productName) {
      showToast('error', 'Validation Error', 'Barcode, Product SKU, and Product Name are required.');
      return;
    }

    ESLService.createTag({
      ...newTag,
      productPrice: newTag.productPrice ? `$${newTag.productPrice.replace('$', '')}` : '-',
    });
    refreshData();
    setIsAddModalOpen(false);
    setNewTag({
      barcode: '',
      model: 'ZKC26B-NA',
      productSku: '',
      productName: '',
      productPrice: '',
      status: 'Offline',
      isPromo: false,
      storeName: 'StandardStoreSetup',
    });
    showToast('success', 'ESL Tag Created', 'New shelf tag added to StandardStoreSetup inventory.');
  };

  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      if (onPromotionOnly && !tag.isPromo) return false;
      if (filterModel !== 'ALL' && tag.model !== filterModel) return false;
      if (filterStatus !== 'ALL' && tag.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tag.barcode.toLowerCase().includes(q) ||
          tag.model.toLowerCase().includes(q) ||
          tag.productSku.toLowerCase().includes(q) ||
          tag.productName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tags, onPromotionOnly, filterModel, filterStatus, searchQuery]);

  const secondaryTabsList = [
    { id: 'assignment', label: 'ESL Assignment' },
    { id: 'content', label: 'ESL Custom Content' },
    { id: 'report', label: 'ESL Change Report' },
    { id: 'statistics', label: 'ESL Statistics' },
  ];

  const columns: Column<ESLTag>[] = [
    {
      key: 'barcode',
      header: 'ESL Barcode',
      sortable: true,
      render: (row) => <span className="font-semibold text-ticketit-navy">{row.barcode}</span>,
    },
    {
      key: 'model',
      header: 'Model',
      sortable: true,
      render: (row) => <span className="text-ticketit-navy font-medium">{row.model}</span>,
    },
    {
      key: 'productSku',
      header: 'Product SKU',
      sortable: true,
      render: (row) => <span className="text-ticketit-navy">{row.productSku}</span>,
    },
    {
      key: 'productName',
      header: 'Product Name',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-ticketit-navy uppercase tracking-tight">
          {row.productName}
        </span>
      ),
    },
    {
      key: 'productPrice',
      header: 'Product Price',
      sortable: true,
      render: (row) => <span className="text-ticketit-navy font-semibold">{row.productPrice}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'isPromo',
      header: 'IsPromo',
      sortable: true,
      render: (row) => (
        <span className={`text-xs ${row.isPromo ? 'text-ticketit-green font-bold' : 'text-ticketit-text-muted'}`}>
          {String(row.isPromo)}
        </span>
      ),
    },
    {
      key: 'lastUpdatedTime',
      header: 'Last Updated Time',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-ticketit-text-muted whitespace-nowrap">
          {row.lastUpdatedTime}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      render: (row) => (
        <ESLActionIcons
          onFlash={() => handleFlash(row)}
          onConnect={() => handleConnect(row)}
          onView={() => setViewingTag(row)}
          onSync={() => handleSyncSingle(row)}
          isSyncing={syncingTagId === row.id}
        />
      ),
    },
  ];

  return (
    <AppShell>
      {/* Secondary Tab Bar matching screenshot */}
      <SecondaryTabs
        tabs={secondaryTabsList}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        rightActions={
          <>
            <Button
              variant="coral"
              size="sm"
              onClick={handleForceUpdate}
              isLoading={isSyncingAll}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Force Update
            </Button>
            <Button
              variant="green"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add ESL
            </Button>
          </>
        }
      />

      {/* Main Content Area */}
      <div className="bg-white border border-ticketit-border rounded p-3 sm:p-4 shadow-sm mb-4">
        {/* Toolbar matching screenshot: Search, Data Filter, On Promotion */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search input */}
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-ticketit-border rounded text-ticketit-navy placeholder-gray-400 focus:border-ticketit-pink focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Coral Data Filter Button */}
            <Button
              variant="coral"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              Data Filter
            </Button>

            {/* On Promotion Checkbox Button/Pill */}
            <button
              type="button"
              onClick={() => setOnPromotionOnly(!onPromotionOnly)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 border transition-colors ${
                onPromotionOnly
                  ? 'bg-ticketit-green text-white border-ticketit-green'
                  : 'bg-white text-ticketit-navy border-ticketit-border hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                  onPromotionOnly ? 'bg-white text-ticketit-green border-white' : 'border-gray-400 bg-white'
                }`}
              >
                {onPromotionOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </span>
              <span>On Promotion</span>
            </button>
          </div>

          {(searchQuery || onPromotionOnly || filterModel !== 'ALL' || filterStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setOnPromotionOnly(false);
                setFilterModel('ALL');
                setFilterStatus('ALL');
              }}
              className="text-xs font-semibold text-ticketit-pink hover:underline self-end sm:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredTags}
          keyField="id"
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          initialRowsPerPage={10}
        />
      </div>

      {/* Add ESL Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New ESL Tag"
        subtitle="Pair a hardware ESL barcode with an in-store product SKU"
        headerColor="pink"
      >
        <form onSubmit={handleCreateTag} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-ticketit-navy mb-1">
              ESL Barcode <span className="text-ticketit-coral">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 885126989"
              value={newTag.barcode}
              onChange={(e) => setNewTag({ ...newTag, barcode: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Model</label>
              <select
                value={newTag.model}
                onChange={(e) => setNewTag({ ...newTag, model: e.target.value })}
                className="w-full px-2.5 py-2 text-xs border border-ticketit-border rounded bg-white focus:border-ticketit-pink focus:outline-none"
              >
                <option value="ZKC26B-NA">ZKC26B-NA (2.6" B/W/R)</option>
                <option value="ZKC26B-NAE4">ZKC26B-NAE4 (2.6" Freezable)</option>
                <option value="ZKC42B-WRG">ZKC42B-WRG (4.2" High-Res)</option>
                <option value="ZKC75B-COL">ZKC75B-COL (7.5" Color)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Product SKU <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 4710015109999"
                value={newTag.productSku}
                onChange={(e) => setNewTag({ ...newTag, productSku: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ticketit-navy mb-1">
              Product Name <span className="text-ticketit-coral">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ORGANIC SOURDOUGH LOAF 680G"
              value={newTag.productName}
              onChange={(e) => setNewTag({ ...newTag, productName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">Product Price</label>
              <input
                type="text"
                placeholder="e.g. 4.99"
                value={newTag.productPrice}
                onChange={(e) => setNewTag({ ...newTag, productPrice: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTag.isPromo}
                  onChange={(e) => setNewTag({ ...newTag, isPromo: e.target.checked })}
                  className="w-4 h-4 rounded text-ticketit-pink focus:ring-ticketit-pink cursor-pointer"
                />
                <span className="text-xs font-bold text-ticketit-navy">On Promotion</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-ticketit-border mt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="green" size="sm" type="submit">
              Save ESL Tag
            </Button>
          </div>
        </form>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter ESL Data"
        subtitle="Narrow down tags by hardware model or operational status"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-ticketit-navy mb-1">Model Type</label>
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-ticketit-border rounded bg-white focus:border-ticketit-pink focus:outline-none"
            >
              <option value="ALL">All Models</option>
              <option value="ZKC26B-NA">ZKC26B-NA</option>
              <option value="ZKC26B-NAE4">ZKC26B-NAE4</option>
              <option value="ZKC42B-WRG">ZKC42B-WRG</option>
              <option value="ZKC75B-COL">ZKC75B-COL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ticketit-navy mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-ticketit-border rounded bg-white focus:border-ticketit-pink focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
              <option value="Syncing">Syncing</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-ticketit-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterModel('ALL');
                setFilterStatus('ALL');
                setIsFilterModalOpen(false);
              }}
            >
              Reset
            </Button>
            <Button variant="coral" size="sm" onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      {viewingTag && (
        <Modal
          isOpen={true}
          onClose={() => setViewingTag(null)}
          title={`ESL Tag: ${viewingTag.barcode}`}
          subtitle={viewingTag.productName}
        >
          <div className="flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border border-ticketit-border">
              <div>
                <span className="text-gray-500 block">Barcode:</span>
                <span className="font-bold text-ticketit-navy">{viewingTag.barcode}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Hardware Model:</span>
                <span className="font-bold text-ticketit-navy">{viewingTag.model}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Product SKU:</span>
                <span className="font-bold text-ticketit-navy">{viewingTag.productSku}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Shelf Price:</span>
                <span className="font-bold text-ticketit-navy">{viewingTag.productPrice}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Battery Level:</span>
                <span className="font-bold text-ticketit-navy">{viewingTag.batteryLevel || 85}%</span>
              </div>
              <div>
                <span className="text-gray-500 block">Signal Strength:</span>
                <span className="font-bold text-ticketit-navy">{viewingTag.signalStrength || '-64dBm'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-gray-500">Last Broadcast: {viewingTag.lastUpdatedTime}</span>
              <Button
                variant="coral"
                size="sm"
                onClick={() => {
                  handleFlash(viewingTag);
                  setViewingTag(null);
                }}
                icon={<Zap className="w-3.5 h-3.5" />}
              >
                Flash LED
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
