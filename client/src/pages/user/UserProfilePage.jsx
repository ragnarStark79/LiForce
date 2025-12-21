import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { useNotification } from '../../components/common/NotificationSystem';
import { BLOOD_GROUPS } from '../../utils/constants';
import {
  HeartIcon,
  DocumentIcon,
  CalendarIcon,
  DropletIcon,
  GiftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  UserIcon,
  ChatIcon,
  AlertIcon
} from '../../components/common/DashboardIcons';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ totalDonations: 0, totalRequests: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await userService.getDashboard();
      setStats({
        totalDonations: data.stats?.totalDonations || 0,
        totalRequests: data.stats?.totalRequests || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      const userData = response.user || response;
      setProfileData(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bloodGroup: userData.bloodGroup || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zipCode || '',
      });
      updateUser(userData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (user) {
        setProfileData(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bloodGroup: user.bloodGroup || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await userService.updateProfile(formData);
      const updatedUser = response.user || response;
      setProfileData(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      notify.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      notify.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayUser = profileData || user;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const completion = (() => {
    const fields = ['name', 'email', 'phone', 'bloodGroup', 'address', 'city', 'state', 'zipCode'];
    const filled = fields.filter((k) => Boolean(displayUser?.[k]) || Boolean(formData?.[k])).length;
    return Math.round((filled / fields.length) * 100);
  })();

  // Define account detail fields with icons
  const accountFields = [
    { label: 'Full Name', key: 'name', icon: UserIcon, color: 'user-theme' },
    { label: 'Email', key: 'email', icon: ChatIcon, color: 'info' },
    { label: 'Phone', key: 'phone', icon: CalendarIcon, color: 'success' },
    { label: 'Blood Group', key: 'bloodGroup', icon: DropletIcon, color: 'danger' },
    { label: 'Address', key: 'address', icon: DocumentIcon, color: 'user-theme' },
    { label: 'City', key: 'city', icon: HeartIcon, color: 'info' },
    { label: 'State', key: 'state', icon: GiftIcon, color: 'warning' },
    { label: 'ZIP Code', key: 'zipCode', icon: CheckIcon, color: 'success' },
  ];

  const quickActions = [
    { label: 'Schedule Donation', icon: CalendarIcon, path: '/user/schedule-donation', color: 'success' },
    { label: 'Request Blood', icon: DropletIcon, path: '/user/blood-requests', color: 'danger' },
    { label: 'View Donations', icon: GiftIcon, path: '/user/donations', color: 'user-theme' },
    { label: 'Dashboard', icon: ArrowRightIcon, path: '/user/dashboard', color: 'info' },
  ];

  if (loading) {
    return (
      <div className="v2-bg min-h-screen">
        <div className="v2-container max-w-5xl mx-auto space-y-6 pb-10 px-4 pt-6">
          {/* Hero skeleton */}
          <div className="v2-panel p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="h-16 w-16 rounded-2xl v2-skeleton shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="h-6 w-40 v2-skeleton" />
                <div className="h-5 w-56 v2-skeleton v2-skeleton-muted" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="h-20 rounded-xl v2-skeleton" />
              <div className="h-20 rounded-xl v2-skeleton" />
              <div className="h-20 rounded-xl v2-skeleton" />
              <div className="h-20 rounded-xl v2-skeleton" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 v2-panel p-5">
              <div className="h-6 w-40 v2-skeleton" />
              <div className="mt-4 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl v2-skeleton" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <div className="v2-panel p-5">
                <div className="h-6 w-32 v2-skeleton" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-xl v2-skeleton" />
                  <div className="h-20 rounded-xl v2-skeleton" />
                  <div className="h-20 rounded-xl v2-skeleton" />
                  <div className="h-20 rounded-xl v2-skeleton" />
                </div>
              </div>
              <div className="v2-panel p-5">
                <div className="h-6 w-36 v2-skeleton" />
                <div className="mt-4 space-y-3">
                  <div className="h-14 rounded-xl v2-skeleton" />
                  <div className="h-14 rounded-xl v2-skeleton" />
                  <div className="h-14 rounded-xl v2-skeleton" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-bg min-h-screen">
      <div className="v2-container max-w-5xl mx-auto space-y-6 pb-10 px-4 pt-6">
        {/* HERO */}
        <section className="v2-panel p-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="rounded-2xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                   style={{ width: '64px', height: '64px' }}>
                {displayUser?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border shadow-sm ${displayUser?.isEmailVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                {displayUser?.isEmailVerified ? '✓' : '!'}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 bg-white/60 shadow-sm mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-slate-600">Profile</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{displayUser?.name || 'Your profile'}</h1>
              <p className="text-sm text-slate-500 truncate">{displayUser?.email || '—'}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="blood-badge" style={{ minWidth: '36px', height: '28px', fontSize: '12px', padding: '0 10px' }}>
                  {displayUser?.bloodGroup || '?'}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                  Since {formatDate(displayUser?.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={fetchProfile} className="btn-modern secondary rounded-xl text-sm px-4 py-2">
                Refresh
              </button>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-modern primary rounded-xl text-sm px-4 py-2">
                  Edit <ArrowRightIcon size={14} />
                </button>
              ) : (
                <button onClick={() => setIsEditing(false)} className="btn-modern secondary rounded-xl text-sm px-4 py-2">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* KPI row */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="v2-card p-4 animate-fade-up delay-1">
              <div className="flex items-center gap-3">
                <div className="icon-box user-theme" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                  <HeartIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Donations</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalDonations}</div>
                </div>
              </div>
            </div>

            <div className="v2-card p-4 animate-fade-up delay-2">
              <div className="flex items-center gap-3">
                <div className="icon-box info" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                  <DocumentIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Requests</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalRequests}</div>
                </div>
              </div>
            </div>

            <div className="v2-card p-4 animate-fade-up delay-3">
              <div className="flex items-center gap-3">
                <div className="icon-box success" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                  <GiftIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Lives helped</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalDonations * 3}</div>
                </div>
              </div>
            </div>

            <div className="v2-card p-4 animate-fade-up delay-4">
              <div className="flex items-center gap-3">
                <div className={`icon-box ${completion >= 70 ? 'success' : 'warning'}`} style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                  {completion >= 70 ? <CheckIcon size={18} /> : <ClockIcon size={18} />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Complete</div>
                  <div className="text-2xl font-bold text-slate-900">{completion}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT - Grid layout: 3 columns for details, 2 for sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Account Details */}
          <div className="lg:col-span-3">
            {isEditing ? (
              <div className="v2-panel overflow-hidden animate-fade-up">
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Edit Profile</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Update your personal information</p>
                  </div>
                </div>

                <div className="p-5">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                        >
                          <option value="">Select Blood Group</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn-modern secondary rounded-xl text-sm px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-modern primary rounded-xl text-sm px-5 py-2"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="v2-panel overflow-hidden animate-fade-up">
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Account Details</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Your personal & location information</p>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="section-link text-sm">
                    Edit <ArrowRightIcon size={14} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="space-y-2.5">
                    {accountFields.map((field) => {
                      const IconComponent = field.icon;
                      const value = displayUser?.[field.key] || 'Not provided';
                      return (
                        <div
                          key={field.key}
                          className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 backdrop-blur px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
                        >
                          <div className={`icon-box ${field.color}`} style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }}>
                            <IconComponent size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{field.label}</div>
                            <div className="text-sm font-semibold text-slate-800 truncate">{value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Actions + Security */}
          <div className="lg:col-span-2 space-y-5">
            {/* Quick Actions */}
            <div className="v2-panel p-5 animate-fade-up delay-5">
              <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Jump to main flows</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="group rounded-xl border border-slate-200 bg-white/70 backdrop-blur p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
                  >
                    <div className={`icon-box ${action.color}`} style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                      <action.icon size={16} />
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-800 leading-tight">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Status */}
            <div className="v2-panel p-5 animate-fade-up delay-6">
              <h2 className="text-base font-semibold text-slate-900">Security Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Account verification</p>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3">
                  <div className={`icon-box ${displayUser?.isEmailVerified ? 'success' : 'warning'}`} style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    {displayUser?.isEmailVerified ? <CheckIcon size={16} /> : <AlertIcon size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Email Verification</div>
                    <div className={`text-xs font-medium ${displayUser?.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {displayUser?.isEmailVerified ? 'Verified' : 'Not verified'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3">
                  <div className="icon-box success" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    <CheckIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Account Status</div>
                    <div className="text-xs font-medium text-emerald-600">Active</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3">
                  <div className={`icon-box ${completion >= 70 ? 'success' : 'warning'}`} style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    {completion >= 70 ? <CheckIcon size={16} /> : <ClockIcon size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Profile Completion</div>
                    <div className={`text-xs font-medium ${completion >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {completion}% complete
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;
