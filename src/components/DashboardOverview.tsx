'use client';

import React, { useState } from 'react';
import {
  Banknote,
  Briefcase,
  CreditCard,
  Sparkles,
  TrendingUp,
  TrendingDown,
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
    <div className="space-y-6 pb-20">
      {/* AI Spending Leak Highlight Banner */}
      {topLeak ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/40 p-5 border border-amber-500/30 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    AI Leak Scanner
                  </span>
                  <span className="text-xs text-slate-400">High Outflow Alert</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-1">
                  High spend detected in <span className="text-amber-400">{topLeak.category}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Consuming {topLeak.ratioOfExpenses}% of your monthly expenses (₹{topLeak.amount.toLocaleString('en-IN')}). FinMech AI found fixes to save up to ₹{Math.round(topLeak.amount * 0.35).toLocaleString('en-IN')}/mo.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shrink-0 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>View AI Savings Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">Finances On Track</p>
                <p className="text-xs text-slate-300">
                  Spending burn is balanced across all pockets. Total net liquidity is healthy.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>Ask AI Copilot</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Net Liquidity */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0d1322] p-5 border border-slate-800 shadow-xl group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Net Worth</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              ₹{summary.totalNetWorth.toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">Active Liquid Capital</span>
            </p>
          </div>
          {/* Distribution bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Distribution</span>
              <span>Cash {summary.pocketDistribution[0].percentage}% • Biz {summary.pocketDistribution[2].percentage}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 flex overflow-hidden">
              <div
                style={{ width: `${summary.pocketDistribution[0].percentage}%` }}
                className="bg-amber-400"
                title="Cash"
              />
              <div
                style={{ width: `${summary.pocketDistribution[1].percentage}%` }}
                className="bg-indigo-400"
                title="Bank"
              />
              <div
                style={{ width: `${summary.pocketDistribution[2].percentage}%` }}
                className="bg-cyan-400"
                title="Business"
              />
            </div>
          </div>
        </div>

        {/* 2. Cash in Hand Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0d1322] p-5 border border-slate-800 shadow-xl group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Cash in Hand</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-amber-300 tracking-tight">
              ₹{summary.cashInHand.toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Physical pocket money balance</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('cash')}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Audit Wallet</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <span className="text-[10px] text-slate-500">Live Count</span>
          </div>
        </div>

        {/* 3. Live Business Money Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0d1322] p-5 border border-slate-800 shadow-xl group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Live Business Money</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-cyan-300 tracking-tight">
              ₹{summary.businessBalance.toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-cyan-400 font-semibold">{summary.businessMetrics.profitMargin}% Margin</span>
              <span>• ₹{summary.businessMetrics.grossRevenue.toLocaleString('en-IN')} Rev</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('business')}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Business Hub</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <span className="text-[10px] text-slate-500">
              {summary.businessMetrics.pendingReceivables > 0
                ? `₹${summary.businessMetrics.pendingReceivables} Due`
                : 'No Dues'}
            </span>
          </div>
        </div>

        {/* 4. Monthly Expenditure Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0d1322] p-5 border border-slate-800 shadow-xl group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Month Burn Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-rose-300 tracking-tight">
              ₹{summary.monthlyExpenditure.toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              ₹{summary.dailyAverageSpend}/day avg burn rate
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('expenditure')}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>View Breakdown</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <span className="text-[10px] text-slate-500">
              {summary.categoryBreakdown.length} Categories
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Log Spend</span>
        </button>

        <button
          onClick={() => onNavigateTab('cash')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
            <Banknote className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Audit Cash</span>
        </button>

        <button
          onClick={() => onNavigateTab('business')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Business Sales</span>
        </button>

        <button
          onClick={() => onNavigateTab('ai')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Ask AI Copilot</span>
        </button>
      </div>

      {/* Live Transaction Activity Log */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Live Money Stream</h3>
            <p className="text-xs text-slate-400">Real-time ledger across cash, digital & business</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
              {['all', 'cash', 'bank', 'business'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPocket(p)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                    filterPocket === p
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-4 divide-y divide-slate-800/60">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">No transactions match your filter.</p>
              <button
                onClick={onOpenQuickAdd}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log First Transaction</span>
              </button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 group hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : isTransfer
                          ? 'bg-indigo-500/15 text-indigo-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="h-5 w-5" />
                      ) : isTransfer ? (
                        <TrendingUp className="h-5 w-5 rotate-45" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                          {tx.note || tx.category}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            tx.pocket === 'cash'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : tx.pocket === 'business'
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {tx.pocket}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {tx.businessDetails?.clientName && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">
                              Client: {tx.businessDetails.clientName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-bold ${
                          isIncome
                            ? 'text-emerald-400'
                            : isTransfer
                            ? 'text-indigo-300'
                            : 'text-slate-200'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '↔ ' : '-'}₹
                        {tx.amount.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-slate-500 capitalize">{tx.type}</span>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
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

