import { useState } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

const StaffApprovalTable = ({ staff, onApprove, onReject, loading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const handleRejectClick = (staffId) => {
    setShowRejectModal(staffId);
    setRejectReason('');
  };

  const handleConfirmReject = () => {
    if (showRejectModal) {
      onReject?.(showRejectModal, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
    }
  };

  if (!staff || staff.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No pending staff approvals.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 text-left">
              <th className="px-4 py-3 text-sm font-medium text-neutral-600">Staff Member</th>
              <th className="px-4 py-3 text-sm font-medium text-neutral-600">Position</th>
              <th className="px-4 py-3 text-sm font-medium text-neutral-600">Hospital</th>
              <th className="px-4 py-3 text-sm font-medium text-neutral-600">Contact</th>
              <th className="px-4 py-3 text-sm font-medium text-neutral-600">Applied</th>
              <th className="px-4 py-3 text-sm font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {staff.map((member) => (
              <tr key={member._id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" />
                    <div>
                      <span className="font-medium text-neutral-800 block">{member.name}</span>
                      <span className="text-xs text-neutral-500">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <Badge variant="secondary">{member.staffPosition || 'N/A'}</Badge>
                    {member.department && (
                      <p className="text-xs text-neutral-500 mt-1">{member.department}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <p className="text-neutral-800">{member.hospitalId?.name || 'N/A'}</p>
                    {member.hospitalId?.city && (
                      <p className="text-xs text-neutral-500">{member.hospitalId.city}, {member.hospitalId.state}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-600 text-sm">{member.phone || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {formatDate(member.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => onApprove?.(member._id)}
                      disabled={loading}
                    >
                      ✓ Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleRejectClick(member._id)}
                      disabled={loading}
                    >
                      ✕ Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Reject Staff Registration</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Please provide a reason for rejecting this staff registration. This will help the applicant understand the decision.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (optional)..."
              className="w-full border border-neutral-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowRejectModal(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleConfirmReject}
                disabled={loading}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffApprovalTable;