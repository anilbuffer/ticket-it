import { ImportRecord, ImportErrorDetail } from '../types';
import { INITIAL_IMPORT_HISTORY } from '../mock/initialData';

const IMPORT_STORAGE_KEY = 'ticketit_import_history';

export const ImportService = {
  getHistory: (): ImportRecord[] => {
    if (typeof window === 'undefined') return INITIAL_IMPORT_HISTORY;
    try {
      const stored = localStorage.getItem(IMPORT_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(INITIAL_IMPORT_HISTORY));
        return INITIAL_IMPORT_HISTORY;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_IMPORT_HISTORY;
    }
  },

  addRecord: (record: Omit<ImportRecord, 'id' | 'uploadedAt'>): ImportRecord => {
    const history = ImportService.getHistory();
    const created: ImportRecord = {
      ...record,
      id: `imp-${Date.now().toString().slice(-4)}`,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    const updated = [created, ...history];
    if (typeof window !== 'undefined') {
      localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(updated));
    }
    return created;
  },

  generateMockValidation: (fileName: string, clientName: string, rowCount: number): {
    validCount: number;
    errorCount: number;
    errors: ImportErrorDetail[];
  } => {
    // Generate realistic validation outcome
    if (fileName.toLowerCase().endsWith('.xml') || fileName.includes('legacy')) {
      return {
        validCount: 0,
        errorCount: rowCount,
        errors: [
          { row: 1, field: 'RootSchema', message: 'Schema validation failed: Missing required namespace TicketIT.Core.v3', sampleValue: '<LegacyCatalog>' },
          { row: 4, field: 'CurrencyCode', message: 'Unsupported legacy currency format', sampleValue: 'NZD-OLD' },
        ],
      };
    }

    if (fileName.includes('error') || fileName.includes('draft')) {
      const errorCount = Math.min(12, Math.max(2, Math.floor(rowCount * 0.1)));
      return {
        validCount: rowCount - errorCount,
        errorCount,
        errors: [
          { row: 14, field: 'Barcode', message: 'EAN-13 Checksum failed or length invalid', sampleValue: '942100889211X' },
          { row: 28, field: 'RetailPrice', message: 'Retail price cannot be negative or blank', sampleValue: '-$0.50' },
          { row: 55, field: 'StoreCategory', message: 'Store Category "LiquorSpecial" does not match client contract tier', sampleValue: 'LiquorSpecial' },
          { row: 82, field: 'TaxGroup', message: 'Unrecognized Tax Group code', sampleValue: 'TAX_99' },
        ],
      };
    }

    return {
      validCount: rowCount,
      errorCount: 0,
      errors: [],
    };
  },

  resetDefaults: (): ImportRecord[] => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(INITIAL_IMPORT_HISTORY));
    }
    return INITIAL_IMPORT_HISTORY;
  },
};
