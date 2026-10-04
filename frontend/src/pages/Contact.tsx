import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Mail, Phone, MapPin, Building2, CheckCircle2, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Contact = () => {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API call securely
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-emerald-500/30">
      {/* Contact Hero */}
      <section className="bg-background text-text-main pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-border-subtle text-center">
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/20 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className={`max-w-3xl mx-auto relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="w-16 h-16 bg-surface-sidebar border border-border-subtle shadow-[0_0_30px_rgba(59,130,246,0.3)] text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Building2 size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Contact <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-300">Sales</span>
          </h1>
          <p className="text-xl text-text-muted leading-relaxed font-light max-w-2xl mx-auto">
            Ready to modernize your security operations? Our team is here to help you get started with TrackSentra.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-32">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-16">
          
          {/* Contact Information */}
          <div className={`lg:col-span-2 space-y-8 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'} delay-200`}>
            <Card className="p-8 border-border-subtle shadow-xl bg-surface-sidebar rounded-3xl h-full">
              <h3 className="text-2xl font-bold text-text-main mb-8">Get in touch</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/30 flex items-center justify-center shrink-0">
                    <Mail className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main text-lg">Sales Inquiries</h4>
                    <p className="text-text-secondary mb-1">Our sales team is here to help.</p>
                    <a href="mailto:sales@tracksentra.com" className="text-emerald-600 font-semibold hover:text-emerald-400 transition-colors">sales@tracksentra.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/30 flex items-center justify-center shrink-0">
                    <Phone className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main text-lg">Call Us</h4>
                    <p className="text-text-secondary mb-1">Mon-Fri from 9am to 6pm EST.</p>
                    <a href="tel:+18005550199" className="text-emerald-600 font-semibold hover:text-emerald-400 transition-colors">+1 (800) 555-0199</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/30 flex items-center justify-center shrink-0">
                    <MapPin className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main text-lg">Global Headquarters</h4>
                    <p className="text-text-secondary leading-relaxed">
                      100 Security Plaza<br/>
                      Suite 400<br/>
                      New York, NY 10001
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-background rounded-2xl border border-border-subtle">
                <h4 className="font-bold text-text-main mb-2 flex items-center gap-2">
                  <Shield size={18} className="text-emerald-500" /> Enterprise Support
                </h4>
                <p className="text-sm text-text-secondary mb-4">Existing customers can access 24/7 priority support through the Help Center.</p>
                <Button variant="secondary" className="w-full bg-surface-sidebar text-text-main border border-border-subtle hover:bg-background shadow-sm">
                  Visit Help Center
                </Button>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-3 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'} delay-400`}>
            <Card className="p-8 sm:p-10 border-border-subtle shadow-2xl bg-surface-sidebar rounded-3xl h-full relative overflow-hidden">
              {status === 'success' ? (
                <div className="absolute inset-0 bg-surface-sidebar flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-emerald-primary/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="text-green-500 w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold text-text-main mb-4">Request Received</h3>
                  <p className="text-lg text-text-secondary max-w-md mx-auto mb-8">
                    Thank you for reaching out! Your demo request has been securely processed. A security specialist will contact you shortly to schedule your personalized walkthrough.
                  </p>
                  <Button onClick={() => setStatus('')} variant="secondary" className="px-8 bg-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] text-text-main border-0">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="flex text-sm font-bold text-text-main">First Name <span className="text-red-500">*</span></label>
                      <input 
                        id="firstName"
                        required 
                        type="text" 
                        className="w-full bg-background border border-border-subtle text-text-main rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                        placeholder="John" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="flex text-sm font-bold text-text-main">Last Name <span className="text-red-500">*</span></label>
                      <input 
                        id="lastName"
                        required 
                        type="text" 
                        className="w-full bg-background border border-border-subtle text-text-main rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                        placeholder="Doe" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex text-sm font-bold text-text-main">Work Email <span className="text-red-500">*</span></label>
                    <input 
                      id="email"
                      required 
                      type="email" 
                      className="w-full bg-background border border-border-subtle text-text-main rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                      placeholder="john.doe@company.com" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company" className="flex text-sm font-bold text-text-main">Company Name <span className="text-red-500">*</span></label>
                    <input 
                      id="company"
                      required 
                      type="text" 
                      className="w-full bg-background border border-border-subtle text-text-main rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                      placeholder="Acme Security Services" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="guards" className="flex text-sm font-bold text-text-main">Number of Guards</label>
                    <select 
                      id="guards"
                      className="w-full bg-background border border-border-subtle text-text-main rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      <option value="">Please select...</option>
                      <option value="1-10">1-10 Guards</option>
                      <option value="11-50">11-50 Guards</option>
                      <option value="51-200">51-200 Guards</option>
                      <option value="201+">201+ Guards</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="flex text-sm font-bold text-text-main">How can we help? <span className="text-red-500">*</span></label>
                    <textarea 
                      id="message"
                      required 
                      rows={5} 
                      className="w-full bg-background border border-border-subtle text-text-main rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none" 
                      placeholder="Tell us about your requirements, current challenges, or specific features you'd like to see..."
                    ></textarea>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full text-lg py-4 h-auto bg-emerald-600 hover:bg-emerald-500 text-text-main font-bold border-0 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : 'Request Demo'}
                  </Button>
                  
                  <p className="text-sm text-text-secondary text-center mt-6">
                    By submitting this form, you agree to our <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a> and <a href="/terms" className="text-emerald-600 hover:underline">Terms of Service</a>.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
