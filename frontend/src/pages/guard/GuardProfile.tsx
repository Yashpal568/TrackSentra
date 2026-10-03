import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { LogOut, Bell, HelpCircle, ChevronRight, Globe, UserCircle, Shield, Mail, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GuardProfile = () => {
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useLanguageStore();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
            {t('profile.title') || 'Settings & Profile'}
          </h1>
          <p className="text-text-muted mt-1 text-sm font-medium">Manage your personal settings and preferences.</p>
        </div>
        <div className="w-12 h-12 bg-surface-sidebar border border-border-subtle rounded-xl flex items-center justify-center shadow-inner cursor-pointer hover:bg-surface-hover transition-colors group">
          <Settings size={20} className="text-text-muted group-hover:text-emerald-400 group-hover:rotate-45 transition-all duration-300" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="relative group rounded-3xl p-[1px] overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative bg-surface-sidebar/80 backdrop-blur-xl border border-border-subtle rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="w-24 h-24 rounded-2xl bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-400 font-black text-4xl shadow-inner relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-surface-main border border-border-subtle flex items-center justify-center shadow-lg z-20">
              <Shield size={14} className="text-emerald-500" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-2xl font-black text-text-main truncate group-hover:text-emerald-400 transition-colors">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2">
              <p className="text-text-secondary text-sm flex items-center gap-2">
                <Mail size={14} className="text-text-muted" /> {user?.email}
              </p>
            </div>
            <div className="inline-flex mt-4 items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider border border-emerald-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-black text-text-secondary text-xs uppercase tracking-widest px-2 flex items-center gap-2">
            <UserCircle size={14} className="text-emerald-500" /> Preferences
          </h3>
          <div className="bg-surface-sidebar border border-border-subtle rounded-3xl overflow-hidden divide-y divide-border-subtle shadow-lg">
            <div className="p-5 flex items-center justify-between hover:bg-surface-main transition-colors group">
              <div className="flex items-center gap-4 text-text-main font-bold">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border-subtle group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all">
                  <Globe size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                {t('profile.language') || 'Language'}
              </div>
              <div className="flex bg-background rounded-lg p-1 border border-border-subtle shadow-inner">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-emerald-600 text-text-main shadow-md' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('hi')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'hi' ? 'bg-emerald-600 text-text-main shadow-md' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover'}`}
                >
                  HI
                </button>
              </div>
            </div>
            <button className="w-full p-5 flex items-center justify-between hover:bg-surface-main transition-colors group">
              <div className="flex items-center gap-4 text-text-main font-bold">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border-subtle group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all">
                  <Bell size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                Notifications
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-text-secondary text-xs uppercase tracking-widest px-2 flex items-center gap-2">
            <HelpCircle size={14} className="text-emerald-500" /> Support
          </h3>
          <div className="bg-surface-sidebar border border-border-subtle rounded-3xl overflow-hidden shadow-lg">
            <Link to="/help" className="w-full p-5 flex items-center justify-between hover:bg-surface-main transition-colors group">
              <div className="flex items-center gap-4 text-text-main font-bold">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border-subtle group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all">
                  <HelpCircle size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                   <p>Help Center</p>
                   <p className="text-xs text-text-muted font-medium mt-0.5">Read guides and FAQs</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
          
          <div className="mt-8 pt-8">
            <button 
              onClick={logout}
              className="w-full h-14 rounded-2xl bg-danger/10 border border-danger/30 text-danger font-bold text-lg flex items-center justify-center gap-3 hover:bg-danger hover:text-white transition-all group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
              {t('profile.logout') || 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};
