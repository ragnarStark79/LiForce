import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
import { staffService } from '../../services/staffService';
import { hospitalService } from '../../services/hospitalService';
import { BLOOD_GROUPS } from '../../utils/constants';

const StaffProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    staffPosition: '',
    department: '',
    hospitalId: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileResponse, hospitalsResponse] = await Promise.all([
        staffService.getProfile(),
        hospitalService.getHospitals().catch(() => ({ hospitals: [] }))
      ]);
      
      const userData = profileResponse.user || profileResponse;
      setProfileData(userData);
      setHospitals(hospitalsResponse.hospitals || []);
      
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        bloodGroup: userData.bloodGroup || '',
        staffPosition: userData.staffPosition || '',
        department: userData.department || '',
        hospitalId: userData.hospitalId?._id || userData.hospitalId || '',
        reason: '',
      });
      
      updateUser(userData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      notify.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await staffService.updateProfile(formData);
      const updatedUser = response.user || response;
      setProfileData(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      notify.update('Profile update request submitted! Please wait for admin approval.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit profile update';
      setErrors({ general: message });
      notify.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelUpdateRequest = async () => {
    setCancelling(true);
    try {
      const response = await staffService.cancelProfileUpdateRequest();
      const updatedUser = response.user || response;
      setProfileData(updatedUser);
      updateUser(updatedUser);
      notify.info('Profile update request cancelled');
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const isPendingUpdate = profileData?.profileUpdateStatus === 'PENDING';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayUser = profileData || user;

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      {/* Hero Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float" 
               style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center
                             text-5xl font-bold text-white shadow-2xl border-4 border-white/30">
                {displayUser?.name?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg
                             ${displayUser?.status === 'APPROVED' 
                               ? 'bg-green-500 text-white' 
                               : 'bg-amber-500 text-white'}`}>
                {displayUser?.status || 'Pending'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">{displayUser?.name}</h1>
              <p className="text-white/80 text-lg">{displayUser?.staffPosition || 'Staff Member'}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm">
                  🆔 {displayUser?.staffId || 'Not assigned'}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm">
                  🩸 {displayUser?.bloodGroup || 'Not set'}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm">
                  🏥 {displayUser?.department || 'No dept'}
                </span>
              </div>
            </div>

            {/* Status Card */}
            <div className="px-5 py-4 bg-white/20 backdrop-blur-sm rounded-2xl text-center">
              <p className="text-white/70 text-sm mb-1">Update Status</p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold
                              ${isPendingUpdate 
                                ? 'bg-amber-400 text-amber-900' 
                                : displayUser?.profileUpdateStatus === 'REJECTED'
                                  ? 'bg-red-400 text-red-900'
                                  : 'bg-green-400 text-green-900'}`}>
                {isPendingUpdate ? '🕐 Pending' : displayUser?.profileUpdateStatus === 'REJECTED' ? '✕ Rejected' : '✓ Up to date'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {isPendingUpdate && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 
                             flex items-center justify-center text-2xl shadow-lg">
                ⏳
              </div>
              <div>
                <h4 className="font-bold text-amber-800 text-lg">Profile Update Pending Approval</h4>
                <p className="text-amber-700 text-sm mt-1">
                  Your profile update request is being reviewed by the administrator.
                </p>
                {displayUser?.pendingProfileUpdate?.requestedAt && (
                  <p className="text-amber-600 text-xs mt-1">
                    Submitted: {formatDate(displayUser.pendingProfileUpdate.requestedAt)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCancelUpdateRequest}
              disabled={cancelling}
              className="px-4 py-2 bg-white text-amber-700 rounded-xl font-semibold text-sm
                        border border-amber-200 hover:bg-amber-50 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          </div>
        </div>
      )}

      {displayUser?.profileUpdateStatus === 'REJECTED' && (
        <div className="bg-linear-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-red-500 to-rose-600 
                           flex items-center justify-center text-2xl shadow-lg">
              ❌
            </div>
            <div>
              <h4 className="font-bold text-red-800 text-lg">Profile Update Rejected</h4>
              <p className="text-red-700 text-sm mt-1">
                {displayUser.profileUpdateRejectionReason || 'Your request was rejected by the administrator.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 
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
              { label: 'Email Verified', value: displayUser?.isEmailVerified ? '✓ Verified' : '✕ Not Verified', 
                icon: '✅', isStatus: true, verified: displayUser?.isEmailVerified },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 
                                         hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-600 text-sm">{item.label}</span>
                </div>
                <span className={`font-semibold ${item.isStatus 
                  ? (item.verified ? 'text-green-600' : 'text-amber-600') 
                  : 'text-gray-800'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Work Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 
                             flex items-center justify-center text-white text-sm">💼</span>
              Work Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Staff ID', value: displayUser?.staffId || 'Not assigned', icon: '🆔' },
              { label: 'Position', value: displayUser?.staffPosition || 'Not set', icon: '👔' },
              { label: 'Department', value: displayUser?.department || 'Not set', icon: '🏢' },
              { label: 'Account Status', value: displayUser?.status || 'N/A', icon: '📊' },
              { label: 'Member Since', value: formatDate(displayUser?.createdAt), icon: '📅' },
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
      </div>

      {/* Hospital Information */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-linear-to-br from-red-500 to-rose-600 
                           flex items-center justify-center text-white text-sm">🏥</span>
            Hospital Assignment
          </h3>
        </div>
        <div className="p-6">
          {displayUser?.hospitalId ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Hospital Name', value: displayUser.hospitalId.name || 'N/A', icon: '🏥' },
                { label: 'Hospital Code', value: displayUser.hospitalId.code || 'N/A', icon: '🔢' },
                { label: 'Address', value: displayUser.hospitalId.address || 'N/A', icon: '📍' },
                { label: 'City', value: displayUser.hospitalId.city || 'N/A', icon: '🌆' },
                { label: 'Phone', value: displayUser.hospitalId.phone || 'N/A', icon: '📞' },
                { label: 'Email', value: displayUser.hospitalId.email || 'N/A', icon: '✉️' },
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-linear-to-br from-red-50 to-rose-50 
                                           border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{item.icon}</span>
                    <span className="text-red-600 text-xs font-medium uppercase">{item.label}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 
                             flex items-center justify-center text-3xl">🏥</div>
              <p className="text-gray-500 font-medium">No hospital assigned</p>
              <p className="text-gray-400 text-sm mt-1">Contact admin for hospital assignment</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Update Preview */}
      {isPendingUpdate && displayUser?.pendingProfileUpdate && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
            <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 
                             flex items-center justify-center text-white text-sm">📝</span>
              Pending Changes (Awaiting Approval)
            </h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(displayUser.pendingProfileUpdate).filter(([key]) => 
                ['name', 'phone', 'bloodGroup', 'staffPosition', 'department'].includes(key)
              ).map(([key, value]) => (
                <div key={key} className="p-4 rounded-xl bg-linear-to-br from-amber-50 to-orange-50 
                                         border border-amber-200">
                  <p className="text-amber-700 text-xs font-medium uppercase mb-2">{key}</p>
                  <p className="text-gray-800">
                    <span className="text-gray-500">{displayUser[key] || 'Not set'}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold text-amber-800">{value}</span>
                  </p>
                </div>
              ))}
            </div>
            {displayUser.pendingProfileUpdate.reason && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-blue-700 text-xs font-medium uppercase mb-2">Reason for Update</p>
                <p className="text-blue-800 font-medium">{displayUser.pendingProfileUpdate.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-violet-600 
                             flex items-center justify-center text-white text-sm">✏️</span>
              {isEditing ? 'Edit Profile' : 'Update Profile'}
            </h3>
            {!isEditing && !isPendingUpdate && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-linear-to-r from-purple-500 to-violet-600 text-white 
                          rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl
                          transform transition-all duration-300 hover:scale-105"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                  {errors.general}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <strong>📋 Note:</strong> All profile changes require admin approval. Your current information will remain until approved.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
                <Select
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Blood Group' },
                    ...BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))
                  ]}
                  error={errors.bloodGroup}
                />
                <Input
                  label="Position"
                  name="staffPosition"
                  value={formData.staffPosition}
                  onChange={handleChange}
                  error={errors.staffPosition}
                  placeholder="e.g., Doctor, Nurse, Technician"
                />
                <Input
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  error={errors.department}
                  placeholder="e.g., Emergency, Surgery, Lab"
                />
                <Select
                  label="Hospital (for transfer)"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Hospital' },
                    ...hospitals.map(h => ({ value: h._id, label: `${h.name} (${h.code})` }))
                  ]}
                  error={errors.hospitalId}
                />
              </div>

              <Input
                label="Reason for Update"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide a reason for this update request..."
              />

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profileData?.name || '',
                      phone: profileData?.phone || '',
                      bloodGroup: profileData?.bloodGroup || '',
                      staffPosition: profileData?.staffPosition || '',
                      department: profileData?.department || '',
                      hospitalId: profileData?.hospitalId?._id || '',
                      reason: '',
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold
                            hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <Button variant="primary" type="submit" loading={saving}>
                  Submit for Approval
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 
                             flex items-center justify-center text-4xl">
                {isPendingUpdate ? '⏳' : '✏️'}
              </div>
              <p className="text-gray-500 font-medium">
                {isPendingUpdate 
                  ? 'Editing is disabled while your update request is pending.'
                  : 'Click "Edit Profile" to update your information.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
