'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  ArrowUpRight, 
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
  HelpCircle
} from 'lucide-react';
import { FinancialSummary, Transaction, PocketType } from '@/types/finance';
import { NavTab } from './Navbar';

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

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Hero Total Balance Card (Reference Images 1, 2, 5, 6) */}
      <section 
        aria-label="Balance summary"
        className="relative bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-xs transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
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

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
            <TrendingUp className="w-3 h-3" />
            <span>+8.4% this month</span>
          </div>
        </div>

        {/* Large Crisp Typography Amount */}
        <div className="mt-3 mb-6">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            {formatAmount(summary.totalNetWorth)}
          </div>
          <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 flex items-center gap-1.5">
            <span>Verified across Cash, Bank & Business</span>
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
          </div>
        </div>

        {/* Quick Action Pills (Send, Inflow, Transfer, Target) */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition-all shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1.5">
              Spend
            </span>
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition-all shadow-xs">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1.5">
              Inflow
            </span>
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition-all shadow-xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1.5">
              Transfer
            </span>
          </button>

          <button
            onClick={onOpenTargetModal}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition-all shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1.5">
              Target
            </span>
          </button>
        </div>
      </section>

      {/* Monthly Savings Target Bento Card */}
      <section 
        aria-label="Savings target progress"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Savings Target
            </h2>
          </div>

          <button
            onClick={onOpenTargetModal}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-0.5 transition-colors"
          >
            Adjust Goal <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
              {formatAmount(summary.savingsGoal.currentSaved)}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-1.5">
              saved of {formatAmount(summary.savingsGoal.targetAmount)}
            </span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 tabular-nums">
            {summary.savingsGoal.percentage}%
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, summary.savingsGoal.percentage)}%` }}
          />
        </div>

        <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {summary.savingsGoal.remaining <= 0
                ? 'Target reached! Pacing is optimal.'
                : `${formatAmount(summary.savingsGoal.remaining)} remaining this month.`}
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('copilot')}
            className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            AI Strategy →
          </button>
        </div>
      </section>

      {/* 3 Asset Pockets Bento Grid (Cash in Hand, Live Business, Bank) */}
      <section aria-label="Asset pockets">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            My Pockets
          </h2>
          <span className="text-xs text-neutral-400">
            3 verified reserves
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cash in Hand Card */}
          <div 
            onClick={() => onNavigateTab('cash')}
            className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4.5 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Wallet className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors" />
            </div>
            <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              Cash in Hand
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {formatAmount(summary.cashInHand)}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 flex items-center justify-between">
              <span>Physical notes & coins</span>
              <span className="underline font-medium group-hover:text-neutral-900 dark:group-hover:text-white">Audit</span>
            </div>
          </div>

          {/* Live Business Money Card */}
          <div 
            onClick={() => onNavigateTab('business')}
            className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4.5 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Briefcase className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors" />
            </div>
            <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              Live Business Money
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {formatAmount(summary.businessBalance)}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 flex items-center justify-between">
              <span>Manual live count</span>
              <span className="underline font-medium group-hover:text-neutral-900 dark:group-hover:text-white">Manage</span>
            </div>
          </div>

          {/* Personal Bank Card */}
          <div 
            onClick={() => onNavigateTab('spends')}
            className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4.5 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <Landmark className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors" />
            </div>
            <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              Bank Balance
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {formatAmount(summary.bankBalance)}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 flex items-center justify-between">
              <span>Liquid checking</span>
              <span className="underline font-medium group-hover:text-neutral-900 dark:group-hover:text-white">View</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section aria-label="Recent activity">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Recent Activity
          </h2>
          <button
            onClick={() => onNavigateTab('spends')}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            See all →
          </button>
        </div>

        <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden shadow-xs">
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
                className="p-4 flex items-center justify-between hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {tx.note || tx.category}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span className="capitalize">{tx.pocket}</span>
                      {tx.toPocket && (
                        <span>→ {tx.toPocket}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold tabular-nums ${
                    isIncome 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : isTransfer 
                      ? 'text-neutral-900 dark:text-white' 
                      : 'text-neutral-900 dark:text-white'
                  }`}>
                    {isIncome ? '+' : isTransfer ? '' : '-'}{formatAmount(tx.amount)}
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
                    {tx.category}
                  </div>
                </div>
              </div>
            );
          })}

          {recentTransactions.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No recent activity recorded. Tap <strong className="text-neutral-700 dark:text-neutral-200">+</strong> to log your first transaction.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
