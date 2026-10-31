'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Target, 
  Wallet, 
  Briefcase, 
  Landmark, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  ShoppingBag,
  Utensils,
  Laptop,
  Home as HomeIcon,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  Activity
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';
import { NavTab } from './Navbar';
import { SpendingTrendGraph, SpendingPieChart } from './Charts';

interface DashboardOverviewProps {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  currency?: string;
  onNavigateTab: (tab: NavTab) => void;
  onOpenQuickEntry: () => void;
  onOpenTargetModal: () => void;
}

export function DashboardOverview({
  summary,
  recentTransactions,
  currency = '₹',
  onNavigateTab,
  onOpenQuickEntry,
  onOpenTargetModal,
}: DashboardOverviewProps) {
  const [hideBalances, setHideBalances] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'trend' | 'distribution'>('trend');

  const formatAmount = (val: number) => {
    if (hideBalances) return '••••••';
    return `${currency}${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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

  // 7-day trend points for the graph
  const trendData = [
    { day: 'Mon', amount: Math.round(summary.dailyAverageSpend * 0.7) },
    { day: 'Tue', amount: Math.round(summary.dailyAverageSpend * 1.2) },
    { day: 'Wed', amount: Math.round(summary.dailyAverageSpend * 0.5) },
    { day: 'Thu', amount: Math.round(summary.dailyAverageSpend * 1.4) },
    { day: 'Fri', amount: Math.round(summary.dailyAverageSpend * 0.9) },
    { day: 'Sat', amount: Math.round(summary.dailyAverageSpend * 1.6) },
    { day: 'Sun', amount: Math.round(summary.dailyAverageSpend * 0.8) },
  ];

  // Category breakdown for pie chart
  const pieSlices = summary.categoryBreakdown.map((c) => ({
    label: c.category,
    amount: c.amount,
    percentage: c.percentage,
  }));

  const healthScore = Math.min(100, Math.max(40, 100 - Math.round((summary.monthlyExpenditure / Math.max(1, summary.monthlyIncome)) * 50)));

  return (
    <div className="space-y-4 pb-32 pt-2">
      {/* =========================================================================
          BENTO TILE 1: Dominant Hero Net Worth (Full-width Bento Tile)
          ========================================================================= */}
      <section 
        aria-label="Total Net Worth Bento"
        className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs relative overflow-hidden transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Total Net Worth
            </span>
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded"
              aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
            >
              {hideBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
            <TrendingUp className="w-3 h-3" />
            <span>+8.4% month</span>
          </div>
        </div>

        {/* Large Stark Typographic Display */}
        <div className="mt-2 mb-1 text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums display-amount">
          {formatAmount(summary.totalNetWorth)}
        </div>

        <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-2 mb-6">
          <span>Verified across Cash, Bank & Business</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Real-Time</span>
        </div>

        {/* Quick Action Pills Row inside Hero Bento */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 mt-1.5">
              Spend
            </span>
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 mt-1.5">
              Inflow
            </span>
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 mt-1.5">
              Transfer
            </span>
          </button>

          <button
            onClick={onOpenTargetModal}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <Target className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 mt-1.5">
              Target
            </span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          BENTO ROW 2: Cash in Hand Bento & Live Business Money Bento
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Cash in Hand Bento Tile */}
        <div
          onClick={() => onNavigateTab('cash')}
          className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Wallet className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Cash in Hand
            </span>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight mt-0.5">
              {formatAmount(summary.cashInHand)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
            <span>Physical notes & coins</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:underline">
              Audit Denominations →
            </span>
          </div>
        </div>

        {/* Live Business Money Bento Tile */}
        <div
          onClick={() => onNavigateTab('business')}
          className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Briefcase className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Live Business Capital
            </span>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight mt-0.5">
              {formatAmount(summary.businessBalance)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
            <span>Manual live count</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:underline">
              Manage Funds →
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BENTO ROW 3: Monthly Savings Target & Fiscal Health Burn Bento
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Savings Goal Bento Tile */}
        <div 
          onClick={onOpenTargetModal}
          className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              Savings Goal Target
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {summary.savingsGoal.percentage}% locked
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {formatAmount(summary.savingsGoal.currentSaved)}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Target: {formatAmount(summary.savingsGoal.targetAmount)} ({formatAmount(summary.savingsGoal.remaining)} left)
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.savingsGoal.percentage)}%` }}
              />
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Status: <strong className="text-neutral-800 dark:text-neutral-200">{summary.savingsGoal.status === 'achieved' ? 'Goal Met' : 'On Track'}</strong></span>
              <span className="group-hover:underline font-medium">Adjust Target →</span>
            </div>
          </div>
        </div>

        {/* Fiscal Health & Burn Rate Bento Tile */}
        <div 
          onClick={() => onNavigateTab('spends')}
          className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Daily Burn Pace
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 tabular-nums">
              {healthScore}/100 Health
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {formatAmount(Math.round(summary.dailyAverageSpend))}/day
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Total Month Outflow: {formatAmount(summary.monthlyExpenditure)}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
            <span>Projected: {formatAmount(Math.round(summary.dailyAverageSpend * 30))}</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:underline">
              Analyze Spends →
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BENTO ROW 4: Interactive Visual Analytics (Full-width Bento Tile)
          ========================================================================= */}
      <section 
        aria-label="Visual Analytics Bento"
        className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#1c1c21] p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => setActiveChartTab('trend')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartTab === 'trend'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Spend Curve
            </button>
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
          </div>

          <span className="text-xs font-semibold text-neutral-400">
            {activeChartTab === 'trend' ? 'Weekly Outflow Velocity' : 'Capital Allocation'}
          </span>
        </div>

        {/* Dynamic Graph or Donut Chart */}
        <div className="py-2">
          {activeChartTab === 'trend' ? (
            <SpendingTrendGraph
              data={trendData}
              currency={currency}
              title="Daily Spend Velocity"
            />
          ) : (
            <SpendingPieChart
              slices={pieSlices}
              totalAmount={summary.monthlyExpenditure}
              currency={currency}
              onSelectCategory={() => onNavigateTab('spends')}
            />
          )}
        </div>
      </section>

      {/* =========================================================================
          BENTO ROW 5: Recent Transactions Activity (Bento Tile)
          ========================================================================= */}
      <section 
        aria-label="Recent Transactions Bento"
        className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Recent Movements
          </h2>
          <button
            onClick={() => onNavigateTab('spends')}
            className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            All Spends ({recentTransactions.length}) →
          </button>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {recentTransactions.slice(0, 5).map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center shrink-0">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {tx.note || tx.category}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {dateStr} • <span className="capitalize">{tx.pocket}</span>
                      {tx.toPocket && <span> → {tx.toPocket}</span>}
                    </div>
                  </div>
                </div>

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
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
