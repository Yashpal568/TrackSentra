import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { api } from '../lib/axios';

export function AdminRevenue() {
  const [timeframe, setTimeframe] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/revenue?timeframe=${timeframe}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = data ? [
    { title: 'Monthly Recurring Revenue', value: formatCurrency(data.stats.mrr), change: '+12.5%', isPositive: true, icon: DollarSign },
    { title: 'Annual Run Rate', value: formatCurrency(data.stats.arr), change: '+15.2%', isPositive: true, icon: TrendingUp },
    { title: 'Active Paid Tenants', value: data.stats.activeTenants.toString(), change: '+3', isPositive: true, icon: Users },
    { title: 'Churn Rate', value: `${data.stats.churnRate}%`, change: '-0.4%', isPositive: true, icon: ArrowDownRight },
  ] : [
    { title: 'Monthly Recurring Revenue', value: '...', change: '...', isPositive: true, icon: DollarSign },
    { title: 'Annual Run Rate', value: '...', change: '...', isPositive: true, icon: TrendingUp },
    { title: 'Active Paid Tenants', value: '...', change: '...', isPositive: true, icon: Users },
    { title: 'Churn Rate', value: '...', change: '...', isPositive: true, icon: ArrowDownRight },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Revenue Analytics</h1>
          <p className="text-text-secondary mt-1">Financial overview, MRR tracking, and tenant growth metrics.</p>
        </div>
        
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-surface-main border border-border-subtle p-2 rounded-lg text-sm font-bold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last Quarter</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-surface-card border-border-subtle p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-text-muted mb-1">{stat.title}</p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder Chart Area */}
        <Card className="bg-surface-card border-border-subtle p-6 lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
            <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
          </div>
          <div className="flex-1 flex items-center justify-center bg-surface-main/30 rounded-xl border border-border-subtle/50 relative overflow-hidden">
             {/* Mock Chart Visualization */}
             <div className="absolute inset-0 flex items-end justify-between px-8 pt-8 pb-4 opacity-40">
                {(data?.growth || []).map((h: number, j: number) => (
                   <div key={j} className="w-12 bg-emerald-500/20 rounded-t-sm relative group">
                      <div className="absolute bottom-0 w-full bg-emerald-500/80 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }}></div>
                   </div>
                ))}
             </div>
             {loading && <p className="text-sm font-bold text-text-muted z-10 bg-surface-sidebar/80 px-4 py-2 rounded-full backdrop-blur-sm">Chart Data Syncing...</p>}
          </div>
        </Card>

        {/* Recent Transactions List */}
        <Card className="bg-surface-card border-border-subtle p-0 flex flex-col">
          <div className="p-6 border-b border-border-subtle">
            <h3 className="text-lg font-bold text-white">Recent Payouts</h3>
          </div>
          <div className="divide-y divide-border-subtle flex-1 overflow-y-auto max-h-[400px]">
             {data?.transactions?.length === 0 && !loading && (
               <div className="p-8 text-center text-text-muted text-sm font-semibold">No recent payouts found.</div>
             )}
             {(data?.transactions || []).map((tx: any, idx: number) => (
               <div key={idx} className="p-4 flex justify-between items-center hover:bg-surface-main/50 transition-colors cursor-pointer">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-500">
                     <CreditCard size={14} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-text-main">{tx.company}</p>
                     <p className="text-[10px] text-text-muted uppercase tracking-wider">{tx.id} • {tx.date}</p>
                   </div>
                 </div>
                 <span className="text-sm font-black text-white">{tx.amount}</span>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
