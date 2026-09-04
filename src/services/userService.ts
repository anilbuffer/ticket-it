import { User, UserGroup } from '../types';
import { INITIAL_USERS } from '../mock/initialData';

const USERS_STORAGE_KEY = 'ticketit_users_data';

export const UserService = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return INITIAL_USERS;
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_USERS;
    }
  },

  getUsersByGroup: (group: UserGroup): User[] => {
    const users = UserService.getUsers();
    return users.filter((u) => u.group === group);
  },

  createUser: (newUser: Omit<User, 'id' | 'lastLogin'>): User => {
    const users = UserService.getUsers();
    const created: User = {
      ...newUser,
      id: `usr-${Date.now().toString().slice(-4)}`,
      lastLogin: 'Never',
    };
    const updated = [created, ...users];
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    }
    return created;
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = UserService.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const updatedUser = {
      ...users[index],
      ...updates,
    };
    users[index] = updatedUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    return updatedUser;
  },

  toggleInvoicing: (id: string): User | null => {
    const users = UserService.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index].invoicing = !users[index].invoicing;
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    return users[index];
  },

  deleteUser: (id: string): boolean => {
    const users = UserService.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    }
    return true;
  },

  resetDefaults: (): User[] => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    }
    return INITIAL_USERS;
  },
};
