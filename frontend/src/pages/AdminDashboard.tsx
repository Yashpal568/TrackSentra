import { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Building2, Users, CreditCard, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin dashboard', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading platform metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Unable to load platform data</h3>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#1e1e24] hover:bg-[#2a2a32] text-white rounded-lg transition-colors border border-[#2a2a32]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1e1e24]">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Platform Overview
          </h1>
          <p className="text-slate-400 mt-1">Monitor TrackSentra's SaaS platform, customers, revenue and system health.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-[#121214] border border-[#2a2a32] rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors">
            <option value="0">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
          <button className="px-4 py-2 bg-[#1e1e24] border border-[#2a2a32] hover:bg-[#2a2a32] rounded-lg text-sm font-medium text-white transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-[#121214] border-[#1e1e24] p-5 hover:border-[#2a2a32] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Companies</p>
            <div className="p-2 bg-[#1a1a1e] rounded-lg border border-[#2a2a32] text-slate-300">
              <Building2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{data.kpis?.totalCompanies || 0}</h3>
          </div>
        </Card>

        <Card className="bg-[#121214] border-[#1e1e24] p-5 hover:border-[#2a2a32] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Companies</p>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{data.kpis?.activeCompanies || 0}</h3>
          </div>
        </Card>

        <Card className="bg-[#121214] border-[#1e1e24] p-5 hover:border-[#2a2a32] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trial Companies</p>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
              <Activity size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{data.kpis?.trialCompanies || 0}</h3>
          </div>
        </Card>

        <Card className="bg-[#121214] border-[#1e1e24] p-5 hover:border-[#2a2a32] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Users</p>
            <div className="p-2 bg-[#1a1a1e] rounded-lg border border-[#2a2a32] text-slate-300">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{data.kpis?.activeUsers || 0}</h3>
          </div>
        </Card>

        <Card className="bg-[#121214] border-[#1e1e24] p-5 hover:border-[#2a2a32] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">MRR</p>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-emerald-400">
              {data.kpis?.mrr ? `₹${data.kpis.mrr.toLocaleString('en-IN')}` : 'Not available'}
            </h3>
          </div>
        </Card>

        <Card className="bg-[#121214] border-[#1e1e24] p-5 hover:border-[#2a2a32] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Tickets</p>
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{data.kpis?.openTickets || 0}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <Card className="bg-[#121214] border-[#1e1e24] flex flex-col">
          <div className="p-5 border-b border-[#1e1e24] flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Companies</h3>
          </div>
          <div className="p-0 flex-1 overflow-auto">
            {data.recentCompanies?.length > 0 ? (
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-[#1a1a1e] text-xs uppercase font-bold text-slate-500 border-b border-[#1e1e24]">
                  <tr>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e24]">
                  {data.recentCompanies.map((c: any) => (
                    <tr key={c._id} className="hover:bg-[#1a1a1e] transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                      <td className="px-5 py-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">No recent companies.</div>
            )}
          </div>
        </Card>

        {/* System Health */}
        <Card className="bg-[#121214] border-[#1e1e24] flex flex-col">
          <div className="p-5 border-b border-[#1e1e24] flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">System Health</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1a1a1e] rounded-lg border border-[#2a2a32]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">API Core</p>
                  <p className="text-xs text-slate-500">api.tracksentra.com</p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Healthy
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a1e] rounded-lg border border-[#2a2a32]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Database</p>
                  <p className="text-xs text-slate-500">MongoDB Cluster</p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Healthy
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a1e] rounded-lg border border-[#2a2a32]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Background Jobs</p>
                  <p className="text-xs text-slate-500">Worker Queue</p>
                </div>
              </div>
              <span className="text-slate-400 font-bold text-sm">
                Not monitored
              </span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
