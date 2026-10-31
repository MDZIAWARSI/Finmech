'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  Plus,
  Minus,
  ArrowRightLeft,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  Banknote,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction, PocketType } from '@/types/finance';

interface BusinessTrackerViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenQuickAdd: () => void;
}

export default function BusinessTrackerView({
  summary,
  transactions,
  onAddTransaction,
  onOpenQuickAdd,
}: BusinessTrackerViewProps) {
  // Modal states
  const [isReallocateModalOpen, setIsReallocateModalOpen] = useState(false);
  const [reallocateDirection, setReallocateDirection] = useState<'to_business' | 'to_personal'>('to_personal');
  const [personalPocket, setPersonalPocket] = useState<'bank' | 'cash'>('bank');
  const [reallocateAmount, setReallocateAmount] = useState('');
  const [reallocateNote, setReallocateNote] = useState('');

  const [isInflowModalOpen, setIsInflowModalOpen] = useState(false);
  const [inflowAmount, setInflowAmount] = useState('');
  const [inflowCategory, setInflowCategory] = useState('Freelance & Gigs');
  const [inflowNote, setInflowNote] = useState('');

  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [spendAmount, setSpendAmount] = useState('');
  const [spendCategory, setSpendCategory] = useState('Software & Tools');
  const [spendNote, setSpendNote] = useState('');

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Business division transactions (where pocket is business or toPocket is business)
  const businessTransactions = transactions.filter(
    (t) => t.pocket === 'business' || t.toPocket === 'business'
  );

  const filteredTransactions = businessTransactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const personalTotal = Math.max(0, summary.bankBalance) + Math.max(0, summary.cashInHand);
  const businessTotal = Math.max(0, summary.businessBalance);
  const divisionShare = summary.businessDivision?.divisionShare ?? 0;
  const personalShare = summary.businessDivision?.personalShare ?? 100;

  // Handle Fund Reallocation (Personal <-> Business)
  const handleReallocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(reallocateAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (reallocateDirection === 'to_personal') {
      // Withdrawing from Business Division to Personal
      if (amt > summary.businessBalance) {
        alert('Amount exceeds available Business Division capital.');
        return;
      }
      onAddTransaction({
        type: 'transfer',
        pocket: 'business',
        toPocket: personalPocket,
        category: 'Personal Draw / Profit',
        amount: amt,
        date: new Date().toISOString(),
        note: reallocateNote.trim() || `Moved profit to ${personalPocket === 'cash' ? 'Cash in Hand' : 'Personal Bank'}`,
      });
      setNotification(`Transferred ₹${amt.toLocaleString('en-IN')} from Business Division to ${personalPocket === 'cash' ? 'Cash in Hand' : 'Personal Bank'}.`);
    } else {
      // Adding capital from Personal to Business Division
      const available = personalPocket === 'cash' ? summary.cashInHand : summary.bankBalance;
      if (amt > available) {
        alert(`Amount exceeds available funds in ${personalPocket === 'cash' ? 'Cash in Hand' : 'Personal Bank'}.`);
        return;
      }
      onAddTransaction({
        type: 'transfer',
        pocket: personalPocket,
        toPocket: 'business',
        category: 'Capital Allocation',
        amount: amt,
        date: new Date().toISOString(),
        note: reallocateNote.trim() || `Allocated capital from ${personalPocket === 'cash' ? 'Cash' : 'Bank'} to Business Division`,
      });
      setNotification(`Allocated ₹${amt.toLocaleString('en-IN')} from ${personalPocket === 'cash' ? 'Cash' : 'Bank'} to Business Division.`);
    }

    setReallocateAmount('');
    setReallocateNote('');
    setIsReallocateModalOpen(false);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Direct Inflow into Business Division
  const handleInflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(inflowAmount);
    if (isNaN(amt) || amt <= 0) return;

    onAddTransaction({
      type: 'income',
      pocket: 'business',
      category: inflowCategory,
      amount: amt,
      date: new Date().toISOString(),
      note: inflowNote.trim() || `${inflowCategory} payout`,
    });

    setInflowAmount('');
    setInflowNote('');
    setIsInflowModalOpen(false);
    setNotification(`Added ₹${amt.toLocaleString('en-IN')} inflow to Business Division.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Direct Spend from Business Division
  const handleSpendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(spendAmount);
    if (isNaN(amt) || amt <= 0) return;

    onAddTransaction({
      type: 'expense',
      pocket: 'business',
      category: spendCategory,
      amount: amt,
      date: new Date().toISOString(),
      note: spendNote.trim() || `${spendCategory} expense`,
    });

    setSpendAmount('');
    setSpendNote('');
    setIsSpendModalOpen(false);
    setNotification(`Logged ₹${amt.toLocaleString('en-IN')} spend from Business Division.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Dynamic Toast Feedback */}
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-cyan-500/15 p-4 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500" aria-hidden="true" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Hero: Business Money Division (User Perspective) */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              <span>Business Money Division</span>
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-cyan-500 mt-2 tracking-tight tabular-nums">
              ₹{summary.businessBalance.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-lg leading-relaxed">
              Separated fund division for your work, freelance gigs & side-projects — protected from your daily personal expenditures.
            </p>
          </div>

          {/* Quick Action Buttons (Thumb-friendly tactile buttons) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => {
                setReallocateDirection('to_personal');
                setIsReallocateModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-2xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              aria-label="Reallocate or transfer funds between personal and business"
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              <span>Reallocate Funds</span>
            </button>

            <button
              onClick={() => setIsInflowModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-[var(--bg-surface-elevated)] px-3.5 py-2.5 text-xs font-bold text-emerald-500 border border-[var(--border-color)] hover:border-emerald-500/40 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              aria-label="Add Inflow to Business Division"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>+ Inflow</span>
            </button>

            <button
              onClick={() => setIsSpendModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-[var(--bg-surface-elevated)] px-3.5 py-2.5 text-xs font-bold text-rose-500 border border-[var(--border-color)] hover:border-rose-500/40 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              aria-label="Log Spend from Business Division"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
              <span>- Spend</span>
            </button>
          </div>
        </div>

        {/* Visual Capital Division Bar (Personal vs Business) */}
        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] mb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-cyan-500" aria-hidden="true" />
              <span className="font-bold text-[var(--text-primary)]">Capital Division Ratio</span>
            </div>
            <span className="tabular-nums">
              Personal {personalShare}% • Business Division {divisionShare}%
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-[var(--bg-surface-elevated)] flex overflow-hidden p-0.5 border border-[var(--border-color)]">
            <div
              style={{ width: `${personalShare}%` }}
              className="bg-indigo-500 rounded-l-full transition-[width] duration-300"
              title={`Personal Funds: ${personalShare}%`}
            />
            <div
              style={{ width: `${divisionShare}%` }}
              className="bg-cyan-500 rounded-r-full transition-[width] duration-300"
              title={`Business Division: ${divisionShare}%`}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" aria-hidden="true" />
              <span className="text-[var(--text-secondary)]">Personal (Bank + Cash):</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">
                ₹{personalTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" aria-hidden="true" />
              <span className="text-[var(--text-secondary)]">Business Division:</span>
              <span className="font-bold text-cyan-500 tabular-nums">
                ₹{businessTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Division Metrics Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Inflows to Division */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Division Inflows</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-500 mt-2 tabular-nums">
            +₹{(summary.businessDivision?.totalInflow || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Earnings & gigs received</p>
        </div>

        {/* Division Work Spends */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Division Spends</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-500 mt-2 tabular-nums">
            -₹{(summary.businessDivision?.totalOutflow || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Tools, hosting & costs</p>
        </div>

        {/* Drawn to Personal */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Drawn to Personal</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-indigo-500 mt-2 tabular-nums">
            ₹{(summary.businessDivision?.drawnToPersonal || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Profit moved to bank/cash</p>
        </div>

        {/* Capital Seeded from Personal */}
        <div className="rounded-3xl bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Seeded from Personal</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-cyan-500 mt-2 tabular-nums">
            ₹{(summary.businessDivision?.allocatedFromPersonal || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Initial capital allocated</p>
        </div>
      </div>

      {/* Purpose & Firewalled Capital Tip */}
      <div className="rounded-3xl bg-[var(--bg-surface-elevated)] p-4 sm:p-5 border border-[var(--border-color)] flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-500">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[var(--text-primary)]">Why Keep This Division?</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            By segregating your business funds into its own division, you prevent work earnings from inflating your daily spending budget. Your personal daily burn rate remains clean and realistic.
          </p>
        </div>
      </div>

      {/* Division Activity Ledger */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Division Activity Ledger</h3>
            <p className="text-xs text-[var(--text-muted)]">
              All inflows, project spends & transfers involving your business division
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {(['all', 'income', 'expense', 'transfer'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-150 min-h-[36px] ${
                  filterType === type
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {type === 'all' ? 'All Activity' : type === 'income' ? 'Inflows' : type === 'expense' ? 'Spends' : 'Transfers'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 divide-y divide-[var(--border-color)]">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
              No division activity matches this filter.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 hover:bg-[var(--bg-surface-elevated)] px-2 rounded-2xl transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : isExpense
                          ? 'bg-rose-500/15 text-rose-500'
                          : 'bg-indigo-500/15 text-indigo-500'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-5 w-5" aria-hidden="true" />
                      ) : isExpense ? (
                        <Minus className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <ArrowRightLeft className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {tx.note || tx.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)]">
                        <span>{tx.category}</span>
                        {isTransfer && (
                          <span className="text-cyan-500 font-medium">
                            {tx.pocket === 'business'
                              ? `→ To ${tx.toPocket === 'cash' ? 'Cash in Hand' : 'Personal Bank'}`
                              : `← From ${tx.pocket === 'cash' ? 'Cash in Hand' : 'Personal Bank'}`}
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold tabular-nums ${
                        isIncome
                          ? 'text-emerald-500'
                          : isExpense
                          ? 'text-rose-500'
                          : 'text-indigo-500'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : '⇄ '}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reallocate / Fund Transfer Modal (Mobile Bottom-Sheet on small screens) */}
      {isReallocateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Grab Bar for Mobile */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border-color)] sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Fund Reallocation</h3>
                <p className="text-xs text-[var(--text-muted)]">Move money between Personal and Business</p>
              </div>
              <button
                onClick={() => setIsReallocateModalOpen(false)}
                className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReallocateSubmit} className="mt-4 space-y-4">
              {/* Direction Toggle */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Transfer Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReallocateDirection('to_personal')}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                      reallocateDirection === 'to_personal'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-sm'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Business → Personal (Draw)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReallocateDirection('to_business')}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                      reallocateDirection === 'to_business'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-sm'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Personal → Business (Seed)
                  </button>
                </div>
              </div>

              {/* Personal Pocket Selector */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  {reallocateDirection === 'to_personal' ? 'Send To Personal Pocket:' : 'Take From Personal Pocket:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPersonalPocket('bank')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold border transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                      personalPocket === 'bank'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Personal Bank (₹{summary.bankBalance.toLocaleString('en-IN')})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersonalPocket('cash')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold border transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                      personalPocket === 'cash'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Banknote className="h-4 w-4" />
                    <span>Cash in Hand (₹{summary.cashInHand.toLocaleString('en-IN')})</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  <label htmlFor="reallocate-amount">Amount (₹)</label>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Max:{' '}
                    {reallocateDirection === 'to_personal'
                      ? `₹${summary.businessBalance.toLocaleString('en-IN')}`
                      : `₹${(personalPocket === 'cash' ? summary.cashInHand : summary.bankBalance).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <input
                  id="reallocate-amount"
                  type="number"
                  required
                  value={reallocateAmount}
                  onChange={(e) => setReallocateAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>

              {/* Quick Amount Preset Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[500, 1000, 2000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReallocateAmount(preset.toString())}
                    className="rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-cyan-500 min-h-[36px]"
                  >
                    +₹{preset}
                  </button>
                ))}
              </div>

              {/* Optional Note */}
              <div>
                <label htmlFor="reallocate-note" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Note (Optional)
                </label>
                <input
                  id="reallocate-note"
                  type="text"
                  value={reallocateNote}
                  onChange={(e) => setReallocateNote(e.target.value)}
                  placeholder={
                    reallocateDirection === 'to_personal'
                      ? 'e.g. Monthly freelance profit draw'
                      : 'e.g. Domain purchase seed'
                  }
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReallocateModalOpen(false)}
                  className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-transform duration-150 active:scale-[0.96] shadow-md shadow-cyan-500/20 min-h-[44px]"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inflow Modal */}
      {isInflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border-color)] sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">+ Business Division Inflow</h3>
                <p className="text-xs text-[var(--text-muted)]">Record earnings from gigs or freelance work</p>
              </div>
              <button
                onClick={() => setIsInflowModalOpen(false)}
                className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInflowSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={inflowAmount}
                  onChange={(e) => setInflowAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                <select
                  value={inflowCategory}
                  onChange={(e) => setInflowCategory(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                >
                  <option value="Freelance & Gigs">Freelance & Gigs</option>
                  <option value="Client Project">Client Project</option>
                  <option value="Tutoring">Tutoring & Mentorship</option>
                  <option value="Digital Sales">Digital Sales / Templates</option>
                  <option value="Side Hustle">Side Hustle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description Note</label>
                <input
                  type="text"
                  value={inflowNote}
                  onChange={(e) => setInflowNote(e.target.value)}
                  placeholder="e.g. UI Design milestone payout"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInflowModalOpen(false)}
                  className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
                >
                  Save Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Spend Modal */}
      {isSpendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border-color)] sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">- Business Division Spend</h3>
                <p className="text-xs text-[var(--text-muted)]">Record software, tools or project expenditure</p>
              </div>
              <button
                onClick={() => setIsSpendModalOpen(false)}
                className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSpendSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="e.g. 1200"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                <select
                  value={spendCategory}
                  onChange={(e) => setSpendCategory(e.target.value)}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                >
                  <option value="Software & Tools">Software & Tools</option>
                  <option value="Hosting & Domains">Hosting & Domains</option>
                  <option value="Equipment & Gear">Equipment & Gear</option>
                  <option value="Marketing & Ads">Marketing & Ads</option>
                  <option value="Work Supplies">Work Supplies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description Note</label>
                <input
                  type="text"
                  value={spendNote}
                  onChange={(e) => setSpendNote(e.target.value)}
                  placeholder="e.g. Cloud server monthly renewal"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSpendModalOpen(false)}
                  className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-rose-500 py-3 text-xs font-bold text-white hover:bg-rose-400 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
                >
                  Log Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
