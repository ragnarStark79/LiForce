import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MetricsOverview from '../../components/admin/MetricsOverview';
import StaffApprovalTable from '../../components/admin/StaffApprovalTable';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { adminService } from '../../services/adminService';
import {
  UsersIcon,
  HospitalIcon,
  UserIcon,
  ChartIcon,
  SettingsIcon,
  DropletIcon,
  ArrowRightIcon,
  CheckIcon,
  ServerIcon,
  ZapIcon,
  ActivityIcon
} from '../../components/common/DashboardIcons';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pendingStaff, setPendingStaff] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, staffData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getPendingStaff()
      ]);
      setStats(dashboardData.stats || {});
      setPendingStaff(staffData.staff || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStaff = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.approveStaff(staffId);
      notify.approval('Staff member has been approved successfully!');
      fetchDashboardData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to approve staff');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectStaff = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.rejectStaff(staffId);
      notify.info('Staff application has been rejected');
      fetchDashboardData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to reject staff');
    } finally {
      setActionLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickActions = [
    { label: 'Approvals', icon: UsersIcon, path: '/admin/staff-approvals', count: pendingStaff.length, color: 'warning' },
    { label: 'Hospitals', icon: HospitalIcon, path: '/admin/hospitals', color: 'info' },
    { label: 'Users', icon: UserIcon, path: '/admin/users', color: 'success' },
    { label: 'Analytics', icon: ChartIcon, path: '/admin/analytics', color: 'admin-theme' },
    { label: 'Settings', icon: SettingsIcon, path: '/admin/settings', color: 'staff-theme' },
  ];

  const systemStatus = [
    { label: 'Server', value: 'Online', status: 'online', icon: ServerIcon },
    { label: 'Database', value: 'Connected', status: 'online', icon: ActivityIcon },
    { label: 'API', value: '45ms', status: 'online', icon: ZapIcon },
    { label: 'Sessions', value: stats.activeSessions || '24', status: 'normal', icon: UsersIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-up">
        <div className="dashboard-header" style={{ marginBottom: 0 }}>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Total Users</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{stats.totalStaff || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Total Staff</p>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="animate-fade-up delay-1">
        <MetricsOverview metrics={stats} />
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-up delay-2">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="quick-action relative"
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              {action.count > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 
                                  text-white rounded-full flex items-center justify-center text-xs font-bold
                                  shadow-lg shadow-red-500/30 animate-pulse">
                  {action.count}
                </span>
              )}
              <div className={`quick-action-icon icon-box ${action.color}`}>
                <action.icon size={20} />
              </div>
              <span className="quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Staff Approvals */}
      <div className="glass-card-solid overflow-hidden animate-fade-up delay-3">
        <div className="px-5 py-4 border-b border-gray-100/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="section-title">
              <UsersIcon size={20} className="text-purple-500" />
              Pending Staff Approvals
            </h3>
            {pendingStaff.length > 0 && (
              <span className="status-badge pending">
                {pendingStaff.length} pending
              </span>
            )}
          </div>
          <Link to="/admin/staff-approvals" className="section-link">
            View all <ArrowRightIcon size={16} />
          </Link>
        </div>
        <div className="p-5">
          {pendingStaff.length === 0 ? (
            <div className="empty-state">
              <CheckIcon size={48} className="empty-state-icon text-emerald-300" />
              <p className="empty-state-text">No pending approvals</p>
            </div>
          ) : (
            <StaffApprovalTable
              staff={pendingStaff.slice(0, 5)}
              onApprove={handleApproveStaff}
              onReject={handleRejectStaff}
              loading={actionLoading}
            />
          )}
        </div>
      </div>

      {/* Blood Inventory Overview */}
      <div className="glass-card-solid overflow-hidden animate-fade-up delay-4">
        <div className="px-5 py-4 border-b border-gray-100/80 flex items-center justify-between">
          <h3 className="section-title">
            <DropletIcon size={20} className="text-red-500" />
            Blood Inventory
          </h3>
          <Link to="/admin/analytics" className="section-link">
            Analytics <ArrowRightIcon size={16} />
          </Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {bloodGroups.map((bg, index) => (
              <div
                key={bg}
                className="stat-card text-center p-3 animate-scale-in"
                style={{ animationDelay: `${0.4 + index * 0.05}s` }}
              >
                <div className="blood-badge mx-auto mb-2" style={{ width: '40px', height: '40px', fontSize: '0.75rem' }}>
                  {bg}
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {stats[`blood_${bg.replace('+', 'pos').replace('-', 'neg')}`] || 0}
                </p>
                <p className="text-xs text-gray-400">units</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="glass-card p-5 animate-fade-up delay-5">
        <div className="section-header mb-4">
          <h3 className="section-title">
            <ServerIcon size={20} className="text-indigo-500" />
            System Status
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStatus.map((item, index) => (
            <div
              key={item.label}
              className="bg-white/60 rounded-xl p-4 border border-gray-100/50
                          hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`status-dot ${item.status}`} />
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <div className="icon-box admin-theme" style={{ width: '32px', height: '32px' }}>
                  <item.icon size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;