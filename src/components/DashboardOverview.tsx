'use client';

import React, { useState } from 'react';
import {
  Banknote,
  Briefcase,
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRightLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction } from '@/types/finance';

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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const filteredTransactions = transactions.filter((t) => {
    if (filterPocket === 'all') return true;
    return t.pocket === filterPocket;
  });

  const topLeak = summary.leaks[0];

  return (
    <div className="space-y-4 sm:space-y-6 pb-28">
      {/* 1. Hero Total Balance Card (Minimal Monochrome) */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <span>Total Balance</span>
              <button
                type="button"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
              >
                {isBalanceVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="mt-2">
              <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
                {isBalanceVisible ? `₹${summary.totalNetWorth.toLocaleString('en-IN')}` : '₹ ••••••'}
              </h1>
            </div>

            {/* Subtle green tint for positive performance */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+8.4% this month</span>
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                • {transactions.length} entries
              </span>
            </div>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] px-4 py-2 text-xs font-bold hover:opacity-90 transition-transform duration-120 active:scale-95 min-h-[40px]"
            aria-label="Add entry"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
          </button>
        </div>

        {/* Minimal Monochrome Capital Allocation Bar */}
        <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)] mb-2">
            <span>Capital Allocation</span>
            <span className="tabular-nums">
              Cash {summary.pocketDistribution[0]?.percentage || 0}% • Bank{' '}
              {summary.pocketDistribution[1]?.percentage || 0}% • Division{' '}
              {summary.pocketDistribution[2]?.percentage || 0}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--bg-surface-elevated)] flex overflow-hidden">
            <div
              style={{ width: `${summary.pocketDistribution[0]?.percentage || 0}%` }}
              className="bg-[var(--text-primary)] opacity-40 transition-[width] duration-300"
            />
            <div
              style={{ width: `${summary.pocketDistribution[1]?.percentage || 0}%` }}
              className="bg-[var(--text-primary)] opacity-70 transition-[width] duration-300"
            />
            <div
              style={{ width: `${summary.pocketDistribution[2]?.percentage || 0}%` }}
              className="bg-[var(--text-primary)] transition-[width] duration-300"
            />
          </div>
        </div>
      </div>

      {/* 2. Quick Action Buttons (Minimal Monochrome) */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all duration-120 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Quick Log</span>
        </button>

        <button
          onClick={() => onNavigateTab('business')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all duration-120 active:scale-95"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Reallocate</span>
        </button>

        <button
          onClick={() => onNavigateTab('cash')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all duration-120 active:scale-95"
        >
          <Banknote className="h-4 w-4" />
          <span>Audit Cash</span>
        </button>
      </div>

      {/* 3. My Assets & Pockets (Minimal Monochrome) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">My Pockets</h2>
          <span className="text-xs text-[var(--text-muted)]">3 Segregated Accounts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pocket 1: Cash in Hand */}
          <div
            onClick={() => onNavigateTab('cash')}
            className="cursor-pointer rounded-2xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-[var(--border-color-hover)] transition-all duration-120 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <Banknote className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                Physical Cash
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs text-[var(--text-muted)]">Cash in Hand</span>
              <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5 tabular-nums">
                {isBalanceVisible ? `₹${summary.cashInHand.toLocaleString('en-IN')}` : '₹ ••••••'}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
              <span>Audit Wallet</span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Pocket 2: Personal Bank */}
          <div
            onClick={() => onNavigateTab('expenditure')}
            className="cursor-pointer rounded-2xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-[var(--border-color-hover)] transition-all duration-120 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                Digital UPI
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs text-[var(--text-muted)]">Personal Bank</span>
              <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5 tabular-nums">
                {isBalanceVisible ? `₹${summary.bankBalance.toLocaleString('en-IN')}` : '₹ ••••••'}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
              <span>View Spends</span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Pocket 3: Business Division */}
          <div
            onClick={() => onNavigateTab('business')}
            className="cursor-pointer rounded-2xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-[var(--border-color-hover)] transition-all duration-120 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                Divided Capital
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs text-[var(--text-muted)]">Business Division</span>
              <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5 tabular-nums">
                {isBalanceVisible ? `₹${summary.businessBalance.toLocaleString('en-IN')}` : '₹ ••••••'}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
              <span>View Division</span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Spending Alert Banner (Monochrome with subtle red tint only if alert exists) */}
      {topLeak && (
        <div className="rounded-2xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-red-500/20 shadow-[var(--shadow-card)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Spending Alert
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  High spend in {topLeak.category} (₹{topLeak.amount.toLocaleString('en-IN')})
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Consuming {topLeak.ratioOfExpenses}% of monthly expenses. Save up to ₹
                  <span className="tabular-nums font-bold">
                    {Math.round(topLeak.amount * 0.35).toLocaleString('en-IN')}
                  </span>
                  /mo.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] px-4 py-2 text-xs font-bold hover:opacity-90 transition-transform duration-120 active:scale-95 shrink-0 min-h-[36px]"
            >
              <span>Review</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Recent Activity Ledger (Minimal Monochrome) */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Activity</h3>
            <p className="text-xs text-[var(--text-muted)]">Transactions across your pockets</p>
          </div>

          {/* Minimal Filter Tabs */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'cash', label: 'Cash' },
              { id: 'bank', label: 'Bank' },
              { id: 'business', label: 'Division' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterPocket(f.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all min-h-[32px] ${
                  filterPocket === f.id
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-2 divide-y divide-[var(--border-color)]">
          {filteredTransactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-[var(--text-secondary)]">
              No transactions found.
            </div>
          ) : (
            filteredTransactions.slice(0, 10).map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 px-1 hover:bg-[var(--bg-surface-elevated)] rounded-xl transition-colors duration-120"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]">
                      {isIncome ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isTransfer ? (
                        <ArrowRightLeft className="h-4 w-4 text-[var(--text-secondary)]" />
                      ) : (
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">-</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {tx.note || tx.category}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <span>{tx.category}</span>
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
                    {/* Subtle green tint for income, subtle red tint for expense, neutral for transfer */}
                    <span
                      className={`text-sm sm:text-base font-bold tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'text-[var(--text-secondary)]'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1 rounded-full text-[var(--text-muted)] hover:text-red-500 transition-colors"
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
