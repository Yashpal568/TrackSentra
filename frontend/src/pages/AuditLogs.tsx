import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Download, ClipboardList, Shield, Search, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';

export const AuditLogs = () => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');

  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction, filterResource]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/audit?page=${page}&limit=20`;
      if (filterAction) url += `&action=${filterAction}`;
      if (filterResource) url += `&resource=${filterResource}`;

      const res = await api.get(url);
      setLogs(res.data.data);
      setTotalPages(res.data.meta.pages);
    } catch (error) {
      console.error('Failed to load audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/audit/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export CSV');
    }
  };

  if (user?.role === 'GUARD') {
    return <div className="p-8 text-center text-text-secondary">You do not have permission to view audit logs.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Shield className="text-emerald-primary" /> System Audit Logs
          </h1>
          <p className="text-text-secondary text-sm mt-1">Monitor system activities, authentication events, and resource modifications.</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2 shadow-lg">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <Card className="p-5 bg-surface-card border-border-subtle shadow-sm">
        <div className="flex flex-wrap gap-5 items-end">
          <div className="flex-1 min-w-50">
            <Label className="mb-2">Filter by Action</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <Input 
                type="text" 
                placeholder="e.g. LOGIN"
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                className="pl-9 w-full"
              />
            </div>
          </div>
          <div className="flex-1 min-w-50">
            <Label className="mb-2">Filter by Resource</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <Input 
                type="text" 
                placeholder="e.g. PatrolSession"
                value={filterResource}
                onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
                className="pl-9 w-full"
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => { setFilterAction(''); setFilterResource(''); setPage(1); }}>
            Clear Filters
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0 border-border-subtle shadow-sm bg-surface-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-sidebar border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Actor</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Resource</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-secondary font-medium">No audit logs match your criteria.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr 
                        key={log._id} 
                        className={`hover:bg-surface-hover/50 cursor-pointer transition-colors ${selectedLog?._id === log._id ? 'bg-emerald-primary/5 border-l-2 border-l-emerald-primary' : 'border-l-2 border-l-transparent'}`} 
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-text-main">
                            {log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'System'}
                          </div>
                          {log.userId && <div className="text-xs text-text-muted mt-0.5">{log.userId.email}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={log.action.includes('FAILED') ? 'destructive' : log.action.includes('CREATE') ? 'success' : 'default'} className="uppercase text-[10px]">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-medium">
                          {log.resource}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-surface-main border-t border-border-subtle flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Page {page} of {totalPages || 1}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6 bg-surface-card border-border-subtle shadow-lg h-fit">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
              <h3 className="text-lg font-bold flex items-center gap-2 text-text-main">
                <ClipboardList className="text-emerald-primary" size={20}/> Log Details
              </h3>
              {selectedLog && (
                <button onClick={() => setSelectedLog(null)} className="text-text-muted hover:text-text-main transition-colors md:hidden">
                  <X size={20} />
                </button>
              )}
            </div>
            
            {selectedLog ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="flex text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Event ID</span>
                    <span className="text-sm font-mono text-text-main break-all bg-surface-main p-1.5 rounded border border-border-subtle block">{selectedLog._id}</span>
                  </div>
                  <div>
                    <span className="flex text-xs font-bold text-text-muted uppercase tracking-wider mb-1">IP Address</span>
                    <span className="text-sm font-mono text-text-main break-all bg-surface-main p-1.5 rounded border border-border-subtle block">{selectedLog.ipAddress || 'Unknown'}</span>
                  </div>
                </div>

                <div className="bg-surface-main p-4 rounded-lg border border-border-subtle space-y-4">
                  <div>
                    <span className="flex text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Timestamp</span>
                    <span className="text-sm text-text-main font-medium">{new Date(selectedLog.createdAt).toISOString()}</span>
                  </div>
                  <div>
                    <span className="flex text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Actor</span>
                    <span className="text-sm text-text-main font-bold">
                      {selectedLog.userId ? `${selectedLog.userId.firstName} ${selectedLog.userId.lastName}` : 'System'}
                    </span>
                    {selectedLog.userId && <span className="text-xs text-text-secondary ml-2 border border-border-subtle px-1.5 py-0.5 rounded uppercase">{selectedLog.userId.role}</span>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="flex text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Action</span>
                    <Badge variant={selectedLog.action.includes('FAILED') ? 'destructive' : 'default'} className="uppercase">
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <span className="flex text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Resource</span>
                    <span className="text-sm text-text-main font-bold">{selectedLog.resource}</span>
                  </div>
                </div>

                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <span className="flex text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
                      Metadata Payload
                      <div className="h-px bg-border-subtle flex-1 ml-3"></div>
                    </span>
                    <div className="bg-[#0D1117] border border-border-subtle rounded-lg overflow-hidden">
                      <div className="bg-surface-hover px-3 py-1.5 border-b border-border-subtle text-[10px] font-mono text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="ml-2">payload.json</span>
                      </div>
                      <pre className="text-emerald-400 p-4 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-surface-main border border-border-subtle flex items-center justify-center mb-4">
                  <ClipboardList className="text-text-muted" size={24} />
                </div>
                <h4 className="text-text-main font-bold mb-1">No Log Selected</h4>
                <p className="text-text-secondary text-sm max-w-50">Select an audit log from the table to view its detailed payload here.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
