import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, Building2, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    setIsVisible(true);
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/subscriptions/plans/public');
        setPlans(data.plans);
      } catch (err) {
        console.error('Failed to fetch plans', err);
        setError('Failed to fetch plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate(`/register?planId=${planId}`);
      return;
    }
    
    // User is logged in, select plan directly
    try {
      setSelectingPlan(planId);
      await api.post('/subscriptions/my', { planId });
      navigate('/subscription');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to select plan');
      setSelectingPlan(null);
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-emerald-500/30 pb-24">
      {/* Pricing Header */}
      <section className="bg-background text-text-main pt-24 pb-48 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-border-subtle text-center">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/20 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className={`max-w-3xl mx-auto relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-sidebar border border-border-subtle text-emerald-400 text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
            Simple & Transparent
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Security pricing that <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-300">scales with you.</span>
          </h1>
          <p className="text-xl text-text-muted leading-relaxed font-light max-w-2xl mx-auto">
            Choose the plan that fits your security operation. No hidden fees. Upgrade or downgrade at any time.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-surface-sidebar rounded-3xl shadow-2xl border border-border-subtle">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="text-text-secondary font-medium">Loading subscription tiers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 bg-surface-sidebar rounded-3xl shadow-2xl border border-border-subtle">
            <div className="flex flex-col items-center gap-4">
              <p className="text-text-secondary font-medium">{error}</p>
              <Button onClick={() => window.location.reload()} variant="secondary">Retry</Button>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex justify-center items-center h-64 bg-surface-sidebar rounded-3xl shadow-2xl border border-border-subtle">
            <div className="flex flex-col items-center gap-4">
              <p className="text-text-secondary font-medium">No subscription plans are currently available. Please check back later.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan, index) => {
              const isPopular = index === 1; // Highlight the middle plan usually
              return (
                <div key={plan._id} className={`w-full transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                  <Card className={`rounded-3xl h-full bg-surface-sidebar flex flex-col p-6 transition-all duration-300 ${isPopular ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-100 md:scale-105 z-10 relative' : 'border border-border-subtle shadow-xl hover:shadow-2xl hover:-translate-y-1'}`}>
                    {isPopular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-text-main px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="mb-5 text-center">
                      <h3 className="text-xl font-bold tracking-tight text-text-main mb-1.5">{plan.name}</h3>
                      <p className="text-xs text-text-secondary min-h-[32px] px-1">{plan.description}</p>
                    </div>
                    
                    <div className="text-center mb-5 pb-5 border-b border-border-subtle">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-black tracking-tight text-text-main">₹{(plan.price / 100).toFixed(0)}</span>
                        <span className="text-xs font-bold text-text-secondary ml-1">/{plan.billingInterval}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 flex-1 mb-6">
                      <li className="flex items-center text-xs font-bold text-text-main bg-background p-2.5 rounded-lg border border-border-subtle">
                        <Users className="w-4 h-4 mr-2.5 text-emerald-600" />
                        Up to {plan.limits.maxGuards} Active Guards
                      </li>
                      <li className="flex items-center text-xs font-bold text-text-main bg-background p-2.5 rounded-lg border border-border-subtle">
                        <Building2 className="w-4 h-4 mr-2.5 text-emerald-600" />
                        Up to {plan.limits.maxSites} Managed Sites
                      </li>
                      <div className="h-2"></div>
                      <li className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-1 mb-1.5">Included Features</li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-xs text-text-secondary font-medium">
                          <CheckCircle2 className="w-4 h-4 mr-2.5 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      disabled={selectingPlan === plan._id}
                      onClick={() => handleSelectPlan(plan._id)}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all h-12 px-6 w-full mt-auto shadow-sm ${isPopular ? 'bg-emerald-600 text-text-main hover:bg-emerald-500 shadow-lg shadow-emerald-500/25' : 'bg-surface-sidebar text-text-main hover:bg-surface-main border border-border-subtle'} ${selectingPlan === plan._id ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {selectingPlan === plan._id ? 'Processing...' : user ? `Select ${plan.name}` : `Choose ${plan.name}`}
                    </button>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center">
        <h3 className="text-2xl font-bold text-text-main mb-4">Need an Enterprise solution?</h3>
        <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
          For large agencies requiring unlimited limits, custom SLA, dedicated support, and advanced integration APIs.
        </p>
        <Button variant="secondary" onClick={() => navigate('/contact')} className="h-12 px-8 text-base bg-surface-sidebar border-2 border-border-subtle text-text-main hover:border-border-subtle font-bold">
          Contact Sales Team
        </Button>
      </section>
    </div>
  );
}
