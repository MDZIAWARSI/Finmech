export type TransactionType = 'expense' | 'income' | 'transfer';
export type PocketType = 'cash' | 'bank' | 'business';

export interface BusinessMetadata {
  clientName?: string;
  invoiceNumber?: string;
  status?: 'received' | 'pending' | 'overdue';
  isTaxDeductible?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  pocket: PocketType;
  toPocket?: PocketType; // For transfers between pockets (e.g., Bank -> Cash ATM withdrawal)
  category: string;
  amount: number;
  date: string; // ISO date string
  note: string;
  tags?: string[];
  businessDetails?: BusinessMetadata;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  currency: string;
  monthlyBudget: number;
  cashEmergencyTarget: number;
  businessTargetRevenue: number;
  isLoggedIn: boolean;
}

export interface ApiKeyConfig {
  geminiApiKey: string;
  isValidated: boolean;
  lastChecked?: string;
}

export interface AiSavingSuggestion {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'tip';
  title: string;
  description: string;
  potentialMonthlySavings: number;
  actionableStep: string;
}

export interface CashDenominationAudit {
  id: string;
  date: string;
  denominations: Record<number, number>; // 500: count, 200: count, 100: count, 50: count, etc.
  countedTotal: number;
  systemBalance: number;
  variance: number; // countedTotal - systemBalance
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

