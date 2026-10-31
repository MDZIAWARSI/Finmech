'use client';

import React, { useState } from 'react';
import {
  Banknote,
  ArrowRightLeft,
  Coins,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction } from '@/types/finance';

interface CashInHandViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenQuickAdd: () => void;
}

const DENOMINATIONS = [500, 200, 100, 50, 20, 10];

export default function CashInHandView({
  summary,
  transactions,
  onAddTransaction,
  onOpenQuickAdd,
}: CashInHandViewProps) {
  // Cash Denomination Audit State
  const [counts, setCounts] = useState<Record<number, number>>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
  });
  const [coinsAmount, setCoinsAmount] = useState<string>('0');
  const [auditSuccessMsg, setAuditSuccessMsg] = useState<string | null>(null);

  const cashTransactions = transactions.filter(
    (t) => t.pocket === 'cash' || t.toPocket === 'cash'
  );

  // Compute audit total
  const countedNotesTotal = DENOMINATIONS.reduce((acc, denom) => {
    return acc + denom * (counts[denom] || 0);
  }, 0);
  const countedGrandTotal = countedNotesTotal + (parseFloat(coinsAmount) || 0);
  const variance = countedGrandTotal - summary.cashInHand;

  const handleDenomChange = (denom: number, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [denom]: Math.max(0, (prev[denom] || 0) + delta),
    }));
  };

  const handleQuickAtmWithdraw = (amount: number) => {
    onAddTransaction({
      type: 'transfer',
      pocket: 'bank',
      toPocket: 'cash',
      category: 'ATM Withdrawal',
      amount,
      date: new Date().toISOString(),
      note: `ATM Withdrawal of ₹${amount} to cash wallet`,
    });
    setAuditSuccessMsg(`Withdrew ₹${amount} from Bank to Cash wallet!`);
    setTimeout(() => setAuditSuccessMsg(null), 4000);
  };

  const handleReconcileVariance = () => {
    if (variance === 0) return;

    if (variance < 0) {
      const missingAmount = Math.abs(variance);
      onAddTransaction({
        type: 'expense',
        pocket: 'cash',
        category: 'Untracked Cash Spend',
        amount: missingAmount,
        date: new Date().toISOString(),
        note: `Physical cash audit adjustment (untracked spends/tips)`,
      });
      setAuditSuccessMsg(
        `Wallet balanced! Logged ₹${missingAmount} as untracked cash expense.`
      );
    } else {
      onAddTransaction({
        type: 'income',
        pocket: 'cash',
        category: 'Cash Inflow Adjustment',
        amount: variance,
        date: new Date().toISOString(),
        note: `Physical cash audit adjustment (found cash)`,
      });
      setAuditSuccessMsg(`Wallet balanced! Added ₹${variance} extra cash.`);
    }

    setTimeout(() => setAuditSuccessMsg(null), 4000);
  };

  const handleResetAudit = () => {
    setCounts({ 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0 });
    setCoinsAmount('0');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Feedback banner */}
      {auditSuccessMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 p-4 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
          <span className="font-semibold">{auditSuccessMsg}</span>
        </div>
      )}

      {/* Hero Cash Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <Banknote className="h-4 w-4" aria-hidden="true" />
              <span>Physical Pocket Money</span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-amber-500 mt-2 tracking-tight tabular-nums">
              ₹{summary.cashInHand.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Live count of paper notes & coins in your wallet right now.
            </p>
          </div>

          {/* Quick ATM Top-ups */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)] w-full sm:w-auto">
              ATM Refill:
            </span>
            {[500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAtmWithdraw(amt)}
                className="flex items-center gap-1.5 rounded-2xl bg-[var(--bg-surface-elevated)] px-3.5 py-2.5 text-xs font-bold text-amber-500 border border-[var(--border-color)] hover:border-amber-500/40 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
                aria-label={`Withdraw ₹${amt} from Bank to Cash Wallet`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tabular-nums">+₹{amt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Denomination Audit Tool */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Physical Wallet Note Counter & Leak Detector
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Count your physical notes to catch untracked chai, snacks, auto, or xerox spends
            </p>
          </div>

          <button
            onClick={handleResetAudit}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[36px]"
            aria-label="Reset denomination counts"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Counts</span>
          </button>
        </div>

        {/* Denomination Rows - Optimized for Mobile Thumb Taps */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {DENOMINATIONS.map((denom) => {
            const count = counts[denom] || 0;
            const subtotal = denom * count;
            return (
              <div
                key={denom}
                className="rounded-2xl bg-[var(--bg-surface-elevated)] p-3 border border-[var(--border-color)] flex flex-col items-center text-center shadow-sm"
              >
                <span className="text-xs font-bold text-[var(--text-secondary)]">₹{denom} Note</span>
                <span className="text-lg font-black text-amber-500 my-1 tabular-nums">
                  {count} <span className="text-[10px] text-[var(--text-muted)] font-normal">pcs</span>
                </span>
                <span className="text-[11px] text-[var(--text-secondary)] mb-2 font-semibold tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>

                <div className="flex items-center gap-2 w-full justify-center">
                  <button
                    onClick={() => handleDenomChange(denom, -1)}
                    disabled={count <= 0}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-amber-500/40 disabled:opacity-30 transition-transform duration-150 active:scale-[0.94]"
                    aria-label={`Decrease ₹${denom} count`}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleDenomChange(denom, 1)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-transform duration-150 active:scale-[0.94] shadow-sm shadow-amber-500/20"
                    aria-label={`Increase ₹${denom} count`}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coins Input & Audit Results Summary */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Coins & Loose Change (₹)
            </label>
            <input
              type="number"
              min="0"
              value={coinsAmount}
              onChange={(e) => setCoinsAmount(e.target.value)}
              className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
              aria-label="Coins and loose change amount in rupees"
            />
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-3.5 border border-[var(--border-color)] text-center">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Physical Count vs App Balance
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm font-extrabold text-[var(--text-primary)] tabular-nums">
                Counted: ₹{countedGrandTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[var(--text-muted)]">vs</span>
              <span className="text-sm font-extrabold text-amber-500 tabular-nums">
                App: ₹{summary.cashInHand.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            {variance === 0 ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-2.5 rounded-2xl border border-emerald-500/30">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>100% Balanced</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    variance < 0
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="tabular-nums">
                    Variance: {variance > 0 ? '+' : ''}₹{variance}
                  </span>
                </div>
                <button
                  onClick={handleReconcileVariance}
                  className="w-full sm:w-auto block ml-auto text-xs font-bold rounded-2xl bg-amber-500 px-4 py-2.5 text-slate-950 hover:bg-amber-400 transition-transform duration-150 active:scale-[0.96] shadow-md shadow-amber-500/20 min-h-[44px]"
                  aria-label="Reconcile Cash Variance"
                >
                  Reconcile Difference
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cash Transactions Ledger */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Cash Activity Stream</h3>
            <p className="text-xs text-[var(--text-muted)]">History of physical cash out & in</p>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 rounded-2xl bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-500 border border-amber-500/30 hover:bg-amber-500/25 transition-transform duration-150 active:scale-[0.96] min-h-[40px]"
            aria-label="Add Cash Entry"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Cash Entry</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-[var(--border-color)]">
          {cashTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--text-secondary)]">
              No cash transactions yet.
            </p>
          ) : (
            cashTransactions.map((tx) => {
              const isInflow =
                tx.type === 'income' || (tx.type === 'transfer' && tx.toPocket === 'cash');
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 hover:bg-[var(--bg-surface-elevated)] px-2 rounded-2xl transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isInflow
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      <Banknote className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {tx.note || tx.category}
                      </p>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {tx.category} • {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold tabular-nums ${
                        isInflow ? 'text-emerald-500' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {isInflow ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
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
