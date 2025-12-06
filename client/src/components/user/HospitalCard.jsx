import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const HospitalCard = ({ hospital, onSelect }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-neutral-800">{hospital.name}</h3>
        {hospital.hasBloodBank && (
          <Badge variant="success">Blood Bank</Badge>
        )}
      </div>

      <div className="text-sm text-neutral-600 space-y-2">
        <p className="flex items-center gap-2">
          <span>📍</span>
          {hospital.address}, {hospital.city}, {hospital.state}
        </p>
        <p className="flex items-center gap-2">
          <span>📞</span>
          {hospital.phone}
        </p>
        {hospital.email && (
          <p className="flex items-center gap-2">
            <span>✉️</span>
            {hospital.email}
          </p>
        )}
      </div>

      {hospital.departments && hospital.departments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {hospital.departments.slice(0, 3).map((dept, index) => (
            <span key={index} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
              {dept}
            </span>
          ))}
          {hospital.departments.length > 3 && (
            <span className="text-xs text-neutral-400">+{hospital.departments.length - 3} more</span>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-100">
        <Button variant="primary" size="sm" fullWidth onClick={() => onSelect?.(hospital)}>
          Select Hospital
        </Button>
      </div>
    </Card>
  );
};

export default HospitalCard;