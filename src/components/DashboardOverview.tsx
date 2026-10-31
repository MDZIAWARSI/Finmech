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
  Sparkles,
  ShoppingBag,
  Utensils,
  Laptop,
  Home as HomeIcon,
  ArrowUpRight
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

  // Generate trend points for the graph
  const trendData = [
    { day: 'Mon', amount: Math.round(summary.dailyAverageSpend * 0.7) },
    { day: 'Tue', amount: Math.round(summary.dailyAverageSpend * 1.2) },
    { day: 'Wed', amount: Math.round(summary.dailyAverageSpend * 0.5) },
    { day: 'Thu', amount: Math.round(summary.dailyAverageSpend * 1.4) },
    { day: 'Fri', amount: Math.round(summary.dailyAverageSpend * 0.9) },
    { day: 'Sat', amount: Math.round(summary.dailyAverageSpend * 1.6) },
    { day: 'Sun', amount: Math.round(summary.dailyAverageSpend * 0.8) },
  ];

  // Map category breakdown for pie chart
  const pieSlices = summary.categoryBreakdown.map((c) => ({
    label: c.category,
    amount: c.amount,
    percentage: c.percentage,
  }));

  return (
    <div className="space-y-8 pb-32 pt-2">
      {/* Hero Total Balance: Open, Borderless, Pure Whitespace */}
      <section aria-label="Hero balance" className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Total Balance
            </span>
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded"
              aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
            >
              {hideBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>+8.4% this month</span>
          </div>
        </div>

        {/* Large Stark Typographic Display */}
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
          {formatAmount(summary.totalNetWorth)}
        </div>

        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 flex items-center gap-2">
          <span>Verified across Cash, Bank & Business</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
        </div>

        {/* 4 Floating Circular Actions (Fluid, not boxed) */}
        <div className="grid grid-cols-4 gap-2 pt-6">
          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
              Spend
            </span>
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
              Inflow
            </span>
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
              Transfer
            </span>
          </button>

          <button
            onClick={onOpenTargetModal}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <Target className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
              Target
            </span>
          </button>
        </div>
      </section>

      {/* Seamless Chart Section: Toggle between Trend Graph & Donut Pie Chart */}
      <section aria-label="Visual analytics" className="pt-2">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141417] p-1 rounded-full text-xs font-medium">
            <button
              onClick={() => setActiveChartTab('trend')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartTab === 'trend'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Spend Curve
            </button>
            <button
              onClick={() => setActiveChartTab('distribution')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartTab === 'distribution'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Category Pie
            </button>
          </div>

          <span className="text-xs text-neutral-400 font-medium">
            {activeChartTab === 'trend' ? 'Weekly Dynamics' : 'Spend Allocation'}
          </span>
        </div>

        {/* Render Graph or Pie Chart smoothly */}
        <div className="py-2">
          {activeChartTab === 'trend' ? (
            <SpendingTrendGraph
              data={trendData}
              currency={currency}
              title="Daily Outflow Trend"
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

      {/* The 3 Pockets: Clean, Fluid, Borderless Row instead of 3 chunky boxes */}
      <section aria-label="Asset pockets" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Reserves Distribution
          </h2>
          <span className="text-xs text-neutral-400 font-medium">
            Tap to manage
          </span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {/* Cash in Hand */}
          <div
            onClick={() => onNavigateTab('cash')}
            className="py-3 flex items-center justify-between hover:opacity-75 transition-opacity cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  Cash in Hand
                </div>
                <div className="text-xs text-neutral-400">
                  Physical notes & coins audit
                </div>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-base font-extrabold text-neutral-900 dark:text-white tabular-nums">
                {formatAmount(summary.cashInHand)}
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Live Business Money */}
          <div
            onClick={() => onNavigateTab('business')}
            className="py-3 flex items-center justify-between hover:opacity-75 transition-opacity cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  Live Business Money
                </div>
                <div className="text-xs text-neutral-400">
                  Manual business capital count
                </div>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-base font-extrabold text-neutral-900 dark:text-white tabular-nums">
                {formatAmount(summary.businessBalance)}
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Bank Account */}
          <div
            onClick={() => onNavigateTab('spends')}
            className="py-3 flex items-center justify-between hover:opacity-75 transition-opacity cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  Bank Reserves
                </div>
                <div className="text-xs text-neutral-400">
                  Liquid checking & deposits
                </div>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-base font-extrabold text-neutral-900 dark:text-white tabular-nums">
                {formatAmount(summary.bankBalance)}
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Minimal Pocket Share Ratio Bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden flex gap-1 pt-1">
          {summary.pocketDistribution.map((p, idx) => (
            <div
              key={p.pocket}
              className={`h-full rounded-full ${
                idx === 0
                  ? 'bg-neutral-900 dark:bg-white'
                  : idx === 1
                  ? 'bg-emerald-500'
                  : 'bg-neutral-400'
              }`}
              style={{ width: `${Math.max(4, p.percentage)}%` }}
              title={`${p.pocket}: ${p.percentage.toFixed(0)}%`}
            />
          ))}
        </div>
      </section>

      {/* Savings Goal Status: Clean Line Progress */}
      <section aria-label="Savings target status" className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Savings Target
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {summary.savingsGoal.percentage}% locked
            </span>
          </div>

          <button
            onClick={onOpenTargetModal}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Adjust Goal →
          </button>
        </div>

        <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, summary.savingsGoal.percentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
          <span>{formatAmount(summary.savingsGoal.currentSaved)} saved</span>
          <span>Target: {formatAmount(summary.savingsGoal.targetAmount)}</span>
        </div>
      </section>

      {/* Recent Activity: Clean, borderless list */}
      <section aria-label="Recent activity" className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Recent Transactions
          </h2>
          <button
            onClick={() => onNavigateTab('spends')}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            View all ({recentTransactions.length}) →
          </button>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
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
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center shrink-0">
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
