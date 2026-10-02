import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, MapPin, QrCode, Users, CalendarClock, 
  Radio, BarChart3, AlertTriangle, Shield, HelpCircle, 
  MessageSquare, Building2, Menu, LogOut, ChevronDown 
} from 'lucide-react';

export const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
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
    <div className="min-h-screen flex overflow-hidden font-sans bg-background text-text-main selection:bg-emerald-primary/30">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out bg-surface-sidebar border-r border-border-subtle ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 shrink-0 border-b border-border-subtle bg-surface-sidebar">
          <Link to="/dashboard" className="flex items-center gap-2 text-text-main font-semibold text-lg tracking-tight">
            <div className="p-1.5 rounded-lg shadow-lg bg-emerald-primary/20 border border-emerald-primary/30">
              <Shield size={18} className="text-emerald-primary" />
            </div>
            TrackSentra
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-surface-card">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    active 
                      ? 'bg-emerald-primary/10 text-emerald-primary shadow-[inset_2px_0_0_0_rgba(16,185,129,1)]'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-main'
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`mr-3 shrink-0 transition-colors ${
                      active ? 'text-emerald-primary' : 'text-text-muted group-hover:text-text-main'
                    } ${item.highlight ? 'text-emerald-primary' : ''} ${item.highlightAlert ? 'text-warning' : ''}`} 
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.highlight && <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-primary"></span>}
                  {item.highlightAlert && <span className="w-2 h-2 rounded-full bg-warning"></span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border-subtle shrink-0">
          <div className="rounded-xl p-3 flex items-center gap-3 border border-border-subtle bg-surface-main">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-surface-hover text-text-main border border-border-subtle">
              <span className="text-sm font-bold">{user?.firstName?.charAt(0) || user?.email?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-text-main">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs truncate text-text-muted">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Decorative ambient light */}
        <div className="absolute top-0 right-0 w-full max-w-2xl h-96 bg-emerald-primary/5 blur-[120px] pointer-events-none rounded-full"></div>

        {/* Demo Mode Banner */}
        {user?.isDemoUser && (
          <div className="px-4 py-2 text-sm flex items-center justify-between shrink-0 z-20 shadow-md bg-emerald-primary/20 text-text-main border-b border-emerald-primary/30">
            <div className="flex items-center gap-2 font-bold text-emerald-primary">
              <span className="w-2 h-2 rounded-full bg-emerald-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              DEMO MODE
            </div>
            <p className="hidden sm:block opacity-80 font-medium">You are viewing a read-only demonstration with simulated data.</p>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 rounded text-xs font-bold transition-colors bg-emerald-primary text-background hover:bg-emerald-hover"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 bg-surface-sidebar/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-md focus:outline-none text-text-secondary hover:text-text-main"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold hidden sm:block text-text-main">
               {menuItems.find(i => i.path === location.pathname)?.name || 'TrackSentra SOC'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full transition-colors focus:outline-none hover:bg-surface-hover"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold border border-emerald-primary/30 bg-emerald-primary/10 text-emerald-primary">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                </div>
                <ChevronDown size={16} className="hidden sm:block mr-1 text-text-secondary" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 z-20 border border-border-subtle bg-surface-card">
                    <div className="px-4 py-3 border-b border-border-subtle">
                      <p className="text-sm font-bold truncate text-text-main">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs truncate text-text-muted">{user?.email}</p>
                    </div>
                    <Link to="/company" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm transition-colors text-text-secondary hover:bg-surface-hover hover:text-text-main">Company Settings</Link>
                    <button 
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="w-full text-left flex items-center px-4 py-2.5 text-sm transition-colors text-danger hover:bg-danger/10"
                    >
                      <LogOut size={16} className="mr-2" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="mt-16 py-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
             <div>&copy; 2026 TrackSentra Security Operations. All rights reserved.</div>
             <div className="flex gap-4">
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
