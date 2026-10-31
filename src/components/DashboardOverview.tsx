'use client';

import React, { useState } from 'react';
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
  ReceiptText
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';
import { NavTab } from './Navbar';
import { SpendingPieChart, SpendingTrendGraph } from './Charts';

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
  onOpenTargetModal,
}: DashboardOverviewProps) {
  const [hideBalances, setHideBalances] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'distribution' | 'trend'>('distribution');

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

  // 7-day trend points
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

  // Sparkline data points for the mini-chart inside Spent tile (Reference Image 7)
  const miniSparklinePoints = [30, 45, 25, 60, 40, 75, 55];
  const sparkWidth = 100;
  const sparkHeight = 28;
  const maxSpark = Math.max(...miniSparklinePoints);
  const sparkPath = miniSparklinePoints.reduce((acc, val, i) => {
    const x = (i / (miniSparklinePoints.length - 1)) * sparkWidth;
    const y = sparkHeight - (val / maxSpark) * (sparkHeight - 4);
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
              Total Net Balance
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
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums display-amount">
          {formatAmount(summary.totalNetWorth)}
        </div>

        <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-2 mt-2">
          <span>Live capital across Cash, Bank & Business</span>
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
                <span className="truncate">Savings</span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                {summary.savingsGoal.percentage}%
              </span>
            </div>

            <div className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.savingsGoal.currentSaved)}
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

        {/* Bento Tile 3: Cash in Hand + Pocket Wallet */}
        <div
          onClick={() => onNavigateTab('cash')}
          className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 active:scale-[0.97] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 sm:gap-1.5 truncate">
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Cash in Hand</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.cashInHand)}
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                Wallet Cash
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[10px] sm:text-xs text-neutral-400">
            <span className="truncate">Physical notes</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:inline group-hover:underline">
              Audit →
            </span>
          </div>
        </div>

        {/* Bento Tile 4: Live Business Capital + Revenue Inflow */}
        <div
          onClick={() => onNavigateTab('business')}
          className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 active:scale-[0.97] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 sm:gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Business</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight truncate">
              {formatAmount(summary.businessBalance)}
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Count
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[10px] sm:text-xs text-neutral-400">
            <span className="truncate">Active Capital</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:inline group-hover:underline">
              Manage →
            </span>
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
          </div>

          <span className="text-xs font-semibold text-neutral-400">
            {activeChartTab === 'distribution' ? 'Capital Breakdown' : 'Daily Outflow Dynamics'}
          </span>
        </div>

        {/* Dynamic Chart */}
        <div className="py-2">
          {activeChartTab === 'distribution' ? (
            <SpendingPieChart
              slices={pieSlices}
              totalAmount={summary.monthlyExpenditure}
              currency={currency}
              onSelectCategory={() => onNavigateTab('spends')}
            />
          ) : (
            <SpendingTrendGraph
              data={trendData}
              currency={currency}
              title="Daily Spend Velocity"
            />
          )}
        </div>
      </section>

      {/* =========================================================================
          BENTO TILE 6: Recent Movements Activity Stream (Full-Width Bento Tile)
          ========================================================================= */}
      <section 
        aria-label="Recent Movements Bento"
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3"
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
