
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
  if (!user.subscription) {
    // If they have no subscription at all, force them to select a plan
    return <Navigate to="/pricing" replace />;
  }

  if (user.subscription.status !== 'ACTIVE') {
    // If they have a subscription but it's not active (e.g., PENDING_PAYMENT), go to verification page
    return <Navigate to="/subscription" replace />;
  }

  return <Outlet />;
};
