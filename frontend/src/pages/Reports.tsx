import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { LayoutDashboard, Download, PieChart, Activity, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Reports = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'operational' | 'guards' | 'history'>('operational');
  
  const [summary, setSummary] = useState<any>(null);
  const [guardsReport, setGuardsReport] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    return <div className="p-8 text-center text-gray-500">You do not have permission to view reports.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          </div>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b mb-6">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'operational' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('operational')}
          >
            Operational Summary
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'guards' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('guards')}
          >
            Guard Analytics
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('history')}
          >
            Patrol History
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading data...</div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'operational' && summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 flex flex-col items-center justify-center">
                  <Activity className="w-12 h-12 text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">Total Patrols</h3>
                  <p className="text-4xl font-bold text-gray-900">{summary.total}</p>
                </Card>
                <Card className="p-6 flex flex-col items-center justify-center">
                  <PieChart className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">Completed</h3>
                  <p className="text-4xl font-bold text-gray-900">{summary.completed}</p>
                </Card>
                <Card className="p-6 flex flex-col items-center justify-center">
                  <ShieldAlert className="w-12 h-12 text-orange-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">In Progress</h3>
                  <p className="text-4xl font-bold text-gray-900">{summary.in_progress}</p>
                </Card>
              </div>
            )}

            {activeTab === 'guards' && (
              <Card>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guard ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Assigned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guardsReport.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                      </tr>
                    ) : (
                      guardsReport.map((stat, idx) => {
                        const rate = stat.totalPatrols > 0 ? Math.round((stat.completedPatrols / stat.totalPatrols) * 100) : 0;
                        return (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.employeeId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.totalPatrols}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.completedPatrols}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rate >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {rate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </Card>
            )}

            {activeTab === 'history' && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guard</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No patrol history found</td>
                        </tr>
                      ) : (
                        history.map((session) => (
                          <tr key={session._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                session.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {session.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.routeId?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.guardId?.employeeId || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.siteId?.name || 'N/A'}</td>
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
      </main>
    </div>
  );
};
