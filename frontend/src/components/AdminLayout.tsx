import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { 
  LayoutDashboard, Users, Building2, CreditCard, PieChart, 
  Activity, Bell, LifeBuoy, Shield, Settings, LogOut, ChevronDown, 
  X, Search, PanelLeftClose, PanelLeftOpen, FileText, Lock
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { NotificationBell } from './NotificationBell';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarExpanded');
    return saved !== null ? saved === 'true' : true;
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({ pendingPayments: 0, newCompanies: 0, totalAlerts: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (user && user.role === 'SUPER_ADMIN') {
          const res = await api.get('/admin/notifications/summary');
          setNotifications(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin notifications', err);
      }
    };
    
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [user]);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1280) {
      const newState = !desktopSidebarOpen;
      setDesktopSidebarOpen(newState);
      localStorage.setItem('adminSidebarExpanded', String(newState));
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Platform Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Tenant Management',
      items: [
        { name: 'Companies', path: '/admin/companies', icon: Building2, badge: notifications.newCompanies > 0 ? notifications.newCompanies : undefined, badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        { name: 'Users', path: '/admin/users', icon: Users },
      ]
    },
    {
      title: 'Monetization',
      items: [
        { name: 'Plans & Pricing', path: '/admin/plans', icon: FileText },
        { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard, badge: notifications.pendingPayments > 0 ? notifications.pendingPayments : undefined, badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
        { name: 'Revenue', path: '/admin/revenue', icon: PieChart },
      ]
    },
    {
      title: 'Platform',
      items: [
        { name: 'System Health', path: '/admin/health', icon: Activity },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell, badge: notifications.totalAlerts > 0 ? notifications.totalAlerts : undefined, badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
        { name: 'Support', path: '/admin/support', icon: LifeBuoy },
      ]
    },
    {
      title: 'Security',
      items: [
        { name: 'Platform Audit', path: '/admin/audit', icon: Shield },
        { name: 'Security', path: '/admin/security', icon: Lock },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans bg-[#0a0a0c] text-slate-200 selection:bg-emerald-500/30">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm xl:hidden transition-all duration-300 animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-[#121214] border-r border-[#1e1e24] shadow-2xl xl:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0 ${desktopSidebarOpen ? 'w-72' : 'w-72 xl:w-20'}`}>
        <div className={`h-16 flex items-center shrink-0 border-b border-[#1e1e24] bg-[#121214] overflow-hidden transition-all duration-300 ${desktopSidebarOpen ? 'px-6 justify-between' : 'px-6 xl:px-0 justify-between xl:justify-center'}`}>
          <Link to="/admin/dashboard" className="flex items-center gap-3 text-white font-bold text-lg tracking-tight">
            <div className="p-1.5 rounded-lg shadow-inner bg-[#1a1a1e] border border-[#2a2a32] flex items-center justify-center text-emerald-500 shrink-0">
              <Activity size={20} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${desktopSidebarOpen ? 'opacity-100 w-auto' : 'xl:opacity-0 xl:w-0 xl:hidden'}`}>Platform Control</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="xl:hidden p-1.5 rounded-md text-slate-400 hover:bg-[#2a2a32] hover:text-white transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-[#2a2a32] overflow-x-hidden ${desktopSidebarOpen ? 'px-4' : 'px-4 xl:px-3'}`}>
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-6 relative">
              <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 whitespace-nowrap transition-opacity duration-300 ${desktopSidebarOpen ? 'opacity-100' : 'xl:opacity-0 xl:hidden'}`}>
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        active 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-400 hover:bg-[#1e1e24] hover:text-white border border-transparent'
                      } ${desktopSidebarOpen ? '' : 'xl:justify-center xl:px-0'}`}
                    >
                      <Icon size={18} className={`shrink-0 transition-colors ${desktopSidebarOpen ? 'mr-3' : 'mr-3 xl:mr-0'} ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className={`whitespace-nowrap transition-all duration-300 flex-1 ${desktopSidebarOpen ? 'opacity-100 w-auto' : 'xl:opacity-0 xl:w-0 xl:hidden'}`}>{item.name}</span>
                      
                      {(item as any).badge !== undefined && (
                        <span className={`ml-auto flex items-center justify-center text-[10px] font-black px-1.5 py-0.5 rounded-full border min-w-5 h-5 ${(item as any).badgeColor} ${desktopSidebarOpen ? '' : 'xl:absolute xl:top-1 xl:right-1 xl:ml-0'}`}>
                          {(item as any).badge}
                        </span>
                      )}

                      {!desktopSidebarOpen && (
                         <div className="fixed left-21 hidden xl:group-hover:block px-2.5 py-1.5 bg-[#121214] text-white text-xs font-bold rounded border border-[#1e1e24] shadow-xl whitespace-nowrap z-50 animate-in fade-in zoom-in-95 pointer-events-none">
                            {item.name}
                         </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={`p-4 border-t border-[#1e1e24] shrink-0 bg-[#121214] transition-all ${desktopSidebarOpen ? '' : 'xl:p-3 xl:flex xl:justify-center'}`}>
          <div className={`rounded-xl flex items-center gap-3 border border-[#1e1e24] bg-[#1a1a1e] p-3 cursor-pointer hover:border-emerald-500/30 transition-all ${desktopSidebarOpen ? '' : 'xl:p-1 xl:rounded-full xl:bg-transparent xl:border-transparent xl:hover:bg-[#1e1e24]'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#2a2a32] text-emerald-400 font-black shadow-inner">
              S
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden ${desktopSidebarOpen ? 'opacity-100 w-auto' : 'xl:opacity-0 xl:w-0 xl:hidden'}`}>
              <p className="text-sm font-bold truncate text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold truncate text-slate-400">SUPER ADMIN</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ease-in-out ${desktopSidebarOpen ? 'xl:ml-72' : 'xl:ml-20'}`}>
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#1e1e24] flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-md text-slate-400 hover:text-white hover:bg-[#1e1e24] transition-colors">
              {desktopSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <h2 className="text-lg font-bold hidden sm:block text-white whitespace-nowrap">
               Platform Control
            </h2>

            <div className="hidden md:flex ml-8 flex-1 max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search companies, users, subscriptions..." 
                className="w-full pl-10 pr-4 py-2 bg-[#121214] border border-[#2a2a32] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-4">
            <NotificationBell className="text-slate-400 hover:text-white hover:bg-[#1e1e24]" />
            
            <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#1e1e24] transition-colors hidden sm:block">
              <Activity size={20} />
            </button>

            <div className="h-6 w-px bg-[#1e1e24] hidden sm:block mx-1"></div>

            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full transition-colors hover:bg-[#1e1e24]"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[#2a2a32] text-white">S</div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-2 z-40 border border-[#1e1e24] bg-[#121214] animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-[#1e1e24] mb-1">
                      <p className="text-sm font-bold truncate text-white">{user?.email}</p>
                      <Badge variant="outline" className="mt-2 text-[10px] border-emerald-500/30 text-emerald-400">SUPER ADMIN</Badge>
                    </div>
                    <div className="px-2">
                      <Link to="/admin/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-slate-400 hover:bg-[#1e1e24] hover:text-white mb-1">
                        <Settings size={16} className="mr-3" /> Platform Settings
                      </Link>
                      <button 
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut size={16} className="mr-3" /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-0">
          <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-16rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
