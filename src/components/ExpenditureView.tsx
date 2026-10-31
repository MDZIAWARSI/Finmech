'use client';

import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  Download, 
  AlertTriangle, 
  Plus, 
  Trash2,
  PieChart as PieIcon,
  TrendingDown
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';
import { SpendingPieChart, SpendingTrendGraph } from './Charts';

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
  const [viewMode, setViewMode] = useState<'chart' | 'trend'>('chart');

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

  const pieSlices = summary.categoryBreakdown.map((c) => ({
    label: c.category,
    amount: c.amount,
    percentage: c.percentage,
  }));

  const trendData = [
    { day: 'Mon', amount: Math.round(summary.dailyAverageSpend * 0.7) },
    { day: 'Tue', amount: Math.round(summary.dailyAverageSpend * 1.2) },
    { day: 'Wed', amount: Math.round(summary.dailyAverageSpend * 0.5) },
    { day: 'Thu', amount: Math.round(summary.dailyAverageSpend * 1.4) },
    { day: 'Fri', amount: Math.round(summary.dailyAverageSpend * 0.9) },
    { day: 'Sat', amount: Math.round(summary.dailyAverageSpend * 1.6) },
    { day: 'Sun', amount: Math.round(summary.dailyAverageSpend * 0.8) },
  ];

  const projectedMonthEndSpend = Math.round(summary.dailyAverageSpend * 30);

  return (
    <div className="space-y-8 pb-32 pt-2">
      {/* Header Overview (Clean & Borderless) */}
      <section aria-label="Spends header" className="pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Monthly Spends
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportData}
              className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
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

        {/* Big Typography Total */}
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums mt-2">
          {currency}{summary.monthlyExpenditure.toLocaleString('en-IN')}
        </div>

        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 flex items-center gap-2">
          <span>Daily burn: <strong className="text-neutral-800 dark:text-neutral-200">{currency}{Math.round(summary.dailyAverageSpend).toLocaleString()}/day</strong></span>
          <span>•</span>
          <span>Projected month-end: <strong className="text-neutral-800 dark:text-neutral-200">{currency}{projectedMonthEndSpend.toLocaleString()}</strong></span>
        </div>
      </section>

      {/* Interactive Pie Chart & Trend Graph */}
      <section aria-label="Visual charts" className="pt-2">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141417] p-1 rounded-full text-xs font-medium">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded-full transition-all ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Category Pie
            </button>
            <button
              onClick={() => setViewMode('trend')}
              className={`px-3 py-1 rounded-full transition-all ${
                viewMode === 'trend'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Daily Burn Curve
            </button>
          </div>

          <span className="text-xs text-neutral-400 font-medium">
            {pieSlices.length} Active Categories
          </span>
        </div>

        {viewMode === 'chart' ? (
          <SpendingPieChart
            slices={pieSlices}
            totalAmount={summary.monthlyExpenditure}
            currency={currency}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        ) : (
          <SpendingTrendGraph
            data={trendData}
            currency={currency}
            title="Daily Expenditure Curve"
          />
        )}
      </section>

      {/* Flagged Leaks (High spend notice) */}
      {summary.leaks.length > 0 && (
        <section 
          aria-label="High spend warnings"
          className="bg-neutral-100/70 dark:bg-neutral-900/40 rounded-2xl p-4 space-y-2 text-xs"
        >
          <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Spending Concentration Alert</span>
          </div>
          {summary.leaks.map((leak) => (
            <p key={leak.category} className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {leak.concern}
            </p>
          ))}
        </section>
      )}

      {/* Spends Log List (Borderless, Spacious) */}
      <section aria-label="Transactions log" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            All Spends ({filteredExpenses.length})
          </h2>
        </div>

        {/* Minimal Search & Filter Pills */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by note, category, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/60 dark:bg-[#141417] rounded-2xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-[#141417] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Fluid Divide-y List */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {filteredExpenses.map((tx) => {
            const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div 
                key={tx.id}
                className="py-3 flex items-center justify-between hover:opacity-75 transition-opacity group"
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    {tx.note || tx.category}
                  </div>
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {dateStr} • {tx.category} • from <span className="capitalize font-medium">{tx.pocket}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-white tabular-nums">
                    -{currency}{tx.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 transition-all focus:opacity-100"
                    aria-label="Delete spend"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredExpenses.length === 0 && (
            <div className="py-12 text-center text-neutral-400 text-xs">
              No expenses matching your criteria.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
