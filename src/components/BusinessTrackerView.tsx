'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  FileText,
  UserCheck,
  X,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction } from '@/types/finance';

interface BusinessTrackerViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenQuickAdd: () => void;
}

export default function BusinessTrackerView({
  summary,
  transactions,
  onAddTransaction,
  onOpenQuickAdd,
}: BusinessTrackerViewProps) {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDestination, setWithdrawDestination] = useState<'bank' | 'cash'>('bank');

  const [notification, setNotification] = useState<string | null>(null);

  const businessTransactions = transactions.filter(
    (t) => t.pocket === 'business' || t.toPocket === 'business'
  );

  const pendingInvoices = transactions.filter(
    (t) => t.pocket === 'business' && t.businessDetails?.status === 'pending'
  );

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invoiceAmount);
    if (isNaN(amt) || amt <= 0 || !invoiceClient.trim()) return;

    onAddTransaction({
      type: 'income',
      pocket: 'business',
      category: 'Client Project',
      amount: amt,
      date: new Date().toISOString(),
      note: invoiceNote.trim() || `Invoice for ${invoiceClient}`,
      businessDetails: {
        clientName: invoiceClient.trim(),
        status: 'pending',
      },
    });

    setInvoiceClient('');
    setInvoiceAmount('');
    setInvoiceNote('');
    setIsInvoiceModalOpen(false);
    setNotification(`Invoice created for ${invoiceClient}. Marked as pending receivable.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleMarkAsPaid = (tx: Transaction) => {
    onAddTransaction({
      type: 'income',
      pocket: 'business',
      category: tx.category,
      amount: tx.amount,
      date: new Date().toISOString(),
      note: `Payment received from ${tx.businessDetails?.clientName || 'Client'}`,
      businessDetails: {
        clientName: tx.businessDetails?.clientName,
        status: 'received',
      },
    });
    setNotification(`Payment of ₹${tx.amount.toLocaleString('en-IN')} received into Live Business Money!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOwnerDraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > summary.businessBalance) return;

    onAddTransaction({
      type: 'transfer',
      pocket: 'business',
      toPocket: withdrawDestination,
      category: "Owner's Draw (Salary)",
      amount: amt,
      date: new Date().toISOString(),
      note: `Profit withdrawal to ${withdrawDestination === 'cash' ? 'Cash in Hand' : 'Personal Bank'}`,
    });

    setWithdrawAmount('');
    setIsWithdrawModalOpen(false);
    setNotification(`Withdrew ₹${amt.toLocaleString('en-IN')} profit to your ${withdrawDestination}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-cyan-500/15 p-4 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500" aria-hidden="true" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Hero Live Business Balance */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              <span>Live Business Money Tracker</span>
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-cyan-500 mt-2 tracking-tight tabular-nums">
              ₹{summary.businessBalance.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Active operating funds from freelancing, client gigs & side businesses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              aria-label="Create New Client Invoice"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>+ New Invoice</span>
            </button>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-[var(--bg-surface-elevated)] px-4 py-2.5 text-xs font-bold text-cyan-500 border border-[var(--border-color)] hover:border-cyan-500/40 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              aria-label="Owner's Draw Profit Transfer"
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              <span>Owner Draw</span>
            </button>
          </div>
        </div>

        {/* 4 Business Health Metrics in a Bento Strip */}
        <div className="mt-6 pt-6 border-t border-[var(--border-color)] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Gross Revenue</span>
            <p className="text-lg font-black text-emerald-500 mt-0.5 tabular-nums">
              ₹{summary.businessMetrics.grossRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Operating Expenses</span>
            <p className="text-lg font-black text-rose-500 mt-0.5 tabular-nums">
              ₹{summary.businessMetrics.operatingExpenses.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Net Profit</span>
            <p className="text-lg font-black text-[var(--text-primary)] mt-0.5 tabular-nums">
              ₹{summary.businessMetrics.netProfit.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Profit Margin</span>
            <p className="text-lg font-black text-cyan-500 mt-0.5 tabular-nums">
              {summary.businessMetrics.profitMargin}%
            </p>
          </div>
        </div>
      </div>

      {/* Pending Client Receivables */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">Pending Receivables</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Unpaid client milestones & freelance invoices
            </p>
          </div>

          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500 border border-amber-500/30 tabular-nums">
            Total Due: ₹{summary.businessMetrics.pendingReceivables.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="mt-4 divide-y divide-[var(--border-color)]">
          {pendingInvoices.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-[var(--text-secondary)]">All client invoices have been collected! No pending dues.</p>
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="mt-3 text-xs font-bold text-cyan-500 hover:text-cyan-600 min-h-[36px]"
              >
                + Create new invoice
              </button>
            </div>
          ) : (
            pendingInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3.5 hover:bg-[var(--bg-surface-elevated)] px-2 rounded-2xl transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                    <UserCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {inv.businessDetails?.clientName || 'Client'}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">{inv.note}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm sm:text-base font-black text-amber-500 tabular-nums">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleMarkAsPaid(inv)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30 transition-transform duration-150 active:scale-[0.96] min-h-[40px]"
                    aria-label={`Mark invoice for ${inv.businessDetails?.clientName} as collected`}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Collected</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Business Cashflow Stream */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Business Cashflow Stream</h3>
            <p className="text-xs text-[var(--text-muted)]">Revenues, tools, hosting & operational spend</p>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 rounded-2xl bg-cyan-500/15 px-3.5 py-2 text-xs font-bold text-cyan-500 border border-cyan-500/30 hover:bg-cyan-500/25 transition-transform duration-150 active:scale-[0.96] min-h-[40px]"
            aria-label="Add Business Transaction"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Business Entry</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-[var(--border-color)]">
          {businessTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--text-secondary)]">No business transactions logged yet.</p>
          ) : (
            businessTransactions.map((tx) => {
              const isRevenue = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 hover:bg-[var(--bg-surface-elevated)] px-2 rounded-2xl transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isRevenue ? 'bg-cyan-500/15 text-cyan-500' : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      <Briefcase className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">{tx.note || tx.category}</p>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {tx.category} {tx.businessDetails?.clientName ? `• ${tx.businessDetails.clientName}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold tabular-nums ${
                        isRevenue ? 'text-cyan-500' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {isRevenue ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Invoice Modal (Mobile Bottom-Sheet on mobile, Dialog on desktop) */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Create Client Invoice</h3>
                <p className="text-xs text-[var(--text-muted)]">Track money pending from clients or gigs</p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  placeholder="e.g. Acme Tech, Campus Cafe, Design Client"
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Project Milestone Note</label>
                <input
                  type="text"
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="e.g. 50% advance for website design"
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-transform duration-150 active:scale-[0.96] shadow-md shadow-cyan-500/20 min-h-[44px]"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner Draw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Owner&apos;s Draw (Take Profits)</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Withdraw earnings from business into personal pocket money
                </p>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleOwnerDraw} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Withdraw to:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawDestination('bank')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                      withdrawDestination === 'bank'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Personal Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawDestination('cash')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                      withdrawDestination === 'cash'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Cash in Hand
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Amount (Max: ₹{summary.businessBalance.toLocaleString('en-IN')})
                </label>
                <input
                  type="number"
                  max={summary.businessBalance}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="2000"
                  className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[44px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-transform duration-150 active:scale-[0.96] shadow-md shadow-cyan-500/20 min-h-[44px]"
                >
                  Transfer Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
