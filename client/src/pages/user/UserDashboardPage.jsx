import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';
import {
  HeartIcon,
  DocumentIcon,
  UsersIcon,
  CalendarIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  DropletIcon,
  GiftIcon,
  ArrowRightIcon
} from '../../components/common/DashboardIcons';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    nextEligibleDate: null,
    lastDonation: null,
    activeRequests: [],
    stats: {
      totalDonations: 0,
      totalRequests: 0,
      livesImpacted: 0,
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await userService.getDashboard();
      setDashboardData({
        nextEligibleDate: data.nextEligibleDate,
        lastDonation: data.lastDonation,
        activeRequests: data.activeRequests || [],
        stats: data.stats || {
          totalDonations: 0,
          totalRequests: 0,
          livesImpacted: 0,
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityMessage = () => {
    if (!dashboardData.nextEligibleDate) {
      return { message: 'You can donate now!', canDonate: true };
    }
    const eligibleDate = new Date(dashboardData.nextEligibleDate);
    const now = new Date();
    if (eligibleDate <= now) {
      return { message: 'You can donate now!', canDonate: true };
    }
    return { message: `Eligible on ${formatDate(dashboardData.nextEligibleDate)}`, canDonate: false };
  };

  const eligibility = getEligibilityMessage();

  const quickActions = [
    { label: 'Request Blood', icon: DropletIcon, path: '/user/blood-requests', color: 'danger' },
    { label: 'Schedule', icon: CalendarIcon, path: '/user/schedule-donation', color: 'user-theme' },
    { label: 'Donations', icon: GiftIcon, path: '/user/donations', color: 'success' },
    { label: 'Messages', icon: ChatIcon, path: '/user/chat', color: 'info' },
  ];

  const firstName = user?.name?.split(' ')?.[0] || 'there';
  const hasBloodType = Boolean(user?.bloodGroup);

  if (loading) {
    // Premium skeleton: avoids abrupt spinner-only loading.
    return (
      <div className="v2-bg">
        <div className="v2-container max-w-6xl mx-auto space-y-6 pb-10">
          {/* Hero skeleton */}
          <div className="v2-panel p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="h-5 w-32 v2-skeleton" />
                <div className="h-10 w-72 v2-skeleton" />
                <div className="h-4 w-96 max-w-full v2-skeleton v2-skeleton-muted" />
              </div>
              <div className="grid grid-cols-2 gap-3 w-full lg:w-[420px]">
                <div className="h-20 v2-skeleton" />
                <div className="h-20 v2-skeleton" />
                <div className="h-20 v2-skeleton" />
                <div className="h-20 v2-skeleton" />
              </div>
            </div>
          </div>

          {/* Modules skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="v2-panel p-6">
                <div className="h-6 w-48 v2-skeleton" />
                <div className="mt-4 space-y-3">
                  <div className="h-14 v2-skeleton" />
                  <div className="h-14 v2-skeleton" />
                  <div className="h-14 v2-skeleton" />
                </div>
              </div>
              <div className="v2-panel p-6">
                <div className="h-6 w-44 v2-skeleton" />
                <div className="mt-4 h-36 v2-skeleton" />
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="v2-panel p-6">
                <div className="h-6 w-40 v2-skeleton" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-20 v2-skeleton" />
                  <div className="h-20 v2-skeleton" />
                  <div className="h-20 v2-skeleton" />
                  <div className="h-20 v2-skeleton" />
                </div>
              </div>
              <div className="v2-panel p-6">
                <div className="h-6 w-36 v2-skeleton" />
                <div className="mt-4 h-20 v2-skeleton" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-bg">
      <div className="v2-container max-w-6xl mx-auto space-y-6 pb-10">
        {/* HERO: layered, premium */}
        <section className="v2-panel p-6 sm:p-8 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/60 shadow-sm">
                <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }} />
                <span className="text-xs font-semibold text-slate-700">Donor Console</span>
              </div>

              <h1 className="mt-4 v2-title">Welcome back, {firstName}</h1>
              <p className="mt-2 v2-subtitle">
                Track eligibility, follow your requests, and keep your donation momentum.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/user/schedule-donation')}
                  disabled={!eligibility.canDonate}
                  className={`btn-modern ${eligibility.canDonate ? 'primary' : 'secondary'} rounded-2xl`}
                >
                  <CalendarIcon size={18} />
                  Schedule Donation
                </button>

                <button
                  onClick={() => navigate('/user/blood-requests')}
                  className="btn-modern secondary rounded-2xl"
                >
                  <DropletIcon size={18} />
                  Request Blood
                </button>

                <button
                  onClick={fetchDashboardData}
                  className="btn-modern secondary rounded-2xl"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* KPI cluster */}
            <div className="w-full lg:w-[440px] grid grid-cols-2 gap-3">
              <div className="v2-card v2-kpi p-4 animate-fade-up delay-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Total donations</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{dashboardData.stats.totalDonations}</div>
                  </div>
                  <div className="icon-box user-theme">
                    <HeartIcon size={20} />
                  </div>
                </div>
              </div>

              <div className="v2-card v2-kpi p-4 animate-fade-up delay-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Blood requests</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{dashboardData.stats.totalRequests}</div>
                  </div>
                  <div className="icon-box info">
                    <DocumentIcon size={20} />
                  </div>
                </div>
              </div>

              <div className="v2-card v2-kpi p-4 animate-fade-up delay-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Lives helped</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{dashboardData.stats.livesImpacted}</div>
                  </div>
                  <div className="icon-box success">
                    <UsersIcon size={20} />
                  </div>
                </div>
              </div>

              <div className="v2-card v2-kpi p-4 animate-fade-up delay-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Status</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">Donation eligibility</div>
                    <div className={`mt-1 text-xs font-semibold ${eligibility.canDonate ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {eligibility.message}
                    </div>
                  </div>
                  <div className={`icon-box ${eligibility.canDonate ? 'success' : 'warning'}`}>
                    {eligibility.canDonate ? <CheckIcon size={20} /> : <ClockIcon size={20} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions - Full Width Card */}
        <section className="v2-panel p-6 animate-fade-up delay-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-600">Shortcuts to your most used flows</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-white v2-tap"
              >
                <div className={`icon-box ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">{action.label}</div>
                <div className="mt-1 text-xs text-slate-600">Open</div>
              </button>
            ))}
          </div>
        </section>

        {/* Status Stack: Identity & Last Donation (Full Width) */}
        <section className="space-y-6 animate-fade-up delay-2">
          {/* Identity Card */}
          <div className="v2-panel p-6 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="blood-badge text-lg shrink-0"
                  style={{ width: '58px', height: '58px', fontSize: '1.125rem' }}
                  title={hasBloodType ? `Blood type: ${user?.bloodGroup}` : 'Blood type not set'}
                >
                  {user?.bloodGroup || '?'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Identity</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">Your blood type</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {hasBloodType ? user?.bloodGroup : 'Not set — update your profile.'}
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/user/profile')} className="btn-modern secondary rounded-xl p-2 h-auto w-auto">
                <ArrowRightIcon size={18} />
              </button>
            </div>
          </div>

          {/* Last Donation */}
          <div className="v2-panel p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">Last Donation</h2>
              <button onClick={() => navigate('/user/donations')} className="section-link text-xs">
                History <ArrowRightIcon size={14} />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              {dashboardData.lastDonation ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">Donation recorded</div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      {formatDate(dashboardData.lastDonation.date || dashboardData.lastDonation.createdAt || dashboardData.lastDonation.updatedAt)}
                    </div>
                  </div>
                  <div className="icon-box success scale-90" title="Thank you">
                    <GiftIcon size={18} />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  No donations recorded yet.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Active Requests - Full Width */}
        <section className="v2-panel overflow-hidden animate-fade-up delay-3">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200/60">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Active Requests</h2>
              <p className="text-xs text-slate-600 mt-1">Your most recent blood requests and urgency</p>
            </div>
            <button onClick={() => navigate('/user/blood-requests')} className="section-link">
              View all <ArrowRightIcon size={16} />
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {dashboardData.activeRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200">
                  <DropletIcon size={24} />
                </div>
                <div className="text-sm font-semibold text-slate-900">No active requests</div>
                <div className="mt-1 text-xs text-slate-600">Create a request if you or someone near you needs blood.</div>
                <div className="mt-4">
                  <button onClick={() => navigate('/user/blood-requests')} className="btn-modern primary rounded-xl px-4 py-2 text-sm">
                    Create request
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboardData.activeRequests.slice(0, 3).map((request) => (
                  <div
                    key={request._id}
                    className="group rounded-xl border border-slate-200/70 bg-white/70 backdrop-blur px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="blood-badge scale-90" style={{ minWidth: 40, height: 40 }}>
                          {request.bloodGroup}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {request.unitsRequired} units needed
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {request.hospitalId?.name || 'Pending assignment'}
                          </div>
                        </div>
                      </div>

                      <span className={`status-badge text-[10px] px-2 py-0.5 ${request.urgency === 'CRITICAL' ? 'critical' : 'pending'}`}>
                        {request.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDashboardPage;
