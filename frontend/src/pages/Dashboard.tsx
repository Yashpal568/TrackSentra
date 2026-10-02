import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Building2, MapPin, LayoutDashboard, Users, CalendarClock, QrCode, Radio, BarChart3, AlertTriangle, Shield, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { OnboardingChecklist } from '../components/OnboardingChecklist';

export const Dashboard = () => {
  const { user } = useAuthStore();

  const primaryActions = [
    { name: 'Live Monitoring', path: '/live', icon: Radio, color: 'bg-emerald-primary/10', iconColor: 'text-emerald-primary', hoverBorder: 'hover:border-emerald-primary', alert: true },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle, color: 'bg-warning/10', iconColor: 'text-warning', hoverBorder: 'hover:border-warning' },
    { name: 'Patrols', path: '/patrols', icon: LayoutDashboard, color: 'bg-info/10', iconColor: 'text-info', hoverBorder: 'hover:border-info' },
  ];

  const managementLinks = [
    { name: 'Sites', path: '/sites', icon: MapPin },
    { name: 'Checkpoints', path: '/checkpoints', icon: QrCode },
    { name: 'Guards', path: '/guards', icon: Users },
    { name: 'Shifts', path: '/shifts', icon: CalendarClock },
  ];

  const systemLinks = [
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Audit Logs', path: '/audit', icon: Shield },
    { name: 'Company', path: '/company', icon: Building2 },
    { name: 'Help Center', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-dashed border-border-subtle">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight text-text-main">Security Operations Center</h1>
          </div>
          <p className="text-text-secondary">Welcome back, {user?.firstName || 'Operator'}. Your dashboard is ready.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-sm bg-surface-sidebar border-border-subtle">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-primary"></span>
          </div>
          <span className="text-sm font-bold text-emerald-primary">System Status: Optimal</span>
        </div>
      </div>

      {user?.role === 'COMPANY_ADMIN' && <OnboardingChecklist />}

      {/* Primary Operations */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Zap size={18} className="text-emerald-primary" />
          <h2 className="text-sm font-bold tracking-widest uppercase text-text-muted">Active Operations</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryActions.map((action) => (
            <Link key={action.path} to={action.path} className="block group">
              <Card className={`relative overflow-hidden transition-all duration-300 h-full bg-surface-card border-border-subtle ${action.hoverBorder} hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)]`}>
                {/* Decorative Background Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${action.color.replace('/10', '')}`} />

                {action.alert && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-danger rounded-full animate-pulse shadow-[0_0_12px_rgba(248,113,113,1)]"></div>
                )}
                <div className="p-8 flex flex-col h-full relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${action.color}`}>
                    <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-text-main">{action.name}</h3>
                  <div className="mt-auto pt-6 flex items-center text-sm font-bold transition-colors text-text-secondary group-hover:text-emerald-primary">
                    Access Console <ArrowRight size={16} className="ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Management & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-sm font-bold tracking-widest uppercase mb-6 text-text-muted">Resource Management</h2>
          <div className="grid grid-cols-2 gap-4">
            {managementLinks.map(link => (
              <Link key={link.path} to={link.path} className="block group">
                <Card className="p-5 flex items-center gap-4 transition-all duration-300 bg-surface-card border-border-subtle hover:border-emerald-primary/50 hover:bg-surface-hover">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-surface-hover text-emerald-primary group-hover:bg-emerald-primary/20">
                    <link.icon size={22} />
                  </div>
                  <div className="font-bold text-text-main">{link.name}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold tracking-widest uppercase mb-6 text-text-muted">System & Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            {systemLinks.map(link => (
              <Link key={link.path} to={link.path} className="block group">
                <Card className="p-5 flex items-center gap-4 transition-all duration-300 bg-surface-card border-border-subtle hover:border-emerald-primary/50 hover:bg-surface-hover">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-surface-hover text-emerald-primary group-hover:bg-emerald-primary/20">
                    <link.icon size={22} />
                  </div>
                  <div className="font-bold text-text-main">{link.name}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Admin Specific Sections */}
      {user?.role === 'SUPER_ADMIN' && (
        <section className="pt-8 border-t border-border-subtle">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-6 text-text-muted">Super Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/admin/plans" className="block group">
              <Card className="p-5 flex items-center gap-4 transition-all duration-300 bg-surface-card border-border-subtle hover:border-warning/50 hover:bg-surface-hover">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-warning/20">
                  <LayoutDashboard className="text-warning" size={22} />
                </div>
                <span className="font-bold text-text-main">Admin Plans</span>
              </Card>
            </Link>
            <Link to="/admin/payments" className="block group">
              <Card className="p-5 flex items-center gap-4 transition-all duration-300 bg-surface-card border-border-subtle hover:border-warning/50 hover:bg-surface-hover">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-warning/20">
                  <Shield className="text-warning" size={22} />
                </div>
                <span className="font-bold text-text-main">Verify Payments</span>
              </Card>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
