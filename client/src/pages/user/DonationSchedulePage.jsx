import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
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

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Pending', icon: '⏳' },
      ASSIGNED: { variant: 'info', label: 'Staff Assigned', icon: '👤' },
      CONFIRMED: { variant: 'primary', label: 'Confirmed', icon: '✓' },
      COMPLETED: { variant: 'success', label: 'Completed', icon: '✅' },
      CANCELLED: { variant: 'danger', label: 'Cancelled', icon: '✕' },
      NO_SHOW: { variant: 'error', label: 'No Show', icon: '⚠' },
    };
    const config = statusMap[status] || { variant: 'secondary', label: status, icon: '•' };
    return <Badge variant={config.variant}>{config.icon} {config.label}</Badge>;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 text-neutral-600 animate-pulse">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 p-8 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">Schedule Donation</h1>
                <p className="text-white/80">Book your life-saving appointment</p>
              </div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setShowScheduleModal(true)}
            disabled={hasPendingSchedule}
            className="bg-white text-primary-600 hover:bg-white/90 shadow-glow-lg"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Schedule New Donation
            </span>
          </Button>
        </div>
      </div>

      {/* Active Schedule Warning */}
      {hasPendingSchedule && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 animate-slide-up">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
          <div className="flex items-center gap-4 ml-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-amber-800">You have an active schedule</p>
              <p className="text-sm text-amber-700">
                Please complete or cancel your current appointment before scheduling a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200/50 p-4 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{schedules.length}</p>
              <p className="text-sm text-neutral-500">Total Schedules</p>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200/50 p-4 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {schedules.filter(s => s.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-neutral-500">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200/50 p-4 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {schedules.filter(s => ['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(s.status)).length}
              </p>
              <p className="text-sm text-neutral-500">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-neutral-200/50 shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600">📅</span>
            </span>
            Your Donation Schedules
          </h3>

          {schedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">📅</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center animate-bounce">
                  <span className="text-white text-lg">+</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">No scheduled donations</h3>
              <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                Take the first step towards saving lives. Schedule your donation appointment today!
              </p>
              <Button 
                variant="primary" 
                onClick={() => setShowScheduleModal(true)}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-glow"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Schedule Your First Donation
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule, index) => (
                <div 
                  key={schedule._id} 
                  className="group relative overflow-hidden rounded-xl border border-neutral-200/50 p-5 hover:shadow-lg transition-all duration-300 bg-white/50 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                          <span className="text-lg">🏥</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-800">
                            {schedule.hospitalId?.name || 'Hospital'}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {schedule.hospitalId?.city}, {schedule.hospitalId?.state}
                          </p>
                        </div>
                        {getStatusBadge(schedule.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50/80">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span>📆</span>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Date</p>
                            <p className="text-neutral-800 font-medium">
                              {formatDate(schedule.scheduledDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50/80">
                          <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                            <span>⏰</span>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Time</p>
                            <p className="text-neutral-800 font-medium">
                              {schedule.scheduledTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50/80">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span>📍</span>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Location</p>
                            <p className="text-neutral-800 font-medium">
                              {schedule.hospitalId?.city || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {schedule.assignedStaffId && (
                        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
                              <span>👤</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-primary-800">Staff Assigned</p>
                              <p className="text-sm text-primary-700">
                                {schedule.assignedStaffId.name} • {schedule.assignedStaffId.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {schedule.notes && (
                        <div className="mt-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                          <p className="text-sm text-neutral-600">
                            <span className="font-medium">📝 Notes:</span> {schedule.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {['PENDING', 'ASSIGNED', 'CONFIRMED'].includes(schedule.status) && (
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleCancelSchedule(schedule._id)}
                          className="hover:shadow-lg transition-shadow"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Donation Appointment"
        size="md"
      >
        <form onSubmit={handleScheduleDonation} className="space-y-5">
          <Select
            label="Select Hospital"
            name="hospitalId"
            value={formData.hospitalId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Choose a hospital...' },
              ...hospitals.map(h => ({ 
                value: h._id, 
                label: `${h.name} - ${h.city}, ${h.state}` 
              }))
            ]}
            required
          />

          <Input
            label="Preferred Date"
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            min={getMinDate()}
            required
          />

          <Select
            label="Preferred Time"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
            options={[
              { value: '', label: 'Choose a time slot...' },
              ...timeSlots
            ]}
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
              placeholder="Any special requirements or health conditions..."
            />
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-5 rounded-xl border border-primary-100">
            <h4 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-sm">💡</span>
              Before Your Appointment
            </h4>
            <ul className="text-sm text-neutral-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                Get a good night&apos;s sleep
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                Eat a healthy meal before donating
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                Drink plenty of water
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                Bring a valid ID
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                Wear comfortable clothing with sleeves that can be rolled up
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={formLoading}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
            >
              {formLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Scheduling...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  Schedule Donation
                </span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonationSchedulePage;
