import { useEffect, useState } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Terms = () => {
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
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Terms of Service</h1>
          <p className="text-lg text-[#718078]">Effective Date: DRAFT REQUIRES LEGAL REVIEW</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar TOC */}
          <div className="md:w-1/4 hidden md:block">
            <div className="sticky top-32 space-y-2 text-sm font-medium">
              <a href="#acceptance" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">1. Acceptance of Terms</a>
              <a href="#service" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">2. Provision of Service</a>
              <a href="#accounts" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">3. Accounts & Security</a>
              <a href="#acceptable-use" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">4. Acceptable Use</a>
              <a href="#liability" className="block text-[#A1B5A8] hover:text-emerald-600 transition-colors p-2 rounded hover:bg-[#1D2B22]">5. Limitation of Liability</a>
            </div>
          </div>

          {/* Legal Text */}
          <div className={`md:w-3/4 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} delay-200`}>
            <Card className="p-8 sm:p-12 border-[#1D2B22] shadow-xl bg-[#0B110E] rounded-3xl">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-10 rounded-r-lg flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-800 font-bold mb-1">Draft Document</h4>
                  <p className="text-yellow-700 text-sm">This is a provisional Terms of Service for the TrackSentra marketing website. It does not constitute a binding legal contract and must be reviewed by legal counsel before public launch.</p>
                </div>
              </div>

              <div className="prose prose-slate prose-blue max-w-none">
                <h2 id="acceptance" className="text-2xl font-bold text-[#F0FDF4] mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-6">
                  By accessing and using the TrackSentra Security Patrol Management SaaS ("Service"), you accept and agree to be bound by the terms and provision of this agreement. Any participation in this Service will constitute acceptance of this agreement.
                </p>

                <h2 id="service" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">2. Provision of Service</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-6">
                  TrackSentra provides a B2B cloud-based platform for managing guards, QR checkpoints, and incident reporting. We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. TrackSentra shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.
                </p>

                <h2 id="accounts" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">3. Member Account, Password, and Security</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-4">
                  If you register for the Service, you are responsible for maintaining the confidentiality of your account and password, and for restricting access to your computer or mobile device. You agree to accept responsibility for all activities that occur under your account or password.
                </p>
                <ul className="list-disc pl-6 text-[#A1B5A8] space-y-2 mb-6">
                  <li>You must provide accurate, current, and complete information during the registration process.</li>
                  <li>You must immediately notify TrackSentra of any unauthorized use of your password or account or any other breach of security.</li>
                  <li>TrackSentra cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.</li>
                </ul>

                <h2 id="acceptable-use" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">4. Acceptable Use & Geolocation</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-6">
                  The Service involves the processing of employee geolocation data. You, as the Tenant, are solely responsible for obtaining any necessary consent from your employees (Guards) required by local labor laws, privacy regulations (such as GDPR or CCPA), or union agreements prior to using the GPS tracking features of this software. TrackSentra provides the tools to manage security operations; the legal compliance of how those tools are deployed rests entirely with the subscribing organization.
                </p>

                <h2 id="liability" className="text-2xl font-bold text-[#F0FDF4] mt-10 mb-4">5. Limitation of Liability</h2>
                <p className="text-[#A1B5A8] leading-relaxed mb-6">
                  TrackSentra does not guarantee that the Service will be uninterrupted, timely, secure, or error-free. In no event shall TrackSentra be liable for any indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use or the inability to use the service.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
