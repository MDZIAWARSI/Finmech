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
  ShoppingBag,
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

    // Celebration confetti on income or savings
    if (type === 'income') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    // Reset form
    setAmount('');
    setNote('');
    setNaturalText('');
    setClientName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-2xl shadow-emerald-950/40 max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Quick Log Transaction</h2>
              <p className="text-xs text-slate-400">Fast entry for cash, bank, & business money</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Natural Language AI Entry */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-indigo-950/30 p-3.5 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Smart Natural Input</span>
            <span className="text-[10px] text-slate-400 font-normal">
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
              placeholder="Type in plain words: 'spent 60 chai in cash'..."
              className="flex-1 rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleNaturalParse}
              disabled={isParsing || !naturalText.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
            >
              {isParsing ? (
                <span className="animate-pulse">Parsing...</span>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  <span>Parse</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rapid Preset Chips */}
        <div className="mt-4">
          <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center justify-between">
            <span>⚡ Student & Founder Presets</span>
            <span className="text-[10px] text-slate-500">Tap to auto-fill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="flex items-center gap-2 rounded-xl bg-slate-900/70 p-2 border border-slate-800 text-left hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-200 text-[11px]">{p.label}</p>
                    <p className="text-[10px] text-slate-400">
                      {p.type === 'income' ? '+' : '-'}₹{p.amount} • {p.pocket}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Selector: Expense / Income / Transfer */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Flow Type</label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory(CATEGORIES.expense[0]);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory(CATEGORIES.income[0]);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
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
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'transfer'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-400" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Pocket Bucket Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {type === 'transfer' ? 'From Pocket' : 'Account / Pocket'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPocket('cash')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  pocket === 'cash'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Banknote className="h-4 w-4 text-amber-400" />
                <span>Cash in Hand</span>
              </button>
              <button
                type="button"
                onClick={() => setPocket('bank')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  pocket === 'bank'
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span>Bank / UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setPocket('business')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  pocket === 'business'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <span>Business</span>
              </button>
            </div>
          </div>

          {/* If Transfer: Destination Pocket */}
          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">To Pocket</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setToPocket('cash')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                    toPocket === 'cash'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5 text-amber-400" />
                  <span>Cash in Hand</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToPocket('bank')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                    toPocket === 'bank'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToPocket('business')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                    toPocket === 'business'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Business</span>
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 py-3.5 pl-10 pr-4 text-xl font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Business Client Details */}
          {pocket === 'business' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Client / Brand Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Studio, Campus Fest, Freelance Client"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Note / Memo</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch with roommates, printing assignments"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Save to FINMECH</span>
          </button>
        </form>
      </div>
    </div>
  );
}

