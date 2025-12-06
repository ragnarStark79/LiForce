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
  }, []);

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
      // Fallback to context user
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
      notify.success('Your profile has been updated successfully!');
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in-up">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-rose-500 p-8 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm p-1 shadow-2xl
                            transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-white to-gray-100 
                              flex items-center justify-center text-5xl font-bold text-primary-600 shadow-inner">
                {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg
                               flex items-center justify-center text-primary-600 hover:bg-primary-50
                               transform transition-all duration-300 hover:scale-110 hover:rotate-12">
              📷
            </button>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl bg-white/30 pulse-ring" />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              {displayUser?.name}
            </h1>
            <p className="text-white/80 text-lg mb-4">{displayUser?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium
                               border border-white/30 shadow-lg">
                🩸 {displayUser?.bloodGroup || 'Not Set'}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium
                               border border-white/30 shadow-lg">
                ✓ {displayUser?.isEmailVerified ? 'Verified' : 'Unverified'}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium
                               border border-white/30 shadow-lg">
                📅 Joined {formatDate(displayUser?.createdAt)}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl shadow-lg
                         hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1
                         flex items-center gap-2"
            >
              <span>✏️</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Donations', value: displayUser?.totalDonations || 0, icon: '💝', color: 'from-rose-500 to-pink-600' },
          { label: 'Requests', value: displayUser?.totalRequests || 0, icon: '🩸', color: 'from-red-500 to-rose-600' },
          { label: 'Lives Saved', value: (displayUser?.totalDonations || 0) * 3, icon: '❤️', color: 'from-pink-500 to-red-600' },
          { label: 'Points', value: (displayUser?.totalDonations || 0) * 100, icon: '⭐', color: 'from-amber-500 to-orange-600' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 shadow-xl
                        transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 card-hover
                        stagger-${index + 1} fade-in-up`}
            style={{ animationFillMode: 'both' }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative">
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-white/80 text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
              👤
            </span>
            {isEditing ? 'Edit Your Information' : 'Personal Information'}
          </h2>
        </div>

        <div className="p-8">
          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>👤</span> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                               focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                               transition-all duration-300 outline-none"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>✉️</span> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl
                               text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>📱</span> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                               focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                               transition-all duration-300 outline-none"
                    required
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>🩸</span> Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                               focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                               transition-all duration-300 outline-none appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📍</span> Address Information
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your street address"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                                 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                                 transition-all duration-300 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                                   focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                                   transition-all duration-300 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                                   focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                                   transition-all duration-300 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="ZIP Code"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                                   focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                                   transition-all duration-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profileData?.name || '',
                      email: profileData?.email || '',
                      phone: profileData?.phone || '',
                      bloodGroup: profileData?.bloodGroup || '',
                      address: profileData?.address || '',
                      city: profileData?.city || '',
                      state: profileData?.state || '',
                      zipCode: profileData?.zipCode || '',
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl
                             hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-rose-500 text-white font-semibold rounded-xl
                             shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                             flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Display Mode */
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField icon="👤" label="Full Name" value={displayUser?.name} />
                <InfoField icon="✉️" label="Email" value={displayUser?.email} verified={displayUser?.isEmailVerified} />
                <InfoField icon="📱" label="Phone" value={displayUser?.phone || 'Not provided'} />
                <InfoField icon="🩸" label="Blood Group" value={displayUser?.bloodGroup || 'Not set'} highlight />
              </div>

              {/* Address Section */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📍</span>
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InfoField icon="🏠" label="Street Address" value={displayUser?.address || 'Not provided'} />
                  </div>
                  <InfoField icon="🏙️" label="City" value={displayUser?.city || 'Not provided'} />
                  <InfoField icon="🗺️" label="State" value={displayUser?.state || 'Not provided'} />
                  <InfoField icon="📮" label="ZIP Code" value={displayUser?.zipCode || 'Not provided'} />
                </div>
              </div>

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">⚙️</span>
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField icon="📅" label="Member Since" value={formatDate(displayUser?.createdAt)} />
                  <InfoField icon="🔄" label="Last Updated" value={formatDate(displayUser?.updatedAt)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Schedule Donation', icon: '📅', color: 'from-emerald-500 to-teal-600', href: '/user/schedule-donation' },
          { label: 'Request Blood', icon: '🩸', color: 'from-red-500 to-rose-600', href: '/user/blood-requests' },
          { label: 'View Donations', icon: '💝', color: 'from-pink-500 to-rose-600', href: '/user/donations' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.color} p-6 shadow-xl
                        transform transition-all duration-500 hover:scale-105 hover:-translate-y-2
                        group cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 
                            group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center gap-4">
              <span className="text-4xl">{action.icon}</span>
              <div>
                <p className="text-white font-bold text-lg">{action.label}</p>
                <p className="text-white/70 text-sm">Click to proceed →</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// Info Field Component
const InfoField = ({ icon, label, value, verified, highlight }) => (
  <div className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md
                   ${highlight ? 'bg-gradient-to-r from-primary-50 to-rose-50 border-2 border-primary-100' : 'bg-gray-50'}`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-gray-500">{label}</span>
      {verified !== undefined && (
        <span className={`ml-auto text-xs px-2 py-1 rounded-full ${verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {verified ? '✓ Verified' : 'Unverified'}
        </span>
      )}
    </div>
    <p className={`font-semibold ${highlight ? 'text-primary-700 text-lg' : 'text-gray-800'}`}>
      {value}
    </p>
  </div>
);

export default UserProfilePage;
