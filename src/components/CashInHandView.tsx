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
  Calendar,
  History,
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

  // Filter transactions for cash pocket
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
      // Missing physical cash: log untracked cash leak
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
      // Found extra cash
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
    <div className="space-y-6 pb-20">
      {/* Feedback banner */}
      {auditSuccessMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/80 p-4 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{auditSuccessMsg}</span>
        </div>
      )}

      {/* Hero Cash Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-[#0d1322] to-slate-900 p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Banknote className="h-4 w-4" />
              <span>Physical Pocket Money</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              ₹{summary.cashInHand.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Live count of paper notes & coins in your wallet right now.
            </p>
          </div>

          {/* Quick ATM Top-ups */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 w-full sm:w-auto">Quick ATM Refill:</span>
            {[500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAtmWithdraw(amt)}
                className="flex items-center gap-1 rounded-xl bg-slate-900/90 px-3 py-2 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <ArrowRightLeft className="h-3 w-3" />
                <span>+₹{amt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Denomination Audit Tool */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold text-slate-100">
                Wallet Note Counter & Leak Detector
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Count your physical notes to catch untracked chai, snack, or parking spends
            </p>
          </div>

          <button
            onClick={handleResetAudit}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Counts</span>
          </button>
        </div>

        {/* Denomination Rows */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DENOMINATIONS.map((denom) => {
            const count = counts[denom] || 0;
            const subtotal = denom * count;
            return (
              <div
                key={denom}
                className="rounded-2xl bg-slate-900/80 p-3 border border-slate-800 flex flex-col items-center text-center"
              >
                <span className="text-xs font-bold text-slate-400">₹{denom} Note</span>
                <span className="text-base font-extrabold text-amber-300 my-1">
                  {count} <span className="text-[10px] text-slate-500 font-normal">pcs</span>
                </span>
                <span className="text-[10px] text-slate-400 mb-2">₹{subtotal.toLocaleString('en-IN')}</span>

                <div className="flex items-center gap-1.5 w-full justify-center">
                  <button
                    onClick={() => handleDenomChange(denom, -1)}
                    disabled={count <= 0}
                    className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDenomChange(denom, 1)}
                    className="p-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coins Input & Audit Results Summary */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Coins & Loose Change (₹)
            </label>
            <input
              type="number"
              min="0"
              value={coinsAmount}
              onChange={(e) => setCoinsAmount(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-3.5 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Physical Count vs App Balance</span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-sm font-bold text-white">
                Counted: ₹{countedGrandTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-600">vs</span>
              <span className="text-sm font-bold text-amber-400">
                App: ₹{summary.cashInHand.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            {variance === 0 ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/30">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Balanced</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                    variance < 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>
                    Variance: {variance > 0 ? '+' : ''}₹{variance}
                  </span>
                </div>
                <button
                  onClick={handleReconcileVariance}
                  className="w-full sm:w-auto block ml-auto text-xs font-bold rounded-xl bg-amber-500 px-3.5 py-1.5 text-slate-950 hover:bg-amber-400 shadow-md"
                >
                  Reconcile Difference
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cash Transactions Ledger */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Cash Activity Stream</h3>
            <p className="text-xs text-slate-400">History of physical cash in and out</p>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Cash Entry</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-800/60">
          {cashTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No cash transactions yet.</p>
          ) : (
            cashTransactions.map((tx) => {
              const isInflow = tx.type === 'income' || (tx.type === 'transfer' && tx.toPocket === 'cash');
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 hover:bg-slate-800/20 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isInflow ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      <Banknote className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{tx.note || tx.category}</p>
                      <span className="text-[11px] text-slate-400">{tx.category} • {new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        isInflow ? 'text-emerald-400' : 'text-slate-200'
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

