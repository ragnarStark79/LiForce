import { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';
import { useNotification } from '../../components/common/NotificationSystem';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import {
  DropletIcon,
  ClockIcon,
  CheckIcon,
  AlertIcon,
  ArrowRightIcon
} from '../../components/common/DashboardIcons';

const UserBloodRequestsPage = () => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: '',
    bloodGroup: '',
    unitsRequired: 1,
    urgency: 'NORMAL',
    patientName: '',
    medicalReason: '',
    notes: '',
  });

  useEffect(() => {
    fetchRequests();
    fetchHospitals();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await userService.getBloodRequests();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      notify.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const data = await userService.getHospitals();
      setHospitals(data.hospitals || []);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await userService.cancelBloodRequest(requestId);
      notify.info('Blood request has been cancelled');
      fetchRequests();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospitalId || !formData.bloodGroup) {
      notify.warning('Please select hospital and blood group');
      return;
    }
    try {
      setFormLoading(true);
      await userService.createBloodRequest(formData);
      notify.request('Your blood request has been submitted successfully!');
      setShowNewRequestModal(false);
      setFormData({
        hospitalId: '',
        bloodGroup: '',
        unitsRequired: 1,
        urgency: 'NORMAL',
        patientName: '',
        medicalReason: '',
        notes: '',
      });
      fetchRequests();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { class: 'pending', icon: ClockIcon },
      ASSIGNED: { class: 'in-progress', icon: CheckIcon },
      IN_PROGRESS: { class: 'in-progress', icon: ClockIcon },
      COMPLETED: { class: 'completed', icon: CheckIcon },
      CANCELLED: { class: 'pending', icon: null },
    };
    return styles[status] || styles.PENDING;
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      NORMAL: 'pending',
      HIGH: 'pending',
      CRITICAL: 'critical',
    };
    return styles[urgency] || 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="dashboard-page user-theme">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div className="dashboard-header" style={{ marginBottom: 0 }}>
            <h1>Blood Requests</h1>
            <p>Manage your blood requests</p>
          </div>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="btn-modern primary"
          >
            <DropletIcon size={18} />
            New Request
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="glass-card-solid p-12 text-center animate-fade-up delay-1">
            <div className="icon-box danger mx-auto mb-4" style={{ width: '64px', height: '64px' }}>
              <DropletIcon size={32} />
            </div>
            <p className="text-gray-700 font-medium mb-2">No blood requests yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first request to get started</p>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="btn-modern primary"
            >
              Create Request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request, index) => {
              const statusInfo = getStatusBadge(request.status);
              const urgencyClass = getUrgencyBadge(request.urgency);

              return (
                <div
                  key={request._id}
                  className="glass-card-solid p-5 animate-fade-up"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="blood-badge text-lg">
                        {request.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.icon && <statusInfo.icon size={12} />}
                            {request.status}
                          </span>
                          <span className={`status-badge ${urgencyClass}`}>
                            {request.urgency === 'CRITICAL' && (
                              <span className="status-dot error" style={{ width: '5px', height: '5px' }} />
                            )}
                            {request.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.hospitalId?.name || 'N/A'} • {request.unitsRequired} units
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(request.createdAt)}
                        </p>
                        {request.patientName && (
                          <p className="text-xs text-gray-500 mt-2">
                            Patient: {request.patientName}
                          </p>
                        )}
                      </div>
                    </div>
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(request._id)}
                        className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors
                                  px-3 py-1.5 rounded-lg hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <Modal 
          isOpen={showNewRequestModal} 
          onClose={() => setShowNewRequestModal(false)} 
          title="New Blood Request" 
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hospital Selection - Featured Section */}
            <div className="bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-2xl p-5 border border-red-100/60 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Select Hospital</h3>
              </div>
              <Select
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
                options={hospitals.map(h => ({ value: h._id, label: `${h.name} (${h.city || h.code})` }))}
                placeholder="Choose a hospital"
                required
              />
            </div>

            {/* Blood Requirements - Grid Section */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DropletIcon size={18} className="text-red-500" />
                Blood Requirements
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Select
                    label="Blood Group"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                    placeholder="Select type"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Units Required"
                    type="number"
                    name="unitsRequired"
                    value={formData.unitsRequired}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                  />
                </div>
              </div>
              
              {/* Urgency Level */}
              <div className="mt-4">
                <Select
                  label="Urgency Level"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  options={URGENCY_LEVELS.map(u => ({ value: u, label: u }))}
                />
                {formData.urgency === 'CRITICAL' && (
                  <div className="mt-2 flex items-start gap-2 p-3 bg-red-50/80 border border-red-200 rounded-xl">
                    <AlertIcon size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700">
                      Critical requests are prioritized and will be processed immediately.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Information - Optional Section */}
            <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/60">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Patient Information</h3>
                <span className="text-xs text-gray-400 ml-auto">(Optional)</span>
              </div>
              <div className="space-y-4">
                <Input
                  label="Patient Name"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient full name"
                />
                <Input
                  label="Medical Reason"
                  name="medicalReason"
                  value={formData.medicalReason}
                  onChange={handleChange}
                  placeholder="e.g., Surgery, Accident, Anemia, etc."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewRequestModal(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 
                         rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md
                         hover:border-gray-300"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 
                         rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 
                         shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {formLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Request...
                  </>
                ) : (
                  <>
                    <DropletIcon size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UserBloodRequestsPage;
