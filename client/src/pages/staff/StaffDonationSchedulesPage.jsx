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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchSchedules();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const poller = setInterval(() => fetchSchedules(true), 15000); // Poll every 15s for responsiveness
    return () => {
      clearInterval(timer);
      clearInterval(poller);
    };
  }, [filters]);

  const fetchSchedules = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await staffService.getDonationSchedules(filters);
      // Sort: Pending > Assigned > Confirmed > Newest
      const sorted = (response.schedules || []).sort((a, b) => {
        const priority = { 'PENDING': 4, 'ASSIGNED': 3, 'CONFIRMED': 2, 'COMPLETED': 1 };
        const pA = priority[a.status] || 0;
        const pB = priority[b.status] || 0;
        if (pA !== pB) return pB - pA;
        return new Date(b.createdAt || b.scheduledDate) - new Date(a.createdAt || a.scheduledDate);
      });
      setSchedules(sorted);
      setStats(response.stats || { pending: 0, today: 0 });
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      if (!silent) toast.error('Failed to load donation schedules');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAssign = async (scheduleId) => {
    try {
      setActionLoading(true);
      await staffService.assignDonationSchedule(scheduleId);
      toast.success('Schedule assigned');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (scheduleId) => {
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'CONFIRMED');
      toast.success('Confirmed');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async (scheduleId) => {
    if (!window.confirm('Mark as no-show?')) return;
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'NO_SHOW', 'No Show');
      toast.success('Marked as No Show');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (scheduleId) => {
    const reason = window.prompt('Cancellation reason:');
    if (!reason) return;
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'CANCELLED', reason);
      toast.success('Cancelled');
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
      toast.success('Completed!');
      setShowCompleteModal(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-200',
      CONFIRMED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      NO_SHOW: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return map[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header & Stats - Compact Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header Box */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <h1 className="text-2xl font-display font-bold text-gray-800 leading-tight mb-2">
            Schedule<br />Monitor
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Stats Boxes - Compact Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pending</p>
              <p className="text-3xl font-bold text-gray-900 leading-none mt-1">{stats.pending}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
                            ${stats.pending > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-300'}`}>
              ⚡
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Today</p>
              <p className="text-3xl font-bold text-gray-900 leading-none mt-1">{stats.today}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              📅
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Minimal Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200/60 shadow-sm">
        <span className="text-gray-400 pl-2">🔍</span>
        <Select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          options={statusOptions}
          className="w-32 text-xs border-none bg-gray-50 rounded focus:ring-0"
        />
        <Input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          className="w-32 text-xs border-none bg-gray-50 rounded focus:ring-0"
        />
        <button onClick={() => setFilters({ status: 'all', date: '' })} className="ml-auto text-xs text-gray-500 hover:text-gray-900 px-3">
          Reset
        </button>
      </div>

      {/* Boxy Grid Schedules */}
      {schedules.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400">No appointments active</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <div key={schedule._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              {/* Status Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor(schedule.status).split(' ')[0].replace('/10', '')} opacity-50`} />

              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(schedule.status)}`}>
                  {schedule.status}
                </span>
                <span className="text-xs font-mono text-gray-400">#{schedule._id.slice(-4)}</span>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {schedule.donorId?.name || 'Unknown'}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <div className="bg-gray-50 p-1.5 rounded flex items-center gap-1.5">
                  <span>🩸</span> {schedule.donorId?.bloodGroup || '?'}
                </div>
                <div className="bg-gray-50 p-1.5 rounded flex items-center gap-1.5">
                  <span>⏰</span> {schedule.scheduledTime}
                </div>
                <div className="col-span-2 bg-gray-50 p-1.5 rounded flex items-center gap-1.5 truncate">
                  <span>📅</span> {formatDate(schedule.scheduledDate)}
                </div>
              </div>

              {/* Actions Overlay / Footer */}
              <div className="flex gap-2 mt-auto">
                {schedule.status === 'PENDING' && (
                  <Button size="sm" onClick={() => handleAssign(schedule._id)} disabled={actionLoading} className="w-full justify-center">
                    Assign
                  </Button>
                )}
                {schedule.status === 'ASSIGNED' && (
                  <>
                    <Button size="sm" variant="danger" onClick={() => handleCancel(schedule._id)} disabled={actionLoading} className="flex-1 text-xs">Cancel</Button>
                    <Button size="sm" onClick={() => handleConfirm(schedule._id)} disabled={actionLoading} className="flex-1 text-xs">Confirm</Button>
                  </>
                )}
                {schedule.status === 'CONFIRMED' && (
                  <Button size="sm" variant="success" onClick={() => openCompleteModal(schedule)} disabled={actionLoading} className="w-full justify-center">
                    Complete
                  </Button>
                )}
                {['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(schedule.status) && (
                  <div className="w-full text-center text-xs text-gray-400 py-1 italic">
                    Archived
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal removed/minimized for brevity (kept logic but reuse existing if possible, but for full replacement I must include it) */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Donation"
        size="md"
      >
        <form onSubmit={handleComplete} className="space-y-4">
          <Input type="number" label="Units" value={completeData.unitsDonated} onChange={(e) => setCompleteData(prev => ({ ...prev, unitsDonated: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Weight" value={completeData.donorWeight} onChange={(e) => setCompleteData(prev => ({ ...prev, donorWeight: e.target.value }))} />
            <Input label="BP" value={completeData.donorBloodPressure} onChange={(e) => setCompleteData(prev => ({ ...prev, donorBloodPressure: e.target.value }))} />
          </div>
          <Input label="Hemoglobin" value={completeData.donorHemoglobin} onChange={(e) => setCompleteData(prev => ({ ...prev, donorHemoglobin: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
            <Button type="submit" variant="success" disabled={actionLoading}>Complete</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffDonationSchedulesPage;
