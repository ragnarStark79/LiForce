import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

const StaffApprovalTable = ({ staff, onApprove, onReject, loading }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (!staff || staff.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No pending staff approvals.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-neutral-50 text-left">
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Staff Member</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Position</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Email</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Phone</th>
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
                  <span className="font-medium text-neutral-800">{member.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="secondary">{member.staffPosition || 'N/A'}</Badge>
              </td>
              <td className="px-4 py-3 text-neutral-600">{member.email}</td>
              <td className="px-4 py-3 text-neutral-600">{member.phone || 'N/A'}</td>
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
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => onReject?.(member._id)}
                    disabled={loading}
                  >
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffApprovalTable;