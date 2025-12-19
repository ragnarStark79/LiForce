import { DropletIcon } from '../common/DashboardIcons';

const InventoryStatusCard = ({ inventory }) => {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getInventoryData = (bloodGroup) => {
    const item = inventory?.find(i => i.bloodGroup === bloodGroup);
    return item || { unitsAvailable: 0 };
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
      {bloodGroups.map((bloodGroup, index) => {
        const data = getInventoryData(bloodGroup);
        const units = data.unitsAvailable;
        const isCritical = units === 0;
        const isLow = units > 0 && units < 5;

        return (
          <div
            key={bloodGroup}
            className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center animate-scale-in border transition-all hover:scale-105
                      ${isCritical ? 'bg-red-50 border-red-100 text-red-600' :
                isLow ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                  'bg-slate-50 border-slate-100 text-slate-700'}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`text-lg md:text-2xl font-bold leading-none mb-1`}>
              {units}
            </div>
            <div className={`text-[10px] md:text-xs font-bold uppercase px-1.5 rounded-md
                          ${isCritical ? 'bg-red-100' : 'bg-white shadow-sm'}`}>
              {bloodGroup}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryStatusCard;
