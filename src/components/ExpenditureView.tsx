'use client';

import React, { useState } from 'react';
import {
  TrendingDown,
  PieChart,
  Download,
  Search,
  AlertTriangle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction } from '@/types/finance';
import { StorageService } from '@/lib/storage';

interface ExpenditureViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  onOpenQuickAdd: () => void;
  onNavigateTab: (tab: string) => void;
}

export default function ExpenditureView({
  summary,
  transactions,
  onOpenQuickAdd,
  onNavigateTab,
}: ExpenditureViewProps) {
  const [selectedPocket, setSelectedPocket] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const expenses = transactions.filter((t) => {
    const isExpense = t.type === 'expense';
    const matchesPocket = selectedPocket === 'all' || t.pocket === selectedPocket;
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.note.toLowerCase().includes(searchQuery.toLowerCase());
    return isExpense && matchesPocket && matchesSearch;
  });

  const handleExportData = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FINMECH_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Hero Stats for Spends */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Spent This Month</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-500 mt-2 tabular-nums">
            ₹{summary.monthlyExpenditure.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Across all categories and pockets</p>
        </div>

        <div className="rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Daily Average Burn</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-2 tabular-nums">
            ₹{summary.dailyAverageSpend.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-[var(--text-muted)]">/day</span>
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Projected 30d: ₹<span className="tabular-nums">{(summary.dailyAverageSpend * 30).toLocaleString('en-IN')}</span>
          </p>
        </div>

        <div className="rounded-3xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Active Money Leaks</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-2 tabular-nums">
            {summary.leaks.length} <span className="text-xs font-normal text-[var(--text-muted)]">flagged</span>
          </p>
          <button
            onClick={() => onNavigateTab('ai')}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 mt-1 transition-transform duration-150 active:scale-[0.96] min-h-[36px]"
            aria-label="Scan with AI Copilot"
          >
            <span>Scan with AI Copilot</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Category Spend Distribution Breakdown */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">Category Spending Distribution</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Where your money is actually flowing</p>
          </div>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1 rounded-2xl bg-[var(--bg-surface-elevated)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] border border-[var(--border-color)] hover:border-emerald-500/40 transition-transform duration-150 active:scale-[0.96] min-h-[40px]"
            aria-label="Export Financial Data to JSON"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {summary.categoryBreakdown.map((cat, idx) => {
            const isTopLeak = idx === 0 && cat.percentage >= 30;
            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)]">{cat.category}</span>
                    {isTopLeak && (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[9px] font-bold text-rose-500 border border-rose-500/30">
                        Primary Leak ({cat.percentage}%)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-muted)] text-[11px] tabular-nums">{cat.count} txns</span>
                    <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[var(--text-muted)] w-10 text-right tabular-nums font-semibold">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      isTopLeak
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                        : cat.percentage > 20
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Ledger */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Expenditure Log</h3>
            <p className="text-xs text-[var(--text-muted)]">Detailed list of all outflows</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spend..."
                className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] min-h-[40px]"
                aria-label="Search expense entries"
              />
            </div>

            <div className="flex items-center gap-1 rounded-2xl bg-[var(--bg-surface-elevated)] p-1 border border-[var(--border-color)]">
              {['all', 'cash', 'bank', 'business'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPocket(p)}
                  className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold capitalize transition-transform duration-150 active:scale-[0.96] min-h-[32px] ${
                    selectedPocket === p ? 'bg-rose-500 text-white shadow-sm' : 'text-[var(--text-secondary)]'
                  }`}
                  aria-pressed={selectedPocket === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[var(--border-color)]">
          {expenses.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--text-secondary)]">No expenses recorded.</p>
          ) : (
            expenses.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3.5 hover:bg-[var(--bg-surface-elevated)] px-2 rounded-2xl transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
                    <TrendingDown className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">{tx.note || tx.category}</p>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">({tx.pocket})</span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-extrabold text-rose-500 tabular-nums">
                    -₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
