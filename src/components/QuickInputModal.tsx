'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Banknote,
  Building2,
  Briefcase,
  ArrowRightLeft,
  Calendar,
  Utensils,
  Car,
  BookOpen,
  Coffee,
  ShoppingBag,
  Laptop,
  Film,
  Plus,
  Minus,
  Check,
  Delete,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
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

const CATEGORY_ICONS: Record<string, any> = {
  'Food & Dining': Utensils,
  'Commute & Travel': Car,
  'Education & Xerox': BookOpen,
  'Chai & Snacks': Coffee,
  'Shopping': ShoppingBag,
  'Subscriptions': Film,
  'Software & Tools': Laptop,
  'Freelance & Gigs': Briefcase,
  'Client Project': Laptop,
  'Tutoring': BookOpen,
  'Others': Layers,
};

const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Chai & Snacks',
    'Commute & Travel',
    'Education & Xerox',
    'Shopping',
    'Subscriptions',
    'Software & Tools',
    'Others',
  ],
  income: [
    'Freelance & Gigs',
    'Client Project',
    'Tutoring',
    'Monthly Allowance',
    'Cashback & Rewards',
    'Others',
  ],
  transfer: [
    'ATM Cash Refill',
    'Biz Profit Draw',
    'Capital Investment',
    'Account Transfer',
  ],
};

const QUICK_PRESETS = [
  { label: 'Chai', amount: 20, cat: 'Chai & Snacks', pocket: 'cash' as PocketType },
  { label: 'Canteen', amount: 80, cat: 'Food & Dining', pocket: 'cash' as PocketType },
  { label: 'Auto', amount: 50, cat: 'Commute & Travel', pocket: 'cash' as PocketType },
  { label: 'Xerox', amount: 40, cat: 'Education & Xerox', pocket: 'cash' as PocketType },
  { label: 'Meal (UPI)', amount: 180, cat: 'Food & Dining', pocket: 'bank' as PocketType },
];

