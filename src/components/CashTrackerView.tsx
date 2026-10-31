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
  Wallet,
  AlertCircle
} from 'lucide-react';
import { CashDenominationCount } from '@/types/finance';
import { calculateDenominationTotal, DENOMINATION_VALUES } from '@/lib/financeCalculations';

interface CashTrackerViewProps {
  cashInHand: number;
  denominations: CashDenominationCount;
  currency?: string;
  onUpdateDenominations: (newCounts: CashDenominationCount) => void;
  onAtmWithdrawal: (amount: number) => void;
  onOpenQuickEntry: () => void;
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
  const variance = physicalTotal - cashInHand;

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

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Hero Physical Cash Card */}
      <section 
        aria-label="Cash overview"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Wallet Ledger
              </span>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Cash in Hand
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenQuickEntry}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Spend
          </button>
        </div>

        <div className="mt-4 mb-4">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            {currency}{cashInHand.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
            <span>Physical count: {currency}{physicalTotal.toLocaleString('en-IN')}</span>
            {variance !== 0 && (
              <span className={`font-medium ${variance > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                ({variance > 0 ? `+${currency}${variance}` : `-${currency}${Math.abs(variance)}`} variance)
              </span>
            )}
          </div>
        </div>

        {/* Rapid ATM Refill Buttons */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="text-[11px] font-medium text-neutral-400 mb-2">
            Rapid ATM Refill (Bank → Cash)
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[500, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => onAtmWithdrawal(amt)}
                className="py-2.5 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/60 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                +{currency}{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Note & Coin Denomination Counter */}
      <section 
        aria-label="Denomination audit"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-5 sm:p-6 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              Physical Notes & Coins Audit
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Count each note in your wallet to verify real cash
            </p>
          </div>

          <button
            onClick={handleSaveAndSync}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs hover:opacity-90 transition-opacity"
          >
            {isSavedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {isSavedNotice ? 'Verified!' : 'Save & Sync'}
          </button>
        </div>

        {/* Denomination rows */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
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
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {denom === 'coins' ? <Coins className="w-4 h-4" /> : `${currency}${denom}`}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {denom === 'coins' ? 'Loose Coins' : `${currency}${denom} Note`}
                    </div>
                    <div className="text-[11px] text-neutral-400 tabular-nums">
                      {currency}{subtotal.toLocaleString()} total
                    </div>
                  </div>
                </div>

                {/* Counter buttons */}
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

        {/* Audit Footer Summary */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-500">Calculated Physical Total:</span>
          <span className="font-extrabold text-base text-neutral-900 dark:text-white tabular-nums">
            {currency}{physicalTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </section>
    </div>
  );
}
