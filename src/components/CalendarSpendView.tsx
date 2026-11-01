'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  ReceiptText, 
  ArrowUpRight, 
  Edit3,
  X
} from 'lucide-react';
import { Transaction } from '@/types/finance';

interface CalendarSpendViewProps {
  transactions: Transaction[];
  currency?: string;
  onEditTransaction?: (tx: Transaction) => void;
  onOpenQuickEntry?: (params?: any) => void;
  initialYearMonth?: string; // Format: 'YYYY-MM'
}

export function CalendarSpendView({
  transactions,
  currency = '₹',
  onEditTransaction,
  onOpenQuickEntry,
  initialYearMonth,
}: CalendarSpendViewProps) {
  // Current viewed month state
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
    if (initialYearMonth) {
      const [y, m] = initialYearMonth.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        return new Date(y, m - 1, 1);
      }
    }
    return new Date();
  });

  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const viewYear = currentViewDate.getFullYear();
  const viewMonth = currentViewDate.getMonth(); // 0-indexed

  const monthLabel = currentViewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isInternalAdjustment = (cat: string) =>
    cat === 'Cash Audit Reconciliation' ||
    cat === 'Business Capital Adjustment' ||
    cat === 'Starting Balance' ||
    cat === 'Initial Balance' ||
    cat === 'Starting Balance / Deposit';

  // Personal expenses in this viewed month
  const monthDailySpends = useMemo(() => {
    const map = new Map<number, { total: number; count: number; items: Transaction[] }>();

    transactions.forEach((tx) => {
      // Exclude business and internal balance adjustments
      if (tx.pocket === 'business' || isInternalAdjustment(tx.category)) return;
      if (tx.type !== 'expense') return;

      const d = new Date(tx.date);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const day = d.getDate();
        if (!map.has(day)) {
          map.set(day, { total: 0, count: 0, items: [] });
        }
        const data = map.get(day)!;
        data.total += tx.amount;
        data.count += 1;
        data.items.push(tx);
      }
    });

    return map;
  }, [transactions, viewYear, viewMonth]);

  // Overall statistics for this month
  const totalMonthSpend = useMemo(() => {
    let sum = 0;
    monthDailySpends.forEach((val) => {
      sum += val.total;
    });
    return sum;
  }, [monthDailySpends]);

  const activeSpendDaysCount = monthDailySpends.size;

  // Calendar matrix calculation
  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // Standard Mon-Sun layout (Mon = 0, Sun = 6)
    const startOffset = (firstDayOfWeek + 6) % 7;

    const cells: {
      day: number;
      isCurrentMonth: boolean;
      dateString: string;
      total: number;
      count: number;
      items: Transaction[];
    }[] = [];

    // Leading days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        isCurrentMonth: false,
        dateString,
        total: 0,
        count: 0,
        items: [],
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const spendData = monthDailySpends.get(d) || { total: 0, count: 0, items: [] };
      cells.push({
        day: d,
        isCurrentMonth: true,
        dateString,
        total: spendData.total,
        count: spendData.count,
        items: spendData.items,
      });
    }

    // Trailing days to fill 7-col grid (up to 35 or 42 cells)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let t = 1; t <= remaining; t++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
      cells.push({
        day: t,
        isCurrentMonth: false,
        dateString,
        total: 0,
        count: 0,
        items: [],
      });
    }

    return cells;
  }, [viewYear, viewMonth, monthDailySpends]);

  // Selected day items
  const selectedDayData = useMemo(() => {
    if (!selectedDayString) return null;
    const [y, m, d] = selectedDayString.split('-').map(Number);
    if (y !== viewYear || m - 1 !== viewMonth) return null;
    return {
      day: d,
      dateString: selectedDayString,
      data: monthDailySpends.get(d) || { total: 0, count: 0, items: [] },
    };
  }, [selectedDayString, viewYear, viewMonth, monthDailySpends]);

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth - 1, 1));
    setSelectedDayString(null);
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth + 1, 1));
    setSelectedDayString(null);
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setSelectedDayString(todayStr);
  };

  const today = new Date();
  const isCurrentMonthView = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDateNum = today.getDate();

  return (
    <div className="space-y-4">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {monthLabel}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {activeSpendDaysCount} spend days • Total {currency}{totalMonthSpend.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-2.5 py-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Grid Headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
          <div key={idx} className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Month Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarCells.map((cell, idx) => {
          const isToday = isCurrentMonthView && cell.isCurrentMonth && cell.day === todayDateNum;
          const isSelected = selectedDayString === cell.dateString;
          const hasSpends = cell.total > 0;

          return (
            <div
              key={idx}
              onClick={() => {
                if (cell.isCurrentMonth) {
                  setSelectedDayString(isSelected ? null : cell.dateString);
                }
              }}
              className={`min-h-[58px] sm:min-h-[64px] p-1.5 rounded-2xl flex flex-col justify-between border transition-all cursor-pointer ${
                !cell.isCurrentMonth
                  ? 'opacity-25 border-transparent cursor-default'
                  : isSelected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm ring-2 ring-neutral-400 dark:ring-neutral-600'
                  : isToday
                  ? 'bg-neutral-100/80 dark:bg-[#1a1a20] border-emerald-500/60 shadow-xs'
                  : hasSpends
                  ? 'bg-white dark:bg-[#141417] border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                  : 'bg-white dark:bg-[#121215] border-neutral-100 dark:border-neutral-800/40 text-neutral-400 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold tabular-nums ${
                    isSelected
                      ? 'text-white dark:text-neutral-900'
                      : isToday
                      ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : cell.isCurrentMonth
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-400'
                  }`}
                >
                  {cell.day}
                </span>

                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Today" />
                )}
              </div>

              {/* Spend indicator */}
              {hasSpends && (
                <div className="pt-1">
                  <span
                    className={`block text-[9px] sm:text-[10px] font-extrabold tabular-nums truncate px-1 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-900'
                        : cell.total > 2000
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : cell.total > 700
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    -{currency}{cell.total >= 1000 ? `${(cell.total / 1000).toFixed(1)}k` : cell.total}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Drill-down Drawer */}
      {selectedDayData && (
        <div className="mt-3 p-4 rounded-3xl bg-neutral-50 dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>
                  {new Date(selectedDayData.dateString).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  • {selectedDayData.data.items.length} spends
                </span>
              </div>
              <div className="text-lg font-extrabold text-neutral-900 dark:text-white tabular-nums">
                Total: {currency}{selectedDayData.data.total.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onOpenQuickEntry && (
                <button
                  type="button"
                  onClick={() => onOpenQuickEntry({ type: 'expense', pocket: 'bank' })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold rounded-full shadow-xs hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add for Day
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDayString(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close date filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedDayData.data.items.length === 0 ? (
            <div className="py-4 text-center text-xs text-neutral-400">
              No expenses recorded on this day.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 pt-1">
              {selectedDayData.data.items.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction && onEditTransaction(tx)}
                  className="py-2.5 flex items-center justify-between hover:bg-white dark:hover:bg-neutral-800/40 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {tx.note || tx.category}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                      {tx.category} • from <span className="capitalize font-semibold text-neutral-700 dark:text-neutral-300">{tx.pocket}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3">
                    <span className="text-xs font-extrabold text-neutral-900 dark:text-white tabular-nums">
                      -{currency}{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTransaction && onEditTransaction(tx);
                      }}
                      className="p-1 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                      title="Edit transaction"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

