import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../lib/axios';
import { Users, CheckCircle2, ShieldAlert, Search, Shield, MapPin } from 'lucide-react';

interface GuardAnalyticsProps {
  dateRange: string;
  siteId: string;
  guardId: string;
}

export const GuardAnalyticsTab: React.FC<GuardAnalyticsProps> = ({ dateRange, siteId, guardId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [dateRange, siteId, guardId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const params = new URLSearchParams();
      if (dateRange !== 'all') params.append('startDate', startDate.toISOString());
      if (siteId) params.append('siteId', siteId);
      if (guardId) params.append('guardId', guardId);
      
      const res = await api.get(`/reports/guards?${params.toString()}`);
      setData(res.data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface-sidebar rounded-xl border border-border-subtle"></div>)}
        </div>
        <div className="h-96 bg-surface-sidebar rounded-xl border border-border-subtle mt-6"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface-sidebar border border-border-subtle rounded-2xl mt-6">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-text-main mb-2">Unable to load report data</h3>
        <Button onClick={fetchData} variant="outline" className="mt-4">Retry Loading</Button>
      </div>
    );
  }

  const guards = data.guards.filter((g: any) => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.site.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 mt-6">
      
      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Total Guards</h4>
            <span className="text-3xl font-black text-text-main">{data.summary.totalGuards}</span>
          </div>
        </Card>
        
        <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Active Today</h4>
            <span className="text-3xl font-black text-text-main">{data.summary.activeGuards}</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Patrols Completed</h4>
            <span className="text-3xl font-black text-text-main">{data.summary.completedPatrols}</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Average Compliance</h4>
            <span className="text-3xl font-black text-text-main">{data.summary.averageCompliance}%</span>
          </div>
        </Card>
      </div>

      {/* GUARD PERFORMANCE TABLE */}
      <Card className="bg-surface-sidebar border-border-subtle p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface-sidebar">
          <h3 className="font-bold text-text-main text-lg">Guard Performance</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input 
              type="text" 
              placeholder="Search guards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-main border border-border-subtle rounded-lg text-sm text-text-main focus:outline-none focus:border-emerald-500 min-w-[240px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-main border-b border-border-subtle text-xs font-black text-text-muted uppercase tracking-widest">
                <th className="px-6 py-4 whitespace-nowrap">Guard</th>
                <th className="px-6 py-4 whitespace-nowrap">Primary Site</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Patrols</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Completed</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Missed</th>
                <th className="px-6 py-4 whitespace-nowrap">Compliance</th>
                <th className="px-6 py-4 whitespace-nowrap">Avg Duration</th>
                <th className="px-6 py-4 whitespace-nowrap">Last Patrol</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-sm font-semibold">
              {guards.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-text-secondary">
                    No guard activity found for the selected filters.
                  </td>
                </tr>
              ) : (
                guards.map((g: any) => (
                  <tr key={g.guardId} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                          {g.name.charAt(0)}
                        </div>
                        <div className="font-bold text-text-main">{g.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      <div className="flex items-center gap-1.5"><MapPin size={14}/> {g.site}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-text-main">{g.patrolCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-emerald-400 font-bold">{g.completedPatrols}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-red-400 font-bold">{g.missedPatrols}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-main rounded-full overflow-hidden border border-border-subtle">
                          <div className={`h-full rounded-full ${g.compliance >= 90 ? 'bg-emerald-500' : g.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${g.compliance}%` }}></div>
                        </div>
                        <span className="text-text-main font-black text-xs">{g.compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-main">
                      {g.averageDuration > 0 ? `${g.averageDuration} min` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      {g.lastPatrolAt ? new Date(g.lastPatrolAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-black rounded-md border ${g.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface-main text-text-secondary border-border-subtle'}`}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
