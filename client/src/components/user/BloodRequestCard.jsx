import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const BloodRequestCard = ({ request, onCancel, onViewDetails }) => {
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
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-600">{request.bloodGroup}</span>
            <Badge variant={getUrgencyColor(request.urgency)}>{request.urgency}</Badge>
          </div>
          <p className="text-neutral-600 mt-1">{request.unitsRequired} units needed</p>
        </div>
        <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
      </div>

      <div className="space-y-2 text-sm text-neutral-600">
        <p><span className="font-medium">Hospital:</span> {request.hospitalId?.name || 'N/A'}</p>
        <p><span className="font-medium">Patient:</span> {request.patientName || 'Not specified'}</p>
        <p><span className="font-medium">Requested:</span> {formatDate(request.createdAt)}</p>
        {request.assignedStaffId && (
          <p><span className="font-medium">Assigned to:</span> {request.assignedStaffId.name}</p>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
        <Button variant="outline" size="sm" onClick={() => onViewDetails?.(request)}>
          View Details
        </Button>
        {request.status === 'PENDING' && (
          <Button variant="danger" size="sm" onClick={() => onCancel?.(request._id)}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BloodRequestCard;