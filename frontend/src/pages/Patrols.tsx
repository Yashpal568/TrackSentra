import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Shield, Play, MapPin, CheckCircle2, Navigation, AlertTriangle, ScanLine, Clock, History } from 'lucide-react';

interface Checkpoint {
  _id: string;
  name: string;
  location: string;
}

interface PatrolRoute {
  _id: string;
  name: string;
  checkpoints: Checkpoint[];
  expectedDurationMinutes: number;
}

interface PatrolSession {
  _id: string;
  status: string;
  routeId: PatrolRoute;
  siteId: { _id: string; name: string };
  startTime: string;
}

export const Patrols = () => {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState<PatrolRoute[]>([]);
  const [activeSession, setActiveSession] = useState<PatrolSession | null>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [locationStatus, setLocationStatus] = useState('');
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

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
      const active = sessionsRes.data.find((s: PatrolSession) => s.status === 'in_progress');
      if (active) {
        setActiveSession(active);
        const scansRes = await api.get(`/patrols/sessions/${active._id}/scans`);
        setScans(scansRes.data);
      } else {
        setActiveSession(null);
        setScans([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load patrol data');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (routeId: string) => {
    try {
      const route = routes.find(r => r._id === routeId);
      if (!route) return;

      const res = await api.post('/patrols/sessions', {
        siteId: route.checkpoints[0]?._id || route._id,
        routeId,
      });
      setActiveSession(res.data);
      setMessage('Patrol session started!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start session');
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

  const handleScan = async (data: string) => {
    setScanning(false);
    if (!activeSession) return;
    
    setLocationStatus('Acquiring secure GPS lock...');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocationStatus('');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationStatus('');
        await submitScan(data, position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      },
      (geoError) => {
        setLocationStatus('');
        setError(`Location required: Please enable GPS (${geoError.message})`);
        submitScan(data);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const submitScan = async (qrPayload: string, latitude?: number, longitude?: number, accuracy?: number) => {
    if (!activeSession) return;
    try {
      if (!navigator.onLine) {
        throw new Error('Network offline');
      }

      const res = await api.post(`/patrols/sessions/${activeSession._id}/scans`, {
        qrPayload,
        latitude,
        longitude,
        accuracy
      });
      setMessage(`Scan successful: ${res.data.scan.status}`);
      if (res.data.sessionStatus === 'completed') {
        setMessage('Patrol completed successfully!');
      }
      fetchData();
    } catch (err: any) {
      if (!navigator.onLine || err.message === 'Network Error' || err.message === 'Network offline') {
        const newItem = {
          sessionId: activeSession._id,
          qrPayload,
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        };
        const newQueue = [...offlineQueue, newItem];
        setOfflineQueue(newQueue);
        localStorage.setItem('trackSentra_offlineQueue', JSON.stringify(newQueue));
        setMessage('Network offline. Scan saved to secure offline queue.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to record scan');
      }
      fetchData();
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-indigo-600" /> Active Patrols
          </h1>
          <p className="text-slate-500 text-sm mt-1">Execute your assigned security routes and record checkpoint scans.</p>
        </div>
        {offlineQueue.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-200">
            <Clock size={16} /> {offlineQueue.length} scans queued offline
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={20} /> {message}
        </div>
      )}

      {locationStatus && (
        <div className="p-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-3 animate-pulse">
          <Navigation size={20} className="animate-bounce" /> {locationStatus}
        </div>
      )}

      {activeSession ? (
        <Card className="border-t-4 border-t-indigo-600 shadow-lg overflow-hidden">
          <div className="bg-slate-900 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> IN PROGRESS
                </span>
                <h2 className="text-2xl font-bold">{activeSession.routeId.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                  <span className="flex items-center gap-1"><MapPin size={14}/> {activeSession.siteId?.name || 'Assigned Site'}</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> Started: {new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Route Checkpoints
            </h3>
            
            <div className="relative border-l-2 border-slate-200 ml-3 mb-8 space-y-6">
              {activeSession.routeId.checkpoints.map((cp, idx) => {
                const scan = scans.find(s => s.checkpointId?._id === cp._id && s.status === 'valid');
                return (
                  <div key={cp._id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${scan ? 'bg-green-500 border-white ring-2 ring-green-100' : 'bg-white border-slate-300'}`}></div>
                    
                    <div className={`p-4 rounded-lg border ${scan ? 'bg-green-50/50 border-green-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold text-base ${scan ? 'text-green-800' : 'text-slate-800'}`}>{idx + 1}. {cp.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">{cp.location}</p>
                        </div>
                        {scan && (
                          <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={14} /> Cleared
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              {scanning ? (
                <div className="max-w-sm mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="mb-4 rounded-lg overflow-hidden border-2 border-indigo-500 shadow-inner">
                    <Scanner
                      onScan={(result) => handleScan(result[0].rawValue)}
                      onError={(error: any) => console.log(error?.message)}
                    />
                  </div>
                  <Button variant="secondary" className="w-full" onClick={() => setScanning(false)}>
                    Cancel Scan
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setScanning(true)}
                  className="w-full py-4 text-lg shadow-lg flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <ScanLine size={24} /> Launch Scanner
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Available Routes</h2>
            <p className="text-slate-500 text-sm">Select a route below to begin your physical patrol.</p>
          </div>

          {routes.length === 0 ? (
            <Card className="text-center py-16 px-6 border-dashed border-2 border-slate-200 bg-slate-50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Routes Available</h3>
              <p className="text-slate-500 max-w-md mx-auto">There are no patrol routes configured or assigned to you at this time.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routes.map(route => (
                <Card key={route._id} className="flex flex-col bg-white overflow-hidden group hover:border-indigo-300 transition-colors">
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{route.name}</h3>
                    <div className="flex gap-4 text-sm font-medium text-slate-600 mb-6">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md"><MapPin size={16} className="text-indigo-500" /> {route.checkpoints.length} Checkpoints</span>
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md"><Clock size={16} className="text-indigo-500" /> {route.expectedDurationMinutes} mins</span>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sequence</p>
                      <div className="flex flex-col gap-2">
                        {route.checkpoints.slice(0, 3).map((cp, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                            <span className="truncate">{cp.name}</span>
                          </div>
                        ))}
                        {route.checkpoints.length > 3 && (
                          <div className="text-sm text-slate-400 pl-7 font-medium italic">
                            + {route.checkpoints.length - 3} more checkpoints...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {user?.role === 'GUARD' ? (
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <Button
                        onClick={() => startSession(route._id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center gap-2 py-2.5"
                      >
                        <Play size={16} /> Start Physical Patrol
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                      View Only (Guards Only)
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
