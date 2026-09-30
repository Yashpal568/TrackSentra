import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';

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

  useEffect(() => {
    fetchData();
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
        siteId: route.checkpoints[0]?._id || route._id, // Just for mock
        routeId,
      });
      setActiveSession(res.data);
      setMessage('Patrol session started!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start session');
    }
  };

  const handleScan = async (data: string) => {
    setScanning(false);
    if (!activeSession) return;

    try {
      const res = await api.post(`/patrols/sessions/${activeSession._id}/scans`, {
        qrPayload: data,
      });
      setMessage(`Scan successful: ${res.data.scan.status}`);
      if (res.data.sessionStatus === 'completed') {
        setMessage('Patrol completed successfully!');
      }
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to record scan');
      fetchData();
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

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
              <Link to="/company" className="hover:text-blue-400">Company</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.email}</span>
            <Button variant="secondary" onClick={() => window.location.href = '/login'}>Sign out</Button>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Patrol Management</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {activeSession ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Active Patrol: {activeSession.routeId.name}</h2>
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                In Progress
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Checkpoints Status</h3>
              <div className="space-y-2">
                {activeSession.routeId.checkpoints.map((cp, idx) => {
                  const scan = scans.find(s => s.checkpointId?._id === cp._id && s.status === 'valid');
                  return (
                    <div key={cp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${scan ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                          {idx + 1}
                        </div>
                        <span className="font-medium">{cp.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({cp.location})</span>
                      </div>
                      {scan && <span className="text-green-600 text-sm">✓ Scanned</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {scanning ? (
              <div className="max-w-sm mx-auto">
                <Scanner
                  onScan={(result) => handleScan(result[0].rawValue)}
                  onError={(error: any) => console.log(error?.message)}
                />
                <button
                  onClick={() => setScanning(false)}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                >
                  Cancel Scan
                </button>
              </div>
            ) : (
              <button
                onClick={() => setScanning(true)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
              >
                Scan Next Checkpoint
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map(route => (
              <div key={route._id} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold mb-2">{route.name}</h3>
                <p className="text-gray-600 mb-4">
                  {route.checkpoints.length} Checkpoints • {route.expectedDurationMinutes} mins expected
                </p>
                <div className="text-sm text-gray-500 mb-6">
                  {route.checkpoints.slice(0, 3).map(cp => cp.name).join(', ')}
                  {route.checkpoints.length > 3 && '...'}
                </div>
                {user?.role === 'GUARD' && (
                  <button
                    onClick={() => startSession(route._id)}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                  >
                    Start Patrol
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
