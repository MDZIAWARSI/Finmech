import { Transaction, UserProfile, CashDenominationCount } from '@/types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finmech_transactions_v3',
  PROFILE: 'finmech_profile_v3',
  CASH_DENOMINATIONS: 'finmech_cash_denominations_v3',
  LIVE_BUSINESS_BALANCE: 'finmech_live_business_balance_v3',
};

// Clean one-time reset for freshly starting at 0
function ensureFreshStart() {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem('finmech_fresh_v3')) {
      localStorage.removeItem('finmech_transactions_v2');
      localStorage.removeItem('finmech_profile_v2');
      localStorage.removeItem('finmech_cash_denominations_v2');
      localStorage.removeItem('finmech_live_business_balance_v2');
      localStorage.removeItem('finmech_local_user');
      localStorage.removeItem('finmech_firebase_config');
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.CASH_DENOMINATIONS);
      localStorage.removeItem(STORAGE_KEYS.LIVE_BUSINESS_BALANCE);
      localStorage.setItem('finmech_fresh_v3', 'true');
    }
  } catch {}
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user_default',
  name: '',
  currency: '₹',
  monthlySavingsTarget: 0,
  monthlyBudget: 0,
};

export const DEFAULT_DENOMINATIONS: CashDenominationCount = {
  500: 0,
  200: 0,
  100: 0,
  50: 0,
  20: 0,
  10: 0,
  coins: 0,
};

export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') return DEFAULT_TRANSACTIONS;
  ensureFreshStart();
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
  ensureFreshStart();
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
  ensureFreshStart();
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
  if (typeof window === 'undefined') return 0;
  ensureFreshStart();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIVE_BUSINESS_BALANCE);
    if (!raw) return 0;
    const num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
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

