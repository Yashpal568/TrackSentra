import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Shield, Globe, Eye, EyeOff } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguageStore();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      
      const currentUser = useAuthStore.getState().user;
      
      // Validate 'from' to prevent open redirects (must be an internal path starting with / but not //)
      let destination = '/dashboard';
      if (from && from.startsWith('/') && !from.startsWith('//')) {
        destination = from;
      }

      // Role-based redirect logic:
      // If a non-guard tries to access the scanner, redirect to their dashboard instead
      if (destination.startsWith('/guard/scan') && currentUser?.role !== 'GUARD') {
        destination = '/dashboard';
      }

      navigate(destination, { replace: true });
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] font-sans selection:bg-emerald-500/30">
      {/* Left panel - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-[var(--color-background)] text-[var(--color-text-main)] relative overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Dark Emerald Overlay */}
        <div className="absolute inset-0 bg-[url('/images/login-bg.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-background)]/90 via-[var(--color-background)]/80 to-emerald-900/40"></div>
        <div className="absolute inset-0 bg-[url('/images/hero-bg-pattern.svg')] opacity-10 mix-blend-overlay"></div>
        


        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-sidebar)] border border-[var(--color-border-subtle)] text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
            {t('login.welcome')}
          </div>
          <h2 className="text-4xl font-extrabold mb-6 leading-tight tracking-tight">
            {t('login.title').split(' ').map((word, i, arr) => i === arr.length - 1 ? <span key={i}><br/>{word}</span> : word + ' ')}
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed font-light">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="relative z-10 text-[var(--color-text-secondary)] text-sm flex items-center gap-4">
          <Shield size={16} /> Enterprise-grade security and encryption.
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          <div className="lg:hidden mb-8 text-center">
             <Link to="/" className="text-2xl font-extrabold flex items-center justify-center gap-2 text-[var(--color-text-main)] mb-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
                <Shield className="text-[var(--color-text-main)] w-6 h-6" />
              </div>
              TrackSentra
            </Link>
            <p className="text-[var(--color-text-secondary)]">{t('login.welcome')}</p>
          </div>

          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 bg-[var(--color-surface-sidebar)] rounded-lg p-1 border border-[var(--color-border-subtle)]">
              <Globe size={16} className="text-[var(--color-text-muted)] ml-2" />
              <button 
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'en' ? 'bg-emerald-600 text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'}`}
              >
                EN
              </button>
              <button 
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'hi' ? 'bg-emerald-600 text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'}`}
              >
                HI
              </button>
            </div>
          </div>

          <div className="mb-10 hidden lg:block">
            <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight">{t('login.signin')}</h1>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-main">{t('login.email')}</label>
              <input
                type="email"
                required
                className="w-full bg-[var(--color-surface-sidebar)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] rounded-lg p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                placeholder="admin@security.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-text-main">{t('login.password')}</label>
                <Link to="/forgot-password" className="text-sm font-bold text-emerald-600 hover:text-emerald-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-[var(--color-surface-sidebar)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] rounded-lg p-3.5 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-[var(--color-text-main)] shadow-lg shadow-emerald-500/25 border-0 transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('login.authenticating')}
                </span>
              ) : t('login.button')}
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[var(--color-border-subtle)]"></div>
              <span className="flex-shrink-0 mx-4 text-[var(--color-text-muted)] text-sm">Or</span>
              <div className="flex-grow border-t border-[var(--color-border-subtle)]"></div>
            </div>

            <Button 
              type="button" 
              onClick={async () => {
                try {
                  await useAuthStore.getState().demoLogin();
                  const currentUser = useAuthStore.getState().user;
                  let destination = '/dashboard';
                  if (from && from.startsWith('/') && !from.startsWith('//')) {
                    destination = from;
                  }
                  if (destination.startsWith('/guard/scan') && currentUser?.role !== 'GUARD') {
                    destination = '/dashboard';
                  }
                  navigate(destination, { replace: true });
                } catch (e) {
                  // Error handled in store
                }
              }}
              className="w-full h-12 text-base font-bold bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] text-[var(--color-text-main)] transition-all" 
              disabled={isLoading}
            >
              Try Live Demo
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-400 transition-colors">
              Start your free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
