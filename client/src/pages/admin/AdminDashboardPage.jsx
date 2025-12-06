import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MetricsOverview from '../../components/admin/MetricsOverview';
import StaffApprovalTable from '../../components/admin/StaffApprovalTable';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user } = useAuth();
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
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStaff = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.approveStaff(staffId);
      toast.success('Staff approved successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve staff');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectStaff = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.rejectStaff(staffId);
      toast.success('Staff rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject staff');
    } finally {
      setActionLoading(false);
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
        <h1 className="text-3xl font-bold text-neutral-800">Admin Dashboard 👑</h1>
        <p className="text-neutral-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <MetricsOverview metrics={stats} />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            Pending Staff Approvals ({pendingStaff.length})
          </h3>
          <Link to="/admin/staff-approvals">
            <Button variant="secondary" size="sm">View All</Button>
          </Link>
        </div>
        <StaffApprovalTable 
          staff={pendingStaff.slice(0, 5)} 
          onApprove={handleApproveStaff}
          onReject={handleRejectStaff}
          loading={actionLoading}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Blood Inventory</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
            <div key={bg} className="p-4 bg-neutral-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">0</div>
              <p className="text-sm text-neutral-600 mt-1">{bg}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/staff-approvals"><Button variant="primary" fullWidth>👥 Manage Staff</Button></Link>
          <Link to="/admin/hospitals"><Button variant="secondary" fullWidth>🏥 Hospital Settings</Button></Link>
          <Link to="/admin/analytics"><Button variant="secondary" fullWidth>📊 Analytics</Button></Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;