import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';

export function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const createPlan = async () => {
    try {
      await api.post('/subscriptions/plans', {
        name: 'New Plan',
        description: 'Plan Description',
        price: 9900,
        currency: 'USD',
        billingInterval: 'monthly',
        features: ['Feature 1'],
        limits: { maxGuards: 10, maxSites: 2 },
        visibility: 'hidden'
      });
      fetchPlans();
    } catch (err) {
      console.error(err);
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

  if (loading) return <div>Loading plans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Subscription Plans</h1>
        <Button onClick={createPlan}>+ Create Dummy Plan</Button>
      </div>

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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.visibility}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {plan.visibility === 'hidden' ? (
                    <button onClick={() => publishPlan(plan._id, 'public')} className="text-green-600 hover:text-green-900 mr-4">Publish</button>
                  ) : (
                    <button onClick={() => publishPlan(plan._id, 'hidden')} className="text-yellow-600 hover:text-yellow-900 mr-4">Hide</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
