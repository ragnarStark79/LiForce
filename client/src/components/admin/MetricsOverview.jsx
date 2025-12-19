import {
  ClockIcon,
  UsersIcon,
  DropletIcon,
  UserIcon,
  CheckIcon,
  AlertIcon
} from '../common/DashboardIcons';

const MetricsOverview = ({ metrics }) => {
  const defaultMetrics = {
    pendingStaff: 0,
    totalStaff: 0,
    activeRequests: 0,
    totalUsers: 0,
    completedRequests: 0,
    lowInventory: 0,
    ...metrics
  };

  const metricCards = [
    { label: 'Pending Staff', value: defaultMetrics.pendingStaff, iconColor: 'warning', Icon: ClockIcon, accentClass: 'warning-accent' },
    { label: 'Total Staff', value: defaultMetrics.totalStaff, iconColor: 'staff-theme', Icon: UsersIcon, accentClass: 'staff-accent' },
    { label: 'Active Requests', value: defaultMetrics.activeRequests, iconColor: 'danger', Icon: DropletIcon, accentClass: 'danger-accent' },
    { label: 'Total Users', value: defaultMetrics.totalUsers, iconColor: 'success', Icon: UserIcon, accentClass: 'success-accent' },
    { label: 'Completed', value: defaultMetrics.completedRequests, iconColor: 'success', Icon: CheckIcon, accentClass: 'success-accent' },
    { label: 'Low Inventory', value: defaultMetrics.lowInventory, iconColor: 'warning', Icon: AlertIcon, accentClass: 'warning-accent' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => (
        <div
          key={index}
          className={`stat-card ${metric.accentClass} animate-scale-in`}
          style={{ animationDelay: `${0.1 + index * 0.05}s` }}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`icon-box ${metric.iconColor} mb-3`}>
              <metric.Icon size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metric.value}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">{metric.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;