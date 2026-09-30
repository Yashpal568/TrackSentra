import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';

export function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billingInterval: 'monthly',
    trialDurationDays: 14,
    features: '',
    limits: { maxGuards: 1, maxSites: 1 },
    visibility: 'public'
  });

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

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
      await api.post('/subscriptions/plans', {
        ...formData,
        features: featuresArray,
        price: Number(formData.price) * 100 // Convert to cents
      });
      setShowForm(false);
      setFormData({
        name: '', description: '', price: 0, currency: 'USD', billingInterval: 'monthly',
        trialDurationDays: 14, features: '', limits: { maxGuards: 1, maxSites: 1 }, visibility: 'public'
      });
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to create plan');
    }
  };

  const publishPlan = async (id: string, visibility: string) => {
    try {
      await api.put(`/subscriptions/plans/${id}`, { visibility });
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.delete(`/subscriptions/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to delete plan');
    }
  };

  if (loading) return <div className="p-8">Loading plans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Subscription Plans</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create New Plan'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Create New Plan</h2>
          <form onSubmit={createPlan} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plan Name</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Starter Security" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (USD)</label>
              <input required type="number" min="0" step="0.01" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="e.g. 49.00" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Perfect for small facilities" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Billing Interval</label>
              <select className="w-full border p-2 rounded" value={formData.billingInterval} onChange={e => setFormData({...formData, billingInterval: e.target.value})}>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select className="w-full border p-2 rounded" value={formData.visibility} onChange={e => setFormData({...formData, visibility: e.target.value})}>
                <option value="public">Public</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Guards</label>
              <input required type="number" min="1" className="w-full border p-2 rounded" value={formData.limits.maxGuards} onChange={e => setFormData({...formData, limits: {...formData.limits, maxGuards: Number(e.target.value)}})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Sites</label>
              <input required type="number" min="1" className="w-full border p-2 rounded" value={formData.limits.maxSites} onChange={e => setFormData({...formData, limits: {...formData.limits, maxSites: Number(e.target.value)}})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="e.g. QR Checkpoints, Live Maps, Basic Analytics" />
            </div>
            <div className="col-span-2 flex justify-end mt-4">
              <Button type="submit" className="bg-blue-600 text-white">Save Plan</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map(plan => (
              <tr key={plan._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(plan.price / 100).toFixed(2)} / {plan.billingInterval}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.limits.maxGuards} Guards, {plan.limits.maxSites} Sites</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                     {plan.visibility}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {plan.visibility === 'hidden' ? (
                    <button onClick={() => publishPlan(plan._id, 'public')} className="text-green-600 hover:text-green-900 mr-4">Publish</button>
                  ) : (
                    <button onClick={() => publishPlan(plan._id, 'hidden')} className="text-yellow-600 hover:text-yellow-900 mr-4">Hide</button>
                  )}
                  <button onClick={() => deletePlan(plan._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
