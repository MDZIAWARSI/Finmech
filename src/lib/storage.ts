import { Transaction, UserProfile, ApiKeyConfig, CashDenominationAudit } from '../types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finmech_transactions_v1',
  PROFILE: 'finmech_profile_v1',
  API_KEY: 'finmech_protected_apikey_v1',
  CASH_AUDITS: 'finmech_cash_audits_v1',
};

// Obfuscation helper so raw API keys don't sit in plain text in browser storage
function maskString(str: string): string {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return str;
  }
}

function unmaskString(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return encoded;
  }
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default',
  email: 'student.founder@college.edu',
  name: 'Alex Sharma',
  currency: '₹',
  monthlyBudget: 15000,
  cashEmergencyTarget: 3000,
  businessTargetRevenue: 25000,
  isLoggedIn: true,
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Business revenue & gig income
  {
    id: 'tx_b1',
    type: 'income',
    pocket: 'business',
    category: 'Client Project',
    amount: 14500,
    date: '2026-10-29T10:30:00.000Z',
    note: 'Website UI redesign milestone 1 (Campus Cafe)',
    businessDetails: { clientName: 'Campus Cafe', status: 'received' },
    createdAt: 1793269800000,
  },
  {
    id: 'tx_b2',
    type: 'expense',
    pocket: 'business',
    category: 'Software & Tools',
    amount: 1200,
    date: '2026-10-28T14:15:00.000Z',
    note: 'Domain + Cloud hosting subscription',
    businessDetails: { clientName: 'Vercel / Namecheap', status: 'received' },
    createdAt: 1793183400000,
  },
  {
    id: 'tx_b3',
    type: 'income',
    pocket: 'business',
    category: 'Tutoring',
    amount: 4000,
    date: '2026-10-26T17:00:00.000Z',
    note: 'Python & Web Dev tutoring session fees',
    businessDetails: { clientName: 'Junior Batch', status: 'received' },
    createdAt: 1793010000000,
  },
  // ATM withdrawal to cash
  {
    id: 'tx_c1',
    type: 'transfer',
    pocket: 'bank',
    toPocket: 'cash',
    category: 'ATM Withdrawal',
    amount: 3000,
    date: '2026-10-27T11:00:00.000Z',
    note: 'Campus ATM cash refill for pocket money',
    createdAt: 1793096400000,
  },
  // Cash in hand spends
  {
    id: 'tx_c2',
    type: 'expense',
    pocket: 'cash',
    category: 'Food & Dining',
    amount: 60,
    date: '2026-10-30T13:20:00.000Z',
    note: 'Chai and samosa at university canteen',
    createdAt: 1793356200000,
  },
  {
    id: 'tx_c3',
    type: 'expense',
    pocket: 'cash',
    category: 'Commute & Travel',
    amount: 120,
    date: '2026-10-30T18:45:00.000Z',
    note: 'Auto rickshaw to railway station',
    createdAt: 1793375400000,
  },
  {
    id: 'tx_c4',
    type: 'expense',
    pocket: 'cash',
    category: 'Education & Xerox',
    amount: 180,
    date: '2026-10-29T16:10:00.000Z',
    note: 'Exam notes photocopies and stationery',
    createdAt: 1793289000000,
  },
  // Bank / Digital UPI personal spends
  {
    id: 'tx_p1',
    type: 'expense',
    pocket: 'bank',
    category: 'Food & Dining',
    amount: 420,
    date: '2026-10-30T21:00:00.000Z',
    note: 'Late night pizza with study group (Zomato/UPI)',
    createdAt: 1793383800000,
  },
  {
    id: 'tx_p2',
    type: 'expense',
    pocket: 'bank',
    category: 'Subscriptions',
    amount: 499,
    date: '2026-10-25T09:30:00.000Z',
    note: 'Spotify Student + OTT plan',
    createdAt: 1792923600000,
  },
  {
    id: 'tx_p3',
    type: 'expense',
    pocket: 'bank',
    category: 'Shopping',
    amount: 1899,
    date: '2026-10-24T15:20:00.000Z',
    note: 'New wireless earbuds on sale',
    createdAt: 1792857900000,
  },
  // Bank initial stipend / allowance
  {
    id: 'tx_p4',
    type: 'income',
    pocket: 'bank',
    category: 'Monthly Allowance',
    amount: 8000,
    date: '2026-10-20T10:00:00.000Z',
    note: 'Parents monthly college allowance / stipend',
    createdAt: 1792490400000,
  },
];

export const StorageService = {
  // Transactions
  getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!stored) {
      this.saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const fullTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    const list = this.getTransactions();
    const updated = [fullTx, ...list];
    this.saveTransactions(updated);
    return fullTx;
  },

  deleteTransaction(id: string): Transaction[] {
    const list = this.getTransactions();
    const updated = list.filter((t) => t.id !== id);
    this.saveTransactions(updated);
    return updated;
  },

  // User Profile & Settings
  getProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!stored) {
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // Protected User API Key Management
  getApiKeyConfig(): ApiKeyConfig {
    if (typeof window === 'undefined') return { geminiApiKey: '', isValidated: false };
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (!stored) return { geminiApiKey: '', isValidated: false };
    try {
      const parsed = JSON.parse(stored);
      return {
        geminiApiKey: unmaskString(parsed.maskedKey || ''),
        isValidated: !!parsed.isValidated,
        lastChecked: parsed.lastChecked,
      };
    } catch {
      return { geminiApiKey: '', isValidated: false };
    }
  },

  saveApiKey(apiKey: string, isValidated = true) {
    if (typeof window === 'undefined') return;
    const payload = {
      maskedKey: maskString(apiKey.trim()),
      isValidated,
      lastChecked: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.API_KEY, JSON.stringify(payload));
  },

  clearApiKey() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  // Cash Audits
  getCashAudits(): CashDenominationAudit[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.CASH_AUDITS);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveCashAudit(audit: CashDenominationAudit) {
    if (typeof window === 'undefined') return;
    const list = this.getCashAudits();
    const updated = [audit, ...list];
    localStorage.setItem(STORAGE_KEYS.CASH_AUDITS, JSON.stringify(updated));
  },

  // Export & Import
  exportAllData(): string {
    const data = {
      profile: this.getProfile(),
      transactions: this.getTransactions(),
      cashAudits: this.getCashAudits(),
      exportedAt: new Date().toISOString(),
      appName: 'FINMECH',
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
      }
      if (data.profile) {
        this.saveProfile(data.profile);
      }
      if (Array.isArray(data.cashAudits)) {
        localStorage.setItem(STORAGE_KEYS.CASH_AUDITS, JSON.stringify(data.cashAudits));
      }
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  resetToDemo() {
    this.saveTransactions(INITIAL_TRANSACTIONS);
    this.saveProfile(DEFAULT_PROFILE);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CASH_AUDITS);
    }
  },
};
