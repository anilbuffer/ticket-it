import { UsageSession } from '../types';
import { INITIAL_USAGE_SESSIONS } from '../mock/initialData';

const USAGE_STORAGE_KEY = 'ticketit_usage_sessions';

export interface UsageFilterParams {
  clientId?: string;
  clientName?: string;
  username?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export const UsageService = {
  getSessions: (): UsageSession[] => {
    if (typeof window === 'undefined') return INITIAL_USAGE_SESSIONS;
    try {
      const stored = localStorage.getItem(USAGE_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(INITIAL_USAGE_SESSIONS));
        return INITIAL_USAGE_SESSIONS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_USAGE_SESSIONS;
    }
  },

  querySessions: (filters: UsageFilterParams): UsageSession[] => {
    const sessions = UsageService.getSessions();
    return sessions.filter((session) => {
      if (filters.clientName && filters.clientName !== 'All Clients' && session.clientName !== filters.clientName) {
        return false;
      }
      if (filters.username && filters.username !== 'All Users' && session.username !== filters.username) {
        return false;
      }
      if (filters.status && filters.status !== 'All Statuses' && session.status !== filters.status) {
        return false;
      }
      if (filters.fromDate) {
        const sessionDate = new Date(session.sessionDate);
        const from = new Date(filters.fromDate);
        if (sessionDate < from) return false;
      }
      if (filters.toDate) {
        const sessionDate = new Date(session.sessionDate);
        const to = new Date(filters.toDate);
        to.setHours(23, 59, 59);
        if (sessionDate > to) return false;
      }
      return true;
    });
  },

  recordSession: (newSession: Omit<UsageSession, 'id'>): UsageSession => {
    const sessions = UsageService.getSessions();
    const created: UsageSession = {
      ...newSession,
      id: `ses-${Date.now().toString().slice(-5)}`,
    };
    const updated = [created, ...sessions];
    if (typeof window !== 'undefined') {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
    }
    return created;
  },

  resetDefaults: (): UsageSession[] => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(INITIAL_USAGE_SESSIONS));
    }
    return INITIAL_USAGE_SESSIONS;
  },
};
