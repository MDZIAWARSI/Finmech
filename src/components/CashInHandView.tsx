'use client';

import React, { useState } from 'react';
import {
  Banknote,
  ArrowRightLeft,
  Coins,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  RotateCcw,
  ArrowDownLeft,
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
}: CashInHandViewProps) {
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
      note: `ATM Cash Refill`,
    });
    setAuditSuccessMsg(`Withdrew ₹${amount} from Bank to Cash wallet.`);
    setTimeout(() => setAuditSuccessMsg(null), 3000);
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
        note: `Physical cash audit adjustment`,
      });
      setAuditSuccessMsg(`Balanced! Logged ₹${missingAmount} untracked expense.`);
    } else {
      onAddTransaction({
        type: 'income',
        pocket: 'cash',
        category: 'Cash Inflow Adjustment',
        amount: variance,
        date: new Date().toISOString(),
        note: `Physical cash audit adjustment`,
      });
      setAuditSuccessMsg(`Balanced! Logged +₹${variance} cash adjustment.`);
    }

    setTimeout(() => setAuditSuccessMsg(null), 3000);
  };

  const handleResetAudit = () => {
    setCounts({ 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0 });
    setCoinsAmount('0');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28">
      {/* Toast */}
      {auditSuccessMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] text-xs text-[var(--text-primary)] shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{auditSuccessMsg}</span>
        </div>
      )}

      {/* Hero Cash Balance Card (Minimal Monochrome) */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <Banknote className="h-3.5 w-3.5" />
              <span>Physical Pocket Money</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] mt-1.5 tracking-tight tabular-nums">
              ₹{summary.cashInHand.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Live count of paper notes & coins in your wallet right now.
            </p>
          </div>

          {/* Quick ATM Refills (Monochrome Pills) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            <span className="text-xs text-[var(--text-muted)] me-1">ATM Refill:</span>
            {[500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAtmWithdraw(amt)}
                className="flex items-center gap-1 rounded-full bg-[var(--bg-surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all duration-120 active:scale-95 min-h-[34px]"
              >
                <ArrowRightLeft className="h-3 w-3 text-[var(--text-muted)]" />
                <span className="tabular-nums">+₹{amt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Physical Note Counter & Audit Tool */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-[var(--text-muted)]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Physical Wallet Note Counter
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Count actual physical notes to detect untracked chai, snack, or auto cash spends
            </p>
          </div>

          <button
            onClick={handleResetAudit}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors min-h-[30px]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Denomination Counter Grid (Minimal Monochrome) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {DENOMINATIONS.map((denom) => {
            const count = counts[denom] || 0;
            const subtotal = denom * count;
            return (
              <div
                key={denom}
                className="rounded-2xl bg-[var(--bg-surface-elevated)] p-3 border border-[var(--border-color)] flex flex-col items-center text-center"
              >
                <span className="text-[11px] font-medium text-[var(--text-muted)]">₹{denom} Note</span>
                <span className="text-lg font-black text-[var(--text-primary)] my-0.5 tabular-nums">
                  {count} <span className="text-[10px] text-[var(--text-muted)] font-normal">pcs</span>
                </span>
                <span className="text-[11px] text-[var(--text-secondary)] mb-2 font-semibold tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>

                <div className="flex items-center gap-1.5 w-full justify-center">
                  <button
                    onClick={() => handleDenomChange(denom, -1)}
                    disabled={count <= 0}
                    className="h-8 w-8 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] disabled:opacity-30 transition-all active:scale-90"
                    aria-label={`Decrease ₹${denom}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDenomChange(denom, 1)}
                    className="h-8 w-8 flex items-center justify-center rounded-xl bg-[var(--text-primary)] text-[var(--bg-page)] font-bold transition-all active:scale-90"
                    aria-label={`Increase ₹${denom}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coins Input Row */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--bg-surface-elevated)] px-4 py-2.5 border border-[var(--border-color)]">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Loose Coins Total (₹)</span>
          <input
            type="number"
            min="0"
            value={coinsAmount}
            onChange={(e) => setCoinsAmount(e.target.value)}
            style={{ fontSize: '16px' }}
            className="w-24 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] px-2.5 py-1 text-right text-xs font-bold text-[var(--text-primary)] tabular-nums focus:outline-none"
          />
        </div>

        {/* Audit Variance Summary (Subtle red for missing, subtle green for found, neutral for balanced) */}
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-[var(--text-muted)]">Counted Total vs Live App Balance</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-black text-[var(--text-primary)] tabular-nums">
                ₹{countedGrandTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                (App: ₹{summary.cashInHand.toLocaleString('en-IN')})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:text-left">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Variance</span>
              <p
                className={`text-sm font-black tabular-nums ${
                  variance === 0
                    ? 'text-[var(--text-primary)]'
                    : variance < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {variance === 0
                  ? 'Balanced'
                  : variance < 0
                  ? `-₹${Math.abs(variance).toLocaleString('en-IN')} (Missing)`
                  : `+₹${variance.toLocaleString('en-IN')} (Surplus)`}
              </p>
            </div>

            {variance !== 0 && (
              <button
                onClick={handleReconcileVariance}
                className="rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] px-4 py-2 text-xs font-bold hover:opacity-90 transition-all active:scale-95"
              >
                Reconcile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cash Ledger Activity */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)] pb-3 border-b border-[var(--border-color)]">
          Cash Wallet Activity
        </h3>

        <div className="mt-2 divide-y divide-[var(--border-color)]">
          {cashTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
              No cash transactions recorded.
            </div>
          ) : (
            cashTransactions.slice(0, 8).map((tx) => {
              const isIncome = tx.type === 'income' || tx.toPocket === 'cash';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 px-1 hover:bg-[var(--bg-surface-elevated)] rounded-xl transition-colors duration-120"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]">
                      {isIncome ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">-</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {tx.note || tx.category}
                      </p>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
