import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ArrowRight, AlertTriangle, Radio } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { api } from '../lib/axios';

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: string;
  features: string[];
  limits?: { maxGuards: number; maxSites: number };
}

export const LandingPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/subscriptions/plans/public');
        setPlans(data.plans || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPlans();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Industrial Security Patrol <span className="text-blue-500">Management SaaS</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Manage guards, track patrols in real-time with GPS and QR checkpoints, and generate automated incident reports—all from one platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" className="text-lg px-8 py-3 w-full sm:w-auto h-auto">Get Started Free</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" className="text-lg px-8 py-3 w-full sm:w-auto h-auto bg-slate-800 text-white border-slate-700 hover:bg-slate-700">Request a Demo</Button>
            </Link>
          </div>
        </div>
        
        {/* Background shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      </section>

      {/* Features Preview */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Secure Your Facility</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            TrackSentra replaces paper logs and disjointed systems with a unified cloud platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-xl transition-shadow border-t-4 border-t-blue-500">
            <QrCode className="w-12 h-12 text-blue-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">QR Checkpoints</h3>
            <p className="text-gray-600">Guards scan QR codes placed around your facility to prove their presence and complete routes.</p>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-shadow border-t-4 border-t-purple-500">
            <Radio className="w-12 h-12 text-purple-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">Live Monitoring</h3>
            <p className="text-gray-600">Track all active patrols globally in real-time. Know exactly where your guards are at any moment.</p>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-shadow border-t-4 border-t-orange-500">
            <AlertTriangle className="w-12 h-12 text-orange-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">Incident Reports</h3>
            <p className="text-gray-600">Guards can file incident reports with photos and GPS metadata directly from the field.</p>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link to="/features" className="text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1">
            View all features <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-100 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How TrackSentra Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A seamless workflow from administration to execution.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 z-10 relative">1</div>
              <h3 className="font-bold text-lg mb-2">Setup Sites</h3>
              <p className="text-gray-600 text-sm">Define sites and print QR code checkpoints.</p>
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-blue-200"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 z-10 relative">2</div>
              <h3 className="font-bold text-lg mb-2">Schedule Shifts</h3>
              <p className="text-gray-600 text-sm">Assign guards to specific shifts and routes.</p>
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-blue-200"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 z-10 relative">3</div>
              <h3 className="font-bold text-lg mb-2">Execute Patrols</h3>
              <p className="text-gray-600 text-sm">Guards scan codes and report incidents.</p>
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-blue-200"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 z-10 relative">4</div>
              <h3 className="font-bold text-lg mb-2">Monitor & Analyze</h3>
              <p className="text-gray-600 text-sm">View real-time dashboards and analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600">Choose the plan that fits your security operation.</p>
        </div>

        {plans.length === 0 ? (
          <p className="text-center text-gray-500">Loading plans...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.slice(0, 3).map(plan => (
              <Card key={plan._id} className="p-8 border flex flex-col hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                <div className="text-4xl font-extrabold mb-2">
                  ${(plan.price / 100).toFixed(2)}
                  <span className="text-base font-normal text-gray-500">/{plan.billingInterval}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1 mt-6">
                  {plan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-green-500 mr-2">✓</span> {feature}
                    </li>
                  ))}
                  <li className="flex items-start text-sm font-semibold">
                    <span className="text-blue-500 mr-2">✓</span> Up to {plan.limits?.maxGuards || 'Unlimited'} Guards
                  </li>
                </ul>

                <Link to={`/register?planId=${plan._id}`}>
                  <Button className="w-full">Choose Plan</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 text-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to upgrade your security operations?</h2>
        <div className="flex justify-center gap-4">
          <Link to="/register"><Button className="bg-white text-blue-600 hover:bg-gray-100">Get Started Now</Button></Link>
          <Link to="/contact"><Button variant="secondary" className="border-white text-white hover:bg-blue-700">Request Demo</Button></Link>
        </div>
      </section>
    </>
  );
};
