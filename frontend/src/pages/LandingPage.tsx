import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Shield, Radio, Activity, CheckCircle2, MapPin } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
    <div className="bg-background text-text-main font-sans selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 bg-background text-text-main">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/20 blur-[120px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-full max-w-2xl h-64 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            <div className={`flex-1 text-center lg:text-left transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-sidebar border border-border-subtle text-emerald-400 text-sm font-bold uppercase tracking-wider mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Next-Gen Security Operations
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-text-main">
                Command Your <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-300">Security Patrols</span>
              </h1>
              <p className="text-xl md:text-2xl text-text-muted mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Turn reactive security into proactive command with real-time GPS tracking, QR checkpoints, and instant incident reporting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-emerald-600 hover:bg-emerald-500 text-text-main border-0 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] rounded-xl font-bold transition-all hover:scale-105">
                    Start Free Trial
                  </Button>
                </Link>
                <Button 
                  onClick={async () => {
                    try {
                      const { useAuthStore } = await import('../store/authStore');
                      await useAuthStore.getState().demoLogin();
                      window.location.href = '/dashboard';
                    } catch (e) {
                      console.error('Demo login failed');
                    }
                  }}
                  variant="secondary" 
                  className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-surface-sidebar/50 backdrop-blur-sm text-text-main border border-border-subtle hover:bg-surface-main hover:border-emerald-600/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Try Live Demo
                </Button>
              </div>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-text-secondary">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> No credit card required</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Setup in minutes</span>
              </div>
            </div>

            <div className={`flex-1 relative w-full max-w-2xl lg:max-w-none mx-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
              <div className="relative rounded-2xl border border-border-subtle bg-surface-sidebar shadow-2xl overflow-hidden flex flex-col group">
                <div className="h-8 bg-background border-b border-border-subtle flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-primary/100/80"></div>
                </div>
                {/* Simulated App UI */}
                <div className="p-6 grid grid-cols-3 gap-6 bg-surface-sidebar">
                  <div className="col-span-2 space-y-6">
                    <div className="bg-[var(--color-surface-main)] rounded-lg p-4 border border-border-subtle/50 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text-main text-sm flex items-center gap-2"><MapPin size={16} className="text-emerald-400"/> Active Patrol: Sector 7G</h3>
                        <span className="text-xs font-bold bg-emerald-primary/100/20 text-emerald-400 px-2 py-1 rounded border border-green-500/30 animate-pulse">LIVE</span>
                      </div>
                      <div className="h-32 bg-surface-sidebar rounded border border-border-subtle relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-122.4194,37.7749,13,0/600x300?access_token=pk.ey')] opacity-50 bg-cover bg-center"></div>
                        <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"></div>
                        <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-[var(--color-border-subtle)] rounded-full border-2 border-slate-500 z-10"></div>
                        <div className="absolute top-2/3 left-2/3 w-3 h-3 bg-[var(--color-border-subtle)] rounded-full border-2 border-slate-500 z-10"></div>
                        <svg className="absolute inset-0 w-full h-full" style={{zIndex: 1}}>
                          <path d="M 120 80 Q 180 40 250 100" fill="transparent" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="3" strokeDasharray="5,5"/>
                        </svg>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--color-surface-main)] rounded-lg p-4 border border-border-subtle/50">
                         <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Completion</h4>
                         <div className="text-2xl font-black text-text-main">82%</div>
                         <div className="w-full bg-surface-sidebar h-1.5 mt-2 rounded-full overflow-hidden">
                           <div className="w-[82%] bg-emerald-500 h-full rounded-full"></div>
                         </div>
                      </div>
                      <div className="bg-[var(--color-surface-main)] rounded-lg p-4 border border-border-subtle/50">
                         <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Active Guards</h4>
                         <div className="text-2xl font-black text-text-main flex items-center justify-between">
                            24 <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full bg-[var(--color-border-subtle)] border-2 border-border-subtle"></div>
                              <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-border-subtle"></div>
                              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-main)] border-2 border-border-subtle"></div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 space-y-4">
                    <h3 className="font-bold text-text-main text-sm flex items-center gap-2"><Activity size={16} className="text-emerald-400"/> Live Feed</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-[var(--color-surface-main)] p-3 rounded-lg border border-border-subtle/50 flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 1 ? 'bg-emerald-400' : i === 2 ? 'bg-emerald-400' : 'bg-emerald-400'}`}></div>
                          <div>
                            <p className="text-xs text-text-main font-medium">{i === 1 ? 'Checkpoint Scanned' : i === 2 ? 'Incident Reported' : 'Patrol Started'}</p>
                            <p className="text-[10px] text-text-secondary mt-1">{i}m ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Element */}
              <div className="absolute -bottom-6 -left-6 bg-[var(--color-surface-main)] border border-border-subtle p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="w-12 h-12 bg-emerald-primary/100/20 rounded-full flex items-center justify-center">
                  <QrCode className="text-emerald-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">Scan Verified</p>
                  <p className="text-xs text-text-muted">GPS Match: 99.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-10 border-b border-border-subtle bg-surface-sidebar">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Built for enterprise security teams</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            {/* Generic placeholder logos implemented with CSS shapes to avoid broken images */}
            <div className="flex items-center gap-2 font-black text-xl"><div className="w-6 h-6 bg-[var(--color-surface-main)] rounded-sm rotate-45"></div> SECURACORP</div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter"><div className="w-6 h-6 rounded-full border-4 border-border-subtle"></div> OMNIGUARD</div>
            <div className="flex items-center gap-2 font-black text-xl"><div className="w-6 h-6 bg-[var(--color-surface-main)] clip-triangle"></div> VANGUARD INC</div>
            <div className="flex items-center gap-2 font-black text-xl font-serif italic"><div className="w-6 h-6 border-l-4 border-b-4 border-border-subtle"></div> Sentinel Ops</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3">Platform Capabilities</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight mb-6">Complete Operational Control</h3>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Everything you need to manage distributed security teams from a single, powerful command center.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-surface-sidebar rounded-2xl p-8 shadow-sm border border-border-subtle hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="w-14 h-14 bg-emerald-950/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <MapPin className="text-emerald-600 w-7 h-7 group-hover:text-text-main transition-colors" />
            </div>
            <h4 className="text-xl font-bold text-text-main mb-3">GPS-Validated Patrols</h4>
            <p className="text-text-secondary leading-relaxed">
              Ensure physical presence. Every checkpoint scan is cross-referenced with high-accuracy GPS data to prevent ghost patrols and fraud.
            </p>
          </div>

          <div className="bg-surface-sidebar rounded-2xl p-8 shadow-sm border border-border-subtle hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="w-14 h-14 bg-emerald-950/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <QrCode className="text-emerald-600 w-7 h-7 group-hover:text-text-main transition-colors" />
            </div>
            <h4 className="text-xl font-bold text-text-main mb-3">Offline QR Scanning</h4>
            <p className="text-text-secondary leading-relaxed">
              Guards can scan checkpoints even in dead zones. The app securely queues scans locally and syncs automatically when connection is restored.
            </p>
          </div>

          <div className="bg-surface-sidebar rounded-2xl p-8 shadow-sm border border-border-subtle hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="w-14 h-14 bg-emerald-950/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <Radio className="text-emerald-600 w-7 h-7 group-hover:text-text-main transition-colors" />
            </div>
            <h4 className="text-xl font-bold text-text-main mb-3">Live Global Monitoring</h4>
            <p className="text-text-secondary leading-relaxed">
              Watch your entire operation unfold in real-time. See active guards, completed routes, and incident alerts instantly on the map.
            </p>
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-24 bg-surface-sidebar text-text-main overflow-hidden border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full"></div>
              <div className="relative bg-background border border-border-subtle rounded-2xl p-2 shadow-2xl">
                <div className="bg-surface-sidebar rounded-xl overflow-hidden border border-border-subtle p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Shield className="text-red-500 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Critical Incident Reported</h4>
                      <p className="text-text-muted text-sm">Main Gate • 2 mins ago</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-[var(--color-surface-main)] rounded w-3/4"></div>
                    <div className="h-4 bg-[var(--color-surface-main)] rounded w-full"></div>
                    <div className="h-4 bg-[var(--color-surface-main)] rounded w-5/6"></div>
                    <div className="h-48 bg-black rounded-lg mt-4 border border-border-subtle relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('/images/evidence.jpg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                        <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">Attached: gate_breach_cam04.jpg</span>
                      </div>
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 mt-4 border-0">Dispatch Response Team</Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-3">Incident Management</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight mb-6">Respond faster when seconds count.</h3>
              <p className="text-xl text-text-muted mb-8 leading-relaxed font-light">
                When a breach or safety hazard occurs, your guards can submit detailed incident reports instantly from the field. Attach photos, classify severity, and automatically alert supervisors.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-text-muted">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />
                  <span className="font-medium">Instant push notifications for critical severity</span>
                </li>
                <li className="flex items-center gap-3 text-text-muted">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />
                  <span className="font-medium">Automated resolution tracking workflows</span>
                </li>
                <li className="flex items-center gap-3 text-text-muted">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />
                  <span className="font-medium">Comprehensive audit trails for compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background">
        <div className="text-center mb-20">
          <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3">Pricing Plans</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight mb-6">Simple, transparent pricing</h3>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your security operation. Upgrade at any time as your team grows.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.slice(0, 3).map((plan, index) => (
              <Card key={plan._id} className={`w-full rounded-2xl border ${index === 1 ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 relative scale-105 z-10' : 'border-border-subtle shadow-sm'} bg-surface-sidebar flex flex-col p-8 transition-all`}>
                {index === 1 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-text-main px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-text-main">{plan.name}</h3>
                  <p className="text-sm text-text-secondary mt-2 min-h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8 pb-8 border-b border-border-subtle">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black tracking-tight text-text-main">${(plan.price / 100).toFixed(0)}</span>
                    <span className="text-sm font-bold text-text-secondary ml-2">/{plan.billingInterval}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-sm font-bold text-text-main">
                    <Shield className="w-5 h-5 mr-3 text-emerald-500" />
                    Up to {plan.limits?.maxGuards || 'Unlimited'} Guards
                  </li>
                  {plan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-text-secondary font-medium">
                      <CheckCircle2 className="w-5 h-5 mr-3 text-text-muted shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={`/register?planId=${plan._id}`} className="mt-auto w-full">
                  <Button className={`w-full h-12 text-base font-bold ${index === 1 ? 'bg-emerald-600 hover:bg-emerald-500 border-0 text-text-main' : 'bg-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] text-text-main border-0'}`}>
                    Get Started
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface-sidebar border-t border-border-subtle text-text-main relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-100 bg-emerald-600/10 blur-[120px] pointer-events-none rounded-[100%]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-text-main">Ready to modernize your patrols?</h2>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto font-light">
            Join elite security operations teams using TrackSentra to monitor, analyze, and optimize their daily deployments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button className="w-full sm:w-auto h-14 px-10 text-lg bg-emerald-600 text-text-main hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 font-bold border-0 transition-transform hover:scale-105">
                Start Your Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" className="w-full sm:w-auto h-14 px-10 text-lg bg-[var(--color-surface-main)] text-text-main border border-border-subtle hover:bg-[var(--color-border-subtle)] shadow-xl font-bold backdrop-blur-sm">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
