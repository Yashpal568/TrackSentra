import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, Home, Map, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
export const GuardLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user || user.role !== 'GUARD') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[var(--color-background)] text-[var(--color-text-main)] overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <header className="h-16 shrink-0 bg-[var(--color-surface-sidebar)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">TrackSentra</h1>
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Guard Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full bg-[var(--color-surface-main)] flex items-center justify-center border border-[var(--color-border-subtle)]">
            <Bell size={18} className="text-[var(--color-text-secondary)]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--color-surface-main)]"></span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none"></div>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="h-16 shrink-0 bg-[var(--color-surface-sidebar)] border-t border-[var(--color-border-subtle)] flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-10 pb-safe">
        <NavButton 
          to="/dashboard" 
          icon={Home} 
          label="Home" 
          active={location.pathname === '/dashboard'} 
        />
        <NavButton 
          to="/patrols" 
          icon={Map} 
          label="Patrols" 
          active={location.pathname === '/patrols'} 
        />
        <NavButton 
          to="/profile" 
          icon={User} 
          label="Profile" 
          active={location.pathname === '/profile'} 
        />
      </nav>
    </div>
  );
};

const NavButton = ({ to, icon: Icon, label, active }: any) => {
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
        active ? 'text-emerald-400' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
      }`}
    >
      <Icon size={24} className={active ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''} />
      <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </Link>
  );
};
