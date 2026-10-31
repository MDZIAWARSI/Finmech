import { Transaction, UserProfile, CashDenominationCount } from '@/types/finance';

// Helper to generate isolated storage keys scoped to the signed-in user
function getUserKey(type: 'txs' | 'profile' | 'denoms' | 'biz', userId?: string | null): string {
  if (userId) {
    return `finmech_u_${userId}_${type}_v4`;
  }
  return `finmech_guest_${type}_v4`;
}

// Fallback legacy keys for migration
const LEGACY_STORAGE_KEYS = {
  TRANSACTIONS: 'finmech_transactions_v3',
  PROFILE: 'finmech_profile_v3',
  CASH_DENOMINATIONS: 'finmech_cash_denominations_v3',
  LIVE_BUSINESS_BALANCE: 'finmech_live_business_balance_v3',
};

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

export function getStoredTransactions(userId?: string | null): Transaction[] {
  if (typeof window === 'undefined') return DEFAULT_TRANSACTIONS;
  const key = getUserKey('txs', userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Check legacy fallback for seamless migration
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEYS.TRANSACTIONS);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        saveTransactions(parsed, userId);
        return parsed;
      }
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[], userId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = getUserKey('txs', userId);
  try {
    localStorage.setItem(key, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
}

export function getStoredProfile(userId?: string | null): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  const key = getUserKey('profile', userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEYS.PROFILE);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        saveProfile(parsed, userId);
        return parsed;
      }
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile, userId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = getUserKey('profile', userId);
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
}

export function getStoredDenominations(userId?: string | null): CashDenominationCount {
  if (typeof window === 'undefined') return DEFAULT_DENOMINATIONS;
  const key = getUserKey('denoms', userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEYS.CASH_DENOMINATIONS);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        saveDenominations(parsed, userId);
        return parsed;
      }
      return DEFAULT_DENOMINATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DENOMINATIONS;
  }
}

export function saveDenominations(counts: CashDenominationCount, userId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = getUserKey('denoms', userId);
  try {
    localStorage.setItem(key, JSON.stringify(counts));
  } catch (err) {
    console.error('Failed to save denominations to localStorage', err);
  }
}

export function getStoredLiveBusinessBalance(userId?: string | null): number {
  if (typeof window === 'undefined') return 0;
  const key = getUserKey('biz', userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEYS.LIVE_BUSINESS_BALANCE);
      if (legacyRaw) {
        const num = parseFloat(legacyRaw);
        const val = isNaN(num) ? 0 : num;
        saveLiveBusinessBalance(val, userId);
        return val;
      }
      return 0;
    }
    const num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

export function saveLiveBusinessBalance(balance: number, userId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = getUserKey('biz', userId);
  try {
    localStorage.setItem(key, balance.toString());
  } catch (err) {
    console.error('Failed to save business balance to localStorage', err);
  }
}

// Clear specific user's local data
export function clearUserData(userId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getUserKey('txs', userId));
    localStorage.removeItem(getUserKey('profile', userId));
    localStorage.removeItem(getUserKey('denoms', userId));
    localStorage.removeItem(getUserKey('biz', userId));
  } catch (err) {
    console.warn('Failed to clear user data:', err);
  }
}

// Completely clear all Finmech local data
export function clearAllLocalFinmechData() {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('finmech_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Failed to clear all Finmech local data:', err);
  }
}

export function exportFinancialDataJson(
  transactions: Transaction[], 
  profile: UserProfile,
  denominations?: CashDenominationCount,
  businessBalance?: number
): string {
  const payload = {
    app: 'finmech',
    version: '2.0',
    exportDate: new Date().toISOString(),
    profile,
    denominations: denominations || DEFAULT_DENOMINATIONS,
    businessBalance: businessBalance || 0,
    transactions,
  };
  return JSON.stringify(payload, null, 2);
}
