import Card from '../common/Card';

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
    { label: 'Pending Staff', value: defaultMetrics.pendingStaff, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⏳' },
    { label: 'Total Staff', value: defaultMetrics.totalStaff, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
    { label: 'Active Requests', value: defaultMetrics.activeRequests, color: 'text-red-600', bg: 'bg-red-50', icon: '🩸' },
    { label: 'Total Users', value: defaultMetrics.totalUsers, color: 'text-green-600', bg: 'bg-green-50', icon: '👤' },
    { label: 'Completed', value: defaultMetrics.completedRequests, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
    { label: 'Low Inventory', value: defaultMetrics.lowInventory, color: 'text-orange-600', bg: 'bg-orange-50', icon: '⚠️' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => (
        <Card key={index} className={`${metric.bg} border-none`}>
          <div className="text-center">
            <span className="text-2xl">{metric.icon}</span>
            <div className={`text-3xl font-bold ${metric.color} mt-2`}>
              {metric.value}
            </div>
            <p className="text-sm text-neutral-600 mt-1">{metric.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MetricsOverview;