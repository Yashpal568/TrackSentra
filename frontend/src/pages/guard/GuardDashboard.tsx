import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { api } from '../../lib/axios';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Play, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const GuardDashboard = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [routesRes, sessionsRes] = await Promise.all([
          api.get('/patrols/routes'),
          api.get('/patrols/sessions'),
        ]);

        setRoutes(routesRes.data);
        const active = sessionsRes.data.find((s: any) => s.status === 'in_progress');
        if (active) setActiveSession(active);
      } catch (err: any) {
        setError(t('dashboard.error_loading') || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Greeting Section */}
      <div className="bg-[var(--color-surface-sidebar)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none"></div>
        <h1 className="text-3xl font-black text-[var(--color-text-main)] mb-1 leading-tight tracking-tight">
          {t('dashboard.greeting') || 'Hello'}, <br/>
          <span className="text-emerald-500">{user?.firstName}</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] font-medium text-sm flex items-center gap-1.5 mt-2">
          <Shield size={14} className="text-emerald-500" />
          {t('dashboard.status_active') || 'Duty Status: Active'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-2xl flex items-center gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {/* Main Action Area */}
      {activeSession ? (
        <Card className="bg-emerald-900/20 border-2 border-emerald-500 shadow-[0_10px_40px_rgba(16,185,129,0.15)] rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                {t('patrol.in_progress') || 'IN PROGRESS'}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{activeSession.routeId?.name}</h2>
            
            <div className="flex items-center gap-4 text-emerald-100/70 text-xs font-bold mb-6">
              <span className="flex items-center gap-1"><MapPin size={14}/> {activeSession.siteId?.name}</span>
              <span className="flex items-center gap-1"><Clock size={14}/> {new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            <Button 
              onClick={() => navigate('/patrols')}
              className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#070B09] font-black text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <Play size={20} className="fill-current" /> {t('dashboard.continue_patrol') || 'Continue Patrol'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-[var(--color-text-main)] text-lg px-2">{t('dashboard.upcoming_duty') || 'Assigned Routes'}</h3>
          
          {routes.length > 0 ? (
            routes.slice(0, 2).map((route) => (
              <Card key={route._id} className="bg-[var(--color-surface-sidebar)] border-[var(--color-border-subtle)] rounded-3xl p-5 hover:border-emerald-500/50 transition-colors">
                <h4 className="font-bold text-[var(--color-text-main)] text-xl mb-3">{route.name}</h4>
                <div className="flex gap-3 mb-5">
                  <div className="bg-[var(--color-surface-main)] px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
                    <MapPin size={14} className="text-emerald-500" /> {route.checkpoints.length} {t('dashboard.stops') || 'Stops'}
                  </div>
                  <div className="bg-[var(--color-surface-main)] px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
                    <Clock size={14} className="text-emerald-500" /> {route.expectedDurationMinutes} {t('dashboard.mins') || 'mins'}
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/patrols')}
                  className="w-full h-12 rounded-xl font-bold bg-[var(--color-surface-main)] hover:bg-emerald-500/10 hover:text-emerald-400 border border-[var(--color-border-subtle)] text-[var(--color-text-main)]"
                >
                  {t('dashboard.view_route') || 'View Route'}
                </Button>
              </Card>
            ))
          ) : (
            <div className="bg-[var(--color-surface-sidebar)] p-8 rounded-3xl text-center border border-dashed border-[var(--color-border-subtle)]">
              <Shield size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" />
              <p className="text-[var(--color-text-secondary)] font-bold text-sm">{t('patrol.no_routes') || 'No Routes Assigned'}</p>
            </div>
          )}
          
          {routes.length > 2 && (
            <Link to="/patrols" className="block text-center font-bold text-sm text-emerald-500 py-2">
              {t('dashboard.view_all') || 'View all assignments'} &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
