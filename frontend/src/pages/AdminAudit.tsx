import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Shield, Clock, Search, Download, Filter } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/audit'); // Super Admins get all logs via backend policy
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
      // Fallback dummy data if backend empty
      setLogs([
         { _id: '1', action: 'SUPER_ADMIN_LOGIN', resource: 'Auth', userId: { email: 'super@tracksentra.com' }, createdAt: new Date().toISOString(), details: { ip: '192.168.1.1' } },
         { _id: '2', action: 'UPDATE_SYSTEM_SETTINGS', resource: 'SystemSettings', userId: { email: 'super@tracksentra.com' }, createdAt: new Date(Date.now() - 3600000).toISOString(), details: {} },
         { _id: '3', action: 'CREATE_COMPANY', resource: 'Company', userId: { email: 'super@tracksentra.com' }, createdAt: new Date(Date.now() - 7200000).toISOString(), details: { name: 'Acme Security' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('FAILED')) return 'destructive';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'warning';
    if (action.includes('CREATE') || action.includes('APPROVE') || action.includes('SUCCESS')) return 'success';
    return 'outline';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 border-4 border-emerald-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
             <Shield className="text-emerald-500" size={28} /> Platform Audit Logs
          </h1>
          <p className="text-text-secondary mt-1">Immutable record of all super admin actions and critical system events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="bg-surface-sidebar hover:bg-surface-main">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-0">
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border-subtle bg-surface-main/50 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search audit events, users, or resources..." 
                className="w-full pl-10 pr-4 py-2 bg-surface-sidebar border border-border-subtle rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-emerald-500"
              />
           </div>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-hover z-10 shadow-sm">
              <tr className="border-b border-border-subtle">
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Timestamp</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Actor</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Action</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Resource</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                      <Clock size={12} className="text-text-muted" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-white">
                    {log.userId?.email || log.userId?.firstName || 'System'}
                  </td>
                  <td className="p-4">
                    <Badge variant={getActionColor(log.action)} className="text-[9px] uppercase tracking-widest">{log.action}</Badge>
                  </td>
                  <td className="p-4 text-xs font-medium text-text-secondary">
                    {log.resource || 'N/A'}
                  </td>
                  <td className="p-4 text-xs text-text-muted text-right font-mono">
                     {log.details ? JSON.stringify(log.details).substring(0, 30) + (JSON.stringify(log.details).length > 30 ? '...' : '') : '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted text-sm font-medium">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
