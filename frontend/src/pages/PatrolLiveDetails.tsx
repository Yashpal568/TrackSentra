import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { LayoutDashboard, ArrowLeft, CheckCircle2, XCircle, Clock, MapPin, User, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const PatrolLiveDetails = () => {
  const { id } = useParams();
  const [session, setSession] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetails();

    const eventSource = new EventSource('http://localhost:5000/api/patrols/live/events', {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SCAN_RECORDED' || data.type === 'SESSION_COMPLETED') {
          // Verify it's for this session
          if (data.session?._id === id || data.scan?.sessionId === id) {
            fetchDetails();
          }
        }
      } catch (e) {}
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [sessionsRes, scansRes] = await Promise.all([
        api.get('/patrols/sessions'),
        api.get(`/patrols/sessions/${id}/scans`)
      ]);
      
      const currentSession = sessionsRes.data.find((s: any) => s._id === id);
      if (currentSession) {
        setSession(currentSession);
      } else {
        setError('Session not found');
      }
      setScans(scansRes.data);
    } catch (err: any) {
      setError(err.userMessage || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 bg-surface-card m-8 rounded-xl border border-border-subtle shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
        <p className="text-emerald-primary font-bold animate-pulse text-sm uppercase tracking-wider">Syncing Telemetry...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-danger text-center font-bold bg-danger/10 border border-danger/30 rounded-lg max-w-2xl mx-auto mt-8 flex items-center justify-center gap-2"><AlertTriangle/> {error}</div>;
  if (!session) return <div className="p-8 text-text-main text-center bg-surface-card m-8 rounded-xl border border-border-subtle">Session not found</div>;

  const validScansCount = scans.filter(s => s.status === 'valid').length;
  const totalCheckpoints = session.routeId?.checkpoints?.length || 0;
  const completionPercentage = totalCheckpoints > 0 ? Math.round((validScansCount / totalCheckpoints) * 100) : 0;

  return (
    <div className="text-text-main">
      <main className="p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <Link to="/patrols" className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-surface-main border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors mb-8 text-sm font-bold shadow-sm">
          <ArrowLeft size={16} /> Back to Patrol Management
        </Link>

        {/* Hero Header Card */}
        <Card className="bg-surface-card border-border-subtle shadow-lg mb-8 overflow-hidden relative p-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          <div className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black text-text-main tracking-tight">{session.routeId?.name}</h1>
                  <Badge variant={session.status === 'in_progress' ? 'default' : session.status === 'completed' ? 'success' : 'outline'} className="uppercase px-3 py-1 text-xs">
                    {session.status === 'in_progress' && <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>}
                    {session.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-lg text-text-secondary flex items-center gap-2 font-medium"><MapPin size={18} className="text-emerald-primary"/> {session.siteId?.name}</p>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Completion Progress</div>
                <div className="flex items-center gap-4">
                  <div className="w-48 h-3 bg-surface-main rounded-full overflow-hidden border border-border-subtle shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${completionPercentage === 100 ? 'bg-emerald-primary' : 'bg-blue-500'}`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xl font-black text-text-main">{completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card className="p-6 bg-surface-card border-border-subtle hover:border-emerald-primary/30 transition-colors shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-primary shadow-inner">
                <User size={20} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Assigned Guard</p>
            </div>
            <p className="text-2xl font-black text-text-main">{session.guardId?.employeeId || 'Unknown ID'}</p>
          </Card>
          
          <Card className="p-6 bg-surface-card border-border-subtle hover:border-blue-500/30 transition-colors shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-main border border-border-subtle flex items-center justify-center text-blue-500 shadow-inner">
                <Clock size={20} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Start Time</p>
            </div>
            <p className="text-2xl font-black text-text-main">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
            <p className="text-sm text-text-secondary mt-1">{new Date(session.startTime).toLocaleDateString()}</p>
          </Card>
          
          <Card className="p-6 bg-surface-card border-border-subtle hover:border-warning/30 transition-colors shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-main border border-border-subtle flex items-center justify-center text-warning shadow-inner">
                <LayoutDashboard size={20} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Expected Duration</p>
            </div>
            <p className="text-2xl font-black text-text-main">{session.routeId?.expectedDurationMinutes} <span className="text-lg font-medium text-text-secondary">mins</span></p>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Activity className="text-emerald-primary" /> Checkpoint Telemetry Stream
          </h2>
          <Badge variant="outline" className="bg-surface-card font-mono">
            {validScansCount} / {totalCheckpoints} CLEARED
          </Badge>
        </div>
        
        <Card className="p-0 overflow-hidden bg-surface-card border-border-subtle shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-sidebar text-text-muted text-xs uppercase tracking-wider font-bold border-b border-border-subtle">
                  <th className="px-6 py-4">Checkpoint Node</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">GPS Cryptographic Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {session.routeId?.checkpoints?.map((cp: any, index: number) => {
                  const scan = scans.find(s => s.checkpointId?._id === cp._id && s.status === 'valid');
                  const rejectedScans = scans.filter(s => s.checkpointId?._id === cp._id && s.status !== 'valid');

                  return (
                    <tr key={cp._id} className="hover:bg-surface-hover/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-main flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md bg-surface-main border border-border-subtle flex items-center justify-center text-xs text-text-secondary font-black shadow-inner group-hover:text-emerald-primary transition-colors">{index + 1}</span>
                          {cp.name}
                        </div>
                        <div className="text-xs text-text-secondary mt-1 ml-10 flex items-center gap-1 font-mono">
                          <MapPin size={10}/> {cp.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {scan ? (
                          <Badge variant="success" className="uppercase"><CheckCircle2 size={12} className="mr-1"/> Cleared</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-surface-main text-text-muted border-dashed uppercase"><Clock size={12} className="mr-1"/> Pending</Badge>
                        )}
                        {rejectedScans.map(rs => (
                          <div key={rs._id} className="mt-2">
                            <Badge variant="destructive" className="uppercase text-[10px]"><XCircle size={10} className="mr-1"/> {rs.status}</Badge>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-main font-bold font-mono">
                        {scan ? new Date(scan.scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : <span className="text-text-muted">-</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {scan?.locationVerified ? (
                          <div className="flex flex-col gap-1 bg-emerald-primary/5 p-2 rounded border border-emerald-primary/10">
                            <span className="text-emerald-primary font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                              <ShieldCheck size={14} /> GPS Verified
                            </span>
                            <span className="text-xs text-text-secondary font-mono flex justify-between items-center">
                              <span>Distance Tolerance:</span>
                              <span className="font-bold text-text-main">{Math.round(scan.distanceToCheckpoint)}m</span>
                            </span>
                          </div>
                        ) : scan ? (
                          <div className="bg-warning/5 p-2 rounded border border-warning/20">
                            <span className="text-warning font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                              <AlertTriangle size={14} /> No GPS Data
                            </span>
                          </div>
                        ) : <span className="text-text-muted">-</span>}
                        {scan?.riskSignals && scan.riskSignals.length > 0 && (
                          <div className="text-warning text-xs mt-2 font-medium bg-warning/10 p-2 rounded border border-warning/20 flex flex-col gap-1">
                            <span className="font-bold flex items-center gap-1 uppercase tracking-wider"><AlertTriangle size={12}/> Risk Signals Detected:</span>
                            {scan.riskSignals.map((r: string) => <span key={r}>• {r.replace(/_/g, ' ')}</span>)}
                          </div>
                        )}
                        {rejectedScans.length > 0 && (
                          <div className="text-danger text-xs mt-2 font-medium bg-danger/10 p-2 rounded border border-danger/20">
                            Failed: {rejectedScans[0].failureReason}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};
