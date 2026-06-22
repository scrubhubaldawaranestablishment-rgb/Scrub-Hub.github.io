import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AppSettingsProvider } from '@/lib/AppSettingsContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Layout
import AppLayout from '@/components/layout/AppLayout';
// Role-aware root redirect
import RoleRedirect from '@/components/RoleRedirect';
// Internal pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import VendorSuccessDashboard from './pages/VendorSuccessDashboard';
import ClientSuccessDashboard from './pages/ClientSuccessDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import TicketingSystem from './pages/TicketingSystem';
import WorkOrderSystem from './pages/WorkOrderSystem';
import ClientManagement from './pages/ClientManagement';
import VendorManagement from './pages/VendorManagement';
import ComplianceSystem from './pages/ComplianceSystem';
import SLAMonitor from './pages/SLAMonitor';
import ReportingSystem from './pages/ReportingSystem';
import NotificationsSystem from './pages/NotificationsSystem';
import ClientPortal from './pages/ClientPortal';
import VendorPortal from './pages/VendorPortal';
import ServiceRequests from './pages/ServiceRequests';
import Settings from './pages/Settings';
import VendorPayments from './pages/VendorPayments';
import WaitingActivation from './pages/WaitingActivation';
const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: ' #0f1420' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,  #3B82F6,  #06B6D4)', boxShadow: '0 0 24px  rgba(6,182,212,0.4)' }}>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-sm" style={{ color: ' #64748b' }}>Loading NOSSCO...</p>
        </div>
      </div>
    );
  }