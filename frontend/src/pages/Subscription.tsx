import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, ShieldCheck, Zap, Clock } from 'lucide-react';

export function Subscription() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [hasPendingSubmission, setHasPendingSubmission] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, setRes] = await Promise.all([
          api.get('/subscriptions/my'),
          api.get('/subscriptions/settings/payment-instructions')
        ]);
        setSubscription(subRes.data.subscription);
        setHasPendingSubmission(subRes.data.hasPendingSubmission || false);
        setSettings(setRes.data.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      setErrorMsg('');
      await api.post('/subscriptions/pay', {
        planId: subscription.planId._id,
        transactionReference: transactionRef,
        paymentDate: new Date().toISOString(),
      });
      const subRes = await api.get('/subscriptions/my');
      setSubscription(subRes.data.subscription);
      setHasPendingSubmission(subRes.data.hasPendingSubmission || true);
    } catch (err: any) {
      setErrorMsg(err.userMessage || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading subscription...</div>;

  return (
    <div className="p-6 sm:p-10 max-w-350 mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Subscription & Billing</h1>
          <p className="text-text-secondary mt-1">Manage your active plan, usage limits, and payment history.</p>
        </div>
        <div className="hidden sm:block">
          <div className="w-12 h-12 bg-emerald-primary/10 rounded-full flex items-center justify-center border border-emerald-primary/20">
            <CreditCard size={24} className="text-emerald-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </div>

      {!subscription ? (
        <div className="relative overflow-hidden bg-surface-card p-10 rounded-2xl shadow-xl border border-border-subtle text-center">
          <div className="absolute inset-0 bg-linear-to-b from-emerald-primary/5 to-transparent pointer-events-none" />
          <div className="w-20 h-20 mx-auto bg-surface-main border border-border-subtle rounded-3xl flex items-center justify-center mb-6 shadow-inner relative z-10">
            <ShieldCheck size={40} className="text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-3 relative z-10">No Active Subscription</h2>
          <p className="text-text-secondary max-w-md mx-auto mb-8 relative z-10">
            You currently do not have an active billing plan. Contact your administrator or sales representative to activate your organization's subscription.
          </p>
          <Button onClick={() => navigate('/pricing')} className="relative z-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-2.5 rounded-full shadow-lg shadow-emerald-500/25 border-0">
            Select a Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative overflow-hidden bg-surface-card p-8 rounded-2xl shadow-xl border border-border-subtle">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest">Current Plan</h2>
              <div className="px-3 py-1 bg-emerald-primary/20 text-emerald-primary border border-emerald-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">
                {subscription.status}
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-end gap-2 mb-2">
                <h3 className="text-4xl font-black text-text-main">{subscription.planSnapshot.name}</h3>
              </div>
              <div className="flex items-baseline gap-1 text-text-secondary mb-8">
                <span className="text-2xl font-bold text-text-main">₹{(subscription.planSnapshot.price / 100).toFixed(2)}</span>
                <span className="text-sm uppercase tracking-wider">{subscription.planSnapshot.currency}</span>
                <span className="text-sm ml-1">/ {subscription.planSnapshot.billingInterval}</span>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-text-main border-b border-border-subtle pb-2">Plan Allowances</h4>
                <div className="flex items-center justify-between text-sm group">
                  <span className="text-text-secondary flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-primary" /> Active Guards</span>
                  <span className="font-bold text-text-main group-hover:text-emerald-primary transition-colors">{subscription.planSnapshot.limits.maxGuards}</span>
                </div>
                <div className="flex items-center justify-between text-sm group">
                  <span className="text-text-secondary flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-primary" /> Managed Sites</span>
                  <span className="font-bold text-text-main group-hover:text-emerald-primary transition-colors">{subscription.planSnapshot.limits.maxSites}</span>
                </div>
              </div>
            </div>
          </div>

          {subscription.status === 'PENDING_PAYMENT' && (
            <div className="bg-surface-card p-8 rounded-2xl shadow-xl border border-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-4 text-orange-400 flex items-center gap-2">
                  <Zap size={20} className="text-orange-500" />
                  Payment Required
                </h2>
                <div className="mb-6 bg-surface-main border border-border-subtle p-5 rounded-xl text-sm flex flex-col items-center">
                  <p className="font-bold text-text-main mb-3 uppercase tracking-wider text-xs w-full text-center">Scan with any UPI App</p>
                  
                  {settings?.manualPaymentInstructions?.upiId && (
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                      <QRCodeSVG 
                        value={`upi://pay?pa=${settings.manualPaymentInstructions.upiId}&pn=${encodeURIComponent(settings.manualPaymentInstructions.accountName || 'TrackSentra')}&am=${(subscription.planSnapshot.price / 100).toFixed(2)}&cu=INR`} 
                        size={200}
                        level="M"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-text-secondary w-full">
                    {settings?.manualPaymentInstructions?.upiId && (
                      <div className="flex justify-between border-b border-border-subtle pb-2"><span className="text-text-muted">UPI ID:</span> <span className="font-mono font-bold text-emerald-primary">{settings.manualPaymentInstructions.upiId}</span></div>
                    )}
                    <div className="flex justify-between border-b border-border-subtle pb-2"><span className="text-text-muted">Amount to Pay:</span> <span className="font-bold text-text-main">₹{(subscription.planSnapshot.price / 100).toFixed(2)}</span></div>
                  </div>
                  <p className="text-xs text-text-muted mt-4 w-full text-center">After successful payment, please enter your UTR / UPI Reference Number below.</p>
                </div>
                
                {hasPendingSubmission ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Clock size={24} className="text-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-400">Verification Pending</h3>
                    <p className="text-sm text-text-muted">
                      We have received your payment reference. Our team is currently verifying the transfer.
                      This usually takes 1-2 hours during business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    {errorMsg && (
                      <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-sm font-medium text-center">
                        {errorMsg}
                      </div>
                    )}
                    <div>
                      <label className="flex text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Transaction Reference</label>
                      <input
                        required
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-3 text-text-main focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary outline-none transition-all placeholder-text-muted"
                        placeholder="e.g. UTR / Bank Ref No."
                      />
                    </div>
                    <Button type="submit" isLoading={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none py-3 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                      Verify Payment Transfer
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
