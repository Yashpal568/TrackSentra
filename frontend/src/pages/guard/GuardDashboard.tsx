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

  useEffect(() => {
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
    <div className="p-4 space-y-6 pb-20 animate-in fade-in duration-300 max-w-lg mx-auto">
      
      {/* Greeting Section */}
      <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none transition-all group-hover:bg-emerald-500/20"></div>
        <h1 className="text-3xl font-black text-text-main mb-1 leading-tight tracking-tight">
          {t('dashboard.greeting') || 'Hello'}, <br/>
          <span className="text-emerald-500">{user?.firstName}</span>
        </h1>
        <p className="text-text-secondary font-semibold text-sm flex items-center gap-1.5 mt-2">
          <Shield size={14} className="text-emerald-500" />
          {t('dashboard.status_active') || 'Duty Status: Active'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p className="font-bold text-sm leading-tight">{error}</p>
        </div>
      )}

      {/* Main Action Area */}
      {activeSession ? (
        <Card className="bg-gradient-to-br from-emerald-900/80 to-emerald-950 border border-emerald-500/50 shadow-lg rounded-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_50%,transparent_75%,transparent_100%)] bg-size-[20px_20px]"></div>
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                {t('patrol.in_progress') || 'IN PROGRESS'}
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">{activeSession.routeId?.name}</h2>
            
            <div className="flex items-center gap-4 text-emerald-100/70 text-xs font-semibold mb-6">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500"/> {activeSession.siteId?.name}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500"/> {new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            <Button 
              onClick={() => navigate('/patrols')}
              className="w-full h-14 rounded-xl bg-emerald-primary hover:bg-emerald-400 text-background font-black text-base flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play size={18} className="fill-current" /> {t('dashboard.continue_patrol') || 'Continue Patrol'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="font-black text-text-main text-lg px-1 tracking-tight">{t('dashboard.upcoming_duty') || 'Assigned Routes'}</h3>
          
          {routes.length > 0 ? (
            routes.slice(0, 2).map((route) => (
              <Card key={route._id} className="bg-surface-card border-border-subtle rounded-2xl p-6 hover:border-emerald-500/40 transition-colors shadow-sm group">
                <h4 className="font-black text-text-main text-lg mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">{route.name}</h4>
                <div className="flex gap-3 mb-6">
                  <div className="bg-surface-main px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                    <MapPin size={14} className="text-emerald-500" /> {route.checkpoints.length} {t('dashboard.stops') || 'Stops'}
                  </div>
                  <div className="bg-surface-main px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                    <Clock size={14} className="text-emerald-500" /> {route.expectedDurationMinutes} {t('dashboard.mins') || 'mins'}
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/patrols')}
                  className="w-full h-12 rounded-xl font-bold bg-surface-main hover:bg-emerald-primary hover:text-background border border-border-subtle hover:border-emerald-primary text-text-main transition-all group-hover:shadow-md"
                >
                  {t('dashboard.view_route') || 'View Route'}
                </Button>
              </Card>
            ))
          ) : (
            <div className="bg-surface-card p-10 rounded-2xl text-center border border-dashed border-border-subtle shadow-sm">
              <Shield size={32} className="mx-auto text-border-subtle mb-4" />
              <p className="text-text-secondary font-bold text-sm">{t('patrol.no_routes') || 'No Routes Assigned'}</p>
            </div>
          )}
          
          {routes.length > 2 && (
            <Link to="/patrols" className="block text-center font-bold text-sm text-emerald-500 py-3 hover:text-emerald-400 transition-colors">
              {t('dashboard.view_all') || 'View all assignments'} &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
