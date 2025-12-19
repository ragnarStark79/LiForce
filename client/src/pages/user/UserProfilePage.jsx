import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { useNotification } from '../../components/common/NotificationSystem';
import { BLOOD_GROUPS } from '../../utils/constants';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { notify } = useNotification();
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in p-4">
      {/* Hero Profile Header - Softer Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 border border-gray-100 shadow-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-pink-100/30 to-rose-100/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center
                             text-4xl font-bold text-white shadow-lg">
                {displayUser?.name?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              <div className={`absolute -bottom-2 -right-2 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md
                             ${displayUser?.isEmailVerified
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 text-white'}`}>
                {displayUser?.isEmailVerified ? '✔ Verified' : '⚠ Unverified'}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{displayUser?.name}</h1>
              <p className="text-gray-600 text-base flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className="text-lg">✉️</span> {displayUser?.email}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-gray-700 text-sm font-medium border border-gray-200 shadow-sm">
                  🩸 {displayUser?.bloodGroup || 'Not set'}
                </span>
                <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-gray-700 text-sm font-medium border border-gray-200 shadow-sm">
                  📅 Member since {formatDate(displayUser?.createdAt)}
                </span>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-md 
                         hover:shadow-lg transform transition-all duration-300 hover:scale-105
                         flex items-center gap-2"
              >
                <span>✏️</span> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Compact & Elegant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Donations', value: stats.totalDonations, icon: '💝', color: 'from-rose-400 to-pink-500', bgColor: 'bg-rose-50', textColor: 'text-rose-600' },
          { label: 'Requests', value: stats.totalRequests, icon: '🩸', color: 'from-red-400 to-rose-500', bgColor: 'bg-red-50', textColor: 'text-red-600' },
          { label: 'Lives Saved', value: stats.totalDonations * 3, icon: '❤️', color: 'from-pink-400 to-rose-500', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
          { label: 'Points', value: stats.totalDonations * 100, icon: '⭐', color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                {stat.icon}
              </div>
              <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 
                             flex items-center justify-center text-white text-sm">✏️</span>
              Update Your Information
            </h3>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transform transition-all hover:scale-105 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden h-full">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 
                               flex items-center justify-center text-white text-sm">👤</span>
                Personal Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Full Name', value: displayUser?.name, icon: '📝' },
                { label: 'Email', value: displayUser?.email, icon: '✉️' },
                { label: 'Phone', value: displayUser?.phone || 'Not provided', icon: '📱' },
                { label: 'Blood Group', value: displayUser?.bloodGroup || 'Not set', icon: '🩸' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 
                                           hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-gray-600 text-sm">{item.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden h-full">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 
                               flex items-center justify-center text-white text-sm">📍</span>
                Contact & Address
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Address', value: displayUser?.address || 'Not provided', icon: '🏠' },
                { label: 'City', value: displayUser?.city || 'Not provided', icon: '🌆' },
                { label: 'State', value: displayUser?.state || 'Not provided', icon: '🗺️' },
                { label: 'ZIP Code', value: displayUser?.zipCode || 'Not provided', icon: '📮' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 
                                           hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-gray-600 text-sm">{item.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Compact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Schedule Donation', icon: '📅', color: 'from-emerald-500 to-teal-500', bgHover: 'hover:from-emerald-600 hover:to-teal-600', href: '/user/schedule-donation' },
          { label: 'Request Blood', icon: '🩸', color: 'from-rose-500 to-pink-500', bgHover: 'hover:from-rose-600 hover:to-pink-600', href: '/user/blood-requests' },
          { label: 'View Donations', icon: '💝', color: 'from-purple-500 to-indigo-500', bgHover: 'hover:from-purple-600 hover:to-indigo-600', href: '/user/donations' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${action.color} ${action.bgHover} 
                       shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer
                       flex items-center justify-between text-white no-underline`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                {action.icon}
              </div>
              <div>
                <p className="font-bold text-lg m-0 leading-tight">{action.label}</p>
                <p className="text-white/80 text-sm mt-1 mb-0">Click to proceed</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>

    </div>
  );
};

export default UserProfilePage;
