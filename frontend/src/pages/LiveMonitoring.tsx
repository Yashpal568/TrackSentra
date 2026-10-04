import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Radio, Clock, AlertTriangle, Shield, MapPin, Activity, User, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

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
      setError(err.userMessage || 'Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'GUARD') {
    return (
      <div className="flex flex-col justify-center items-center h-64 p-8 text-center animate-in fade-in duration-500">
        <Shield size={48} className="text-danger mb-4" />
        <h2 className="text-xl font-bold text-text-main">Access Restricted</h2>
        <p className="text-text-secondary max-w-md mt-2">Live monitoring is restricted to control room operators, supervisors, and administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Radio className="text-emerald-primary animate-pulse" /> Live SOC Monitoring
          </h1>
          <p className="text-text-secondary text-sm mt-1">Real-time overview of active security patrols across all facilities.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-card px-4 py-2.5 rounded-lg border border-border-subtle shadow-sm">
          <div className="relative flex h-3 w-3">
            {connectionStatus === 'Live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-primary opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatus === 'Live' ? 'bg-emerald-primary' : 'bg-red-500'}`}></span>
          </div>
          <span className={`text-sm font-bold uppercase tracking-wider ${connectionStatus === 'Live' ? 'text-emerald-primary' : 'text-red-500'}`}>{connectionStatus}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-lg flex items-center gap-3 shadow-sm">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-surface-card border border-border-subtle rounded-xl shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
            <p className="text-emerald-primary font-bold animate-pulse text-sm uppercase tracking-wider">Initializing Live View...</p>
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center py-20 px-6 border-dashed border-2 border-border-subtle bg-surface-main">
          <div className="w-20 h-20 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-border-subtle relative">
            <Activity className="w-10 h-10 text-text-muted" />
            <div className="absolute top-1 right-1 w-4 h-4 bg-surface-main rounded-full border-2 border-border-subtle"></div>
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">No Active Patrols</h3>
          <p className="text-text-secondary max-w-md mx-auto">There are currently no security patrols in progress. The feed will automatically update when a patrol begins.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map(session => (
            <Card key={session._id} className="flex flex-col border border-border-subtle shadow-md hover:border-emerald-primary/30 transition-all bg-surface-card overflow-hidden relative p-0 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-primary/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <div className="p-6 pb-4 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-black text-text-main tracking-tight">{session.routeId?.name}</h3>
                    <div className="flex items-center text-text-secondary text-sm mt-1.5 font-medium">
                      <MapPin size={14} className="mr-1 text-emerald-primary" /> {session.siteId?.name}
                    </div>
                  </div>
                  <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/30 uppercase tracking-wider font-bold animate-in zoom-in shadow-sm px-2.5 py-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-1.5 inline-block"></span> ACTIVE
                  </Badge>
                </div>
                
                {/* Changed from grid to flex column with row layout to fix the text overflow issue */}
                <div className="flex flex-col gap-3 my-6 bg-surface-main p-4 rounded-lg border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-surface-card border border-border-subtle flex items-center justify-center text-text-secondary shrink-0 shadow-inner">
                      <User size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Guard / ID</p>
                      <p className="font-bold text-text-main text-sm truncate" title={session.guardId?.employeeId}>{session.guardId?.userId ? `${session.guardId.userId.firstName} ${session.guardId.userId.lastName}` : session.guardId?.employeeId || 'Unknown ID'}</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-border-subtle"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-surface-card border border-border-subtle flex items-center justify-center text-text-secondary shrink-0 shadow-inner">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Started At</p>
                      <p className="font-bold text-text-main text-sm font-mono">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-[10px] font-bold text-text-muted mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} className="text-emerald-primary" /> Live Checkpoint Feed
                  </h4>
                  <div className="space-y-2">
                    {session.routeId?.checkpoints?.slice(0, 4).map((cp: any, idx: number) => {
                      return (
                        <div key={cp._id || idx} className="flex items-center text-sm px-3 py-2.5 rounded-md bg-surface-main border border-border-subtle shadow-sm transition-colors hover:border-emerald-primary/30">
                          <div className="w-5 h-5 rounded bg-surface-card border border-border-subtle flex items-center justify-center text-[10px] mr-3 font-bold text-text-secondary shadow-inner">
                            {idx + 1}
                          </div>
                          <span className="font-bold flex-1 text-text-main truncate text-xs">{cp.name}</span>
                        </div>
                      );
                    })}
                    {(session.routeId?.checkpoints?.length || 0) > 4 && (
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-12 pt-2">
                        + {(session.routeId?.checkpoints?.length || 0) - 4} more nodes
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-surface-sidebar border-t border-border-subtle mt-auto flex justify-end">
                <Link to={`/patrols/${session._id}`} className="w-full">
                  <Button variant="outline" className="w-full flex justify-between items-center group font-bold tracking-wide">
                    <span>View Telemetry & Details</span>
                    <ChevronRight size={16} className="text-text-muted group-hover:text-text-main transition-colors" />
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
