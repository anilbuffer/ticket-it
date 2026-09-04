import { User } from '../types';
import { INITIAL_USERS } from '../mock/initialData';

const AUTH_USER_KEY = 'ticketit_current_user';
const SELECTED_STORE_KEY = 'ticketit_selected_store';

export interface CurrentUserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  group: string;
  storeName: string;
  branchInfo: string;
  phone: string;
  department: string;
  region: string;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
}

const DEFAULT_PROFILE: CurrentUserProfile = {
  id: 'usr-001',
  username: 'admin.ho',
  name: 'Alexander Cross',
  email: 'admin.ho@ticketit.com',
  role: 'Super Admin',
  group: 'Head Office',
  storeName: 'StandardStoreSetup',
  branchInfo: 'HeadOffice',
  phone: '+61 2 9000 1100',
  department: 'Operations & Enterprise Pricing',
  region: 'National HQ',
  twoFactorEnabled: true,
  emailNotifications: true,
};

export const AuthService = {
  getCurrentUser: (): CurrentUserProfile => {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (!stored) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_PROFILE));
        return DEFAULT_PROFILE;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  updateCurrentUser: (updates: Partial<CurrentUserProfile>): CurrentUserProfile => {
    const current = AuthService.getCurrentUser();
    const updated = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  loginAs: (user: User): CurrentUserProfile => {
    const profile: CurrentUserProfile = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      group: user.group,
      storeName: user.storeName.includes('Setup') ? user.storeName : `${user.storeName}`,
      branchInfo: user.group === 'Head Office' ? 'HeadOffice' : user.region,
      phone: user.phone || '+61 2 9000 0000',
      department: user.department || user.storeCategory,
      region: user.region,
      twoFactorEnabled: true,
      emailNotifications: true,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    }
    return profile;
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  },

  getAvailableDemoAccounts: (): User[] => {
    return INITIAL_USERS;
  },
};
