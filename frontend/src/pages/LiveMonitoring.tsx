import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Radio, Clock } from 'lucide-react';
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
          // Simplest approach: just refetch the sessions list when an event occurs
          // For a more advanced approach, we would update the state directly
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
    return <div className="p-8">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-900 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard /> TrackSentra</h1>
            <div className="flex gap-4">
              <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
              <Link to="/sites" className="hover:text-blue-400">Sites</Link>
              <Link to="/checkpoints" className="hover:text-blue-400">Checkpoints</Link>
              <Link to="/guards" className="hover:text-blue-400">Guards</Link>
              <Link to="/shifts" className="hover:text-blue-400">Shifts</Link>
              <Link to="/patrols" className="hover:text-blue-400">Patrols</Link>
              <Link to="/live" className="text-blue-400 font-medium flex items-center gap-1"><Radio size={16} /> Live</Link>
              <Link to="/company" className="hover:text-blue-400">Company</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.email}</span>
            <Button variant="secondary" onClick={() => window.location.href = '/login'}>Sign out</Button>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Live Monitoring</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'Live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 font-medium">{connectionStatus}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div>Loading active patrols...</div>
        ) : sessions.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Clock className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium">No Active Patrols</h3>
            <p>There are currently no patrols in progress.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {sessions.map(session => (
              <Card key={session._id} className="p-6 border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{session.routeId?.name}</h3>
                    <p className="text-gray-600 font-medium">{session.siteId?.name}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full animate-pulse">
                    ACTIVE
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500">Guard ID</p>
                    <p className="font-medium">{session.guardId?.employeeId || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Started At</p>
                    <p className="font-medium">{new Date(session.startTime).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Checkpoint Progress</h4>
                  <div className="space-y-2">
                    {session.routeId?.checkpoints?.map((cp: any, idx: number) => {
                      // We would need to fetch scans for each session to show exact progress.
                      // For a true real-time dashboard, we should fetch scans for these active sessions.
                      return (
                        <div key={cp._id || idx} className="flex items-center text-sm p-2 rounded bg-gray-50">
                          <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs mr-3 font-bold text-gray-600">
                            {idx + 1}
                          </div>
                          <span className="font-medium flex-1">{cp.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Link to={`/patrols/${session._id}`}>
                      <Button variant="secondary" className="text-sm px-3 py-1 h-8">View Live Details</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
