'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Edit3, 
  Laptop, 
  TrendingUp,
  Landmark,
  Trash2
} from 'lucide-react';
import { FinancialSummary, Transaction } from '@/types/finance';

interface BusinessTrackerViewProps {
  summary: FinancialSummary;
  businessTransactions: Transaction[];
  currency?: string;
  onUpdateBusinessBalance: (newBalance: number) => void;
  onOpenQuickEntry: () => void;
  onTransferToPersonal: (amount: number) => void;
  onDeleteTransaction?: (id: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export function BusinessTrackerView({
  summary,
  businessTransactions,
  currency = '₹',
  onUpdateBusinessBalance,
  onOpenQuickEntry,
  onTransferToPersonal,
  onDeleteTransaction,
  onEditTransaction,
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
    <div className="space-y-8 pb-32 pt-2">
      {/* Hero Live Business Money: Borderless & High Whitespace */}
      <section aria-label="Live business money overview" className="pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Personal Division
          </span>

          <button
            onClick={() => {
              setManualCountInput(summary.businessBalance.toString());
              setIsEditingCount(!isEditingCount);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingCount ? 'Cancel' : 'Set Count'}
          </button>
        </div>

        {/* Amount Display or Inline Edit */}
        <div className="mt-2">
          {isEditingCount ? (
            <div className="flex items-center gap-2 max-w-xs pt-1">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-neutral-400">
                  {currency}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={manualCountInput}
                  onChange={(e) => setManualCountInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-3xl font-extrabold bg-neutral-100/70 dark:bg-[#141417] rounded-2xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white tabular-nums"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSaveManualCount}
                className="py-2.5 px-4 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-2xl text-xs font-bold shadow-xs"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums display-amount">
                {currency}{summary.businessBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live business capital held • Manual tracking only</span>
              </div>
            </div>
          )}
        </div>

        {/* 3 Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-6">
          <button
            onClick={onOpenQuickEntry}
            className="py-3 px-2 rounded-2xl bg-neutral-100/70 dark:bg-[#141417] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            + Inflow
          </button>

          <button
            onClick={onOpenQuickEntry}
            className="py-3 px-2 rounded-2xl bg-neutral-100/70 dark:bg-[#141417] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
            - Tool Spend
          </button>

          <button
            onClick={() => setShowTransferBox(!showTransferBox)}
            className="py-3 px-2 rounded-2xl bg-neutral-100/70 dark:bg-[#141417] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Draw to Bank
          </button>
        </div>

        {/* Slide-down Transfer Box */}
        {showTransferBox && (
          <div className="mt-4 p-4 rounded-2xl bg-neutral-100/60 dark:bg-[#141417] space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
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
                className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Transfer
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Business Metrics (Clean borderless two-column readout) */}
      <section aria-label="Business capital summary" className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Inflow</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              +{currency}{summary.businessMetrics.totalInflow.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-neutral-400">Revenue & milestone deposits</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Draws to Personal</span>
            <div className="text-2xl font-extrabold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {currency}{summary.businessMetrics.transferredToPersonal.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-neutral-400">Moved to personal savings</span>
          </div>
        </div>
      </section>

      {/* Business Money History List (Clean divide-y) */}
      <section aria-label="Business log" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Business Capital History
          </h2>
          <span className="text-xs text-neutral-400">
            {businessTransactions.length} items
          </span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
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
                onClick={() => onEditTransaction && onEditTransaction(tx)}
                className="py-3 px-2 rounded-2xl flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#18181b] transition-all group cursor-pointer"
                title="Click to edit, reassign account, or delete"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center shrink-0">
                    {isIncome ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : isTransfer ? (
                      <ArrowLeftRight className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <Laptop className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {tx.note || tx.category}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                      {dateStr} • {tx.category} • <span className="capitalize font-medium text-neutral-600 dark:text-neutral-300">{tx.pocket}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <div className="text-right">
                    <div className={`text-sm font-extrabold tabular-nums ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                    }`}>
                      {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{currency}{tx.amount.toLocaleString()}
                    </div>
                  </div>

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
                        aria-label="Edit transaction"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTransaction(tx.id);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete entry"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {businessTransactions.length === 0 && (
            <div className="py-12 text-center text-neutral-400 text-xs">
              No business transactions recorded yet. Tap <strong className="text-neutral-700 dark:text-neutral-200">+ Inflow</strong> to log your first business capital.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
