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
      {/* Top Header & Client Switcher Bar - Brand Themed */}
      <div className="bg-white border border-ticketit-border rounded-xl p-4 sm:p-5 shadow-card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-ticketit-pink via-ticketit-coral to-ticketit-blush flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-ticketit-navy tracking-tight">
                  {selectedClientForRead && selectedClientForRead !== 'NEW'
                    ? `Client Settings: ${wizardState.clientName || 'Existing Client'}`
                    : 'Create Client Profile'}
                </h1>
                <span className="bg-ticketit-pink-light text-ticketit-pink text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-ticketit-pink/20">
                  Step {currentStep} of {WIZARD_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-ticketit-text-muted mt-0.5 font-medium">
                In-Store Retail Ticketing & Electronic Shelf Label Provisioning Setup
              </p>
            </div>
          </div>

          {/* Client Selector & Quick actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-ticketit-bg-light border border-ticketit-border px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-[11px] font-bold text-ticketit-text-muted uppercase tracking-wider whitespace-nowrap">
                Mode:
              </span>
              <select
                value={selectedClientForRead}
                onChange={(e) => handleClientSelectChange(e.target.value)}
                className="text-xs font-bold text-ticketit-navy bg-transparent focus:outline-none cursor-pointer"
                aria-label="Select Client Wizard Profile"
              >
                <option value="">➕ Create New Client</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    📂 {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleLoadSampleData}
              className="px-3.5 py-1.5 bg-gradient-to-r from-ticketit-pink-light to-ticketit-pink-subtle border border-ticketit-pink/30 text-xs font-bold text-ticketit-pink rounded-lg hover:border-ticketit-pink shadow-sm flex items-center gap-1.5 transition-all"
              title="Pre-fill wizard with realistic supermarket retail data"
            >
              <Sparkles className="w-3.5 h-3.5 text-ticketit-pink" />
              <span>Load Preset Data</span>
            </button>

            <Link
              href="/DynamicClient"
              className="px-3.5 py-1.5 bg-white border border-ticketit-border text-xs font-bold text-ticketit-navy rounded-lg hover:bg-ticketit-bg-light shadow-sm transition-colors"
            >
              Back to Clients
            </Link>
          </div>
        </div>
      </div>

      {/* Breadcrumbs / Wizard Steps Horizontal Menu - TicketIT Brand Design */}
      <div className="bg-white border border-ticketit-border rounded-xl p-2 sm:p-3 mb-6 shadow-card overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max text-xs font-bold tracking-wide uppercase">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <React.Fragment key={step.id}>
                {index > 0 && <span className="text-ticketit-border font-bold select-none px-1">/</span>}
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap select-none flex items-center gap-1.5 ${isActive
                    ? 'bg-ticketit-navy text-white shadow-sm font-black ring-2 ring-ticketit-pink/30'
                    : isCompleted
                      ? 'text-ticketit-green hover:bg-ticketit-green-light font-bold'
                      : 'text-ticketit-text-muted hover:text-ticketit-navy hover:bg-ticketit-bg-light font-semibold'
                    }`}
                  title={`Navigate to Step ${step.id}: ${step.title}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${isActive
                    ? 'bg-ticketit-pink text-white'
                    : isCompleted
                      ? 'bg-ticketit-green text-white'
                      : 'bg-ticketit-border text-ticketit-text-muted'
                    }`}>
                    {isCompleted ? '✓' : step.id}
                  </span>
                  <span>{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white border border-ticketit-border rounded-xl p-6 sm:p-8 shadow-card mb-6">
        {/* Step Card Heading */}
        {currentStep !== 8 && (
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-ticketit-border-light">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ticketit-navy tracking-tight">
                {currentStep === 9 ? 'Verify Client Configuration' : currentStepObj.title}
              </h2>
              <p className="text-xs text-ticketit-text-muted mt-0.5">
                {currentStep === 1
                  ? 'Define the primary trading name and visual brand mark for client ticketing'
                  : 'Configure the parameters for this step'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-ticketit-green animate-pulse" />
              <span className="text-xs font-bold text-ticketit-green uppercase tracking-wider">
                Active Setup Mode
              </span>
            </div>
          </div>
        )}

        {/* STEP 1: NAME AND LOGO - PREMIUM ENHANCED & BRAND INTEGRATED */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Client Name Input Field */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="client-name-input" className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                    Name <span className="text-ticketit-pink">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-ticketit-pink bg-ticketit-pink-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Required
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ticketit-text-muted">
                    <Store className="w-4 h-4 text-ticketit-pink" />
                  </div>
                  <input
                    id="client-name-input"
                    type="text"
                    value={wizardState.clientName}
                    placeholder="e.g. SuperValu Stores NZ"
                    onChange={(e) => {
                      const val = e.target.value;
                      setWizardState({
                        ...wizardState,
                        clientName: val,
                        clientCode: wizardState.clientCode || val.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase(),
                      });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-semibold placeholder:text-ticketit-text-light placeholder:font-normal focus:border-ticketit-pink focus:ring-4 focus:ring-ticketit-pink/10 focus:outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Quick Presets for Instant Testing */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-ticketit-text-muted mr-1">
                    Quick suggestions:
                  </span>
                  {['SuperValu Stores', 'FreshChoice Metro', 'Countdown Retail', 'Pak\'nSave Hypermarket'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setWizardState({
                          ...wizardState,
                          clientName: preset,
                          clientCode: preset.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase(),
                        });
                        showToast('info', 'Preset Applied', `Set name to ${preset}`);
                      }}
                      className="text-[11px] font-bold px-2 py-0.5 bg-white border border-ticketit-border rounded-md text-ticketit-navy hover:text-ticketit-pink hover:border-ticketit-pink/40 shadow-xs transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload Section - Signature Brand Green & Interactive Dropzone */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                    Logo
                  </label>
                  <span className="text-[10px] font-bold text-ticketit-green bg-ticketit-green-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Brand Vector / Raster
                  </span>
                </div>

                {/* Signature Brand Green File Selector Bar */}
                <div className="bg-gradient-to-r from-ticketit-green to-[#4AA46C] rounded-lg p-2 flex items-center justify-between gap-3 shadow-sm border border-ticketit-green">
                  <div className="flex items-center gap-3 min-w-0">
                    <label className="bg-white hover:bg-ticketit-pink-subtle text-ticketit-navy text-xs font-black px-3.5 py-1.5 rounded-md border border-white/60 shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95">
                      <Upload className="w-3.5 h-3.5 text-ticketit-green" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider truncate">
                      {wizardState.logoFileName || 'NO FILE CHOSEN'}
                    </span>
                  </div>

                  {wizardState.logoFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setWizardState((prev) => ({
                          ...prev,
                          logoFileName: '',
                          logoUrl: undefined,
                        }));
                        showToast('info', 'Logo Removed', 'Brand logo cleared.');
                      }}
                      className="text-white/80 hover:text-white p-1 hover:bg-black/10 rounded transition-colors"
                      title="Clear logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-ticketit-navy font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ticketit-pink inline-block" />
                  Please upload a file of type png or jpg
                </p>


              </div>
            </div>

          </div>
        )}

        {/* STEP 2: UPLOAD DATA - BRAND THEMED */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Header & Upload Card */}
            <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-ticketit-navy uppercase tracking-wider">
                    Product Catalog Feed (.XLSX)
                  </h3>
                  <p className="text-xs text-ticketit-text-muted mt-0.5">
                    Upload your store's primary spreadsheet with SKUs, barcodes, descriptions, and retail pricing.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-ticketit-green bg-ticketit-green-light px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start">
                  Excel / CSV / XML
                </span>
              </div>

              {/* Signature Brand Green Upload Bar */}
              <div className="bg-gradient-to-r from-ticketit-green to-[#4AA46C] rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-sm border border-ticketit-green">
                <div className="flex items-center gap-3 min-w-0">
                  <label className="bg-white hover:bg-ticketit-pink-subtle text-ticketit-navy text-xs font-black px-4 py-2 rounded-md border border-white/60 shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 active:scale-95">
                    <Upload className="w-4 h-4 text-ticketit-green" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.xml"
                      onChange={handleDataFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider truncate">
                    {wizardState.dataFileName
                      ? `${wizardState.dataFileName} ${wizardState.dataFileSize ? `(${wizardState.dataFileSize})` : ''}`
                      : 'NO FILE CHOSEN'}
                  </span>
                </div>

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
                    className="text-white/80 hover:text-white p-1.5 hover:bg-black/10 rounded transition-colors"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-ticketit-navy font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ticketit-pink inline-block" />
                Please upload an XLSX, XLS or CSV file
              </p>

              {/* Quick Sample Action */}
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-ticketit-border">
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
                    showToast('success', 'Sample Data Loaded', 'Loaded 14,200 supermarket product records.');
                  }}
                  className="px-3.5 py-1.5 bg-white border border-ticketit-border text-xs font-bold text-ticketit-navy rounded-lg hover:border-ticketit-pink/50 hover:text-ticketit-pink shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-ticketit-green" />
                  <span>Attach Sample Supermarket Catalog (14,200 Products)</span>
                </button>
              </div>
            </div>

            {/* Parsed Spreadsheet Preview Table */}
            {wizardState.dataSampleRows.length > 0 && (
              <div className="border border-ticketit-border rounded-xl bg-white p-5 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ticketit-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ticketit-green animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-ticketit-navy">
                      Parsed Spreadsheet Preview ({wizardState.dataRecordCount.toLocaleString()} Total Records)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-ticketit-green bg-ticketit-green-light px-2.5 py-0.5 rounded-full border border-ticketit-green/30">
                    ✓ Schema Validated
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-ticketit-border">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-ticketit-table-header text-ticketit-navy font-bold border-b border-ticketit-border">
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Barcode</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Brand</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-right">Retail Price</th>
                        <th className="p-2.5 text-right">Promo Price</th>
                        <th className="p-2.5">Unit Measure</th>
                        <th className="p-2.5">Origin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ticketit-border-light">
                      {wizardState.dataSampleRows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-ticketit-pink-subtle/30' : 'bg-ticketit-table-stripe hover:bg-ticketit-pink-subtle/30'}>
                          <td className="p-2.5 font-mono font-bold text-ticketit-navy">{row.SKU}</td>
                          <td className="p-2.5 font-mono text-ticketit-text-muted">{row.Barcode}</td>
                          <td className="p-2.5 font-bold text-ticketit-navy">{row.Description}</td>
                          <td className="p-2.5 text-ticketit-text-muted">{row.Brand}</td>
                          <td className="p-2.5 text-ticketit-text-muted">{row.Category}</td>
                          <td className="p-2.5 text-right font-bold text-ticketit-navy">{row.RetailPrice}</td>
                          <td className="p-2.5 text-right font-black text-ticketit-pink">{row.PromoPrice}</td>
                          <td className="p-2.5 text-ticketit-text-muted">{row.UnitMeasure}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-ticketit-green-light text-ticketit-green font-bold text-[10px] border border-ticketit-green/20">
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

        {/* STEP 3: UPLOAD TICKET & SETTINGS - BRAND THEMED */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Top Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Field 1: Ticket Background */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                    Ticket Background
                  </label>
                  <span className="text-[10px] font-bold text-ticketit-pink bg-ticketit-pink-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Vector / AI
                  </span>
                </div>
                <div className="bg-gradient-to-r from-ticketit-green to-[#4AA46C] rounded-lg p-2 flex items-center justify-between gap-3 shadow-sm border border-ticketit-green">
                  <div className="flex items-center gap-3 min-w-0">
                    <label className="bg-white hover:bg-ticketit-pink-subtle text-ticketit-navy text-xs font-black px-3.5 py-1.5 rounded-md border border-white/60 shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95">
                      <Upload className="w-3.5 h-3.5 text-ticketit-green" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".png,.pdf,.ai,.svg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWizardState((prev) => ({ ...prev, ticketBackgroundFileName: file.name }));
                            showToast('success', 'Background Uploaded', `${file.name} attached.`);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider truncate">
                      {wizardState.ticketBackgroundFileName || 'NO FILE CHOSEN'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ticketit-navy font-semibold">
                  Please upload a PNG, PDF, SVG or AI file
                </p>
              </div>

              {/* Field 2: Ticket XML Template */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                    Ticket XML Template
                  </label>
                  <span className="text-[10px] font-bold text-ticketit-green bg-ticketit-green-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Schema Definition
                  </span>
                </div>
                <div className="bg-gradient-to-r from-ticketit-green to-[#4AA46C] rounded-lg p-2 flex items-center justify-between gap-3 shadow-sm border border-ticketit-green">
                  <div className="flex items-center gap-3 min-w-0">
                    <label className="bg-white hover:bg-ticketit-pink-subtle text-ticketit-navy text-xs font-black px-3.5 py-1.5 rounded-md border border-white/60 shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95">
                      <Upload className="w-3.5 h-3.5 text-ticketit-green" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".xml,.tkt,.json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWizardState((prev) => ({ ...prev, ticketXmlFileName: file.name }));
                            showToast('success', 'Ticket XML Uploaded', `${file.name} attached.`);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider truncate">
                      {wizardState.ticketXmlFileName || 'NO FILE CHOSEN'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ticketit-navy font-semibold">
                  Please upload an XML or TKT layout file
                </p>
              </div>
            </div>

            {/* Ticket Settings Section */}
            <div className="bg-white border border-ticketit-border rounded-xl p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-ticketit-border">
                <h3 className="text-base font-black text-ticketit-navy uppercase tracking-wider">
                  Ticket Print & Layout Parameters
                </h3>
                <span className="text-xs font-bold text-ticketit-text-muted">A4 & Thermal Standards</span>
              </div>

              {/* Grid 1: Layout Core */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1.5">
                    Paper Size
                  </label>
                  <select
                    value={wizardState.paperSize}
                    onChange={(e) =>
                      setWizardState({ ...wizardState, paperSize: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                  >
                    <option value="A4">A4 (Standard 210 x 297mm)</option>
                    <option value="A3">A3 (Poster 297 x 420mm)</option>
                    <option value="A5">A5 (Flyer 148 x 210mm)</option>
                    <option value="Letter">Letter (US 8.5 x 11 in)</option>
                    <option value="Custom">Custom (Take from XML)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1.5">
                    Orientation
                  </label>
                  <select
                    value={wizardState.orientation}
                    onChange={(e) =>
                      setWizardState({ ...wizardState, orientation: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1.5">
                    Rows per Sheet
                  </label>
                  <input
                    type="number"
                    value={wizardState.rows}
                    onChange={(e) =>
                      setWizardState({ ...wizardState, rows: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1.5">
                    Columns per Sheet
                  </label>
                  <input
                    type="number"
                    value={wizardState.columns}
                    onChange={(e) =>
                      setWizardState({ ...wizardState, columns: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                  />
                </div>
              </div>

              {/* Margins & Offsets */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-4 space-y-3">
                <div className="text-xs font-black text-ticketit-navy uppercase tracking-wider">
                  Print Margin Offsets (MM x 2.52)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-ticketit-text-muted mb-1">Top</label>
                    <input
                      type="text"
                      value={wizardState.printMarginOffset.top}
                      onChange={(e) =>
                        setWizardState({
                          ...wizardState,
                          printMarginOffset: { ...wizardState.printMarginOffset, top: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-ticketit-border rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-ticketit-text-muted mb-1">Right</label>
                    <input
                      type="text"
                      value={wizardState.printMarginOffset.right}
                      onChange={(e) =>
                        setWizardState({
                          ...wizardState,
                          printMarginOffset: { ...wizardState.printMarginOffset, right: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-ticketit-border rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-ticketit-text-muted mb-1">Bottom</label>
                    <input
                      type="text"
                      value={wizardState.printMarginOffset.bottom}
                      onChange={(e) =>
                        setWizardState({
                          ...wizardState,
                          printMarginOffset: { ...wizardState.printMarginOffset, bottom: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-ticketit-border rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-ticketit-text-muted mb-1">Left</label>
                    <input
                      type="text"
                      value={wizardState.printMarginOffset.left}
                      onChange={(e) =>
                        setWizardState({
                          ...wizardState,
                          printMarginOffset: { ...wizardState.printMarginOffset, left: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-ticketit-border rounded font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {[
                  { key: 'printBackground', label: 'Print Background' },
                  { key: 'outputPrintCmyk', label: 'Output as CMYK' },
                  { key: 'useBleedAndCropMarks', label: 'Bleed & Crop Marks' },
                  { key: 'isMultiPagePdf', label: 'Multi-Page PDF' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 p-3 bg-white border border-ticketit-border rounded-lg hover:border-ticketit-pink/40 cursor-pointer transition-all shadow-xs"
                  >
                    <input
                      type="checkbox"
                      checked={(wizardState as any)[item.key]}
                      onChange={(e) => setWizardState({ ...wizardState, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-ticketit-border text-ticketit-pink focus:ring-ticketit-pink/20"
                    />
                    <span className="text-xs font-bold text-ticketit-navy">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TICKET MAPPINGS - BRAND THEMED */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Primary Field Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-4 space-y-2">
                <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                  Product Name Field <span className="text-ticketit-pink">*</span>
                </label>
                <select
                  value={wizardState.productNameField || 'Description'}
                  onChange={(e) => setWizardState({ ...wizardState, productNameField: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                >
                  {TICKET_MAPPING_FIELD_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-4 space-y-2">
                <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                  Product ID / SKU Field <span className="text-ticketit-pink">*</span>
                </label>
                <select
                  value={wizardState.productIdField || 'SKU'}
                  onChange={(e) => setWizardState({ ...wizardState, productIdField: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                >
                  {TICKET_MAPPING_FIELD_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-4 space-y-2">
                <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                  Product Price Field <span className="text-ticketit-pink">*</span>
                </label>
                <select
                  value={wizardState.productPriceField || 'PromoPrice'}
                  onChange={(e) => setWizardState({ ...wizardState, productPriceField: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                >
                  {TICKET_MAPPING_FIELD_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field Permissions Matrix */}
            <div className="border border-ticketit-border rounded-xl bg-white p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ticketit-border">
                <h3 className="text-xs font-black uppercase tracking-wider text-ticketit-navy">
                  Field Permissions & Visibility Matrix
                </h3>
                <span className="text-[11px] font-bold text-ticketit-text-muted">
                  Control which columns store users can view and edit
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-ticketit-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-ticketit-table-header text-ticketit-navy font-bold border-b border-ticketit-border">
                      <th className="py-3 px-4 w-1/4">Field Identifier</th>
                      <th className="py-3 px-4 text-center">View Fields</th>
                      <th className="py-3 px-4 text-center">Edit Fields</th>
                      <th className="py-3 px-4 text-center">Adhoc View</th>
                      <th className="py-3 px-4 text-center">Adhoc Edit</th>
                      <th className="py-3 px-4 text-center">Summary View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ticketit-border-light">
                    {(wizardState.mappingPermissions && wizardState.mappingPermissions.length > 0
                      ? wizardState.mappingPermissions
                      : DEFAULT_MAPPING_PERMISSIONS
                    ).map((perm, idx) => (
                      <tr key={perm.fieldName} className={idx % 2 === 0 ? 'bg-white hover:bg-ticketit-pink-subtle/30' : 'bg-ticketit-table-stripe hover:bg-ticketit-pink-subtle/30'}>
                        <td className="py-2.5 px-4 font-bold text-ticketit-navy font-mono">
                          {perm.fieldName}
                        </td>
                        {['viewFields', 'editFields', 'adhocViewFields', 'adhocEditFields', 'summaryViewFields'].map((colKey) => (
                          <td key={colKey} className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={(perm as any)[colKey]}
                              onChange={() => {
                                const updated = [...(wizardState.mappingPermissions || DEFAULT_MAPPING_PERMISSIONS)];
                                updated[idx] = { ...updated[idx], [colKey]: !(updated[idx] as any)[colKey] };
                                setWizardState({ ...wizardState, mappingPermissions: updated });
                              }}
                              className="w-4 h-4 rounded border-ticketit-border text-ticketit-pink focus:ring-ticketit-pink/20 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: UPLOAD PATCHERS - BRAND THEMED */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-ticketit-pink-subtle border border-ticketit-pink/20 rounded-xl p-4 text-xs font-bold text-ticketit-navy">
              💡 The following C# patcher scripts are optional. Default transformation algorithms will be used if custom patchers are not provided.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Loaded Batch Patcher */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                    Loaded Batch Patcher (.CS)
                  </label>
                  <span className="text-[10px] font-bold text-ticketit-green bg-ticketit-green-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Pre-Process Script
                  </span>
                </div>
                <div className="bg-gradient-to-r from-ticketit-green to-[#4AA46C] rounded-lg p-2 flex items-center justify-between gap-3 shadow-sm border border-ticketit-green">
                  <div className="flex items-center gap-3 min-w-0">
                    <label className="bg-white hover:bg-ticketit-pink-subtle text-ticketit-navy text-xs font-black px-3.5 py-1.5 rounded-md border border-white/60 shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95">
                      <Upload className="w-3.5 h-3.5 text-ticketit-green" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".cs,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWizardState((prev) => ({ ...prev, loadedBatchPatcherFileName: file.name }));
                            showToast('success', 'Loaded Batch Patcher Uploaded', `${file.name} attached.`);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider truncate">
                      {wizardState.loadedBatchPatcherFileName || 'NO FILE CHOSEN'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ticketit-navy font-semibold">
                  Please upload a C# .CS script file
                </p>
              </div>

              {/* Rendered Batch Patcher */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                    Rendered Batch Patcher (.CS)
                  </label>
                  <span className="text-[10px] font-bold text-ticketit-pink bg-ticketit-pink-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Post-Render Script
                  </span>
                </div>
                <div className="bg-gradient-to-r from-ticketit-green to-[#4AA46C] rounded-lg p-2 flex items-center justify-between gap-3 shadow-sm border border-ticketit-green">
                  <div className="flex items-center gap-3 min-w-0">
                    <label className="bg-white hover:bg-ticketit-pink-subtle text-ticketit-navy text-xs font-black px-3.5 py-1.5 rounded-md border border-white/60 shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95">
                      <Upload className="w-3.5 h-3.5 text-ticketit-green" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".cs,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWizardState((prev) => ({ ...prev, renderedBatchPatcherFileName: file.name }));
                            showToast('success', 'Rendered Batch Patcher Uploaded', `${file.name} attached.`);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider truncate">
                      {wizardState.renderedBatchPatcherFileName || 'NO FILE CHOSEN'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ticketit-navy font-semibold">
                  Please upload a C# .CS script file
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: UPLOAD CONTENT - BRAND THEMED */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Detected Fonts */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-ticketit-navy">
                    Detected Ticket Fonts
                  </h3>
                  <span className="text-[10px] font-bold text-ticketit-green bg-ticketit-green-light px-2 py-0.5 rounded-full">
                    3 Fonts Found
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['ITCAvantGardePro-Bold.ttf', 'ITCAvantGardeGothicPro-Bold.ttf', 'Rockwell-Bold.ttf'].map((font) => (
                    <span key={font} className="px-2.5 py-1 rounded-md bg-white border border-ticketit-border text-xs font-mono font-bold text-ticketit-navy shadow-xs">
                      🔤 {font}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detected Images */}
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-ticketit-navy">
                    Detected Ticket Images
                  </h3>
                  <span className="text-[10px] font-bold text-ticketit-pink bg-ticketit-pink-light px-2 py-0.5 rounded-full">
                    3 Assets
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['QRCode_Image.png', 'line_Image.png', 'afterpaylogo_Image.png'].map((img) => (
                    <span key={img} className="px-2.5 py-1 rounded-md bg-white border border-ticketit-border text-xs font-mono font-bold text-ticketit-navy shadow-xs">
                      🖼️ {img}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Zip File Upload */}
            <div className="bg-white border border-ticketit-border rounded-xl p-6 shadow-card space-y-3">
              <label className="block text-xs font-black text-ticketit-navy uppercase tracking-wider">
                Content Files Bundle (.ZIP)
              </label>
              <div className="bg-gradient-to-r from-ticketit-green to-[#4AA46C] rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-sm border border-ticketit-green">
                <div className="flex items-center gap-3 min-w-0">
                  <label className="bg-white hover:bg-ticketit-pink-subtle text-ticketit-navy text-xs font-black px-4 py-2 rounded-md border border-white/60 shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 active:scale-95">
                    <Upload className="w-4 h-4 text-ticketit-green" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".zip,.rar,.tar.gz,.7z"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setWizardState((prev) => ({ ...prev, contentZipFileName: file.name }));
                          showToast('success', 'Content ZIP Uploaded', `${file.name} attached.`);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider truncate">
                    {wizardState.contentZipFileName || 'NO FILE CHOSEN'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-ticketit-navy font-semibold">
                Please upload a ZIP file containing custom fonts and graphics
              </p>
            </div>
          </div>
        )}

        {/* STEP 7: REGIONS & TERRITORIES - BRAND THEMED */}
        {currentStep === 7 && (
          <div className="space-y-6">
            {((wizardState.regions && wizardState.regions.length > 0)
              ? wizardState.regions
              : [{ id: 'reg-default', name: 'Auckland & North Island', description: 'Primary Metro Stores' }]
            ).map((region, idx) => (
              <div
                key={region.id}
                className="border border-ticketit-border rounded-xl bg-white p-6 space-y-4 shadow-card"
              >
                <div className="flex items-center justify-between pb-3 border-b border-ticketit-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-ticketit-pink text-white flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </div>
                    <h3 className="text-sm font-black text-ticketit-navy uppercase tracking-wider">
                      Region / Territory Setup
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRegion(region.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1.5">
                      Region Name <span className="text-ticketit-pink">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Auckland Metro"
                      value={region.name}
                      onChange={(e) => handleUpdateRegion(region.id, 'name', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-bold focus:border-ticketit-pink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Supermarket network across North Island"
                      value={region.description}
                      onChange={(e) => handleUpdateRegion(region.id, 'description', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-ticketit-border rounded-lg text-ticketit-navy font-medium focus:border-ticketit-pink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRegion}
              className="px-5 py-2.5 bg-white border-2 border-dashed border-ticketit-pink/40 hover:border-ticketit-pink text-ticketit-pink hover:bg-ticketit-pink-subtle text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 w-full justify-center shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Regional Territory</span>
            </button>
          </div>
        )}

        {/* STEP 8: INVOICING & COMMERCE - BRAND THEMED */}
        {currentStep === 8 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-7 bg-white border border-ticketit-border rounded-xl p-6 shadow-card space-y-4">
              <h3 className="text-sm font-black text-ticketit-navy uppercase tracking-wider pb-3 border-b border-ticketit-border">
                Billing & Commercial Parameters
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1">
                    Client Name in Invoice Report
                  </label>
                  <input
                    type="text"
                    value={wizardState.clientNameInReport || wizardState.clientName}
                    onChange={(e) => setWizardState({ ...wizardState, clientNameInReport: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-ticketit-border rounded-lg font-bold text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1">
                      Number of Stores
                    </label>
                    <input
                      type="number"
                      value={wizardState.numberOfStores || 10}
                      onChange={(e) => setWizardState({ ...wizardState, numberOfStores: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-ticketit-border rounded-lg font-bold text-ticketit-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1">
                      Value per Store ($/mo)
                    </label>
                    <input
                      type="text"
                      value={wizardState.valuePerStore || '150.00'}
                      onChange={(e) => setWizardState({ ...wizardState, valuePerStore: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-ticketit-border rounded-lg font-mono font-bold text-ticketit-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="text"
                      value={wizardState.discountPercentage || '0'}
                      onChange={(e) => setWizardState({ ...wizardState, discountPercentage: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-ticketit-border rounded-lg font-mono font-bold text-ticketit-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1">
                      GST Tax (%)
                    </label>
                    <input
                      type="text"
                      value={wizardState.gst || '15'}
                      onChange={(e) => setWizardState({ ...wizardState, gst: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-ticketit-border rounded-lg font-mono font-bold text-ticketit-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ticketit-navy uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={wizardState.paymentType || 'Direct Debit'}
                    onChange={(e) => setWizardState({ ...wizardState, paymentType: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-ticketit-border rounded-lg font-bold text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
                  >
                    <option value="Direct Debit">Direct Debit</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Invoice / Net 30">Invoice / Net 30</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Live Calculation Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-ticketit-navy to-ticketit-navy-dark text-white rounded-xl p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-xs font-black uppercase tracking-wider text-ticketit-pink">
                  Commercial Monthly Summary
                </h3>
                <span className="text-[10px] font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                  NZD Currency
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Base Store Rate ({wizardState.numberOfStores || 10} Stores):</span>
                  <span className="font-mono font-bold text-white">
                    ${((wizardState.numberOfStores || 10) * parseFloat(wizardState.valuePerStore || '150')).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Integrations Fee:</span>
                  <span className="font-mono font-bold text-white">${wizardState.totalIntegrations || '250.00'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">GST ({wizardState.gst || 15}%):</span>
                  <span className="font-mono font-bold text-white">
                    ${(((wizardState.numberOfStores || 10) * parseFloat(wizardState.valuePerStore || '150')) * (parseFloat(wizardState.gst || '15') / 100)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Monthly Retainer</div>
                  <div className="text-2xl font-black text-ticketit-pink tracking-tight">
                    ${(((wizardState.numberOfStores || 10) * parseFloat(wizardState.valuePerStore || '150') * (1 + parseFloat(wizardState.gst || '15') / 100)) + parseFloat(wizardState.totalIntegrations || '250')).toFixed(2)}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-ticketit-green bg-ticketit-green/20 px-2 py-0.5 rounded uppercase">
                  ✓ Ready for Billing
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: VERIFY & PROVISION - BRAND THEMED */}
        {currentStep === 9 && (
          <div className="space-y-6 max-w-5xl">
            {/* Overview Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-4">
                <div className="text-[10px] font-bold text-ticketit-text-muted uppercase tracking-wider">Trading Profile</div>
                <div className="text-base font-black text-ticketit-navy mt-1 truncate">
                  {wizardState.clientName || 'SuperValu Stores NZ'}
                </div>
                <div className="text-xs font-bold text-ticketit-pink mt-0.5 font-mono">
                  {wizardState.clientCode || 'SUP-NZ'}
                </div>
              </div>

              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-4">
                <div className="text-[10px] font-bold text-ticketit-text-muted uppercase tracking-wider">Catalog Feed</div>
                <div className="text-base font-black text-ticketit-navy mt-1 truncate">
                  {wizardState.dataFileName || 'Catalog Configured'}
                </div>
                <div className="text-xs font-bold text-ticketit-green mt-0.5">
                  ✓ {wizardState.dataRecordCount || 14200} Records Validated
                </div>
              </div>

              <div className="bg-ticketit-bg-light/60 border border-ticketit-border rounded-xl p-4">
                <div className="text-[10px] font-bold text-ticketit-text-muted uppercase tracking-wider">Regional Stores</div>
                <div className="text-base font-black text-ticketit-navy mt-1">
                  {wizardState.numberOfStores || 10} Stores Provisioned
                </div>
                <div className="text-xs font-bold text-ticketit-navy mt-0.5">
                  Across {wizardState.regions?.length || 2} Territories
                </div>
              </div>
            </div>

            {/* Reconciliation Audit Checklist */}
            <div className="bg-white border border-ticketit-border rounded-xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ticketit-border">
                <h3 className="text-xs font-black uppercase tracking-wider text-ticketit-navy">
                  Pre-Flight Provisioning Audit
                </h3>
                <span className="text-[11px] font-bold text-ticketit-green bg-ticketit-green-light px-2.5 py-0.5 rounded-full">
                  100% Ready
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Brand Identity & Logo', desc: `${wizardState.clientName || 'Client'} with vector logo asset registered.` },
                  { title: 'Catalog Feed & Mappings', desc: `${wizardState.dataRecordCount || 14200} rows mapped with SKU, Barcode and Price definitions.` },
                  { title: 'In-Store Ticket Layout', desc: `${wizardState.paperSize || 'A4'} layout configured with CMYK output and crop marks.` },
                  { title: 'Regional Deployment', desc: `${wizardState.regions?.length || 2} territories ready for Electronic Shelf Label sync.` },
                ].map((audit, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-ticketit-bg-light/40 border border-ticketit-border-light">
                    <div className="w-5 h-5 rounded-full bg-ticketit-green text-white flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ticketit-navy">{audit.title}</div>
                      <div className="text-[11px] text-ticketit-text-muted">{audit.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Bottom Action Button Bar - Brand Themed */}
      <div className="bg-white border border-ticketit-border rounded-xl p-4 sm:p-5 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Previous Step Button */}
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-5 py-2.5 bg-white border border-ticketit-border text-xs font-black uppercase tracking-wider text-ticketit-navy rounded-lg hover:bg-ticketit-bg-light transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-ticketit-pink" />
              <span>{prevStepLabel}</span>
            </button>
          ) : (
            <Link
              href="/DynamicClient"
              className="px-5 py-2.5 bg-white border border-ticketit-border text-xs font-bold uppercase tracking-wider text-ticketit-text-muted hover:text-ticketit-navy rounded-lg hover:bg-ticketit-bg-light transition-all shadow-sm inline-flex items-center gap-2"
            >
              Cancel Setup
            </Link>
          )}
        </div>

        {/* Next / Submit Button - Prominent TicketIT Brand Green Action */}
        <div className="flex items-center justify-end gap-3">
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
            className="px-4 py-2 text-xs font-bold text-ticketit-text-muted hover:text-ticketit-pink transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 bg-ticketit-green hover:bg-ticketit-green-hover active:bg-[#3D8F5D] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-lg shadow-card hover:shadow-dropdown transition-all flex items-center justify-center gap-2 select-none active:scale-95 cursor-pointer"
          >
            <span>{nextStepLabel}</span>
            {currentStep < WIZARD_STEPS.length ? (
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
          </button>
        </div>
      </div>

      {/* Copyright & System Footer */}
      <div className="text-center text-xs font-bold text-ticketit-text-muted mt-8 pt-2 flex items-center justify-center gap-2">
        <span>© 2026 TicketIT In-Store Retail Management</span>
        <span>•</span>
        <span className="text-ticketit-pink">Enterprise Provisioning Engine</span>
      </div>
    </div>
  );
};
