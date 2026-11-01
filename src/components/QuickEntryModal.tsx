'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Delete, Check, Wallet, Landmark, Briefcase } from 'lucide-react';
import { TransactionType, PocketType } from '@/types/finance';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (entry: {
    type: TransactionType;
    pocket: PocketType;
    toPocket?: PocketType;
    category: string;
    amount: number;
    note: string;
  }) => void;
  currency?: string;
  initialType?: TransactionType;
  initialPocket?: PocketType;
  initialToPocket?: PocketType;
  initialCategory?: string;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Software & Tools',
  'Shopping',
  'Transport & Fuel',
  'Rent & Utilities',
  'Entertainment',
  'Health & Care',
  'General Spend',
];

const INCOME_CATEGORIES = [
  'Starting Balance / Deposit',
  'Salary / Retainer',
  'Client Payment',
  'Project Milestone',
  'Investment Return',
  'Other Income',
];

const TRANSFER_CATEGORIES = [
  'ATM Cash Withdrawal',
  'Business to Personal Draw',
  'Personal to Business Seed',
  'Internal Transfer',
];

export function QuickEntryModal({
  isOpen,
  onClose,
  onAddTransaction,
  currency = '₹',
  initialType,
  initialPocket,
  initialToPocket,
  initialCategory,
}: QuickEntryModalProps) {
  const [type, setType] = useState<TransactionType>(initialType || 'expense');
  const [pocket, setPocket] = useState<PocketType>(initialPocket || 'cash');
  const [toPocket, setToPocket] = useState<PocketType>(initialToPocket || 'bank');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [category, setCategory] = useState<string>(initialCategory || 'Food & Dining');
  const [note, setNote] = useState<string>('');
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const defaultType = initialType || 'expense';
      const defaultPocket = initialPocket || 'cash';
      const defaultToPocket = initialToPocket || 'bank';
      const defaultCategory = initialCategory || (
        defaultType === 'income' 
          ? (defaultPocket === 'business' ? 'Client Payment' : 'Salary / Retainer')
          : defaultType === 'transfer'
          ? (defaultPocket === 'business' ? 'Business to Personal Draw' : 'ATM Cash Withdrawal')
          : (defaultPocket === 'business' ? 'Software & Tools' : 'Food & Dining')
      );
      setType(defaultType);
      setPocket(defaultPocket);
      setToPocket(defaultToPocket);
      setCategory(defaultCategory);
      setAmountStr('0');
      setNote('');
      setShowCategoryPicker(false);
    }
  }, [isOpen, initialType, initialPocket, initialToPocket, initialCategory]);

  if (!isOpen) return null;

  const handleKeyPress = (val: string) => {
    if (val === 'back') {
      if (amountStr.length <= 1) {
        setAmountStr('0');
      } else {
        setAmountStr(amountStr.slice(0, -1));
      }
      return;
    }

    if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(amountStr + '.');
      }
      return;
    }

    if (amountStr === '0') {
      setAmountStr(val);
    } else if (amountStr.length < 9) {
      setAmountStr(amountStr + val);
    }
  };

  const handleClear = () => {
    setAmountStr('0');
  };

  const handleSave = () => {
    const amount = parseFloat(amountStr);
    if (amount <= 0 || isNaN(amount)) return;

    onAddTransaction({
      type,
      pocket,
      toPocket: type === 'transfer' ? toPocket : undefined,
      category,
      amount,
      note: note.trim() || category,
    });

    // Reset and close
    setAmountStr('0');
    setNote('');
    onClose();
  };

  const currentCategoryList =
    type === 'expense'
      ? EXPENSE_CATEGORIES
      : type === 'income'
      ? INCOME_CATEGORIES
      : TRANSFER_CATEGORIES;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-entry-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#121215] rounded-t-[32px] sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xl p-5 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Close & Type Toggle */}
        <div className="flex items-center justify-between pb-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Segmented type switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-[#1c1c21] p-1 rounded-full text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Food & Dining');
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Project Milestone');
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setType('transfer');
                setCategory('ATM Cash Withdrawal');
                setPocket('bank');
                setToPocket('cash');
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                type === 'transfer'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              Transfer
            </button>
          </div>

          <button
            onClick={handleClear}
            className="text-xs font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 px-2 py-1"
          >
            Reset
          </button>
        </div>

        {/* Account Selector: Where is money going / coming from? */}
        <div className="bg-neutral-50 dark:bg-[#16161a] p-2.5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 my-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 text-center">
            {type === 'income' ? 'Deposit Into Account:' : type === 'expense' ? 'Pay From Account:' : 'Transfer Between Accounts:'}
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPocket('bank')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  pocket === 'bank'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-[#1f1f26] text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                Bank
              </button>

              <button
                type="button"
                onClick={() => setPocket('cash')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  pocket === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-[#1f1f26] text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Cash
              </button>

              <button
                type="button"
                onClick={() => setPocket('business')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  pocket === 'business'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-[#1f1f26] text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Business
              </button>
            </div>

            {type === 'transfer' && (
              <div className="flex items-center gap-1.5 pl-1 border-l border-neutral-200 dark:border-neutral-700">
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[10px] text-neutral-400 font-bold">To:</span>
                <select
                  value={toPocket}
                  onChange={(e) => setToPocket(e.target.value as PocketType)}
                  aria-label="Destination pocket"
                  className="px-2.5 py-1.5 bg-white dark:bg-[#1f1f26] border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="business">Business</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Amount Display (Revolut aesthetic) */}
        <div className="py-4 text-center">
          <div className="inline-flex items-center justify-center font-bold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            <span className="text-3xl font-light text-neutral-400 dark:text-neutral-500 mr-1.5">
              {currency}
            </span>
            <span className="text-5xl font-bold">
              {amountStr}
            </span>
          </div>
        </div>

        {/* Category Picker & Note row */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex-1 py-2 px-3 bg-neutral-100 dark:bg-[#1c1c21] rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center justify-between border border-neutral-200/50 dark:border-neutral-800 hover:border-neutral-400 transition-colors"
            >
              <span className="truncate">Tag: <strong>{category}</strong></span>
              <span className="text-[10px] text-neutral-400">Change ▾</span>
            </button>
            <input
              type="text"
              placeholder="Note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 py-2 px-3 bg-neutral-100 dark:bg-[#1c1c21] rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 border border-neutral-200/50 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Collapsible Category Options */}
          {showCategoryPicker && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-[#18181b] rounded-xl border border-neutral-200/80 dark:border-neutral-800 max-h-28 overflow-y-auto no-scrollbar">
              {currentCategoryList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                    category === cat
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-white dark:bg-[#202025] text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tactile 12-key Numpad (Revolut-style) */}
        <div className="grid grid-cols-3 gap-2 py-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className="h-12 rounded-2xl bg-neutral-100/80 dark:bg-[#1a1a1f] hover:bg-neutral-200 dark:hover:bg-[#26262c] active:scale-95 transition-all flex items-center justify-center font-medium text-lg text-neutral-900 dark:text-white select-none focus:outline-none"
              aria-label={key === 'back' ? 'Backspace' : key}
            >
              {key === 'back' ? (
                <Delete className="w-5 h-5 text-neutral-500" />
              ) : (
                key
              )}
            </button>
          ))}
        </div>

        {/* Save CTA */}
        <div className="pt-3 mt-1">
          <button
            type="button"
            disabled={parseFloat(amountStr) <= 0}
            onClick={handleSave}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              parseFloat(amountStr) > 0
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md active:scale-[0.98]'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Save {type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}

