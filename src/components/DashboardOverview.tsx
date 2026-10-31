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
  ArrowDownRight,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
  Zap,
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    const matchesPocket = filterPocket === 'all' || t.pocket === filterPocket;
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.businessDetails?.clientName &&
        t.businessDetails.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPocket && matchesSearch;
  });

  const topLeak = summary.leaks[0];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* AI Spending Leak Highlight Banner */}
      {topLeak ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-[var(--bg-surface-elevated)] to-emerald-500/10 p-4 sm:p-6 border border-amber-500/30 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    AI Leak Scanner
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">High Outflow Alert</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1">
                  High spend detected in <span className="text-amber-500">{topLeak.category}</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Consuming {topLeak.ratioOfExpenses}% of your monthly expenses (₹
                  <span className="tabular-nums">{topLeak.amount.toLocaleString('en-IN')}</span>
                  ). FinMech AI found fixes to save up to ₹
                  <span className="tabular-nums">
                    {Math.round(topLeak.amount * 0.35).toLocaleString('en-IN')}
                  </span>
                  /mo.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('ai')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-amber-500 ps-4 pe-3 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-transform duration-150 active:scale-[0.96] shadow-md shadow-amber-500/20 shrink-0 min-h-[44px]"
              aria-label="View AI Savings Plan"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>View AI Plan</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-[var(--bg-surface-elevated)] to-indigo-500/10 p-4 border border-emerald-500/30 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Finances Balanced
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Spending burn is healthy across cash in hand, digital and business funds.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center gap-1 text-xs font-bold text-emerald-500 hover:text-emerald-600 shrink-0 min-h-[44px] ps-2"
              aria-label="Ask AI Copilot"
            >
              <span>Ask AI</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Bento Grid: 4 Core Pockets & Financial Engines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Bento Hero: Total Liquid Net Worth */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Total Net Worth
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Layers className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums">
                ₹{summary.totalNetWorth.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Liquid Capital</span>
              </p>
            </div>
          </div>

          {/* Pocket distribution visual bar */}
          <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1.5 font-medium">
              <span>Pockets Distribution</span>
              <span>
                Cash {summary.pocketDistribution[0].percentage}% • Biz{' '}
                {summary.pocketDistribution[2].percentage}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--bg-surface-elevated)] flex overflow-hidden">
              <div
                style={{ width: `${summary.pocketDistribution[0].percentage}%` }}
                className="bg-amber-500 transition-[width] duration-300"
                title={`Cash: ${summary.pocketDistribution[0].percentage}%`}
              />
              <div
                style={{ width: `${summary.pocketDistribution[1].percentage}%` }}
                className="bg-indigo-500 transition-[width] duration-300"
                title={`Bank: ${summary.pocketDistribution[1].percentage}%`}
              />
              <div
                style={{ width: `${summary.pocketDistribution[2].percentage}%` }}
                className="bg-cyan-500 transition-[width] duration-300"
                title={`Business: ${summary.pocketDistribution[2].percentage}%`}
              />
            </div>
          </div>
        </div>

        {/* 2. Bento Tile: Cash in Hand (Physical Wallet) */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  Cash in Hand
                </span>
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Banknote className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight tabular-nums">
                ₹{summary.cashInHand.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Physical pocket notes & coins
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('cash')}
              className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-transform duration-150 active:scale-[0.96] min-h-[36px]"
              aria-label="Audit physical cash wallet notes"
            >
              <span>Audit Wallet</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">Live Count</span>
          </div>
        </div>

        {/* 3. Bento Tile: Live Business Money */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-cyan-500/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  Live Business
                </span>
                <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-cyan-500 tracking-tight tabular-nums">
                ₹{summary.businessBalance.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                <span className="text-cyan-500 font-bold tabular-nums">
                  {summary.businessMetrics.profitMargin}% Margin
                </span>
                <span>
                  • ₹
                  <span className="tabular-nums">
                    {summary.businessMetrics.grossRevenue.toLocaleString('en-IN')}
                  </span>{' '}
                  Rev
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('business')}
              className="text-xs font-bold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 transition-transform duration-150 active:scale-[0.96] min-h-[36px]"
              aria-label="Open Business Treasury Hub"
            >
              <span>Business Hub</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">
              {summary.businessMetrics.pendingReceivables > 0
                ? `₹${summary.businessMetrics.pendingReceivables} Due`
                : 'No Invoices Due'}
            </span>
          </div>
        </div>

        {/* 4. Bento Tile: Monthly Expenditure & Burn Rate */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:border-rose-500/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Month Burn Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-500 tracking-tight tabular-nums">
                ₹{summary.monthlyExpenditure.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                ₹<span className="tabular-nums">{summary.dailyAverageSpend}</span>/day avg burn
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('expenditure')}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-transform duration-150 active:scale-[0.96] min-h-[36px]"
              aria-label="View expenditure breakdown"
            >
              <span>Spends Log</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">
              {summary.categoryBreakdown.length} Categories
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Thumb-Friendly Ergonomic Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] hover:border-emerald-500/50 shadow-sm transition-transform duration-150 active:scale-[0.96] min-h-[48px]"
          aria-label="Log New Spend or Income"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-500">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">Log Spend</span>
        </button>

        <button
          onClick={() => onNavigateTab('cash')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] hover:border-amber-500/50 shadow-sm transition-transform duration-150 active:scale-[0.96] min-h-[48px]"
          aria-label="Audit Physical Cash Notes"
        >
          <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500">
            <Banknote className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">Audit Cash</span>
        </button>

        <button
          onClick={() => onNavigateTab('business')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] hover:border-cyan-500/50 shadow-sm transition-transform duration-150 active:scale-[0.96] min-h-[48px]"
          aria-label="View Business Sales and Invoices"
        >
          <div className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-500">
            <Briefcase className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">Biz Sales</span>
        </button>

        <button
          onClick={() => onNavigateTab('ai')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] hover:border-indigo-500/50 shadow-sm transition-transform duration-150 active:scale-[0.96] min-h-[48px]"
          aria-label="Ask AI Financial Copilot"
        >
          <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-500">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">AI Copilot</span>
        </button>
      </div>

      {/* Live Transaction Activity Log (Bento Card) */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Live Money Ledger</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Real-time audit across physical cash, bank, and business funds
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input (16px font on mobile prevents auto-zoom) */}
            <div className="relative flex-1 sm:w-48">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 min-h-[40px]"
                aria-label="Search transactions"
              />
            </div>

            {/* Filter Pills with min-height */}
            <div
              className="flex items-center gap-1 rounded-2xl bg-[var(--bg-surface-elevated)] p-1 border border-[var(--border-color)]"
              role="group"
              aria-label="Filter transactions by pocket"
            >
              {['all', 'cash', 'bank', 'business'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPocket(p)}
                  className={`rounded-xl px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-transform duration-150 active:scale-[0.96] min-h-[32px] ${
                    filterPocket === p
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  aria-pressed={filterPocket === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-4 divide-y divide-[var(--border-color)]">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No transactions match your filter.</p>
              <button
                onClick={onOpenQuickAdd}
                className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Log Transaction</span>
              </button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 group hover:bg-[var(--bg-surface-elevated)] px-2 rounded-2xl transition-colors duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : isTransfer
                          ? 'bg-indigo-500/15 text-indigo-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
                      ) : isTransfer ? (
                        <TrendingUp className="h-5 w-5 rotate-45" aria-hidden="true" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                          {tx.note || tx.category}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            tx.pocket === 'cash'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : tx.pocket === 'business'
                              ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                              : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {tx.pocket}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {tx.businessDetails?.clientName && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-500 font-medium">
                              Client: {tx.businessDetails.clientName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-extrabold tabular-nums ${
                          isIncome
                            ? 'text-emerald-500'
                            : isTransfer
                            ? 'text-indigo-500'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '↔ ' : '-'}₹
                        {tx.amount.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] capitalize">
                        {tx.type}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-transform duration-150 active:scale-[0.96] min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Delete entry"
                      aria-label={`Delete ${tx.note || tx.category} transaction`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
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
