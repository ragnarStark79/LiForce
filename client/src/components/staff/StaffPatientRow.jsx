import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

const StaffPatientRow = ({ patient, onViewHistory, onContact }) => {
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <tr className="hover:bg-neutral-50 border-b border-neutral-100">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} size="sm" />
          <div>
            <p className="font-medium text-neutral-800">{patient.name}</p>
            <p className="text-sm text-neutral-500">{patient.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-lg font-bold text-red-600">{patient.bloodGroup || 'N/A'}</span>
      </td>
      <td className="px-4 py-3 text-neutral-600">
        {patient.phone || 'N/A'}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-500">
        {formatDate(patient.lastDonationDate)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={patient.status === 'ACTIVE' ? 'success' : 'default'}>
          {patient.status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onViewHistory?.(patient)}>
            History
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onContact?.(patient)}>
            Contact
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default StaffPatientRow;