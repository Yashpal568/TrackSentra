import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { Card } from '../../components/ui/Card';
import { LogOut, Bell, HelpCircle, ChevronRight, Globe } from 'lucide-react';

export const GuardProfile = () => {
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useLanguageStore();

  return (
    <div className="p-4 space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-main)]">
          {t('profile.title') || 'Profile & Settings'}
        </h1>
      </div>

      <Card className="bg-[var(--color-surface-sidebar)] border-[var(--color-border-subtle)] rounded-3xl p-6 flex items-center gap-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 font-black text-xl shrink-0">
          {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-[var(--color-text-main)] truncate">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm truncate">{user?.email}</p>
          <div className="inline-flex mt-2 items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-[var(--color-text-secondary)] text-xs uppercase tracking-widest px-2">
          Preferences
        </h3>
        <Card className="bg-[var(--color-surface-sidebar)] border-[var(--color-border-subtle)] rounded-3xl overflow-hidden divide-y divide-[var(--color-border-subtle)]">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[var(--color-text-main)] font-bold">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-main)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                <Globe size={18} className="text-emerald-500" />
              </div>
              {t('profile.language') || 'Language'}
            </div>
            <div className="flex bg-[var(--color-surface-main)] rounded-lg p-1 border border-[var(--color-border-subtle)]">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-emerald-500 text-[#070B09] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('hi')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'hi' ? 'bg-emerald-500 text-[#070B09] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
              >
                HI
              </button>
            </div>
          </div>
          <button className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-surface-main)] transition-colors">
            <div className="flex items-center gap-3 text-[var(--color-text-main)] font-bold">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-main)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                <Bell size={18} className="text-emerald-500" />
              </div>
              Notifications
            </div>
            <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
          </button>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[var(--color-text-secondary)] text-xs uppercase tracking-widest px-2">
          Support
        </h3>
        <Card className="bg-[var(--color-surface-sidebar)] border-[var(--color-border-subtle)] rounded-3xl overflow-hidden divide-y divide-[var(--color-border-subtle)]">
          <button className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-surface-main)] transition-colors">
            <div className="flex items-center gap-3 text-[var(--color-text-main)] font-bold">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-main)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                <HelpCircle size={18} className="text-emerald-500" />
              </div>
              Help Center
            </div>
            <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
          </button>
        </Card>
      </div>

      <button 
        onClick={logout}
        className="w-full h-14 rounded-2xl border-2 border-danger/30 text-danger font-bold text-lg flex items-center justify-center gap-2 hover:bg-danger/10 transition-colors"
      >
        <LogOut size={20} /> {t('profile.logout') || 'Sign Out'}
      </button>

    </div>
  );
};
