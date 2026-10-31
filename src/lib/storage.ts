import { Transaction, UserProfile, CashDenominationCount } from '@/types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finmech_transactions_v2',
  PROFILE: 'finmech_profile_v2',
  CASH_DENOMINATIONS: 'finmech_cash_denominations_v2',
  LIVE_BUSINESS_BALANCE: 'finmech_live_business_balance_v2',
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user_zia',
  name: 'Zia',
  currency: '₹',
  monthlySavingsTarget: 15000,
  monthlyBudget: 35000,
  photoURL: '/avatar.jpg',
};

export const DEFAULT_DENOMINATIONS: CashDenominationCount = {
  500: 5,   // ₹2,500
  200: 4,   // ₹800
  100: 8,   // ₹800
  50: 4,    // ₹200
  20: 3,    // ₹60
  10: 4,    // ₹40
  coins: 20,// ₹20
  // Total default physical cash: ₹4,420
};

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_1',
    type: 'income',
    pocket: 'bank',
    category: 'Salary / Client Retainer',
    amount: 65000,
    date: new Date(Date.now() - 22 * 86400000).toISOString(),
    note: 'Monthly retainer payout',
    createdAt: Date.now() - 22 * 86400000,
  },
  {
    id: 'tx_seed_2',
    type: 'income',
    pocket: 'business',
    category: 'Project Milestone',
    amount: 42000,
    date: new Date(Date.now() - 15 * 86400000).toISOString(),
    note: 'Direct client project advance',
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'tx_seed_3',
    type: 'transfer',
    pocket: 'bank',
    toPocket: 'cash',
    category: 'ATM Withdrawal',
    amount: 5000,
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    note: 'ATM cash replenishment',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'tx_seed_4',
    type: 'expense',
    pocket: 'cash',
    category: 'Food & Dining',
    amount: 580,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: 'Café & team lunch',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'tx_seed_5',
    type: 'expense',
    pocket: 'business',
    category: 'Software & Tools',
    amount: 3200,
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    note: 'Cloud infra & Figma plan',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'tx_seed_6',
    type: 'expense',
    pocket: 'bank',
    category: 'Rent & Utilities',
    amount: 14000,
    date: new Date(Date.now() - 20 * 86400000).toISOString(),
    note: 'Monthly studio rent',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'tx_seed_7',
    type: 'expense',
    pocket: 'bank',
    category: 'Subscriptions',
    amount: 1199,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    note: 'Broadband & Streaming',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'tx_seed_8',
    type: 'transfer',
    pocket: 'business',
    toPocket: 'bank',
    category: 'Owner Draw',
    amount: 10000,
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    note: 'Transfer from business to personal savings',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'tx_seed_9',
    type: 'expense',
    pocket: 'bank',
    category: 'Equipment & Hardware',
    amount: 18500,
    date: new Date(Date.now() - 40 * 86400000).toISOString(),
    note: '4K monitor & ergonomics desk',
    createdAt: Date.now() - 40 * 86400000,
  },
  {
    id: 'tx_seed_10',
    type: 'expense',
    pocket: 'cash',
    category: 'Food & Dining',
    amount: 1450,
    date: new Date(Date.now() - 45 * 86400000).toISOString(),
    note: 'Weekend family banquet',
    createdAt: Date.now() - 45 * 86400000,
  },
];

export function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') return DEFAULT_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
}

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
}

export function getStoredDenominations(): CashDenominationCount {
  if (typeof window === 'undefined') return DEFAULT_DENOMINATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_DENOMINATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASH_DENOMINATIONS, JSON.stringify(DEFAULT_DENOMINATIONS));
      return DEFAULT_DENOMINATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DENOMINATIONS;
  }
}

export function saveDenominations(counts: CashDenominationCount) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CASH_DENOMINATIONS, JSON.stringify(counts));
  } catch (err) {
    console.error('Failed to save denominations to localStorage', err);
  }
}

export function getStoredLiveBusinessBalance(): number {
  if (typeof window === 'undefined') return 28800;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIVE_BUSINESS_BALANCE);
    if (!raw) return 28800;
    const num = parseFloat(raw);
    return isNaN(num) ? 28800 : num;
  } catch {
    return 28800;
  }
}

export function saveLiveBusinessBalance(balance: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LIVE_BUSINESS_BALANCE, balance.toString());
  } catch (err) {
    console.error('Failed to save business balance to localStorage', err);
  }
}

export function exportFinancialDataJson(transactions: Transaction[], profile: UserProfile): string {
  const payload = {
    app: 'finmech',
    version: '2.0',
    exportDate: new Date().toISOString(),
    profile,
    transactions,
  };
  return JSON.stringify(payload, null, 2);
}

