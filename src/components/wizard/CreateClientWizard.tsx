'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  Upload,
  FileSpreadsheet,
  FileText,
  Layers,
  Settings,
  Image as ImageIcon,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Check,
  Download,
  Tag,
  Store,
  ChevronRight,
  Sliders,
  Database,
  ExternalLink,
} from 'lucide-react';
import { ClientService } from '@/services/clientService';
import { Client, ClientWizardState, TicketFieldMapping, ClientRegionItem, RegionBranchItem } from '@/types';
import {
  WIZARD_STEPS,
  INITIAL_EMPTY_WIZARD_STATE,
  SAMPLE_SUPERVALU_WIZARD_STATE,
  PRESET_SAMPLE_PRODUCTS,
  PRESET_TICKET_TEMPLATES,
  DEFAULT_MAPPINGS,
  PRESET_CONTENT_ASSETS,
  PRESET_REGIONS,
  TICKET_MAPPING_FIELD_OPTIONS,
  DEFAULT_MAPPING_PERMISSIONS,
} from '@/mock/wizardMockData';
import { useToast } from '@/components/ui/ToastContext';

interface CreateClientWizardProps {
  initialClientId?: string;
  initialStep?: number;
}

export const CreateClientWizard: React.FC<CreateClientWizardProps> = ({
  initialClientId,
  initialStep = 1,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedClientForRead, setSelectedClientForRead] = useState<string>(initialClientId || '');
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  // Main Wizard Form State
  const [wizardState, setWizardState] = useState<ClientWizardState>(INITIAL_EMPTY_WIZARD_STATE);

  // New Region Modal / Inline state
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionCode, setNewRegionCode] = useState('');
  const [newRegionTax, setNewRegionTax] = useState(15);
  const [isAddingRegion, setIsAddingRegion] = useState(false);

  // New Branch inline state
  const [selectedRegionIdForBranch, setSelectedRegionIdForBranch] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [newBranchESLs, setNewBranchESLs] = useState(5000);

  // Load clients list on mount
  useEffect(() => {
    const clients = ClientService.getClients();
    setClientsList(clients);

    const clientIdFromQuery = searchParams.get('clientId') || initialClientId;
    const stepFromQuery = searchParams.get('step');

    if (stepFromQuery) {
      const parsedStep = parseInt(stepFromQuery, 10);
      if (parsedStep >= 1 && parsedStep <= 9) {
        setCurrentStep(parsedStep);
      }
    }

    if (clientIdFromQuery) {
      const client = clients.find((c) => c.id === clientIdFromQuery || c.code.toLowerCase() === clientIdFromQuery.toLowerCase());
      if (client) {
        setSelectedClientForRead(client.id);
        loadClientIntoWizard(client);
      }
    }
  }, [searchParams, initialClientId]);

  const loadClientIntoWizard = (client: Client) => {
    if (client.wizardConfig) {
      setWizardState(client.wizardConfig);
    } else {
      setWizardState({
        ...INITIAL_EMPTY_WIZARD_STATE,
        clientName: client.name,
        clientCode: client.code,
        industry: client.industry,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
        contactPhone: client.contactPhone,
        licenseTier: client.licenseTier,
        defaultCurrency: client.currency,
        dataFileName: `${client.code.toLowerCase()}_catalog_feed.xlsx`,
        dataRecordCount: client.activeStores * 120,
        dataSampleRows: PRESET_SAMPLE_PRODUCTS,
        ticketTemplateFileName: `${client.code.toLowerCase()}_promo_talker.tkt`,
        clientNameInReport: `${client.name} Group`,
        numberOfStores: client.activeStores,
        valuePerStore: '150.00',
        numberOfIntegrations: '1',
        discountPercentage: '0',
        gst: '15',
        totalIntegrations: '250.00',
        resellerInvoice: `INV-${client.code}-001`,
        paymentType: 'Direct Debit',
        totalPerMonth: `${(client.activeStores * 150).toLocaleString()}`,
        totalInvoice: `${(client.activeStores * 150 * 1.15).toLocaleString()}`,
        isVerified: true,
      });
    }
  };

  const handleClientSelectChange = (clientId: string) => {
    setSelectedClientForRead(clientId);
    if (!clientId || clientId === 'NEW') {
      setWizardState(INITIAL_EMPTY_WIZARD_STATE);
      setCurrentStep(1);
      showToast('info', 'New Client Mode', 'Started blank client setup wizard.');
    } else {
      const client = clientsList.find((c) => c.id === clientId);
      if (client) {
        loadClientIntoWizard(client);
        showToast('success', 'Loaded Client Profile', `Loaded ${client.name} configuration steps.`);
      }
    }
  };

  const handleLoadSampleData = () => {
    setWizardState(SAMPLE_SUPERVALU_WIZARD_STATE);
    showToast('success', 'Sample Data Loaded', 'Populated wizard with SuperValu retail parameters.');
  };

  // Step Navigation Handlers
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= 9) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentStep < 9) {
      goToStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  // Helper for step labels
  const nextStepLabel = useMemo(() => {
    if (currentStep === 9) return 'SAVE CLIENT';
    const nextStepObj = WIZARD_STEPS.find((s) => s.id === currentStep + 1);
    return `NEXT: ${nextStepObj ? nextStepObj.label : 'PROCEED'}`;
  }, [currentStep]);

  const prevStepLabel = useMemo(() => {
    if (currentStep === 1) return '';
    const prevStepObj = WIZARD_STEPS.find((s) => s.id === currentStep - 1);
    return `PREVIOUS: ${prevStepObj ? prevStepObj.label : 'BACK'}`;
  }, [currentStep]);

  // File Upload Handlers (Simulated)
  const handleDataFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWizardState((prev) => ({
        ...prev,
        dataFileName: file.name,
        dataFileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        dataRecordCount: Math.floor(Math.random() * 8000) + 1200,
        dataSampleRows: PRESET_SAMPLE_PRODUCTS,
        dataUploadStatus: 'validated',
      }));
      showToast('success', 'File Uploaded', `${file.name} validated successfully.`);
    }
  };

  const handleTicketTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWizardState((prev) => ({
        ...prev,
        ticketTemplateFileName: file.name,
      }));
      showToast('success', 'Template Uploaded', `${file.name} registered.`);
    }
  };

  const handlePatcherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWizardState((prev) => ({
        ...prev,
        patcherFileName: file.name,
      }));
      showToast('success', 'Patcher Uploaded', `${file.name} loaded.`);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWizardState((prev) => ({
        ...prev,
        logoFileName: file.name,
        logoUrl: URL.createObjectURL(file),
      }));
      showToast('success', 'Logo Uploaded', `${file.name} applied.`);
    }
  };

  // Region Management
  const handleAddRegion = () => {
    const newReg: ClientRegionItem = {
      id: `reg-${Date.now()}`,
      name: '',
      description: '',
    };
    setWizardState((prev) => ({
      ...prev,
      regions: [...(prev.regions || []), newReg],
    }));
    showToast('success', 'Region Added', 'New region panel added.');
  };

  const handleDeleteRegion = (regionId: string) => {
    setWizardState((prev) => ({
      ...prev,
      regions: prev.regions.filter((r) => r.id !== regionId),
    }));
    showToast('info', 'Region Removed', 'Region deleted.');
  };

  const handleUpdateRegion = (regionId: string, field: 'name' | 'description', value: string) => {
    setWizardState((prev) => ({
      ...prev,
      regions: prev.regions.map((r) => (r.id === regionId ? { ...r, [field]: value } : r)),
    }));
  };

  const handleAddBranch = (regionId: string) => {
    if (!newBranchCode || !newBranchName) {
      showToast('error', 'Required Fields', 'Branch code and name are required.');
      return;
    }
    const newBranch: RegionBranchItem = {
      id: `br-${Date.now()}`,
      code: newBranchCode.toUpperCase(),
      name: newBranchName,
      city: newBranchCity || 'Store Location',
      activeESLs: newBranchESLs,
      managerEmail: `branch.${newBranchCode.toLowerCase()}@ticketit.io`,
    };

    setWizardState((prev) => ({
      ...prev,
      regions: prev.regions.map((r) => {
        if (r.id === regionId) {
          return { ...r, branches: [...(r.branches ?? []), newBranch] };
        }
        return r;
      }),
    }));

    setNewBranchCode('');
    setNewBranchName('');
    setNewBranchCity('');
    setSelectedRegionIdForBranch('');
    showToast('success', 'Branch Added', `${newBranch.name} registered.`);
  };

  // Toggle Badges in Step 6
  const toggleBadge = (badgeId: string) => {
    setWizardState((prev) => {
      const exists = prev.selectedBadges.includes(badgeId);
      return {
        ...prev,
        selectedBadges: exists
          ? prev.selectedBadges.filter((b) => b !== badgeId)
          : [...prev.selectedBadges, badgeId],
      };
    });
  };

  // Final Submit
  const handleFinalSubmit = () => {
    if (!wizardState.clientName.trim()) {
      showToast('error', 'Required Information', 'Client Name is required on Step 1.');
      goToStep(1);
      return;
    }

    const stateToSave = {
      ...wizardState,
      clientCode: wizardState.clientCode || wizardState.clientName.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || 'CLIENT',
    };

    if (selectedClientForRead && selectedClientForRead !== 'NEW') {
      // Update existing
      ClientService.updateClientWizard(selectedClientForRead, stateToSave);
      showToast('success', 'Client Configuration Updated', `${stateToSave.clientName} wizard settings updated.`);
      setCreatedClientId(selectedClientForRead);
      setIsSubmitted(true);
    } else {
      // Create new
      const created = ClientService.createClientFromWizard(stateToSave);
      showToast('success', 'Client Onboarded Successfully', `${created.name} (${created.code}) created.`);
      setCreatedClientId(created.id);
      setIsSubmitted(true);
    }
  };

  // If submitted, show confirmation screen
  if (isSubmitted) {
    return (
      <div className="bg-white border border-[#D0D7DE] rounded-lg p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto my-8">
        <div className="w-16 h-16 bg-[#EBF7F0] text-[#4BAA38] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#BDE7CC]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-ticketit-navy tracking-tight">
          Client Onboarding Complete!
        </h2>
        <p className="text-sm text-ticketit-text-muted mt-2 max-w-lg mx-auto">
          <strong className="text-ticketit-navy">{wizardState.clientName}</strong> ({wizardState.clientCode}) has been configured with all 9 ticketing, data mapping, regional, and invoicing parameters.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 text-left">
          <div className="bg-[#F8FAFC] border border-gray-200 rounded p-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Catalog Feed</div>
            <div className="text-sm font-bold text-ticketit-navy mt-1 truncate">{wizardState.dataFileName || 'Catalog Configured'}</div>
            <div className="text-xs text-ticketit-green font-semibold mt-0.5">{wizardState.dataRecordCount || 14200} Records</div>
          </div>
          <div className="bg-[#F8FAFC] border border-gray-200 rounded p-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Ticket</div>
            <div className="text-sm font-bold text-ticketit-navy mt-1 truncate">{wizardState.ticketTemplateType}</div>
            <div className="text-xs text-ticketit-pink font-semibold mt-0.5">{wizardState.mappings.length} Field Mappings</div>
          </div>
          <div className="bg-[#F8FAFC] border border-gray-200 rounded p-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Regional Stores</div>
            <div className="text-sm font-bold text-ticketit-navy mt-1 truncate">{wizardState.regions.length} Territories</div>
            <div className="text-xs text-ticketit-navy font-semibold mt-0.5">
              {wizardState.regions.reduce((a, r) => a + (r.branches?.length ?? 0), 0) || 8} Active Stores
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/DynamicClient"
            className="px-5 py-2.5 bg-ticketit-pink text-white font-bold text-xs uppercase tracking-wider rounded shadow-sm hover:bg-[#E02672] transition-colors"
          >
            Go to Client Administration
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setWizardState(INITIAL_EMPTY_WIZARD_STATE);
              setSelectedClientForRead('');
              setCurrentStep(1);
            }}
            className="px-5 py-2.5 bg-white border border-[#D0D7DE] text-ticketit-navy font-bold text-xs uppercase tracking-wider rounded hover:bg-gray-50 transition-colors"
          >
            Create Another Client
          </button>
          <Link
            href="/Admin/ImportClient"
            className="px-5 py-2.5 bg-[#4BAA38] text-white font-bold text-xs uppercase tracking-wider rounded shadow-sm hover:bg-[#3f912e] transition-colors"
          >
            Import Client Catalog Feed
          </Link>
        </div>
      </div>
    );
  }

  const currentStepObj = WIZARD_STEPS.find((s) => s.id === currentStep) || WIZARD_STEPS[0];

  return (
    <div className="w-full max-w-[1700px] mx-auto pb-12">
      {/* Top Header & Client Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#023E6B] tracking-tight">
            {selectedClientForRead && selectedClientForRead !== 'NEW'
              ? `Client Settings: ${wizardState.clientName || 'Existing Client'}`
              : 'Create Client'}
          </h1>
          <div className="text-base sm:text-lg font-bold text-[#023E6B] mt-0.5">
            Step {currentStep} of 8
          </div>
        </div>

        {/* Client Selector & Quick actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-[#D0D7DE] px-3 py-1.5 rounded shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Wizard Mode:
            </span>
            <select
              value={selectedClientForRead}
              onChange={(e) => handleClientSelectChange(e.target.value)}
              className="text-xs font-semibold text-ticketit-navy bg-transparent focus:outline-none cursor-pointer"
              aria-label="Select Client Wizard Profile"
            >
              <option value="">➕ Create New Client</option>
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  📂 Read / Edit: {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleData}
            className="px-3 py-1.5 bg-white border border-[#D0D7DE] text-xs font-bold text-[#023E6B] rounded hover:bg-gray-50 shadow-sm flex items-center gap-1.5"
            title="Pre-fill wizard with realistic supermarket retail data"
          >
            <Sparkles className="w-3.5 h-3.5 text-ticketit-pink" />
            <span>Load Sample Data</span>
          </button>

          <Link
            href="/DynamicClient"
            className="px-3 py-1.5 bg-white border border-[#D0D7DE] text-xs font-bold text-gray-600 rounded hover:bg-gray-50 shadow-sm"
          >
            Back to Clients
          </Link>
        </div>
      </div>

      {/* Breadcrumbs / Wizard Steps Horizontal Menu - EXACT VISUAL MATCH TO SCREENSHOT */}
      <div className="bg-[#F4F6F9] border border-[#D0D7DE] rounded px-3 py-2.5 sm:px-4 sm:py-3 mb-6 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max text-xs sm:text-[13px] font-bold tracking-wide uppercase">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                {index > 0 && <span className="text-gray-400 font-normal select-none px-1">/</span>}
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={`transition-colors whitespace-nowrap select-none ${
                    isActive
                      ? 'text-[#1E293B] font-black underline decoration-2 underline-offset-4'
                      : 'text-[#0084B4] hover:text-[#005f82] hover:underline font-bold'
                  }`}
                  title={`Navigate to Step ${step.id}: ${step.title}`}
                >
                  {step.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-[#F7F9FB] border border-[#D0D7DE] rounded p-5 sm:p-7 shadow-sm mb-6">
        {/* Step Card Heading */}
        {currentStep !== 8 && (
          <h2 className="text-2xl font-bold text-[#24292F] mb-6">
            {currentStep === 9 ? 'Verify Client Data' : currentStepObj.title}
          </h2>
        )}

        {/* STEP 1: NAME AND LOGO - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 1 && (
          <div className="space-y-5 max-w-4xl">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-[#24292F] mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={wizardState.clientName}
                onChange={(e) => {
                  const val = e.target.value;
                  setWizardState({
                    ...wizardState,
                    clientName: val,
                    clientCode: wizardState.clientCode || val.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase(),
                  });
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#4BAA38] focus:outline-none"
              />
            </div>

            {/* Logo Field */}
            <div>
              <label className="block text-sm font-bold text-[#24292F] mb-1.5">
                Logo
              </label>
              <div className="bg-[#4BAA38] rounded p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                  {wizardState.logoFileName || 'NO FILE CHOSEN'}
                </span>
              </div>
              <p className="text-xs text-[#24292F] mt-2 font-medium">
                Please upload a file of type png or jpg
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: UPLOAD DATA - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#24292F] mb-1.5">
                Data
              </label>

              {/* Signature Green File Bar matching image */}
              <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                  Choose File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.xml"
                    onChange={handleDataFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate select-all">
                  {wizardState.dataFileName
                    ? `${wizardState.dataFileName} ${wizardState.dataFileSize ? `(${wizardState.dataFileSize})` : ''}`
                    : 'NO FILE CHOSEN'}
                </span>
              </div>

              <p className="text-xs text-gray-700 mt-2 font-medium">
                Please upload an XLSX file
              </p>
            </div>

            {/* Quick Demo Preloader */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setWizardState((prev) => ({
                    ...prev,
                    dataFileName: 'SuperValu_Weekly_PriceCatalog_2026.xlsx',
                    dataFileSize: '4.2 MB',
                    dataRecordCount: 14200,
                    dataSampleRows: PRESET_SAMPLE_PRODUCTS,
                    dataUploadStatus: 'validated',
                  }));
                  showToast('success', 'Sample XLSX Attached', '14,200 product records loaded.');
                }}
                className="px-3 py-1.5 bg-white border border-[#D0D7DE] text-xs font-bold text-ticketit-navy rounded hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-ticketit-green" />
                <span>Attach Sample Supermarket XLSX (14,200 Products)</span>
              </button>

              {wizardState.dataFileName && (
                <button
                  type="button"
                  onClick={() => {
                    setWizardState((prev) => ({
                      ...prev,
                      dataFileName: '',
                      dataFileSize: '',
                      dataRecordCount: 0,
                      dataSampleRows: [],
                      dataUploadStatus: 'pending',
                    }));
                    showToast('info', 'File Cleared', 'Data file removed.');
                  }}
                  className="px-3 py-1.5 bg-white border border-red-200 text-xs font-bold text-red-600 rounded hover:bg-red-50"
                >
                  Remove File
                </button>
              )}
            </div>

            {/* Data Inspection Preview Table */}
            {wizardState.dataSampleRows.length > 0 && (
              <div className="border border-[#D0D7DE] rounded bg-white p-4 mt-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ticketit-green inline-block animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ticketit-navy">
                      Parsed Spreadsheet Preview ({wizardState.dataRecordCount.toLocaleString()} Total Rows)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-ticketit-green bg-[#EBF7F0] px-2 py-0.5 rounded border border-[#BDE7CC]">
                    ✓ Schema Validated
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#E8EDF5] text-ticketit-navy font-bold border-b border-[#D9DDE5]">
                        <th className="p-2">SKU</th>
                        <th className="p-2">Barcode</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Brand</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Retail Price</th>
                        <th className="p-2 text-right">Promo Price</th>
                        <th className="p-2">Unit Measure</th>
                        <th className="p-2">Origin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {wizardState.dataSampleRows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="p-2 font-mono font-semibold">{row.SKU}</td>
                          <td className="p-2 font-mono text-gray-600">{row.Barcode}</td>
                          <td className="p-2 font-medium text-ticketit-navy">{row.Description}</td>
                          <td className="p-2 text-gray-600">{row.Brand}</td>
                          <td className="p-2 text-gray-600">{row.Category}</td>
                          <td className="p-2 text-right font-bold text-ticketit-navy">{row.RetailPrice}</td>
                          <td className="p-2 text-right font-black text-red-600">{row.PromoPrice}</td>
                          <td className="p-2 text-gray-600">{row.UnitMeasure}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                              {row.Origin}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: UPLOAD TICKET - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 3 && (
          <div className="space-y-5">
            {/* Field 1: Ticket Background */}
            <div>
              <label className="block text-sm font-bold text-[#24292F] mb-1.5">
                Ticket Background
              </label>
              <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                  Choose File
                  <input
                    type="file"
                    accept=".png,.pdf,.ai,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setWizardState((prev) => ({
                          ...prev,
                          ticketBackgroundFileName: file.name,
                        }));
                        showToast('success', 'Background Uploaded', `${file.name} attached.`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                  {wizardState.ticketBackgroundFileName || 'NO FILE CHOSEN'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-1.5 font-medium">
                Please upload a PNG, PDF or AI file
              </p>
            </div>

            {/* Field 2: Ticket */}
            <div>
              <label className="block text-sm font-bold text-[#24292F] mb-1.5">
                Ticket
              </label>
              <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                  Choose File
                  <input
                    type="file"
                    accept=".xml,.tkt,.json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setWizardState((prev) => ({
                          ...prev,
                          ticketXmlFileName: file.name,
                        }));
                        showToast('success', 'Ticket XML Uploaded', `${file.name} attached.`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                  {wizardState.ticketXmlFileName || 'NO FILE CHOSEN'}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-1.5 font-medium">
                Please upload an XML file
              </p>
            </div>

            {/* Section: Ticket Settings */}
            <div className="pt-2">
              <h3 className="text-base font-bold text-[#24292F] mb-3">
                Ticket Settings
              </h3>

              <div className="border border-[#D0D7DE] rounded-sm bg-[#F9FAFB] p-4 sm:p-6 space-y-5">
                {/* Subheading: Printing settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#24292F]">
                    Printing settings
                  </h4>

                  {/* Paper Size */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Paper Size (custom will take the size from the xml file)
                    </label>
                    <select
                      value={wizardState.paperSize}
                      onChange={(e) =>
                        setWizardState({
                          ...wizardState,
                          paperSize: e.target.value as 'A4' | 'A3' | 'A5' | 'Letter' | 'Custom',
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                    >
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="A5">A5</option>
                      <option value="Letter">Letter</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Orientation
                    </label>
                    <select
                      value={wizardState.orientation}
                      onChange={(e) =>
                        setWizardState({
                          ...wizardState,
                          orientation: e.target.value as 'Portrait' | 'Landscape',
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                    >
                      <option value="Portrait">Portrait</option>
                      <option value="Landscape">Landscape</option>
                    </select>
                  </div>

                  {/* Rows */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Rows
                    </label>
                    <input
                      type="number"
                      value={wizardState.rows}
                      onChange={(e) =>
                        setWizardState({ ...wizardState, rows: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                    />
                  </div>

                  {/* Columns */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Columns
                    </label>
                    <input
                      type="number"
                      value={wizardState.columns}
                      onChange={(e) =>
                        setWizardState({ ...wizardState, columns: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                    />
                  </div>

                  {/* Margin Formula Description */}
                  <p className="text-xs font-semibold text-[#24292F] pt-1">
                    The margins are for the whole page, not an individual ticket, they use the calculation MMx2.52 so 3mm margin would be 3x2.52
                  </p>

                  {/* Print Margin Offset Container */}
                  <div className="border border-[#D0D7DE] rounded bg-white p-4 space-y-3">
                    <div className="text-xs font-bold text-gray-700">
                      Print Margin Offset
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Top</label>
                      <input
                        type="text"
                        value={wizardState.printMarginOffset.top}
                        onChange={(e) =>
                          setWizardState({
                            ...wizardState,
                            printMarginOffset: { ...wizardState.printMarginOffset, top: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Right</label>
                      <input
                        type="text"
                        value={wizardState.printMarginOffset.right}
                        onChange={(e) =>
                          setWizardState({
                            ...wizardState,
                            printMarginOffset: { ...wizardState.printMarginOffset, right: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Bottom</label>
                      <input
                        type="text"
                        value={wizardState.printMarginOffset.bottom}
                        onChange={(e) =>
                          setWizardState({
                            ...wizardState,
                            printMarginOffset: { ...wizardState.printMarginOffset, bottom: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Left</label>
                      <input
                        type="text"
                        value={wizardState.printMarginOffset.left}
                        onChange={(e) =>
                          setWizardState({
                            ...wizardState,
                            printMarginOffset: { ...wizardState.printMarginOffset, left: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                      />
                    </div>
                  </div>

                  {/* Origin Offset Formula Description */}
                  <p className="text-xs font-semibold text-[#24292F] pt-1">
                    The calculation for the origins in mm is: MMx2.8346, EG for 2mm it would be: 2x2.8346
                  </p>

                  {/* Offset X Axis */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Offset the printing origin X axis, this is per ticket
                    </label>
                    <input
                      type="text"
                      value={wizardState.offsetOriginX}
                      onChange={(e) => setWizardState({ ...wizardState, offsetOriginX: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                    />
                  </div>

                  {/* Offset Y Axis */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Offset the printing origin Y axis, this is per ticket
                    </label>
                    <input
                      type="text"
                      value={wizardState.offsetOriginY}
                      onChange={(e) => setWizardState({ ...wizardState, offsetOriginY: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                    />
                  </div>

                  {/* Printing Checkboxes */}
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wizardState.printBackground}
                        onChange={(e) => setWizardState({ ...wizardState, printBackground: e.target.checked })}
                        className="rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4]"
                      />
                      <span className="text-xs font-semibold text-[#24292F]">Print Background?</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wizardState.outputPrintCmyk}
                        onChange={(e) => setWizardState({ ...wizardState, outputPrintCmyk: e.target.checked })}
                        className="rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4]"
                      />
                      <span className="text-xs font-semibold text-[#24292F]">Output print files as CMYK?</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wizardState.useBleedAndCropMarks}
                        onChange={(e) => setWizardState({ ...wizardState, useBleedAndCropMarks: e.target.checked })}
                        className="rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4]"
                      />
                      <span className="text-xs font-semibold text-[#24292F]">
                        Use bleed and add crop marks? (can only be used with custom page sizes)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wizardState.isMultiPagePdf}
                        onChange={(e) => setWizardState({ ...wizardState, isMultiPagePdf: e.target.checked })}
                        className="rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4]"
                      />
                      <span className="text-xs font-semibold text-[#24292F]">
                        Is this a multi page PDF? (can only be used with custom page sizes)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Subheading: Misc Settings */}
                <div className="border-t border-[#D0D7DE] pt-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#24292F]">
                    Misc Settings
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wizardState.allowProductsWithoutPrice}
                      onChange={(e) => setWizardState({ ...wizardState, allowProductsWithoutPrice: e.target.checked })}
                      className="rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4]"
                    />
                    <span className="text-xs font-semibold text-[#24292F]">Allow Products Without Price?</span>
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ordering of the ticket, orders in ascending order
                    </label>
                    <input
                      type="number"
                      value={wizardState.ticketOrdering}
                      onChange={(e) =>
                        setWizardState({ ...wizardState, ticketOrdering: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                    />
                  </div>
                </div>

                {/* Subheading: PNG Output Settings */}
                <div className="border-t border-[#D0D7DE] pt-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#24292F]">
                    PNG Output Settings
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wizardState.isPngOutput}
                      onChange={(e) => setWizardState({ ...wizardState, isPngOutput: e.target.checked })}
                      className="rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4]"
                    />
                    <span className="text-xs font-semibold text-[#24292F]">IsPngOutput</span>
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PngWidth</label>
                    <input
                      type="text"
                      value={wizardState.pngWidth}
                      onChange={(e) => setWizardState({ ...wizardState, pngWidth: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PngHeight</label>
                    <input
                      type="text"
                      value={wizardState.pngHeight}
                      onChange={(e) => setWizardState({ ...wizardState, pngHeight: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F]"
                    />
                  </div>
                </div>

                {/* Subheading: Core settings */}
                <div className="border-t border-[#D0D7DE] pt-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#24292F]">
                    Core settings
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wizardState.onlyAllowFranchiseesEditLookup}
                      onChange={(e) =>
                        setWizardState({ ...wizardState, onlyAllowFranchiseesEditLookup: e.target.checked })
                      }
                      className="rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4]"
                    />
                    <span className="text-xs font-semibold text-[#24292F]">
                      Only allow franchisees to edit lookup fields?
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Core Departments</label>
                    <textarea
                      rows={5}
                      value={wizardState.coreDepartments}
                      onChange={(e) => setWizardState({ ...wizardState, coreDepartments: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded font-mono text-[#24292F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TICKET MAPPINGS - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 4 && (
          <div className="space-y-5">
            {/* Field 1: Product Name Field */}
            <div>
              <label className="block text-xs font-semibold text-[#24292F] mb-1">
                Product Name Field
              </label>
              <select
                value={wizardState.productNameField || 'SKU'}
                onChange={(e) => setWizardState({ ...wizardState, productNameField: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
              >
                {TICKET_MAPPING_FIELD_OPTIONS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Product ID Field */}
            <div>
              <label className="block text-xs font-semibold text-[#24292F] mb-1">
                Product ID Field
              </label>
              <select
                value={wizardState.productIdField || 'SKU'}
                onChange={(e) => setWizardState({ ...wizardState, productIdField: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
              >
                {TICKET_MAPPING_FIELD_OPTIONS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Product Price Field */}
            <div>
              <label className="block text-xs font-semibold text-[#24292F] mb-1">
                Product Price Field
              </label>
              <select
                value={wizardState.productPriceField || 'SKU'}
                onChange={(e) => setWizardState({ ...wizardState, productPriceField: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
              >
                {TICKET_MAPPING_FIELD_OPTIONS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            {/* Section: Mappings Table */}
            <div className="pt-2">
              <h3 className="text-base font-bold text-[#24292F] mb-3">
                Mappings
              </h3>

              <div className="border border-[#D0D7DE] rounded bg-white overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F6F8FA] text-[#24292F] font-bold border-b border-[#D0D7DE]">
                      <th className="py-2.5 px-4 w-1/4"></th>
                      <th className="py-2.5 px-4 text-center font-bold">View Fields</th>
                      <th className="py-2.5 px-4 text-center font-bold">Edit Fields</th>
                      <th className="py-2.5 px-4 text-center font-bold">Adhoc View Fields</th>
                      <th className="py-2.5 px-4 text-center font-bold">Adhoc Edit Fields</th>
                      <th className="py-2.5 px-4 text-center font-bold">Summary View Fields</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E9F0]">
                    {(wizardState.mappingPermissions && wizardState.mappingPermissions.length > 0
                      ? wizardState.mappingPermissions
                      : DEFAULT_MAPPING_PERMISSIONS
                    ).map((perm, idx) => (
                      <tr key={perm.fieldName} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFCFE]'}>
                        <td className="py-2.5 px-4 font-medium text-[#24292F]">
                          {perm.fieldName}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.viewFields}
                            onChange={() => {
                              const updated = [
                                ...(wizardState.mappingPermissions || DEFAULT_MAPPING_PERMISSIONS),
                              ];
                              updated[idx] = { ...updated[idx], viewFields: !updated[idx].viewFields };
                              setWizardState({ ...wizardState, mappingPermissions: updated });
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.editFields}
                            onChange={() => {
                              const updated = [
                                ...(wizardState.mappingPermissions || DEFAULT_MAPPING_PERMISSIONS),
                              ];
                              updated[idx] = { ...updated[idx], editFields: !updated[idx].editFields };
                              setWizardState({ ...wizardState, mappingPermissions: updated });
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.adhocViewFields}
                            onChange={() => {
                              const updated = [
                                ...(wizardState.mappingPermissions || DEFAULT_MAPPING_PERMISSIONS),
                              ];
                              updated[idx] = {
                                ...updated[idx],
                                adhocViewFields: !updated[idx].adhocViewFields,
                              };
                              setWizardState({ ...wizardState, mappingPermissions: updated });
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.adhocEditFields}
                            onChange={() => {
                              const updated = [
                                ...(wizardState.mappingPermissions || DEFAULT_MAPPING_PERMISSIONS),
                              ];
                              updated[idx] = {
                                ...updated[idx],
                                adhocEditFields: !updated[idx].adhocEditFields,
                              };
                              setWizardState({ ...wizardState, mappingPermissions: updated });
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.summaryViewFields}
                            onChange={() => {
                              const updated = [
                                ...(wizardState.mappingPermissions || DEFAULT_MAPPING_PERMISSIONS),
                              ];
                              updated[idx] = {
                                ...updated[idx],
                                summaryViewFields: !updated[idx].summaryViewFields,
                              };
                              setWizardState({ ...wizardState, mappingPermissions: updated });
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4] focus:ring-[#0084B4] cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: UPLOAD TICKET PATCHERS - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <p className="text-xs font-bold text-[#24292F]">
              The following files are optional - if one or both are not uploaded, the default patchers will be used.
            </p>

            {/* Field 1: Loaded Batch Patcher */}
            <div>
              <label className="block text-sm font-bold text-[#24292F] mb-1.5">
                Loaded Batch Patcher
              </label>

              <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                  Choose File
                  <input
                    type="file"
                    accept=".cs,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setWizardState((prev) => ({
                          ...prev,
                          loadedBatchPatcherFileName: file.name,
                        }));
                        showToast('success', 'Loaded Batch Patcher Uploaded', `${file.name} attached.`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                  {wizardState.loadedBatchPatcherFileName || 'NO FILE CHOSEN'}
                </span>
              </div>

              <p className="text-xs text-gray-700 mt-1.5 font-medium">
                Please upload a C# .CS file
              </p>
            </div>

            {/* Field 2: Rendered Batch Patcher */}
            <div>
              <label className="block text-sm font-bold text-[#24292F] mb-1.5">
                Rendered Batch Patcher
              </label>

              <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                  Choose File
                  <input
                    type="file"
                    accept=".cs,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setWizardState((prev) => ({
                          ...prev,
                          renderedBatchPatcherFileName: file.name,
                        }));
                        showToast('success', 'Rendered Batch Patcher Uploaded', `${file.name} attached.`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                  {wizardState.renderedBatchPatcherFileName || 'NO FILE CHOSEN'}
                </span>
              </div>

              <p className="text-xs text-gray-700 mt-1.5 font-medium">
                Please upload a C# .CS file
              </p>
            </div>
          </div>
        )}

        {/* STEP 6: UPLOAD CONTENT FILES - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 6 && (
          <div className="space-y-5">
            {/* Fonts found in ticket */}
            <div>
              <h3 className="text-sm font-bold text-[#24292F] mb-1">
                Fonts found in ticket:
              </h3>
              <p className="text-xs font-semibold text-[#24292F]">
                {wizardState.fontsFoundInTicket || 'ITCAvantGardePro-Bold.ttf, ITCAvantGardeGothicPro-Bold.ttf, Rockwell-Bold.ttf'}
              </p>
            </div>

            {/* Images found in ticket */}
            <div>
              <h3 className="text-sm font-bold text-[#24292F] mb-1">
                Images found in ticket:
              </h3>
              <p className="text-xs font-semibold text-[#24292F]">
                {wizardState.imagesFoundInTicket || 'QRCode_Image.png, line_Image.png, afterpaylogo_Image.png'}
              </p>
            </div>

            {/* Content Files Upload Bar */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-[#24292F] mb-1.5">
                Content Files
              </label>

              <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                  Choose File
                  <input
                    type="file"
                    accept=".zip,.rar,.tar.gz,.7z"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setWizardState((prev) => ({
                          ...prev,
                          contentZipFileName: file.name,
                        }));
                        showToast('success', 'Content Files Attached', `${file.name} uploaded.`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                  {wizardState.contentZipFileName || 'NO FILE CHOSEN'}
                </span>
              </div>

              <p className="text-xs text-gray-700 mt-1.5 font-medium">
                Please upload a ZIP file
              </p>
            </div>
          </div>
        )}

        {/* STEP 7: REGIONS - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 7 && (
          <div className="space-y-5">
            {/* Regions List */}
            {((wizardState.regions && wizardState.regions.length > 0)
              ? wizardState.regions
              : [{ id: 'reg-default', name: '', description: '' }]
            ).map((region) => (
              <div
                key={region.id}
                className="border border-[#D0D7DE] rounded bg-white p-5 sm:p-6 space-y-4 shadow-sm"
              >
                <h3 className="text-base font-bold text-[#24292F]">
                  Region
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#24292F] mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={region.name}
                    onChange={(e) => handleUpdateRegion(region.id, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#24292F] mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={region.description}
                    onChange={(e) => handleUpdateRegion(region.id, 'description', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                  />
                </div>

                {/* Delete Region Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteRegion(region.id)}
                    className="px-4 py-2 bg-[#4BAA38] hover:bg-[#3f912e] active:bg-[#347b25] text-white text-xs font-bold uppercase rounded shadow-sm transition-colors cursor-pointer select-none"
                  >
                    DELETE REGION
                  </button>
                </div>
              </div>
            ))}

            {/* Add Region Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddRegion}
                className="px-4 py-2 bg-[#4BAA38] hover:bg-[#3f912e] active:bg-[#347b25] text-white text-xs font-bold uppercase rounded shadow-sm transition-colors cursor-pointer select-none"
              >
                ADD REGION
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: INVOICING - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 8 && (
          <div className="border border-[#D0D7DE] rounded bg-white overflow-hidden shadow-sm">
            {/* Row 1: Client Name in Report (white) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-white border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Client Name in Report
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <input
                  type="text"
                  value={wizardState.clientNameInReport}
                  onChange={(e) => setWizardState({ ...wizardState, clientNameInReport: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: Number Of Stores (light gray/blue #EEF3F8 with disabled box) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-[#EEF3F8] border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Number Of Stores
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <div className="w-full h-[38px] px-3.5 py-2 text-sm bg-[#D8DEE4] border border-[#CBD5E1] rounded text-[#24292F] font-semibold flex items-center select-none">
                  {wizardState.numberOfStores > 0
                    ? wizardState.numberOfStores
                    : wizardState.regions && wizardState.regions.length > 0 && wizardState.regions[0].branches && wizardState.regions[0].branches.length > 0
                    ? wizardState.regions.reduce((acc, r) => acc + (r.branches?.length || 0), 0)
                    : ''}
                </div>
              </div>
            </div>

            {/* Row 3: Value per Store (white) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-white border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Value per Store
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <input
                  type="text"
                  value={wizardState.valuePerStore}
                  onChange={(e) => setWizardState({ ...wizardState, valuePerStore: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 4: Number Of Integrations (light gray/blue #EEF3F8) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-[#EEF3F8] border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Number Of Integrations
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <input
                  type="text"
                  value={wizardState.numberOfIntegrations}
                  onChange={(e) => setWizardState({ ...wizardState, numberOfIntegrations: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Discount Percetage (white) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-white border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Discount Percetage
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <input
                  type="text"
                  value={wizardState.discountPercentage}
                  onChange={(e) => setWizardState({ ...wizardState, discountPercentage: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 6: GST (light gray/blue #EEF3F8) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-[#EEF3F8] border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                GST
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <input
                  type="text"
                  value={wizardState.gst}
                  onChange={(e) => setWizardState({ ...wizardState, gst: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 7: Total Integrations (white) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-white border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Total Integrations
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <input
                  type="text"
                  value={wizardState.totalIntegrations}
                  onChange={(e) => setWizardState({ ...wizardState, totalIntegrations: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 8: Reseller Invoice (light gray/blue #EEF3F8) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-[#EEF3F8] border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Reseller Invoice
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <input
                  type="text"
                  value={wizardState.resellerInvoice}
                  onChange={(e) => setWizardState({ ...wizardState, resellerInvoice: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 9: Payment Type (white) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-white border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Payment Type
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <select
                  value={wizardState.paymentType}
                  onChange={(e) => setWizardState({ ...wizardState, paymentType: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D0D7DE] rounded text-[#24292F] focus:border-[#0084B4] focus:outline-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="Direct Debit">Direct Debit</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Invoice / Net 30">Invoice / Net 30</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Prepaid Account">Prepaid Account</option>
                </select>
              </div>
            </div>

            {/* Row 10: Total per Month (light gray/blue #EEF3F8 with disabled box) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-[#EEF3F8] border-b border-[#D0D7DE] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Total per Month
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <div className="w-full h-[38px] px-3.5 py-2 text-sm bg-[#D8DEE4] border border-[#CBD5E1] rounded text-[#24292F] font-semibold flex items-center select-none">
                  {wizardState.totalPerMonth ? wizardState.totalPerMonth : ''}
                </div>
              </div>
            </div>

            {/* Row 11: Total Invoice (white with disabled box) */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-white px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-[#24292F]">
                Total Invoice
              </div>
              <div className="md:col-span-7 mt-1 md:mt-0">
                <div className="w-full h-[38px] px-3.5 py-2 text-sm bg-[#D8DEE4] border border-[#CBD5E1] rounded text-[#24292F] font-semibold flex items-center select-none">
                  {wizardState.totalInvoice ? wizardState.totalInvoice : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: VERIFY - EXACT MATCH TO REFERENCE SCREENSHOT */}
        {currentStep === 9 && (
          <div className="space-y-8 max-w-5xl">
            {/* Section 1: Name and Logo */}
            <div className="border-b border-[#D0D7DE] pb-6 space-y-2">
              <h3 className="text-base font-bold text-[#24292F]">
                Name and Logo
              </h3>
              <p className="text-xs text-gray-700 font-medium">
                You can edit the display name and logo for this client at a later stage
              </p>
              <div className="pt-2 text-sm font-semibold text-[#24292F]">
                {wizardState.clientName || 'testclient'}
              </div>
              <div className="pt-1">
                {wizardState.logoUrl ? (
                  <img src={wizardState.logoUrl} alt="Client Logo" className="h-10 object-contain" />
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded shadow-sm">
                    <span className="text-[#023E6B] font-extrabold text-lg tracking-tight">Ticket</span>
                    <span className="bg-[#E91E63] text-white text-xs font-black px-1.5 py-0.5 rounded tracking-wider">IT</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Tickets and Data */}
            <div className="border-b border-[#D0D7DE] pb-6 space-y-4">
              <h3 className="text-base font-bold text-[#24292F]">
                Tickets and Data
              </h3>

              {/* Matching Ticket fields */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#24292F]">
                  Matching Ticket fields
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  The following Ticket fields were found in the data spreadsheet:
                </div>
                <ul className="list-disc list-inside text-xs text-[#24292F] font-semibold pl-1 space-y-0.5 pt-1">
                  <li>Product Name</li>
                  <li>Brand</li>
                </ul>
              </div>

              {/* Missing Ticket fields */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#24292F]">
                  Missing Ticket fields
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  The following Ticket fields were missing from the data spreadsheet:
                </div>
                <ul className="list-disc list-inside text-xs text-[#24292F] font-medium pl-1 space-y-0.5 pt-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-0.5">
                  <li>OFF_IN</li>
                  <li>Savings_M</li>
                  <li>SavingsPercent_M</li>
                  <li>Savings_S</li>
                  <li>SavingsPercent_S</li>
                  <li>OFF_SideEdge_S</li>
                  <li>Was Price_Dollar Sign</li>
                  <li>Was Price_Dollars</li>
                  <li>Was Price_Cents</li>
                  <li>Was_Label</li>
                  <li>Sale Price_Dollar Sign</li>
                  <li>Sale Price_Dollars</li>
                  <li>Sale Price_Cents</li>
                  <li>New_Label</li>
                  <li>QRCode_Image</li>
                  <li>line_Image</li>
                  <li>PanelMessage1</li>
                  <li>afterpaylogo_Image</li>
                </ul>
              </div>

              <p className="text-xs text-gray-700 font-medium pt-1">
                If the fields matched as expected, you do not need to do anything. Otherwise, you may re-upload either or both the data and ticket files:
              </p>

              {/* Data Re-upload Bar */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#24292F]">Data</div>
                <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                  <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                    Choose File
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleDataFileUpload} className="hidden" />
                  </label>
                  <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                    {wizardState.dataFileName || 'NO FILE CHOSEN'}
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium">Please upload an XLSX file</p>
              </div>

              {/* Ticket Re-upload Bar */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#24292F]">Ticket</div>
                <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                  <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                    Choose File
                    <input
                      type="file"
                      accept=".xml"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setWizardState((prev) => ({ ...prev, ticketXmlFileName: f.name }));
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                    {wizardState.ticketXmlFileName || 'NO FILE CHOSEN'}
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium">Please upload an XML file</p>
              </div>
            </div>

            {/* Section 3: Ticket Settings */}
            <div className="border-b border-[#D0D7DE] pb-6 space-y-3">
              <h3 className="text-base font-bold text-[#24292F]">
                Ticket Settings
              </h3>
              <p className="text-xs text-gray-700 font-medium">
                You can edit the settings for this ticket at a later stage
              </p>

              <div className="space-y-2.5 text-xs text-[#24292F] font-medium pt-1">
                <div>
                  <div className="font-semibold text-gray-700">Rows</div>
                  <div>{wizardState.rows || 1}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Columns</div>
                  <div>{wizardState.columns || 1}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Orientation</div>
                  <div>{wizardState.orientation || 'Portrait'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Paper Size (custom will take the size from the xml file)</div>
                  <div>{wizardState.paperSize || 'A4'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Allow Products Without Price?</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={wizardState.allowProductsWithoutPrice}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Print Background?</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={wizardState.printBackground}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Output print files as CMYK?</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={wizardState.outputPrintCmyk}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Use bleed and add crop marks? (can only be used with custom page sizes)</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={wizardState.useBleedAndCropMarks}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Is this a multi page PDF? (can only be used with custom page sizes)</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={wizardState.isMultiPagePdf}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">PageCount</div>
                  <div>0</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Only allow franchisees to edit lookup fields?</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={wizardState.onlyAllowFranchiseesEditLookup}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Ordering of the ticket, orders in ascending order</div>
                  <div>{wizardState.ticketOrdering || 0}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Offset the printing origin X axis, this is per ticket</div>
                  <div>{wizardState.offsetOriginX || '0.00'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Offset the printing origin Y axis, this is per ticket</div>
                  <div>{wizardState.offsetOriginY || '0.00'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">IsPngOutput</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={wizardState.isPngOutput}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">PngWidth</div>
                  <div>{wizardState.pngWidth || ''}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">PngHeight</div>
                  <div>{wizardState.pngHeight || ''}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">IsPngSolumOutput</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0084B4]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Content Files */}
            <div className="border-b border-[#D0D7DE] pb-6 space-y-4">
              <h3 className="text-base font-bold text-[#24292F]">
                Content Files
              </h3>

              {/* Matching Ticket Fonts */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#24292F]">
                  Matching Ticket Fonts
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  The following Ticket fonts were found in the content ZIP:
                </div>
                <ul className="list-disc list-inside text-xs text-[#24292F] font-semibold pl-1 space-y-0.5 pt-1">
                  <li>ITCAvantGardePro-Bold.ttf</li>
                  <li>ITCAvantGardeGothicPro-Bold.ttf</li>
                  <li>Rockwell-Bold.ttf</li>
                </ul>
              </div>

              {/* Missing Ticket fonts */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#24292F]">
                  Missing Ticket fonts
                </div>
                <div className="text-xs text-[#24292F] font-medium">
                  No fonts are missing.
                </div>
              </div>

              {/* Matching Ticket Images */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#24292F]">
                  Matching Ticket Images
                </div>
                <div className="text-xs text-[#24292F] font-medium">
                  No matches were found!
                </div>
              </div>

              {/* Missing Ticket images */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#24292F]">
                  Missing Ticket images
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  The following Ticket images were missing from the content ZIP:
                </div>
                <ul className="list-disc list-inside text-xs text-[#24292F] font-medium pl-1 space-y-0.5 pt-1">
                  <li>QRCode_Image.png</li>
                  <li>line_Image.png</li>
                  <li>afterpaylogo_Image.png</li>
                </ul>
              </div>

              <p className="text-xs text-gray-700 font-medium pt-1">
                If the fonts and images matched as expected, you do not need to do anything. Otherwise, please re-upload the content ZIP:
              </p>

              {/* Content Files Re-upload Bar */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#24292F]">Content Files</div>
                <div className="bg-[#4BAA38] rounded-md p-1.5 sm:p-2 flex items-center gap-3 shadow-inner">
                  <label className="bg-[#ECEFF3] hover:bg-white text-[#24292F] text-xs font-bold px-3.5 py-1.5 rounded border border-[#BFC8D2] shadow-sm cursor-pointer whitespace-nowrap transition-colors select-none">
                    Choose File
                    <input
                      type="file"
                      accept=".zip,.rar,.tar.gz,.7z"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setWizardState((prev) => ({ ...prev, contentZipFileName: f.name }));
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                    {wizardState.contentZipFileName || 'NO FILE CHOSEN'}
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium">Please upload a ZIP file</p>
              </div>
            </div>

            {/* Section 5: Regions */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#24292F]">
                Regions
              </h3>
              <p className="text-xs text-gray-700 font-medium">
                You can edit the regions for this client at a later stage
              </p>

              <div className="space-y-1 text-xs text-[#24292F] font-medium pt-2">
                <div>Client Name In Report: {wizardState.clientNameInReport || wizardState.clientName || 'test'}</div>
                <div>Value/Store: {wizardState.valuePerStore || '0'}</div>
                <div>GST: {wizardState.gst || '0'}</div>
                <div>Discount %: {wizardState.discountPercentage || '0'}</div>
                <div>No. Of Integrations: {wizardState.numberOfIntegrations || '0'}</div>
                <div>Total Integrations: {wizardState.totalIntegrations || '0'}</div>
                <div>Invoice/Month: {wizardState.totalPerMonth || '0'}</div>
                <div>Total Invoice: {wizardState.totalInvoice || '0'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Bottom Action Button Bar - EXACT MATCH TO REFERENCE SCREENSHOT */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Previous Step Button */}
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-5 py-2.5 bg-white border border-[#D0D7DE] text-xs font-extrabold uppercase tracking-wider text-[#023E6B] rounded hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{prevStepLabel}</span>
            </button>
          )}
        </div>

        {/* Next / Submit Button - Prominent Green Button matching image */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (selectedClientForRead && selectedClientForRead !== 'NEW') {
                ClientService.updateClientWizard(selectedClientForRead, wizardState);
                showToast('success', 'Draft Saved', 'Client configuration saved.');
              } else {
                showToast('info', 'Draft Kept', 'Configuration retained in session.');
              }
            }}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-ticketit-navy underline"
          >
            Save Progress
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 bg-[#4BAA38] hover:bg-[#3f912e] active:bg-[#347b25] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded shadow-md transition-all flex items-center justify-center gap-2 select-none"
          >
            <span>{nextStepLabel}</span>
            {currentStep < 9 && <ArrowRight className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Copyright Footer matching reference */}
      <div className="text-center text-xs font-bold text-[#24292F] mt-8 pt-4">
        © 2026 Scarlett Eden Limited
      </div>
    </div>
  );
};
