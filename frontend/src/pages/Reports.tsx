import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Download, Activity, ShieldAlert, BarChart3, Users, CheckCircle2, Search, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export const Reports = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'operational' | 'guards' | 'history'>('operational');
  
  const [summary, setSummary] = useState<any>(null);
  const [guardsReport, setGuardsReport] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'operational') {
        const res = await api.get('/reports/operational');
        setSummary(res.data);
      } else if (activeTab === 'guards') {
        const res = await api.get('/reports/guards');
        setGuardsReport(res.data);
      } else if (activeTab === 'history') {
        const res = await api.get('/reports/patrols?limit=50');
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load reports', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/reports/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patrol_report_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export CSV');
    }
  };

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'COMPANY_ADMIN' && user?.role !== 'SITE_MANAGER') {
    return (
      <div className="flex flex-col justify-center items-center h-64 p-8 text-center animate-in fade-in duration-500">
        <ShieldAlert size={48} className="text-danger mb-4" />
        <h2 className="text-xl font-bold text-text-main">Access Restricted</h2>
        <p className="text-text-secondary max-w-md mt-2">Reports and Analytics are restricted to management and administrative personnel.</p>
      </div>
    );
  }

  const filteredHistory = history.filter(h => 
    (h.routeId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.siteId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.guardId?.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.guardId?.userId?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.guardId?.userId?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <BarChart3 className="text-emerald-primary" /> Analytics & Reports
          </h1>
          <p className="text-text-secondary text-sm mt-1">Review operational performance, guard statistics, and export historical data.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} className="flex items-center gap-2 shadow-lg">
            <Download size={16} /> Export CSV Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1 bg-surface-sidebar border-border-subtle shadow-sm flex overflow-x-auto">
        <button 
          className={`flex items-center justify-center gap-2 flex-1 min-w-50 py-2.5 px-4 text-sm font-bold rounded transition-all ${
            activeTab === 'operational' ? 'bg-surface-main text-emerald-primary shadow-sm' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover/50'
          }`}
          onClick={() => setActiveTab('operational')}
        >
          <Activity size={18} /> Operational Summary
        </button>
        <button 
          className={`flex items-center justify-center gap-2 flex-1 min-w-50 py-2.5 px-4 text-sm font-bold rounded transition-all ${
            activeTab === 'guards' ? 'bg-surface-main text-emerald-primary shadow-sm' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover/50'
          }`}
          onClick={() => setActiveTab('guards')}
        >
          <Users size={18} /> Guard Analytics
        </button>
        <button 
          className={`flex items-center justify-center gap-2 flex-1 min-w-50 py-2.5 px-4 text-sm font-bold rounded transition-all ${
            activeTab === 'history' ? 'bg-surface-main text-emerald-primary shadow-sm' : 'text-text-secondary hover:text-text-main hover:bg-surface-hover/50'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={18} /> Patrol History
        </button>
      </Card>

      {/* Content */}
      <div className="min-h-100">
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-surface-card border border-border-subtle rounded-xl shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
              <p className="text-emerald-primary font-bold animate-pulse text-sm uppercase tracking-wider">Compiling Data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {activeTab === 'operational' && summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <Card className="relative overflow-hidden group bg-surface-card border-border-subtle hover:border-blue-500/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110">
                    <Activity className="w-32 h-32 text-blue-500" />
                  </div>
                  <div className="p-6 relative z-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 shadow-inner">
                      <Activity size={28} />
                    </div>
                    <p className="text-5xl font-black text-text-main mb-2">{summary.total}</p>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Patrols Logged</h3>
                  </div>
                  <div className="h-1 w-full bg-blue-500/20"></div>
                </Card>

                <Card className="relative overflow-hidden group bg-surface-card border-border-subtle hover:border-emerald-primary/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110">
                    <CheckCircle2 className="w-32 h-32 text-emerald-primary" />
                  </div>
                  <div className="p-6 relative z-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-emerald-primary/10 text-emerald-primary rounded-full flex items-center justify-center mb-4 border border-emerald-primary/20 shadow-inner">
                      <CheckCircle2 size={28} />
                    </div>
                    <p className="text-5xl font-black text-text-main mb-2">{summary.completed}</p>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Successfully Completed</h3>
                    <div className="inline-flex items-center bg-emerald-primary/10 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-primary border border-emerald-primary/20">
                      {summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}% Success Rate
                    </div>
                  </div>
                  <div className="h-1 w-full bg-emerald-primary/50"></div>
                </Card>

                <Card className="relative overflow-hidden group bg-surface-card border-border-subtle hover:border-warning/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110">
                    <ShieldAlert className="w-32 h-32 text-warning" />
                  </div>
                  <div className="p-6 relative z-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-4 border border-warning/20 shadow-inner">
                      <ShieldAlert size={28} />
                    </div>
                    <p className="text-5xl font-black text-text-main mb-2">{summary.in_progress}</p>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Currently In Progress</h3>
                  </div>
                  <div className="h-1 w-full bg-warning/50"></div>
                </Card>
              </div>
            )}

            {activeTab === 'guards' && (
              <Card className="overflow-hidden shadow-sm border border-border-subtle animate-in slide-in-from-bottom-4 duration-500 p-0 bg-surface-card">
                <div className="px-6 py-5 border-b border-border-subtle bg-surface-sidebar flex justify-between items-center">
                  <h3 className="font-bold text-text-main flex items-center gap-2">
                    <Users size={18} className="text-emerald-primary"/> Guard Performance Metrics
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-main border-b border-border-subtle text-xs font-bold text-text-muted uppercase tracking-wider">
                        <th className="px-6 py-4">Security Guard</th>
                        <th className="px-6 py-4">Employee ID</th>
                        <th className="px-6 py-4 text-center">Total Assigned</th>
                        <th className="px-6 py-4 text-center">Completed</th>
                        <th className="px-6 py-4 text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-sm">
                      {guardsReport.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-text-secondary font-medium">No guard performance data available.</td>
                        </tr>
                      ) : (
                        guardsReport.map((stat, idx) => {
                          const rate = stat.totalPatrols > 0 ? Math.round((stat.completedPatrols / stat.totalPatrols) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-surface-hover/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-surface-main border border-border-subtle flex items-center justify-center text-xs font-black text-emerald-primary shadow-inner">
                                    {stat.firstName ? stat.firstName.charAt(0) : 'U'}
                                    {stat.lastName ? stat.lastName.charAt(0) : ''}
                                  </div>
                                  <div className="font-bold text-text-main">
                                    {stat.firstName || stat.lastName ? `${stat.firstName || ''} ${stat.lastName || ''}` : 'Unknown Guard'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-text-secondary text-xs font-medium">
                                {stat.employeeId || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-text-main">{stat.totalPatrols}</td>
                              <td className="px-6 py-4 text-center font-bold text-text-main">{stat.completedPatrols}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <div className="w-32 h-2 bg-surface-main rounded-full overflow-hidden border border-border-subtle">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${rate >= 90 ? 'bg-emerald-primary' : rate >= 70 ? 'bg-warning' : 'bg-danger'}`}
                                      style={{ width: `${rate}%` }}
                                    ></div>
                                  </div>
                                  <Badge variant={rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'destructive'}>
                                    {rate}%
                                  </Badge>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'history' && (
              <Card className="overflow-hidden shadow-sm border border-border-subtle animate-in slide-in-from-bottom-4 duration-500 p-0 bg-surface-card">
                <div className="px-6 py-4 border-b border-border-subtle bg-surface-sidebar flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="font-bold text-text-main flex items-center gap-2">
                    <FileText size={18} className="text-emerald-primary"/> Historical Patrol Log (Last 50)
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <Input 
                      type="text" 
                      placeholder="Filter records..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 h-9 text-sm w-full sm:w-64"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-main border-b border-border-subtle text-xs font-bold text-text-muted uppercase tracking-wider">
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date Logged</th>
                        <th className="px-6 py-4">Route Name</th>
                        <th className="px-6 py-4">Assigned Guard</th>
                        <th className="px-6 py-4">Facility / Site</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-sm">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-text-secondary font-medium">No historical records match your criteria.</td>
                        </tr>
                      ) : (
                        filteredHistory.map((session) => (
                          <tr key={session._id} className="hover:bg-surface-hover/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={session.status === 'completed' ? 'success' : session.status === 'in_progress' ? 'default' : session.status === 'cancelled' ? 'destructive' : 'outline'}
                                className="uppercase"
                              >
                                {session.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-text-main">{new Date(session.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs text-text-secondary mt-0.5">{new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-text-main">
                              {session.routeId?.name || 'Unknown Route'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-text-main">
                                {session.guardId?.userId ? `${session.guardId.userId.firstName} ${session.guardId.userId.lastName}` : 'Unknown Guard'}
                              </div>
                              <div className="text-xs text-text-secondary font-mono mt-0.5">{session.guardId?.employeeId || 'Unknown ID'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-medium">
                              {session.siteId?.name || 'Unknown Site'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
