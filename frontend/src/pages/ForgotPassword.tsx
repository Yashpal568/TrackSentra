import React, { useState } from 'react';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setStatus(data.message || 'If an account exists, a reset link has been sent.');
    } catch (error: any) {
      // Always show success message to prevent email enumeration
      setStatus('If an account exists, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/30 flex items-center justify-center p-4 py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full"></div>
      
      <div className="w-full max-w-md bg-surface-sidebar rounded-3xl shadow-xl border border-border-subtle overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-background p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-10"></div>
          <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-emerald-500/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-text-main relative z-10 tracking-tight">Forgot Password</h2>
          <p className="mt-2 text-sm text-text-muted relative z-10">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          {status ? (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-primary/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Check your inbox</h3>
              <p className="text-text-secondary text-sm mb-8 px-4">
                {status}
              </p>
              <Link to="/login">
                <Button className="w-full bg-surface-sidebar hover:bg-surface-main text-text-main font-bold border-0">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="flex text-sm font-bold text-text-main">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-background border border-border-subtle text-text-main rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-500 text-text-main font-bold border-0 shadow-lg shadow-emerald-500/25 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </Button>
              
              <div className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 font-bold text-text-secondary hover:text-text-main text-sm transition-colors">
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-center w-full flex justify-center items-center gap-2 text-text-muted text-sm">
        <Shield size={16} /> Secure Password Recovery
      </div>
    </div>
  );
};
