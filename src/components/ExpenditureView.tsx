'use client';

import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  Trash2,
  Calendar
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';

interface ExpenditureViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  currency?: string;
  onOpenQuickEntry: () => void;
  onDeleteTransaction: (id: string) => void;
  onExportData: () => void;
}

export function ExpenditureView({
  summary,
  transactions,
  currency = '₹',
  onOpenQuickEntry,
  onDeleteTransaction,
  onExportData,
}: ExpenditureViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter transactions
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const categories = ['All', ...Array.from(new Set(expenseTransactions.map((t) => t.category)))];

  const filteredExpenses = expenseTransactions.filter((tx) => {
    const matchesSearch =
      tx.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const daysInMonth = 30;
  const projectedMonthEndSpend = Math.round(summary.dailyAverageSpend * daysInMonth);

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Hero Expenditure Card */}
      <section 
        aria-label="Expenditure overview"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Monthly Spends
              </span>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Expenditure Overview
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportData}
              className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Export JSON backup"
              aria-label="Export financial data"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenQuickEntry}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Spend
            </button>
          </div>
        </div>

        {/* Burn Rate and Totals */}
        <div className="mt-4 mb-4">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            {currency}{summary.monthlyExpenditure.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
            <span>Daily burn rate: <strong>{currency}{Math.round(summary.dailyAverageSpend).toLocaleString()}/day</strong></span>
            <span>•</span>
            <span>Projected month-end: <strong>{currency}{projectedMonthEndSpend.toLocaleString()}</strong></span>
          </div>
        </div>
      </section>

      {/* Flagged Leaks Alert (if any) */}
      {summary.leaks.length > 0 && (
        <section 
          aria-label="Identified spend alerts"
          className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>High Spend Leak Detected</span>
          </div>
          <div className="space-y-1.5">
            {summary.leaks.map((leak) => (
              <p key={leak.category} className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                {leak.concern}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Category Breakdown Bars */}
      <section 
        aria-label="Category distribution"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Category Breakdown
          </h2>
          <span className="text-xs text-neutral-400">
            {summary.categoryBreakdown.length} active categories
          </span>
        </div>

        <div className="space-y-3">
          {summary.categoryBreakdown.map((item) => (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {item.category} <span className="text-neutral-400 font-normal">({item.count} items)</span>
                </span>
                <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">
                  {currency}{item.amount.toLocaleString()} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>
          ))}

          {summary.categoryBreakdown.length === 0 && (
            <div className="text-center text-xs text-neutral-400 py-4">
              No expenses recorded this month yet.
            </div>
          )}
        </div>
      </section>

      {/* Transactions Log with Search & Filter */}
      <section aria-label="Transactions log" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            All Spends ({filteredExpenses.length})
          </h2>
        </div>

        {/* Search input & Filter pills */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search expenses, notes, amounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-white dark:bg-[#121215] text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Expense list */}
        <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden shadow-xs">
          {filteredExpenses.map((tx) => {
            const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div 
                key={tx.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors group"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {tx.note || tx.category}
                  </div>
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {dateStr} • {tx.category} • from <span className="capitalize font-medium">{tx.pocket}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums">
                    -{currency}{tx.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all focus:opacity-100"
                    aria-label="Delete spend"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No matching expense records found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
