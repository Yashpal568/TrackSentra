import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Download, Activity, ShieldAlert, BarChart3, Users, CheckCircle2, FileText, ChevronRight, Calendar, MapPin, Clock, ShieldCheck, MoreHorizontal, ArrowUpRight, ArrowDownRight, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GuardAnalyticsTab } from '../components/reports/GuardAnalyticsTab';
import { PatrolHistoryTab } from '../components/reports/PatrolHistoryTab';

// Helper for Donut Chart
const DonutChart = ({ percentage }: { percentage: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r={radius} className="stroke-surface-hover fill-none stroke-[8px]" />
        <circle 
          cx="48" 
          cy="48" 
          r={radius} 
          className="stroke-emerald-500 fill-none stroke-[8px] transition-all duration-1000 ease-out" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute font-black text-xl text-text-main">{percentage}%</div>
    </div>
  );
};

// Helper for Bar Chart
const BarChart = ({ data }: { data: any[] }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.total, d.completed)), 10);
  // Add some padding to maxVal so bars don't hit the very top
  const yMax = Math.ceil(maxVal * 1.2 / 10) * 10;
  
  return (
    <div className="relative h-64 w-full pt-4 pb-8 pl-8 pr-2">
      {/* Y Axis */}
      <div className="absolute left-0 top-4 bottom-8 w-6 flex flex-col justify-between text-xs text-text-muted font-mono font-medium">
        <span>{yMax}</span>
        <span>{yMax * 0.75}</span>
        <span>{yMax * 0.5}</span>
        <span>{yMax * 0.25}</span>
        <span>0</span>
      </div>
      
      {/* Bars */}
      <div className="flex items-end justify-between h-full w-full gap-1 sm:gap-2">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-text-secondary">No patrol activity for this period.</div>
        ) : (
          data.map((d, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-2 h-full justify-end group">
              <div className="relative w-full max-w-[32px] h-full flex items-end justify-center">
                <div className="absolute bottom-0 w-full bg-surface-sidebar border border-border-subtle rounded-t-sm transition-all duration-700 ease-out" style={{ height: `${(d.total / yMax) * 100}%` }}></div>
                <div className="absolute bottom-0 w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all duration-700 ease-out" style={{ height: `${(d.completed / yMax) * 100}%` }}></div>
                
                {/* Tooltip */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 bg-surface-card border border-border-subtle text-xs p-2 rounded-lg shadow-xl whitespace-nowrap z-10 pointer-events-none transition-opacity text-text-main">
                  <div className="font-bold mb-1">{d.date}</div>
                  <div className="text-text-secondary">Total: <span className="text-text-main">{d.total}</span></div>
                  <div className="text-emerald-400">Completed: <span className="text-text-main">{d.completed}</span></div>
                </div>
              </div>
              <div className="absolute -bottom-6 text-[10px] font-semibold text-text-muted whitespace-nowrap">{d.date}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const Reports = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'operational' | 'guards' | 'history'>('operational');
  
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [dateRange, setDateRange] = useState('7');
  const [siteId, setSiteId] = useState('');
  const [guardId, setGuardId] = useState('');



  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (activeTab === 'operational') {
      fetchDashboard();
      fetchHistory(5);
    } else if (activeTab === 'history') {
      fetchHistory(50);
    }
  }, [activeTab, dateRange, siteId, guardId]);

  const fetchFilters = async () => {
    try {
      const [sitesRes, guardsRes] = await Promise.all([
        api.get('/sites'),
        api.get('/guards')
      ]);
      setSites(sitesRes.data.sites || []);
      setGuards(guardsRes.data.guards || []);
    } catch (err) {
      console.error('Failed to load filters', err);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const params = new URLSearchParams();
      if (dateRange !== 'all') params.append('startDate', startDate.toISOString());
      if (siteId) params.append('siteId', siteId);
      if (guardId) params.append('guardId', guardId);
      
      const res = await api.get(`/reports/dashboard?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (limitNum: number) => {
    try {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const params = new URLSearchParams();
      params.append('limit', limitNum.toString());
      if (dateRange !== 'all') params.append('startDate', startDate.toISOString());
      if (siteId) params.append('siteId', siteId);
      if (guardId) params.append('guardId', guardId);
      
      const res = await api.get(`/reports/patrols?${params.toString()}`);
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const handleExport = async () => {
    try {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const params = new URLSearchParams();
      if (dateRange !== 'all') params.append('startDate', startDate.toISOString());
      if (siteId) params.append('siteId', siteId);
      if (guardId) params.append('guardId', guardId);
      if (activeTab === 'guards') params.append('type', 'guards');
      
      const res = await api.get(`/reports/export/csv?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tracksentra-report-${new Date().toISOString().split('T')[0]}.csv`);
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

  const renderTrend = (trend: number) => {
    if (trend === 0) return <span className="text-text-muted flex items-center text-xs font-bold gap-1">- 0%</span>;
    if (trend > 0) return <span className="text-emerald-500 flex items-center text-xs font-bold gap-1"><ArrowUpRight size={14}/> +{trend}%</span>;
    return <span className="text-red-500 flex items-center text-xs font-bold gap-1"><ArrowDownRight size={14}/> {trend}%</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-full pb-10">
      
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-1 mb-2">
        <div className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          Reports <ChevronRight size={12} className="text-border-strong" /> <span className="text-emerald-400">Analytics</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-text-main flex items-center gap-3 tracking-tight mb-2">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
              <BarChart3 className="text-emerald-500" size={20} />
            </div>
            Analytics & Reports
          </h1>
          <p className="text-text-secondary text-sm font-medium">Review operational performance, guard statistics, and export historical data.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-surface-sidebar border border-border-subtle rounded-lg text-sm font-bold text-text-main appearance-none hover:border-emerald-500/30 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
            >
              <option value="1">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div className="relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <select 
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="pl-9 pr-8 py-2 bg-surface-sidebar border border-border-subtle rounded-lg text-sm font-bold text-text-main appearance-none hover:border-emerald-500/30 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm min-w-[140px]"
            >
              <option value="">All Sites</option>
              {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          <div className="relative group">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <select 
              value={guardId}
              onChange={(e) => setGuardId(e.target.value)}
              className="pl-9 pr-8 py-2 bg-surface-sidebar border border-border-subtle rounded-lg text-sm font-bold text-text-main appearance-none hover:border-emerald-500/30 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm min-w-[140px]"
            >
              <option value="">All Guards</option>
              {guards.map(g => (
                <option key={g._id} value={g._id}>
                  {g.userId?.firstName} {g.userId?.lastName} ({g.employeeId})
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleExport} className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all bg-emerald-500 hover:bg-emerald-400 text-surface-main font-bold border-none px-4 py-2 ml-auto xl:ml-0">
            <Download size={16} /> Export CSV Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle w-full mt-6">
        <button 
          className={`flex items-center justify-center gap-2 pb-3 px-6 text-sm font-bold transition-all relative ${
            activeTab === 'operational' ? 'text-emerald-400' : 'text-text-secondary hover:text-text-main'
          }`}
          onClick={() => setActiveTab('operational')}
        >
          <Activity size={16} /> Operational Summary
          {activeTab === 'operational' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
        </button>
        <button 
          className={`flex items-center justify-center gap-2 pb-3 px-6 text-sm font-bold transition-all relative ${
            activeTab === 'guards' ? 'text-emerald-400' : 'text-text-secondary hover:text-text-main'
          }`}
          onClick={() => setActiveTab('guards')}
        >
          <Users size={16} /> Guard Analytics
          {activeTab === 'guards' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
        </button>
        <button 
          className={`flex items-center justify-center gap-2 pb-3 px-6 text-sm font-bold transition-all relative ${
            activeTab === 'history' ? 'text-emerald-400' : 'text-text-secondary hover:text-text-main'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={16} /> Patrol History
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px] pt-4">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-sidebar border border-border-subtle rounded-2xl shadow-sm text-center">
            <ShieldAlert size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-text-main mb-2">Unable to load reports</h3>
            <p className="text-text-secondary mb-6 max-w-md">There was a problem fetching the analytics data. Please check your connection and try again.</p>
            <Button onClick={fetchDashboard} variant="outline" className="font-bold border-border-subtle hover:bg-surface-main">Retry Loading</Button>
          </div>
        ) : loading || !data ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 bg-surface-sidebar rounded-xl border border-border-subtle"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 h-80 bg-surface-sidebar rounded-xl border border-border-subtle"></div>
              <div className="lg:col-span-1 h-80 bg-surface-sidebar rounded-xl border border-border-subtle"></div>
              <div className="lg:col-span-1 h-80 bg-surface-sidebar rounded-xl border border-border-subtle"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {activeTab === 'operational' && (
              <>
                {/* 5 KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                  <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Activity size={20} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Total Patrols</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-text-main">{data.kpis.totalPatrols.value}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {renderTrend(data.kpis.totalPatrols.trend)}
                      <span className="text-[10px] text-text-muted font-bold ml-2">vs prev. period</span>
                    </div>
                  </Card>

                  <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Completed</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-text-main">{data.kpis.completed.value}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {renderTrend(data.kpis.completed.trend)}
                      <span className="text-[10px] text-text-muted font-bold ml-2">vs prev. period</span>
                    </div>
                  </Card>

                  <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                        <ShieldAlert size={20} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Failed / Missed</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-text-main">{data.kpis.failedMissed.value}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {/* Note: Less fails is better, so inverted trend logic visually could be done, but we'll stick to math for now */}
                      {renderTrend(data.kpis.failedMissed.trend)}
                      <span className="text-[10px] text-text-muted font-bold ml-2">vs prev. period</span>
                    </div>
                  </Card>

                  <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                        <Clock size={20} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Avg. Duration</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-text-main flex items-baseline gap-1">{data.kpis.avgDurationMinutes.value} <span className="text-sm font-bold text-text-secondary">min</span></span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {renderTrend(data.kpis.avgDurationMinutes.trend)}
                      <span className="text-[10px] text-text-muted font-bold ml-2">vs prev. period</span>
                    </div>
                  </Card>

                  <Card className="p-5 flex flex-col gap-3 bg-surface-sidebar border-border-subtle shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <ShieldCheck size={20} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Checkpoint Compliance</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-text-main">{data.kpis.checkpointCompliance.value}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {renderTrend(data.kpis.checkpointCompliance.trend)}
                      <span className="text-[10px] text-text-muted font-bold ml-2">vs prev. period</span>
                    </div>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-500 delay-100 fill-mode-both">
                  
                  {/* Activity Chart */}
                  <Card className="lg:col-span-1 bg-surface-sidebar border-border-subtle shadow-sm p-5 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded text-emerald-500"><BarChart3 size={16} /></div>
                        <div>
                          <h3 className="font-bold text-text-main">Patrol Activity</h3>
                          <p className="text-xs text-text-secondary mt-0.5">Daily patrols logged vs completed</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full mt-auto">
                      <BarChart data={data.activityChart} />
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs font-bold text-text-secondary">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Completed</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-surface-main border border-border-subtle"></div> Total Patrols</div>
                    </div>
                  </Card>

                  {/* Compliance */}
                  <Card className="lg:col-span-1 bg-surface-sidebar border-border-subtle shadow-sm p-5 flex flex-col">
                    <h3 className="font-bold text-text-main mb-6">Checkpoint Compliance</h3>
                    <div className="flex items-center gap-6 mb-8">
                      <DonutChart percentage={data.kpis.checkpointCompliance.value} />
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-text-secondary">Overall Compliance</div>
                        <div className="mt-1 flex items-center gap-2">
                          {renderTrend(data.kpis.checkpointCompliance.trend)}
                          <span className="text-xs text-text-muted font-semibold">vs prev. period</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      {data.checkpointCompliance.length === 0 ? (
                        <div className="text-sm text-text-muted italic flex h-full items-center justify-center">No checkpoint data available.</div>
                      ) : (
                        data.checkpointCompliance.map((cp: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <span className="text-sm font-bold text-text-main flex-1 truncate">{cp.name}</span>
                            <div className="w-32 h-1.5 bg-surface-main rounded-full overflow-hidden shrink-0 border border-border-subtle">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${cp.compliance}%` }}></div>
                            </div>
                            <span className="text-sm font-black text-text-main w-8 text-right shrink-0">{cp.compliance}%</span>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  {/* Top Guards */}
                  <Card className="lg:col-span-1 bg-surface-sidebar border-border-subtle shadow-sm p-0 flex flex-col overflow-hidden">
                    <div className="px-5 pt-5 pb-4 border-b border-border-subtle flex justify-between items-center bg-surface-sidebar">
                      <h3 className="font-bold text-text-main">Top Guards</h3>
                      <div className="text-xs font-bold text-text-secondary flex items-center gap-1">By Completion Rate <ChevronRight size={14} className="rotate-90"/></div>
                    </div>
                    <div className="divide-y divide-border-subtle flex-1 overflow-y-auto">
                      {data.topGuards.length === 0 ? (
                        <div className="text-sm text-text-muted italic flex h-full items-center justify-center p-8">No guard performance data available.</div>
                      ) : (
                        data.topGuards.map((g: any, i: number) => (
                          <div key={g.id} className="p-4 flex items-center gap-4 hover:bg-surface-hover/50 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-surface-main border border-border-subtle flex items-center justify-center text-xs font-black text-text-secondary shrink-0">{i + 1}</div>
                            <div className="w-10 h-10 rounded-full bg-surface-main border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black shrink-0 overflow-hidden shadow-sm">
                              {g.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-text-main truncate">{g.name}</div>
                              <div className="text-xs font-semibold text-text-secondary">{g.patrols} patrols</div>
                            </div>
                            <div className="flex flex-col items-end shrink-0 gap-1.5 w-16">
                              <span className="text-sm font-black text-text-main">{g.completionRate}%</span>
                              <div className="w-full h-1 bg-surface-main rounded-full overflow-hidden border border-border-subtle">
                                <div className={`h-full rounded-full transition-all duration-1000 ${g.completionRate >= 90 ? 'bg-emerald-500' : g.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${g.completionRate}%` }}></div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Recent Patrol Activity Table */}
                <Card className="bg-surface-sidebar border-border-subtle shadow-sm p-0 overflow-hidden animate-in slide-in-from-bottom-6 duration-500 delay-200 fill-mode-both">
                  <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface-sidebar">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded text-emerald-500"><FileText size={16} /></div>
                      <div>
                        <h3 className="font-bold text-text-main">Recent Patrol Activity</h3>
                        <p className="text-xs text-text-secondary mt-0.5">Latest patrol logs across all sites.</p>
                      </div>
                    </div>
                    <Button onClick={() => setActiveTab('history')} variant="outline" className="text-xs font-bold border-border-subtle bg-surface-main hover:bg-surface-hover">View All</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-main border-b border-border-subtle text-xs font-black text-text-muted uppercase tracking-widest">
                          <th className="px-6 py-4 whitespace-nowrap">Date & Time</th>
                          <th className="px-6 py-4 whitespace-nowrap">Guard</th>
                          <th className="px-6 py-4 whitespace-nowrap">Site</th>
                          <th className="px-6 py-4 whitespace-nowrap">Route</th>
                          <th className="px-6 py-4 whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 whitespace-nowrap">Duration</th>
                          <th className="px-6 py-4 whitespace-nowrap">Checkpoints</th>
                          <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle text-sm font-semibold">
                        {history.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">No recent patrol executions for the selected period.</td>
                          </tr>
                        ) : (
                          history.map((session) => {
                            const progPct = session.checkpointsTotal > 0 ? (session.checkpointsCompleted / session.checkpointsTotal) * 100 : 0;
                            return (
                              <tr key={session._id} className="hover:bg-surface-hover/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-text-main">{new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                                  <div className="text-xs text-text-secondary mt-0.5">{new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-main">
                                  {session.guardId?.userId ? `${session.guardId.userId.firstName} ${session.guardId.userId.lastName}` : 'Unknown Guard'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-main">
                                  {session.siteId?.name || 'Unknown Site'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-main">
                                  {session.routeId?.name || 'Unknown Route'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                                    session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    session.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    session.status === 'cancelled' || session.status === 'missed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-surface-main text-text-secondary border-border-subtle'
                                  }`}>
                                    {session.status.replace('_', ' ')}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-main">
                                  {session.durationMs ? `${Math.round(session.durationMs / 60000)} min` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <span className="text-text-main w-8">{session.checkpointsCompleted} / {session.checkpointsTotal}</span>
                                    <div className="w-16 h-1.5 bg-surface-main rounded-full overflow-hidden border border-border-subtle">
                                      <div className={`h-full rounded-full ${progPct >= 100 ? 'bg-emerald-500' : progPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${progPct}%` }}></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <button className="text-text-muted hover:text-text-main transition-colors p-1 rounded hover:bg-surface-main">
                                    <MoreHorizontal size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}

            {activeTab === 'guards' && (
              <GuardAnalyticsTab dateRange={dateRange} siteId={siteId} guardId={guardId} />
            )}

            {activeTab === 'history' && (
              <PatrolHistoryTab dateRange={dateRange} siteId={siteId} guardId={guardId} />
            )}

          </div>
        )}
      </div>
    </div>
  );
};
