import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, MapPin, QrCode, Users, CalendarClock, 
  Radio, BarChart3, AlertTriangle, Shield, HelpCircle, 
  MessageSquare, Building2, Menu, LogOut, ChevronDown, 
  X, Bell, Search, Settings, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Badge } from './ui/Badge';

export const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? saved === 'true' : true;
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1280) {
      const newState = !desktopSidebarOpen;
      setDesktopSidebarOpen(newState);
      localStorage.setItem('sidebarExpanded', String(newState));
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sites', path: '/sites', icon: MapPin },
    { name: 'Checkpoints', path: '/checkpoints', icon: QrCode },
    { name: 'Guards', path: '/guards', icon: Users },
    { name: 'Shifts', path: '/shifts', icon: CalendarClock },
    { name: 'Patrols', path: '/patrols', icon: LayoutDashboard },
    { name: 'Live', path: '/live', icon: Radio, highlight: true },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle, highlightAlert: true },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Audit', path: '/audit', icon: Shield },
    { name: 'Company', path: '/company', icon: Building2 },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ];

  if (user?.role === 'COMPANY_ADMIN') {
    menuItems.push({ name: 'Billing', path: '/subscription', icon: Building2 });
    menuItems.push({ name: 'Support', path: '/tickets', icon: MessageSquare });
  }

  if (user?.role === 'SUPER_ADMIN') {
    menuItems.push({ name: 'Plans', path: '/admin/plans', icon: LayoutDashboard });
    menuItems.push({ name: 'Payments', path: '/admin/payments', icon: Shield });
    menuItems.push({ name: 'Admin Tickets', path: '/admin/tickets', icon: MessageSquare });
    menuItems.push({ name: 'Manage Help', path: '/admin/help', icon: HelpCircle });
  }

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans bg-background text-text-main selection:bg-emerald-primary/30">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm xl:hidden transition-all duration-300 animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-surface-sidebar border-r border-border-subtle shadow-2xl xl:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0 ${desktopSidebarOpen ? 'w-[280px]' : 'w-[280px] xl:w-[80px]'}`}>
        <div className={`h-16 flex items-center shrink-0 border-b border-border-subtle bg-surface-sidebar overflow-hidden transition-all duration-300 ${desktopSidebarOpen ? 'px-6 justify-between' : 'px-6 xl:px-0 justify-between xl:justify-center'}`}>
          <Link to="/dashboard" className="flex items-center gap-3 text-text-main font-bold text-lg tracking-tight">
            <div className="p-1.5 rounded-lg shadow-inner bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-primary shrink-0">
              <Shield size={20} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${desktopSidebarOpen ? 'opacity-100 w-auto' : 'xl:opacity-0 xl:w-0 xl:hidden'}`}>TrackSentra</span>
          </Link>
          {/* Close Sidebar Button (Mobile Only) */}
          <button 
            onClick={toggleSidebar}
            className="xl:hidden p-1.5 rounded-md text-text-muted hover:bg-surface-hover hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-primary shrink-0"
            aria-label="Toggle sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-surface-card overflow-x-hidden ${desktopSidebarOpen ? 'px-4' : 'px-4 xl:px-3'}`}>
          <p className={`px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 whitespace-nowrap transition-opacity duration-300 ${desktopSidebarOpen ? 'opacity-100' : 'xl:opacity-0 xl:hidden'}`}>Main Navigation</p>
          <div className="space-y-1 relative">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center px-3 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    active 
                      ? 'bg-emerald-primary/10 text-emerald-primary shadow-sm border border-emerald-primary/20'
                      : 'text-text-secondary hover:bg-surface-main hover:text-text-main border border-transparent hover:border-border-subtle'
                  } ${desktopSidebarOpen ? '' : 'xl:justify-center xl:px-0'}`}
                >
                  <Icon 
                    size={18} 
                    className={`shrink-0 transition-colors ${desktopSidebarOpen ? 'mr-3' : 'mr-3 xl:mr-0'} ${
                      active ? 'text-emerald-primary' : 'text-text-muted group-hover:text-text-main'
                    } ${item.highlight ? 'text-emerald-primary' : ''} ${item.highlightAlert ? 'text-warning' : ''}`} 
                  />
                  <span className={`whitespace-nowrap transition-all duration-300 ${desktopSidebarOpen ? 'opacity-100 w-auto' : 'xl:opacity-0 xl:w-0 xl:hidden'}`}>{item.name}</span>
                  {item.highlight && (
                    <span className={`relative flex h-2.5 w-2.5 ${desktopSidebarOpen ? '' : 'xl:absolute xl:top-2 xl:right-2'}`}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-primary"></span>
                    </span>
                  )}
                  {item.highlightAlert && <span className={`w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(234,179,8,0.8)] ${desktopSidebarOpen ? '' : 'xl:absolute xl:top-2 xl:right-2'}`}></span>}
                  
                  {/* Tooltip for collapsed state */}
                  {!desktopSidebarOpen && (
                     <div className="fixed left-[85px] hidden xl:group-hover:block xl:group-focus-visible:block px-2.5 py-1.5 bg-surface-sidebar text-text-main text-xs font-bold rounded border border-border-subtle shadow-xl whitespace-nowrap z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                        {item.name}
                     </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className={`p-4 border-t border-border-subtle shrink-0 bg-surface-sidebar transition-all ${desktopSidebarOpen ? '' : 'xl:p-3 xl:flex xl:justify-center'}`}>
          <div 
            className={`rounded-xl flex items-center gap-3 border border-border-subtle bg-surface-main shadow-sm cursor-pointer hover:border-emerald-primary/50 transition-all group relative ${desktopSidebarOpen ? 'p-3' : 'p-3 xl:p-1 xl:rounded-full xl:bg-transparent xl:border-transparent xl:shadow-none xl:hover:bg-surface-hover'}`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-surface-card text-emerald-primary border border-border-subtle font-black shadow-inner">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden ${desktopSidebarOpen ? 'opacity-100 w-auto' : 'xl:opacity-0 xl:w-0 xl:hidden'}`}>
              <p className="text-sm font-bold truncate text-text-main group-hover:text-emerald-primary transition-colors">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold truncate text-text-muted">{user?.role?.replace('_', ' ')}</p>
            </div>
            
            {/* Tooltip for user profile */}
            {!desktopSidebarOpen && (
              <div className="fixed left-[85px] hidden xl:group-hover:block xl:group-focus-visible:block px-2.5 py-1.5 bg-surface-sidebar text-text-main text-xs font-bold rounded border border-border-subtle shadow-xl whitespace-nowrap z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                {user?.firstName} {user?.lastName} - {user?.role?.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ease-in-out ${desktopSidebarOpen ? 'xl:ml-[280px]' : 'xl:ml-[80px]'}`}>
        {/* Decorative ambient light */}
        <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-emerald-primary/5 blur-[120px] pointer-events-none rounded-full"></div>

        {/* Demo Mode Banner */}
        {user?.isDemoUser && (
          <div className="px-4 py-2.5 text-xs flex items-center justify-between shrink-0 z-30 shadow-md bg-emerald-primary/10 text-emerald-primary border-b border-emerald-primary/20 backdrop-blur-md">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Demo Mode Active
            </div>
            <p className="hidden md:block opacity-80 font-medium">You are viewing a read-only demonstration with simulated data.</p>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-emerald-primary text-background font-bold hover:bg-emerald-hover transition-colors shadow-sm"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Top Navbar */}
        <header className="h-16 border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20 bg-surface-sidebar/90 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={toggleSidebar}
              className="hidden xl:flex p-2 -ml-2 rounded-md focus:outline-none text-text-secondary hover:text-text-main hover:bg-surface-hover transition-colors items-center justify-center"
              aria-label="Toggle menu"
            >
              {desktopSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <button
              onClick={toggleSidebar}
              className="xl:hidden p-2 -ml-2 rounded-md focus:outline-none text-text-secondary hover:text-text-main hover:bg-surface-hover transition-colors items-center justify-center"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold hidden sm:block text-text-main whitespace-nowrap">
               {menuItems.find(i => i.path === location.pathname)?.name || 'TrackSentra SOC'}
            </h2>

            {/* Global Search (Visual Only for UI) */}
            <div className="hidden md:flex ml-8 flex-1 max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-emerald-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search resources, guards, patrols..." 
                className="w-full pl-10 pr-4 py-2 bg-surface-main border border-border-subtle rounded-lg text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition-all shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-medium text-text-muted bg-surface-card border border-border-subtle rounded uppercase">Ctrl K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-4">
            <button className="relative p-2 rounded-full text-text-secondary hover:text-text-main hover:bg-surface-hover transition-colors focus:outline-none hidden sm:block">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-surface-sidebar"></span>
            </button>
            
            <button className="p-2 rounded-full text-text-secondary hover:text-text-main hover:bg-surface-hover transition-colors focus:outline-none hidden sm:block">
              <Settings size={20} />
            </button>

            <div className="h-6 w-px bg-border-subtle hidden sm:block mx-1"></div>

            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full transition-colors focus:outline-none hover:bg-surface-main border border-transparent hover:border-border-subtle"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-surface-main border border-border-subtle shadow-inner">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                </div>
                <ChevronDown size={14} className="text-text-muted" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-2 z-40 border border-border-subtle bg-surface-sidebar animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-border-subtle mb-1 bg-surface-sidebar">
                      <p className="text-sm font-bold truncate text-text-main">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs truncate text-text-muted mt-0.5">{user?.email}</p>
                      <Badge variant="outline" className="mt-2 uppercase text-[10px]">{user?.role?.replace('_', ' ')}</Badge>
                    </div>
                    <div className="px-2">
                      <Link to="/company" onClick={() => setUserMenuOpen(false)} className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-text-secondary hover:bg-surface-main hover:text-text-main mb-1">
                        <Building2 size={16} className="mr-3 text-text-muted" /> Company Settings
                      </Link>
                      <Link to="/help" onClick={() => setUserMenuOpen(false)} className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-text-secondary hover:bg-surface-main hover:text-text-main mb-1">
                        <HelpCircle size={16} className="mr-3 text-text-muted" /> Help Center
                      </Link>
                      <div className="h-px bg-border-subtle my-1 mx-2"></div>
                      <button 
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-danger hover:bg-danger/10"
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-0 h-full w-full">
          <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-16rem)]">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="mt-16 py-6 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-text-muted w-full max-w-[1600px] mx-auto">
             <div>&copy; {new Date().getFullYear()} TrackSentra Security Operations. All rights reserved.</div>
             <div className="flex flex-wrap justify-center gap-4 md:gap-6">
               <Link to="/privacy" className="hover:text-text-main transition-colors">Privacy Policy</Link>
               <Link to="/terms" className="hover:text-text-main transition-colors">Terms of Service</Link>
               <Link to="/help" className="hover:text-text-main transition-colors">Help Center</Link>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
