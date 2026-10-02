import React, { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';

export function Subscription() {
  const [subscription, setSubscription] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, setRes] = await Promise.all([
          api.get('/subscriptions/my'),
          api.get('/subscriptions/settings/payment-instructions')
        ]);
        setSubscription(subRes.data.subscription);
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
      await api.post('/subscriptions/pay', {
        planId: subscription.planId._id,
        transactionReference: transactionRef,
        paymentDate: new Date().toISOString(),
      });
      alert('Payment submitted successfully. Please wait for Super Admin verification.');
      const subRes = await api.get('/subscriptions/my');
      setSubscription(subRes.data.subscription);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading subscription...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-main">Subscription & Billing</h1>

      {!subscription ? (
        <div className="bg-surface-card p-6 rounded-lg shadow-sm border">
          <p>You have no active subscription.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-4">Current Plan: {subscription.planSnapshot.name}</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Status:</span> {subscription.status}</p>
              <p><span className="font-medium">Price:</span> ${(subscription.planSnapshot.price / 100).toFixed(2)} {subscription.planSnapshot.currency}</p>
              <p><span className="font-medium">Billing:</span> {subscription.planSnapshot.billingInterval}</p>
              <p><span className="font-medium">Limits:</span> {subscription.planSnapshot.limits.maxGuards} Guards, {subscription.planSnapshot.limits.maxSites} Sites</p>
            </div>
          </div>

          {subscription.status === 'PENDING_PAYMENT' && (
            <div className="bg-surface-card p-6 rounded-lg shadow-sm border border-orange-200">
              <h2 className="text-xl font-bold mb-4 text-orange-800">Pending Payment</h2>
              <div className="mb-4 text-sm text-gray-700 bg-surface-hover p-4 rounded">
                <p className="font-semibold mb-2">Payment Instructions:</p>
                {settings?.manualPaymentInstructions?.upiId && <p>UPI ID: {settings.manualPaymentInstructions.upiId}</p>}
                {settings?.manualPaymentInstructions?.bankName && (
                  <>
                    <p>Bank: {settings.manualPaymentInstructions.bankName}</p>
                    <p>Acc Name: {settings.manualPaymentInstructions.accountName}</p>
                    <p>Acc No: {settings.manualPaymentInstructions.accountNumber}</p>
                    <p>IFSC: {settings.manualPaymentInstructions.ifsc}</p>
                  </>
                )}
              </div>
              
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction Reference</label>
                  <input
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-primary focus:ring-emerald-primary sm:text-sm p-2 border"
                    placeholder="Enter UPI or Bank Ref No."
                  />
                </div>
                <Button type="submit" isLoading={submitting}>Submit Payment Proof</Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
