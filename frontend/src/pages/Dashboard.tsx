import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Building2, MapPin, LayoutDashboard, Users, CalendarClock, QrCode, Radio } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-900 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard /> TrackSentra</h1>
            <div className="flex gap-4">
              <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
              <Link to="/sites" className="hover:text-blue-400">Sites</Link>
              <Link to="/checkpoints" className="hover:text-blue-400">Checkpoints</Link>
              <Link to="/guards" className="hover:text-blue-400">Guards</Link>
              <Link to="/shifts" className="hover:text-blue-400">Shifts</Link>
              <Link to="/patrols" className="hover:text-blue-400">Patrols</Link>
              <Link to="/live" className="text-blue-400 font-medium flex items-center gap-1"><Radio size={16} /> Live</Link>
              <Link to="/company" className="hover:text-blue-400">Company</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.email}</span>
            <Button variant="secondary" onClick={() => logout()}>Sign out</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Link to="/sites">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8">
              <MapPin className="w-10 h-10 text-blue-500 mb-4" />
              <h2 className="text-lg font-bold">Sites</h2>
            </Card>
          </Link>

          <Link to="/checkpoints">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8">
              <QrCode className="w-10 h-10 text-purple-500 mb-4" />
              <h2 className="text-lg font-bold">Checkpoints</h2>
            </Card>
          </Link>

          <Link to="/guards">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8">
              <Users className="w-10 h-10 text-green-500 mb-4" />
              <h2 className="text-lg font-bold">Guards</h2>
            </Card>
          </Link>

          <Link to="/shifts">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8">
              <CalendarClock className="w-10 h-10 text-orange-500 mb-4" />
              <h2 className="text-lg font-bold">Shifts</h2>
            </Card>
          </Link>

          <Link to="/company">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8">
              <Building2 className="w-10 h-10 text-indigo-500 mb-4" />
              <h2 className="text-lg font-bold">Company</h2>
            </Card>
          </Link>

          <Link to="/patrols">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8">
              <LayoutDashboard className="w-10 h-10 text-red-500 mb-4" />
              <h2 className="text-lg font-bold">Patrols</h2>
            </Card>
          </Link>

          <Link to="/live">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8 border-t-4 border-t-blue-500 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <Radio className="w-10 h-10 text-blue-500 mb-4" />
              <h2 className="text-lg font-bold">Live Monitoring</h2>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};
