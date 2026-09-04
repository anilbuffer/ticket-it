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
