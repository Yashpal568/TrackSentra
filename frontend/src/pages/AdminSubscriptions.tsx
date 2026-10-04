import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { CreditCard, Clock, Building2, Eye, Ban, History, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/admin/subscriptions'); // We will add this backend route next
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error(err);
      // Fallback for now if backend is not ready
      setSubscriptions([
         { 
           _id: '1', 
           companyId: { _id: 'c1', name: 'Acme Security', email: 'admin@acmesecurity.com', phone: '+91 9876543210' }, 
           planSnapshot: { name: 'Enterprise Plan', price: 39900, currency: 'USD', billingInterval: 'monthly', limits: { maxGuards: 100, maxSites: 20 } }, 
           status: 'active', 
           startDate: new Date(Date.now() - 86400000 * 60).toISOString(),
           currentPeriodStart: new Date(Date.now() - 86400000 * 10).toISOString(),
           currentPeriodEnd: new Date(Date.now() + 86400000 * 20).toISOString(),
           history: [
             { date: new Date(Date.now() - 86400000 * 60).toISOString(), event: 'Subscription Created', details: 'Started Enterprise Plan' },
             { date: new Date(Date.now() - 86400000 * 30).toISOString(), event: 'Payment Received', details: '₹3,990 via Credit Card' },
             { date: new Date(Date.now() - 86400000 * 10).toISOString(), event: 'Subscription Renewed', details: 'Automatic renewal successful' },
           ]
         },
         { 
           _id: '2', 
           companyId: { _id: 'c2', name: 'Vanguard Ops', email: 'billing@vanguardops.com', phone: '+91 9123456789' }, 
           planSnapshot: { name: 'Professional Plan', price: 12900, currency: 'USD', billingInterval: 'monthly', limits: { maxGuards: 25, maxSites: 5 } }, 
           status: 'past_due', 
           startDate: new Date(Date.now() - 86400000 * 90).toISOString(),
           currentPeriodStart: new Date(Date.now() - 86400000 * 32).toISOString(),
           currentPeriodEnd: new Date(Date.now() - 86400000 * 2).toISOString(),
           history: [
             { date: new Date(Date.now() - 86400000 * 90).toISOString(), event: 'Subscription Created', details: 'Started Professional Plan' },
             { date: new Date(Date.now() - 86400000 * 2).toISOString(), event: 'Payment Failed', details: 'Card declined - Insufficient funds' },
           ]
         }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'past_due': return 'destructive';
      case 'canceled': return 'secondary';
      case 'pending_payment': return 'warning';
      default: return 'outline';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 border-4 border-emerald-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleSuspend = async (subId: string) => {
    try {
      await api.put(`/admin/subscriptions/${subId}/suspend`);
      setSubscriptions(subscriptions.map(s => s._id === subId ? { ...s, status: 'SUSPENDED' } : s));
    } catch (err) {
      alert('Failed to suspend');
    }
    setShowSuspendModal(false);
  };

  const handleApprovePayment = async (subId: string, companyId: string) => {
    try {
      await api.post(`/admin/verify-payment`, {
        companyId,
        status: 'approved'
      });
      fetchSubscriptions(); // Refresh to get active status
    } catch (err: any) {
      alert(err.userMessage || 'Failed to approve');
    }
  };

  const handleRejectPayment = async (subId: string, companyId: string) => {
    try {
      await api.post(`/admin/verify-payment`, {
        companyId,
        status: 'rejected'
      });
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.userMessage || 'Failed to reject');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Active Subscriptions</h1>
          <p className="text-text-secondary mt-1">Monitor all tenant plans, billing cycles, and MRR.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-border-subtle p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CreditCard size={24} /></div>
          <div><p className="text-sm font-bold text-text-muted">Total Active</p><p className="text-2xl font-black text-white">{subscriptions.filter(s => s.status?.toUpperCase() === 'ACTIVE').length}</p></div>
        </div>
        <div className="bg-surface-card border border-border-subtle p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><Clock size={24} /></div>
          <div><p className="text-sm font-bold text-text-muted">Past Due</p><p className="text-2xl font-black text-white">{subscriptions.filter(s => s.status?.toUpperCase() === 'PAST_DUE').length}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border-subtle">
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Tenant / Company</th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Plan Name</th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Billing</th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Next Renewal</th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {subscriptions.map((sub) => (
                <tr key={sub._id} className="hover:bg-surface-hover/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-500">
                        <Building2 size={14} />
                      </div>
                      <span className="font-bold text-sm text-text-main group-hover:text-emerald-400 transition-colors">{sub.companyId?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-sm text-text-secondary">{sub.planSnapshot?.name || 'N/A'}</td>
                  <td className="p-4 font-bold text-sm text-text-main">
                    ₹{((sub.planSnapshot?.price || 0) / 100).toLocaleString('en-IN')} <span className="text-xs text-text-muted font-medium">/{sub.planSnapshot?.billingInterval}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={getStatusColor(sub.status)} className="uppercase text-[10px] tracking-wider">{sub.status}</Badge>
                  </td>
                  <td className="p-4 text-sm text-text-secondary font-medium">
                    {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {sub.status?.toUpperCase() === 'PENDING_PAYMENT' ? (
                         <Button 
                           size="sm" 
                           onClick={() => setSelectedSub(sub)}
                           className="bg-amber-600 hover:bg-amber-500 text-white border-0 text-xs py-1 h-7 flex items-center gap-1.5"
                         >
                           <Eye size={12} /> Review Payment
                         </Button>
                       ) : (
                         <>
                           <button onClick={() => setSelectedSub(sub)} className="p-2 bg-surface-main hover:bg-surface-hover rounded-lg text-slate-400 hover:text-emerald-400 transition-colors tooltip-trigger" title="View Details & Timeline">
                             <Eye size={16} />
                           </button>
                           <button 
                             onClick={() => { setSelectedSub(sub); setShowSuspendModal(true); }} 
                             className="p-2 bg-surface-main hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors tooltip-trigger" 
                             title={sub.status?.toUpperCase() === 'SUSPENDED' ? 'Unsuspend' : 'Suspend Company'}
                           >
                             <Ban size={16} />
                           </button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">No subscriptions found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {selectedSub && !showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSub(null)}></div>
          <div className="bg-surface-card border border-border-subtle rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95 shadow-2xl">
            <div className="p-6 border-b border-border-subtle flex justify-between items-start bg-surface-main/30 sticky top-0 backdrop-blur-md z-20">
               <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                     {selectedSub.companyId?.name} <Badge variant={getStatusColor(selectedSub.status)} className="uppercase text-[10px] tracking-wider">{selectedSub.status}</Badge>
                  </h2>
                  <p className="text-sm font-medium text-text-muted mt-1">{selectedSub.companyId?.email} • {selectedSub.companyId?.phone}</p>
               </div>
               <button onClick={() => setSelectedSub(null)} className="p-2 rounded-full hover:bg-surface-hover text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
               </button>
            </div>
            
            <div className="p-6 space-y-8">
               {/* Overview */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface-main rounded-xl p-4 border border-border-subtle">
                     <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Plan</p>
                     <p className="text-sm font-bold text-white">{selectedSub.planSnapshot?.name}</p>
                  </div>
                  <div className="bg-surface-main rounded-xl p-4 border border-border-subtle">
                     <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Price</p>
                     <p className="text-sm font-bold text-white">₹{((selectedSub.planSnapshot?.price || 0) / 100).toLocaleString('en-IN')}/{selectedSub.planSnapshot?.billingInterval}</p>
                  </div>
                  <div className="bg-surface-main rounded-xl p-4 border border-border-subtle">
                     <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Guards Limit</p>
                     <p className="text-sm font-bold text-white">{selectedSub.planSnapshot?.limits?.maxGuards || 'Unlimited'}</p>
                  </div>
                  <div className="bg-surface-main rounded-xl p-4 border border-border-subtle">
                     <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Sites Limit</p>
                     <p className="text-sm font-bold text-white">{selectedSub.planSnapshot?.limits?.maxSites || 'Unlimited'}</p>
                  </div>
               </div>

               {/* Payment Verification Block */}
               {selectedSub.status?.toUpperCase() === 'PENDING_PAYMENT' && (
                 <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex-1">
                       <h3 className="text-lg font-black text-amber-500 mb-2">
                         {selectedSub.paymentSubmission ? 'Payment Verification Required' : 'Awaiting Payment Submission'}
                       </h3>
                       {selectedSub.paymentSubmission ? (
                         <div className="space-y-2 mt-4">
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-text-muted w-32">UTR / Ref No:</span>
                             <span className="text-sm font-mono bg-black/40 text-white px-2 py-1 rounded select-all">{selectedSub.paymentSubmission.transactionReference}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-text-muted w-32">Submitted On:</span>
                             <span className="text-sm font-bold text-white">{new Date(selectedSub.paymentSubmission.paymentDate || selectedSub.paymentSubmission.createdAt).toLocaleString()}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-text-muted w-32">Expected Amt:</span>
                             <span className="text-sm font-bold text-white">₹{((selectedSub.paymentSubmission.expectedAmount || 0) / 100).toLocaleString('en-IN')}</span>
                           </div>
                         </div>
                       ) : (
                         <p className="text-sm text-text-secondary font-medium mt-2">
                           This company has not yet submitted a UTR or payment reference. You can manually approve if payment was verified out-of-band.
                         </p>
                       )}
                     </div>
                     <div className="flex flex-col gap-3 shrink-0">
                       <Button 
                         className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 w-full"
                         onClick={() => { handleApprovePayment(selectedSub._id, selectedSub.companyId?._id); setSelectedSub(null); }}
                       >
                         <CheckCircle2 size={16} className="mr-2" /> Approve Payment
                       </Button>
                       <Button 
                         variant="destructive" 
                         className="w-full"
                         onClick={() => { handleRejectPayment(selectedSub._id, selectedSub.companyId?._id); setSelectedSub(null); }}
                       >
                         <Ban size={16} className="mr-2" /> Reject
                       </Button>
                     </div>
                   </div>
                 </div>
               )}

               {/* Timeline History */}
               <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                     <History size={16} className="text-emerald-500" /> Subscription Timeline & History
                  </h3>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-subtle before:to-transparent">
                     {selectedSub.history?.map((evt: any, i: number) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                           {/* Marker */}
                           <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-card bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                              <CheckCircle2 size={16} />
                           </div>
                           
                           <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-main p-4 rounded-xl border border-border-subtle shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                 <h4 className="font-bold text-sm text-white">{evt.event}</h4>
                                 <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-surface-sidebar px-2 py-0.5 rounded">{new Date(evt.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-text-secondary font-medium">{evt.details}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-main/30 flex justify-end gap-3 rounded-b-3xl">
               <Button variant="secondary" onClick={() => setSelectedSub(null)}>Close</Button>
               <Button 
                 className="bg-emerald-600 hover:bg-emerald-500 border-0 text-white"
                 onClick={() => {
                   setSelectedSub(null);
                   navigate(`/admin/companies?search=${encodeURIComponent(selectedSub.companyId.name)}`);
                 }}
               >
                 View Full Profile
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSuspendModal(false)}></div>
          <div className="bg-surface-card border border-border-subtle rounded-3xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 shadow-2xl p-6 text-center">
             <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Ban size={32} />
             </div>
             <h2 className="text-xl font-black text-white mb-2">Suspend {selectedSub.companyId?.name}?</h2>
             <p className="text-sm font-medium text-text-secondary mb-6">
               This will immediately revoke all access for their company admins and guards. Active patrols will be interrupted.
             </p>
             <div className="flex gap-3">
               <Button variant="secondary" className="flex-1" onClick={() => setShowSuspendModal(false)}>Cancel</Button>
               <Button className="flex-1 bg-red-600 hover:bg-red-500 border-0 text-white" onClick={() => handleSuspend(selectedSub._id)}>Yes, Suspend Account</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
