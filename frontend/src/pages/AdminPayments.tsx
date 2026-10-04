import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, X, MoreVertical, ChevronLeft, ChevronRight, 
  CreditCard, CheckCircle2, Clock, XCircle, RefreshCcw, 
  Building2, FileText, ArrowUpRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';

const KPI_CARDS = [
  { id: 'totalRevenue', label: 'Total Revenue', icon: CreditCard, color: 'emerald', bg: 'bg-emerald-500/10' },
  { id: 'successful', label: 'Successful', icon: CheckCircle2, color: 'teal', bg: 'bg-teal-500/10' },
  { id: 'pending', label: 'Pending', icon: Clock, color: 'amber', bg: 'bg-amber-500/10' },
  { id: 'failed', label: 'Failed', icon: XCircle, color: 'red', bg: 'bg-red-500/10' },
  { id: 'refunded', label: 'Refunded', icon: RefreshCw, color: 'purple', bg: 'bg-purple-500/10' }
];

export function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  
  // Data
  const [plans, setPlans] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({ totalRevenue: 0, successfulCount: 0, pendingCount: 0, failedCount: 0, refundedAmount: 0 });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Modals
  const [confirmVerify, setConfirmVerify] = useState<any>(null);
  const [confirmReject, setConfirmReject] = useState<any>(null);
  const [confirmRefund, setConfirmRefund] = useState<any>(null);
  
  // Fetch Plans once
  useEffect(() => {
    api.get('/public/plans').then(res => {
      setPlans(res.data || []);
    }).catch(console.error);
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/payments`, {
        params: { search, status: statusFilter, type: typeFilter, plan: planFilter, date: dateFilter, page, limit }
      });
      setPayments(res.data.payments || []);
      setTotal(res.data.pagination?.total || 0);
      setKpis(res.data.kpis || {});
    } catch (err: any) {
      console.error(err);
      setError('Unable to load payment records.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, planFilter, dateFilter, page, limit]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchPayments();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchPayments]);

  const fetchDetails = async (id: string) => {
    setDrawerOpen(true);
    setSelectedId(id);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/admin/payments/${id}/details`);
      setDetails(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All Statuses');
    setTypeFilter('All Types');
    setPlanFilter('All Plans');
    setDateFilter('All Time');
    setPage(1);
  };

  const [actionError, setActionError] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<void>) => {
    setActionError(null);
    try {
      await action();
      await fetchPayments();
      if (selectedId) fetchDetails(selectedId);
      closeModals();
    } catch (e: any) {
      setActionError(e.response?.data?.error?.message || 'Action failed. Please try again.');
    }
  };

  const executeVerify = () => handleAction(async () => {
    await api.post('/admin/verify-payment', { companyId: confirmVerify.companyId._id, status: 'APPROVED' });
  });

  const executeReject = () => handleAction(async () => {
    await api.post('/admin/verify-payment', { companyId: confirmReject.companyId._id, status: 'REJECTED', rejectionReason: 'Admin Rejected' });
  });

  const executeRefund = () => handleAction(async () => {
    await api.post('/admin/refund', { submissionId: confirmRefund._id });
  });

  const closeModals = () => {
    setConfirmVerify(null);
    setConfirmReject(null);
    setConfirmRefund(null);
    setActionError(null);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'PENDING': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'REJECTED': return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'REFUNDED': return 'text-purple-400 border-purple-500/20 bg-purple-500/10';
      default: return 'text-gray-400 border-gray-500/20 bg-gray-500/10';
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Payment Records</h1>
        <p className="text-text-secondary mt-2">Manage payments, invoices, refunds, and billing transactions across the TrackSentra platform.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-surface-card border-border-subtle p-4 cursor-pointer hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(kpis.totalRevenue)}</h3>
            </div>
          </div>
        </Card>
        <Card className="bg-surface-card border-border-subtle p-4 cursor-pointer hover:border-teal-500/50 transition-all" onClick={() => setStatusFilter('APPROVED')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 text-teal-500 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">Successful</p>
              <h3 className="text-2xl font-bold text-white">{kpis.successfulCount}</h3>
              <p className="text-xs text-text-muted mt-1">payments</p>
            </div>
          </div>
        </Card>
        <Card className="bg-surface-card border-border-subtle p-4 cursor-pointer hover:border-amber-500/50 transition-all" onClick={() => setStatusFilter('PENDING')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-white">{kpis.pendingCount}</h3>
              <p className="text-xs text-text-muted mt-1">payments</p>
            </div>
          </div>
        </Card>
        <Card className="bg-surface-card border-border-subtle p-4 cursor-pointer hover:border-red-500/50 transition-all" onClick={() => setStatusFilter('REJECTED')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">Failed</p>
              <h3 className="text-2xl font-bold text-white">{kpis.failedCount}</h3>
              <p className="text-xs text-text-muted mt-1">payments</p>
            </div>
          </div>
        </Card>
        <Card className="bg-surface-card border-border-subtle p-4 cursor-pointer hover:border-purple-500/50 transition-all" onClick={() => setStatusFilter('REFUNDED')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
              <RefreshCw size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">Refunded</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(kpis.refundedAmount)}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by company, txn ID, invoice number or amount..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-card border border-border-subtle rounded-lg pl-11 pr-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface-card border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500">
          <option value="All Statuses">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Success</option>
          <option value="REJECTED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-surface-card border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500">
          <option value="All Types">All Types</option>
          <option value="Initial">Initial Subscription</option>
          <option value="Upgrade">Upgrade</option>
        </select>
        
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="bg-surface-card border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500">
          <option value="All Plans">All Plans</option>
          {plans.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
        </select>

        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-surface-card border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500">
          <option value="All Time">All Time</option>
          <option value="Today">Today</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="This Month">This Month</option>
        </select>

        {(search || statusFilter !== 'All Statuses' || typeFilter !== 'All Types' || planFilter !== 'All Plans' || dateFilter !== 'Last 30 Days') && (
          <Button variant="ghost" onClick={clearFilters} className="text-text-muted hover:text-white px-3 py-2 text-sm">
            Clear
          </Button>
        )}
      </div>

      {error ? (
        <Card className="p-8 text-center bg-red-500/5 border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-400 mb-1">Something went wrong</h3>
          <p className="text-sm text-red-400/80 mb-4">{error}</p>
          <Button onClick={fetchPayments} className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Try Again</Button>
        </Card>
      ) : (
        <Card className="bg-surface-card border-border-subtle p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-main/50">
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Transaction</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Company</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Plan</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Payment Date</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-4"><div className="h-4 bg-surface-main rounded w-full"></div></td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center">
                        <CreditCard size={40} className="text-border-subtle mb-4" />
                        <p className="text-text-muted font-medium">No payment records found.</p>
                        <p className="text-sm text-text-secondary mt-1">Try clearing your filters.</p>
                        <Button onClick={clearFilters} variant="outline" className="mt-4">Clear Filters</Button>
                      </div>
                    </td>
                  </tr>
                ) : payments.map(payment => (
                  <tr key={payment._id} className="hover:bg-surface-main/40 transition-colors group">
                    <td className="p-4">
                      <div className="font-mono text-sm font-medium text-text-main cursor-pointer hover:text-emerald-400" onClick={() => fetchDetails(payment._id)}>
                        {payment.transactionReference}
                      </div>
                      <div className="text-xs text-text-muted mt-1 truncate max-w-[200px]">
                        {payment._id}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-main flex items-center justify-center font-bold text-emerald-400 border border-border-subtle">
                          {payment.companyId?.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-text-main">{payment.companyId?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {payment.targetPlanId?.name || payment.subscriptionId?.planSnapshot?.name || 'Unknown'}
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {payment.isUpgrade ? 'Upgrade' : 'Initial'}
                    </td>
                    <td className="p-4 font-bold text-white text-sm">
                      {formatCurrency(payment.expectedAmount)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-wider ${getStatusColor(payment.status)}`}>
                        {payment.status === 'APPROVED' ? 'SUCCESS' : payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-muted">
                      <div>{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs mt-0.5">{new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status === 'PENDING' && (
                          <Button size="sm" onClick={() => setConfirmVerify(payment)} className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-1 text-xs font-bold h-8 border-none">
                            Verify
                          </Button>
                        )}
                        <button onClick={() => fetchDetails(payment._id)} className="p-1.5 text-text-muted hover:text-white rounded bg-surface-main opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="p-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-4 bg-surface-main/20">
              <div className="text-sm text-text-muted">
                Showing <span className="font-medium text-text-main">{(page - 1) * limit + 1}</span> - <span className="font-medium text-text-main">{Math.min(page * limit, total)}</span> of <span className="font-medium text-text-main">{total}</span> payments
              </div>
              <div className="flex items-center gap-4">
                <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="bg-surface-card border border-border-subtle rounded px-2 py-1 text-sm text-text-main">
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-surface-card disabled:opacity-50 text-text-muted">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium px-2 text-white">{page}</span>
                  <button onClick={() => setPage(p => Math.min(Math.ceil(total/limit), p + 1))} disabled={page >= Math.ceil(total/limit)} className="p-1 rounded hover:bg-surface-card disabled:opacity-50 text-text-muted">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-[450px] max-w-full bg-[#111318] border-l border-border-subtle z-50 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-[#111318]/90 backdrop-blur border-b border-border-subtle px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">Payment Details</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-surface-main rounded-full text-text-muted transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {detailsLoading || !details ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-8 bg-surface-main rounded w-24"></div>
                  <div className="space-y-3"><div className="h-4 bg-surface-main rounded w-full"></div><div className="h-4 bg-surface-main rounded w-2/3"></div></div>
                  <div className="space-y-3"><div className="h-24 bg-surface-main rounded w-full"></div></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${getStatusColor(details.payment.status)}`}>
                      {details.payment.status === 'APPROVED' ? 'SUCCESS' : details.payment.status}
                    </span>
                    <span className="text-sm text-text-muted">
                      {new Date(details.payment.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {details.payment.status === 'PENDING' && (
                      <>
                        <Button className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400 font-bold" onClick={() => { setDrawerOpen(false); setConfirmVerify(details.payment); }}>
                          Verify Payment
                        </Button>
                        <Button className="flex-1 bg-surface-main text-red-400 hover:bg-red-500/10 border border-border-subtle" onClick={() => { setDrawerOpen(false); setConfirmReject(details.payment); }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {details.payment.status === 'APPROVED' && (
                      <Button className="w-full bg-surface-main text-purple-400 hover:bg-purple-500/10 border border-border-subtle" onClick={() => { setDrawerOpen(false); setConfirmRefund(details.payment); }}>
                        Refund Payment
                      </Button>
                    )}
                  </div>

                  {/* Info Sections */}
                  <section>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Transaction Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-text-secondary">Transaction ID</span><span className="font-mono text-white">{details.payment.transactionReference}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Gateway ID</span><span className="font-mono text-text-muted">{details.payment._id}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Payment Type</span><span className="text-white">{details.payment.isUpgrade ? 'Subscription Upgrade' : 'Initial Subscription'}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Amount</span><span className="font-bold text-white">{formatCurrency(details.payment.expectedAmount)}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Currency</span><span className="text-white">{details.payment.currency || 'INR'}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Paid At</span><span className="text-white">{details.payment.paymentDate ? new Date(details.payment.paymentDate).toLocaleString() : 'N/A'}</span></div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Company Information</h3>
                    <div className="bg-surface-main/30 rounded-lg p-4 border border-border-subtle">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-main flex items-center justify-center font-bold text-xl text-emerald-400 border border-border-subtle">
                          {details.payment.companyId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{details.payment.companyId?.name}</p>
                          <p className="text-xs font-mono text-text-muted">{details.payment.companyId?._id}</p>
                        </div>
                      </div>
                      <div className="text-sm flex justify-between items-center">
                        <span className="text-text-secondary">Admin Email</span>
                        <span className="text-white">{details.companyAdminEmail || 'N/A'}</span>
                      </div>
                    </div>
                  </section>

                  {details.subscription && (
                    <section>
                      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Subscription Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Plan</span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{details.subscription.planSnapshot?.name || details.subscription.planId?.name}</span>
                        </div>
                        <div className="flex justify-between"><span className="text-text-secondary">Status</span><span className="text-white">{details.subscription.status}</span></div>
                        <div className="flex justify-between"><span className="text-text-secondary">Current Period</span><span className="text-white">{details.subscription.currentPeriodStart ? new Date(details.subscription.currentPeriodStart).toLocaleDateString() : 'N/A'} → {details.subscription.currentPeriodEnd ? new Date(details.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</span></div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Invoice Information</h3>
                    {details.invoice ? (
                      <div className="bg-surface-main/30 rounded-lg p-4 border border-border-subtle space-y-3">
                        <div className="flex items-center gap-2 font-mono text-sm text-white border-b border-border-subtle pb-2">
                          <FileText size={16} className="text-text-muted" />
                          {details.invoice.invoiceNumber}
                        </div>
                        <div className="flex justify-between text-sm"><span className="text-text-secondary">Status</span><span className={details.invoice.status === 'PAID' ? 'text-emerald-400' : 'text-text-muted'}>{details.invoice.status}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-text-secondary">Amount</span><span className="text-white font-bold">{formatCurrency(details.invoice.amount)}</span></div>
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted italic">Invoice not generated.</p>
                    )}
                  </section>

                  {details.timeline && details.timeline.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Payment Timeline</h3>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-subtle before:to-transparent">
                        {details.timeline.map((event: any, i: number) => (
                          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-surface-card bg-emerald-500/20 text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-surface-main/30 border border-border-subtle ml-4 md:ml-0 shadow-sm">
                              <h4 className="text-sm font-bold text-white">{event.eventType.replace(/_/g, ' ')}</h4>
                              <p className="text-xs text-text-muted mt-1">{new Date(event.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirm Modals */}
      {confirmVerify && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-border-subtle animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-2">Verify Payment</h2>
            <p className="text-text-secondary text-sm mb-6">Are you sure you want to approve this payment? This will activate the subscription and generate an invoice.</p>
            
            {actionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-6 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{actionError}</p>
              </div>
            )}

            <div className="bg-surface-main rounded p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Company:</span><span className="text-white font-medium">{confirmVerify.companyId.name}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Amount:</span><span className="text-white font-bold">{formatCurrency(confirmVerify.expectedAmount)}</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={closeModals}>Cancel</Button>
              <Button className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400" onClick={executeVerify}>Approve Payment</Button>
            </div>
          </Card>
        </div>
      )}

      {confirmReject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-border-subtle animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-2">Reject Payment</h2>
            <p className="text-text-secondary text-sm mb-6">Rejecting this payment will mark the associated subscription as Past Due.</p>

            {actionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-6 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{actionError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={closeModals}>Cancel</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={executeReject}>Reject Payment</Button>
            </div>
          </Card>
        </div>
      )}

      {confirmRefund && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-border-subtle animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-2">Refund Payment</h2>
            <p className="text-text-secondary text-sm mb-6">Are you sure you want to process a full refund? The invoice will be marked as VOID.</p>

            {actionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-6 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{actionError}</p>
              </div>
            )}

            <div className="bg-surface-main rounded p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Refund Amount:</span><span className="text-purple-400 font-bold">{formatCurrency(confirmRefund.expectedAmount)}</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={closeModals}>Cancel</Button>
              <Button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white" onClick={executeRefund}>Refund Full Amount</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
