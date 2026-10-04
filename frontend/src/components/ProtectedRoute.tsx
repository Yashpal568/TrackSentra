import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AppLayout } from './AppLayout';
import { GuardLayout } from './GuardLayout';
import { AdminLayout } from './AdminLayout';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { user, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-main">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Prevent non-super-admins from accessing /admin/* routes
  if (isAdminRoute && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // Prevent super-admins from accessing company routes
  if (!isAdminRoute && user.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'GUARD') {
    return <GuardLayout />;
  }

  if (user.role === 'SUPER_ADMIN') {
    return <AdminLayout />;
  }

  return <AppLayout />;
};
