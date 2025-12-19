import { useState, useEffect, useMemo, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StaffRequestTable from '../../components/staff/StaffRequestTable';
import InventoryStatusCard from '../../components/staff/InventoryStatusCard';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { staffService } from '../../services/staffService';
import {
  ClockIcon,
  UserIcon,
  CheckIcon,
  AlertIcon,
  ClipboardIcon,
  DropletIcon,
  UsersIcon,
  CalendarIcon,
  ChatIcon,
  ArrowRightIcon,
  ActivityIcon
} from '../../components/common/DashboardIcons';

const LiveClock = memo(function LiveClock({ currentTime }) {
  // Show a stable timestamp (no per-second re-render). This updates only on manual refresh/page reload.
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

const StaffDashboardPage = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    completed: 0,
    critical: 0,
    todayDonations: 0,
    todayDonors: 0,
    todayRequests: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadStartTime = Date.now();
    const minLoadTime = 2000;

    const loadData = async () => {
      await fetchDashboardData();

      const loadDuration = Date.now() - loadStartTime;
      const remainingTime = minLoadTime - loadDuration;

      if (remainingTime > 0) {
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
    };

    loadData();

    // IMPORTANT: Disable auto-refresh behavior to prevent UI flicker/blinking.
    // Data will refresh only when the user clicks the Refresh button or reloads the page.
    // const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    // const dataPoller = setInterval(() => fetchDashboardData(true), 30000);

    return () => {
      // clearInterval(timer);
      // clearInterval(dataPoller);
    };
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
      } else {
        setDataLoading(true);
      }

      console.log('Fetching staff dashboard data...');

      const [dashboardData, requestsData, inventoryData] = await Promise.allSettled([
        staffService.getDashboard(),
        staffService.getBloodRequests({ status: 'PENDING' }),
        staffService.getInventory()
      ]);

      if (dashboardData.status === 'fulfilled' && dashboardData.value?.stats) {
        console.log('Dashboard stats loaded:', dashboardData.value.stats);
        setStats({
          pending: dashboardData.value.stats.pendingRequests || 0,
          assigned: dashboardData.value.stats.assignedToMe || 0,
          completed: dashboardData.value.stats.completedTotal || 0,
          critical: dashboardData.value.stats.criticalCases || 0,
          todayDonations: dashboardData.value.stats.todayDonations || 0,
          todayDonors: dashboardData.value.stats.todayDonors || 0,
          todayRequests: dashboardData.value.stats.completedToday || 0
        });
      } else {
        console.error('Dashboard stats failed:', dashboardData.reason || 'Unknown error');
        if (requestsData.status === 'fulfilled' && requestsData.value?.requests) {
          const requests = requestsData.value.requests;
          const pending = requests.filter(r => r.status === 'PENDING').length || 0;
          const critical = requests.filter(r => r.urgency === 'CRITICAL').length || 0;
          setStats(prev => ({ ...prev, pending, critical }));
        }
      }

      if (requestsData.status === 'fulfilled' && requestsData.value?.requests) {
        console.log('Requests loaded:', requestsData.value.requests.length);
        setRequests(requestsData.value.requests || []);
      } else {
        console.error('Requests failed:', requestsData.reason || 'Unknown error');
        setRequests([]);
      }

      if (inventoryData.status === 'fulfilled' && inventoryData.value?.inventory) {
        console.log('Inventory loaded:', inventoryData.value.inventory.length);
        setInventory(inventoryData.value.inventory || []);
      } else {
        console.error('Inventory failed:', inventoryData.reason || 'Unknown error');
        setInventory([]);
      }

      if (!silent) {
        if (
          dashboardData.status === 'rejected' &&
          requestsData.status === 'rejected' &&
          inventoryData.status === 'rejected'
        ) {
          notify.error('Failed to load dashboard data. Please refresh the page.');
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      if (!silent) notify.error('Failed to load dashboard data');
    } finally {
      if (silent) {
        setDataLoading(false);
      }
    }
  };

  const handleAssignRequest = async (requestId) => {
    try {
      await staffService.assignRequest(requestId);
      notify.success('Request assigned');
      fetchDashboardData(true);
    } catch (error) {
      notify.error('Failed to assign request');
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await staffService.updateRequestStatus(requestId, status);
      notify.success(`Status updated to ${status}`);
      fetchDashboardData(true);
    } catch (error) {
      notify.error('Failed to update status');
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const quickActions = useMemo(
    () => [
      { label: 'Requests Hub', icon: ClipboardIcon, path: '/staff/blood-requests', accent: 'from-amber-500/15 to-orange-500/5' },
      { label: 'Inventory', icon: DropletIcon, path: '/staff/inventory', accent: 'from-rose-500/15 to-red-500/5' },
      { label: 'Patients', icon: UsersIcon, path: '/staff/patients', accent: 'from-sky-500/15 to-blue-500/5' },
      { label: 'Schedules', icon: CalendarIcon, path: '/staff/donation-schedules', accent: 'from-fuchsia-500/15 to-violet-500/5' },
      { label: 'Messaging', icon: ChatIcon, path: '/staff/chat', accent: 'from-emerald-500/15 to-teal-500/5' },
      { label: 'Profile', icon: UserIcon, path: '/staff/profile', accent: 'from-slate-500/10 to-slate-500/5' }
    ],
    []
  );

  const statTiles = useMemo(
    () => [
      { key: 'pending', label: 'Pending', value: stats.pending, icon: ClockIcon, tone: 'amber' },
      { key: 'assigned', label: 'Assigned', value: stats.assigned, icon: UserIcon, tone: 'blue' },
      { key: 'completed', label: 'Completed', value: stats.completed, icon: CheckIcon, tone: 'emerald' },
      { key: 'critical', label: 'Critical', value: stats.critical, icon: AlertIcon, tone: 'rose' }
    ],
    [stats]
  );

  const toneClass = (tone) => {
    switch (tone) {
      case 'amber':
        return {
          ring: 'ring-amber-500/10',
          icon: 'text-amber-700',
          chip: 'bg-amber-500/10 text-amber-800 border-amber-500/10'
        };
      case 'blue':
        return {
          ring: 'ring-blue-500/10',
          icon: 'text-blue-700',
          chip: 'bg-blue-500/10 text-blue-800 border-blue-500/10'
        };
      case 'emerald':
        return {
          ring: 'ring-emerald-500/10',
          icon: 'text-emerald-700',
          chip: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/10'
        };
      case 'rose':
      default:
        return {
          ring: 'ring-rose-500/10',
          icon: 'text-rose-700',
          chip: 'bg-rose-500/10 text-rose-800 border-rose-500/10'
        };
    }
  };

  const Shell = ({ children }) => (
    <div className="min-h-screen staffdash-zen">
      <div className="staffdash-bg" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

  const SkeletonTile = () => (
    <div className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <SkeletonLine w="w-20" />
          <SkeletonLine w="w-28" />
        </div>
        <div className="h-12 w-12 rounded-2xl staffdash-skeleton" />
      </div>
      <div className="mt-4">
        <SkeletonLine w="w-32" />
      </div>
    </div>
  );

  const TopBar = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-slate-900 to-slate-700 text-white shadow-lg grid place-items-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {greeting}, <span className="text-slate-900">{user?.name || 'Staff'}</span>
            </p>
            <h1 className="mt-0.5 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Operations Console
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live sync
              </span>
              <span className="inline-flex items-center rounded-xl border border-indigo-500/15 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700">
                {user?.staffPosition || 'Staff'}
              </span>
              {dataLoading && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-slate-500/10 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-sky-500 staffdash-pulse" />
                  Refreshing
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <LiveClock currentTime={currentTime} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <GlassCard className="col-span-12 lg:col-span-8 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Action Center</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Shortcuts</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => fetchDashboardData(true)}
                className="rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
              >
                Refresh
              </button>
              <button
                onClick={() => navigate('/staff/blood-requests')}
                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
              >
                Open Requests
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((a, idx) => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="group relative overflow-hidden rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl px-4 py-4 text-left shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-34px_rgba(15,23,42,0.55)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <div className={`absolute inset-0 bg-linear-to-br ${a.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-2xl border border-black/5 bg-white/70 grid place-items-center text-slate-800 transition-transform duration-300 group-hover:scale-[1.05]">
                      <a.icon size={18} />
                    </div>
                    <ArrowRightIcon size={16} className="text-slate-400 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="mt-3 text-xs font-semibold text-slate-500">Navigate</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{a.label}</div>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-4 p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Signal</h2>
            </div>
            <span className="inline-flex items-center rounded-xl border border-white/50 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md">
              <ActivityIcon size={14} />
              <span className="ml-1">Live</span>
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: 'Units collected', value: stats.todayDonations, tone: 'emerald' },
              { label: 'Unique donors', value: stats.todayDonors, tone: 'blue' },
              { label: 'Requests completed', value: stats.todayRequests, tone: 'amber' }
            ].map((row) => {
              const t = toneClass(row.tone);
              return (
                <div
                  key={row.label}
                  className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl px-4 py-3 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 transition-all hover:bg-white/70"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">{row.label}</div>
                    <div className={`tabular-nums text-xl font-semibold ${t.icon}`}>{row.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const EventsLane = () => (
    <div className="grid grid-cols-12 gap-4">
      <GlassCard className="col-span-12 lg:col-span-7 overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-white/40 bg-white/55 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-black/5 bg-white/70 grid place-items-center text-slate-800">
                <ClipboardIcon size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Requests Stream</div>
                <div className="mt-0.5 text-xs font-semibold text-slate-500">Most recent pending cases</div>
              </div>
            </div>

            <Link
              to="/staff/blood-requests"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
            >
              View all
              <ArrowRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/50 backdrop-blur-md p-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-linear-to-br from-slate-900/5 to-slate-900/0 grid place-items-center text-slate-600">
                ✦
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">No pending requests</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                Your queue is clear right now.
              </div>
            </div>
          ) : (
            <div className="staffdash-fadein">
              <StaffRequestTable
                requests={requests.slice(0, 5)}
                onAssign={handleAssignRequest}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="col-span-12 lg:col-span-5 overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-white/40 bg-white/55 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-black/5 bg-white/70 grid place-items-center text-slate-800">
                <DropletIcon size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Blood Inventory</div>
                <div className="mt-0.5 text-xs font-semibold text-slate-500">Live stock snapshot</div>
              </div>
            </div>
            <Link
              to="/staff/inventory"
              className="inline-flex items-center rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
            >
              Manage
            </Link>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="staffdash-inventory-compact">
            <InventoryStatusCard inventory={inventory} />
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const MetricsStrip = () => (
    <div className="grid grid-cols-12 gap-4">
      <GlassCard className="col-span-12 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overview</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Key Metrics</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Updated
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {statTiles.map((t, idx) => {
            const tone = toneClass(t.tone);
            const Icon = t.icon;
            return (
              <div
                key={t.key}
                className={`group rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-34px_rgba(15,23,42,0.55)] ${tone.ring}`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.label}</div>
                    <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{t.value}</div>
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="h-11 w-11 rounded-2xl border border-black/5 bg-white/70 grid place-items-center text-slate-800 transition-transform duration-300 group-hover:scale-[1.05]">
                    <Icon size={18} className={tone.icon} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );

  const SkeletonScreen = () => (
    <Shell>
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/50 bg-white/55 backdrop-blur-xl p-6 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl staffdash-skeleton" />
              <div className="space-y-3">
                <SkeletonLine w="w-44" />
                <SkeletonLine w="w-64" />
                <div className="flex gap-2">
                  <div className="h-7 w-24 rounded-xl staffdash-skeleton" />
                  <div className="h-7 w-20 rounded-xl staffdash-skeleton" />
                </div>
              </div>
            </div>
            <div className="hidden sm:block w-44">
              <div className="h-16 rounded-2xl staffdash-skeleton" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonTile key={i} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-6 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <SkeletonLine w="w-28" />
              <SkeletonLine w="w-20" />
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[92px] rounded-2xl staffdash-skeleton" />
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-6 ring-1 ring-black/5">
            <SkeletonLine w="w-24" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl staffdash-skeleton" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-6 ring-1 ring-black/5">
            <SkeletonLine w="w-32" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl staffdash-skeleton" />
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-6 ring-1 ring-black/5">
            <SkeletonLine w="w-28" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl staffdash-skeleton" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );

  if (loading) {
    return <SkeletonScreen />;
  }

  return (
    <Shell>
      <div className="staffdash-enter space-y-4">
        <TopBar />
        <MetricsStrip />
        <EventsLane />
      </div>
    </Shell>
  );
};

export default StaffDashboardPage;
