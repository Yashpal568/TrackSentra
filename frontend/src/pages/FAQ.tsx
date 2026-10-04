import { HelpCircle, Plus, Minus, MessageSquare, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const faqs = [
    {
      category: 'Product & Operations',
      items: [
        {
          question: 'How do QR checkpoints work?',
          answer: 'You define checkpoints for a site in the TrackSentra dashboard. The system generates secure, cryptographically signed QR codes which you can print and place at physical locations. Guards then scan these codes during their patrols using their mobile devices to log their presence.'
        },
        {
          question: 'Is GPS tracking continuous?',
          answer: 'TrackSentra captures GPS coordinates at critical moments: when a checkpoint is scanned or when an incident is reported. This ensures pinpoint accuracy and verifies presence at key locations without draining the guard\'s device battery through continuous passive tracking.'
        },
        {
          question: 'Do guards need to install a special app?',
          answer: 'No, TrackSentra is a progressive web application (PWA). Guards can simply log in through the browser on any modern smartphone. The interface is completely optimized for mobile screens, supports offline caching, and functions exactly like a native app.'
        },
        {
          question: 'What happens if a guard misses a checkpoint?',
          answer: 'The system automatically flags missed checkpoints based on the required route sequence. You can view these anomalies in real-time on the Live Monitoring dashboard and they will be permanently logged in the historical Reports section.'
        }
      ]
    },
    {
      category: 'Data & Billing',
      items: [
        {
          question: 'How does billing work?',
          answer: 'We offer flexible subscription plans based on your scale. Billing is handled on a monthly or annual basis, and limits apply depending on your chosen tier (e.g., maximum guards, maximum sites). You can upgrade your plan at any time.'
        },
        {
          question: 'Can I export my operational data?',
          answer: 'Yes! All operational summaries, guard reports, and incident logs can be exported to standard CSV formats for your compliance records, client presentations, or ingestion into other enterprise systems.'
        },
        {
          question: 'Is my data secure?',
          answer: 'TrackSentra employs enterprise-grade security with strict multi-tenant data isolation. Your company data, site layouts, personnel records, and incident reports are completely private and only accessible to authorized users within your organization.'
        }
      ]
    }
  ];

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-emerald-500/30 pb-32">
      {/* FAQ Header */}
      <section className="bg-background text-text-main pt-24 pb-48 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-border-subtle text-center">
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/20 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className={`max-w-3xl mx-auto relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="w-16 h-16 bg-surface-sidebar border border-border-subtle shadow-[0_0_30px_rgba(59,130,246,0.3)] text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Frequently Asked <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-300">Questions</span>
          </h1>
          <p className="text-xl text-text-muted leading-relaxed font-light max-w-2xl mx-auto">
            Everything you need to know about the product, operations, and billing.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="space-y-12">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`} style={{ transitionDelay: `${catIdx * 200}ms` }}>
              <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.items.map((faq, idx) => {
                  const globalIdx = catIdx * 100 + idx;
                  const isOpen = openIndex === globalIdx;
                  
                  return (
                    <Card 
                      key={idx} 
                      className={`overflow-hidden transition-all duration-300 border ${isOpen ? 'border-emerald-500 shadow-md bg-surface-sidebar' : 'border-border-subtle bg-surface-sidebar hover:border-border-subtle hover:shadow-sm'}`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                        className="w-full text-left p-6 md:p-8 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        aria-expanded={isOpen}
                      >
                        <h3 className={`text-lg font-bold pr-8 transition-colors ${isOpen ? 'text-emerald-600' : 'text-text-main'}`}>
                          {faq.question}
                        </h3>
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-emerald-900/40 text-emerald-600' : 'bg-[var(--color-border-subtle)] text-text-secondary'}`}>
                          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                        </div>
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="px-6 md:px-8 pb-6 md:pb-8 text-text-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className={`mt-24 bg-surface-sidebar rounded-3xl p-8 md:p-12 border border-border-subtle shadow-xl text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
          <div className="w-16 h-16 bg-background border border-border-subtle text-text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-2xl font-bold text-text-main mb-4">Still have questions?</h3>
          <p className="text-text-secondary max-w-xl mx-auto mb-8">
            Can't find the answer you're looking for? Please chat to our friendly team.
          </p>
          <Link to="/contact">
            <Button className="h-12 px-8 font-bold shadow-md">
              Contact Support <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
