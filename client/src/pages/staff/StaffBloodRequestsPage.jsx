import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { staffService } from '../../services/staffService';
import { BLOOD_GROUPS, REQUEST_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StaffBloodRequestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    bloodGroup: 'A+',
    units: 1,
    urgency: 'NORMAL',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchRequests();
    fetchPatients();
  }, [currentPage, statusFilter, bloodGroupFilter, urgencyFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;

      const data = await staffService.getBloodRequests(params);
      setRequests(data.requests || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await staffService.getPatients({ limit: 100 });
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      bloodGroup: 'A+',
      units: 1,
      urgency: 'NORMAL',
      reason: '',
      notes: '',
    });
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await staffService.createBloodRequest(formData);
      toast.success('Blood request created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await staffService.updateBloodRequest(requestId, { status: newStatus });
      toast.success(`Request ${newStatus.toLowerCase()} successfully!`);
      fetchRequests();
      if (showDetailsModal) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    }
  };

  const handleFulfillRequest = async (requestId) => {
    try {
      await staffService.fulfillBloodRequest(requestId);
      toast.success('Request fulfilled successfully!');
      fetchRequests();
      setShowDetailsModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fulfill request');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      APPROVED: 'info',
      FULFILLED: 'success',
      REJECTED: 'error',
      CANCELLED: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      LOW: 'secondary',
      NORMAL: 'info',
      HIGH: 'warning',
      CRITICAL: 'error',
    };
    return <Badge variant={variants[urgency] || 'secondary'}>{urgency}</Badge>;
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  if (loading && requests.length === 0) {
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
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Blood Requests
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage and process blood requests for patients
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + New Request
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'FULFILLED', label: 'Fulfilled' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
          <Select
            value={bloodGroupFilter}
            onChange={(e) => {
              setBloodGroupFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Blood Groups' },
              ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
            ]}
          />
          <Select
            value={urgencyFilter}
            onChange={(e) => {
              setUrgencyFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Urgency Levels' },
              { value: 'LOW', label: 'Low' },
              { value: 'NORMAL', label: 'Normal' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
          />
          <Button
            variant="secondary"
            onClick={() => {
              setStatusFilter('');
              setBloodGroupFilter('');
              setUrgencyFilter('');
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Requests List */}
      <Card>
        {requests.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-6xl mb-4">🩸</div>
            <p className="text-lg mb-2">No blood requests found</p>
            <p className="text-sm">Create a new request to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Request ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Blood Group</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Units</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Urgency</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-neutral-600">
                        #{request._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-neutral-800">
                        {request.patient?.name || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary">{request.bloodGroup}</Badge>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {request.units} unit(s)
                    </td>
                    <td className="py-3 px-4">
                      {getUrgencyBadge(request.urgency)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openDetailsModal(request)}
                        >
                          View
                        </Button>
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleUpdateStatus(request._id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleUpdateStatus(request._id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleFulfillRequest(request._id)}
                          >
                            Fulfill
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Blood Request"
        size="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <Select
            label="Patient"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            options={[
              { value: '', label: 'Select a patient' },
              ...patients.map((p) => ({ value: p._id, label: `${p.name} (${p.bloodGroup})` })),
            ]}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Blood Group Required"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
            />
            <Input
              label="Units Required"
              type="number"
              min="1"
              max="10"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
              required
            />
          </div>
          <Select
            label="Urgency Level"
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'NORMAL', label: 'Normal' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical - Emergency' },
            ]}
          />
          <Input
            label="Reason for Request"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Surgery, transfusion, emergency, etc."
            required
          />
          <Input
            label="Additional Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRequest(null);
        }}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-500">Request ID</label>
                <p className="font-mono font-medium">
                  #{selectedRequest._id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm text-neutral-500">Status</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <label className="text-sm text-neutral-500">Patient Name</label>
                <p className="font-medium">{selectedRequest.patient?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-neutral-500">Blood Group</label>
                <div className="mt-1">
                  <Badge variant="primary">{selectedRequest.bloodGroup}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-500">Units Required</label>
                <p className="font-medium">{selectedRequest.units} unit(s)</p>
              </div>
              <div>
                <label className="text-sm text-neutral-500">Urgency</label>
                <div className="mt-1">{getUrgencyBadge(selectedRequest.urgency)}</div>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-neutral-500">Reason</label>
                <p className="font-medium">{selectedRequest.reason || 'Not specified'}</p>
              </div>
              {selectedRequest.notes && (
                <div className="col-span-2">
                  <label className="text-sm text-neutral-500">Notes</label>
                  <p className="text-neutral-600">{selectedRequest.notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-neutral-500">Created</label>
                <p className="text-neutral-600">{formatDate(selectedRequest.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm text-neutral-500">Last Updated</label>
                <p className="text-neutral-600">{formatDate(selectedRequest.updatedAt)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              {selectedRequest.status === 'PENDING' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatus(selectedRequest._id, 'APPROVED')}
                  >
                    Approve Request
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus(selectedRequest._id, 'REJECTED')}
                  >
                    Reject Request
                  </Button>
                </>
              )}
              {selectedRequest.status === 'APPROVED' && (
                <Button
                  variant="success"
                  onClick={() => handleFulfillRequest(selectedRequest._id)}
                >
                  Fulfill Request
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffBloodRequestsPage;
