'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Banknote,
  Building2,
  Briefcase,
  ArrowRightLeft,
  Utensils,
  Car,
  BookOpen,
  Coffee,
  ShoppingBag,
  Laptop,
  Film,
  Check,
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
  { label: 'Meal', amount: 180, cat: 'Food & Dining', pocket: 'bank' as PocketType },
];

export default function QuickInputModal({
  isOpen,
  onClose,
  onAddTransaction,
  apiKey,
}: QuickInputModalProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const [expressionHint, setExpressionHint] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [pocket, setPocket] = useState<PocketType>('cash');
  const [toPocket, setToPocket] = useState<PocketType>('cash');
  const [category, setCategory] = useState('Food & Dining');
  const [note, setNote] = useState('');

  const [entryMode, setEntryMode] = useState<'keypad' | 'ai'>('keypad');
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isPocketDrawerOpen, setIsPocketDrawerOpen] = useState(false);

  if (!isOpen) return null;

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

    setDisplayValue((prev) => {
      if (prev === '0') return val;
      if (prev.length >= 8) return prev;
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
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    setDisplayValue('0');
    setExpressionHint('');
    setNote('');
    onClose();
  };

  const CurrentIcon = CATEGORY_ICONS[category] || Layers;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-2xl flex flex-col justify-between max-h-[92vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab bar */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border-color)] sm:hidden" />

        {/* Top Control Bar (Minimal Monochrome) */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-transform duration-120 active:scale-95"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Segmented Pill Toggle: Expense / Income / Transfer */}
          <div className="flex items-center rounded-full bg-[var(--bg-surface-elevated)] p-0.5 border border-[var(--border-color)]">
            <button
              onClick={() => {
                setType('expense');
                setCategory(CATEGORIES.expense[0]);
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
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
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
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
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span>Transfer</span>
            </button>
          </div>

          {/* AI Switch */}
          <button
            onClick={() => setEntryMode(entryMode === 'keypad' ? 'ai' : 'keypad')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
              entryMode === 'ai'
                ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)]'
                : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            aria-label="Toggle AI natural language mode"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        {/* AI Entry Form */}
        {entryMode === 'ai' ? (
          <div className="py-4 space-y-3">
            <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-color)]">
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                AI Speech / Natural Text
              </label>
              <textarea
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g. Spent 120 on auto via cash, or Received 4000 for web project into business"
                rows={3}
                style={{ fontSize: '16px' }}
                className="w-full rounded-xl bg-transparent border-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleNaturalParse}
                disabled={isParsing || !naturalText.trim()}
                className="mt-2 w-full rounded-xl bg-[var(--text-primary)] text-[var(--bg-page)] py-2.5 text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all active:scale-98"
              >
                {isParsing ? 'Processing...' : 'Fill Keypad'}
              </button>
            </div>
          </div>
        ) : (
          /* Revolut-Style Minimal Keypad Screen */
          <div className="flex flex-col justify-between space-y-3 pt-2">
            {/* Pocket Selector Pill */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsPocketDrawerOpen(!isPocketDrawerOpen)}
                className="flex items-center gap-2 rounded-full bg-[var(--bg-surface-elevated)] px-4 py-1.5 border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-color-hover)] transition-all min-h-[36px]"
              >
                {pocket === 'cash' ? (
                  <Banknote className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                ) : pocket === 'bank' ? (
                  <Building2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                ) : (
                  <Briefcase className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                )}
                <span>
                  {pocket === 'cash' ? 'Cash in Hand' : pocket === 'bank' ? 'Personal Bank' : 'Division'}
                </span>
                {type === 'transfer' && (
                  <span className="text-[var(--text-muted)]">
                    → {toPocket === 'cash' ? 'Cash' : toPocket === 'bank' ? 'Bank' : 'Division'}
                  </span>
                )}
                <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
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
                    className={`py-2 px-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                      pocket === p
                        ? 'bg-[var(--text-primary)] text-[var(--bg-page)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p === 'business' ? 'Division' : p}
                  </button>
                ))}
              </div>
            )}

            {/* Central Large Amount Typography */}
            <div className="py-2 text-center">
              {expressionHint && (
                <p className="text-xs font-mono font-medium text-[var(--text-muted)]">
                  {expressionHint}
                </p>
              )}
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-muted)] select-none">
                  ₹
                </span>
                <span
                  className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums select-none ${
                    type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : type === 'expense'
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {displayValue}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="rounded-full bg-[var(--bg-surface-elevated)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] whitespace-nowrap min-h-[30px] transition-transform duration-120 active:scale-95"
                >
                  {p.label} ₹{p.amount}
                </button>
              ))}
            </div>

            {/* Tactile Monochrome 4x4 Keypad (Image 4 Revolut style) */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
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
                  className={`flex h-12 items-center justify-center rounded-2xl text-base font-bold transition-all duration-120 active:scale-95 ${
                    key.isBack
                      ? 'bg-[var(--bg-surface-elevated)] text-red-600 dark:text-red-400 hover:bg-red-500/10'
                      : key.isOp
                      ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                      : 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--border-color-hover)] border border-[var(--border-color)]'
                  }`}
                >
                  {key.label}
                </button>
              ))}
            </div>

            {/* Note Input */}
            <div className="pt-1">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note (e.g. Chai, auto fare)..."
                style={{ fontSize: '16px' }}
                className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none min-h-[40px]"
              />
            </div>

            {/* Bottom Bar: Category Selector & Monochrome Save */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(!isCategoryDrawerOpen)}
                className="flex-1 flex items-center justify-between rounded-full bg-[var(--bg-surface-elevated)] px-4 py-3 border border-[var(--border-color)] hover:border-[var(--border-color-hover)] text-xs font-semibold text-[var(--text-primary)] min-h-[46px] transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <CurrentIcon className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="truncate max-w-[120px]">{category}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] py-3 text-xs font-bold hover:opacity-90 shadow-md transition-all active:scale-98 min-h-[46px] flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>

            {/* Category Accordion */}
            {isCategoryDrawerOpen && (
              <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-3 border border-[var(--border-color)] max-h-44 overflow-y-auto no-scrollbar animate-in fade-in">
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
                        className={`flex items-center gap-2 rounded-xl p-2 text-xs font-medium text-left transition-all ${
                          category === cat
                            ? 'bg-[var(--text-primary)] text-[var(--bg-page)] font-bold'
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
