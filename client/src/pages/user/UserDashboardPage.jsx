import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardData] = useState({
    nextEligibleDate: null,
    lastDonation: null,
    activeRequests: [],
    stats: {
      totalDonations: 0,
      totalRequests: 0,
      livesImpacted: 0,
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-neutral-600 mt-2">
          Thank you for being a lifesaver. Here's your donation journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-4xl font-bold text-red-600">
            {dashboardData.stats.totalDonations}
          </div>
          <p className="text-neutral-600 mt-2">Total Donations</p>
        </Card>

        <Card className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            {dashboardData.stats.totalRequests}
          </div>
          <p className="text-neutral-600 mt-2">Blood Requests</p>
        </Card>

        <Card className="text-center">
          <div className="text-4xl font-bold text-purple-600">
            {dashboardData.stats.livesImpacted}
          </div>
          <p className="text-neutral-600 mt-2">Lives Impacted</p>
        </Card>
      </div>

      {/* Eligibility Status */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Donation Eligibility
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-700">Next eligible donation date:</p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              You can donate now!
            </p>
          </div>
          <Button variant="primary">Schedule Donation</Button>
        </div>
      </Card>

      {/* Active Requests */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            Active Blood Requests
          </h3>
          <Button variant="secondary" size="sm">View All</Button>
        </div>

        {dashboardData.activeRequests.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">
            No active requests
          </p>
        ) : (
          <div className="space-y-3">
            {dashboardData.activeRequests.map((request) => (
              <div 
                key={request._id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-neutral-800">
                    {request.bloodGroup} - {request.unitsRequired} units
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {request.hospitalName}
                  </p>
                </div>
                <Badge variant={
                  request.urgency === 'CRITICAL' ? 'danger' : 
                  request.urgency === 'HIGH' ? 'warning' : 'default'
                }>
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="primary" fullWidth>
            🩸 Request Blood
          </Button>
          <Button variant="secondary" fullWidth>
            💝 Schedule Donation
          </Button>
          <Button variant="secondary" fullWidth>
            🏥 Find Hospitals
          </Button>
          <Button variant="secondary" fullWidth>
            💬 Contact Support
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserDashboardPage;
