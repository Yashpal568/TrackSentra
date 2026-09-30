import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Privacy = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-[#050806] min-h-screen font-sans selection:bg-emerald-500/30 pb-32">
      {/* Header */}
      <section className="bg-[#050806] text-[#F0FDF4] pt-24 pb-32 px-4 sm:px-6 lg:px-8 border-b border-[#1D2B22] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="max-w-4xl mx-auto relative z-10 transition-all duration-1000 transform translate-y-0 opacity-100">
          <div className="w-16 h-16 bg-[#0B110E] border border-[#1D2B22] shadow-[0_0_30px_rgba(59,130,246,0.3)] text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-lg text-[#718078]">Effective Date: DRAFT REQUIRES LEGAL REVIEW</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar TOC */}
          <div className="md:w-1/4 hidden md:block">
            <div className="sticky top-32 space-y-2 text-sm font-medium">
              <a href="#introduction" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">1. Introduction</a>
              <a href="#data-collection" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">2. Data We Collect</a>
              <a href="#data-usage" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">3. How We Use Data</a>
              <a href="#location" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">4. Location Tracking</a>
              <a href="#sharing" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">5. Data Sharing</a>
              <a href="#security" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">6. Data Security</a>
            </div>
          </div>

          {/* Legal Text */}
          <div className={`md:w-3/4 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} delay-200`}>
            <Card className="p-8 sm:p-12 border-[#1D2B22] shadow-xl bg-[#0B110E] rounded-3xl">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-10 rounded-r-lg flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-800 font-bold mb-1">Draft Document</h4>
                  <p className="text-yellow-700 text-sm">This is a provisional Privacy Policy for the TrackSentra marketing website. It does not constitute binding legal terms and must be reviewed by legal counsel before public launch.</p>
                </div>
              </div>

              <div className="prose prose-slate prose-blue max-w-none">
                <h2 id="introduction" className="text-2xl font-bold text-[#F0FDF4] mt-8 mb-4">1. Introduction</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-6">
                  Welcome to TrackSentra. We respect your privacy and are committed to protecting your personal data and the data of your security personnel. This privacy policy informs you how we look after the personal data processed by our Security Patrol Management SaaS.
                </p>

                <h2 id="data-collection" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">2. Data We Collect</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-4">
                  As a B2B SaaS provider, we process data on behalf of our corporate clients (Tenants). The data we collect includes:
                </p>
                <ul className="list-disc pl-6 text-[#A1B5A8] space-y-2 mb-6">
                  <li><strong className="text-[#F0FDF4]">Identity Data:</strong> First name, last name, employee IDs, and roles.</li>
                  <li><strong className="text-[#F0FDF4]">Contact Data:</strong> Work email addresses and phone numbers.</li>
                  <li><strong className="text-[#F0FDF4]">Operational Data:</strong> Checkpoint scans, shift assignments, and incident reports.</li>
                  <li><strong className="text-[#F0FDF4]">Device & Technical Data:</strong> IP addresses, browser types, and authentication tokens.</li>
                </ul>

                <h2 id="location" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">3. Location Tracking (GPS)</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-6">
                  TrackSentra utilizes the HTML5 Geolocation API to verify guard presence. Location data is only collected actively when a guard explicitly interacts with the system (e.g., scanning a QR code or submitting an incident report). We do not perform continuous passive background location tracking. All GPS coordinates are securely associated with the specific patrol session.
                </p>

                <h2 id="data-usage" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">4. How We Use Your Data</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-4">
                  We only use personal data to perform the SaaS contract. Specifically:
                </p>
                <ul className="list-disc pl-6 text-[#A1B5A8] space-y-2 mb-6">
                  <li>To authenticate users and enforce Role-Based Access Control (RBAC).</li>
                  <li>To provide real-time telemetry to SOC administrators.</li>
                  <li>To generate automated compliance and operational reports.</li>
                  <li>To maintain immutable audit logs for security investigations.</li>
                </ul>

                <h2 id="security" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">5. Data Security & Multi-tenancy</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-6">
                  TrackSentra employs strict logical isolation at the database level to ensure that tenant data cannot cross-pollinate. We use industry-standard encryption for data at rest (AES-256) and data in transit (TLS 1.3). Access to the production environment is strictly limited to authorized engineering personnel.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
