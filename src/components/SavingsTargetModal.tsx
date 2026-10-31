'use client';

import React, { useState, useEffect } from 'react';
import { X, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavingsTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTarget: number;
  currentSaved: number;
  currency?: string;
  onSaveTarget: (newTarget: number) => void;
}

export function SavingsTargetModal({
  isOpen,
  onClose,
  currentTarget,
  currentSaved,
  currency = '₹',
  onSaveTarget,
}: SavingsTargetModalProps) {
  const [targetInput, setTargetInput] = useState<string>(currentTarget.toString());
  const [daysLeft, setDaysLeft] = useState(15);

  useEffect(() => {
    if (isOpen) {
      setTargetInput(currentTarget.toString());
      setDaysLeft(Math.max(1, 30 - new Date().getDate()));
    }
  }, [isOpen, currentTarget]);

  if (!isOpen) return null;

  const presets = [5000, 10000, 15000, 25000, 50000];
  const parsedTarget = Math.max(0, parseInt(targetInput || '0', 10));
  const remaining = Math.max(0, parsedTarget - currentSaved);
  const percentage = parsedTarget > 0 ? Math.min(100, Math.round((currentSaved / parsedTarget) * 100)) : 0;
  const dailyNeeded = Math.round(remaining / daysLeft);

  const handleSave = () => {
    if (parsedTarget > 0) {
      onSaveTarget(parsedTarget);
      if (percentage >= 100) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="target-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-[#141417] rounded-t-3xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 id="target-modal-title" className="text-base font-semibold text-neutral-900 dark:text-white">
                Monthly Savings Target
              </h2>
              <p className="text-xs text-neutral-500">
                AI analyzes your habits against this goal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="savings-input" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Target Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-neutral-400">
                {currency}
              </span>
              <input
                id="savings-input"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white bg-neutral-50 dark:bg-[#1a1a1e] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white tabular-nums"
                placeholder="10000"
              />
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setTargetInput(val.toString())}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  parsedTarget === val
                    ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
                    : 'bg-white dark:bg-[#1a1a1e] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                }`}
              >
                {currency}{val.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Goal Progress Projection Box */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Current Progress</span>
              <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">
                {currency}{currentSaved.toLocaleString()} / {currency}{parsedTarget.toLocaleString()} ({percentage}%)
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            <div className="flex items-start gap-2 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {remaining === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Goal accomplished! Extra savings compound into your wealth cushion.
                  </span>
                ) : (
                  <span>
                    Save <strong className="text-neutral-900 dark:text-white">{currency}{dailyNeeded.toLocaleString()}/day</strong> over the next {daysLeft} days to achieve your target.
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 text-sm font-semibold text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Target
          </button>
        </div>
      </div>
    </div>
  );
}
