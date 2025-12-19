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
        <Modal isOpen={showNewRequestModal} onClose={() => setShowNewRequestModal(false)} title="New Blood Request" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Hospital"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              options={hospitals.map(h => ({ value: h._id, label: `${h.name} (${h.city || h.code})` }))}
              placeholder="Select a hospital"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                placeholder="Select blood group"
                required
              />
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
            <Select
              label="Urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              options={URGENCY_LEVELS.map(u => ({ value: u, label: u }))}
            />
            <Input
              label="Patient Name (Optional)"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient name"
            />
            <Input
              label="Medical Reason (Optional)"
              name="medicalReason"
              value={formData.medicalReason}
              onChange={handleChange}
              placeholder="e.g., Surgery, Accident, etc."
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowNewRequestModal(false)}
                className="btn-modern secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="btn-modern primary"
              >
                {formLoading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UserBloodRequestsPage;
