import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Privacy = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-emerald-500/30 pb-32">
      {/* Header */}
      <section className="bg-background text-text-main pt-24 pb-32 px-4 sm:px-6 lg:px-8 border-b border-border-subtle text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="max-w-4xl mx-auto relative z-10 transition-all duration-1000 transform translate-y-0 opacity-100">
          <div className="w-16 h-16 bg-surface-sidebar border border-border-subtle shadow-[0_0_30px_rgba(59,130,246,0.3)] text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-lg text-text-muted">Effective Date: DRAFT REQUIRES LEGAL REVIEW</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar TOC */}
          <div className="md:w-1/4 hidden md:block">
            <div className="sticky top-32">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 px-3">Contents</h3>
              <nav className="space-y-1 border-l border-border-subtle">
                <a href="#introduction" className="flex text-sm text-text-muted hover:text-text-main transition-all py-2.5 px-4 border-l-2 border-transparent hover:border-emerald-500 hover:bg-surface-main">1. Introduction</a>
                <a href="#data-collection" className="flex text-sm text-text-muted hover:text-text-main transition-all py-2.5 px-4 border-l-2 border-transparent hover:border-emerald-500 hover:bg-surface-main">2. Data We Collect</a>
                <a href="#location" className="flex text-sm text-text-muted hover:text-text-main transition-all py-2.5 px-4 border-l-2 border-transparent hover:border-emerald-500 hover:bg-surface-main">3. Location Tracking</a>
                <a href="#data-usage" className="flex text-sm text-text-muted hover:text-text-main transition-all py-2.5 px-4 border-l-2 border-transparent hover:border-emerald-500 hover:bg-surface-main">4. How We Use Data</a>
                <a href="#security" className="flex text-sm text-text-muted hover:text-text-main transition-all py-2.5 px-4 border-l-2 border-transparent hover:border-emerald-500 hover:bg-surface-main">5. Data Security</a>
              </nav>
            </div>
          </div>

          {/* Legal Text */}
          <div className={`md:w-3/4 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} delay-200`}>
            <Card className="p-8 sm:p-12 border-border-subtle shadow-2xl bg-surface-sidebar rounded-3xl">
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 mb-12 rounded-xl flex items-start gap-4">
                <AlertTriangle className="text-amber-500 w-6 h-6 shrink-0" />
                <div>
                  <h4 className="text-amber-400 font-bold mb-1">Draft Document</h4>
                  <p className="text-amber-500/80 text-sm leading-relaxed">This is a provisional Privacy Policy for the TrackSentra marketing website. It does not constitute binding legal terms and must be reviewed by legal counsel before public launch.</p>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h2 id="introduction" className="text-2xl font-bold text-text-main mb-4">1. Introduction</h2>
                  <p className="text-text-secondary leading-relaxed">
                    Welcome to TrackSentra. We respect your privacy and are committed to protecting your personal data and the data of your security personnel. This privacy policy informs you how we look after the personal data processed by our Security Patrol Management SaaS.
                  </p>
                </section>

                <section>
                  <h2 id="data-collection" className="text-2xl font-bold text-text-main mb-4">2. Data We Collect</h2>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    As a B2B SaaS provider, we process data on behalf of our corporate clients (Tenants). The data we collect includes:
                  </p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed"><strong className="text-text-main font-bold">Identity Data:</strong> First name, last name, employee IDs, and roles.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed"><strong className="text-text-main font-bold">Contact Data:</strong> Work email addresses and phone numbers.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed"><strong className="text-text-main font-bold">Operational Data:</strong> Checkpoint scans, shift assignments, and incident reports.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed"><strong className="text-text-main font-bold">Device & Technical Data:</strong> IP addresses, browser types, and authentication tokens.</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 id="location" className="text-2xl font-bold text-text-main mb-4">3. Location Tracking (GPS)</h2>
                  <p className="text-text-secondary leading-relaxed">
                    TrackSentra utilizes the HTML5 Geolocation API to verify guard presence. Location data is only collected actively when a guard explicitly interacts with the system (e.g., scanning a QR code or submitting an incident report). We do not perform continuous passive background location tracking. All GPS coordinates are securely associated with the specific patrol session.
                  </p>
                </section>

                <section>
                  <h2 id="data-usage" className="text-2xl font-bold text-text-main mb-4">4. How We Use Your Data</h2>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    We only use personal data to perform the SaaS contract. Specifically:
                  </p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed">To authenticate users and enforce Role-Based Access Control (RBAC).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed">To provide real-time telemetry to SOC administrators.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed">To generate automated compliance and operational reports.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <span className="text-text-secondary leading-relaxed">To maintain immutable audit logs for security investigations.</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 id="security" className="text-2xl font-bold text-text-main mb-4">5. Data Security & Multi-tenancy</h2>
                  <p className="text-text-secondary leading-relaxed">
                    TrackSentra employs strict logical isolation at the database level to ensure that tenant data cannot cross-pollinate. We use industry-standard encryption for data at rest (AES-256) and data in transit (TLS 1.3). Access to the production environment is strictly limited to authorized engineering personnel.
                  </p>
                </section>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
