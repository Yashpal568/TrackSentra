import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Shield, CheckCircle2, AlertTriangle, ChevronRight, User, History, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  guardId?: { _id: string; employeeId: string };
}

import { GuardPatrols } from './guard/GuardPatrols';

export const Patrols = () => {
  const { user } = useAuthStore();
  
  if (user?.role === 'GUARD') {
    return <GuardPatrols />;
  }
  
  return <AdminPatrolView />;
};

const AdminPatrolView = () => {
  const [sessions, setSessions] = useState<PatrolSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patrols/sessions');
      setSessions(res.data);
    } catch (err: any) {
      setError(err.userMessage || 'Failed to load patrol history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <History className="text-emerald-primary" /> Patrol History & Management
          </h1>
          <p className="text-text-secondary text-sm mt-1">Review active and completed patrol sessions across your sites.</p>
        </div>
        <Link to="/live">
          <Button className="flex items-center gap-2">
            <RadioIcon /> Live View
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-border-subtle bg-surface-main">
          <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border-subtle">
            <Shield className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No Patrol Sessions Found</h3>
          <p className="text-text-secondary max-w-md mx-auto">Patrol history will appear here once guards begin executing their assigned routes.</p>
        </Card>
      ) : (
        <Card className="bg-surface-card border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover text-text-muted text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 border-b border-border-subtle">Status</th>
                  <th className="p-4 border-b border-border-subtle">Route & Site</th>
                  <th className="p-4 border-b border-border-subtle">Guard ID</th>
                  <th className="p-4 border-b border-border-subtle">Start Time</th>
                  <th className="p-4 border-b border-border-subtle text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sessions.map(session => (
                  <tr key={session._id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4">
                      {session.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> IN PROGRESS
                        </span>
                      ) : session.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-primary/10 text-emerald-primary border border-emerald-primary/20">
                          <CheckCircle2 size={12} /> COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-surface-main text-text-secondary border border-border-subtle">
                          {session.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-text-main">{session.routeId?.name}</div>
                      <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {session.siteId?.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-text-main">
                        <User size={14} className="text-text-muted" />
                        {session.guardId?.employeeId || 'Unknown'}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {new Date(session.startTime).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/patrols/${session._id}`}>
                        <Button variant="ghost" className="text-emerald-primary hover:text-emerald-hover hover:bg-emerald-primary/10">
                          Details <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

const RadioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M4.93 19.07a10 10 0 0 1 0-14.14"></path><path d="M7.76 16.24a6 6 0 0 1 0-8.48"></path><path d="M16.24 7.76a6 6 0 0 1 0 8.48"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>;
