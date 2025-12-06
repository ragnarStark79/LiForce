import { createBrowserRouter } from 'react-router-dom';
import { ROLES } from '../utils/constants';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Public Pages
import LandingPage from '../pages/landing/LandingPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterUserPage from '../pages/auth/RegisterUserPage';
import RegisterStaffPage from '../pages/auth/RegisterStaffPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// User Pages
import UserDashboardPage from '../pages/user/UserDashboardPage';
import UserProfilePage from '../pages/user/UserProfilePage';
import UserSettingsPage from '../pages/user/UserSettingsPage';
import UserBloodRequestsPage from '../pages/user/UserBloodRequestsPage';
import UserDonationsPage from '../pages/user/UserDonationsPage';
import UserChatPage from '../pages/user/UserChatPage';
import DonationSchedulePage from '../pages/user/DonationSchedulePage';

// Staff Pages
import StaffDashboardPage from '../pages/staff/StaffDashboardPage';
import StaffProfilePage from '../pages/staff/StaffProfilePage';
import StaffPatientsPage from '../pages/staff/StaffPatientsPage';
import StaffBloodRequestsPage from '../pages/staff/StaffBloodRequestsPage';
import StaffInventoryPage from '../pages/staff/StaffInventoryPage';
import StaffChatPage from '../pages/staff/StaffChatPage';
import StaffDonationSchedulesPage from '../pages/staff/StaffDonationSchedulesPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminStaffApprovalsPage from '../pages/admin/AdminStaffApprovalsPage';
import AdminHospitalsPage from '../pages/admin/AdminHospitalsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },

  // Auth Routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterUserPage />,
      },
      {
        path: 'register-staff',
        element: <RegisterStaffPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },

  // User Dashboard Routes
  {
    path: '/user',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={[ROLES.USER]}>
          <DashboardLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <UserDashboardPage />,
      },
      {
        path: 'profile',
        element: <UserProfilePage />,
      },
      {
        path: 'settings',
        element: <UserSettingsPage />,
      },
      {
        path: 'blood-requests',
        element: <UserBloodRequestsPage />,
      },
      {
        path: 'donations',
        element: <UserDonationsPage />,
      },
      {
        path: 'schedule-donation',
        element: <DonationSchedulePage />,
      },
      {
        path: 'chat',
        element: <UserChatPage />,
      },
    ],
  },

  // Staff Dashboard Routes
  {
    path: '/staff',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={[ROLES.STAFF]}>
          <DashboardLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <StaffDashboardPage />,
      },
      {
        path: 'profile',
        element: <StaffProfilePage />,
      },
      {
        path: 'patients',
        element: <StaffPatientsPage />,
      },
      {
        path: 'blood-requests',
        element: <StaffBloodRequestsPage />,
      },
      {
        path: 'inventory',
        element: <StaffInventoryPage />,
      },
      {
        path: 'donation-schedules',
        element: <StaffDonationSchedulesPage />,
      },
      {
        path: 'chat',
        element: <StaffChatPage />,
      },
    ],
  },

  // Admin Dashboard Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
          <DashboardLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'staff-approvals',
        element: <AdminStaffApprovalsPage />,
      },
      {
        path: 'hospitals',
        element: <AdminHospitalsPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'settings',
        element: <AdminSettingsPage />,
      },
      {
        path: 'analytics',
        element: <AdminAnalyticsPage />,
      },
    ],
  },
]);

export default router;
