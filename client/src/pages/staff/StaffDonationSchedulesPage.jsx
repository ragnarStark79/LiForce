import { useState, useEffect, useMemo, memo } from 'react';
import { staffService } from '../../services/staffService';
import { formatDate } from '../../utils/formatters';
import { useNotification } from '../../components/common/NotificationSystem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import {
  CalendarIcon,
  UserIcon,
  CheckIcon,
  AlertIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
  RefreshcwIcon,
  ArrowRightIcon,
  ActivityIcon,
  DropletIcon
} from '../../components/common/DashboardIcons';

// --- Shared Components for Staff Dashboard Theme ---

const LiveClock = memo(function LiveClock({ currentTime }) {
  // Show a stable timestamp (no per-second re-render). 
  // This updates only on manual refresh/page reload or if the parent forces it.
  return (
    <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3 backdrop-blur-xl shadow-[0_14px_50px_-26px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
      <div className="text-right">
        <div className="text-2xl font-semibold tabular-nums text-slate-900">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="mt-1 text-xs font-semibold text-slate-500">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
});

const Shell = ({ children }) => (
  <div className="min-h-screen staffdash-zen">
    <div className="staffdash-bg" />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
      {children}
    </div>
  </div>
);

const GlassCard = ({ className = '', children }) => (
  <section className={`staffdash-card ${className}`}>{children}</section>
);

const SkeletonLine = ({ w = 'w-full' }) => (
  <div className={`h-3 ${w} rounded-full staffdash-skeleton`} />
);

const SkeletonRow = () => (
  <div className="px-6 py-4 border-b border-white/40 bg-white/30 backdrop-blur-xl hover:bg-white/50 transition-colors">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-1/3">
        <div className="h-10 w-10 rounded-xl staffdash-skeleton shrink-0" />
        <div className="space-y-2 w-full">
          <SkeletonLine w="w-24" />
          <SkeletonLine w="w-32" />
        </div>
      </div>
      <div className="w-1/6"><SkeletonLine w="w-16" /></div>
      <div className="w-1/6"><SkeletonLine w="w-24" /></div>
      <div className="w-1/6 flex justify-end gap-2">
        <div className="h-8 w-16 rounded-lg staffdash-skeleton" />
        <div className="h-8 w-16 rounded-lg staffdash-skeleton" />
      </div>
    </div>
  </div>
);

const SkeletonScreen = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex justify-between items-start">
      <div className="space-y-3">
        <div className="h-8 w-48 rounded-xl staffdash-skeleton" />
        <SkeletonLine w="w-64" />
      </div>
      <div className="h-20 w-40 rounded-2xl staffdash-skeleton hidden sm:block" />
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 rounded-2xl staffdash-skeleton opacity-50" />
      ))}
    </div>

    {/* Filters Skeleton */}
    <div className="h-20 rounded-2xl staffdash-skeleton opacity-60" />

    {/* List Skeleton */}
    <div className="rounded-2xl border border-white/50 overflow-hidden">
      <div className="h-12 bg-white/40 border-b border-white/50" />
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonRow key={i} />
      ))}
    </div>
  </div>
);

