// filepath: /Users/ragnar/Documents/1_Sem_5 Dev_React_node/Full Stack RNODE/LifeForce/client/src/components/admin/ProfileUpdateApprovalTable.jsx
import { useState } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ProfileUpdateApprovalTable = ({ updates, onApprove, onReject, loading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getChangedFields = (current, pending) => {
    const changes = [];
    if (pending.name && pending.name !== current.name) {
      changes.push({ field: 'Name', from: current.name, to: pending.name });
    }
    if (pending.email && pending.email !== current.email) {
      changes.push({ field: 'Email', from: current.email, to: pending.email });
    }
    if (pending.phone && pending.phone !== current.phone) {
      changes.push({ field: 'Phone', from: current.phone, to: pending.phone });
    }
    if (pending.bloodGroup && pending.bloodGroup !== current.bloodGroup) {
      changes.push({ field: 'Blood Group', from: current.bloodGroup || 'Not set', to: pending.bloodGroup });
    }
    if (pending.staffPosition && pending.staffPosition !== current.staffPosition) {
      changes.push({ field: 'Position', from: current.staffPosition || 'Not set', to: pending.staffPosition });
    }
    if (pending.department && pending.department !== current.department) {
      changes.push({ field: 'Department', from: current.department || 'Not set', to: pending.department });
    }
    return changes;
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

  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No pending profile update requests.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {updates.map((member) => {
          const changes = getChangedFields(member, member.pendingProfileUpdate || {});
          
          return (
            <div key={member._id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="md" />
                  <div>
                    <h4 className="font-semibold text-neutral-800">{member.name}</h4>
                    <p className="text-sm text-neutral-500">
                      {member.staffId || 'No Staff ID'} • {member.staffPosition || 'No Position'}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Hospital: {member.hospitalId?.name || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="warning">Pending Review</Badge>
                  <p className="text-xs text-neutral-400 mt-1">
                    Requested: {formatDate(member.pendingProfileUpdate?.requestedAt)}
                  </p>
                </div>
              </div>

              {/* Reason for update */}
              {member.pendingProfileUpdate?.reason && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Reason:</span> {member.pendingProfileUpdate.reason}
                  </p>
                </div>
              )}

              {/* Changes Table */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-neutral-700 mb-2">Requested Changes:</h5>
                {changes.length > 0 ? (
                  <div className="bg-neutral-50 rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="px-3 py-2 text-left font-medium text-neutral-600">Field</th>
                          <th className="px-3 py-2 text-left font-medium text-neutral-600">Current Value</th>
                          <th className="px-3 py-2 text-left font-medium text-neutral-600">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {changes.map((change, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-medium text-neutral-700">{change.field}</td>
                            <td className="px-3 py-2 text-neutral-500 line-through">{change.from}</td>
                            <td className="px-3 py-2 text-success-600 font-medium">{change.to}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 italic">No visible changes detected</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onApprove?.(member._id)}
                  disabled={loading}
                >
                  ✓ Approve Changes
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
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Reject Profile Update</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Please provide a reason for rejecting this profile update request. This will be visible to the staff member.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
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

export default ProfileUpdateApprovalTable;
