import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';
import { useNotification } from '../../components/common/NotificationSystem';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

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
    const variants = {
      PENDING: 'warning',
      ASSIGNED: 'info',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      NORMAL: 'secondary',
      HIGH: 'warning',
      CRITICAL: 'error',
    };
    return <Badge variant={variants[urgency] || 'secondary'}>{urgency}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">My Blood Requests</h1>
          <p className="text-neutral-600 mt-2">Track and manage your blood requests</p>
        </div>
        <Button variant="primary" onClick={() => setShowNewRequestModal(true)}>+ New Request</Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-neutral-500">
            <div className="text-6xl mb-4">🩸</div>
            <p className="text-lg mb-2">No blood requests yet</p>
            <p className="text-sm mb-4">Create your first blood request to get started</p>
            <Button variant="primary" onClick={() => setShowNewRequestModal(true)}>Create Request</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map(request => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-primary-600">{request.bloodGroup}</span>
                    {getStatusBadge(request.status)}
                    {getUrgencyBadge(request.urgency)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Hospital</p>
                      <p className="font-medium">{request.hospitalId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Units Required</p>
                      <p className="font-medium">{request.unitsRequired} units</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Requested On</p>
                      <p className="font-medium">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                  {request.patientName && (
                    <p className="text-sm text-neutral-600 mt-2">
                      <span className="font-medium">Patient:</span> {request.patientName}
                    </p>
                  )}
                </div>
                {request.status === 'PENDING' && (
                  <Button variant="danger" size="sm" onClick={() => handleCancel(request._id)}>Cancel</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showNewRequestModal} onClose={() => setShowNewRequestModal(false)} title="Create Blood Request" size="lg">
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
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowNewRequestModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserBloodRequestsPage;