export default function QuickInputModal({
  isOpen,
  onClose,
  onAddTransaction,
  apiKey,
}: QuickInputModalProps) {
  // Keypad & display state
  const [displayValue, setDisplayValue] = useState('0');
  const [expressionHint, setExpressionHint] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [pocket, setPocket] = useState<PocketType>('cash');
  const [toPocket, setToPocket] = useState<PocketType>('cash');
  const [category, setCategory] = useState('Food & Dining');
  const [note, setNote] = useState('');

  // Mode: Keypad vs AI Text Parser
  const [entryMode, setEntryMode] = useState<'keypad' | 'ai'>('keypad');
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Category Drawer Open
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isPocketDrawerOpen, setIsPocketDrawerOpen] = useState(false);

  if (!isOpen) return null;

  // Keypad Handlers
  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setDisplayValue('0');
      setExpressionHint('');
      return;
    }

    if (val === 'BACK') {
      if (displayValue.length <= 1) {
        setDisplayValue('0');
      } else {
        setDisplayValue((prev) => prev.slice(0, -1));
      }
      return;
    }

    // Calculation operators (+, -)
    if (val === '+' || val === '-' || val === '×' || val === '÷') {
      const currentNum = parseFloat(displayValue) || 0;
      setExpressionHint(`${currentNum} ${val}`);
      setDisplayValue('0');
      return;
    }

    if (val === '.') {
      if (!displayValue.includes('.')) {
        setDisplayValue((prev) => prev + '.');
      }
      return;
    }

    // Digit press
    setDisplayValue((prev) => {
      if (prev === '0') return val;
      if (prev.length >= 8) return prev; // max 8 digits
      return prev + val;
    });
  };

  const handleApplyPreset = (p: typeof QUICK_PRESETS[0]) => {
    setDisplayValue(p.amount.toString());
    setCategory(p.cat);
    setPocket(p.pocket);
    setNote(p.label);
    setExpressionHint('');
  };

  const handleNaturalParse = async () => {
    if (!naturalText.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await GeminiService.parseNaturalTransaction(naturalText, apiKey);
      if (parsed) {
        setType(parsed.type);
        setPocket(parsed.pocket);
        setDisplayValue(parsed.amount.toString());
        setCategory(parsed.category);
        setNote(parsed.note);
        setEntryMode('keypad');
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleFinalSubmit = () => {
    // Resolve expression if pending
    let finalAmount = parseFloat(displayValue);
    if (expressionHint) {
      const parts = expressionHint.split(' ');
      const op = parts[1];
      const prev = parseFloat(parts[0]);
      if (!isNaN(prev) && !isNaN(finalAmount)) {
        if (op === '+') finalAmount = prev + finalAmount;
        else if (op === '-') finalAmount = Math.max(0, prev - finalAmount);
        else if (op === '×') finalAmount = prev * finalAmount;
        else if (op === '÷' && finalAmount > 0) finalAmount = prev / finalAmount;
      }
    }

    if (isNaN(finalAmount) || finalAmount <= 0) return;

    onAddTransaction({
      type,
      pocket,
      toPocket: type === 'transfer' ? toPocket : undefined,
      category,
      amount: Math.round(finalAmount * 100) / 100,
      date: new Date().toISOString(),
      note: note.trim() || `${category}`,
    });

    if (type === 'income') {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    // Reset and close
    setDisplayValue('0');
    setExpressionHint('');
    setNote('');
    onClose();
  };

  const CurrentIcon = CATEGORY_ICONS[category] || Layers;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-2xl flex flex-col justify-between max-h-[95vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar on mobile */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--border-color)] sm:hidden" />

        {/* Top Header: Close + Segmented Pill Toggle + AI Switch */}
        <div className="flex items-center justify-between pb-3">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-transform duration-150 active:scale-95"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Segmented Control (Expense / Income / Transfer) */}
          <div className="flex items-center rounded-full bg-[var(--bg-surface-elevated)] p-1 border border-[var(--border-color)]">
            <button
              onClick={() => {
                setType('expense');
                setCategory(CATEGORIES.expense[0]);
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowUpRight className="h-3 w-3" />
              <span>Expense</span>
            </button>

            <button
              onClick={() => {
                setType('income');
                setCategory(CATEGORIES.income[0]);
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowDownLeft className="h-3 w-3" />
              <span>Income</span>
            </button>

            <button
              onClick={() => {
                setType('transfer');
                setCategory(CATEGORIES.transfer[0]);
                setPocket('bank');
                setToPocket('cash');
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                type === 'transfer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span>Transfer</span>
            </button>
          </div>

          {/* AI Entry Switch */}
          <button
            onClick={() => setEntryMode(entryMode === 'keypad' ? 'ai' : 'keypad')}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-150 active:scale-95 ${
              entryMode === 'ai'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
            }`}
            aria-label="Toggle AI natural language mode"
            title="Toggle AI natural language entry"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        {/* AI Natural Language Mode */}
        {entryMode === 'ai' ? (
          <div className="py-4 space-y-3">
            <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-color)]">
              <label className="block text-xs font-bold text-emerald-500 mb-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>AI Quick Speech / Text Entry</span>
              </label>
              <textarea
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g. Spent 120 on auto rickshaw via cash, or Got 4500 client payout into business"
                rows={3}
                style={{ fontSize: '16px' }}
                className="w-full rounded-xl bg-transparent border-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleNaturalParse}
                disabled={isParsing || !naturalText.trim()}
                className="mt-2 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-transform duration-150 active:scale-95"
              >
                {isParsing ? 'Parsing with AI...' : 'Auto-Populate Keypad'}
              </button>
            </div>
            <p className="text-center text-[11px] text-[var(--text-muted)]">
              FinMech AI will parse your pocket, category, and rupee amount automatically.
            </p>
          </div>
        ) : (
          /* Revolut-Style Display & Keypad */
          <div className="flex flex-col justify-between space-y-3 pt-1">
            {/* Account / Pocket Pill Selector */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsPocketDrawerOpen(!isPocketDrawerOpen)}
                className="flex items-center gap-2 rounded-full bg-[var(--bg-surface-elevated)] px-4 py-2 border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:border-emerald-500/40 transition-all min-h-[40px]"
              >
                {pocket === 'cash' ? (
                  <Banknote className="h-4 w-4 text-amber-500" />
                ) : pocket === 'bank' ? (
                  <Building2 className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Briefcase className="h-4 w-4 text-cyan-500" />
                )}
                <span>
                  {pocket === 'cash' ? 'Cash in Hand' : pocket === 'bank' ? 'Personal Bank' : 'Biz Division'}
                </span>
                {type === 'transfer' && (
                  <span className="text-[var(--text-muted)]">
                    → {toPocket === 'cash' ? 'Cash' : toPocket === 'bank' ? 'Bank' : 'Biz'}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Pocket Selection Dropdown */}
            {isPocketDrawerOpen && (
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[var(--bg-surface-elevated)] p-2 border border-[var(--border-color)] animate-in fade-in">
                {(['cash', 'bank', 'business'] as PocketType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPocket(p);
                      setIsPocketDrawerOpen(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      pocket === p
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p === 'business' ? 'Biz Division' : p}
                  </button>
                ))}
              </div>
            )}

            {/* Central Calculation & Large Amount Display */}
            <div className="py-2 text-center">
              {expressionHint && (
                <p className="text-xs font-mono font-semibold text-[var(--text-muted)] tracking-wider">
                  {expressionHint}
                </p>
              )}
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-muted)] select-none">
                  ₹
                </span>
                <span className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight tabular-nums select-none">
                  {displayValue}
                </span>
              </div>
            </div>

            {/* Quick Preset Chips Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="rounded-full bg-[var(--bg-surface-elevated)] px-3 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-emerald-500 border border-[var(--border-color)] whitespace-nowrap min-h-[32px] transition-transform duration-150 active:scale-95"
                >
                  {p.label} ₹{p.amount}
                </button>
              ))}
            </div>

            {/* In-App 4x4 Revolut Numeric Keypad */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: '7', val: '7' },
                { label: '8', val: '8' },
                { label: '9', val: '9' },
                { label: '÷', val: '÷', isOp: true },
                { label: '4', val: '4' },
                { label: '5', val: '5' },
                { label: '6', val: '6' },
                { label: '×', val: '×', isOp: true },
                { label: '1', val: '1' },
                { label: '2', val: '2' },
                { label: '3', val: '3' },
                { label: '-', val: '-', isOp: true },
                { label: '.', val: '.' },
                { label: '0', val: '0' },
                { label: '⌫', val: 'BACK', isBack: true },
                { label: '+', val: '+', isOp: true },
              ].map((key) => (
                <button
                  key={key.label}
                  type="button"
                  onClick={() => handleKeypadPress(key.val)}
                  className={`flex h-12 sm:h-13 items-center justify-center rounded-2xl text-base sm:text-lg font-bold transition-all duration-150 active:scale-90 ${
                    key.isOp
                      ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30'
                      : key.isBack
                      ? 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
                      : 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--border-color-hover)] border border-[var(--border-color)]'
                  }`}
                >
                  {key.label}
                </button>
              ))}
            </div>

            {/* Optional Memo / Note Input */}
            <div className="pt-1">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note (e.g. Late night snack, Auto to station)..."
                style={{ fontSize: '16px' }}
                className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none min-h-[40px]"
              />
            </div>

            {/* Bottom Bar: Category Pill on Left + Save Pill on Right */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
              {/* Category Selector Pill */}
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(!isCategoryDrawerOpen)}
                className="flex-1 flex items-center justify-between rounded-full bg-[var(--bg-surface-elevated)] px-4 py-3 border border-[var(--border-color)] hover:border-emerald-500/40 text-xs font-bold text-[var(--text-primary)] min-h-[48px] transition-transform duration-150 active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <CurrentIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate max-w-[120px]">{category}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 rounded-full bg-emerald-500 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition-transform duration-150 active:scale-95 min-h-[48px] flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>

            {/* Category Drawer Accordion */}
            {isCategoryDrawerOpen && (
              <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-3 border border-[var(--border-color)] max-h-48 overflow-y-auto no-scrollbar animate-in fade-in">
                <div className="grid grid-cols-2 gap-1.5">
                  {(CATEGORIES[type] || CATEGORIES.expense).map((cat) => {
                    const Icon = CATEGORY_ICONS[cat] || Layers;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setIsCategoryDrawerOpen(false);
                        }}
                        className={`flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-left transition-all ${
                          category === cat
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
