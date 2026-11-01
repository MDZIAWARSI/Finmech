'use client';

import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  TrendingUp, 
  Wallet, 
  Briefcase, 
  Target, 
  Flame,
  Utensils,
  Laptop,
  Home as HomeIcon,
  ShoppingBag,
  ArrowUpRight,
  ReceiptText,
  Edit3,
  Trash2,
  Landmark
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';
import { NavTab } from './Navbar';
import { SpendingPieChart, SpendingTrendGraph } from './Charts';
import { CalendarSpendView } from './CalendarSpendView';

interface DashboardOverviewProps {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  currency?: string;
  onNavigateTab: (tab: NavTab) => void;
  onOpenQuickEntry: () => void;
  onOpenTargetModal: () => void;
  onDeleteTransaction?: (id: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export function DashboardOverview({
  summary,
  recentTransactions,
  currency = '₹',
  onNavigateTab,
  onOpenTargetModal,
  onDeleteTransaction,
  onEditTransaction,
}: DashboardOverviewProps) {
  const [hideBalances, setHideBalances] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'distribution' | 'trend' | 'calendar'>('distribution');
  const [movementFilter, setMovementFilter] = useState<'all' | 'bank' | 'cash' | 'business'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showAllMovements, setShowAllMovements] = useState(false);

  const filteredMovements = useMemo(() => {
    return recentTransactions.filter((tx) => {
      const matchesPocket =
        movementFilter === 'all' || tx.pocket === movementFilter || tx.toPocket === movementFilter;
      const matchesDate = !dateFilter || tx.date.startsWith(dateFilter);
      return matchesPocket && matchesDate;
    });
  }, [recentTransactions, movementFilter, dateFilter]);

  const displayedMovements = showAllMovements ? filteredMovements : filteredMovements.slice(0, 6);

  const formatAmount = (val: number) => {
    if (hideBalances) return '••••••';
    return `${currency}${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatTxDate = (dateStr: string) => {
    const txDate = new Date(dateStr);
    const now = new Date();
    const isToday =
      txDate.getFullYear() === now.getFullYear() &&
      txDate.getMonth() === now.getMonth() &&
      txDate.getDate() === now.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      txDate.getFullYear() === yesterday.getFullYear() &&
      txDate.getMonth() === yesterday.getMonth() &&
      txDate.getDate() === yesterday.getDate();

    if (isToday) {
      return `Today, ${txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    if (isYesterday) {
      return `Yesterday, ${txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return txDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('food') || c.includes('dine') || c.includes('coffee') || c.includes('lunch')) {
      return <Utensils className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />;
    }
    if (c.includes('soft') || c.includes('tool') || c.includes('tech') || c.includes('figma')) {
      return <Laptop className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />;
    }
    if (c.includes('rent') || c.includes('util') || c.includes('house')) {
      return <HomeIcon className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />;
    }
    if (c.includes('shop') || c.includes('cloth') || c.includes('gadget')) {
      return <ShoppingBag className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />;
  };

  // Real 7-day trend points computed from actual personal expense transactions
  const trendData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result: { day: string; amount: number; fullDate: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      result.push({ day: dayName, amount: 0, fullDate: dateString });
    }

    recentTransactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.pocket !== 'business') {
        const isAdj =
          tx.category === 'Cash Audit Reconciliation' ||
          tx.category === 'Business Capital Adjustment' ||
          tx.category === 'Starting Balance' ||
          tx.category === 'Initial Balance' ||
          tx.category === 'Starting Balance / Deposit';
        if (isAdj) return;

        const d = new Date(tx.date);
        const txDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const match = result.find((r) => r.fullDate === txDateString);
        if (match) {
          match.amount += tx.amount;
        }
      }
    });

    return result.map((r) => ({ day: r.day, amount: r.amount }));
  }, [recentTransactions]);

  // Category breakdown for pie chart
  const pieSlices = summary.categoryBreakdown.map((c) => ({
    label: c.category,
    amount: c.amount,
    percentage: c.percentage,
  }));

  // Sparkline data points for the mini-chart inside Spent tile (Reference Image 7)
  const miniSparklinePoints = useMemo(() => {
    const amounts = trendData.map((d) => d.amount);
    const hasValues = amounts.some((a) => a > 0);
    return hasValues ? amounts : [0, 0, 0, 0, 0, 0, 0];
  }, [trendData]);
  const sparkWidth = 100;
  const sparkHeight = 28;
  const maxSpark = Math.max(...miniSparklinePoints);
  const maxVal = maxSpark > 0 ? maxSpark : 1;
  const sparkPath = miniSparklinePoints.reduce((acc, val, i) => {
    const x = (i / (miniSparklinePoints.length - 1)) * sparkWidth;
    const y = maxSpark > 0 ? sparkHeight - (val / maxVal) * (sparkHeight - 4) : sparkHeight / 2;
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="space-y-4 pb-32 pt-2">
      {/* =========================================================================
          HERO BALANCE: Open, High-Whitespace & Elegant (No awkward button rows)
          ========================================================================= */}
      <section aria-label="Total Net Worth" className="pt-2 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Personal Net Balance
            </span>
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded"
              aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
            >
              {hideBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50">
            <span>Cash + Bank</span>
          </div>
        </div>

        {/* Large Stark Typographic Display */}
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums display-amount">
          {formatAmount(summary.personalNetWorth)}
        </div>

        <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-2 mt-2">
          <span>Personal Liquid Savings • Business kept isolated</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Sync</span>
        </div>
      </section>

      {/* =========================================================================
          2x2 BENTO GRID FOR MOBILES: Inspired directly by Reference Image 7 & Image 2
          2 columns on all devices (mobile first) with rich metrics & micro-sparklines
          ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-1">
        {/* Bento Tile 1: Spent This Month + Mini Sparkline Chart */}
        <div
          onClick={() => onNavigateTab('spends')}
          className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 active:scale-[0.97] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 sm:gap-1.5 truncate">
                <ReceiptText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Spent</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.monthlyExpenditure)}
            </div>

            {/* Mini Sparkline Graph inside the tile (Reference Image 7) */}
            <div className="mt-2 w-full h-[22px] sm:h-[28px] opacity-80 group-hover:opacity-100 transition-opacity">
              <svg viewBox={`0 0 ${sparkWidth} ${sparkHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path
                  d={sparkPath}
                  fill="none"
                  className="stroke-neutral-900 dark:stroke-white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={sparkWidth}
                  cy={sparkHeight - (miniSparklinePoints[miniSparklinePoints.length - 1] / maxSpark) * (sparkHeight - 4)}
                  r="3"
                  className="fill-emerald-500"
                />
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[10px] sm:text-xs text-neutral-400">
            <span className="truncate">Burn: <strong className="text-neutral-700 dark:text-neutral-300">{formatAmount(Math.round(summary.dailyAverageSpend))}/d</strong></span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:inline group-hover:underline">
              Spends →
            </span>
          </div>
        </div>

        {/* Bento Tile 2: Savings Goal Target + Progress Bar */}
        <div
          onClick={onOpenTargetModal}
          className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 active:scale-[0.97] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 sm:gap-1.5 truncate">
                <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Personal Savings</span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                {summary.savingsGoal.percentage}%
              </span>
            </div>

            <div className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.savingsGoal.currentSaved)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
              Cash in Hand + Bank
            </div>

            <div className="mt-2.5 space-y-1.5">
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, summary.savingsGoal.percentage)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[10px] sm:text-xs text-neutral-400">
            <span className="truncate">Goal: {formatAmount(summary.savingsGoal.targetAmount)}</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:inline group-hover:underline">
              Target →
            </span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          THE 3 LIQUID POCKETS: Bank Account, Cash in Hand, Live Business
          ========================================================================= */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
        {/* Pocket 1: Bank Balance */}
        <div
          onClick={() => {
            setMovementFilter('bank');
            const el = document.getElementById('recent-movements-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 active:scale-[0.97] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 truncate">
                <Landmark className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">Bank</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="text-base sm:text-2xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.bankBalance)}
            </div>

            <div className="mt-1 text-[10px] text-neutral-400 truncate">
              Digital / UPI
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] text-neutral-400 truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
            View logs →
          </div>
        </div>

        {/* Pocket 2: Cash in Hand */}
        <div
          onClick={() => onNavigateTab('cash')}
          className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 active:scale-[0.97] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 truncate">
                <Wallet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Cash</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="text-base sm:text-2xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.cashInHand)}
            </div>

            <div className="mt-1 text-[10px] text-neutral-400 truncate">
              Wallet Notes
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] text-neutral-400 truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
            Audit notes →
          </div>
        </div>

        {/* Pocket 3: Live Business */}
        <div
          onClick={() => onNavigateTab('business')}
          className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 active:scale-[0.97] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 truncate">
                <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Business</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="text-base sm:text-2xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.businessBalance)}
            </div>

            <div className="mt-1 text-[10px] text-neutral-400 truncate">
              Division Money
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] text-neutral-400 truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
            Manage →
          </div>
        </div>
      </div>

      {/* =========================================================================
          BENTO TILE 5: Visual Expenditure Analytics (Full-Width Bento Tile)
          ========================================================================= */}
      <section 
        aria-label="Visual Analytics Bento"
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#1c1c21] p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => setActiveChartTab('distribution')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartTab === 'distribution'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Category Pie
            </button>
            <button
              onClick={() => setActiveChartTab('trend')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartTab === 'trend'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Weekly Curve
            </button>
            <button
              onClick={() => setActiveChartTab('calendar')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartTab === 'calendar'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Calendar
            </button>
          </div>

          <span className="text-xs font-semibold text-neutral-400">
            {activeChartTab === 'distribution' 
              ? 'Monthly Breakdown' 
              : activeChartTab === 'calendar' 
              ? 'Real Date Matrix' 
              : 'Daily Outflow Dynamics'}
          </span>
        </div>

        {/* Dynamic Chart / Calendar */}
        <div className="py-2">
          {activeChartTab === 'distribution' ? (
            <SpendingPieChart
              slices={pieSlices}
              totalAmount={summary.monthlyExpenditure}
              currency={currency}
              onSelectCategory={() => onNavigateTab('spends')}
            />
          ) : activeChartTab === 'trend' ? (
            <SpendingTrendGraph
              data={trendData}
              currency={currency}
              title="Daily Spend Velocity"
            />
          ) : (
            <CalendarSpendView
              transactions={recentTransactions}
              currency={currency}
              onEditTransaction={onEditTransaction}
              onOpenQuickEntry={() => onNavigateTab('spends')}
            />
          )}
        </div>
      </section>

      {/* =========================================================================
          RECENT MOVEMENTS ACTIVITY STREAM (With Pocket Filter & Full Ledger Access)
          ========================================================================= */}
      <section 
        id="recent-movements-section"
        aria-label="Recent Movements Bento"
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Account Activity Logs
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Click any transaction to edit, reassign pocket (Bank/Business/Cash), or delete
            </p>
          </div>

          {/* Pocket Filter Selector & Date Picker */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <div className="flex items-center bg-neutral-100 dark:bg-[#1c1c21] p-0.5 rounded-xl text-xs font-semibold">
              {[
                { id: 'all', label: `All (${recentTransactions.length})` },
                { id: 'bank', label: 'Bank' },
                { id: 'cash', label: 'Cash' },
                { id: 'business', label: 'Business' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMovementFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                    movementFilter === tab.id
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Exact Date Filter */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#1c1c21] px-2 py-1 rounded-xl text-xs">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
                title="Filter by date"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="text-[10px] text-neutral-400 hover:text-neutral-800 dark:hover:text-white font-bold ml-0.5"
                  title="Clear date filter"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {displayedMovements.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No transactions recorded for {movementFilter === 'all' ? 'any account' : movementFilter} {dateFilter ? `on ${dateFilter}` : ''}. Tap + to add an entry.
            </div>
          ) : (
            displayedMovements.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const dateStr = formatTxDate(tx.date);

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction && onEditTransaction(tx)}
                  className="py-3 px-2 rounded-2xl flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#18181b] transition-all group cursor-pointer"
                  title="Click to edit, reassign account (Bank/Business/Cash), or delete"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center shrink-0">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {tx.note || tx.category}
                      </div>
                      <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate flex items-center gap-1.5">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.2 rounded font-semibold capitalize text-[10px] ${
                          tx.pocket === 'business' 
                            ? 'bg-amber-100/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : tx.pocket === 'bank'
                            ? 'bg-blue-100/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}>
                          {tx.pocket}
                        </span>
                        {tx.toPocket && <span>→ <span className="capitalize font-semibold">{tx.toPocket}</span></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <div className="text-right">
                      <div
                        className={`text-sm font-extrabold tabular-nums ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-neutral-900 dark:text-white'
                            : 'text-neutral-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'}
                        {formatAmount(tx.amount)}
                      </div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
                        {tx.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {onEditTransaction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTransaction(tx);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors"
                          title="Edit / Move Pocket"
                          aria-label="Edit transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteTransaction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTransaction(tx.id);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete entry"
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Show More / Show Less Toggle */}
        {filteredMovements.length > 6 && (
          <div className="pt-2 text-center border-t border-neutral-100 dark:border-neutral-800/60">
            <button
              type="button"
              onClick={() => setShowAllMovements(!showAllMovements)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors"
            >
              {showAllMovements ? 'Show Less' : `Show All ${filteredMovements.length} Activity Logs`}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
