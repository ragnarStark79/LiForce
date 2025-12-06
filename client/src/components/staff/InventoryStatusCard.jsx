import Card from '../common/Card';
import Badge from '../common/Badge';

const InventoryStatusCard = ({ inventory }) => {
  const getStockStatus = (units, threshold) => {
    if (units <= threshold) return { label: 'Critical', color: 'danger' };
    if (units <= threshold * 2) return { label: 'Low', color: 'warning' };
    return { label: 'Good', color: 'success' };
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getInventoryData = (bloodGroup) => {
    const item = inventory?.find(i => i.bloodGroup === bloodGroup);
    return item || { unitsAvailable: 0, lowStockThreshold: 10 };
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Blood Inventory Status</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bloodGroups.map((bloodGroup) => {
          const data = getInventoryData(bloodGroup);
          const status = getStockStatus(data.unitsAvailable, data.lowStockThreshold);
          
          return (
            <div
              key={bloodGroup}
              className="p-4 rounded-lg border border-neutral-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl font-bold text-red-600 mb-2">{bloodGroup}</div>
              <div className="text-3xl font-bold text-neutral-800 mb-2">
                {data.unitsAvailable}
              </div>
              <p className="text-xs text-neutral-500 mb-2">units available</p>
              <Badge variant={status.color}>{status.label}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InventoryStatusCard;