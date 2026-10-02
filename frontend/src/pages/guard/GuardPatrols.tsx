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

  useEffect(() => {
    fetchData();

    const saved = localStorage.getItem('trackSentra_offlineQueue');
    if (saved) {
      try {
        setOfflineQueue(JSON.parse(saved));
      } catch (e) {}
    }

    const handleOnline = () => {
      syncOfflineQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

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
    } catch (e) {}
  };

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
    <div className="p-4 space-y-6 pb-20 animate-in fade-in duration-300">
      
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[var(--color-text-main)]">
          {t('patrol.active') || 'Patrols'}
        </h1>
        {offlineQueue.length > 0 && (
          <div className="flex items-center gap-1.5 bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-bold border border-warning/30">
            <Clock size={12} /> {offlineQueue.length} queued
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-2xl flex items-center gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {activeSession ? (
        <div className="space-y-6">
          <Card className="bg-emerald-900/20 border-2 border-emerald-500 shadow-[0_10px_40px_rgba(16,185,129,0.15)] rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="relative flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                    {t('patrol.in_progress') || 'IN PROGRESS'}
                  </span>
                </span>
                <span className="text-emerald-100/70 font-bold text-sm bg-emerald-900/50 px-3 py-1 rounded-full">
                  {scans.filter(s => s.status === 'valid').length} / {activeSession.routeId.checkpoints.length} {t('dashboard.stops') || 'Stops'}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{activeSession.routeId.name}</h2>
              <div className="flex items-center gap-4 text-emerald-100/70 text-xs font-bold">
                <span className="flex items-center gap-1"><MapPin size={14}/> {activeSession.siteId?.name}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </Card>

          <div className="bg-[var(--color-surface-sidebar)] rounded-3xl p-6 border border-[var(--color-border-subtle)]">
            <h3 className="font-bold text-[var(--color-text-main)] text-lg mb-6">
              {t('patrol.checkpoints') || 'Checkpoints'}
            </h3>
            
            <div className="relative border-l-2 border-[var(--color-border-subtle)] ml-4 space-y-8 pb-4">
              {activeSession.routeId.checkpoints.map((cp: any, idx: number) => {
                const scan = scans.find(s => s.checkpointId?._id === cp._id && s.status === 'valid');
                return (
                  <div key={cp._id} className="relative pl-6">
                    <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 flex items-center justify-center ${scan ? 'bg-emerald-500 border-[var(--color-surface-sidebar)] ring-2 ring-emerald-500/30' : 'bg-[var(--color-surface-main)] border-[var(--color-surface-sidebar)] ring-2 ring-[var(--color-border-subtle)]'}`}>
                      {scan && <CheckCircle2 size={12} className="text-[#070B09]" />}
                    </div>
                    
                    <div className={`p-4 rounded-2xl border ${scan ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--color-surface-main)] border-[var(--color-border-subtle)]'}`}>
                      <h4 className={`font-bold text-base mb-1 ${scan ? 'text-emerald-400' : 'text-[var(--color-text-main)]'}`}>
                        {idx + 1}. {cp.name}
                      </h4>
                      <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                        {cp.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
              {scanning ? (
                <div className="bg-[var(--color-surface-main)] p-4 rounded-3xl border border-[var(--color-border-subtle)]">
                  <div className="mb-4 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-inner">
                    <Scanner
                      onScan={(result) => handleScan(result[0].rawValue)}
                      onError={(error: any) => console.log(error?.message)}
                    />
                  </div>
                  <Button variant="secondary" className="w-full h-14 rounded-xl font-bold" onClick={() => setScanning(false)}>
                    {t('patrol.cancel_scan') || 'Cancel'}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setScanning(true)}
                  className="w-full h-16 text-lg shadow-lg flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#070B09] font-black"
                >
                  <ScanLine size={24} /> {t('patrol.launch_scanner') || 'Scan QR Code'}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex bg-[var(--color-surface-sidebar)] rounded-xl p-1.5 border border-[var(--color-border-subtle)] mb-6">
            <button 
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'assigned' ? 'bg-[var(--color-surface-main)] text-[var(--color-text-main)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'}`}
            >
              {t('dashboard.upcoming_duty') || 'Assigned Routes'}
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-[var(--color-surface-main)] text-[var(--color-text-main)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'}`}
            >
              Completed
            </button>
          </div>

          {activeTab === 'assigned' && (
            routes.length === 0 ? (
              <div className="bg-[var(--color-surface-sidebar)] p-8 rounded-3xl text-center border border-dashed border-[var(--color-border-subtle)]">
                <MapPin size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" />
                <p className="text-[var(--color-text-secondary)] font-bold">{t('patrol.no_routes') || 'No Routes Assigned'}</p>
              </div>
            ) : (
              routes.map(route => (
                <Card key={route._id} className="bg-[var(--color-surface-sidebar)] border-[var(--color-border-subtle)] rounded-3xl p-5 hover:border-emerald-500/50 transition-colors">
                  <h3 className="text-xl font-black text-[var(--color-text-main)] mb-3">{route.name}</h3>
                  <div className="flex gap-3 mb-6">
                    <span className="flex items-center gap-1.5 bg-[var(--color-surface-main)] px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-secondary)]">
                      <MapPin size={14} className="text-emerald-500" /> {route.checkpoints.length} {t('dashboard.stops') || 'Stops'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[var(--color-surface-main)] px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-secondary)]">
                      <Clock size={14} className="text-emerald-500" /> {route.expectedDurationMinutes} {t('dashboard.mins') || 'mins'}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => startSession(route._id)}
                    className="w-full h-14 rounded-xl flex justify-center items-center gap-2 font-black text-lg bg-emerald-500 hover:bg-emerald-400 text-[#070B09]"
                  >
                    {t('patrol.start_patrol') || 'Start Patrol'} <ArrowRight size={20} />
                  </Button>
                </Card>
              ))
            )
          )}

          {activeTab === 'completed' && (
            sessions.filter(s => s.status === 'completed').length === 0 ? (
              <div className="bg-[var(--color-surface-sidebar)] p-8 rounded-3xl text-center border border-dashed border-[var(--color-border-subtle)]">
                <CheckCircle2 size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" />
                <p className="text-[var(--color-text-secondary)] font-bold">No completed patrols yet</p>
              </div>
            ) : (
              sessions.filter(s => s.status === 'completed').map(session => (
                <Card key={session._id} className="bg-[var(--color-surface-sidebar)] border-[var(--color-border-subtle)] rounded-3xl p-5 opacity-80">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-[var(--color-text-main)]">{session.routeId?.name}</h3>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-500/20 uppercase">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs font-bold text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1"><Clock size={14} className="text-emerald-500" /> {new Date(session.startTime).toLocaleDateString()}</span>
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
