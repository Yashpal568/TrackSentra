import React, { useState } from 'react';
import { api } from '../lib/axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, LockKeyhole, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    try {
      const { data } = await api.post('/auth/reset-password', { email, token, newPassword: password });
      setStatus('success');
      setMessage(data.message || 'Password has been reset successfully.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error?.message || 'Invalid or expired reset token.');
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#050806] flex items-center justify-center p-4">
        <div className="bg-[#0B110E] border border-red-200 text-center p-8 rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#F0FDF4] mb-2">Invalid Link</h2>
          <p className="text-[#A1B5A8] mb-6">This password reset link is invalid or missing required parameters.</p>
          <Link to="/forgot-password">
            <Button className="w-full bg-[#0B110E] hover:bg-[#101713] text-[#F0FDF4] font-bold border-0">Request a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050806] font-sans selection:bg-emerald-500/30 flex items-center justify-center p-4 py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-md bg-[#0B110E] rounded-3xl shadow-xl border border-[#1D2B22] overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#050806] p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-10"></div>
          <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-emerald-500/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <LockKeyhole size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#F0FDF4] relative z-10 tracking-tight">Create New Password</h2>
          <p className="mt-2 text-sm text-[#718078] relative z-10">
            Enter your new password below.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          {status === 'success' ? (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#F0FDF4] mb-2">Password Updated</h3>
              <p className="text-[#A1B5A8] text-sm mb-8 px-4">
                {message}
              </p>
              <Link to="/login">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-[#F0FDF4] font-bold border-0 shadow-lg shadow-emerald-500/25">
                  Sign in with new password
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status === 'error' && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium flex items-start gap-3">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  {message}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#1D2B22]">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#050806] border border-[#1D2B22] text-[#F0FDF4] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#1D2B22]">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#050806] border border-[#1D2B22] text-[#F0FDF4] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={status === 'loading'} 
                className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-500 text-[#F0FDF4] font-bold border-0 shadow-lg shadow-emerald-500/25 transition-all mt-4"
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-center w-full flex justify-center items-center gap-2 text-[#718078] text-sm">
        <Shield size={16} /> Secure Password Recovery
      </div>
    </div>
  );
};
