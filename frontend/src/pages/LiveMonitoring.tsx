import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Radio, Clock, AlertTriangle, Shield, MapPin, Activity, User, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LiveMonitoring = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    fetchActiveSessions();

    const eventSource = new EventSource('http://localhost:5000/api/patrols/live/events', {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTED') {
          setConnectionStatus('Live');
        } else if (data.type === 'SESSION_STARTED' || data.type === 'SESSION_COMPLETED' || data.type === 'SCAN_RECORDED') {
          fetchActiveSessions();
        }
      } catch (e) {
        console.error('Error parsing SSE', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      setConnectionStatus('Disconnected - Retrying...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const res = await api.get('/patrols/sessions?status=in_progress');
      setSessions(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'GUARD') {
    return (
      <div className="flex flex-col justify-center items-center h-64 p-8 text-center animate-in fade-in duration-500">
        <Shield size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="text-slate-500 max-w-md mt-2">Live monitoring is restricted to control room operators, supervisors, and administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Radio className="text-blue-600" /> Live Monitoring
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time overview of active security patrols across all facilities.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex h-3 w-3">
            {connectionStatus === 'Live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatus === 'Live' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <span className={`text-sm font-bold ${connectionStatus === 'Live' ? 'text-green-700' : 'text-red-700'}`}>{connectionStatus}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium animate-pulse">Initializing Live View...</p>
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-slate-200 bg-slate-50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 relative">
            <Activity className="w-8 h-8 text-slate-400" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Patrols</h3>
          <p className="text-slate-500 max-w-md mx-auto">There are currently no security patrols in progress. The feed will automatically update when a patrol begins.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map(session => (
            <Card key={session._id} className="flex flex-col border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl pointer-events-none"></div>
              
              <div className="p-6 pb-4 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{session.routeId?.name}</h3>
                    <div className="flex items-center text-slate-500 text-sm mt-1 font-medium">
                      <MapPin size={14} className="mr-1" /> {session.siteId?.name}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded border border-blue-200 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> ACTIVE
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 my-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guard / ID</p>
                      <p className="font-semibold text-slate-800 text-sm line-clamp-1" title={session.guardId?.employeeId}>{session.guardId?.employeeId || 'Unknown ID'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Started At</p>
                      <p className="font-semibold text-slate-800 text-sm">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={12} /> Live Checkpoint Feed
                  </h4>
                  <div className="space-y-1.5">
                    {session.routeId?.checkpoints?.slice(0, 4).map((cp: any, idx: number) => {
                      return (
                        <div key={cp._id || idx} className="flex items-center text-sm p-2 rounded-md bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group">
                          <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] mr-3 font-bold text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {idx + 1}
                          </div>
                          <span className="font-medium flex-1 text-slate-700 truncate">{cp.name}</span>
                        </div>
                      );
                    })}
                    {(session.routeId?.checkpoints?.length || 0) > 4 && (
                      <div className="text-xs text-slate-400 font-medium pl-10 pt-1 italic">
                        + {(session.routeId?.checkpoints?.length || 0) - 4} more checkpoints in route...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex justify-end">
                <Link to={`/patrols/${session._id}`} className="w-full">
                  <Button variant="secondary" className="w-full bg-white hover:bg-slate-100 flex justify-between items-center group">
                    <span>View Telemetry & Details</span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
