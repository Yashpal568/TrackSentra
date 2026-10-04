import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Edit2, Trash2, Check, X, Shield, MapPin, Eye, EyeOff, Plus, IndianRupee } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const defaultForm = {
    name: '',
    description: '',
    price: 0,
    currency: 'INR',
    billingInterval: 'monthly',
    trialDurationDays: 14,
    features: '',
    limits: { maxGuards: 1, maxSites: 1 },
    visibility: 'public'
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/subscriptions/plans');
      setPlans(data.plans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      price: plan.price / 100, // Convert from cents back to readable
      features: plan.features.join(', '),
      currency: 'INR'
    });
    setShowModal(true);
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuresArray = formData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f);
      const payload = {
        ...formData,
        features: featuresArray,
        price: Number(formData.price) * 100 // Convert to cents
      };

      if (editingPlan) {
        await api.put(`/subscriptions/plans/${editingPlan._id}`, payload);
      } else {
        await api.post('/subscriptions/plans', payload);
      }
      
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to save plan');
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: string) => {
    try {
      await api.put(`/subscriptions/plans/${id}`, { visibility: currentVisibility === 'public' ? 'hidden' : 'public' });
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;
    try {
      await api.delete(`/subscriptions/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to delete plan');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 border-4 border-emerald-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Subscription Plans</h1>
          <p className="text-text-secondary mt-1">Manage platform monetization, pricing tiers, and limits.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-emerald-primary text-background hover:bg-emerald-hover shadow-[0_0_15px_rgba(16,185,129,0.3)] gap-2 whitespace-nowrap">
          <Plus size={18} />
          Create New Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan._id} 
            className="group relative bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-lg hover:border-emerald-primary/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-all duration-300 flex flex-col"
          >
            {/* Top decorative gradient */}
            <div className={`h-1.5 w-full ${plan.visibility === 'public' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-surface-hover'}`} />
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-text-main">{plan.name}</h3>
                  <p className="text-sm text-text-muted mt-1 min-h-[40px]">{plan.description}</p>
                </div>
                <Badge variant={plan.visibility === 'public' ? 'success' : 'secondary'} className="uppercase text-[10px]">
                  {plan.visibility}
                </Badge>
              </div>

              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-white flex items-center">
                  <IndianRupee size={32} className="mr-1 opacity-80" />
                  {(plan.price / 100).toLocaleString('en-IN')}
                </span>
                <span className="text-text-muted font-medium mb-1">/{plan.billingInterval}</span>
              </div>

              {/* Limits */}
              <div className="bg-surface-main rounded-xl p-4 mb-6 border border-border-subtle flex gap-4">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Shield size={20} className="text-emerald-primary mb-1" />
                  <span className="text-lg font-bold text-white">{plan.limits.maxGuards > 1000 ? 'Unlimited' : plan.limits.maxGuards}</span>
                  <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Guards</span>
                </div>
                <div className="w-px bg-border-subtle" />
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <MapPin size={20} className="text-emerald-primary mb-1" />
                  <span className="text-lg font-bold text-white">{plan.limits.maxSites > 1000 ? 'Unlimited' : plan.limits.maxSites}</span>
                  <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Sites</span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Included Features</p>
                <ul className="space-y-2.5">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-primary/20 flex items-center justify-center text-emerald-primary">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-border-subtle bg-surface-main flex justify-between items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => toggleVisibility(plan._id, plan.visibility)}
                className={`flex-1 ${plan.visibility === 'public' ? 'text-text-muted hover:text-white' : 'text-emerald-primary border-emerald-primary/30 bg-emerald-primary/10'}`}
              >
                {plan.visibility === 'public' ? <><EyeOff size={16} className="mr-2" /> Hide</> : <><Eye size={16} className="mr-2" /> Publish</>}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => openEditModal(plan)}
                className="flex-1 text-text-secondary hover:text-white"
              >
                <Edit2 size={16} className="mr-2" /> Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deletePlan(plan._id)}
                className="px-3 text-danger hover:bg-danger/10 hover:text-danger border border-transparent hover:border-danger/20"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border-subtle rounded-2xl bg-surface-card/50">
          <Shield size={48} className="mx-auto text-emerald-primary/50 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Plans Created</h3>
          <p className="text-text-muted mb-6">Create your first subscription plan to start monetizing.</p>
          <Button onClick={openCreateModal} className="bg-emerald-primary text-background">
            <Plus size={18} className="mr-2" /> Create First Plan
          </Button>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-surface-sidebar border border-border-subtle rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-card">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingPlan ? <><Edit2 size={20} className="text-emerald-primary" /> Edit Plan</> : <><Plus size={20} className="text-emerald-primary" /> Create New Plan</>}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-muted hover:text-white hover:bg-surface-hover rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-surface-hover">
              <form id="plan-form" onSubmit={savePlan} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Plan Name</label>
                    <input required type="text" className="w-full bg-surface-main border border-border-subtle p-3 rounded-xl text-white placeholder-text-muted focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Enterprise Security" />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Description</label>
                    <input required type="text" className="w-full bg-surface-main border border-border-subtle p-3 rounded-xl text-white placeholder-text-muted focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief catchy description of the tier" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Price (INR)</label>
                    <div className="relative">
                      <IndianRupee size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input required type="number" min="0" step="1" className="w-full bg-surface-main border border-border-subtle p-3 pl-10 rounded-xl text-white placeholder-text-muted focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="4999" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Billing Interval</label>
                    <select className="w-full bg-surface-main border border-border-subtle p-3 rounded-xl text-white focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all" value={formData.billingInterval} onChange={e => setFormData({...formData, billingInterval: e.target.value})}>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Max Guards</label>
                    <input required type="number" min="1" className="w-full bg-surface-main border border-border-subtle p-3 rounded-xl text-white focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all" value={formData.limits.maxGuards} onChange={e => setFormData({...formData, limits: {...formData.limits, maxGuards: Number(e.target.value)}})} />
                    <p className="text-[10px] text-text-muted mt-1">Set to 99999 for unlimited</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Max Sites</label>
                    <input required type="number" min="1" className="w-full bg-surface-main border border-border-subtle p-3 rounded-xl text-white focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all" value={formData.limits.maxSites} onChange={e => setFormData({...formData, limits: {...formData.limits, maxSites: Number(e.target.value)}})} />
                    <p className="text-[10px] text-text-muted mt-1">Set to 99999 for unlimited</p>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Included Features</label>
                    <textarea 
                      required 
                      className="w-full bg-surface-main border border-border-subtle p-3 rounded-xl text-white focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all min-h-[100px]" 
                      value={formData.features} 
                      onChange={e => setFormData({...formData, features: e.target.value})} 
                      placeholder="Enter features separated by commas (e.g. Advanced Reporting, 24/7 Support, Custom Branding)"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-surface-main p-4 rounded-xl border border-border-subtle">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-border-subtle bg-surface-card text-emerald-primary focus:ring-emerald-primary focus:ring-offset-surface-main" 
                        checked={formData.visibility === 'public'}
                        onChange={e => setFormData({...formData, visibility: e.target.checked ? 'public' : 'hidden'})}
                      />
                      <div>
                        <p className="text-sm font-bold text-white">Publish immediately</p>
                        <p className="text-xs text-text-muted mt-0.5">If unchecked, this plan will be hidden from the customer subscription page.</p>
                      </div>
                    </label>
                  </div>

                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-card flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" form="plan-form" className="bg-emerald-primary text-background hover:bg-emerald-hover">
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
