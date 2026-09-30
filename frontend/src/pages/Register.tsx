import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const register = useAuthStore(state => state.register);

  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ ...formData, planId });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050806] font-sans selection:bg-emerald-500/30">
      {/* Left panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500 py-12">
          
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="text-2xl font-extrabold flex items-center justify-center lg:justify-start gap-2 text-[#F0FDF4] mb-6 lg:hidden">
              <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
                <Shield className="text-[#F0FDF4] w-6 h-6" />
              </div>
              TrackSentra
            </Link>
            <h1 className="text-3xl font-extrabold text-[#F0FDF4] tracking-tight">Create your account</h1>
            <p className="text-[#A1B5A8] mt-2">Start your 14-day free trial. No credit card required.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1D2B22]">Company Name</label>
              <input
                required
                className="w-full bg-[#0B110E] border border-[#1D2B22] text-[#F0FDF4] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                placeholder="Acme Security Services"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#1D2B22]">First Name</label>
                <input
                  required
                  className="w-full bg-[#0B110E] border border-[#1D2B22] text-[#F0FDF4] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#1D2B22]">Last Name</label>
                <input
                  required
                  className="w-full bg-[#0B110E] border border-[#1D2B22] text-[#F0FDF4] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1D2B22]">Work Email</label>
              <input
                type="email"
                required
                className="w-full bg-[#0B110E] border border-[#1D2B22] text-[#F0FDF4] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1D2B22]">Password</label>
              <input
                type="password"
                required
                className="w-full bg-[#0B110E] border border-[#1D2B22] text-[#F0FDF4] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-[#F0FDF4] shadow-lg shadow-emerald-500/25 border-0 transition-all mt-4"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[#A1B5A8]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-400 transition-colors">
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-[#A1B5A8]">
            By signing up, you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Right panel - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-[#050806] text-[#F0FDF4] relative overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Dark Emerald Overlay */}
        <div className="absolute inset-0 bg-[url('/images/login-bg.jpg')] bg-cover bg-center opacity-40 scale-x-[-1]"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-[#050806]/90 via-[#050806]/80 to-emerald-900/40"></div>
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-10 mix-blend-overlay"></div>
        


        <div className="relative z-10 max-w-lg mt-auto mb-auto ml-auto mr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B110E] border border-[#1D2B22] text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
            Join the platform
          </div>
          <h2 className="text-4xl font-extrabold mb-6 leading-tight tracking-tight">
            Stop guessing.<br/>Start managing.
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <p className="text-[#718078] font-medium">Deploy QR checkpoints across your sites in minutes.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <p className="text-[#718078] font-medium">Verify guard presence with pinpoint GPS accuracy.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <p className="text-[#718078] font-medium">View live operations from your command center.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
