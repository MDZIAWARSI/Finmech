'use client';

import React, { useState } from 'react';
import {
  Briefcase,
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
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction } from '@/types/finance';

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
}: BusinessTrackerViewProps) {
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

  const handleReallocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(reallocateAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (reallocateDirection === 'to_personal') {
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
      setNotification(`Moved ₹${amt.toLocaleString('en-IN')} to ${personalPocket === 'cash' ? 'Cash in Hand' : 'Personal Bank'}.`);
    } else {
      const available = personalPocket === 'cash' ? summary.cashInHand : summary.bankBalance;
      if (amt > available) {
        alert(`Amount exceeds available funds in ${personalPocket === 'cash' ? 'Cash' : 'Bank'}.`);
        return;
      }
      onAddTransaction({
        type: 'transfer',
        pocket: personalPocket,
        toPocket: 'business',
        category: 'Capital Allocation',
        amount: amt,
        date: new Date().toISOString(),
        note: reallocateNote.trim() || `Allocated capital to Business Division`,
      });
      setNotification(`Allocated ₹${amt.toLocaleString('en-IN')} to Business Division.`);
    }

    setReallocateAmount('');
    setReallocateNote('');
    setIsReallocateModalOpen(false);
    setTimeout(() => setNotification(null), 3000);
  };

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
      note: inflowNote.trim() || `${inflowCategory}`,
    });

    setInflowAmount('');
    setInflowNote('');
    setIsInflowModalOpen(false);
    setNotification(`Recorded +₹${amt.toLocaleString('en-IN')} inflow.`);
    setTimeout(() => setNotification(null), 3000);
  };

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
      note: spendNote.trim() || `${spendCategory}`,
    });

    setSpendAmount('');
    setSpendNote('');
    setIsSpendModalOpen(false);
    setNotification(`Recorded -₹${amt.toLocaleString('en-IN')} spend.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28">
      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-surface)] p-3.5 border border-[var(--border-color)] text-xs text-[var(--text-primary)] shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Hero: Business Money Division (Monochrome) */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Business Division Capital</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] mt-1.5 tracking-tight tabular-nums">
              ₹{summary.businessBalance.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed">
              Separated fund division for freelance projects, gigs, and tools — firewalled from daily personal expenditures.
            </p>
          </div>

          {/* Action Buttons: Minimal Monochrome */}
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            <button
              onClick={() => {
                setReallocateDirection('to_personal');
                setIsReallocateModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] px-4 py-2 text-xs font-bold hover:opacity-90 transition-all duration-120 active:scale-95 min-h-[38px]"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Reallocate</span>
            </button>

            <button
              onClick={() => setIsInflowModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[var(--bg-surface-elevated)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all duration-120 active:scale-95 min-h-[38px]"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Inflow</span>
            </button>

            <button
              onClick={() => setIsSpendModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[var(--bg-surface-elevated)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all duration-120 active:scale-95 min-h-[38px]"
            >
              <Minus className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              <span>Spend</span>
            </button>
          </div>
        </div>

        {/* Visual Capital Division Ratio Bar */}
        <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] mb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-3.5 w-3.5" />
              <span className="font-semibold text-[var(--text-primary)]">Division Ratio</span>
            </div>
            <span className="tabular-nums">
              Personal {personalShare}% • Division {divisionShare}%
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-[var(--bg-surface-elevated)] flex overflow-hidden">
            <div
              style={{ width: `${personalShare}%` }}
              className="bg-[var(--text-primary)] opacity-40 transition-[width] duration-300"
            />
            <div
              style={{ width: `${divisionShare}%` }}
              className="bg-[var(--text-primary)] transition-[width] duration-300"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Personal (Bank + Cash): <strong className="text-[var(--text-primary)] tabular-nums">₹{personalTotal.toLocaleString('en-IN')}</strong></span>
            <span>Division: <strong className="text-[var(--text-primary)] tabular-nums">₹{businessTotal.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Minimal Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-2xl bg-[var(--bg-surface)] p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)]">Division Inflow</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            +₹{(summary.businessDivision?.totalInflow || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">Earnings & gigs</span>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)]">Division Spends</span>
          <p className="text-lg font-black text-red-600 dark:text-red-400 mt-1 tabular-nums">
            -₹{(summary.businessDivision?.totalOutflow || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">Tools & software</span>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)]">Drawn to Personal</span>
          <p className="text-lg font-black text-[var(--text-primary)] mt-1 tabular-nums">
            ₹{(summary.businessDivision?.drawnToPersonal || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">Profit transferred out</span>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)]">Seeded Capital</span>
          <p className="text-lg font-black text-[var(--text-primary)] mt-1 tabular-nums">
            ₹{(summary.businessDivision?.allocatedFromPersonal || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">Funds added in</span>
        </div>
      </div>

      {/* Minimal Purpose Callout */}
      <div className="rounded-2xl bg-[var(--bg-surface)] p-4 border border-[var(--border-color)] flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Keeping business money in its own division ensures work earnings and tool costs never distort your personal daily burn rate.
        </p>
      </div>

      {/* Division Activity Ledger */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Division Ledger</h3>
            <p className="text-xs text-[var(--text-muted)]">Activity recorded for this division</p>
          </div>

          {/* Minimal Filter Tabs */}
          <div className="flex items-center gap-1">
            {(['all', 'income', 'expense', 'transfer'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all min-h-[30px] ${
                  filterType === type
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {type === 'all' ? 'All' : type === 'income' ? 'Inflows' : type === 'expense' ? 'Spends' : 'Transfers'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 divide-y divide-[var(--border-color)]">
          {filteredTransactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-[var(--text-secondary)]">
              No transactions in this view.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 px-1 hover:bg-[var(--bg-surface-elevated)] rounded-xl transition-colors duration-120"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]">
                      {isIncome ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isExpense ? (
                        <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <ArrowRightLeft className="h-4 w-4 text-[var(--text-secondary)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {tx.note || tx.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)]">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-bold tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isExpense
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-[var(--text-secondary)]'
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

      {/* Reallocate Modal */}
      {isReallocateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Fund Reallocation</h3>
              <button
                onClick={() => setIsReallocateModalOpen(false)}
                className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReallocateSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReallocateDirection('to_personal')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    reallocateDirection === 'to_personal'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  Division → Personal
                </button>
                <button
                  type="button"
                  onClick={() => setReallocateDirection('to_business')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    reallocateDirection === 'to_business'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  Personal → Division
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPersonalPocket('bank')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    personalPocket === 'bank'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Personal Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPersonalPocket('cash')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    personalPocket === 'cash'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Cash in Hand</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={reallocateAmount}
                  onChange={(e) => setReallocateAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReallocateModalOpen(false)}
                  className="flex-1 rounded-xl bg-[var(--bg-surface-elevated)] py-2.5 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[var(--text-primary)] text-[var(--bg-page)] py-2.5 text-xs font-bold hover:opacity-90"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inflow Modal */}
      {isInflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">+ Division Inflow</h3>
              <button onClick={() => setIsInflowModalOpen(false)} className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleInflowSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={inflowAmount}
                  onChange={(e) => setInflowAmount(e.target.value)}
                  placeholder="5000"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Category</label>
                <select
                  value={inflowCategory}
                  onChange={(e) => setInflowCategory(e.target.value)}
                  className="w-full rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Freelance & Gigs">Freelance & Gigs</option>
                  <option value="Client Project">Client Project</option>
                  <option value="Tutoring">Tutoring</option>
                  <option value="Digital Sales">Digital Sales</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsInflowModalOpen(false)}
                  className="flex-1 rounded-xl bg-[var(--bg-surface-elevated)] py-2.5 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 py-2.5 text-xs font-bold hover:opacity-90"
                >
                  Save Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spend Modal */}
      {isSpendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">- Division Spend</h3>
              <button onClick={() => setIsSpendModalOpen(false)} className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSpendSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="1200"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Category</label>
                <select
                  value={spendCategory}
                  onChange={(e) => setSpendCategory(e.target.value)}
                  className="w-full rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Software & Tools">Software & Tools</option>
                  <option value="Hosting & Domains">Hosting & Domains</option>
                  <option value="Gear & Supplies">Gear & Supplies</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSpendModalOpen(false)}
                  className="flex-1 rounded-xl bg-[var(--bg-surface-elevated)] py-2.5 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-600 text-white dark:bg-red-500 py-2.5 text-xs font-bold hover:opacity-90"
                >
                  Save Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
