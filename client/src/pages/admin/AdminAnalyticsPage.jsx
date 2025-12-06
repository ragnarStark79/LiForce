import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { adminService } from '../../services/adminService';
import { BLOOD_GROUPS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    totalDonations: 0,
    activeUsers: 0,
    requestGrowth: 0,
    donationGrowth: 0,
    userGrowth: 0,
  });
  const [bloodGroupStats, setBloodGroupStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getActivityLogs({ limit: 10 }),
      ]);
      
      setStats({
        totalRequests: statsData.totalRequests || 0,
        completedRequests: statsData.completedRequests || 0,
        totalDonations: statsData.totalDonations || 0,
        activeUsers: statsData.activeUsers || 0,
        requestGrowth: statsData.requestGrowth || 0,
        donationGrowth: statsData.donationGrowth || 0,
        userGrowth: statsData.userGrowth || 0,
      });

      // Calculate blood group statistics
      const bgStats = BLOOD_GROUPS.map(bg => ({
        bloodGroup: bg,
        requests: statsData.requestsByBloodGroup?.[bg] || 0,
        donations: statsData.donationsByBloodGroup?.[bg] || 0,
        inventory: statsData.inventoryByBloodGroup?.[bg] || 0,
      }));
      setBloodGroupStats(bgStats);
      
      setRecentActivity(activityData.logs || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV data
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Requests', stats.totalRequests],
      ['Completed Requests', stats.completedRequests],
      ['Total Donations', stats.totalDonations],
      ['Active Users', stats.activeUsers],
      [''],
      ['Blood Group', 'Requests', 'Donations', 'Inventory'],
      ...bloodGroupStats.map(bg => [bg.bloodGroup, bg.requests, bg.donations, bg.inventory]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeforce-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGrowthIndicator = (growth) => {
    if (growth > 0) return <span className="text-success-600">↑ {growth}%</span>;
    if (growth < 0) return <span className="text-danger-600">↓ {Math.abs(growth)}%</span>;
    return <span className="text-neutral-500">0%</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Analytics & Reports
          </h1>
          <p className="text-neutral-600 mt-2">
            View system-wide statistics and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' },
            ]}
          />
          <Button variant="secondary" onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{stats.totalRequests}</div>
          <p className="text-sm text-neutral-600 mt-2">Total Requests</p>
          <p className="text-xs mt-1">{getGrowthIndicator(stats.requestGrowth)} from last period</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-success-600">{stats.completedRequests}</div>
          <p className="text-sm text-neutral-600 mt-2">Completed Requests</p>
          <p className="text-xs text-success-600 mt-1">
            {stats.totalRequests > 0 
              ? Math.round((stats.completedRequests / stats.totalRequests) * 100) 
              : 0}% success rate
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-secondary-600">{stats.totalDonations}</div>
          <p className="text-sm text-neutral-600 mt-2">Total Donations</p>
          <p className="text-xs mt-1">{getGrowthIndicator(stats.donationGrowth)} from last period</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent-600">{stats.activeUsers}</div>
          <p className="text-sm text-neutral-600 mt-2">Active Users</p>
          <p className="text-xs mt-1">{getGrowthIndicator(stats.userGrowth)} from last period</p>
        </Card>
      </div>

      {/* Blood Group Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Blood Group Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-600">Blood Group</th>
                <th className="text-center py-3 px-4 font-medium text-neutral-600">Requests</th>
                <th className="text-center py-3 px-4 font-medium text-neutral-600">Donations</th>
                <th className="text-center py-3 px-4 font-medium text-neutral-600">Inventory (Units)</th>
                <th className="text-center py-3 px-4 font-medium text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {bloodGroupStats.map((bg) => (
                <tr key={bg.bloodGroup} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <Badge variant="primary">{bg.bloodGroup}</Badge>
                  </td>
                  <td className="text-center py-3 px-4">{bg.requests}</td>
                  <td className="text-center py-3 px-4">{bg.donations}</td>
                  <td className="text-center py-3 px-4">{bg.inventory}</td>
                  <td className="text-center py-3 px-4">
                    {bg.inventory < 5 ? (
                      <Badge variant="danger">Low Stock</Badge>
                    ) : bg.inventory < 10 ? (
                      <Badge variant="warning">Moderate</Badge>
                    ) : (
                      <Badge variant="success">Sufficient</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charts - Visual representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            Blood Group Distribution
          </h3>
          <div className="space-y-3">
            {bloodGroupStats.map((bg) => {
              const maxRequests = Math.max(...bloodGroupStats.map(b => b.requests), 1);
              const percentage = (bg.requests / maxRequests) * 100;
              return (
                <div key={bg.bloodGroup} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-medium text-neutral-700">{bg.bloodGroup}</span>
                  <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{bg.requests}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            Inventory Levels
          </h3>
          <div className="space-y-3">
            {bloodGroupStats.map((bg) => {
              const percentage = Math.min((bg.inventory / 20) * 100, 100);
              let barColor = 'from-success-500 to-success-600';
              if (bg.inventory < 5) barColor = 'from-danger-500 to-danger-600';
              else if (bg.inventory < 10) barColor = 'from-warning-500 to-warning-600';
              
              return (
                <div key={bg.bloodGroup} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-medium text-neutral-700">{bg.bloodGroup}</span>
                  <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r ${barColor} h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{bg.inventory}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Recent Activity
        </h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div 
                key={activity._id || index} 
                className="flex items-start gap-4 p-3 bg-neutral-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600">
                    {activity.action === 'blood_request' && '🩸'}
                    {activity.action === 'donation' && '💉'}
                    {activity.action === 'user_registration' && '👤'}
                    {activity.action === 'staff_approval' && '✅'}
                    {!['blood_request', 'donation', 'user_registration', 'staff_approval'].includes(activity.action) && '📋'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-800">{activity.description}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {formatDate(activity.createdAt)}
                    {activity.user && ` • ${activity.user.firstName} ${activity.user.lastName}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-sm">No recent activity to display</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
