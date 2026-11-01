'use client';

import React, { useState } from 'react';
import { 
  Banknote, 
  Coins, 
  Plus, 
  Minus, 
  Check, 
  RefreshCw, 
  ArrowDownLeft, 
  Wallet
} from 'lucide-react';
import { CashDenominationCount } from '@/types/finance';
import { calculateDenominationTotal, DENOMINATION_VALUES } from '@/lib/financeCalculations';

interface CashTrackerViewProps {
  cashInHand: number;
  denominations: CashDenominationCount;
  currency?: string;
  onUpdateDenominations: (newCounts: CashDenominationCount) => void;
  onAtmWithdrawal: (amount: number) => void;
  onOpenQuickEntry: (params?: any) => void;
}

export function CashTrackerView({
  cashInHand,
  denominations,
  currency = '₹',
  onUpdateDenominations,
  onAtmWithdrawal,
  onOpenQuickEntry,
}: CashTrackerViewProps) {
  const [counts, setCounts] = useState<CashDenominationCount>(denominations);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const physicalTotal = calculateDenominationTotal(counts);
  const difference = physicalTotal - cashInHand;

  const handleAdjustCount = (denom: keyof CashDenominationCount, delta: number) => {
    const updated = {
      ...counts,
      [denom]: Math.max(0, (counts[denom] || 0) + delta),
    };
    setCounts(updated);
  };

  const handleSaveAndSync = () => {
    onUpdateDenominations(counts);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleResetToZero = () => {
    const zeroCounts: CashDenominationCount = {
      500: 0,
      200: 0,
      100: 0,
      50: 0,
      20: 0,
      10: 0,
      coins: 0,
    };
    setCounts(zeroCounts);
  };

  return (
    <div className="space-y-8 pb-32 pt-2">
      {/* Hero Physical Cash: Borderless & High Whitespace */}
      <section aria-label="Cash overview" className="pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Physical Pocket Wallet
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenQuickEntry({ type: 'income', pocket: 'cash', category: 'Starting Balance / Deposit' })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Cash
            </button>
            <button
              onClick={() => onOpenQuickEntry({ type: 'expense', pocket: 'cash' })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Spend
            </button>
          </div>
        </div>

        {/* Large Stark Typographic Display */}
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums display-amount mt-2">
          {currency}{cashInHand.toLocaleString('en-IN')}
        </div>

        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 flex items-center gap-2">
          <span>Counted in notes: <strong className="text-neutral-800 dark:text-neutral-200">{currency}{physicalTotal.toLocaleString('en-IN')}</strong></span>
          {difference !== 0 ? (
            <span className={`font-semibold ${difference > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              ({difference > 0 ? `+${currency}${difference} unapplied` : `-${currency}${Math.abs(difference)} unapplied`} • tap "Apply to Wallet")
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Notes match wallet
            </span>
          )}
        </div>

        {/* Rapid ATM Refill Buttons (Minimalist Pill Row) */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              ATM Cash Refill
            </span>
            <span className="text-[10px] text-neutral-400">
              Draws money from Bank into Cash
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[500, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => onAtmWithdrawal(amt)}
                className="py-2.5 px-3 rounded-2xl bg-neutral-100/70 dark:bg-[#141417] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
                title={`Transfer ${currency}${amt} from Bank to Cash`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                +{currency}{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Note & Coin Denomination Counter (Fluid List, No Cluttering Box) */}
      <section aria-label="Denomination audit" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Count Actual Notes in Hand
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tally your physical 500, 200, 100 notes
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {physicalTotal > 0 && (
              <button
                type="button"
                onClick={handleResetToZero}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-red-500 bg-neutral-100 dark:bg-neutral-800 transition-colors"
                title="Reset all note counts to 0"
              >
                Reset to 0
              </button>
            )}
            <button
              onClick={handleSaveAndSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs hover:opacity-90 transition-opacity"
            >
              {isSavedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {isSavedNotice ? 'Wallet Updated!' : 'Apply to Wallet'}
            </button>
          </div>
        </div>

        {/* Denomination rows */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {(['500', '200', '100', '50', '20', '10', 'coins'] as (keyof CashDenominationCount)[]).map((denom) => {
            const val = DENOMINATION_VALUES[denom];
            const count = counts[denom] || 0;
            const subtotal = count * val;

            return (
              <div 
                key={denom}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center font-bold text-xs text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {denom === 'coins' ? <Coins className="w-4 h-4" /> : `${currency}${denom}`}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {denom === 'coins' ? 'Loose Coins' : `${currency}${denom} Note`}
                    </div>
                    <div className="text-[11px] text-neutral-400 tabular-nums">
                      {currency}{subtotal.toLocaleString()} total
                    </div>
                  </div>
                </div>

                {/* Counter controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAdjustCount(denom, -1)}
                    disabled={count === 0}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Decrease ${denom}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-7 text-center font-bold text-sm text-neutral-900 dark:text-white tabular-nums">
                    {count}
                  </span>

                  <button
                    onClick={() => handleAdjustCount(denom, 1)}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label={`Increase ${denom}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Total Footer */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Total Physical Count:</span>
          <span className="font-extrabold text-lg text-neutral-900 dark:text-white tabular-nums">
            {currency}{physicalTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </section>
    </div>
  );
}
