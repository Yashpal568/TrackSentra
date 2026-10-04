import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GlobalAlerts } from './components/GlobalAlerts';
import { PublicLayout } from './components/PublicLayout';
import { RequireSubscription } from './components/RequireSubscription';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const HowItWorks = lazy(() => import('./pages/HowItWorks').then(module => ({ default: module.HowItWorks })));
const Features = lazy(() => import('./pages/Features').then(module => ({ default: module.Features })));
const FAQ = lazy(() => import('./pages/FAQ').then(module => ({ default: module.FAQ })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const Privacy = lazy(() => import('./pages/Privacy').then(module => ({ default: module.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then(module => ({ default: module.VerifyEmail })));
const ActivateGuard = lazy(() => import('./pages/ActivateGuard').then(module => ({ default: module.ActivateGuard })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile').then(module => ({ default: module.CompanyProfile })));
const Sites = lazy(() => import('./pages/Sites').then(module => ({ default: module.Sites })));
const SiteDetails = lazy(() => import('./pages/SiteDetails').then(module => ({ default: module.SiteDetails })));
const Guards = lazy(() => import('./pages/Guards').then(module => ({ default: module.Guards })));
const Shifts = lazy(() => import('./pages/Shifts').then(module => ({ default: module.Shifts })));
const Checkpoints = lazy(() => import('./pages/Checkpoints').then(module => ({ default: module.Checkpoints })));
const Patrols = lazy(() => import('./pages/Patrols').then(module => ({ default: module.Patrols })));
const LiveMonitoring = lazy(() => import('./pages/LiveMonitoring').then(module => ({ default: module.LiveMonitoring })));
const PatrolLiveDetails = lazy(() => import('./pages/PatrolLiveDetails').then(module => ({ default: module.PatrolLiveDetails })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Incidents = lazy(() => import('./pages/Incidents').then(module => ({ default: module.Incidents })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then(module => ({ default: module.AuditLogs })));
const GuardQRScanner = lazy(() => import('./pages/GuardQRScanner').then(module => ({ default: module.GuardQRScanner })));
const GuardProfile = lazy(() => import('./pages/guard/GuardProfile').then(module => ({ default: module.GuardProfile })));

const Pricing = lazy(() => import('./pages/Pricing').then(module => ({ default: module.Pricing })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Subscription = lazy(() => import('./pages/Subscription').then(module => ({ default: module.Subscription })));
const AdminPlans = lazy(() => import('./pages/AdminPlans').then(module => ({ default: module.AdminPlans })));
const AdminPayments = lazy(() => import('./pages/AdminPayments').then(module => ({ default: module.AdminPayments })));
const AdminCompanies = lazy(() => import('./pages/AdminCompanies').then(module => ({ default: module.AdminCompanies })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(module => ({ default: module.AdminUsers })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminPlaceholder = lazy(() => import('./pages/AdminPlaceholder').then(module => ({ default: module.AdminPlaceholder })));
const AdminSubscriptions = lazy(() => import('./pages/AdminSubscriptions').then(module => ({ default: module.AdminSubscriptions })));
const AdminRevenue = lazy(() => import('./pages/AdminRevenue').then(module => ({ default: module.AdminRevenue })));
const AdminSystemHealth = lazy(() => import('./pages/AdminSystemHealth').then(module => ({ default: module.AdminSystemHealth })));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications').then(module => ({ default: module.AdminNotifications })));
const AdminAudit = lazy(() => import('./pages/AdminAudit').then(module => ({ default: module.AdminAudit })));
const AdminSecurity = lazy(() => import('./pages/AdminSecurity').then(module => ({ default: module.AdminSecurity })));
const AdminSettings = lazy(() => import('./pages/AdminSettings').then(module => ({ default: module.AdminSettings })));

const SupportTickets = lazy(() => import('./pages/SupportTickets').then(module => ({ default: module.SupportTickets })));
const SupportTicketDetails = lazy(() => import('./pages/SupportTicketDetails').then(module => ({ default: module.SupportTicketDetails })));
const HelpCenter = lazy(() => import('./pages/HelpCenter').then(module => ({ default: module.HelpCenter })));
const HelpArticleView = lazy(() => import('./pages/HelpArticleView').then(module => ({ default: module.HelpArticleView })));
const AdminTickets = lazy(() => import('./pages/AdminTickets').then(module => ({ default: module.AdminTickets })));
const AdminHelpCenter = lazy(() => import('./pages/AdminHelpCenter').then(module => ({ default: module.AdminHelpCenter })));

const SuspenseFallback = () => <div className="flex min-h-screen items-center justify-center">Loading component...</div>;

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center">Loading application...</div>;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/activate-guard" element={<ActivateGuard />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/subscription" element={<Subscription />} />
            
            <Route element={<RequireSubscription />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/company" element={<CompanyProfile />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/sites/:id" element={<SiteDetails />} />
              <Route path="/checkpoints" element={<Checkpoints />} />
              <Route path="/guards" element={<Guards />} />
              <Route path="/shifts" element={<Shifts />} />
              <Route path="/patrols" element={<Patrols />} />
              <Route path="/patrols/:id" element={<PatrolLiveDetails />} />
              <Route path="/guard/scan/:token" element={<GuardQRScanner />} />
              <Route path="/live" element={<LiveMonitoring />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/incidents" element={<Incidents />} />
            </Route>
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/profile" element={<GuardProfile />} />
            <Route path="/tickets" element={<SupportTickets />} />
            <Route path="/tickets/:id" element={<SupportTicketDetails />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/help/:slug" element={<HelpArticleView />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/tickets/:id" element={<SupportTicketDetails />} />
            <Route path="/admin/help" element={<AdminHelpCenter />} />
            
            {/* Admin Routes */}
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/revenue" element={<AdminRevenue />} />
            <Route path="/admin/health" element={<AdminSystemHealth />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/support" element={<AdminPlaceholder title="Support Center" description="Centralized view for managing priority tickets and SLA compliance." />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <GlobalAlerts />
    </BrowserRouter>
  );
}

export default App;
