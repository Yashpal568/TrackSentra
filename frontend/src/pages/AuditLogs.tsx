import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Download, ClipboardList, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

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
    <div className="min-h-screen bg-surface-hover">
      <header className="bg-surface-card shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-primary" />
            <h1 className="text-xl font-bold text-text-main">System Audit Logs</h1>
          </div>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <input 
                type="text" 
                placeholder="e.g. LOGIN"
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm w-48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
              <input 
                type="text" 
                placeholder="e.g. PatrolSession"
                value={filterResource}
                onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm w-48"
              />
            </div>
            <Button variant="secondary" onClick={() => { setFilterAction(''); setFilterResource(''); setPage(1); }}>
              Clear Filters
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-surface-hover">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Actor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Resource</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-card divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-text-secondary">Loading logs...</td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-text-secondary">No audit logs found.</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className={`hover:bg-surface-hover cursor-pointer ${selectedLog?._id === log._id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedLog(log)}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">
                            {log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'System'}
                            {log.userId && <span className="block text-xs text-text-secondary">{log.userId.email}</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-emerald-primary">
                            View
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-surface-hover border-t flex items-center justify-between">
                <span className="text-sm text-gray-700">Page {page} of {totalPages || 1}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                  <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next</Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ClipboardList size={20}/> Log Details</h3>
              {selectedLog ? (
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Event ID</span>
                    <span className="text-sm font-mono text-text-main">{selectedLog._id}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Timestamp</span>
                    <span className="text-sm text-text-main">{new Date(selectedLog.createdAt).toISOString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Actor</span>
                    <span className="text-sm text-text-main">{selectedLog.userId ? `${selectedLog.userId.firstName} ${selectedLog.userId.lastName} (${selectedLog.userId.role})` : 'System'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">IP Address</span>
                    <span className="text-sm font-mono text-text-main">{selectedLog.ipAddress || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Action</span>
                    <span className="text-sm text-text-main">{selectedLog.action}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Resource</span>
                    <span className="text-sm text-text-main">{selectedLog.resource}</span>
                  </div>
                  {selectedLog.details && (
                    <div>
                      <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Metadata</span>
                      <pre className="bg-background text-green-400 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-text-secondary py-12">
                  Select an audit log from the table to view its details here.
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
