import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GlobalAlerts } from './components/GlobalAlerts';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile').then(module => ({ default: module.CompanyProfile })));
const Sites = lazy(() => import('./pages/Sites').then(module => ({ default: module.Sites })));
const Guards = lazy(() => import('./pages/Guards').then(module => ({ default: module.Guards })));
const Shifts = lazy(() => import('./pages/Shifts').then(module => ({ default: module.Shifts })));
const Checkpoints = lazy(() => import('./pages/Checkpoints').then(module => ({ default: module.Checkpoints })));
const Patrols = lazy(() => import('./pages/Patrols').then(module => ({ default: module.Patrols })));
const LiveMonitoring = lazy(() => import('./pages/LiveMonitoring').then(module => ({ default: module.LiveMonitoring })));
const PatrolLiveDetails = lazy(() => import('./pages/PatrolLiveDetails').then(module => ({ default: module.PatrolLiveDetails })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Incidents = lazy(() => import('./pages/Incidents').then(module => ({ default: module.Incidents })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then(module => ({ default: module.AuditLogs })));

const Pricing = lazy(() => import('./pages/Pricing').then(module => ({ default: module.Pricing })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Subscription = lazy(() => import('./pages/Subscription').then(module => ({ default: module.Subscription })));
const AdminPlans = lazy(() => import('./pages/AdminPlans').then(module => ({ default: module.AdminPlans })));
const AdminPayments = lazy(() => import('./pages/AdminPayments').then(module => ({ default: module.AdminPayments })));

const SuspenseFallback = () => <div className="flex min-h-screen items-center justify-center">Loading component...</div>;

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading application...</div>;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/company" element={<CompanyProfile />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/checkpoints" element={<Checkpoints />} />
            <Route path="/guards" element={<Guards />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/patrols" element={<Patrols />} />
            <Route path="/patrols/:id" element={<PatrolLiveDetails />} />
            <Route path="/live" element={<LiveMonitoring />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <GlobalAlerts />
    </BrowserRouter>
  );
}

export default App;
