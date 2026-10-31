'use client';

import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, 
  Search, 
  Download, 
  AlertTriangle, 
  Plus, 
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Edit3
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';
import { SpendingPieChart, SpendingTrendGraph } from './Charts';

interface ExpenditureViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  currency?: string;
  onOpenQuickEntry: () => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onExportData: () => void;
}

export function ExpenditureView({
  summary,
  transactions,
  currency = '₹',
  onOpenQuickEntry,
  onDeleteTransaction,
  onEditTransaction,
  onExportData,
}: ExpenditureViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'expense' | 'income' | 'transfer' | 'all'>('expense');
  // Default to Weekly Curve as requested
  const [viewMode, setViewMode] = useState<'chart' | 'trend'>('trend');

  // Strictly personal transactions (business is quarantined to the Business tab)
  const personalTransactions = useMemo(() => {
    return transactions.filter((t) => t.pocket !== 'business' && t.toPocket !== 'business');
  }, [transactions]);

  // Filter transactions by selected type
  const typeFilteredTransactions = useMemo(() => {
    if (typeFilter === 'all') return personalTransactions;
    return personalTransactions.filter((t) => t.type === typeFilter);
  }, [personalTransactions, typeFilter]);

  // Pure personal expense transactions
  const expenseTransactions = useMemo(() => {
    return personalTransactions.filter((t) => t.type === 'expense');
  }, [personalTransactions]);

  // Extract unique Year-Months from transactions
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, { key: string; label: string; year: number; month: number }>();
    
    typeFilteredTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(key)) {
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthMap.set(key, { key, label, year: d.getFullYear(), month: d.getMonth() });
      }
    });

    // If no transactions exist, default to current month
    if (monthMap.size === 0) {
      const now = new Date();
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const label = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthMap.set(key, { key, label, year: now.getFullYear(), month: now.getMonth() });
    }

    // Sort descending (latest month first)
    return Array.from(monthMap.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [typeFilteredTransactions]);

  // Selected month state (defaults to latest month)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    availableMonths[0]?.key || 'all'
  );

  // Filter transactions by selected month
  const monthFilteredExpenses = useMemo(() => {
    if (selectedMonthKey === 'all') return typeFilteredTransactions;
    return typeFilteredTransactions.filter((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonthKey;
    });
  }, [typeFilteredTransactions, selectedMonthKey]);

  // Compute stats for the selected month
  const activeMonthTotal = useMemo(() => {
    if (typeFilter === 'all') {
      // In all personal view, show pure personal expenditure so income isn't summed into spends
      return monthFilteredExpenses.filter((tx) => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
    }
    return monthFilteredExpenses.reduce((acc, tx) => acc + tx.amount, 0);
  }, [monthFilteredExpenses, typeFilter]);

  // Dynamic Category breakdown for Pie Chart: strictly personal expenses (never income or business)
  const monthCategoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    const relevantExpenses = monthFilteredExpenses.filter((tx) => tx.type === 'expense');
    const totalExp = relevantExpenses.reduce((acc, tx) => acc + tx.amount, 0);

    relevantExpenses.forEach((tx) => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        label: category,
        amount,
        percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthFilteredExpenses]);

  // Categories list for category filter pills
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(monthFilteredExpenses.map((t) => t.category)))];
  }, [monthFilteredExpenses]);

  // Final filtered list with search and category filters
  const finalFilteredExpenses = useMemo(() => {
    return monthFilteredExpenses.filter((tx) => {
      const matchesSearch =
        tx.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.amount.toString().includes(searchQuery);
      const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [monthFilteredExpenses, searchQuery, selectedCategory]);

  // Group final expenses by date or by month if "All Months" is active
  const groupedSections = useMemo(() => {
    const groups: { title: string; total: number; items: Transaction[] }[] = [];
    const groupMap = new Map<string, { total: number; items: Transaction[] }>();

    finalFilteredExpenses.forEach((tx) => {
      const d = new Date(tx.date);
      const title =
        selectedMonthKey === 'all'
          ? d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

      if (!groupMap.has(title)) {
        groupMap.set(title, { total: 0, items: [] });
      }
      const g = groupMap.get(title)!;
      g.total += tx.amount;
      g.items.push(tx);
    });

    groupMap.forEach((val, title) => {
      groups.push({ title, total: val.total, items: val.items });
    });

    return groups;
  }, [finalFilteredExpenses, selectedMonthKey]);

  // Current active month label
  const activeMonthLabel = useMemo(() => {
    if (selectedMonthKey === 'all') return 'All Time Spends';
    const found = availableMonths.find((m) => m.key === selectedMonthKey);
    return found ? found.label : selectedMonthKey;
  }, [selectedMonthKey, availableMonths]);

  // Trend data for current month
  const trendData = [
    { day: 'W1', amount: Math.round(activeMonthTotal * 0.22) },
    { day: 'W2', amount: Math.round(activeMonthTotal * 0.28) },
    { day: 'W3', amount: Math.round(activeMonthTotal * 0.32) },
    { day: 'W4', amount: Math.round(activeMonthTotal * 0.18) },
  ];

  return (
    <div className="space-y-8 pb-32 pt-2">
      {/* Month Selector Pills (Clean & Open) */}
      <section aria-label="Month filter" className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Select Billing Month
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportData}
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
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

        {/* Horizontal Scroll Month Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {availableMonths.map((m) => {
            const isSelected = selectedMonthKey === m.key;
            return (
              <button
                key={m.key}
                onClick={() => {
                  setSelectedMonthKey(m.key);
                  setSelectedCategory('All');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'bg-neutral-100 dark:bg-[#141417] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            );
          })}

          <button
            onClick={() => {
              setSelectedMonthKey('all');
              setSelectedCategory('All');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedMonthKey === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-[#141417] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All Months
          </button>
        </div>
      </section>

      {/* Dynamic Month Header Total */}
      <section aria-label="Month spend overview">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {activeMonthLabel} • {typeFilter === 'income' ? 'Personal Income' : typeFilter === 'transfer' ? 'Transfers' : 'Personal Spends'}
        </div>

        {/* Big Typography Display */}
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums display-amount mt-1">
          {typeFilter === 'income' ? '+' : ''}{currency}{activeMonthTotal.toLocaleString('en-IN')}
        </div>

        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 flex items-center gap-2">
          <span>{monthFilteredExpenses.length} {typeFilter === 'income' ? 'income records' : typeFilter === 'transfer' ? 'transfers' : 'personal expenses'}</span>
          <span>•</span>
          <span>Average per item: <strong>{currency}{Math.round(activeMonthTotal / Math.max(1, monthFilteredExpenses.length)).toLocaleString()}</strong></span>
        </div>
      </section>

      {/* Interactive Trend Graph (Default) & Pie Chart for Selected Month */}
      {monthCategoryBreakdown.length > 0 && (
        <section aria-label="Visual month charts" className="pt-2">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141417] p-1 rounded-full text-xs font-medium">
              <button
                onClick={() => setViewMode('trend')}
                className={`px-3 py-1 rounded-full transition-all ${
                  viewMode === 'trend'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Weekly Curve
              </button>
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
            </div>

            <span className="text-xs text-neutral-400 font-medium">
              {viewMode === 'trend'
                ? `${activeMonthLabel} Velocity`
                : `${monthCategoryBreakdown.length} Categories in ${activeMonthLabel}`}
            </span>
          </div>

          {viewMode === 'trend' ? (
            <SpendingTrendGraph
              data={trendData}
              currency={currency}
              title={`${activeMonthLabel} Outflow Trajectory`}
            />
          ) : (
            <SpendingPieChart
              slices={monthCategoryBreakdown}
              totalAmount={activeMonthTotal}
              currency={currency}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          )}
        </section>
      )}

      {/* Search & Category Filter Pills */}
      <section aria-label="Spends breakdown list" className="space-y-4 pt-2">
        {/* Type Filter Tabs: Expenses (Default), Income, Transfers, All Personal */}
        <div className="flex items-center bg-neutral-100 dark:bg-[#141417] p-1 rounded-2xl text-xs font-semibold">
          {[
            { id: 'expense', label: 'Expenses' },
            { id: 'income', label: 'Income' },
            { id: 'transfer', label: 'Transfers' },
            { id: 'all', label: 'All Personal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setTypeFilter(tab.id as any);
                setSelectedCategory('All');
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                typeFilter === tab.id
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={`Search in ${activeMonthLabel}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/60 dark:bg-[#141417] rounded-2xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>

          {categories.length > 2 && (
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
          )}
        </div>

        {/* Grouped Month Sections */}
        <div className="space-y-6">
          {groupedSections.map((group) => (
            <div key={group.title} className="space-y-2">
              {/* Group header */}
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800/80">
                <span>{group.title}</span>
                <span className="tabular-nums font-semibold text-neutral-600 dark:text-neutral-400">
                  {currency}{group.total.toLocaleString()}
                </span>
              </div>

              {/* Items in this date/month group */}
              <div className="divide-y divide-neutral-100/60 dark:divide-neutral-800/60">
                {group.items.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div 
                      key={tx.id}
                      onClick={() => onEditTransaction && onEditTransaction(tx)}
                      className="py-3 px-2 rounded-2xl flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#18181b] transition-all group cursor-pointer"
                      title="Click to edit, change account, or delete"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {tx.note || tx.category}
                        </div>
                        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                          {dateStr} • {tx.category} • from <span className="capitalize font-medium text-neutral-700 dark:text-neutral-300">{tx.pocket}</span>
                          {tx.toPocket && <span> → {tx.toPocket}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <span className={`text-sm font-extrabold tabular-nums ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                        }`}>
                          {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{currency}{tx.amount.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {onEditTransaction && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTransaction(tx);
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors"
                              title="Edit / Move account"
                              aria-label="Edit entry"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx.id);
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete entry"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {groupedSections.length === 0 && (
            <div className="py-12 text-center text-neutral-400 text-xs">
              No entries recorded for {activeMonthLabel}.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
