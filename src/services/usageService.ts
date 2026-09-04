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
      if (
        filters.clientName &&
        filters.clientName !== 'ALL' &&
        filters.clientName !== 'All Clients' &&
        session.clientName.toLowerCase() !== filters.clientName.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.username &&
        filters.username !== 'ALL' &&
        filters.username !== 'All Users' &&
        session.username !== filters.username
      ) {
        return false;
      }
      if (
        filters.status &&
        filters.status !== 'ALL' &&
        filters.status !== 'All Statuses' &&
        session.status !== filters.status
      ) {
        return false;
      }
      if (filters.fromDate) {
        try {
          const sessionDate = new Date(session.sessionDate);
          let from: Date;
          if (filters.fromDate.includes('/')) {
            const parts = filters.fromDate.split('/');
            // DD/MM/YY or DD/MM/YYYY
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
            from = new Date(year, month, day);
          } else {
            from = new Date(filters.fromDate);
          }
          if (!isNaN(from.getTime()) && sessionDate < from) return false;
        } catch {
          // ignore date parse error
        }
      }
      if (filters.toDate) {
        try {
          const sessionDate = new Date(session.sessionDate);
          let to: Date;
          if (filters.toDate.includes('/')) {
            const parts = filters.toDate.split('/');
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
            to = new Date(year, month, day, 23, 59, 59);
          } else {
            to = new Date(filters.toDate);
            to.setHours(23, 59, 59);
          }
          if (!isNaN(to.getTime()) && sessionDate > to) return false;
        } catch {
          // ignore date parse error
        }
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
