import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { staffService } from '../../services/staffService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StaffDonationSchedulesPage = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({ pending: 0, today: 0 });
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
  });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeData, setCompleteData] = useState({
    unitsDonated: 1,
    donorWeight: '',
    donorBloodPressure: '',
    donorHemoglobin: '',
    notes: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [filters]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await staffService.getDonationSchedules(filters);
      setSchedules(response.schedules || []);
      setStats(response.stats || { pending: 0, today: 0 });
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load donation schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (scheduleId) => {
    try {
      setActionLoading(true);
      await staffService.assignDonationSchedule(scheduleId);
      toast.success('Schedule assigned to you successfully');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign schedule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (scheduleId) => {
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'CONFIRMED');
      toast.success('Appointment confirmed');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async (scheduleId) => {
    if (!window.confirm('Mark this donor as no-show?')) return;
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'NO_SHOW', 'Donor did not arrive');
      toast.success('Marked as no-show');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (scheduleId) => {
    const reason = window.prompt('Please provide a cancellation reason:');
    if (!reason) return;
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'CANCELLED', reason);
      toast.success('Schedule cancelled');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  const openCompleteModal = (schedule) => {
    setSelectedSchedule(schedule);
    setCompleteData({
      unitsDonated: 1,
      donorWeight: '',
      donorBloodPressure: '',
      donorHemoglobin: '',
      notes: '',
    });
    setShowCompleteModal(true);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await staffService.completeDonationSchedule(selectedSchedule._id, completeData);
      toast.success('Donation completed and recorded!');
      setShowCompleteModal(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete donation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Pending' },
      ASSIGNED: { variant: 'info', label: 'Assigned' },
      CONFIRMED: { variant: 'primary', label: 'Confirmed' },
      COMPLETED: { variant: 'success', label: 'Completed' },
      CANCELLED: { variant: 'danger', label: 'Cancelled' },
      NO_SHOW: { variant: 'error', label: 'No Show' },
    };
    const config = statusMap[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-neutral-800">
          Donation Schedules
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage upcoming blood donation appointments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-warning-50 border-warning-200">
          <div className="flex items-center gap-4">
            <div className="text-4xl">⏳</div>
            <div>
              <p className="text-2xl font-bold text-warning-800">{stats.pending}</p>
              <p className="text-warning-700">Pending Assignments</p>
            </div>
          </div>
        </Card>
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📅</div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{stats.today}</p>
              <p className="text-primary-700">Today&apos;s Appointments</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={statusOptions}
            className="w-48"
          />
          <Input
            type="date"
            label="Date"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            className="w-48"
          />
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => setFilters({ status: 'all', date: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Schedules List */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Scheduled Donations
        </h3>

        {schedules.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg">No donation schedules found</p>
            <p className="text-sm">Schedules will appear here when donors book appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-neutral-800">
                        {schedule.donorId?.name || 'Unknown Donor'}
                      </h4>
                      {getStatusBadge(schedule.status)}
                      <Badge variant="secondary">{schedule.donorId?.bloodGroup || 'N/A'}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500">Date</p>
                        <p className="text-neutral-800 font-medium">
                          {formatDate(schedule.scheduledDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Time</p>
                        <p className="text-neutral-800 font-medium">
                          {schedule.scheduledTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Phone</p>
                        <p className="text-neutral-800">{schedule.donorId?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Email</p>
                        <p className="text-neutral-800 truncate">{schedule.donorId?.email || 'N/A'}</p>
                      </div>
                    </div>
                    {schedule.assignedStaffId && (
                      <p className="text-sm text-primary-600 mt-2">
                        <span className="font-medium">Assigned to:</span> {schedule.assignedStaffId.name}
                      </p>
                    )}
                    {schedule.notes && (
                      <p className="text-sm text-neutral-600 mt-2">
                        <span className="font-medium">Notes:</span> {schedule.notes}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {schedule.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAssign(schedule._id)}
                        disabled={actionLoading}
                      >
                        Assign to Me
                      </Button>
                    )}
                    {schedule.status === 'ASSIGNED' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleConfirm(schedule._id)}
                          disabled={actionLoading}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancel(schedule._id)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {schedule.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openCompleteModal(schedule)}
                          disabled={actionLoading}
                        >
                          Complete Donation
                        </Button>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleNoShow(schedule._id)}
                          disabled={actionLoading}
                        >
                          No Show
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Complete Donation Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Donation"
        size="md"
      >
        <form onSubmit={handleComplete} className="space-y-4">
          {selectedSchedule && (
            <div className="bg-neutral-50 p-4 rounded-lg mb-4">
              <p><span className="font-medium">Donor:</span> {selectedSchedule.donorId?.name}</p>
              <p><span className="font-medium">Blood Group:</span> {selectedSchedule.donorId?.bloodGroup}</p>
            </div>
          )}

          <Input
            type="number"
            label="Units Donated"
            value={completeData.unitsDonated}
            onChange={(e) => setCompleteData(prev => ({ ...prev, unitsDonated: e.target.value }))}
            min="1"
            max="2"
            required
          />

          <Input
            type="text"
            label="Donor Weight (kg)"
            value={completeData.donorWeight}
            onChange={(e) => setCompleteData(prev => ({ ...prev, donorWeight: e.target.value }))}
            placeholder="e.g., 65"
          />

          <Input
            type="text"
            label="Blood Pressure"
            value={completeData.donorBloodPressure}
            onChange={(e) => setCompleteData(prev => ({ ...prev, donorBloodPressure: e.target.value }))}
            placeholder="e.g., 120/80"
          />

          <Input
            type="text"
            label="Hemoglobin Level (g/dL)"
            value={completeData.donorHemoglobin}
            onChange={(e) => setCompleteData(prev => ({ ...prev, donorHemoglobin: e.target.value }))}
            placeholder="e.g., 14.5"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              value={completeData.notes}
              onChange={(e) => setCompleteData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any observations or notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCompleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Complete & Record Donation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffDonationSchedulesPage;
