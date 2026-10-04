import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { 
  Building2, Search, MoreHorizontal, ChevronLeft, ChevronRight, 
  Plus, Check, X, Building, Users, MapPin, CheckCircle2, 
  AlertTriangle, FlaskConical, Filter, Calendar, Zap, CreditCard, Ban, FileWarning
} from 'lucide-react';

export function AdminCompanies() {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const [companies, setCompanies] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({ total: 0, active: 0, trial: 0, pending: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Action Menu
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  // View Details Modal
  const [viewCompanyId, setViewCompanyId] = useState<string | null>(null);
  const viewCompany = useMemo(() => companies.find(c => c._id === viewCompanyId), [companies, viewCompanyId]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(false);
      let url = `/admin/companies?page=${page}&limit=${limit}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (planFilter !== 'all') url += `&plan=${planFilter}`;
      if (dateFilter !== 'all') url += `&dateRange=${dateFilter}`;

      const { data } = await api.get(url);
      setCompanies(data.companies || []);
      setKpis(data.kpis || { total: 0, active: 0, trial: 0, pending: 0, suspended: 0 });
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [debouncedSearch, statusFilter, planFilter, dateFilter, page, limit]);

  useEffect(() => {
    const handleOutsideClick = () => setOpenActionId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const getStatusPill = (status: string) => {
    const s = (status || '').toUpperCase();
    if (['ACTIVE', 'ACTIVE'].includes(s)) {
      return (
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
          Active
        </div>
      );
    }
    if (s === 'PENDING_PAYMENT') {
      return (
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
          Pending Payment
        </div>
      );
    }
    if (s === 'SUSPENDED') {
      return (
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
          Suspended
        </div>
      );
    }
    if (s === 'TRIAL') {
      return (
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
          Trial
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
        {s || 'UNKNOWN'}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const handleActionClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenActionId(openActionId === id ? null : id);
  };

  const handleSuspendCompany = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this company? This will revoke all access.')) return;
    try {
      await api.put(`/admin/companies/${id}/suspend`);
      setOpenActionId(null);
      fetchCompanies();
    } catch (err) {
      console.error('Failed to suspend company', err);
      alert('Failed to suspend company');
    }
  };

  const handleImpersonateCompany = async (id: string) => {
    try {
      await api.post(`/admin/companies/${id}/impersonate`);
      await checkAuth(); // Refresh auth state to load the impersonation token
      window.location.href = '/dashboard'; // Force full reload to reset all states just in case
    } catch (err) {
      console.error('Impersonation failed:', err);
      alert('Failed to impersonate company.');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to DELETE this company? This action is permanent and destroys all associated data.')) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      setOpenActionId(null);
      fetchCompanies();
    } catch (err) {
      console.error('Failed to delete company', err);
      alert('Failed to delete company');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* BREADCRUMB */}
      <div className="flex items-center text-xs font-medium text-text-muted mb-4 gap-2">
        <span>Platform Control</span>
        <ChevronRight size={12} className="opacity-50" />
        <span className="text-emerald-400">Companies</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Company Management</h1>
          <p className="text-text-secondary mt-1">Monitor, search, and manage all tenant companies on TrackSentra.</p>
        </div>
        <Button 
          onClick={() => alert('Create company modal coming soon')}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.25)] border-0 flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={3} /> Create Company
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { icon: <Building2 size={20} className="text-emerald-400" />, label: 'Total Companies', value: kpis.total, trend: '↑ 33%', color: 'border-emerald-500/20 bg-emerald-500/5' },
          { icon: <CheckCircle2 size={20} className="text-emerald-400" />, label: 'Active Companies', value: kpis.active, trend: '↑ 0%', color: 'border-emerald-500/20 bg-emerald-500/5' },
          { icon: <FlaskConical size={20} className="text-blue-400" />, label: 'Trial Companies', value: kpis.trial, trend: '→ 0%', color: 'border-blue-500/20 bg-blue-500/5' },
          { icon: <CreditCard size={20} className="text-amber-400" />, label: 'Pending Payment', value: kpis.pending, trend: '↑ 100%', color: 'border-amber-500/20 bg-amber-500/5' },
          { icon: <Ban size={20} className="text-red-400" />, label: 'Suspended', value: kpis.suspended, trend: '↓ 0%', color: 'border-red-500/20 bg-red-500/5' },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg border ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className="text-sm font-bold text-text-secondary">{kpi.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-text-main">{kpi.value}</span>
              <div className="text-right">
                <span className={`text-xs font-bold ${kpi.trend.startsWith('↑') ? 'text-emerald-400' : kpi.trend.startsWith('↓') ? 'text-red-400' : 'text-text-muted'}`}>
                  {kpi.trend}
                </span>
                <p className="text-[10px] text-text-muted">vs last month</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col xl:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search companies by name, ID, plan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-card border border-border-subtle rounded-lg pl-11 pr-4 py-3 text-sm text-text-main focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-card border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-main focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          
          <select 
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-surface-card border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-main focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer min-w-[150px]"
          >
            <option value="all">All Plans</option>
            <option value="Starter Plan">Starter Plan</option>
            <option value="Professional Plan">Professional Plan</option>
            <option value="Enterprise Plan">Enterprise Plan</option>
          </select>

          <div className="relative min-w-[150px]">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-surface-card border border-border-subtle rounded-lg pl-10 pr-4 py-3 text-sm text-text-main focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="all">Created At</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          <Button variant="outline" className="border-border-subtle text-text-secondary whitespace-nowrap">
            <Filter size={16} className="mr-2" /> More Filters
          </Button>
        </div>
      </div>

      {/* ERROR & LOADING */}
      {error ? (
        <div className="bg-surface-card border border-border-subtle rounded-xl p-12 text-center shadow-lg">
          <FileWarning size={48} className="mx-auto text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">Something went wrong</h3>
          <p className="text-text-secondary mb-6">We couldn't load company data right now.</p>
          <Button onClick={fetchCompanies} className="bg-emerald-500 text-white">Retry</Button>
        </div>
      ) : (
        /* TABLE */
        <div className="bg-surface-card border border-border-subtle rounded-xl overflow-x-auto shadow-lg">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] font-bold text-text-muted tracking-wider uppercase bg-surface-main/30">
                <th className="px-5 py-4 w-12 text-center"><input type="checkbox" className="rounded border-border-subtle bg-transparent" /></th>
                <th className="px-4 py-4">Company</th>
                <th className="px-4 py-4">Plan</th>
                <th className="px-4 py-4">Users</th>
                <th className="px-4 py-4">Sites</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Created</th>
                <th className="px-4 py-4">MRR</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-5"><div className="w-4 h-4 bg-border-subtle rounded mx-auto" /></td>
                    <td className="px-4 py-5"><div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-xl bg-border-subtle" /><div className="space-y-2"><div className="w-32 h-4 bg-border-subtle rounded" /><div className="w-24 h-3 bg-border-subtle rounded" /></div></div></td>
                    <td className="px-4 py-5"><div className="space-y-2"><div className="w-24 h-4 bg-border-subtle rounded" /><div className="w-16 h-3 bg-border-subtle rounded" /></div></td>
                    <td className="px-4 py-5"><div className="w-12 h-4 bg-border-subtle rounded" /></td>
                    <td className="px-4 py-5"><div className="w-12 h-4 bg-border-subtle rounded" /></td>
                    <td className="px-4 py-5"><div className="w-20 h-6 bg-border-subtle rounded-full" /></td>
                    <td className="px-4 py-5"><div className="space-y-2"><div className="w-20 h-4 bg-border-subtle rounded" /><div className="w-16 h-3 bg-border-subtle rounded" /></div></td>
                    <td className="px-4 py-5"><div className="w-12 h-4 bg-border-subtle rounded" /></td>
                    <td className="px-4 py-5"><div className="w-8 h-8 bg-border-subtle rounded mx-auto" /></td>
                  </tr>
                ))
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <Building2 size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-text-main mb-1">No companies found</h3>
                    <p className="text-text-secondary text-sm mb-6">Try changing your filters or create a new tenant.</p>
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-white">Create Company</Button>
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const hasPlan = !!company.subscription;
                  const price = company.mrr || 0;
                  
                  // Color for company icon
                  const statusColors: any = {
                    'ACTIVE': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    'PENDING_PAYMENT': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    'SUSPENDED': 'bg-red-500/10 text-red-500 border-red-500/20',
                  };
                  const iconColor = statusColors[(company.effectiveStatus || '').toUpperCase()] || 'bg-blue-500/10 text-blue-500 border-blue-500/20';

                  return (
                    <tr key={company._id} className="hover:bg-surface-main/30 transition-colors group">
                      <td className="px-5 py-4 w-12 text-center">
                        <input type="checkbox" className="rounded border-border-subtle bg-transparent" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconColor}`}>
                            <Building2 size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-main truncate cursor-pointer hover:text-emerald-400 transition-colors">{company.name}</p>
                            <p className="text-xs text-text-muted font-mono truncate">{company._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-text-main">{hasPlan ? company.subscription.planSnapshot.name : 'No Plan'}</p>
                        <p className="text-xs text-text-muted mt-0.5">{hasPlan ? `₹${(price / 100).toFixed(2)}/month` : '—'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <Users size={14} className="text-text-muted" /> {company.userCount || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <MapPin size={14} className="text-text-muted" /> {company.siteCount || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusPill(company.effectiveStatus)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-text-main">{formatDate(company.createdAt)}</p>
                        <p className="text-xs text-text-muted mt-0.5">{getRelativeTime(company.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-text-main">{hasPlan ? `₹${(price / 100).toFixed(2)}` : '—'}</p>
                      </td>
                      <td className="px-4 py-4 text-center relative">
                        <button 
                          onClick={(e) => handleActionClick(e, company._id)}
                          className="p-1.5 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* DROPDOWN MENU */}
                        {openActionId === company._id && (
                          <div className="absolute right-8 top-10 w-48 bg-surface-sidebar border border-border-subtle rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                            <button onClick={() => { setViewCompanyId(company._id); setOpenActionId(null); }} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-main hover:bg-surface-hover flex items-center gap-2">
                              <Search size={14} /> View Details
                            </button>
                            <button onClick={() => handleImpersonateCompany(company._id)} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-main hover:bg-surface-hover flex items-center gap-2">
                              <Building size={14} /> Open Company
                            </button>
                            <button onClick={() => navigate(`/admin/users?company=${company._id}`)} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-main hover:bg-surface-hover flex items-center gap-2">
                              <Users size={14} /> Manage Users
                            </button>
                            <button onClick={() => navigate(`/admin/subscriptions?search=${encodeURIComponent(company.name)}`)} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-main hover:bg-surface-hover flex items-center gap-2">
                              <Zap size={14} /> Subscription
                            </button>
                            <button onClick={() => navigate(`/admin/payments?search=${encodeURIComponent(company.name)}`)} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-main hover:bg-surface-hover flex items-center gap-2 border-b border-border-subtle pb-3 mb-1">
                              <CreditCard size={14} /> Payments
                            </button>
                            
                            <button onClick={() => handleSuspendCompany(company._id)} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                              <Ban size={14} /> Suspend Company
                            </button>
                            <button onClick={() => handleDeleteCompany(company._id)} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                              <X size={14} /> Delete Company
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {!loading && companies.length > 0 && (
            <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between bg-surface-main/30">
              <span className="text-sm text-text-muted">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, kpis.total)} of {kpis.total} companies
              </span>
              
              <div className="flex items-center gap-4">
                <select 
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="bg-surface-card border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none focus:border-emerald-500"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
                
                <div className="flex items-center gap-1">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-main"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button className="px-3 py-1 text-sm font-bold bg-emerald-500 text-white rounded-lg">
                    {page}
                  </button>
                  <button 
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-main"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* View Company Details Modal */}
      {viewCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
          <div className="bg-surface-sidebar border border-border-subtle rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-main">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Building2 className="text-emerald-500" />
                  {viewCompany.name}
                </h2>
                <p className="text-xs text-text-muted mt-1 font-mono">ID: {viewCompany._id}</p>
              </div>
              <button onClick={() => setViewCompanyId(null)} className="p-2 hover:bg-surface-hover rounded-full text-text-muted transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle">
                  <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Status</div>
                  {getStatusPill(viewCompany.effectiveStatus)}
                </div>
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle">
                  <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Created</div>
                  <div className="text-white font-medium">{formatDate(viewCompany.createdAt)}</div>
                </div>
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle">
                  <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Users</div>
                  <div className="text-white font-medium text-xl">{viewCompany.userCount}</div>
                </div>
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle">
                  <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Sites</div>
                  <div className="text-white font-medium text-xl">{viewCompany.siteCount}</div>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Subscription Snapshot</h3>
              {viewCompany.subscription ? (
                <div className="bg-surface-main p-5 rounded-2xl border border-border-subtle">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-lg font-bold text-emerald-400">{viewCompany.subscription.planSnapshot?.name || 'Unknown Plan'}</div>
                      <div className="text-xs text-text-secondary capitalize">{viewCompany.subscription.planSnapshot?.billingInterval} Billing</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white flex items-center justify-end">
                        <span className="text-sm text-text-muted mr-1 font-normal">MRR:</span>
                        ₹{viewCompany.mrr ? (viewCompany.mrr / 100).toLocaleString() : 0}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Guard Limit</div>
                      <div className="text-sm text-white font-medium">{viewCompany.subscription.planSnapshot?.limits?.maxGuards || 'Unlimited'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Site Limit</div>
                      <div className="text-sm text-white font-medium">{viewCompany.subscription.planSnapshot?.limits?.maxSites || 'Unlimited'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-main p-6 rounded-2xl border border-border-subtle text-center text-text-secondary">
                  No active subscription found.
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-main flex justify-end gap-3 mt-auto">
              <Button onClick={() => setViewCompanyId(null)} variant="secondary">Close</Button>
              <Button onClick={() => handleImpersonateCompany(viewCompany._id)} className="bg-emerald-600 hover:bg-emerald-500">
                <Building size={16} className="mr-2" /> Open Company Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
