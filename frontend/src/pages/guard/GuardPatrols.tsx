import { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useLanguageStore } from '../../store/languageStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Clock, CheckCircle2, AlertTriangle, ScanLine, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GuardPatrols = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routesRes, sessionsRes] = await Promise.all([
        api.get('/patrols/routes'),
        api.get('/patrols/sessions'),
      ]);

      setRoutes(routesRes.data);
      setSessions(sessionsRes.data);
      const active = sessionsRes.data.find((s: any) => s.status === 'in_progress');
      if (active) {
        setActiveSession(active);
        const scansRes = await api.get(`/patrols/sessions/${active._id}/scans`);
        setScans(scansRes.data);
      } else {
        setActiveSession(null);
        setScans([]);
      }
    } catch (err: any) {
      setError(t('dashboard.error_loading') || 'Failed to load patrol data');
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineQueue = async () => {
    const saved = localStorage.getItem('trackSentra_offlineQueue');
    if (!saved) return;
    try {
      const queue = JSON.parse(saved);
      if (queue.length === 0) return;
      
      const newQueue = [...queue];
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        try {
          await api.post(`/patrols/sessions/${item.sessionId}/scans`, {
            qrPayload: item.qrPayload,
            latitude: item.latitude,
            longitude: item.longitude,
            accuracy: item.accuracy
          });
          newQueue.splice(i, 1);
          i--;
        } catch (err: any) {
          if (err.response && err.response.status >= 400 && err.response.status < 500) {
             newQueue.splice(i, 1);
             i--;
          }
        }
      }
      
      setOfflineQueue(newQueue);
      localStorage.setItem('trackSentra_offlineQueue', JSON.stringify(newQueue));
      fetchData();
    } catch (e) {
      console.warn('Failed to sync offline queue', e);
    }
  };

  useEffect(() => {
    fetchData();

    const saved = localStorage.getItem('trackSentra_offlineQueue');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOfflineQueue(parsed);
      } catch (e) {
        console.warn('Failed to parse offline queue', e);
      }
    }

    const handleOnline = () => {
      syncOfflineQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // (Replaced above)

  const startSession = async (routeId: string) => {
    try {
      const route = routes.find(r => r._id === routeId);
      if (!route) return;

      const res = await api.post('/patrols/sessions', {
        siteId: route.checkpoints[0]?._id || route._id, // fallback logic
        routeId,
      });
      setActiveSession(res.data);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start session');
    }
  };

  const extractToken = (raw: string) => {
    try {
      const url = new URL(raw);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1]; 
    } catch {
      return raw;
    }
  };

  const handleScan = (data: string) => {
    setScanning(false);
    const token = extractToken(data);
    navigate(`/guard/scan/${token}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="p-4 space-y-6 pb-20 animate-in fade-in duration-300 max-w-lg mx-auto">
      
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-text-main tracking-tight">
          {t('patrol.active') || 'Patrols'}
        </h1>
        {offlineQueue.length > 0 && (
          <div className="flex items-center gap-1.5 bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-bold border border-warning/30 shadow-sm">
            <Clock size={12} /> {offlineQueue.length} queued
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p className="font-bold text-sm leading-tight">{error}</p>
        </div>
      )}

      {activeSession ? (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-900/80 to-emerald-950 border border-emerald-500/50 shadow-lg rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_50%,transparent_75%,transparent_100%)] bg-size-[20px_20px]"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="relative flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                    {t('patrol.in_progress') || 'IN PROGRESS'}
                  </span>
                </span>
                <span className="text-emerald-100/90 font-bold text-xs bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-full shadow-inner">
                  {scans.filter(s => s.status === 'valid').length} / {activeSession.routeId.checkpoints.length} {t('dashboard.stops') || 'Stops'}
                </span>
              </div>
              
              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">{activeSession.routeId.name}</h2>
              <div className="flex items-center gap-4 text-emerald-100/70 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500"/> {activeSession.siteId?.name}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500"/> {new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </Card>

          <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm">
            <h3 className="font-black text-text-main text-lg mb-6 tracking-tight">
              {t('patrol.checkpoints') || 'Checkpoints'}
            </h3>
            
            <div className="relative border-l-2 border-border-subtle ml-3.5 space-y-6 pb-2">
              {activeSession.routeId.checkpoints.map((cp: any, idx: number) => {
                const scan = scans.find(s => s.checkpointId?._id === cp._id && s.status === 'valid');
                return (
                  <div key={cp._id} className="relative pl-7">
                    <div className={`absolute -left-2.5 top-0.5 w-5 h-5 rounded-full border-[3px] flex items-center justify-center transition-colors ${scan ? 'bg-emerald-500 border-surface-card ring-4 ring-emerald-500/20' : 'bg-surface-main border-surface-card ring-2 ring-border-subtle'}`}>
                      {scan && <CheckCircle2 size={12} className="text-background" />}
                    </div>
                    
                    <div className={`p-4 rounded-xl border transition-colors ${scan ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' : 'bg-surface-main border-border-subtle'}`}>
                      <h4 className={`font-bold text-sm mb-1 tracking-tight ${scan ? 'text-emerald-500' : 'text-text-main'}`}>
                        {idx + 1}. {cp.name}
                      </h4>
                      <p className="text-xs text-text-secondary font-medium">
                        {cp.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-border-subtle">
              {scanning ? (
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="mb-4 rounded-xl overflow-hidden border border-emerald-500 shadow-inner">
                    <Scanner
                      onScan={(result) => handleScan(result[0].rawValue)}
                      onError={(error: any) => console.log(error?.message)}
                    />
                  </div>
                  <Button variant="secondary" className="w-full h-12 rounded-lg font-bold" onClick={() => setScanning(false)}>
                    {t('patrol.cancel_scan') || 'Cancel'}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setScanning(true)}
                  className="w-full h-14 text-base shadow-md flex items-center justify-center gap-2 rounded-xl bg-emerald-primary hover:bg-emerald-400 text-background font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ScanLine size={20} /> {t('patrol.launch_scanner') || 'Scan QR Code'}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex bg-surface-main rounded-xl p-1 border border-border-subtle mb-6 shadow-sm">
            <button 
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'assigned' ? 'bg-surface-card text-text-main shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-main'}`}
            >
              {t('dashboard.upcoming_duty') || 'Assigned'}
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-surface-card text-text-main shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-main'}`}
            >
              Completed
            </button>
          </div>

          {activeTab === 'assigned' && (
            routes.length === 0 ? (
              <div className="bg-surface-card p-10 rounded-2xl text-center border border-dashed border-border-subtle shadow-sm">
                <MapPin size={32} className="mx-auto text-border-subtle mb-4" />
                <p className="text-text-secondary font-bold text-sm">{t('patrol.no_routes') || 'No Routes Assigned'}</p>
              </div>
            ) : (
              routes.map(route => (
                <Card key={route._id} className="bg-surface-card border-border-subtle rounded-2xl p-6 hover:border-emerald-500/40 transition-colors shadow-sm group">
                  <h3 className="text-lg font-black text-text-main mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">{route.name}</h3>
                  <div className="flex gap-3 mb-6">
                    <span className="flex items-center gap-1.5 bg-surface-main px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-bold text-text-secondary">
                      <MapPin size={14} className="text-emerald-500" /> {route.checkpoints.length} {t('dashboard.stops') || 'Stops'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-surface-main px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-bold text-text-secondary">
                      <Clock size={14} className="text-emerald-500" /> {route.expectedDurationMinutes} {t('dashboard.mins') || 'mins'}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => startSession(route._id)}
                    className="w-full h-12 rounded-xl flex justify-center items-center gap-2 font-black text-sm bg-surface-main hover:bg-emerald-primary hover:text-background text-text-main border border-border-subtle hover:border-emerald-primary transition-all group-hover:shadow-md"
                  >
                    {t('patrol.start_patrol') || 'Start Patrol'} <ArrowRight size={16} />
                  </Button>
                </Card>
              ))
            )
          )}

          {activeTab === 'completed' && (
            sessions.filter(s => s.status === 'completed').length === 0 ? (
              <div className="bg-surface-card p-10 rounded-2xl text-center border border-dashed border-border-subtle shadow-sm">
                <CheckCircle2 size={32} className="mx-auto text-border-subtle mb-4" />
                <p className="text-text-secondary font-bold text-sm">No completed patrols yet</p>
              </div>
            ) : (
              sessions.filter(s => s.status === 'completed').map(session => (
                <Card key={session._id} className="bg-surface-card border-border-subtle rounded-2xl p-5 shadow-sm hover:border-border-subtle transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-bold text-text-main tracking-tight">{session.routeId?.name}</h3>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-500/20 uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-text-secondary">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-text-muted" /> {session.siteId?.name}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-text-muted" /> {new Date(session.startTime).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
};
