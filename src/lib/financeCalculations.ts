import { Transaction, PocketType } from '../types/finance';

export interface FinancialSummary {
  cashInHand: number;
  bankBalance: number;
  businessBalance: number;
  totalNetWorth: number;
  monthlyExpenditure: number;
  monthlyIncome: number;
  dailyAverageSpend: number;
  businessDivision: {
    totalInflow: number;
    totalOutflow: number;
    netCapital: number;
    drawnToPersonal: number;
    allocatedFromPersonal: number;
    divisionShare: number;
    personalShare: number;
  };
  businessMetrics: {
    grossRevenue: number;
    operatingExpenses: number;
    netProfit: number;
    profitMargin: number;
    pendingReceivables: number;
  };
  categoryBreakdown: { category: string; amount: number; percentage: number; count: number }[];
  pocketDistribution: { pocket: PocketType; amount: number; percentage: number }[];
  leaks: {
    category: string;
    amount: number;
    ratioOfExpenses: number;
    concern: string;
  }[];
}

export const EMPTY_SUMMARY: FinancialSummary = {
  cashInHand: 0,
  bankBalance: 0,
  businessBalance: 0,
  totalNetWorth: 0,
  monthlyExpenditure: 0,
  monthlyIncome: 0,
  dailyAverageSpend: 0,
  businessDivision: {
    totalInflow: 0,
    totalOutflow: 0,
    netCapital: 0,
    drawnToPersonal: 0,
    allocatedFromPersonal: 0,
    divisionShare: 0,
    personalShare: 100,
  },
  businessMetrics: {
    grossRevenue: 0,
    operatingExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    pendingReceivables: 0,
  },
  categoryBreakdown: [],
  pocketDistribution: [
    { pocket: 'cash', amount: 0, percentage: 33 },
    { pocket: 'bank', amount: 0, percentage: 33 },
    { pocket: 'business', amount: 0, percentage: 34 },
  ],
  leaks: [],
};

