import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StaffRequestTable from '../../components/staff/StaffRequestTable';
import InventoryStatusCard from '../../components/staff/InventoryStatusCard';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { staffService } from '../../services/staffService';

const StaffDashboardPage = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ 
    pending: 0, 
    assigned: 0, 
    completed: 0, 
    critical: 0,
    todayDonations: 0,
    todayDonors: 0,
    todayRequests: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, requestsData, inventoryData] = await Promise.all([
        staffService.getDashboard().catch(() => null),
        staffService.getBloodRequests({ status: 'PENDING' }),
        staffService.getInventory()
      ]);
      
      setRequests(requestsData.requests || []);
      setInventory(inventoryData.inventory || []);
      
      // Use dashboard data if available, otherwise calculate from requests
      if (dashboardData?.stats) {
        setStats({
          pending: dashboardData.stats.pendingRequests || 0,
          assigned: dashboardData.stats.assignedToMe || 0,
          completed: dashboardData.stats.completedToday || 0,
          critical: dashboardData.stats.criticalCases || 0,
          todayDonations: dashboardData.stats.todayDonations || 0,
          todayDonors: dashboardData.stats.todayDonors || 0,
          todayRequests: dashboardData.stats.completedToday || 0
        });
      } else {
        const pending = requestsData.requests?.filter(r => r.status === 'PENDING').length || 0;
        const critical = requestsData.requests?.filter(r => r.urgency === 'CRITICAL').length || 0;
        setStats(prev => ({ ...prev, pending, critical }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRequest = async (requestId) => {
    try {
      await staffService.assignRequest(requestId);
      notify.success('Request assigned to you successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign request:', error);
      notify.error(error.response?.data?.message || 'Failed to assign request');
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await staffService.updateRequestStatus(requestId, status);
      notify.success(`Request status updated to ${status}`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update request status:', error);
      notify.error(error.response?.data?.message || 'Failed to update status');
    }
  };

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
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float" 
               style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-300/20 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full 
                             text-white/90 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                On Duty
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Staff Dashboard 👨‍⚕️
              </h1>
              <p className="text-white/80 text-lg">
                Welcome back, {user?.name}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {user?.staffPosition} • Staff ID: {user?.staffId}
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <p className="text-white/70 text-sm">Hospital</p>
                <p className="text-lg font-bold text-white">{user?.hospitalId?.name || 'Not Assigned'}</p>
              </div>
              <button 
                onClick={() => navigate('/staff/profile')}
                className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                View Profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: stats.pending, icon: '⏳', gradient: 'from-amber-500 to-orange-600', bg: 'from-amber-50 to-orange-50' },
          { label: 'Assigned to Me', value: stats.assigned, icon: '👤', gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50' },
          { label: 'Completed Today', value: stats.completed, icon: '✅', gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50' },
          { label: 'Critical Cases', value: stats.critical, icon: '🚨', gradient: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-50' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${stat.bg} 
                       p-5 border border-gray-100 shadow-lg hover:shadow-xl 
                       transform transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] group cursor-pointer`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.gradient} 
                            opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 
                            group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.gradient} 
                             flex items-center justify-center text-xl mb-3 shadow-lg
                             group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-gray-600 text-sm font-medium mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Blood Requests', icon: '📋', path: '/staff/blood-requests', gradient: 'from-blue-500 to-indigo-600' },
            { label: 'Inventory', icon: '🩸', path: '/staff/inventory', gradient: 'from-red-500 to-rose-600' },
            { label: 'Patients', icon: '🏥', path: '/staff/patients', gradient: 'from-emerald-500 to-teal-600' },
            { label: 'Schedules', icon: '📅', path: '/staff/donation-schedules', gradient: 'from-purple-500 to-violet-600' },
            { label: 'Messages', icon: '💬', path: '/staff/chat', gradient: 'from-pink-500 to-rose-600' },
            { label: 'My Profile', icon: '👤', path: '/staff/profile', gradient: 'from-gray-500 to-slate-600' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${action.gradient} 
                         p-5 text-white shadow-lg hover:shadow-xl
                         transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 group`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              <div className="relative z-10 text-center">
                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </span>
                <span className="font-semibold text-xs">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 
                             flex items-center justify-center text-white text-lg">
                📋
              </span>
              Pending Blood Requests
            </h3>
            <Link to="/staff/blood-requests">
              <button className="px-4 py-2 bg-primary-100 text-primary-600 rounded-xl font-semibold text-sm
                                hover:bg-primary-200 transition-colors flex items-center gap-1">
                View All →
              </button>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 
                             flex items-center justify-center text-4xl">
                ✅
              </div>
              <p className="text-gray-500 font-medium">No pending requests</p>
              <p className="text-gray-400 text-sm mt-1">All caught up! Great work.</p>
            </div>
          ) : (
            <StaffRequestTable 
              requests={requests.slice(0, 5)} 
              onAssign={handleAssignRequest}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </div>
      </div>

      {/* Inventory Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-rose-600 
                             flex items-center justify-center text-white text-lg">
                🩸
              </span>
              Blood Inventory Status
            </h3>
            <Link to="/staff/inventory">
              <button className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-semibold text-sm
                                hover:bg-red-200 transition-colors flex items-center gap-1">
                Manage Inventory →
              </button>
            </Link>
          </div>
        </div>
        <div className="p-6">
          <InventoryStatusCard inventory={inventory} />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span> Today's Summary
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '🩸', label: 'Blood Units Processed', value: stats.todayDonations || '0' },
            { icon: '👥', label: 'Donors Attended', value: stats.todayDonors || '0' },
            { icon: '📝', label: 'Requests Handled', value: stats.todayRequests || '0' },
          ].map((item, index) => (
            <div key={index} className="bg-white/80 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 
                             flex items-center justify-center text-xl">
                {item.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;