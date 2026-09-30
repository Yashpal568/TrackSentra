import { Link, Outlet, useLocation } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { useState, useEffect } from 'react';

export const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#050806] flex flex-col font-sans selection:bg-emerald-500/30">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-[#0B110E]/95 backdrop-blur-md border-[#1D2B22] shadow-lg py-3' : 'bg-[#0B110E] border-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold flex items-center gap-2 text-[#F0FDF4] hover:text-emerald-400 transition-colors group">
            <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20">
              <Shield className="text-[#F0FDF4] w-6 h-6" />
            </div>
            TrackSentra
          </Link>
          
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/how-it-works" className="text-[#718078] hover:text-[#F0FDF4] text-sm font-semibold transition-colors">How it Works</Link>
            <Link to="/features" className="text-[#718078] hover:text-[#F0FDF4] text-sm font-semibold transition-colors">Features</Link>
            <Link to="/pricing" className="text-[#718078] hover:text-[#F0FDF4] text-sm font-semibold transition-colors">Pricing</Link>
            <Link to="/faq" className="text-[#718078] hover:text-[#F0FDF4] text-sm font-semibold transition-colors">FAQ</Link>
            <Link to="/contact" className="text-[#718078] hover:text-[#F0FDF4] text-sm font-semibold transition-colors">Contact</Link>
            
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            
            <Link to="/login" className="text-[#718078] hover:text-[#F0FDF4] text-sm font-semibold transition-colors">Log in</Link>
            <Link to="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-[#F0FDF4] border-0 shadow-lg shadow-emerald-600/20 font-semibold rounded-full px-6">
                Start Free Trial
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden text-[#718078] hover:text-[#F0FDF4] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0B110E] border-b border-[#1D2B22] shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
            <Link to="/how-it-works" className="text-[#718078] hover:text-[#F0FDF4] text-base font-semibold py-2">How it Works</Link>
            <Link to="/features" className="text-[#718078] hover:text-[#F0FDF4] text-base font-semibold py-2">Features</Link>
            <Link to="/pricing" className="text-[#718078] hover:text-[#F0FDF4] text-base font-semibold py-2">Pricing</Link>
            <Link to="/faq" className="text-[#718078] hover:text-[#F0FDF4] text-base font-semibold py-2">FAQ</Link>
            <Link to="/contact" className="text-[#718078] hover:text-[#F0FDF4] text-base font-semibold py-2">Contact</Link>
            <div className="h-px w-full bg-[#101713] my-2"></div>
            <Link to="/login" className="text-[#718078] hover:text-[#F0FDF4] text-base font-semibold py-2">Log in</Link>
            <Link to="/register" className="pt-2">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-[#F0FDF4] border-0 font-semibold rounded-lg justify-center">
                Start Free Trial
              </Button>
            </Link>
          </div>
        )}
      </nav>

      <main className="flex-1 flex flex-col w-full pt-[72px] md:pt-[88px]">
        <Outlet />
      </main>

      <footer className="bg-[#050806] text-[#718078] py-20 px-4 sm:px-6 lg:px-8 mt-auto border-t border-slate-900 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-xl h-32 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 lg:gap-8 mb-16 relative z-10">
          <div className="md:col-span-12 lg:col-span-5 lg:pr-12">
            <Link to="/" className="text-2xl font-extrabold flex items-center gap-2 text-[#F0FDF4] mb-6 group">
              <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20">
                <Shield className="text-[#F0FDF4] w-5 h-5" />
              </div>
              TrackSentra
            </Link>
            <p className="text-sm leading-relaxed mb-8 text-[#718078] max-w-md">
              The premium Industrial Security Patrol Management SaaS. Turn reactive security into proactive command with real-time GPS tracking, QR checkpoints, and instant incident reporting.
            </p>
            <div className="flex gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-[#F0FDF4] font-bold mb-6 tracking-wide text-sm uppercase">Product</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link></li>
              <li><Link to="/features" className="hover:text-emerald-400 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-[#F0FDF4] font-bold mb-6 tracking-wide text-sm uppercase">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Sales</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-[#F0FDF4] font-bold mb-6 tracking-wide text-sm uppercase">Support & Operations</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <a href="mailto:support@tracksentra.com" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-[#0B110E] border border-[#1D2B22] flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">@</span>
                  support@tracksentra.com
                </a>
              </li>
              <li>
                <Link to="/help" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-[#0B110E] border border-[#1D2B22] flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">?</span>
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-sm font-medium max-w-7xl mx-auto border-t border-[#1D2B22]/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <span>&copy; {new Date().getFullYear()} TrackSentra Inc. All rights reserved.</span>
          <div className="flex items-center gap-2 text-[#A1B5A8]">
             <Shield size={14} /> Built for Enterprise Security
          </div>
        </div>
      </footer>
    </div>
  );
};