export function calculateFinancialSummary(
  transactions: Transaction[],
  monthlyBudget: number = 15000,
  referenceDate?: Date
): FinancialSummary {
  let cashInHand = 0;
  let bankBalance = 0;
  let businessBalance = 0;

  let totalExpenseThisMonth = 0;
  let totalIncomeThisMonth = 0;

  let businessGrossRevenue = 0;
  let businessOperatingExpenses = 0;
  let businessPendingReceivables = 0;
  let businessDrawnToPersonal = 0;
  let businessAllocatedFromPersonal = 0;

  const categoryExpenseMap: Record<string, { amount: number; count: number }> = {};

  const now =
    referenceDate ||
    (typeof window !== 'undefined' ? new Date() : new Date('2026-10-31T00:00:00.000Z'));
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const isThisMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;

    if (tx.type === 'expense') {
      if (tx.pocket === 'cash') cashInHand -= tx.amount;
      else if (tx.pocket === 'bank') bankBalance -= tx.amount;
      else if (tx.pocket === 'business') {
        businessBalance -= tx.amount;
        businessOperatingExpenses += tx.amount;
      }

      if (isThisMonth) {
        totalExpenseThisMonth += tx.amount;
        if (!categoryExpenseMap[tx.category]) {
          categoryExpenseMap[tx.category] = { amount: 0, count: 0 };
        }
        categoryExpenseMap[tx.category].amount += tx.amount;
        categoryExpenseMap[tx.category].count += 1;
      }
    } else if (tx.type === 'income') {
      if (tx.pocket === 'cash') cashInHand += tx.amount;
      else if (tx.pocket === 'bank') bankBalance += tx.amount;
      else if (tx.pocket === 'business') {
        businessBalance += tx.amount;
        businessGrossRevenue += tx.amount;
      }

      if (isThisMonth) {
        totalIncomeThisMonth += tx.amount;
      }
    } else if (tx.type === 'transfer') {
      // Outflow from origin pocket
      if (tx.pocket === 'cash') cashInHand -= tx.amount;
      else if (tx.pocket === 'bank') bankBalance -= tx.amount;
      else if (tx.pocket === 'business') {
        businessBalance -= tx.amount;
        if (tx.toPocket === 'bank' || tx.toPocket === 'cash') {
          businessDrawnToPersonal += tx.amount;
        }
      }

      // Inflow to destination pocket
      if (tx.toPocket === 'cash') cashInHand += tx.amount;
      else if (tx.toPocket === 'bank') bankBalance += tx.amount;
      else if (tx.toPocket === 'business') {
        businessBalance += tx.amount;
        if (tx.pocket === 'bank' || tx.pocket === 'cash') {
          businessAllocatedFromPersonal += tx.amount;
        }
      }
    }

    // Pending business receivables
    if (tx.pocket === 'business' && tx.businessDetails?.status === 'pending') {
      businessPendingReceivables += tx.amount;
    }
  });

  const totalNetWorth = cashInHand + bankBalance + businessBalance;

  // Day of month for daily average
  const dayOfMonth = Math.max(1, now.getDate());
  const dailyAverageSpend = Math.round(totalExpenseThisMonth / dayOfMonth);

  // Category breakdown sorted descending
  const categoryBreakdown = Object.entries(categoryExpenseMap)
    .map(([category, stats]) => ({
      category,
      amount: stats.amount,
      count: stats.count,
      percentage: totalExpenseThisMonth > 0 ? Math.round((stats.amount / totalExpenseThisMonth) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Pocket distribution
  const totalPositiveBalances = Math.max(1, Math.max(0, cashInHand) + Math.max(0, bankBalance) + Math.max(0, businessBalance));
  const pocketDistribution = [
    {
      pocket: 'cash' as PocketType,
      amount: cashInHand,
      percentage: Math.round((Math.max(0, cashInHand) / totalPositiveBalances) * 100),
    },
    {
      pocket: 'bank' as PocketType,
      amount: bankBalance,
      percentage: Math.round((Math.max(0, bankBalance) / totalPositiveBalances) * 100),
    },
    {
      pocket: 'business' as PocketType,
      amount: businessBalance,
      percentage: Math.round((Math.max(0, businessBalance) / totalPositiveBalances) * 100),
    },
  ];

  // Detect spending leaks
  const leaks: FinancialSummary['leaks'] = [];
  categoryBreakdown.forEach((cat) => {
    if (cat.percentage >= 30) {
      leaks.push({
        category: cat.category,
        amount: cat.amount,
        ratioOfExpenses: cat.percentage,
        concern: `Consumes ${cat.percentage}% of your monthly expenses. Potential high leak area.`,
      });
    }
  });

  const netProfit = businessGrossRevenue - businessOperatingExpenses;
  const profitMargin =
    businessGrossRevenue > 0 ? Math.round((netProfit / businessGrossRevenue) * 100) : 0;

  const divisionShare =
    totalPositiveBalances > 0
      ? Math.round((Math.max(0, businessBalance) / totalPositiveBalances) * 100)
      : 0;
  const personalShare = Math.max(0, 100 - divisionShare);

  return {
    cashInHand,
    bankBalance,
    businessBalance,
    totalNetWorth,
    monthlyExpenditure: totalExpenseThisMonth,
    monthlyIncome: totalIncomeThisMonth,
    dailyAverageSpend,
    businessDivision: {
      totalInflow: businessGrossRevenue,
      totalOutflow: businessOperatingExpenses,
      netCapital: businessBalance,
      drawnToPersonal: businessDrawnToPersonal,
      allocatedFromPersonal: businessAllocatedFromPersonal,
      divisionShare,
      personalShare,
    },
    businessMetrics: {
      grossRevenue: businessGrossRevenue,
      operatingExpenses: businessOperatingExpenses,
      netProfit,
      profitMargin,
      pendingReceivables: businessPendingReceivables,
    },
    categoryBreakdown,
    pocketDistribution,
    leaks,
  };
}
