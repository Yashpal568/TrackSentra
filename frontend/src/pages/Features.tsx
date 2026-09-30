import { Shield, QrCode, MapPin, BarChart3, AlertTriangle, Users, Smartphone, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const Features = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <QrCode className="w-8 h-8 text-emerald-400" />,
      title: 'QR Checkpoints',
      description: 'Generate and print encrypted QR codes. Guards scan these codes to cryptographically prove their physical presence during patrol routes.'
    },
    {
      icon: <MapPin className="w-8 h-8 text-emerald-400" />,
      title: 'GPS Verification',
      description: 'Every checkpoint scan is cross-referenced with sub-10 meter GPS accuracy. Flag ghost patrols instantly if a scan occurs outside the geofence.'
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-400" />,
      title: 'Shift Management',
      description: 'Build complex recurring schedules, assign personnel to specific sites, and ensure 24/7 coverage of your industrial facilities effortlessly.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
      title: 'Analytics & Reports',
      description: 'Generate automated operational summaries and detailed guard performance metrics. Export to CSV for compliance and client auditing.'
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-emerald-400" />,
      title: 'Incident Command',
      description: 'Guards file digital incident reports directly from the field with photo evidence. SOC managers are alerted instantly to coordinate resolution.'
    },
    {
      icon: <Zap className="w-8 h-8 text-emerald-400" />,
      title: 'Live Telemetry',
      description: 'View all active patrols globally on a real-time dashboard. Track checkpoint progress, ETA, and missed scans as they happen.'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-emerald-400" />,
      title: 'Offline Queueing',
      description: 'Guards operating in dead zones or basements can continue scanning. The app securely queues scans locally and syncs automatically when online.'
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      title: 'Tenant Isolation',
      description: 'Enterprise-grade architecture with strict multi-tenant data isolation. Your company data, site layouts, and personnel records are completely private.'
    }
  ];

  return (
    <div className="bg-[#050806] min-h-screen font-sans selection:bg-emerald-500/30">
      {/* Features Hero */}
      <section className="bg-[#050806] text-[#F0FDF4] pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[#1D2B22]">
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-full max-w-3xl h-96 bg-emerald-600/10 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B110E] border border-[#1D2B22] text-emerald-400 text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
              Platform Capabilities
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Powerful tools for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">Modern Security</span>
            </h1>
            <p className="text-xl text-[#718078] mb-8 leading-relaxed font-light max-w-lg">
              TrackSentra replaces disjointed paper logs and legacy software with a unified, cloud-native command center.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="w-full sm:w-auto h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-500 border-0 shadow-[0_0_30px_-10px_rgba(37,99,235,0.5)] transition-transform hover:scale-105">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
          
          <div className={`relative transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'} hidden lg:block`}>
            {/* Abstract Tech Visual instead of a broken image */}
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 border border-[#1D2B22] rounded-full animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute inset-4 border border-[#1D2B22] rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
              <div className="absolute inset-8 border border-[#1D2B22] rounded-full animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0B110E] rounded-full p-8 border border-[#1D2B22] shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                <Shield className="w-16 h-16 text-emerald-500" />
              </div>
              
              {/* Orbiting nodes */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
              <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-5 h-5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-8 hover:shadow-2xl transition-all duration-300 border-[#1D2B22] bg-[#0B110E] group rounded-2xl flex flex-col h-full hover:-translate-y-1">
              <div className="mb-6 bg-[#101713] border border-[#1D2B22] group-hover:bg-[#1D2B22] transition-colors w-16 h-16 flex items-center justify-center rounded-xl shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#F0FDF4] group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
              <p className="text-sm text-[#718078] leading-relaxed flex-1">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Deep Dive Section 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#1D2B22] bg-[#0B110E] h-96 group">
            <div className="absolute inset-0 bg-[#050806] flex flex-col">
              <div className="h-12 bg-[#0B110E] flex items-center px-4 justify-between border-b border-[#1D2B22]">
                <div className="text-[#F0FDF4] text-xs font-bold uppercase flex items-center gap-2"><MapPin size={14} className="text-emerald-400"/> Checkpoint Scanner</div>
                <div className="w-16 h-4 bg-[#101713] rounded-full"></div>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
                {/* Mockup UI */}
                <div className="w-48 h-48 border-4 border-emerald-500 rounded-xl flex items-center justify-center relative bg-[#0B110E] shadow-inner mb-6 z-10 group-hover:scale-105 transition-transform duration-500">
                  <QrCode size={80} className="text-[#F0FDF4]" />
                  <div className="absolute top-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(74,222,128,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
                <div className="bg-[#0B110E] text-[#F0FDF4] px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-10 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Checkpoint Verified
                </div>
                {/* Decorative map background */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-122.4194,37.7749,14,0/600x400?access_token=pk.ey')] bg-cover bg-center"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              Presence Verification
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#F0FDF4] tracking-tight">Ironclad Proof of Presence</h2>
            <p className="text-[#A1B5A8] text-lg leading-relaxed mb-8">
              Forget about guards falsifying logs. By requiring a physical scan of a unique QR code accompanied by a live GPS coordinate check, TrackSentra ensures that patrols are executed exactly as planned.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-emerald-900/40 p-1 rounded mt-0.5 mr-3"><MapPin className="w-4 h-4 text-emerald-400"/></div>
                <div>
                  <h4 className="font-bold text-[#F0FDF4] text-sm">GPS Geofencing</h4>
                  <p className="text-[#A1B5A8] text-sm mt-1">Scans are rejected if the device is outside the designated radius.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-emerald-900/40 p-1 rounded mt-0.5 mr-3"><QrCode className="w-4 h-4 text-emerald-400"/></div>
                <div>
                  <h4 className="font-bold text-[#F0FDF4] text-sm">Encrypted Payloads</h4>
                  <p className="text-[#A1B5A8] text-sm mt-1">Checkpoints cannot be duplicated or bypassed with photos.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-emerald-900/40 p-1 rounded mt-0.5 mr-3"><Zap className="w-4 h-4 text-emerald-400"/></div>
                <div>
                  <h4 className="font-bold text-[#F0FDF4] text-sm">Offline Redundancy</h4>
                  <p className="text-[#A1B5A8] text-sm mt-1">Scans are queued securely in the browser if connectivity drops.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Deep Dive Section 2 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              Rapid Response
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#F0FDF4] tracking-tight">Instant Incident Command</h2>
            <p className="text-[#A1B5A8] text-lg leading-relaxed mb-8">
              When a breach or safety hazard is discovered, every second counts. Guards can instantly snap photos, add notes, and classify incidents right from the field. 
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-emerald-900/40 p-1 rounded mt-0.5 mr-3"><AlertTriangle className="w-4 h-4 text-emerald-400"/></div>
                <div>
                  <h4 className="font-bold text-[#F0FDF4] text-sm">Real-time Push Alerts</h4>
                  <p className="text-[#A1B5A8] text-sm mt-1">Supervisors receive immediate notifications for critical severities.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-emerald-900/40 p-1 rounded mt-0.5 mr-3"><Smartphone className="w-4 h-4 text-emerald-400"/></div>
                <div>
                  <h4 className="font-bold text-[#F0FDF4] text-sm">Photo Evidence</h4>
                  <p className="text-[#A1B5A8] text-sm mt-1">Attach visual proof directly to the digital incident record.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-emerald-900/40 p-1 rounded mt-0.5 mr-3"><Shield className="w-4 h-4 text-emerald-400"/></div>
                <div>
                  <h4 className="font-bold text-[#F0FDF4] text-sm">Secure Investigation Logs</h4>
                  <p className="text-[#A1B5A8] text-sm mt-1">Maintain an immutable audit trail of the resolution process.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="order-1 lg:order-2 rounded-2xl overflow-hidden shadow-2xl border border-[#1D2B22] bg-[#0B110E] h-96 relative group">
            <div className="absolute inset-0 bg-[#050806] flex flex-col p-6 items-center justify-center">
               <Card className="w-full max-w-sm bg-[#0B110E] shadow-xl border-orange-200 border-t-4 border-t-emerald-950/300 p-6 transform group-hover:-translate-y-2 transition-transform duration-500">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-emerald-900/40 rounded-full flex items-center justify-center">
                     <AlertTriangle className="text-orange-600 w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-[#F0FDF4]">Broken Perimeter Fence</h4>
                     <p className="text-xs text-[#A1B5A8]">Sector 4 • High Severity</p>
                   </div>
                 </div>
                 <div className="h-24 bg-[#1D2B22] rounded border border-[#1D2B22] flex items-center justify-center text-[#718078] text-sm mb-4">
                   [ Photo Attached ]
                 </div>
                 <div className="h-2 w-3/4 bg-[#1D2B22] rounded mb-2"></div>
                 <div className="h-2 w-1/2 bg-[#1D2B22] rounded"></div>
               </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-[#0B110E] text-center px-4">
        <h2 className="text-3xl font-bold text-[#F0FDF4] mb-6">Experience the difference today.</h2>
        <p className="text-[#718078] mb-8 max-w-xl mx-auto">Stop managing security operations with spreadsheets and clipboards. Get the platform built for modern agencies.</p>
        <Link to="/register">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-[#F0FDF4] h-12 px-8 text-base font-bold border-0">
            Create Your Account <ArrowRight className="ml-2" size={18} />
          </Button>
        </Link>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}} />
    </div>
  );
};
