import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';

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

  const stats = [
    { 
      label: 'Total Donations', 
      value: dashboardData.stats.totalDonations, 
      icon: '🩸',
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50'
    },
    { 
      label: 'Blood Requests', 
      value: dashboardData.stats.totalRequests, 
      icon: '📋',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    { 
      label: 'Lives Impacted', 
      value: dashboardData.stats.livesImpacted, 
      icon: '❤️',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50'
    },
  ];

  const quickActions = [
    { label: 'Request Blood', icon: '🩸', path: '/user/blood-requests', gradient: 'from-red-500 to-rose-600' },
    { label: 'Schedule Donation', icon: '📅', path: '/user/schedule-donation', gradient: 'from-emerald-500 to-teal-600' },
    { label: 'My Donations', icon: '💝', path: '/user/donations', gradient: 'from-pink-500 to-rose-600' },
    { label: 'Messages', icon: '💬', path: '/user/chat', gradient: 'from-blue-500 to-indigo-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-rose-500 to-pink-600 p-8 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-float" 
               style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-rose-300/20 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full 
                             text-white/90 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Active Donor
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-white/80 text-lg">
                Thank you for being a lifesaver. Here's your donation journey.
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <p className="text-white/70 text-sm">Blood Type</p>
                <p className="text-2xl font-bold text-white">{user?.bloodGroup || 'Not Set'}</p>
              </div>
              <button 
                onClick={() => navigate('/user/profile')}
                className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                View Profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} 
                       p-6 border border-gray-100 shadow-lg hover:shadow-xl 
                       transform transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] group`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} 
                            opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 
                            group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} 
                             flex items-center justify-center text-2xl mb-4 shadow-lg
                             group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <p className="text-4xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Eligibility Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg">
        <div className={`absolute top-0 left-0 w-2 h-full ${eligibility.canDonate ? 'bg-gradient-to-b from-green-500 to-emerald-600' : 'bg-gradient-to-b from-orange-500 to-amber-600'}`} />
        
        <div className="p-6 pl-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                             ${eligibility.canDonate 
                               ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                               : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                {eligibility.canDonate ? '✅' : '⏳'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Donation Eligibility</h3>
                <p className={`text-xl font-semibold mt-1 
                             ${eligibility.canDonate ? 'text-green-600' : 'text-orange-600'}`}>
                  {eligibility.message}
                </p>
                {dashboardData.lastDonation && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last donation: {formatDate(dashboardData.lastDonation.donationDate)}
                  </p>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/user/schedule-donation')}
              disabled={!eligibility.canDonate}
              className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg
                         transform transition-all duration-300 hover:scale-105 hover:-translate-y-1
                         ${eligibility.canDonate 
                           ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/30' 
                           : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Schedule Donation
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} 
                         p-6 text-white shadow-lg hover:shadow-xl
                         transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 group`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              <div className="relative z-10 text-center">
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </span>
                <span className="font-semibold text-sm">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">📋</span> Active Blood Requests
            </h3>
            <button 
              onClick={() => navigate('/user/blood-requests')}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold 
                        flex items-center gap-1 transition-colors"
            >
              View All →
            </button>
          </div>
        </div>

        <div className="p-6">
          {dashboardData.activeRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 
                             flex items-center justify-center text-4xl">
                📭
              </div>
              <p className="text-gray-500 font-medium">No active requests</p>
              <p className="text-gray-400 text-sm mt-1">Your blood requests will appear here</p>
              <button 
                onClick={() => navigate('/user/blood-requests')}
                className="mt-4 px-6 py-2 bg-primary-100 text-primary-600 rounded-xl font-semibold
                          hover:bg-primary-200 transition-colors"
              >
                Create Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.activeRequests.slice(0, 3).map((request, index) => (
                <div 
                  key={request._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white
                            border border-gray-100 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 
                                   flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {request.bloodGroup}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {request.unitsRequired} units needed
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.hospitalId?.name || 'Hospital pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                    ${request.urgency === 'CRITICAL' 
                                      ? 'bg-red-100 text-red-600' 
                                      : request.urgency === 'HIGH'
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-blue-100 text-blue-600'}`}>
                      {request.urgency}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                    ${request.status === 'COMPLETED' 
                                      ? 'bg-green-100 text-green-600' 
                                      : request.status === 'CANCELLED'
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-yellow-100 text-yellow-600'}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💡</span> Donation Tips
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '💧', tip: 'Stay hydrated - drink plenty of water before donating' },
            { icon: '🍎', tip: 'Eat iron-rich foods like spinach and red meat' },
            { icon: '😴', tip: 'Get a good night\'s sleep before your appointment' },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 bg-white/60 rounded-xl p-4">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-gray-700 text-sm">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
