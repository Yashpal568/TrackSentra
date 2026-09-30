import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Building2, MapPin, LayoutDashboard, Users, CalendarClock, QrCode, Radio, BarChart3, AlertTriangle, Shield, HelpCircle, ArrowRight, Activity } from 'lucide-react';
import { OnboardingChecklist } from '../components/OnboardingChecklist';

export const Dashboard = () => {
  const { user } = useAuthStore();

  const primaryActions = [
    { name: 'Live Monitoring', path: '/live', icon: Radio, color: 'bg-blue-500', textColor: 'text-blue-500', border: 'border-blue-500', alert: true },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle, color: 'bg-orange-500', textColor: 'text-orange-500', border: 'border-orange-500' },
    { name: 'Patrols', path: '/patrols', icon: LayoutDashboard, color: 'bg-indigo-500', textColor: 'text-indigo-500', border: 'border-indigo-500' },
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Operations Center</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.firstName || 'Operator'}. System is active.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Activity size={18} className="text-green-500" />
          <span className="text-sm font-medium text-slate-700">System Status: Optimal</span>
        </div>
      </div>

      {user?.role === 'COMPANY_ADMIN' && <OnboardingChecklist />}

      {/* Primary Operations */}
      <section>
        <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">Active Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryActions.map(action => (
            <Link key={action.path} to={action.path}>
              <Card className={`group cursor-pointer border-t-4 ${action.border} hover:shadow-md transition-all overflow-hidden relative bg-white`}>
                {action.alert && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                )}
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <div className={`w-14 h-14 ${action.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-7 h-7 ${action.textColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{action.name}</h3>
                  <div className="mt-4 flex items-center text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                    Access Console <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
          <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">Resource Management</h2>
          <div className="grid grid-cols-2 gap-4">
            {managementLinks.map(link => (
              <Link key={link.path} to={link.path}>
                <Card className="p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-4 bg-white border border-slate-200">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                    <link.icon size={20} />
                  </div>
                  <div className="font-medium text-slate-700">{link.name}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">System & Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            {systemLinks.map(link => (
              <Link key={link.path} to={link.path}>
                <Card className="p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-4 bg-white border border-slate-200">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                    <link.icon size={20} />
                  </div>
                  <div className="font-medium text-slate-700">{link.name}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Admin Specific Sections */}
      {user?.role === 'SUPER_ADMIN' && (
        <section className="pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">Super Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/admin/plans">
              <Card className="p-5 hover:border-yellow-300 hover:bg-yellow-50/50 transition-all cursor-pointer flex items-center gap-4 bg-white border border-slate-200">
                <LayoutDashboard className="text-yellow-600" size={20} />
                <span className="font-medium text-slate-800">Admin Plans</span>
              </Card>
            </Link>
            <Link to="/admin/payments">
              <Card className="p-5 hover:border-yellow-300 hover:bg-yellow-50/50 transition-all cursor-pointer flex items-center gap-4 bg-white border border-slate-200">
                <Shield className="text-yellow-600" size={20} />
                <span className="font-medium text-slate-800">Verify Payments</span>
              </Card>
            </Link>
          </div>
        </section>
      )}

    </div>
  );
};
