import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, MapPin, QrCode, Users, CalendarClock, 
  Radio, BarChart3, AlertTriangle, Shield, HelpCircle, 
  MessageSquare, Building2, Menu, LogOut, ChevronDown 
} from 'lucide-react';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
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
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 bg-slate-950/50 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 text-white font-semibold text-lg tracking-tight">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <Shield size={18} className="text-white" />
            </div>
            TrackSentra
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    active 
                      ? 'bg-blue-600/10 text-blue-400' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`mr-3 shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} 
                    ${item.highlight ? 'text-blue-500' : ''} 
                    ${item.highlightAlert ? 'text-orange-500' : ''}`} 
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.highlight && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                  {item.highlightAlert && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-white">{user?.firstName?.charAt(0) || user?.email?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Demo Mode Banner */}
        {user?.isDemoUser && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-sm flex items-center justify-between shrink-0 z-20 shadow-md">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              DEMO MODE
            </div>
            <p className="hidden sm:block text-emerald-100 font-medium">You are viewing a read-only demonstration with simulated data.</p>
            <button 
              onClick={handleLogout}
              className="bg-white text-emerald-700 px-3 py-1 rounded text-xs font-bold hover:bg-emerald-50 transition-colors"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
               {menuItems.find(i => i.path === location.pathname)?.name || 'TrackSentra'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium border border-blue-200">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                </div>
                <ChevronDown size={16} className="text-slate-500 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                    </div>
                    <Link to="/company" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Company Settings</Link>
                    <button 
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
