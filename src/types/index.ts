export type UserGroup = 'Head Office' | 'Regional Managers' | 'Franchisees';
export type UserStatus = 'Active' | 'Inactive' | 'Pending';
export type UserRole = 'Super Admin' | 'Regional Manager' | 'Franchisee Operator' | 'Store Clerk' | 'Viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  region: string;
  storeCategory: string;
  group: UserGroup;
  invoicing: boolean;
  status: UserStatus;
  role: UserRole;
  storeName: string;
  lastLogin: string;
  phone?: string;
  department?: string;
}

export type ClientStatus = 'Active' | 'Suspended' | 'Trial';

export interface TicketMappingRowPermission {
  fieldName: string;
  viewFields: boolean;
  editFields: boolean;
  adhocViewFields: boolean;
  adhocEditFields: boolean;
  summaryViewFields: boolean;
}

export interface TicketFieldMapping {
  fieldKey: string;
  sourceColumn: string;
  dataType: 'text' | 'price' | 'barcode' | 'badge' | 'image';
  previewValue?: string;
}

export interface RegionBranchItem {
  id: string;
  code: string;
  name: string;
  city: string;
  activeESLs: number;
  managerEmail: string;
}

export interface ClientRegionItem {
  id: string;
  name: string;
  description: string;
  code?: string;
  taxRate?: number;
  currency?: string;
  branches?: RegionBranchItem[];
}

export interface ClientContentAsset {
  id: string;
  name: string;
  category: 'badge' | 'logo' | 'banner' | 'icon';
  size: string;
  previewUrl: string;
  status: 'active' | 'archived';
}

export interface ClientWizardState {
  // Step 1: Name and Logo
  clientName: string;
  clientCode: string;
  subdomain: string;
  industry: string;
  brandColor: string;
  logoFileName: string;
  logoUrl?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  licenseTier: 'Enterprise' | 'Professional' | 'Starter';
  defaultCurrency: string;
  country: string;

  // Step 2: Upload Data
  dataFileName: string;
  dataFileSize?: string;
  dataFileFormat: 'xlsx' | 'csv' | 'xml';
  dataRecordCount: number;
  dataHeaders: string[];
  dataSampleRows: Record<string, string>[];
  dataUploadStatus: 'pending' | 'uploaded' | 'validated';

  // Step 3: Upload Ticket
  ticketBackgroundFileName: string;
  ticketXmlFileName: string;
  ticketTemplateFileName: string;
  ticketTemplateType: 'Shelf Talker 70x40mm' | 'Promotional Highlight 100x60mm' | 'ESL 2.9" E-Ink Tag' | 'Deli Tag 90x50mm' | 'Custom Layout';
  ticketDimensions: string;
  ticketColorPalette: string;
  ticketPreviewUrl?: string;

  // Step 3 Detailed Ticket Settings (matching exact screenshot)
  paperSize: 'A4' | 'A3' | 'A5' | 'Letter' | 'Custom';
  orientation: 'Portrait' | 'Landscape';
  rows: number;
  columns: number;
  printMarginOffset: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  offsetOriginX: string;
  offsetOriginY: string;
  printBackground: boolean;
  outputPrintCmyk: boolean;
  useBleedAndCropMarks: boolean;
  isMultiPagePdf: boolean;
  allowProductsWithoutPrice: boolean;
  ticketOrdering: number;
  isPngOutput: boolean;
  pngWidth: string;
  pngHeight: string;
  onlyAllowFranchiseesEditLookup: boolean;
  coreDepartments: string;

  // Step 4: Ticket Mappings (matching exact screenshot)
  productNameField: string;
  productIdField: string;
  productPriceField: string;
  mappingPermissions: TicketMappingRowPermission[];
  mappings: TicketFieldMapping[];

  // Step 5: Upload Patchers (matching exact screenshot)
  loadedBatchPatcherFileName: string;
  renderedBatchPatcherFileName: string;
  patcherFileName: string;
  enabledRules: {
    gstCalculation: boolean;
    multiBuyDiscount: boolean;
    clubcardBadge: boolean;
    clearanceMarkdown: boolean;
    unitPricing100g: boolean;
    barcodeCheckDigit: boolean;
  };
  customScriptText?: string;

  // Step 6: Upload Content Files (matching exact screenshot)
  fontsFoundInTicket: string;
  imagesFoundInTicket: string;
  contentZipFileName: string;
  contentAssets: ClientContentAsset[];
  selectedBadges: string[];

  // Step 7: Regions
  regions: ClientRegionItem[];

  // Step 8: Invoicing (matching exact screenshot)
  clientNameInReport: string;
  numberOfStores: number;
  valuePerStore: string;
  numberOfIntegrations: string;
  discountPercentage: string;
  gst: string;
  totalIntegrations: string;
  resellerInvoice: string;
  paymentType: string;
  totalPerMonth: string;
  totalInvoice: string;
  invoicingEnabled?: boolean;
  billingEntityName?: string;
  billingContactEmail?: string;
  billingAddress?: string;
  taxNumber?: string;
  paymentTerms?: 'Net 14' | 'Net 30' | 'Net 60' | 'Prepaid';
  billingCurrency?: string;
  autoMonthlyBillingReport?: boolean;
  invoicePoRequired?: boolean;

  // Step 9: Verification
  isVerified: boolean;
  notes?: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  industry: string;
  activeStores: number;
  activeESLs: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  status: ClientStatus;
  licenseTier: 'Enterprise' | 'Professional' | 'Starter';
  currency: string;
  createdAt: string;
  lastActivity: string;
  wizardConfig?: ClientWizardState;
}

export type ESLStatus = 'Online' | 'Offline' | 'Syncing' | 'Low Battery';

export interface ESLTag {
  id: string;
  barcode: string;
  model: string;
  productSku: string;
  productName: string;
  productPrice: string;
  oldPrice?: string;
  status: ESLStatus;
  isPromo: boolean;
  lastUpdatedTime: string;
  batteryLevel?: number;
  signalStrength?: string;
  storeId?: string;
  storeName?: string;
}

export type SessionStatus = 'Completed' | 'Active' | 'Timed Out';

export interface UsageSession {
  id: string;
  sessionDate: string;
  clientName: string;
  username: string;
  userRole: string;
  ipAddress: string;
  device: string;
  durationMinutes: number;
  activityCount: number;
  status: SessionStatus;
  logDetails?: Array<{ time: string; action: string; module: string }>;
}

export type ImportStatus = 'Success' | 'Failed' | 'Processing' | 'Partial';

export interface ImportErrorDetail {
  row: number;
  field: string;
  message: string;
  sampleValue: string;
}

export interface ImportRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  clientName: string;
  uploadedBy: string;
  uploadedAt: string;
  recordCount: number;
  validCount: number;
  errorCount: number;
  status: ImportStatus;
  errors?: ImportErrorDetail[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'user' | 'client' | 'esl' | 'import' | 'security';
  title: string;
  description: string;
  user: string;
  storeName: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface DashboardMetrics {
  activeClients: number;
  totalUsers: number;
  activeSessions: number;
  totalESLs: number;
  activePromotions: number;
  syncRate: number;
  pendingImports: number;
  recentActivity: ActivityLog[];
}
