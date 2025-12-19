import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';
import { useNotification } from '../../components/common/NotificationSystem';
import { formatDate } from '../../utils/formatters';

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
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-50 text-amber-700',
      ASSIGNED: 'bg-blue-50 text-blue-700',
      CONFIRMED: 'bg-indigo-50 text-indigo-700',
      COMPLETED: 'bg-green-50 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-500',
      NO_SHOW: 'bg-red-50 text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
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

  const hasPendingSchedule = schedules.some(s =>
    ['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(s.status)
  );

  const completedCount = schedules.filter(s => s.status === 'COMPLETED').length;
  const upcomingCount = schedules.filter(s => ['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(s.status)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Donation Schedule</h1>
          <p className="text-gray-500 mt-1 text-sm">Book your donation appointments</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          disabled={hasPendingSchedule}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl 
                    hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 
                    disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span className="inline-flex items-center gap-2">
            <span>📅</span> New Schedule
          </span>
        </button>
      </div>

      {/* Stats - Compact Grid with Animation */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Total', value: schedules.length, icon: '📊', color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-50', delay: '0.15s' },
          { label: 'Completed', value: completedCount, icon: '✅', color: 'from-emerald-400 to-green-500', bgColor: 'bg-emerald-50', delay: '0.2s' },
          { label: 'Upcoming', value: upcomingCount, icon: '⏰', color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-50', delay: '0.25s' },
        ].map((stat) => (
          <div 
            key={stat.label} 
            className={`${stat.bgColor} rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-up`}
            style={{ animationDelay: stat.delay }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-2 shadow-sm transform transition-transform duration-300 hover:scale-110`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      {hasPendingSchedule && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <span className="text-amber-600 text-xl">⚠️</span>
          <p className="text-sm text-amber-700 flex-1">
            You have an active schedule. Complete or cancel it before scheduling a new one.
          </p>
        </div>
      )}

      {/* Schedules List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-lg">📋</span> Your Schedules
          </h3>
        </div>

        {schedules.length === 0 ? (
          <div className="p-8 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-3xl mb-4 animate-bounce-slow">
              📅
            </div>
            <p className="text-gray-700 font-medium mb-1">No scheduled donations</p>
            <p className="text-sm text-gray-500 mb-4">Schedule your first donation appointment</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg 
                        hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Schedule Donation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {schedules.map((schedule, index) => (
              <div 
                key={schedule._id} 
                className="p-5 hover:bg-gray-50 transition-all duration-300 animate-fade-up group"
                style={{ animationDelay: `${0.4 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">
                          {schedule.hospitalId?.name || 'Hospital'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {schedule.hospitalId?.city}, {schedule.hospitalId?.state}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="text-gray-400">📆</span>
                          {formatDate(schedule.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="text-gray-400">⏰</span>
                          {schedule.scheduledTime}
                        </span>
                      </div>

                      {schedule.assignedStaffId && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-2.5 py-1.5 inline-block hover:bg-gray-100 transition-colors">
                          👤 {schedule.assignedStaffId.name} • 📞 {schedule.assignedStaffId.phone}
                        </p>
                      )}

                      {schedule.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic bg-blue-50 rounded-lg px-2.5 py-1.5 inline-block">
                          💬 {schedule.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(schedule.status) && (
                    <button
                      onClick={() => handleCancelSchedule(schedule._id)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-red-50 flex-shrink-0 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              ...hospitals.map(h => ({
                value: h._id,
                label: `${h.name} - ${h.city}, ${h.state}`
              }))
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
            options={[
              { value: '', label: 'Select a time...' },
              ...timeSlots
            ]}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 
                        focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Any special requirements..."
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-2">Before your appointment:</p>
            <ul className="space-y-1 text-gray-500">
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
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl 
                        hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
            >
              {formLoading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonationSchedulePage;
