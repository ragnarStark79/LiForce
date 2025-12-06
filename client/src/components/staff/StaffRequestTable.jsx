import Badge from '../common/Badge';
import Button from '../common/Button';

const StaffRequestTable = ({ requests, onAssign, onUpdateStatus }) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'IN_PROGRESS': return 'primary';
      case 'ASSIGNED': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No blood requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-neutral-50 text-left">
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Blood Group</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Units</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Urgency</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Status</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Requester</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Date</th>
            <th className="px-4 py-3 text-sm font-medium text-neutral-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {requests.map((request) => (
            <tr key={request._id} className="hover:bg-neutral-50">
              <td className="px-4 py-3">
                <span className="text-lg font-bold text-red-600">{request.bloodGroup}</span>
              </td>
              <td className="px-4 py-3 text-neutral-700">{request.unitsRequired}</td>
              <td className="px-4 py-3">
                <Badge variant={getUrgencyColor(request.urgency)}>{request.urgency}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
              </td>
              <td className="px-4 py-3 text-neutral-700">
                {request.requesterId?.name || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-500">
                {formatDate(request.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {request.status === 'PENDING' && (
                    <Button size="sm" variant="primary" onClick={() => onAssign?.(request._id)}>
                      Assign
                    </Button>
                  )}
                  {request.status === 'ASSIGNED' && (
                    <Button size="sm" variant="secondary" onClick={() => onUpdateStatus?.(request._id, 'IN_PROGRESS')}>
                      Start
                    </Button>
                  )}
                  {request.status === 'IN_PROGRESS' && (
                    <Button size="sm" variant="success" onClick={() => onUpdateStatus?.(request._id, 'COMPLETED')}>
                      Complete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffRequestTable;