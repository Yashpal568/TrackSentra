import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Download, PieChart, Activity, ShieldAlert, BarChart3, Users, CheckCircle2, Search, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

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
        <ShieldAlert size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="text-slate-500 max-w-md mt-2">Reports and Analytics are restricted to management and administrative personnel.</p>
      </div>
    );
  }

  const filteredHistory = history.filter(h => 
    (h.routeId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.siteId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.guardId?.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> Analytics & Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review operational performance, guard statistics, and export historical data.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white shadow-sm border border-slate-700">
            <Download size={16} /> Export CSV Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex overflow-x-auto">
        <button 
          className={`flex items-center justify-center gap-2 flex-1 min-w-[200px] py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'operational' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('operational')}
        >
          <Activity size={18} /> Operational Summary
        </button>
        <button 
          className={`flex items-center justify-center gap-2 flex-1 min-w-[200px] py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'guards' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('guards')}
        >
          <Users size={18} /> Guard Analytics
        </button>
        <button 
          className={`flex items-center justify-center gap-2 flex-1 min-w-[200px] py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'history' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <PieChart size={18} /> Patrol History
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-500 font-medium animate-pulse">Generating Report...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {activeTab === 'operational' && summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <Card className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                    <Activity className="w-32 h-32 text-blue-600" />
                  </div>
                  <div className="p-6 relative z-10">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
                      <Activity size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Patrols Logged</h3>
                    <p className="text-4xl font-black text-slate-900">{summary.total}</p>
                  </div>
                </Card>

                <Card className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                    <CheckCircle2 className="w-32 h-32 text-green-600" />
                  </div>
                  <div className="p-6 relative z-10">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 border border-green-100">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Successfully Completed</h3>
                    <p className="text-4xl font-black text-slate-900">{summary.completed}</p>
                    <div className="mt-2 flex items-center text-sm font-medium text-green-600">
                      {summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}% Completion Rate
                    </div>
                  </div>
                </Card>

                <Card className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                    <ShieldAlert className="w-32 h-32 text-orange-600" />
                  </div>
                  <div className="p-6 relative z-10">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 border border-orange-100">
                      <ShieldAlert size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Currently In Progress</h3>
                    <p className="text-4xl font-black text-slate-900">{summary.in_progress}</p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'guards' && (
              <Card className="overflow-hidden shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Guard Performance Metrics</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Guard Employee ID</th>
                        <th className="px-6 py-4 text-center">Total Assigned</th>
                        <th className="px-6 py-4 text-center">Completed</th>
                        <th className="px-6 py-4 text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {guardsReport.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No guard performance data available.</td>
                        </tr>
                      ) : (
                        guardsReport.map((stat, idx) => {
                          const rate = stat.totalPatrols > 0 ? Math.round((stat.completedPatrols / stat.totalPatrols) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                                  {stat.employeeId ? stat.employeeId.substring(0, 2) : 'ID'}
                                </div>
                                {stat.employeeId || 'Unknown ID'}
                              </td>
                              <td className="px-6 py-4 text-center font-medium text-slate-600">{stat.totalPatrols}</td>
                              <td className="px-6 py-4 text-center font-medium text-slate-600">{stat.completedPatrols}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${rate >= 90 ? 'bg-green-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${rate}%` }}
                                    ></div>
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                    rate >= 90 ? 'bg-green-100 text-green-800' : 
                                    rate >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {rate}%
                                  </span>
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
              <Card className="overflow-hidden shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="font-bold text-slate-800">Historical Patrol Log (Last 50)</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filter records..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white w-full sm:w-64"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date Logged</th>
                        <th className="px-6 py-4">Route Name</th>
                        <th className="px-6 py-4">Assigned Guard</th>
                        <th className="px-6 py-4">Facility / Site</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No historical records match your criteria.</td>
                        </tr>
                      ) : (
                        filteredHistory.map((session) => (
                          <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                                session.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                session.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                                session.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {session.status === 'completed' && <CheckCircle2 size={12} />}
                                {session.status === 'in_progress' && <Activity size={12} className="animate-pulse" />}
                                {session.status === 'cancelled' && <XCircle size={12} />}
                                {session.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                              {new Date(session.createdAt).toLocaleDateString()} <span className="text-slate-400 font-normal ml-1">{new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{session.routeId?.name || 'Unknown Route'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{session.guardId?.employeeId || 'Unknown ID'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{session.siteId?.name || 'Unknown Site'}</td>
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
