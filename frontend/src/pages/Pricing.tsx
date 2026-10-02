import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
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
  const navigate = useNavigate();

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

  return (
    <div className="bg-[var(--color-background)] min-h-screen font-sans selection:bg-emerald-500/30 pb-24">
      {/* Pricing Header */}
      <section className="bg-[var(--color-background)] text-[var(--color-text-main)] pt-24 pb-48 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[var(--color-border-subtle)] text-center">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/20 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className={`max-w-3xl mx-auto relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-sidebar)] border border-[var(--color-border-subtle)] text-emerald-400 text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
            Simple & Transparent
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Security pricing that <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">scales with you.</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] leading-relaxed font-light max-w-2xl mx-auto">
            Choose the plan that fits your security operation. No hidden fees. Upgrade or downgrade at any time.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-[var(--color-surface-sidebar)] rounded-3xl shadow-2xl border border-[var(--color-border-subtle)]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="text-[var(--color-text-secondary)] font-medium">Loading subscription tiers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 bg-[var(--color-surface-sidebar)] rounded-3xl shadow-2xl border border-[var(--color-border-subtle)]">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[var(--color-text-secondary)] font-medium">{error}</p>
              <Button onClick={() => window.location.reload()} variant="secondary">Retry</Button>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex justify-center items-center h-64 bg-[var(--color-surface-sidebar)] rounded-3xl shadow-2xl border border-[var(--color-border-subtle)]">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[var(--color-text-secondary)] font-medium">No subscription plans are currently available. Please check back later.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-end gap-8">
            {plans.map((plan, index) => {
              const isPopular = index === 1; // Highlight the middle plan usually
              return (
                <div key={plan._id} className={`w-full max-w-md transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                  <Card className={`rounded-3xl bg-[var(--color-surface-sidebar)] flex flex-col p-8 transition-all duration-300 ${isPopular ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-100 md:scale-105 z-10 relative' : 'border border-[var(--color-border-subtle)] shadow-xl hover:shadow-2xl hover:-translate-y-1'}`}>
                    {isPopular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-[var(--color-text-main)] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="mb-8 text-center">
                      <h3 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] mb-2">{plan.name}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] min-h-[40px] px-4">{plan.description}</p>
                    </div>
                    
                    <div className="text-center mb-8 pb-8 border-b border-[var(--color-border-subtle)]">
                      <div className="flex items-baseline justify-center">
                        <span className="text-6xl font-black tracking-tight text-[var(--color-text-main)]">${(plan.price / 100).toFixed(0)}</span>
                        <span className="text-base font-bold text-[var(--color-text-secondary)] ml-2">/{plan.billingInterval}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-4 flex-1 mb-8">
                      <li className="flex items-center text-sm font-bold text-[var(--color-text-main)] bg-[var(--color-background)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                        <Users className="w-5 h-5 mr-3 text-emerald-600" />
                        Up to {plan.limits.maxGuards} Active Guards
                      </li>
                      <li className="flex items-center text-sm font-bold text-[var(--color-text-main)] bg-[var(--color-background)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                        <Building2 className="w-5 h-5 mr-3 text-emerald-600" />
                        Up to {plan.limits.maxSites} Managed Sites
                      </li>
                      <div className="h-4"></div>
                      <li className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider pl-1 mb-2">Included Features</li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-sm text-[var(--color-text-secondary)] font-medium">
                          <CheckCircle2 className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => navigate(`/register?planId=${plan._id}`)}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-bold transition-all h-14 px-8 w-full mt-auto shadow-sm ${isPopular ? 'bg-emerald-600 text-[var(--color-text-main)] hover:bg-emerald-500 shadow-lg shadow-emerald-500/25' : 'bg-[var(--color-surface-sidebar)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-main)]'}`}
                    >
                      Choose {plan.name}
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
        <h3 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">Need an Enterprise solution?</h3>
        <p className="text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
          For large agencies requiring unlimited limits, custom SLA, dedicated support, and advanced integration APIs.
        </p>
        <Button variant="secondary" onClick={() => navigate('/contact')} className="h-12 px-8 text-base bg-[var(--color-surface-sidebar)] border-2 border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:border-[var(--color-border-subtle)] font-bold">
          Contact Sales Team
        </Button>
      </section>
    </div>
  );
}
