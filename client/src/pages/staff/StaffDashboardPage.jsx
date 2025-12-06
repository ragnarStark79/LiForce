import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StaffRequestTable from '../../components/staff/StaffRequestTable';
import InventoryStatusCard from '../../components/staff/InventoryStatusCard';
import { useAuth } from '../../hooks/useAuth';
import { bloodService } from '../../services/bloodService';

const StaffDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ pending: 0, assigned: 0, completed: 0, critical: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [requestsData, inventoryData] = await Promise.all([
        bloodService.getBloodRequests({ status: 'PENDING' }),
        bloodService.getInventory()
      ]);
      setRequests(requestsData.requests || []);
      setInventory(inventoryData.inventory || []);
      const pending = requestsData.requests?.filter(r => r.status === 'PENDING').length || 0;
      const critical = requestsData.requests?.filter(r => r.urgency === 'CRITICAL').length || 0;
      setStats({ pending, assigned: 0, completed: 0, critical });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Staff Dashboard 👨‍⚕️</h1>
        <p className="text-neutral-600 mt-2">Welcome, {user?.name} - {user?.staffPosition}</p>
        {user?.staffId && <p className="text-sm text-neutral-500">Staff ID: {user.staffId}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-neutral-600 mt-2">Pending Requests</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.assigned}</div>
          <p className="text-neutral-600 mt-2">Assigned to Me</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-neutral-600 mt-2">Completed Today</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          <p className="text-neutral-600 mt-2">Critical Cases</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Pending Blood Requests</h3>
          <Link to="/staff/blood-requests">
            <Button variant="secondary" size="sm">View All</Button>
          </Link>
        </div>
        <StaffRequestTable requests={requests.slice(0, 5)} />
      </Card>

      <InventoryStatusCard inventory={inventory} />

      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/staff/blood-requests"><Button variant="primary" fullWidth>📋 All Requests</Button></Link>
          <Link to="/staff/inventory"><Button variant="secondary" fullWidth>🩸 Inventory</Button></Link>
          <Link to="/staff/chat"><Button variant="secondary" fullWidth>💬 Messages</Button></Link>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboardPage;