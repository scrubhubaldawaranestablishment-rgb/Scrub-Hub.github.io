import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AppSettingsProvider } from '@/lib/AppSettingsContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Role-aware root redirect
import RoleRedirect from '@/components/RoleRedirect';

// Internal pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import VendorSuccessDashboard from './pages/VendorSuccessDashboard';
import ClientSuccessDashboard from './pages/ClientSuccessDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import TicketingSystem from './pages/TicketingSystem';
import WorkOrderSystem from './pages/WorkOrderSystem';
import ClientManagement from './pages/ClientManagement';
import VendorManagement from './pages/VendorManagement';
import ComplianceSystem from './pages/ComplianceSystem';
import SLAMonitor from './pages/SLAMonitor';
import ReportingSystem from './pages/ReportingSystem';
import NotificationsSystem from './pages/NotificationsSystem';
import ClientPortal from './pages/ClientPortal';
import VendorPortal from './pages/VendorPortal';
import ServiceRequests from './pages/ServiceRequests';
import Settings from './pages/Settings';
import VendorPayments from './pages/VendorPayments';
import WaitingActivation from './pages/WaitingActivation';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0f1420' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 0 24px rgba(6,182,212,0.4)' }}>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>Loading NOSSCO...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Public auth routes — no layout wrapper */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<AppLayout />}>
        {/* Root → role-aware redirect */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Super Admin */}
        <Route path="/admin" element={<SuperAdminDashboard />} />

        {/* Internal staff dashboards */}
        <Route path="/operations" element={<OperationsDashboard />} />
        <Route path="/vendor-success" element={<VendorSuccessDashboard />} />
        <Route path="/client-success" element={<ClientSuccessDashboard />} />
        <Route path="/finance" element={<FinanceDashboard />} />

        {/* Shared operational modules */}
        <Route path="/service-requests" element={<ServiceRequests />} />
        <Route path="/tickets" element={<TicketingSystem />} />
        <Route path="/work-orders" element={<WorkOrderSystem />} />
        <Route path="/clients" element={<ClientManagement />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/compliance" element={<ComplianceSystem />} />
        <Route path="/sla" element={<SLAMonitor />} />
        <Route path="/reports" element={<ReportingSystem />} />
        <Route path="/notifications" element={<NotificationsSystem />} />

        {/* External portals */}
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/vendor-portal" element={<VendorPortal />} />

        {/* Waiting activation */}
        <Route path="/waiting-activation" element={<WaitingActivation />} />

        {/* Admin-only */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/vendor-payments" element={<VendorPayments />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </AppSettingsProvider>
  );
}

export default App;