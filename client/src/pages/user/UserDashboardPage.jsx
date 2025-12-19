import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';
import {
  HeartIcon,
  DocumentIcon,
  UsersIcon,
  CalendarIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  DropletIcon,
  GiftIcon,
  ArrowRightIcon
} from '../../components/common/DashboardIcons';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    nextEligibleDate: null,
    lastDonation: null,
    activeRequests: [],
    stats: {
      totalDonations: 0,
      totalRequests: 0,
      livesImpacted: 0,
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await userService.getDashboard();
      setDashboardData({
        nextEligibleDate: data.nextEligibleDate,
        lastDonation: data.lastDonation,
        activeRequests: data.activeRequests || [],
        stats: data.stats || {
          totalDonations: 0,
          totalRequests: 0,
          livesImpacted: 0,
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityMessage = () => {
    if (!dashboardData.nextEligibleDate) {
      return { message: 'You can donate now!', canDonate: true };
    }
    const eligibleDate = new Date(dashboardData.nextEligibleDate);
    const now = new Date();
    if (eligibleDate <= now) {
      return { message: 'You can donate now!', canDonate: true };
    }
    return { message: `Eligible on ${formatDate(dashboardData.nextEligibleDate)}`, canDonate: false };
  };

  const eligibility = getEligibilityMessage();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickActions = [
    { label: 'Request Blood', icon: DropletIcon, path: '/user/blood-requests', color: 'danger' },
    { label: 'Schedule', icon: CalendarIcon, path: '/user/schedule-donation', color: 'user-theme' },
    { label: 'Donations', icon: GiftIcon, path: '/user/donations', color: 'success' },
    { label: 'Messages', icon: ChatIcon, path: '/user/chat', color: 'info' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Welcome Header */}
      <div className="dashboard-header animate-fade-up">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your donation overview and activity</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {/* Total Donations */}
        <div className="stat-card user-accent animate-fade-up delay-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardData.stats.totalDonations}
              </p>
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
            </div>
            <div className="icon-box user-theme">
              <HeartIcon size={22} />
            </div>
          </div>
        </div>

        {/* Total Requests */}
        <div className="stat-card animate-fade-up delay-2" style={{ '--accent': 'var(--staff-gradient)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardData.stats.totalRequests}
              </p>
              <p className="text-sm font-medium text-gray-500">Blood Requests</p>
            </div>
            <div className="icon-box info">
              <DocumentIcon size={22} />
            </div>
          </div>
        </div>

        {/* Lives Impacted */}
        <div className="stat-card success-accent animate-fade-up delay-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardData.stats.livesImpacted}
              </p>
              <p className="text-sm font-medium text-gray-500">Lives Helped</p>
            </div>
            <div className="icon-box success">
              <UsersIcon size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Card */}
      <div className="glass-card p-5 animate-fade-up delay-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`icon-box ${eligibility.canDonate ? 'success' : 'warning'}`}>
              {eligibility.canDonate ? (
                <CheckIcon size={24} />
              ) : (
                <ClockIcon size={24} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Donation Status</h3>
              <p className={`text-sm font-medium ${eligibility.canDonate ? 'text-emerald-600' : 'text-amber-600'}`}>
                {eligibility.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/user/schedule-donation')}
            disabled={!eligibility.canDonate}
            className={`btn-modern ${eligibility.canDonate ? 'primary' : 'secondary'}`}
          >
            <CalendarIcon size={18} />
            Schedule Donation
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-up delay-5">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="quick-action"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className={`quick-action-icon icon-box ${action.color}`}>
                <action.icon size={22} />
              </div>
              <span className="quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Requests */}
      <div className="glass-card-solid overflow-hidden animate-fade-up delay-6">
        <div className="px-5 py-4 border-b border-gray-100/80 flex items-center justify-between">
          <h3 className="section-title">Active Requests</h3>
          <button
            onClick={() => navigate('/user/blood-requests')}
            className="section-link"
          >
            View all <ArrowRightIcon size={16} />
          </button>
        </div>

        <div className="divide-y divide-gray-100/50">
          {dashboardData.activeRequests.length === 0 ? (
            <div className="empty-state">
              <DropletIcon size={48} className="empty-state-icon" />
              <p className="empty-state-text">No active requests</p>
            </div>
          ) : (
            dashboardData.activeRequests.slice(0, 3).map((request) => (
              <div key={request._id} className="list-item mx-4 my-2">
                <div className="flex items-center gap-3">
                  <div className="blood-badge">
                    {request.bloodGroup}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {request.unitsRequired} units needed
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.hospitalId?.name || 'Pending assignment'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`status-badge ${request.urgency === 'CRITICAL' ? 'critical' : 'pending'}`}>
                    {request.urgency === 'CRITICAL' && (
                      <span className="status-dot error" style={{ width: '6px', height: '6px' }} />
                    )}
                    {request.urgency}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Blood Type Card */}
      <div className="glass-card p-5 animate-fade-up delay-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="blood-badge text-lg" style={{ width: '56px', height: '56px', fontSize: '1.125rem' }}>
              {user?.bloodGroup || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Your Blood Type</p>
              <p className="text-xl font-bold text-gray-900">{user?.bloodGroup || 'Not Set'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/profile')}
            className="section-link text-base"
          >
            Edit Profile <ArrowRightIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
