import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CompanyProfile } from './pages/CompanyProfile';
import { Sites } from './pages/Sites';
import { Guards } from './pages/Guards';
import { Shifts } from './pages/Shifts';
import { Checkpoints } from './pages/Checkpoints';
import { Patrols } from './pages/Patrols';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/company" element={<CompanyProfile />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/checkpoints" element={<Checkpoints />} />
          <Route path="/guards" element={<Guards />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/patrols" element={<Patrols />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
