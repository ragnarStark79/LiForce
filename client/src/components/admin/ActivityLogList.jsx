import Card from '../common/Card';
import Badge from '../common/Badge';

const ActivityLogList = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'staff_approved': return '✅';
      case 'staff_rejected': return '❌';
      case 'request_created': return '🩸';
      case 'request_completed': return '✓';
      case 'donation_recorded': return '💝';
      case 'inventory_updated': return '📦';
      default: return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'staff_approved': return 'success';
      case 'staff_rejected': return 'danger';
      case 'request_created': return 'primary';
      case 'request_completed': return 'success';
      case 'donation_recorded': return 'secondary';
      case 'inventory_updated': return 'warning';
      default: return 'default';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const actDate = new Date(date);
    const diffMs = now - actDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return actDate.toLocaleDateString();
  };

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
        <p className="text-center text-neutral-500 py-8">No recent activity</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity._id || index} className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0">
            <span className="text-xl">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-800">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getActivityColor(activity.type)} size="sm">
                  {activity.type?.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-neutral-400">{formatTime(activity.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityLogList;