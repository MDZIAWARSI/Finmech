'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  TrendingDown,
  PieChart,
  Download,
  Filter,
  Search,
  Calendar,
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

  // Only expense transactions
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
    <div className="space-y-6 pb-20">
      {/* Hero Stats for Spends */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-[#0d1322] p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Spent This Month</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-300 mt-2">
            ₹{summary.monthlyExpenditure.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across all categories and pockets</p>
        </div>

        <div className="rounded-3xl bg-[#0d1322] p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Daily Average Burn Rate</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">
            ₹{summary.dailyAverageSpend.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Projected month: ₹{(summary.dailyAverageSpend * 30).toLocaleString('en-IN')}</p>
        </div>

        <div className="rounded-3xl bg-[#0d1322] p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Money Leaks</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {summary.leaks.length} <span className="text-xs font-normal text-slate-400">flagged</span>
          </p>
          <button
            onClick={() => onNavigateTab('ai')}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1"
          >
            <span>Scan with AI Copilot</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Category Spend Diagnostics Breakdown */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">Category Spending Distribution</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Where your money is actually flowing</p>
          </div>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
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
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    {isTopLeak && (
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                        Primary Leak ({cat.percentage}%)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{cat.count} txns</span>
                    <span className="font-bold text-white">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 w-10 text-right">{cat.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTopLeak
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                        : cat.percentage > 20
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Ledger */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Expenditure Log</h3>
            <p className="text-xs text-slate-400">Detailed list of all outflows</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spend..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-8 pr-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
              {['all', 'cash', 'bank', 'business'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPocket(p)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                    selectedPocket === p ? 'bg-slate-800 text-rose-300' : 'text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-800/60">
          {expenses.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No expenses recorded.</p>
          ) : (
            expenses.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 hover:bg-slate-800/20 px-2 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-200">{tx.note || tx.category}</p>
                      <span className="text-[10px] text-slate-500">({tx.pocket})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-rose-400">
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

