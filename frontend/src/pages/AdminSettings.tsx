import { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { Settings, Save, AlertCircle, Banknote, Mail, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [paymentInstructions, setPaymentInstructions] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    ifscCode: '',
    swiftCode: '',
    supportEmail: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/subscriptions/settings/payment-instructions');
      if (data.settings?.manualPaymentInstructions) {
        setPaymentInstructions(data.settings.manualPaymentInstructions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess(false);
      await api.put('/subscriptions/settings', {
        manualPaymentInstructions: paymentInstructions
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInstructions({ ...paymentInstructions, [e.target.name]: e.target.value });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 border-4 border-emerald-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
             <Settings className="text-emerald-500" size={28} /> Platform Settings
          </h1>
          <p className="text-text-secondary mt-1">Configure global variables, integrations, and default behaviors.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 transition-all min-w-[140px]"
        >
          {saving ? <span className="animate-pulse">Saving...</span> : <><Save size={16} className="mr-2" /> Save Changes</>}
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
          <AlertCircle size={16} /> Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Manual Payment Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-subtle bg-surface-main/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Banknote className="text-emerald-500" size={20} /> Manual Payment Instructions
              </h2>
              <p className="text-xs text-text-muted mt-1">These details will be displayed to tenants when they choose "Manual Bank Transfer" during checkout.</p>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Bank Name</label>
                  <input 
                    type="text" name="bankName" value={paymentInstructions.bankName || ''} onChange={handleChange}
                    className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. HDFC Bank"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Account Name</label>
                  <input 
                    type="text" name="accountName" value={paymentInstructions.accountName || ''} onChange={handleChange}
                    className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. TrackSentra Technologies Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Account Number</label>
                  <input 
                    type="text" name="accountNumber" value={paymentInstructions.accountNumber || ''} onChange={handleChange}
                    className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    placeholder="50200012345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">IFSC Code</label>
                  <input 
                    type="text" name="ifscCode" value={paymentInstructions.ifscCode || ''} onChange={handleChange}
                    className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono uppercase"
                    placeholder="HDFC0001234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">SWIFT Code (Optional)</label>
                  <input 
                    type="text" name="swiftCode" value={paymentInstructions.swiftCode || ''} onChange={handleChange}
                    className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono uppercase"
                    placeholder="HDFCINBB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1"><Mail size={12}/> Support Email</label>
                  <input 
                    type="email" name="supportEmail" value={paymentInstructions.supportEmail || ''} onChange={handleChange}
                    className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="billing@tracksentra.com"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Global Controls Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="text-emerald-500" size={16} /> Payment Gateway
            </h3>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Automated credit card processing is currently handled via environment variables. To change the active Stripe keys, please update the `.env` file and restart the backend service.
            </p>
            <div className="p-3 bg-surface-main rounded-lg border border-border-subtle flex items-center justify-between">
               <span className="text-sm font-bold text-white">Stripe Integration</span>
               <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
