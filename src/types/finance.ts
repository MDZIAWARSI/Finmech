export type TransactionType = 'expense' | 'income' | 'transfer';
export type PocketType = 'cash' | 'bank' | 'business';

export interface Transaction {
  id: string;
  type: TransactionType;
  pocket: PocketType;
  toPocket?: PocketType; // For transfers (e.g., Bank -> Cash ATM withdrawal, or Business -> Personal Bank)
  category: string;
  amount: number;
  date: string; // ISO string
  note: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  currency: string;
  monthlySavingsTarget: number;
  monthlyBudget: number;
  photoURL?: string;
}

export interface SavingsGoal {
  targetAmount: number;
  currentSaved: number;
  percentage: number;
  remaining: number;
  status: 'on_track' | 'needs_attention' | 'achieved';
}

export interface FinancialSummary {
  totalNetWorth: number;
  cashInHand: number;
  bankBalance: number;
  businessBalance: number; // Live count of the business money
  monthlyExpenditure: number;
  monthlyIncome: number;
  dailyAverageSpend: number;
  savingsGoal: SavingsGoal;
  businessMetrics: {
    totalInflow: number;
    totalOutflow: number;
    netCapital: number;
    transferredToPersonal: number;
    seededFromPersonal: number;
  };
  categoryBreakdown: { category: string; amount: number; percentage: number; count: number }[];
  pocketDistribution: { pocket: PocketType; amount: number; percentage: number }[];
  leaks: { category: string; amount: number; ratioOfExpenses: number; concern: string }[];
}

export interface AiReport {
  executiveDiagnosis: string;
  targetAdvice: string;
  techniquesToSave: {
    id: string;
    title: string;
    category: string;
    monthlySaving: number;
    actionableStep: string;
  }[];
}

export interface CashDenominationCount {
  500: number;
  200: number;
  100: number;
  50: number;
  20: number;
  10: number;
  coins: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

