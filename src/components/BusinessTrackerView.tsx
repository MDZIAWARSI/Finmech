'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  FileText,
  Building,
  UserCheck,
  Send,
  Calendar,
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

  // Filter business transactions
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
    // In our storage, we can log an update or re-add as settled
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
    setNotification(`Payment of ₹${tx.amount} received into Live Business Money!`);
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
    setNotification(`Withdrew ₹${amt} profit to your ${withdrawDestination}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 pb-20">
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-cyan-950/80 p-4 border border-cyan-500/40 text-cyan-300 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Live Business Balance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950/60 via-[#0d1322] to-slate-900 p-6 sm:p-8 border border-cyan-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Briefcase className="h-4 w-4" />
              <span>Live Business Money Tracker</span>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              ₹{summary.businessBalance.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Active operating funds from freelancing, client gigs & side businesses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>+ New Invoice</span>
            </button>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-950/40 transition-all"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Owner Draw</span>
            </button>
          </div>
        </div>

        {/* 4 Business Health Metrics */}
        <div className="mt-6 pt-6 border-t border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-slate-400">Gross Revenue</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              ₹{summary.businessMetrics.grossRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Operating Expenses</span>
            <p className="text-lg font-bold text-rose-400 mt-0.5">
              ₹{summary.businessMetrics.operatingExpenses.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Net Profit</span>
            <p className="text-lg font-bold text-white mt-0.5">
              ₹{summary.businessMetrics.netProfit.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Profit Margin</span>
            <p className="text-lg font-bold text-cyan-400 mt-0.5">
              {summary.businessMetrics.profitMargin}%
            </p>
          </div>
        </div>
      </div>

      {/* Pending Client Receivables */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold text-slate-100">Pending Client Receivables</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Unpaid client milestones & freelance invoices
            </p>
          </div>

          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
            Total Due: ₹{summary.businessMetrics.pendingReceivables.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-800/60">
          {pendingInvoices.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-400">All client invoices have been collected! No pending dues.</p>
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                + Create new invoice
              </button>
            </div>
          ) : (
            pendingInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3.5 hover:bg-slate-800/30 px-2 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">
                      {inv.businessDetails?.clientName || 'Client'}
                    </p>
                    <p className="text-[11px] text-slate-400">{inv.note}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-amber-300">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleMarkAsPaid(inv)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Collected</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Business Activity Stream */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Business Cashflow Stream</h3>
            <p className="text-xs text-slate-400">Revenues, software tools & operational spend</p>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 rounded-xl bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Business Entry</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-800/60">
          {businessTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No business transactions logged yet.</p>
          ) : (
            businessTransactions.map((tx) => {
              const isRevenue = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 hover:bg-slate-800/20 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isRevenue ? 'bg-cyan-500/15 text-cyan-400' : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{tx.note || tx.category}</p>
                      <span className="text-[11px] text-slate-400">
                        {tx.category} {tx.businessDetails?.clientName ? `• ${tx.businessDetails.clientName}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        isRevenue ? 'text-cyan-400' : 'text-slate-200'
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

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Create Client Invoice</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track money pending from clients or gigs</p>
            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  placeholder="e.g. Acme Tech, Local Bakery, Design Client"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Milestone Note</label>
                <input
                  type="text"
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="e.g. 50% advance for logo design & poster"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Owner&apos;s Draw (Take Profits)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Withdraw earnings from business into personal pocket money
            </p>
            <form onSubmit={handleOwnerDraw} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Withdraw to:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawDestination('bank')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      withdrawDestination === 'bank'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Personal Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawDestination('cash')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      withdrawDestination === 'cash'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Cash in Hand
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount (Max: ₹{summary.businessBalance.toLocaleString('en-IN')})
                </label>
                <input
                  type="number"
                  max={summary.businessBalance}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="2000"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
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