const StaffDonationSchedulesPage = () => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ pending: 0, today: 0 });
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal State
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
    setPage(1); // Reset page on filter change
    fetchSchedules();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [filters]);

  useEffect(() => {
    fetchSchedules();
  }, [page]);

  const fetchSchedules = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await staffService.getDonationSchedules({ ...filters, page, limit: 10 });
      // Use backend sort order (createdAt desc)
      setSchedules(response.schedules || []);
      setTotalPages(response.totalPages || 1);
      setStats(response.stats || { pending: 0, today: 0 });
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      if (!silent) notify.error('Failed to load donation schedules');
    } finally {
      // Artificially delay slightly to show skeleton if it loads too fast? No, instant is better.
      // But for smooth transition let's keep a tiny buffer if needed, or just set false.
      if (!silent) setTimeout(() => setLoading(false), 300);
    }
  };

  const handleAssign = async (scheduleId) => {
    try {
      setActionLoading(true);
      await staffService.assignDonationSchedule(scheduleId);
      notify.success('Schedule assigned');
      fetchSchedules(true);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to assign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (scheduleId) => {
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'CONFIRMED');
      notify.success('Confirmed');
      fetchSchedules(true);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to confirm');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async (scheduleId) => {
    if (!window.confirm('Mark as no-show?')) return;
    try {
      setActionLoading(true);
      await staffService.updateDonationScheduleStatus(scheduleId, 'NO_SHOW', 'No Show');
      notify.success('Marked as No Show');
      fetchSchedules(true);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to update');
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
      notify.success('Cancelled');
      fetchSchedules(true);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to cancel');
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
      notify.success('Completed!');
      setShowCompleteModal(false);
      setSelectedSchedule(null);
      fetchSchedules(true);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to complete');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      ASSIGNED: 'info',
      CONFIRMED: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      NO_SHOW: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  if (loading) {
    return (
      <Shell>
        <SkeletonScreen />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 staffdash-enter">
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Schedule Console
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 max-w-2xl">
              Monitor and manage donor appointments in real-time.
            </p>
          </div>
          <div className="hidden sm:block">
            <LiveClock currentTime={currentTime} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Pending */}
          <div className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 hover:-translate-y-0.5 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ClockIcon size={20} />
              </div>
            </div>
            <div className="mt-3 text-xs font-semibold text-amber-700 bg-amber-50 inline-block px-2 py-0.5 rounded-lg border border-amber-100">
              Needs Action
            </div>
          </div>

          {/* Stat 2: Today */}
          <div className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 hover:-translate-y-0.5 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scheduled Today</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{stats.today}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <CalendarIcon size={20} />
              </div>
            </div>
            <div className="mt-3 text-xs font-semibold text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded-lg border border-blue-100">
              Total Appointments
            </div>
          </div>

          {/* Stat 3: Total Active (Derived) */}
          <div className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 hover:-translate-y-0.5 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active List</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{schedules.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ActivityIcon size={20} />
              </div>
            </div>
            <div className="mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 inline-block px-2 py-0.5 rounded-lg border border-emerald-100">
              Current View
            </div>
          </div>

          {/* Stat 4: Time (Mobile only alternative or extra metric) - Let's show Live Status */}
          <div className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">System Online</p>
                <p className="text-xs text-slate-500">Syncing with server</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="pl-9 pr-4 py-2 w-full sm:w-48 bg-white/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all cursor-pointer"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                options={statusOptions}
                className="w-full"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => fetchSchedules()}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/50 transition-colors"
                title="Refresh"
              >
                <RefreshcwIcon size={18} />
              </button>
              <button
                onClick={() => setFilters({ status: 'all', date: '' })}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-2"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Schedule List / Feed */}
        <GlassCard className="overflow-hidden">
          <div className="px-6 py-5 border-b border-white/40 bg-white/55 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarIcon size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Appointments Feed</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {schedules.length} Result{schedules.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {schedules.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                  <CalendarIcon size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No appointments found</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                  There are no donation schedules matching your current filters. Try adjusting the date or status.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/40">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Donor</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Blood Group</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date & Time</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/5">
                  {schedules.map((schedule, idx) => (
                    <tr
                      key={schedule._id}
                      className="hover:bg-white/40 transition-colors group animate-fade-in-up"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-inner">
                            {schedule.donorId?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{schedule.donorId?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500 font-mono">#{schedule._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 font-bold text-xs">
                          <DropletIcon size={12} className="fill-current" />
                          {schedule.donorId?.bloodGroup || '?'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {formatDate(schedule.scheduledDate)}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <ClockIcon size={12} />
                          {schedule.scheduledTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(schedule.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          {schedule.status === 'PENDING' && (
                            <button
                              onClick={() => handleAssign(schedule._id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                            >
                              Assign
                            </button>
                          )}
                          {schedule.status === 'ASSIGNED' && (
                            <>
                              <button
                                onClick={() => handleCancel(schedule._id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleConfirm(schedule._id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                              >
                                Confirm
                              </button>
                            </>
                          )}
                          {schedule.status === 'CONFIRMED' && (
                            <button
                              onClick={() => openCompleteModal(schedule)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                            >
                              <CheckIcon size={12} />
                              Complete
                            </button>
                          )}
                          {['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(schedule.status) && (
                            <span className="text-xs text-slate-400 italic font-medium pr-2">Archived</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between border-t border-slate-200/60 bg-white/40">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </GlassCard>

      </div>

      {/* Completion Modal - Moved outside animation container to preserve fixed positioning */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Donation"
      >
        <form onSubmit={handleComplete} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1">Donor: {selectedSchedule?.donorId?.name}</div>
            <div className="text-slate-500">Recording successful donation details.</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Units Donated"
              type="number"
              min="1"
              value={completeData.unitsDonated}
              onChange={(e) => setCompleteData({ ...completeData, unitsDonated: e.target.value })}
              required
            />
            <Input
              label="Weight (kg)"
              type="text"
              value={completeData.donorWeight}
              onChange={(e) => setCompleteData({ ...completeData, donorWeight: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Blood Pressure"
              type="text"
              placeholder="120/80"
              value={completeData.donorBloodPressure}
              onChange={(e) => setCompleteData({ ...completeData, donorBloodPressure: e.target.value })}
            />
            <Input
              label="Hemoglobin"
              type="text"
              value={completeData.donorHemoglobin}
              onChange={(e) => setCompleteData({ ...completeData, donorHemoglobin: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all resize-none h-20 text-sm"
              value={completeData.notes}
              onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
              placeholder="Any observation..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Complete Donation'}
            </Button>
          </div>
        </form>
      </Modal>
    </Shell>
  );
};

export default StaffDonationSchedulesPage;
