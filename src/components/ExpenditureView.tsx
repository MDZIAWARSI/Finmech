'use client';

import React, { useState } from 'react';
import {
  TrendingDown,
  PieChart,
  Download,
  Search,
  AlertCircle,
  ChevronRight,
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
    <div className="space-y-4 sm:space-y-6 pb-28">
      {/* 3 Metric Cards (Minimal Monochrome with subtle red accent) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <span className="text-xs font-medium text-[var(--text-muted)]">Monthly Outflow</span>
          <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1 tabular-nums">
            ₹{summary.monthlyExpenditure.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Total across all accounts</span>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <span className="text-xs font-medium text-[var(--text-muted)]">Daily Average Burn</span>
          <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1 tabular-nums">
            ₹{summary.dailyAverageSpend.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-[var(--text-muted)]">/day</span>
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            30d projection: ₹{(summary.dailyAverageSpend * 30).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[var(--text-muted)]">Active Spending Leaks</span>
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1 tabular-nums">
              {summary.leaks.length} <span className="text-xs font-normal text-[var(--text-muted)]">flagged</span>
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('ai')}
            className="text-xs font-semibold text-[var(--text-primary)] hover:opacity-80 flex items-center gap-1 mt-2 min-h-[32px]"
          >
            <span>Inspect with Copilot</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Category Spend Distribution */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Category Distribution</h2>
            <p className="text-xs text-[var(--text-muted)]">Breakdown of where capital is going</p>
          </div>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-full bg-[var(--bg-surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all min-h-[34px]"
          >
            <Download className="h-3 w-3" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          {summary.categoryBreakdown.map((cat, idx) => {
            const isTopLeak = idx === 0 && cat.percentage >= 30;
            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">{cat.category}</span>
                    {isTopLeak && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.2 text-[10px] font-bold text-red-600 dark:text-red-400">
                        Primary Outflow ({cat.percentage}%)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--text-muted)] text-[11px] tabular-nums">{cat.count} txns</span>
                    <span className="font-bold text-[var(--text-primary)] tabular-nums">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[var(--text-muted)] w-8 text-right tabular-nums">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isTopLeak ? 'bg-red-500' : 'bg-[var(--text-primary)] opacity-75'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Ledger */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Expenditure Log</h3>
            <p className="text-xs text-[var(--text-muted)]">Outflows record</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spend..."
                style={{ fontSize: '16px' }}
                className="rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none min-h-[34px]"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full bg-[var(--bg-surface-elevated)] p-0.5 border border-[var(--border-color)]">
              {['all', 'cash', 'bank', 'business'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPocket(p)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-all ${
                    selectedPocket === p
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {p === 'business' ? 'Division' : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 divide-y divide-[var(--border-color)]">
          {expenses.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
              No matching expenses found.
            </div>
          ) : (
            expenses.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 px-1 hover:bg-[var(--bg-surface-elevated)] rounded-xl transition-colors duration-120"
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {tx.note || tx.category}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {tx.category} • {tx.pocket} • {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">
                  -₹{tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
