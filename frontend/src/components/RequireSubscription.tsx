
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const RequireSubscription = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super admins don't need a subscription
  if (user.role === 'SUPER_ADMIN') {
    return <Outlet />;
  }

  // Demo users can view things (read-only)
  if (user.isDemoUser) {
    return <Outlet />;
  }

  // If a company admin doesn't have an active subscription, prompt them
  const isActive = user.subscription?.status === 'ACTIVE';

  if (!isActive) {
    // Redirect to subscription page to update payment details
    return <Navigate to="/subscription" replace />;
  }

  return <Outlet />;
};
