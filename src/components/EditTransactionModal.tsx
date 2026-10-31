'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Check, 
  Landmark, 
  Briefcase, 
  Wallet, 
  ArrowRightLeft,
  AlertCircle
} from 'lucide-react';
import { Transaction, TransactionType, PocketType } from '@/types/finance';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currency?: string;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onUpdateTransaction,
  onDeleteTransaction,
  currency = '₹',
}: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [pocket, setPocket] = useState<PocketType>('bank');
  const [toPocket, setToPocket] = useState<PocketType | undefined>(undefined);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setPocket(transaction.pocket);
      setToPocket(transaction.toPocket);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setNote(transaction.note || '');
      setConfirmDelete(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const updated: Transaction = {
      ...transaction,
      type,
      pocket,
      toPocket: type === 'transfer' ? toPocket || 'cash' : undefined,
      amount: parsedAmount,
      category: category.trim() || 'General',
      note: note.trim(),
    };

    onUpdateTransaction(updated);
    onClose();
  };

  const handleDelete = () => {
    onDeleteTransaction(transaction.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-tx-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#141417] rounded-t-3xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
          <div>
            <h2 id="edit-tx-title" className="text-base font-bold text-neutral-900 dark:text-white">
              Edit / Redo Entry
            </h2>
            <p className="text-xs text-neutral-400">
              Fix mistyped amounts or move money between accounts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="py-4 space-y-4">
          {/* Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Entry Type
            </label>
            <div className="flex items-center bg-neutral-100 dark:bg-[#1c1c21] p-1 rounded-xl text-xs font-semibold">
              {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                    type === t
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Account / Pocket Reassignment (The Core Feature: Move from Bank to Business or vice versa) */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              {type === 'transfer' ? 'From Account' : 'Account / Pocket'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPocket('bank')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  pocket === 'bank'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'bg-neutral-50 dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setPocket('business')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  pocket === 'business'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'bg-neutral-50 dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Business</span>
              </button>

              <button
                type="button"
                onClick={() => setPocket('cash')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  pocket === 'cash'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'bg-neutral-50 dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Cash</span>
              </button>
            </div>
            {pocket !== transaction.pocket && (
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1.5 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3" />
                Will move {currency}{amount || transaction.amount} from {transaction.pocket} to {pocket}
              </p>
            )}
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-3 py-2.5 bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Category & Note */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Note / Description
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Save & Delete Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>

            {confirmDelete ? (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  Confirm Deletion?
                </div>
                <p className="text-[11px] text-red-500 leading-tight">
                  This transaction will be permanently removed and your balances adjusted.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Entry
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

