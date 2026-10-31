import { Transaction, PocketType, FinancialSummary, SavingsGoal, CashDenominationCount } from '@/types/finance';

export const DENOMINATION_VALUES: Record<keyof CashDenominationCount, number> = {
  500: 500,
  200: 200,
  100: 100,
  50: 50,
  20: 20,
  10: 10,
  coins: 1,
};

export function calculateDenominationTotal(counts: CashDenominationCount): number {
  return (
    (counts[500] || 0) * 500 +
    (counts[200] || 0) * 200 +
    (counts[100] || 0) * 100 +
    (counts[50] || 0) * 50 +
    (counts[20] || 0) * 20 +
    (counts[10] || 0) * 10 +
    (counts.coins || 0)
  );
}

export function computeFinancialSummary(
  transactions: Transaction[],
  monthlySavingsTarget: number = 10000,
  manualCashAdjusted?: number,
  manualBusinessAdjusted?: number,
  referenceDate?: Date
): FinancialSummary {
  // Pocket Balances calculation
  let cashBalance = 0;
  let bankBalance = 0;
  let businessBalance = 0;

  // Monthly sums (current month)
  const now = referenceDate || new Date('2025-01-01T00:00:00Z');
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let monthlyExpenditure = 0;
  let monthlyIncome = 0;
  const categoryTotals: Record<string, { amount: number; count: number }> = {};

  // Business metrics
  let totalBusinessInflow = 0;
  let totalBusinessOutflow = 0;
  let transferredToPersonal = 0;
  let seededFromPersonal = 0;

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const isCurrentMonth = txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;

    if (tx.type === 'expense') {
      if (tx.pocket === 'cash') cashBalance -= tx.amount;
      else if (tx.pocket === 'bank') bankBalance -= tx.amount;
      else if (tx.pocket === 'business') {
        businessBalance -= tx.amount;
        totalBusinessOutflow += tx.amount;
      }

      if (isCurrentMonth) {
        monthlyExpenditure += tx.amount;
        if (!categoryTotals[tx.category]) {
          categoryTotals[tx.category] = { amount: 0, count: 0 };
        }
        categoryTotals[tx.category].amount += tx.amount;
        categoryTotals[tx.category].count += 1;
      }
    } else if (tx.type === 'income') {
      if (tx.pocket === 'cash') cashBalance += tx.amount;
      else if (tx.pocket === 'bank') bankBalance += tx.amount;
      else if (tx.pocket === 'business') {
        businessBalance += tx.amount;
        totalBusinessInflow += tx.amount;
      }

      if (isCurrentMonth) {
        monthlyIncome += tx.amount;
      }
    } else if (tx.type === 'transfer') {
      // Subtraction from source pocket
      if (tx.pocket === 'cash') cashBalance -= tx.amount;
      else if (tx.pocket === 'bank') bankBalance -= tx.amount;
      else if (tx.pocket === 'business') {
        businessBalance -= tx.amount;
        if (tx.toPocket === 'bank' || tx.toPocket === 'cash') {
          transferredToPersonal += tx.amount;
        }
      }

      // Addition to destination pocket
      if (tx.toPocket === 'cash') cashBalance += tx.amount;
      else if (tx.toPocket === 'bank') {
        bankBalance += tx.amount;
      } else if (tx.toPocket === 'business') {
        businessBalance += tx.amount;
        if (tx.pocket === 'bank' || tx.pocket === 'cash') {
          seededFromPersonal += tx.amount;
        }
      }
    }
  });

  // Allow manual override sync if user adjusted cash via denomination counter
  if (typeof manualCashAdjusted === 'number') {
    cashBalance = manualCashAdjusted;
  }
  if (typeof manualBusinessAdjusted === 'number') {
    businessBalance = manualBusinessAdjusted;
  }

  // Calculate Net Worth
  const totalNetWorth = cashBalance + bankBalance + businessBalance;

  // Day calculation for daily average spend
  const dayOfMonth = Math.max(1, now.getDate());
  const dailyAverageSpend = monthlyExpenditure / dayOfMonth;

  // Category breakdown
  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: monthlyExpenditure > 0 ? (data.amount / monthlyExpenditure) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Leak alerts (categories taking > 25% of expenditure or high impulse)
  const leaks = categoryBreakdown
    .filter((c) => c.percentage >= 20 && c.amount > 1500)
    .map((c) => ({
      category: c.category,
      amount: c.amount,
      ratioOfExpenses: c.percentage,
      concern: `${c.category} consumes ${c.percentage.toFixed(0)}% of your monthly expenditure. Trimming 15% recovers ₹${Math.round(c.amount * 0.15).toLocaleString()}.`,
    }));

  // Savings Goal calculation
  const currentSaved = Math.max(0, monthlyIncome - monthlyExpenditure);
  const percentage = monthlySavingsTarget > 0 ? Math.min(100, Math.round((currentSaved / monthlySavingsTarget) * 100)) : 0;
  const remaining = Math.max(0, monthlySavingsTarget - currentSaved);
  let goalStatus: SavingsGoal['status'] = 'on_track';
  if (percentage >= 100) {
    goalStatus = 'achieved';
  } else if (percentage < (dayOfMonth / 30) * 80) {
    goalStatus = 'needs_attention';
  }

  const savingsGoal: SavingsGoal = {
    targetAmount: monthlySavingsTarget,
    currentSaved,
    percentage,
    remaining,
    status: goalStatus,
  };

  // Pocket Distribution
  const totalPositiveAssets = Math.max(1, (cashBalance > 0 ? cashBalance : 0) + (bankBalance > 0 ? bankBalance : 0) + (businessBalance > 0 ? businessBalance : 0));
  const pocketDistribution = [
    { pocket: 'cash' as PocketType, amount: cashBalance, percentage: Math.max(0, (cashBalance / totalPositiveAssets) * 100) },
    { pocket: 'bank' as PocketType, amount: bankBalance, percentage: Math.max(0, (bankBalance / totalPositiveAssets) * 100) },
    { pocket: 'business' as PocketType, amount: businessBalance, percentage: Math.max(0, (businessBalance / totalPositiveAssets) * 100) },
  ];

  return {
    totalNetWorth,
    cashInHand: cashBalance,
    bankBalance,
    businessBalance,
    monthlyExpenditure,
    monthlyIncome,
    dailyAverageSpend,
    savingsGoal,
    businessMetrics: {
      totalInflow: totalBusinessInflow,
      totalOutflow: totalBusinessOutflow,
      netCapital: businessBalance,
      transferredToPersonal,
      seededFromPersonal,
    },
    categoryBreakdown,
    pocketDistribution,
    leaks,
  };
}

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  return `${isNegative ? '-' : ''}${currency}${abs.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}
