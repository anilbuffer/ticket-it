import { Client } from '../types';
import { INITIAL_CLIENTS } from '../mock/initialData';

const CLIENTS_STORAGE_KEY = 'ticketit_clients_data';

export const ClientService = {
  getClients: (): Client[] => {
    if (typeof window === 'undefined') return INITIAL_CLIENTS;
    try {
      const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
        return INITIAL_CLIENTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  getClientById: (id: string): Client | undefined => {
    const clients = ClientService.getClients();
    return clients.find((c) => c.id === id);
  },

  createClient: (newClient: Omit<Client, 'id' | 'createdAt' | 'lastActivity'>): Client => {
    const clients = ClientService.getClients();
    const created: Client = {
      ...newClient,
      id: `cli-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    const updated = [created, ...clients];
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updated));
    }
    return created;
  },

  updateClient: (id: string, updates: Partial<Client>): Client | null => {
    const clients = ClientService.getClients();
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedClient = {
      ...clients[index],
      ...updates,
      lastActivity: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    clients[index] = updatedClient;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    }
    return updatedClient;
  },

  deleteClient: (id: string): boolean => {
    const clients = ClientService.getClients();
    const filtered = clients.filter((c) => c.id !== id);
    if (filtered.length === clients.length) return false;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(filtered));
    }
    return true;
  },

  resetDefaults: (): Client[] => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
    }
    return INITIAL_CLIENTS;
  },
};
