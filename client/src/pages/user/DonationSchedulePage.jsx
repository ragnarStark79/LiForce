import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';
import { useNotification } from '../../components/common/NotificationSystem';
import { formatDate } from '../../utils/formatters';
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  DocumentIcon,
  ArrowRightIcon,
} from '../../components/common/DashboardIcons';

const DonationSchedulePage = () => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, hospitalsRes] = await Promise.all([
        userService.getDonationSchedules(),
        userService.getHospitals(),
      ]);
      setSchedules(schedulesRes.schedules || []);
      setHospitals(hospitalsRes.hospitals || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      notify.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleDonation = async (e) => {
    e.preventDefault();

    if (!formData.hospitalId || !formData.scheduledDate || !formData.scheduledTime) {
      notify.warning('Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      await userService.createDonationSchedule(formData);
      notify.schedule('Your donation appointment has been scheduled successfully!');
      setShowScheduleModal(false);
      setFormData({ hospitalId: '', scheduledDate: '', scheduledTime: '', notes: '' });
      fetchData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to schedule donation');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to cancel this donation schedule?')) {
      return;
    }

    try {
      await userService.cancelDonationSchedule(scheduleId, 'Cancelled by user');
      notify.info('Donation schedule has been cancelled');
      fetchData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to cancel schedule');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'warning',
      ASSIGNED: 'info',
      CONFIRMED: 'user-theme',
      COMPLETED: 'success',
      CANCELLED: 'neutral',
      NO_SHOW: 'danger',
    };
    const variant = map[status] || 'neutral';
    return `status-badge ${variant}`;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const timeSlots = [
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '15:30', label: '3:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' },
  ];

  const hasPendingSchedule = schedules.some((s) =>
    ['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(s.status),
  );

  const completedCount = schedules.filter((s) => s.status === 'COMPLETED').length;
  const upcomingCount = schedules.filter((s) => ['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(s.status)).length;

  if (loading) {
    return (
      <div className="v2-bg">
        <div className="v2-container max-w-6xl mx-auto space-y-6 pb-10">
          <div className="v2-panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-10 w-64 v2-skeleton" />
                <div className="mt-3 h-4 w-80 max-w-full v2-skeleton v2-skeleton-muted" />
              </div>
              <div className="h-10 w-40 v2-skeleton" />
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="h-20 v2-skeleton" />
              <div className="h-20 v2-skeleton" />
              <div className="h-20 v2-skeleton" />
            </div>
            <div className="mt-6 h-64 v2-skeleton" />
          </div>
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-bg">
      <div className="v2-container max-w-6xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <section className="v2-panel p-6 sm:p-8 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/60 shadow-sm">
                <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }} />
                <span className="text-xs font-semibold text-slate-700">Donation Scheduling</span>
              </div>
              <h1 className="mt-4 v2-title">Donation Schedule</h1>
              <p className="mt-2 v2-subtitle">Book and manage your donation appointments.</p>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={hasPendingSchedule}
              className={`btn-modern ${hasPendingSchedule ? 'secondary' : 'primary'} rounded-2xl`}
              title={hasPendingSchedule ? 'You already have an active appointment' : 'Create a new schedule'}
            >
              <CalendarIcon size={18} />
              New Schedule
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="v2-card v2-kpi p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Total</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{schedules.length}</div>
                </div>
                <div className="icon-box info">
                  <DocumentIcon size={20} />
                </div>
              </div>
            </div>

            <div className="v2-card v2-kpi p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Completed</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{completedCount}</div>
                </div>
                <div className="icon-box success">
                  <CheckIcon size={20} />
                </div>
              </div>
            </div>

            <div className="v2-card v2-kpi p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Upcoming</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{upcomingCount}</div>
                </div>
                <div className="icon-box warning">
                  <ClockIcon size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          {hasPendingSchedule && (
            <div className="mt-5 glass-card-solid p-4 rounded-2xl border border-amber-200/60 bg-amber-50/50">
              <div className="flex items-start gap-3">
                <div className="icon-box warning shrink-0">
                  <ClockIcon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Active appointment detected</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Complete or cancel your current schedule before creating a new one.
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* List */}
        <section className="v2-panel overflow-hidden animate-fade-up">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200/60">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Your Schedules</h2>
              <p className="text-xs text-slate-600 mt-1">Upcoming and historical appointments</p>
            </div>
          </div>

          {schedules.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
                <CalendarIcon size={26} />
              </div>
              <div className="text-sm font-semibold text-slate-900">No scheduled donations</div>
              <div className="mt-1 text-xs text-slate-600">Schedule your first donation appointment.</div>
              <div className="mt-5">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="btn-modern primary rounded-2xl"
                >
                  <CalendarIcon size={18} />
                  Schedule donation
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60">
              {schedules.map((schedule) => {
                const isActive = ['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(schedule.status);
                const canBookAnother = !hasPendingSchedule;

                return (
                  <div key={schedule._id} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {schedule.hospitalId?.name || 'Hospital'}
                          </div>
                          <span className={getStatusBadge(schedule.status)}>{schedule.status}</span>
                        </div>

                        <div className="mt-1 text-xs text-slate-600">
                          {schedule.hospitalId?.city}{schedule.hospitalId?.city ? ',' : ''} {schedule.hospitalId?.state}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="status-badge neutral">
                            <CalendarIcon size={14} />
                            {formatDate(schedule.scheduledDate)}
                          </span>
                          <span className="status-badge neutral">
                            <ClockIcon size={14} />
                            {schedule.scheduledTime}
                          </span>
                        </div>

                        {schedule.assignedStaffId && (
                          <div className="mt-3 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Staff:</span> {schedule.assignedStaffId.name} • {schedule.assignedStaffId.phone}
                          </div>
                        )}

                        {schedule.notes && (
                          <div className="mt-2 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Notes:</span> {schedule.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:justify-end">
                        {isActive && (
                          <button
                            onClick={() => handleCancelSchedule(schedule._id)}
                            className="btn-modern secondary rounded-2xl"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Booking is available via the header/empty-state CTA only */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Modal */}
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Schedule Donation"
          size="md"
        >
          <form onSubmit={handleScheduleDonation} className="space-y-4">
            <Select
              label="Hospital"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select a hospital...' },
                ...hospitals.map((h) => ({
                  value: h._id,
                  label: `${h.name} - ${h.city}, ${h.state}`,
                })),
              ]}
              required
            />

            <Input
              label="Date"
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              min={getMinDate()}
              required
            />

            <Select
              label="Time"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              options={[{ value: '', label: 'Select a time...' }, ...timeSlots]}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Any special requirements..."
              />
            </div>

            <div className="glass-card-solid rounded-2xl p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900 mb-2">Before your appointment</p>
              <ul className="space-y-1 text-slate-600">
                <li>• Get a good night's sleep</li>
                <li>• Eat a healthy meal</li>
                <li>• Drink plenty of water</li>
                <li>• Bring a valid ID</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="btn-modern secondary rounded-2xl"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="btn-modern primary rounded-2xl"
              >
                {formLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default DonationSchedulePage;
