import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StaffApprovalTable from '../../components/admin/StaffApprovalTable';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminStaffApprovalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingStaff();
      setPendingStaff(data.staff || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.approveStaff(staffId);
      toast.success('Staff approved successfully!');
      fetchStaffData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.rejectStaff(staffId);
      toast.success('Staff rejected');
      fetchStaffData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Staff Approvals</h1>
        <p className="text-neutral-600 mt-2">Review and approve staff registrations</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Pending Approvals</h3>
          <Badge variant="warning">{pendingStaff.length} Pending</Badge>
        </div>
        <StaffApprovalTable 
          staff={pendingStaff} 
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      </Card>
    </div>
  );
};

export default AdminStaffApprovalsPage;