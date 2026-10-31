'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Edit3, 
  Check, 
  Laptop, 
  Layers, 
  TrendingUp,
  Landmark
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';

interface BusinessTrackerViewProps {
  summary: FinancialSummary;
  businessTransactions: Transaction[];
  currency?: string;
  onUpdateBusinessBalance: (newBalance: number) => void;
  onOpenQuickEntry: () => void;
  onTransferToPersonal: (amount: number) => void;
}

export function BusinessTrackerView({
  summary,
  businessTransactions,
  currency = '₹',
  onUpdateBusinessBalance,
  onOpenQuickEntry,
  onTransferToPersonal,
}: BusinessTrackerViewProps) {
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [manualCountInput, setManualCountInput] = useState(summary.businessBalance.toString());
  const [transferAmountInput, setTransferAmountInput] = useState('');
  const [showTransferBox, setShowTransferBox] = useState(false);

  const handleSaveManualCount = () => {
    const val = parseFloat(manualCountInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBusinessBalance(val);
      setIsEditingCount(false);
    }
  };

  const handleExecuteTransfer = () => {
    const val = parseFloat(transferAmountInput);
    if (!isNaN(val) && val > 0 && val <= summary.businessBalance) {
      onTransferToPersonal(val);
      setTransferAmountInput('');
      setShowTransferBox(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Hero Live Business Money Card */}
      <section 
        aria-label="Live business money overview"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Personal Division
              </span>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Live Business Money
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setManualCountInput(summary.businessBalance.toString());
              setIsEditingCount(!isEditingCount);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingCount ? 'Cancel' : 'Set Count'}
          </button>
        </div>

        {/* Live Count Display or Direct Edit Field */}
        <div className="mt-4 mb-4">
          {isEditingCount ? (
            <div className="flex items-center gap-2 max-w-xs">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-neutral-400">
                  {currency}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={manualCountInput}
                  onChange={(e) => setManualCountInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-2xl font-bold bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white tabular-nums"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSaveManualCount}
                className="py-2 px-3.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-semibold shadow-xs"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
                {currency}{summary.businessBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live business capital held • Manual tracking</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Pills */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <button
            onClick={onOpenQuickEntry}
            className="py-2.5 px-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/60 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            + Inflow
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="py-2.5 px-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/60 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
            - Tool Spend
          </button>

          <button
            onClick={() => setShowTransferBox(!showTransferBox)}
            className="py-2.5 px-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/60 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Draw to Bank
          </button>
        </div>

        {/* Slide-down Draw / Transfer Box */}
        {showTransferBox && (
          <div className="mt-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-200 dark:border-neutral-700/80 space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-neutral-500" />
              Transfer Business Funds to Personal Bank
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={`Amount in ${currency}...`}
                value={transferAmountInput}
                onChange={(e) => setTransferAmountInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white tabular-nums"
              />
              <button
                onClick={handleExecuteTransfer}
                disabled={!transferAmountInput || parseFloat(transferAmountInput) > summary.businessBalance}
                className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Transfer
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Business Metrics Grid */}
      <section aria-label="Business capital summary">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-neutral-400">Total Inflow</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              +{currency}{summary.businessMetrics.totalInflow.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-neutral-400">Revenue & milestone deposits</span>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-neutral-400">Draws to Personal</span>
            <div className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {currency}{summary.businessMetrics.transferredToPersonal.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-neutral-400">Transferred to savings/bank</span>
          </div>
        </div>
      </section>

      {/* Business Activity History */}
      <section aria-label="Business log">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Business Money History
          </h2>
          <span className="text-xs text-neutral-400">
            {businessTransactions.length} entries
          </span>
        </div>

        <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden shadow-xs">
          {businessTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div 
                key={tx.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    {isIncome ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : isTransfer ? (
                      <ArrowLeftRight className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <Laptop className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {tx.note || tx.category}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {dateStr} • {tx.category}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold tabular-nums ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                  }`}>
                    {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{currency}{tx.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}

          {businessTransactions.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No business transactions recorded yet. Tap <strong className="text-neutral-700 dark:text-neutral-200">+ Inflow</strong> to record your first business milestone.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
