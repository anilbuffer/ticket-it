import { ESLTag } from '../types';
import { INITIAL_ESL_TAGS } from '../mock/initialData';

const ESL_STORAGE_KEY = 'ticketit_esl_tags';

export const ESLService = {
  getTags: (): ESLTag[] => {
    if (typeof window === 'undefined') return INITIAL_ESL_TAGS;
    try {
      const stored = localStorage.getItem(ESL_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(ESL_STORAGE_KEY, JSON.stringify(INITIAL_ESL_TAGS));
        return INITIAL_ESL_TAGS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ESL_TAGS;
    }
  },

  createTag: (newTag: Omit<ESLTag, 'id' | 'lastUpdatedTime'>): ESLTag => {
    const tags = ESLService.getTags();
    const created: ESLTag = {
      ...newTag,
      id: `esl-${Date.now().toString().slice(-4)}`,
      lastUpdatedTime: new Date().toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
    const updated = [created, ...tags];
    if (typeof window !== 'undefined') {
      localStorage.setItem(ESL_STORAGE_KEY, JSON.stringify(updated));
    }
    return created;
  },

  updateTag: (id: string, updates: Partial<ESLTag>): ESLTag | null => {
    const tags = ESLService.getTags();
    const index = tags.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...tags[index],
      ...updates,
      lastUpdatedTime: new Date().toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
    tags[index] = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ESL_STORAGE_KEY, JSON.stringify(tags));
    }
    return updated;
  },

  deleteTag: (id: string): boolean => {
    const tags = ESLService.getTags();
    const filtered = tags.filter((t) => t.id !== id);
    if (filtered.length === tags.length) return false;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ESL_STORAGE_KEY, JSON.stringify(filtered));
    }
    return true;
  },

  forceUpdateAll: (): ESLTag[] => {
    const tags = ESLService.getTags();
    const now = new Date().toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const updated = tags.map((t) => ({
      ...t,
      status: 'Online' as const,
      lastUpdatedTime: now,
    }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(ESL_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  resetDefaults: (): ESLTag[] => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ESL_STORAGE_KEY, JSON.stringify(INITIAL_ESL_TAGS));
    }
    return INITIAL_ESL_TAGS;
  },
};
