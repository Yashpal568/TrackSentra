import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { Shield } from 'lucide-react';

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: string;
  features: string[];
  limits: { maxGuards: number; maxSites: number };
}

export function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/subscriptions/plans/public');
        setPlans(data.plans);
      } catch (error) {
        console.error('Failed to fetch plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading plans...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Pricing Plans</h2>
        <p className="mt-4 text-xl text-gray-600">Select a plan to start securing your sites.</p>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-8">
        {plans.map(plan => (
          <div key={plan._id} className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
            <p className="mt-2 text-gray-500">{plan.description}</p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold text-gray-900">${(plan.price / 100).toFixed(2)}</span>
              <span className="text-base font-medium text-gray-500">/{plan.billingInterval}</span>
            </div>
            <ul className="mt-6 space-y-4">
              <li className="flex">
                <span className="text-gray-500">Up to {plan.limits.maxGuards} Guards</span>
              </li>
              <li className="flex">
                <span className="text-gray-500">Up to {plan.limits.maxSites} Sites</span>
              </li>
              {plan.features.map((feature, i) => (
                <li key={i} className="flex text-gray-500">{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => navigate(`/register?planId=${plan._id}`)}
              className="mt-8 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
