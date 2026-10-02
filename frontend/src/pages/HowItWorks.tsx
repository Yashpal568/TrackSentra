import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Settings, MapPin, FileText, QrCode, Shield, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

const GuideCard = ({ title, description, icon: Icon, image, step, active, onClick }: any) => {
  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 rounded-3xl p-[1px] overflow-visible ${active ? 'scale-105 z-10 shadow-[0_20px_50px_rgba(16,185,129,0.15)]' : 'hover:scale-[1.02] scale-100 z-0 opacity-60 hover:opacity-100'}`}
      onClick={onClick}
      style={{ perspective: '1200px' }}
    >
      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500 via-[var(--color-border-subtle)] to-emerald-900 rounded-3xl opacity-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'group-hover:opacity-50'}`} />
      
      <div className={`relative h-full w-full bg-[var(--color-surface-sidebar)] rounded-[23px] p-6 lg:p-8 flex flex-col transition-transform duration-300 ease-out`}
           style={{ 
             transformStyle: 'preserve-3d', 
             transform: active ? 'translateZ(20px) rotateX(4deg) rotateY(-4deg)' : 'translateZ(0px) rotateX(0deg) rotateY(0deg)' 
           }}>
        
        {/* Giant Background Number */}
        <div className="absolute top-4 right-6 text-7xl font-black text-[#151D18] transition-colors duration-300 group-hover:text-[#1A2A20] select-none" style={{ transform: 'translateZ(-10px)' }}>
          0{step}
        </div>

        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-xl transition-all duration-300 transform ${active ? 'bg-emerald-600 shadow-emerald-500/40 translate-y-[-10px] translate-z-20' : 'bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] group-hover:-translate-y-2'}`} style={{ transform: 'translateZ(30px)' }}>
          <Icon className={`w-6 h-6 ${active ? 'text-[var(--color-text-main)]' : 'text-emerald-500'}`} />
        </div>
        
        <h3 className="text-2xl font-bold text-[var(--color-text-main)] mb-3 transition-transform duration-300" style={{ transform: 'translateZ(40px)' }}>{title}</h3>
        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8 flex-1 transition-transform duration-300 font-medium text-sm" style={{ transform: 'translateZ(20px)' }}>
          {description}
        </p>

        {/* Image/Mockup Container */}
        <div className="w-full mt-auto rounded-xl bg-[var(--color-background)] border border-[var(--color-border-subtle)] overflow-hidden aspect-[4/3] relative shadow-2xl transition-all duration-300" style={{ transform: 'translateZ(50px)' }}>
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-surface-main)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-surface-main)_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
             {image}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Auto-advance logic for the demo page
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 1,
      title: 'Setup Infrastructure',
      description: 'Easily map out your sites and generate QR checkpoints. Assign locations to your guards instantly from the dashboard.',
      icon: Settings,
      image: (
        <div className="w-full h-full flex flex-col gap-2 opacity-90">
          <div className="h-6 w-1/3 bg-[#1A2A20] rounded animate-pulse"></div>
          <div className="flex-1 rounded-lg border border-emerald-900/30 bg-[var(--color-surface-sidebar)] p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-[#1A2A20] pb-2">
              <QrCode size={16} className="text-emerald-500" />
              <div className="h-2 w-20 bg-emerald-900 rounded"></div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-16 h-16 bg-[var(--color-text-main)] rounded p-1 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <QrCode size={40} className="text-[var(--color-background)]" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Track Security Guards',
      description: 'Guards use their mobile devices to scan checkpoints. Every scan logs precise GPS coordinates and timestamps to prevent spoofing.',
      icon: MapPin,
      image: (
        <div className="w-full h-full flex items-center justify-center opacity-90 relative">
          <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20 animate-[ping_3s_linear_infinite]"></div>
          <div className="absolute w-16 h-16 rounded-full border border-emerald-500/40 animate-[ping_2s_linear_infinite]"></div>
          <div className="w-10 h-10 bg-[var(--color-surface-sidebar)] border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10">
            <ShieldCheck size={20} className="text-emerald-400" />
          </div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-slate-700 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-slate-700 rounded-full"></div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Live Monitoring',
      description: 'Watch your entire security operation unfold in real-time. Detect missed checkpoints, SOS alerts, and idle patrols instantly.',
      icon: Activity,
      image: (
        <div className="w-full h-full flex flex-col gap-3 opacity-90">
          <div className="flex justify-between items-center bg-[var(--color-surface-sidebar)] p-2 rounded border border-[#1A2A20]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><div className="h-2 w-16 bg-[#1A2A20] rounded"></div></div>
            <div className="h-3 w-8 bg-emerald-900 rounded"></div>
          </div>
          <div className="flex justify-between items-center bg-[var(--color-surface-sidebar)] p-2 rounded border border-[#1A2A20]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500 rounded-full"></div><div className="h-2 w-16 bg-[#1A2A20] rounded"></div></div>
            <div className="h-3 w-8 bg-orange-900 rounded"></div>
          </div>
          <div className="flex justify-between items-center bg-[var(--color-surface-sidebar)] p-2 rounded border border-[#1A2A20]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><div className="h-2 w-16 bg-[#1A2A20] rounded"></div></div>
            <div className="h-3 w-8 bg-emerald-900 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Create Reports',
      description: 'Generate comprehensive shift reports, incident logs, and compliance audits with a single click. Export to PDF for clients.',
      icon: FileText,
      image: (
        <div className="w-full h-full flex flex-col gap-2 p-2 opacity-90 border border-[#1A2A20] bg-[var(--color-surface-sidebar)] rounded">
          <div className="h-2 w-1/4 bg-emerald-900 rounded mb-2"></div>
          <div className="flex gap-2">
             <div className="w-1/2 h-8 bg-[#151D18] rounded flex items-end p-1"><div className="w-1/3 h-full bg-emerald-700 rounded-t mx-auto"></div><div className="w-1/3 h-1/2 bg-emerald-800 rounded-t mx-auto"></div></div>
             <div className="w-1/2 h-8 bg-[#151D18] rounded flex items-end p-1"><div className="w-1/3 h-2/3 bg-emerald-600 rounded-t mx-auto"></div><div className="w-1/3 h-full bg-emerald-500 rounded-t mx-auto"></div></div>
          </div>
          <div className="h-1 w-full bg-[#1A2A20] mt-2 rounded"></div>
          <div className="h-1 w-3/4 bg-[#1A2A20] rounded"></div>
          <div className="h-1 w-5/6 bg-[#1A2A20] rounded"></div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-[var(--color-background)] min-h-screen font-sans selection:bg-emerald-500/30 overflow-hidden pb-32">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center border-b border-[var(--color-border-subtle)]/50">
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[100px] rounded-[100%] pointer-events-none"></div>

        <div className={`relative z-10 max-w-4xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-sidebar)] border border-[var(--color-border-subtle)] text-emerald-400 text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Shield size={16} /> Complete Guidance
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-[var(--color-text-main)] leading-tight">
            How to command your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Security Operations</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            From zero to complete visibility in minutes. Discover how TrackSentra protects your assets, verifies your guards, and generates irrefutable proof of presence.
          </p>
        </div>
      </section>

      {/* Interactive 3D Guide Cards */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.id} className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ transitionDelay: `${index * 150}ms` }}>
              <GuideCard 
                title={step.title}
                description={step.description}
                icon={step.icon}
                image={step.image}
                step={step.id}
                active={activeStep === step.id}
                onClick={() => setActiveStep(step.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Feature Details Section based on active step */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="bg-[var(--color-surface-sidebar)] border border-[var(--color-border-subtle)] rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-16 relative z-10 shadow-2xl">
          <div className="md:w-1/2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] text-emerald-400 mb-6">
              {React.createElement(steps[activeStep - 1].icon, { size: 24 })}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-main)] mb-6">Deep dive: {steps[activeStep - 1].title}</h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              TrackSentra is built on enterprise-grade architecture. In this phase, our system utilizes highly optimized modules to ensure 99.99% uptime, strict multi-tenant data isolation, and real-time WebSocket synchronization. 
            </p>
            <ul className="space-y-4 mb-8">
              {['Bank-level 256-bit AES encryption', 'Sub-second real-time latency', 'Offline-first mobile capabilities'].map((item, i) => (
                <li key={i} className="flex items-center text-[var(--color-text-muted)] font-medium">
                  <ShieldCheck size={20} className="text-emerald-500 mr-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register">
               <Button className="h-12 px-8 font-bold shadow-lg shadow-emerald-600/20">Try it out now <ArrowRight size={18} /></Button>
            </Link>
          </div>
          
          <div className="md:w-1/2 w-full aspect-square md:aspect-auto md:h-[400px] bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
             {/* Large representation of the active step */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#151D18_1px,transparent_1px),linear-gradient(to_bottom,#151D18_1px,transparent_1px)] bg-[size:24px_24px]"></div>
             <div className="relative z-10 scale-150 transform transition-transform duration-300 w-1/2 h-1/2">
               {steps[activeStep - 1].image}
             </div>
             
             {/* Glass overlay effect */}
             <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-sidebar)] via-transparent to-transparent opacity-80 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-32 max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-3xl font-bold text-[var(--color-text-main)] mb-6">Ready to secure your operations?</h3>
        <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of agencies transforming their security management with TrackSentra's premium toolset.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button className="h-14 px-10 text-lg font-bold shadow-xl shadow-emerald-500/25">Start Free Trial</Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" className="h-14 px-10 text-lg font-bold">Contact Sales</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
