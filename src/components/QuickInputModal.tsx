'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Banknote,
  Building2,
  Briefcase,
  ArrowRightLeft,
  Check,
  Send,
  Coffee,
  Bus,
  BookOpen,
  Laptop,
  Utensils,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction, TransactionType, PocketType } from '@/types/finance';
import { GeminiService } from '@/lib/gemini';

interface QuickInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  apiKey?: string;
}

const PRESETS = [
  { label: 'Chai / Coffee', amount: 20, type: 'expense' as TransactionType, pocket: 'cash' as PocketType, category: 'Food & Dining', icon: Coffee },
  { label: 'Canteen Snack', amount: 80, type: 'expense' as TransactionType, pocket: 'cash' as PocketType, category: 'Food & Dining', icon: Utensils },
  { label: 'Bus / Auto Fare', amount: 50, type: 'expense' as TransactionType, pocket: 'cash' as PocketType, category: 'Commute & Travel', icon: Bus },
  { label: 'Xerox & Notes', amount: 40, type: 'expense' as TransactionType, pocket: 'cash' as PocketType, category: 'Education & Xerox', icon: BookOpen },
  { label: 'Meal (UPI)', amount: 180, type: 'expense' as TransactionType, pocket: 'bank' as PocketType, category: 'Food & Dining', icon: Utensils },
  { label: 'Freelance Payout', amount: 3500, type: 'income' as TransactionType, pocket: 'business' as PocketType, category: 'Client Project', icon: Laptop },
];

const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Commute & Travel',
    'Education & Xerox',
    'Hostel & Rent',
    'Shopping',
    'Subscriptions',
    'Entertainment',
    'Business OpEx',
    'Others',
  ],
  income: [
    'Client Project',
    'Tutoring / Gig',
    'Monthly Allowance',
    'Business Sales',
    'Cashback & Rewards',
    'Others',
  ],
  transfer: [
    'ATM Withdrawal (Bank → Cash)',
    'Business Profit Draw (Biz → Personal)',
    'Capital Investment (Personal → Biz)',
    'Bank Transfer',
  ],
};

