import { Client, ClientWizardState } from '../types';
import { INITIAL_CLIENTS } from '../mock/initialData';
import { SAMPLE_SUPERVALU_WIZARD_STATE, INITIAL_EMPTY_WIZARD_STATE, PRESET_SAMPLE_PRODUCTS } from '../mock/wizardMockData';

const CLIENTS_STORAGE_KEY = 'ticketit_clients_data';

export const ClientService = {
  getClients: (): Client[] => {
    if (typeof window === 'undefined') return INITIAL_CLIENTS;
    try {
      const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (!stored) {
        // Seed initial clients with wizard configs
        const seeded = INITIAL_CLIENTS.map((c) => {
          if (c.code === 'SUP-NZ') {
            return { ...c, wizardConfig: SAMPLE_SUPERVALU_WIZARD_STATE };
          }
          return {
            ...c,
            wizardConfig: {
              ...INITIAL_EMPTY_WIZARD_STATE,
              clientName: c.name,
              clientCode: c.code,
              industry: c.industry,
              contactName: c.contactName,
              contactEmail: c.contactEmail,
              contactPhone: c.contactPhone,
              region: c.region,
              licenseTier: c.licenseTier,
              defaultCurrency: c.currency,
              dataFileName: `${c.code.toLowerCase()}_catalog_feed.xlsx`,
              dataRecordCount: c.activeStores * 120,
              dataSampleRows: PRESET_SAMPLE_PRODUCTS.slice(0, 4),
              ticketTemplateFileName: `${c.code.toLowerCase()}_shelf_talker.tkt`,
              isVerified: true,
            },
          };
        });
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed: Client[] = JSON.parse(stored);
      // Check if any INITIAL_CLIENTS are missing from stored
      const existingCodes = new Set(parsed.map((p) => p.code));
      const missing = INITIAL_CLIENTS.filter((c) => !existingCodes.has(c.code));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  getClientById: (id: string): Client | undefined => {
    const clients = ClientService.getClients();
    return clients.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());
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

  createClientFromWizard: (wizard: ClientWizardState): Client => {
    const totalStores = wizard.regions.reduce((acc, r) => acc + (r.branches?.length || 1), 0) || 1;
    const totalESLs = wizard.regions.reduce((acc, r) => {
      return acc + (r.branches?.reduce((bAcc, b) => bAcc + (b.activeESLs || 0), 0) || 0);
    }, 0) || 5000;

    const newClient: Omit<Client, 'id' | 'createdAt' | 'lastActivity'> = {
      code: wizard.clientCode.toUpperCase() || `CLI-${Date.now().toString().slice(-3)}`,
      name: wizard.clientName || 'Unnamed Enterprise Client',
      industry: wizard.industry || 'Supermarket & Grocery',
      activeStores: totalStores,
      activeESLs: totalESLs,
      contactName: wizard.contactName || 'Corporate Admin',
      contactEmail: wizard.contactEmail || 'admin@ticketit.io',
      contactPhone: wizard.contactPhone || '+64 9 000 0000',
      region: wizard.regions[0]?.name || wizard.country || 'Global Territory',
      status: 'Active',
      licenseTier: wizard.licenseTier || 'Enterprise',
      currency: wizard.defaultCurrency || 'NZD',
      wizardConfig: wizard,
    };

    return ClientService.createClient(newClient);
  },

  updateClientWizard: (id: string, wizardState: ClientWizardState): Client | null => {
    const client = ClientService.getClientById(id);
    if (!client) return null;

    return ClientService.updateClient(client.id, {
      name: wizardState.clientName || client.name,
      code: wizardState.clientCode || client.code,
      industry: wizardState.industry || client.industry,
      contactName: wizardState.contactName || client.contactName,
      contactEmail: wizardState.contactEmail || client.contactEmail,
      contactPhone: wizardState.contactPhone || client.contactPhone,
      currency: wizardState.defaultCurrency || client.currency,
      licenseTier: wizardState.licenseTier || client.licenseTier,
      wizardConfig: wizardState,
    });
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
      localStorage.removeItem(CLIENTS_STORAGE_KEY);
    }
    return ClientService.getClients();
  },
};
