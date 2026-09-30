import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { LayoutDashboard, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PatrolLiveDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
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
      // Find the session info by getting all and filtering (since we don't have a GET /sessions/:id yet)
      // Alternatively, we can fetch all sessions and filter.
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
      setError(err.response?.data?.error?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!session) return <div className="p-8">Session not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-900 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard /> TrackSentra</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.email}</span>
            <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>Dashboard</Button>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-4xl mx-auto">
        <Link to="/live" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6">
          <ArrowLeft size={16} /> Back to Live Monitoring
        </Link>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold">{session.routeId?.name}</h1>
            <p className="text-xl text-gray-600">{session.siteId?.name}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-bold text-sm ${session.status === 'in_progress' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-gray-200 text-gray-800'}`}>
            {session.status.toUpperCase()}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Guard</p>
            <p className="font-bold">{session.guardId?.employeeId || 'Unknown'}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Started At</p>
            <p className="font-bold">{new Date(session.startTime).toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Expected Duration</p>
            <p className="font-bold">{session.routeId?.expectedDurationMinutes} mins</p>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">Checkpoint Sequence & Scans</h2>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-4 border-b">Checkpoint</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Time</th>
                <th className="p-4 border-b">GPS / Notes</th>
              </tr>
            </thead>
            <tbody>
              {session.routeId?.checkpoints?.map((cp: any, index: number) => {
                // Find scan for this checkpoint
                const scan = scans.find(s => s.checkpointId?._id === cp._id && s.status === 'valid');
                const rejectedScans = scans.filter(s => s.checkpointId?._id === cp._id && s.status !== 'valid');

                return (
                  <tr key={cp._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{index + 1}. {cp.name}</div>
                      <div className="text-xs text-gray-500">{cp.location}</div>
                    </td>
                    <td className="p-4">
                      {scan ? (
                        <span className="flex items-center text-green-600 text-sm font-medium"><CheckCircle2 size={16} className="mr-1" /> Valid</span>
                      ) : (
                        <span className="text-gray-400 text-sm font-medium">Pending</span>
                      )}
                      {rejectedScans.map(rs => (
                        <div key={rs._id} className="flex items-center text-red-500 text-xs mt-1">
                          <XCircle size={12} className="mr-1" /> {rs.status}
                        </div>
                      ))}
                    </td>
                    <td className="p-4 text-sm">
                      {scan ? new Date(scan.scannedAt).toLocaleTimeString() : '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {scan?.locationVerified ? (
                        <span className="text-green-600">GPS Verified ({Math.round(scan.distanceToCheckpoint)}m)</span>
                      ) : scan ? (
                        <span className="text-gray-400">No GPS</span>
                      ) : '-'}
                      {rejectedScans.length > 0 && (
                        <div className="text-red-500 text-xs mt-1">{rejectedScans[0].failureReason}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
};
