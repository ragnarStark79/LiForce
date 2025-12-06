import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MetricsOverview from '../../components/admin/MetricsOverview';
import StaffApprovalTable from '../../components/admin/StaffApprovalTable';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { adminService } from '../../services/adminService';

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

  const quickActions = [
    { label: 'Staff Approvals', icon: '👥', path: '/admin/staff-approvals', gradient: 'from-blue-500 to-indigo-600', count: pendingStaff.length },
    { label: 'Hospitals', icon: '🏥', path: '/admin/hospitals', gradient: 'from-emerald-500 to-teal-600' },
    { label: 'All Users', icon: '👤', path: '/admin/users', gradient: 'from-purple-500 to-violet-600' },
    { label: 'Analytics', icon: '📊', path: '/admin/analytics', gradient: 'from-pink-500 to-rose-600' },
    { label: 'Settings', icon: '⚙️', path: '/admin/settings', gradient: 'from-gray-500 to-slate-600' },
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-8 shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-300/20 rounded-full blur-3xl animate-float" 
               style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-300/20 rounded-full blur-2xl animate-pulse" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full 
                             text-white/90 text-sm font-medium mb-4">
                <span className="text-lg">👑</span>
                Administrator
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Admin Control Center
              </h1>
              <p className="text-white/80 text-lg">
                Welcome back, {user?.name}
              </p>
              <p className="text-white/60 text-sm mt-1">
                Managing the LifeForce blood donation network
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalUsers || 0}</p>
                  <p className="text-white/70 text-xs">Total Users</p>
                </div>
                <div className="px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalStaff || 0}</p>
                  <p className="text-white/70 text-xs">Staff Members</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/settings')}
                className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                System Settings →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview metrics={stats} />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} 
                         p-5 text-white shadow-lg hover:shadow-xl
                         transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 group`}
            >
              {action.count > 0 && (
                <span className="absolute top-2 right-2 w-6 h-6 bg-white text-gray-800 rounded-full 
                               flex items-center justify-center text-xs font-bold animate-pulse">
                  {action.count}
                </span>
              )}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              <div className="relative z-10 text-center">
                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </span>
                <span className="font-semibold text-sm">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Staff Approvals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 
                             flex items-center justify-center text-white text-lg">
                👥
              </span>
              Pending Staff Approvals
              {pendingStaff.length > 0 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                  {pendingStaff.length} pending
                </span>
              )}
            </h3>
            <Link to="/admin/staff-approvals">
              <button className="px-4 py-2 bg-primary-100 text-primary-600 rounded-xl font-semibold text-sm
                                hover:bg-primary-200 transition-colors flex items-center gap-1">
                View All →
              </button>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {pendingStaff.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 
                             flex items-center justify-center text-4xl">
                ✅
              </div>
              <p className="text-gray-500 font-medium">No pending approvals</p>
              <p className="text-gray-400 text-sm mt-1">All staff applications have been processed</p>
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 
                             flex items-center justify-center text-white text-lg">
                🩸
              </span>
              Blood Inventory Overview
            </h3>
            <Link to="/admin/analytics">
              <button className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-semibold text-sm
                                hover:bg-red-200 transition-colors flex items-center gap-1">
                View Analytics →
              </button>
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {bloodGroups.map((bg, index) => (
              <div 
                key={bg}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 
                          p-4 text-center border border-red-100 hover:shadow-lg 
                          transform transition-all duration-300 hover:scale-105 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 opacity-0 
                               group-hover:opacity-10 transition-opacity duration-300" />
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 
                               flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {bg}
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats[`blood_${bg.replace('+', 'pos').replace('-', 'neg')}`] || 0}</p>
                <p className="text-xs text-gray-500 mt-1">units</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🖥️</span> System Status
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Server Status', value: 'Online', icon: '🟢', status: 'good' },
            { label: 'Database', value: 'Connected', icon: '💾', status: 'good' },
            { label: 'API Response', value: '45ms', icon: '⚡', status: 'good' },
            { label: 'Active Sessions', value: stats.activeSessions || '24', icon: '👥', status: 'normal' },
          ].map((item, index) => (
            <div key={index} className="bg-white/80 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
                             ${item.status === 'good' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{item.value}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;