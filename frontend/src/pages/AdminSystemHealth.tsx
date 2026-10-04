import { useState, useEffect } from 'react';
import { Activity, Server, Database, HardDrive, Cpu, Network, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function AdminSystemHealth() {
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memUsage, setMemUsage] = useState(68);
  const [dbLoad, setDbLoad] = useState(24);

  // Simulate real-time telemetry changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(10, prev + (Math.random() * 10 - 5))));
      setMemUsage(prev => Math.min(100, Math.max(20, prev + (Math.random() * 4 - 2))));
      setDbLoad(prev => Math.min(100, Math.max(5, prev + (Math.random() * 6 - 3))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">System Health</h1>
          <p className="text-text-secondary mt-1">Real-time platform telemetry and service uptime monitoring.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400 font-bold text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          All Systems Operational
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface-card p-6 border-border-subtle flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Cpu size={20} /></div>
            <span className="text-2xl font-black text-white">{cpuUsage.toFixed(0)}%</span>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
              <span>App Cluster CPU</span>
              <span>16 Cores</span>
            </div>
            <div className="w-full bg-surface-sidebar h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${cpuUsage}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-card p-6 border-border-subtle flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><HardDrive size={20} /></div>
            <span className="text-2xl font-black text-white">{memUsage.toFixed(0)}%</span>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
              <span>Memory Usage</span>
              <span>44 GB / 64 GB</span>
            </div>
            <div className="w-full bg-surface-sidebar h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${memUsage}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-card p-6 border-border-subtle flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Database size={20} /></div>
            <span className="text-2xl font-black text-white">{dbLoad.toFixed(0)}%</span>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
              <span>Database Load</span>
              <span>1240 QPS</span>
            </div>
            <div className="w-full bg-surface-sidebar h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${dbLoad}%` }}></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Services List */}
      <Card className="bg-surface-card border-border-subtle p-0 overflow-hidden">
        <div className="p-6 border-b border-border-subtle bg-surface-main/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Network className="text-emerald-500" size={20} /> Microservices Status
          </h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {[
            { name: 'Core API Gateway', uptime: '99.999%', latency: '45ms' },
            { name: 'Authentication Service', uptime: '100%', latency: '12ms' },
            { name: 'Real-time Socket Server', uptime: '99.98%', latency: '24ms' },
            { name: 'Background Workers', uptime: '99.95%', latency: 'N/A' },
            { name: 'MongoDB Primary', uptime: '100%', latency: '3ms' },
            { name: 'Redis Cache Cluster', uptime: '100%', latency: '1ms' },
          ].map((service, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-surface-main/50 transition-colors">
              <div className="flex items-center gap-4">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="font-bold text-sm text-text-main">{service.name}</span>
              </div>
              <div className="flex items-center gap-8 text-xs font-bold">
                <div className="text-right">
                  <span className="text-text-muted block uppercase tracking-widest text-[9px] mb-0.5">Uptime</span>
                  <span className="text-text-secondary">{service.uptime}</span>
                </div>
                <div className="text-right w-16">
                  <span className="text-text-muted block uppercase tracking-widest text-[9px] mb-0.5">Latency</span>
                  <span className="text-text-secondary">{service.latency}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">Operational</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
