'use client';

import React, { useState } from 'react';
import {
  Banknote,
  Briefcase,
  CreditCard,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  Bell,
  ArrowRightLeft,
  ChevronRight,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction, PocketType } from '@/types/finance';

interface DashboardOverviewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  onOpenQuickAdd: () => void;
  onNavigateTab: (tab: string) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function DashboardOverview({
  summary,
  transactions,
  onOpenQuickAdd,
  onNavigateTab,
  onDeleteTransaction,
}: DashboardOverviewProps) {
  const [filterPocket, setFilterPocket] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const filteredTransactions = transactions.filter((t) => {
    const matchesPocket = filterPocket === 'all' || t.pocket === filterPocket;
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPocket && matchesSearch;
  });

  const topLeak = summary.leaks[0];

  return (
    <div className="space-y-5 sm:space-y-6 pb-28">
      {/* 1. Hero Total Balance Card (Inspired by Images 1, 2, 3, 5) */}
      <div className="relative overflow-hidden rounded-[32px] bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <span>Total Liquid Balance</span>
              <button
                type="button"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
              >
                {isBalanceVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <span className="rounded-full bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                ₹ INR
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
                {isBalanceVisible ? `₹${summary.totalNetWorth.toLocaleString('en-IN')}` : '₹ ••••••'}
              </h1>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+8.42% this month</span>
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                • {transactions.length} entries active
              </span>
            </div>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/25 transition-transform duration-150 active:scale-95 min-h-[44px]"
            aria-label="Add transaction"
          >
            <Plus className="h-4 w-4" />
            <span>+ Top up / Add</span>
          </button>
        </div>

        {/* Pocket Distribution Visual Strip */}
        <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)] mb-2">
            <span>Capital Allocation</span>
            <span>
              Cash {summary.pocketDistribution[0]?.percentage || 0}% • Bank{' '}
              {summary.pocketDistribution[1]?.percentage || 0}% • Biz{' '}
              {summary.pocketDistribution[2]?.percentage || 0}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[var(--bg-surface-elevated)] flex overflow-hidden p-0.5 border border-[var(--border-color)]">
            <div
              style={{ width: `${summary.pocketDistribution[0]?.percentage || 0}%` }}
              className="bg-amber-500 rounded-l-full transition-[width] duration-300"
              title={`Cash: ${summary.pocketDistribution[0]?.percentage || 0}%`}
            />
            <div
              style={{ width: `${summary.pocketDistribution[1]?.percentage || 0}%` }}
              className="bg-indigo-500 transition-[width] duration-300"
              title={`Bank: ${summary.pocketDistribution[1]?.percentage || 0}%`}
            />
            <div
              style={{ width: `${summary.pocketDistribution[2]?.percentage || 0}%` }}
              className="bg-cyan-500 rounded-r-full transition-[width] duration-300"
              title={`Business: ${summary.pocketDistribution[2]?.percentage || 0}%`}
            />
          </div>
        </div>
      </div>

      {/* 2. Sleek Quick Action Buttons Row (Images 1, 3, 5) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <button
          onClick={onOpenQuickAdd}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl sm:rounded-3xl bg-[var(--bg-surface)] p-3 sm:p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-emerald-500/40 transition-all duration-150 active:scale-95"
          aria-label="Add Spend or Income"
        >
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">Quick Log</span>
        </button>

        <button
          onClick={() => onNavigateTab('business')}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl sm:rounded-3xl bg-[var(--bg-surface)] p-3 sm:p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-cyan-500/40 transition-all duration-150 active:scale-95"
          aria-label="Reallocate Funds"
        >
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-500">
            <ArrowRightLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">Reallocate</span>
        </button>

        <button
          onClick={() => onNavigateTab('cash')}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl sm:rounded-3xl bg-[var(--bg-surface)] p-3 sm:p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-amber-500/40 transition-all duration-150 active:scale-95"
          aria-label="Audit Physical Cash"
        >
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
            <Banknote className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">Cash ATM</span>
        </button>

        <button
          onClick={() => onNavigateTab('ai')}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl sm:rounded-3xl bg-[var(--bg-surface)] p-3 sm:p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-purple-500/40 transition-all duration-150 active:scale-95"
          aria-label="AI Savings Plan"
        >
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">AI Copilot</span>
        </button>
      </div>

      {/* 3. "My Assets / Pockets" Grid (Images 1 & 5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">My Assets & Pockets</h2>
          <span className="text-xs font-semibold text-emerald-500">3 Active Pockets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Pocket 1: Cash in Hand */}
          <div
            onClick={() => onNavigateTab('cash')}
            className="cursor-pointer rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-amber-500/40 transition-all duration-150 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                <Banknote className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Wallet Notes
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Cash in Hand</span>
              <p className="text-2xl font-black text-amber-500 mt-0.5 tabular-nums">
                {isBalanceVisible ? `₹${summary.cashInHand.toLocaleString('en-IN')}` : '₹ ••••••'}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-amber-500 font-bold">
              <span>Audit Wallet</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Pocket 2: Personal Bank */}
          <div
            onClick={() => onNavigateTab('expenditure')}
            className="cursor-pointer rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-indigo-500/40 transition-all duration-150 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-500">
                Digital UPI
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Personal Bank</span>
              <p className="text-2xl font-black text-indigo-500 mt-0.5 tabular-nums">
                {isBalanceVisible ? `₹${summary.bankBalance.toLocaleString('en-IN')}` : '₹ ••••••'}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-indigo-500 font-bold">
              <span>View Spends</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Pocket 3: Business Division */}
          <div
            onClick={() => onNavigateTab('business')}
            className="cursor-pointer rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-cyan-500/40 transition-all duration-150 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-500">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500">
                Divided Capital
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Business Division</span>
              <p className="text-2xl font-black text-cyan-500 mt-0.5 tabular-nums">
                {isBalanceVisible ? `₹${summary.businessBalance.toLocaleString('en-IN')}` : '₹ ••••••'}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-cyan-500 font-bold">
              <span>View Division</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Smart AI Recurring/Savings Banner (Inspired by Images 2 & 3) */}
      {topLeak ? (
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-purple-900/40 via-[var(--bg-surface)] to-amber-900/30 p-5 sm:p-6 border border-purple-500/30 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  AI Leak Detected
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1">
                  High spend in {topLeak.category} (₹{topLeak.amount.toLocaleString('en-IN')})
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Consuming {topLeak.ratioOfExpenses}% of your expenses. FinMech can help you save up to ₹
                  <span className="tabular-nums font-bold">
                    {Math.round(topLeak.amount * 0.35).toLocaleString('en-IN')}
                  </span>
                  /mo.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center justify-center gap-1.5 rounded-full bg-white text-slate-950 px-4 py-2.5 text-xs font-bold shadow-md hover:bg-slate-100 transition-transform duration-150 active:scale-95 shrink-0 min-h-[44px]"
            >
              <span>Review Plan</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[28px] bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Save Smarter, Little by Little</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  FinMech AI automatically monitors physical cash leaks and digital burn.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center gap-1 rounded-full bg-[var(--bg-surface-elevated)] px-4 py-2 text-xs font-bold text-emerald-500 hover:text-emerald-600 min-h-[40px] shrink-0 border border-[var(--border-color)]"
            >
              <span>Ask AI Copilot</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Recent Activity / Transactions Ledger (Images 2 & 5) */}
      <div className="rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Recent Activity</h3>
            <p className="text-xs text-[var(--text-muted)]">Live transactions across all pockets</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'cash', label: 'Cash' },
              { id: 'bank', label: 'Bank' },
              { id: 'business', label: 'Biz Division' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterPocket(f.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all min-h-[36px] ${
                  filterPocket === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Stream */}
        <div className="mt-3 divide-y divide-[var(--border-color)]">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
              No recent activity found.
            </div>
          ) : (
            filteredTransactions.slice(0, 10).map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-[var(--bg-surface-elevated)] rounded-2xl transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : isTransfer
                          ? 'bg-indigo-500/15 text-indigo-500'
                          : tx.pocket === 'cash'
                          ? 'bg-amber-500/15 text-amber-500'
                          : tx.pocket === 'business'
                          ? 'bg-cyan-500/15 text-cyan-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : isTransfer ? (
                        <ArrowRightLeft className="h-5 w-5" />
                      ) : (
                        <Layers className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {tx.note || tx.category}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <span className="capitalize font-medium text-[var(--text-secondary)]">{tx.category}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.pocket}</span>
                        <span>•</span>
                        <span>
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span
                      className={`text-sm sm:text-base font-black tabular-nums ${
                        isIncome
                          ? 'text-emerald-500'
                          : isTransfer
                          ? 'text-indigo-500'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-rose-500 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
