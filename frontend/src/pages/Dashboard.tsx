import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Link, Navigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, Activity, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, ArrowUpRight, ArrowDownRight, Radio, MapPin, Calendar, CheckSquare } from 'lucide-react';
import { GuardDashboard } from './guard/GuardDashboard';

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

// Helper for Area/Line Chart (Patrol Completion Rate)
const AreaChart = ({ data }: { data: any[] }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.total, d.completed)), 10);
  const yMax = Math.ceil(maxVal * 1.2 / 10) * 10;
  
  if (data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-text-secondary">No patrol activity for this period.</div>;
  }

  // Calculate points for SVG
  const getPoints = (key: 'total' | 'completed') => {
    return data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
      const y = 100 - (d[key] / yMax) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  const completedPoints = getPoints('completed');
  const totalPoints = getPoints('total');

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
      
      <div className="relative h-full w-full">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} className="stroke-border-subtle" strokeWidth="0.5" />
          ))}
          
          {/* Total Line (subtle) */}
          <polyline points={totalPoints} fill="none" className="stroke-text-muted opacity-50" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => {
             const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
             const y = 100 - (d.total / yMax) * 100;
             return <circle key={`t-${i}`} cx={x} cy={y} r="1" className="fill-text-muted opacity-50" />
          })}

          {/* Completed Area & Line */}
          {/* We need to close the path for the area to fill properly */}
          <polygon points={`0,100 ${completedPoints} 100,100`} className="fill-emerald-primary/10" />
          <polyline points={completedPoints} fill="none" className="stroke-emerald-primary" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => {
             const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
             const y = 100 - (d.completed / yMax) * 100;
             return <circle key={`c-${i}`} cx={x} cy={y} r="2" className="fill-emerald-primary" />
          })}
        </svg>

        {/* X Axis Labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] font-semibold text-text-muted">
          {data.map((d, i) => (
            <span key={i} className="transform -translate-x-1/2" style={{ left: `${(i / (data.length - 1)) * 100}%`, position: 'absolute' }}>
              {d.date}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  
  const [dateRange, setDateRange] = useState('0'); // 0 = Today
  const [siteId, setSiteId] = useState('');

  if (user?.role === 'GUARD') {
    return <GuardDashboard />;
  }

  if (user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites');
      setSites(res.data.sites || []);
    } catch (err) {
      console.error('Failed to load sites', err);
    }
  };

  const fetchDashboard = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    setError(false);

    try {
      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Today default
      const endDate = new Date();

      if (dateRange === '1') {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateRange === '7') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === '30') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (dateRange === 'month') {
        startDate.setDate(1); // Start of month
      }

      const params = new URLSearchParams();
      if (siteId) params.append('siteId', siteId);
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());

      const res = await api.get(`/dashboard/summary?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Set up a simple interval to keep it relatively fresh without SSE for now
    const interval = setInterval(() => fetchDashboard(true), 60000); // every minute
    return () => clearInterval(interval);
  }, [dateRange, siteId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'in_progress': return 'bg-info/10 text-info border-info/20';
      case 'delayed': return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
      case 'missed':
      case 'cancelled': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-surface-hover text-text-secondary border-border-subtle';
    }
  };

  const getSiteStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return 'text-emerald-500';
      case 'Attention': return 'text-warning';
      case 'Alert': return 'text-danger';
      default: return 'text-text-secondary';
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-text-main flex items-center gap-3">
              Dashboard 
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </h1>
          </div>
          <p className="text-text-main font-semibold text-lg">Good evening, {user?.firstName || 'Admin'}</p>
          <p className="text-text-secondary text-sm">Here's what's happening across your security operations today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <select 
              className="pl-9 pr-8 py-2 bg-surface-sidebar border border-border-subtle rounded-lg text-sm text-text-main appearance-none focus:outline-none focus:border-emerald-primary transition-colors cursor-pointer"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="0">Today</option>
              <option value="1">Yesterday</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <select 
              className="pl-9 pr-8 py-2 bg-surface-sidebar border border-border-subtle rounded-lg text-sm text-text-main appearance-none focus:outline-none focus:border-emerald-primary transition-colors cursor-pointer"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            >
              <option value="">All Sites</option>
              {sites.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <Button 
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => fetchDashboard(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-8 text-center bg-danger/5 border-danger/20 flex flex-col items-center">
          <AlertTriangle className="text-danger mb-2" size={32} />
          <h3 className="text-lg font-bold text-danger mb-1">Unable to load dashboard data</h3>
          <p className="text-text-secondary text-sm mb-4">There was a problem communicating with the server.</p>
          <Button variant="outline" onClick={() => fetchDashboard()}>Retry</Button>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <Card key={i} className="h-32 bg-surface-hover/50 border-border-subtle"></Card>
          ))}
          <Card className="h-96 md:col-span-2 bg-surface-hover/50 border-border-subtle"></Card>
          <Card className="h-96 md:col-span-2 bg-surface-hover/50 border-border-subtle"></Card>
        </div>
      ) : data ? (
        <>
          {/* 1. KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex flex-col justify-between border-border-subtle bg-linear-to-br from-surface-sidebar to-surface-card overflow-hidden relative group">
              <div className="absolute right-0 bottom-0 opacity-10 text-emerald-primary translate-x-4 translate-y-4 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <Users size={80} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-primary/10 flex items-center justify-center text-emerald-primary">
                  <Users size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Active Guards</h3>
              </div>
              <div>
                <div className="text-3xl font-black text-text-main mb-1">{data.kpis.activeGuards.value}</div>
                <div className="flex items-center text-xs">
                  {data.kpis.activeGuards.trend !== 0 ? (
                    <span className={`font-bold flex items-center mr-2 ${data.kpis.activeGuards.trend > 0 ? 'text-emerald-500' : 'text-danger'}`}>
                      {data.kpis.activeGuards.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(data.kpis.activeGuards.trend)}%
                    </span>
                  ) : (
                    <span className="text-text-muted mr-2">-</span>
                  )}
                  <span className="text-text-secondary">Currently on duty</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-border-subtle bg-linear-to-br from-surface-sidebar to-surface-card overflow-hidden relative group">
              <div className="absolute right-0 bottom-0 opacity-10 text-info translate-x-4 translate-y-4 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <Activity size={80} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                  <Activity size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Active Patrols</h3>
              </div>
              <div>
                <div className="text-3xl font-black text-text-main mb-1">{data.kpis.activePatrols.value}</div>
                <div className="flex items-center text-xs">
                  {data.kpis.activePatrols.trend !== 0 ? (
                    <span className={`font-bold flex items-center mr-2 ${data.kpis.activePatrols.trend > 0 ? 'text-emerald-500' : 'text-danger'}`}>
                      {data.kpis.activePatrols.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(data.kpis.activePatrols.trend)}%
                    </span>
                  ) : (
                    <span className="text-text-muted mr-2">-</span>
                  )}
                  <span className="text-text-secondary">In progress right now</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-border-subtle bg-linear-to-br from-surface-sidebar to-surface-card overflow-hidden relative group">
              <div className="absolute right-0 bottom-0 opacity-10 text-emerald-500 translate-x-4 translate-y-4 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <CheckCircle2 size={80} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Completed Patrols</h3>
              </div>
              <div>
                <div className="text-3xl font-black text-text-main mb-1">{data.kpis.completedPatrols.value}</div>
                <div className="flex items-center text-xs">
                  {data.kpis.completedPatrols.trend !== 0 ? (
                    <span className={`font-bold flex items-center mr-2 ${data.kpis.completedPatrols.trend > 0 ? 'text-emerald-500' : 'text-danger'}`}>
                      {data.kpis.completedPatrols.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(data.kpis.completedPatrols.trend)}%
                    </span>
                  ) : (
                    <span className="text-text-muted mr-2">-</span>
                  )}
                  <span className="text-text-secondary">Completed in period</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-danger/20 bg-linear-to-br from-surface-sidebar to-surface-card overflow-hidden relative group shadow-[0_0_15px_rgba(248,113,113,0.05)]">
              <div className="absolute right-0 bottom-0 opacity-10 text-danger translate-x-4 translate-y-4 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <AlertTriangle size={80} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                  <AlertTriangle size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Open Incidents</h3>
              </div>
              <div>
                <div className="text-3xl font-black text-text-main mb-1">{data.kpis.openIncidents.value}</div>
                <div className="flex items-center text-xs">
                  {data.kpis.openIncidents.trend !== 0 ? (
                    <span className={`font-bold flex items-center mr-2 ${data.kpis.openIncidents.trend > 0 ? 'text-danger' : 'text-emerald-500'}`}>
                      {data.kpis.openIncidents.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(data.kpis.openIncidents.trend)}%
                    </span>
                  ) : (
                    <span className="text-text-muted mr-2">-</span>
                  )}
                  <span className="text-text-secondary">Require attention</span>
                </div>
              </div>
            </Card>
          </div>

          {/* 2. Middle Row: Live Patrols & Site Status */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            
            {/* Live Patrol Activity */}
            <Card className="lg:col-span-3 p-0 border-border-subtle flex flex-col h-100">
              <div className="p-5 border-b border-border-subtle flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-emerald-primary animate-pulse" />
                    <h3 className="font-bold text-text-main">Live Patrol Activity</h3>
                  </div>
                  <span className="text-xs text-text-secondary mt-1">Real-time view of ongoing patrols across all sites.</span>
                </div>
                <Link to="/live">
                  <Button variant="outline" size="sm" className="text-xs h-8 flex items-center gap-1 border-border-subtle bg-surface-sidebar">
                    View All <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {data.livePatrols.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary p-8 text-center">
                    <Activity size={32} className="mb-3 opacity-20" />
                    <p className="font-medium">No active patrols</p>
                    <p className="text-sm">No patrols are currently in progress.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-surface-sidebar text-text-muted sticky top-0 z-10 border-b border-border-subtle">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Guard</th>
                        <th className="px-4 py-3 font-semibold">Site</th>
                        <th className="px-4 py-3 font-semibold">Route</th>
                        <th className="px-4 py-3 font-semibold">Checkpoint</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {data.livePatrols.map((patrol: any) => (
                        <tr key={patrol._id} className="hover:bg-surface-hover/50 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-surface-hover border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-muted">
                                {patrol.guardName.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-text-main">{patrol.guardName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">{patrol.siteName}</td>
                          <td className="px-4 py-3 text-text-secondary">{patrol.routeName}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs w-8 text-text-main">{patrol.checkpointsCompleted}/{patrol.checkpointsTotal}</span>
                              <div className="w-16 h-1.5 bg-surface-sidebar rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${patrol.checkpointsTotal > 0 ? (patrol.checkpointsCompleted / patrol.checkpointsTotal) * 100 : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(patrol.status)}`}>
                              {patrol.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                            {timeAgo(patrol.lastSeen)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            {/* Site Status */}
            <Card className="lg:col-span-2 p-0 border-border-subtle flex flex-col h-100">
               <div className="p-5 border-b border-border-subtle flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-text-muted" />
                    <h3 className="font-bold text-text-main">Site Status</h3>
                  </div>
                  <span className="text-xs text-text-secondary mt-1">Current status of all your sites</span>
                </div>
                <Link to="/sites">
                  <Button variant="outline" size="sm" className="text-xs h-8 flex items-center gap-1 border-border-subtle bg-surface-sidebar">
                    View All <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {data.siteStatus.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-text-secondary">No sites available.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 text-xs font-bold text-text-muted uppercase tracking-wider px-3 pb-2 border-b border-border-subtle">
                      <div className="col-span-1">Site</div>
                      <div className="col-span-1 text-center">Status</div>
                      <div className="col-span-1 text-center">Active Guards</div>
                      <div className="col-span-1 text-right">Active Patrols</div>
                    </div>
                    {data.siteStatus.map((site: any) => (
                      <div key={site._id} className="grid grid-cols-4 items-center px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors text-sm">
                        <div className="col-span-1 font-medium text-text-main truncate pr-2" title={site.siteName}>{site.siteName}</div>
                        <div className="col-span-1 flex justify-center">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${site.status === 'Normal' ? 'bg-emerald-500' : site.status === 'Attention' ? 'bg-warning' : 'bg-danger animate-pulse'}`}></span>
                            <span className={`text-xs ${getSiteStatusColor(site.status)}`}>{site.status}</span>
                          </div>
                        </div>
                        <div className="col-span-1 text-center text-text-main">{site.activeGuards}</div>
                        <div className="col-span-1 text-right text-text-main">{site.activePatrols}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Card>

          </div>

          {/* 3. Bottom Row: Chart, Compliance, Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Patrol Completion Rate */}
            <Card className="p-5 border-border-subtle">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-emerald-primary" />
                  <h3 className="font-bold text-text-main">Patrol Completion Rate</h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                   <div className="flex items-center gap-1.5 text-text-secondary">
                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
                   </div>
                   <div className="flex items-center gap-1.5 text-text-secondary">
                     <span className="w-2 h-2 rounded-full bg-text-muted"></span> Total Patrols
                   </div>
                </div>
              </div>
              <AreaChart data={data.activityChart} />
            </Card>

            {/* Checkpoint Compliance */}
            <Card className="p-5 border-border-subtle">
               <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 size={16} className="text-emerald-primary" />
                <h3 className="font-bold text-text-main">Checkpoint Compliance</h3>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                <DonutChart percentage={data.compliance.overall} />
                <div>
                  <div className="text-sm font-semibold text-emerald-primary">Overall Compliance</div>
                  <div className="flex items-center mt-1">
                    {data.compliance.trend !== 0 ? (
                      <span className={`text-xs font-bold flex items-center mr-2 ${data.compliance.trend > 0 ? 'text-emerald-500' : 'text-danger'}`}>
                        {data.compliance.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(data.compliance.trend)}%
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted mr-2">-</span>
                    )}
                    <span className="text-xs text-text-secondary">vs previous period</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {data.compliance.checkpoints.length === 0 ? (
                  <div className="text-sm text-text-secondary text-center py-4">No checkpoint data available.</div>
                ) : (
                  data.compliance.checkpoints.map((cp: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary truncate pr-4 w-32">{cp.name}</span>
                      <div className="flex-1 h-2 bg-surface-sidebar rounded-full mx-4 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cp.compliance}%` }}></div>
                      </div>
                      <span className="font-mono text-xs text-text-main w-8 text-right">{cp.compliance}%</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Incidents */}
            <Card className="p-0 border-border-subtle flex flex-col">
              <div className="p-5 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-danger" />
                  <h3 className="font-bold text-text-main">Recent Incidents</h3>
                </div>
                <Link to="/incidents">
                  <Button variant="outline" size="sm" className="text-xs h-8 flex items-center gap-1 border-border-subtle bg-surface-sidebar">
                    View All <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {data.recentIncidents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary text-center">
                    <AlertTriangle size={24} className="mb-2 opacity-20" />
                    <p className="font-medium text-sm">No recent incidents</p>
                    <p className="text-xs mt-1">All sites are currently clear.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recentIncidents.map((incident: any) => (
                      <div key={incident._id} className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          incident.severity === 'Critical' ? 'bg-danger/20 text-danger' :
                          incident.severity === 'High' ? 'bg-warning/20 text-warning' :
                          'bg-info/20 text-info'
                        }`}>
                          <AlertTriangle size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text-main text-sm truncate">{incident.title}</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-text-secondary">{incident.siteName}</span>
                            <span className="text-[10px] text-text-muted">{timeAgo(incident.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

          </div>
        </>
      ) : null}
    </div>
  );
};