export default function QuickInputModal({
  isOpen,
  onClose,
  onAddTransaction,
  apiKey,
}: QuickInputModalProps) {
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const [type, setType] = useState<TransactionType>('expense');
  const [pocket, setPocket] = useState<PocketType>('cash');
  const [toPocket, setToPocket] = useState<PocketType>('cash');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [note, setNote] = useState('');
  const [clientName, setClientName] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setType(preset.type);
    setPocket(preset.pocket);
    setCategory(preset.category);
    setAmount(preset.amount.toString());
    setNote(preset.label);
  };

  const handleNaturalParse = async () => {
    if (!naturalText.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await GeminiService.parseNaturalTransaction(naturalText, apiKey);
      if (parsed) {
        setType(parsed.type);
        setPocket(parsed.pocket);
        setAmount(parsed.amount.toString());
        setCategory(parsed.category);
        setNote(parsed.note);
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      type,
      pocket,
      toPocket: type === 'transfer' ? toPocket : undefined,
      category,
      amount: parsedAmount,
      date: new Date().toISOString(),
      note: note.trim() || `${type.toUpperCase()} in ${category}`,
      businessDetails:
        pocket === 'business'
          ? {
              clientName: clientName.trim() || undefined,
              status: type === 'income' ? 'received' : undefined,
            }
          : undefined,
    });

    if (type === 'income') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    setAmount('');
    setNote('');
    setNaturalText('');
    setClientName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <PlusCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Quick Log Transaction</h2>
              <p className="text-xs text-[var(--text-muted)]">Fast entry for cash, bank, & business</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-transform duration-150 active:scale-[0.94] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Natural Language AI Entry */}
        <div className="mt-4 rounded-2xl bg-[var(--bg-surface-elevated)] p-3.5 border border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} aria-hidden="true" />
            <span>Smart Natural Input</span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
              (e.g., &quot;Spent 120 on auto rickshaw via cash&quot;)
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNaturalParse();
                }
              }}
              placeholder="Type: 'spent 60 chai in cash'..."
              className="flex-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 min-h-[44px]"
              aria-label="Natural language transaction description"
            />
            <button
              type="button"
              onClick={handleNaturalParse}
              disabled={isParsing || !naturalText.trim()}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              aria-label="Parse transaction text"
            >
              {isParsing ? (
                <span className="animate-pulse">Parsing...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Parse</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rapid Preset Chips */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-2 flex items-center justify-between">
            <span>⚡ Student & Founder Presets</span>
            <span className="text-[10px]">1-Tap Fill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="flex items-center gap-2 rounded-2xl bg-[var(--bg-surface-elevated)] p-2.5 border border-[var(--border-color)] text-left hover:border-emerald-500/50 transition-transform duration-150 active:scale-[0.96] min-h-[48px]"
                  aria-label={`Preset ${p.label}: ${p.amount} rupees`}
                >
                  <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-[var(--text-primary)] text-[11px]">{p.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)] tabular-nums">
                      {p.type === 'income' ? '+' : '-'}₹{p.amount} • {p.pocket}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Flow Type: Expense / Income / Transfer */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Flow Type</label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory(CATEGORIES.expense[0]);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-transform duration-150 active:scale-[0.96] min-h-[40px] ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-pressed={type === 'expense'}
              >
                <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory(CATEGORIES.income[0]);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-transform duration-150 active:scale-[0.96] min-h-[40px] ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-pressed={type === 'income'}
              >
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Income</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('transfer');
                  setCategory(CATEGORIES.transfer[0]);
                  setPocket('bank');
                  setToPocket('cash');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-transform duration-150 active:scale-[0.96] min-h-[40px] ${
                  type === 'transfer'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-pressed={type === 'transfer'}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Pocket Selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              {type === 'transfer' ? 'From Pocket' : 'Account / Pocket'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPocket('cash')}
                className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                  pocket === 'cash'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-500 ring-1 ring-amber-500/30'
                    : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
                aria-pressed={pocket === 'cash'}
              >
                <Banknote className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span>Cash in Hand</span>
              </button>
              <button
                type="button"
                onClick={() => setPocket('bank')}
                className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                  pocket === 'bank'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500 ring-1 ring-indigo-500/30'
                    : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
                aria-pressed={pocket === 'bank'}
              >
                <Building2 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                <span>Bank / UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setPocket('business')}
                className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                  pocket === 'business'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500 ring-1 ring-cyan-500/30'
                    : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
                aria-pressed={pocket === 'business'}
              >
                <Briefcase className="h-4 w-4 text-cyan-500" aria-hidden="true" />
                <span>Biz Division</span>
              </button>
            </div>
          </div>

          {/* If Transfer: Destination Pocket */}
          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">To Pocket</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setToPocket('cash')}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold min-h-[44px] ${
                    toPocket === 'cash'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                  aria-pressed={toPocket === 'cash'}
                >
                  <Banknote className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  <span>Cash in Hand</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToPocket('bank')}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold min-h-[44px] ${
                    toPocket === 'bank'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                  aria-pressed={toPocket === 'bank'}
                >
                  <Building2 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  <span>Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToPocket('business')}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold min-h-[44px] ${
                    toPocket === 'business'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                  aria-pressed={toPocket === 'business'}
                >
                  <Briefcase className="h-4 w-4 text-cyan-500" aria-hidden="true" />
                  <span>Biz Division</span>
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[var(--text-muted)] select-none">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] py-3.5 pl-10 pr-4 text-xl font-extrabold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 tabular-nums min-h-[48px]"
                aria-label="Transaction amount in rupees"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-3 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 min-h-[44px]"
              aria-label="Transaction category"
            >
              {CATEGORIES[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Venture Tag if Business */}
          {pocket === 'business' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Project / Venture Tag (Optional)</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Portfolio site, side gig, design work"
                className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-primary)] min-h-[44px]"
              />
            </div>
          )}

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Note / Memo</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch with roommates, printing assignments"
              className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-primary)] min-h-[44px]"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 py-4 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-transform duration-150 active:scale-[0.96] min-h-[48px]"
          >
            <Check className="h-5 w-5" aria-hidden="true" />
            <span>Save to FINMECH</span>
          </button>
        </form>
      </div>
    </div>
  );
}
