import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StaffApprovalTable from '../../components/admin/StaffApprovalTable';
import ProfileUpdateApprovalTable from '../../components/admin/ProfileUpdateApprovalTable';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../components/common/NotificationSystem';

const AdminStaffApprovalsPage = () => {
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'profile'
  const [loading, setLoading] = useState(true);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [pendingProfileUpdates, setPendingProfileUpdates] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [staffData, profileData] = await Promise.all([
        adminService.getPendingStaff(),
        adminService.getPendingProfileUpdates()
      ]);
      setPendingStaff(staffData.staff || []);
      setPendingProfileUpdates(profileData.updates || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      notify.error('Failed to load approval data');
    } finally {
      setLoading(false);
    }
  };

  // Staff Login Approval Handlers
  const handleApproveStaff = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.approveStaff(staffId);
      notify.approval('Staff member has been approved and can now access the system!');
      fetchAllData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to approve staff');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectStaff = async (staffId, reason) => {
    try {
      setActionLoading(true);
      await adminService.rejectStaff(staffId, reason);
      notify.warning('Staff registration has been rejected');
      fetchAllData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to reject staff');
    } finally {
      setActionLoading(false);
    }
  };

  // Profile Update Approval Handlers
  const handleApproveProfileUpdate = async (staffId) => {
    try {
      setActionLoading(true);
      await adminService.approveProfileUpdate(staffId);
      notify.approval('Profile update has been approved and changes applied!');
      fetchAllData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to approve profile update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProfileUpdate = async (staffId, reason) => {
    try {
      setActionLoading(true);
      await adminService.rejectProfileUpdate(staffId, reason);
      notify.warning('Profile update request has been rejected');
      fetchAllData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to reject profile update');
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
        <h1 className="text-3xl font-bold text-neutral-800">Staff Approvals</h1>
        <p className="text-neutral-600 mt-2">Review and approve staff registrations and profile updates</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('login')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'login'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
        >
          <span>🔐</span>
          Staff Login Approvals
          {pendingStaff.length > 0 && (
            <span className="bg-warning-100 text-warning-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingStaff.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
        >
          <span>📝</span>
          Profile Update Requests
          {pendingProfileUpdates.length > 0 && (
            <span className="bg-warning-100 text-warning-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingProfileUpdates.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'login' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">Staff Login Approval Requests</h3>
              <p className="text-sm text-neutral-500 mt-1">Newly registered staff waiting for approval to access the system</p>
            </div>
            <Badge variant="warning">{pendingStaff.length} Pending</Badge>
          </div>
          {pendingStaff.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <span className="text-4xl mb-4 block">✅</span>
              <p className="text-lg font-medium">No pending staff registrations</p>
              <p className="text-sm mt-1">All staff registration requests have been processed</p>
            </div>
          ) : (
            <StaffApprovalTable
              staff={pendingStaff}
              onApprove={handleApproveStaff}
              onReject={handleRejectStaff}
              loading={actionLoading}
            />
          )}
        </Card>
      )}

      {activeTab === 'profile' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">Staff Profile Update Requests</h3>
              <p className="text-sm text-neutral-500 mt-1">Profile changes submitted by staff members awaiting approval</p>
            </div>
            <Badge variant="warning">{pendingProfileUpdates.length} Pending</Badge>
          </div>
          {pendingProfileUpdates.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <span className="text-4xl mb-4 block">✅</span>
              <p className="text-lg font-medium">No pending profile updates</p>
              <p className="text-sm mt-1">All profile update requests have been processed</p>
            </div>
          ) : (
            <ProfileUpdateApprovalTable
              updates={pendingProfileUpdates}
              onApprove={handleApproveProfileUpdate}
              onReject={handleRejectProfileUpdate}
              loading={actionLoading}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminStaffApprovalsPage;