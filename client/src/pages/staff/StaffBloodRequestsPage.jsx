import { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { staffService } from '../../services/staffService';
import { BLOOD_GROUPS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StaffBloodRequestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchingPatients, setSearchingPatients] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    bloodGroup: 'A+',
    units: 1,
    urgency: 'NORMAL',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, bloodGroupFilter, urgencyFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientSearch.trim().length >= 2) {
        searchPatients(patientSearch);
      } else {
        setPatientSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;

      const data = await staffService.getBloodRequests(params);
      setRequests(data.requests || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load blood requests';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query) => {
    try {
      setSearchingPatients(true);
      const data = await staffService.searchPatients(query);
      setPatientSuggestions(data.patients || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to search patients:', err);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(`${patient.name} - ${patient.phone}`);
    setFormData({
      ...formData,
      patientId: patient._id,
      patientName: patient.name,
      bloodGroup: patient.bloodGroup || formData.bloodGroup,
    });
    setShowSuggestions(false);
  };

  const clearPatientSelection = () => {
    setSelectedPatient(null);
    setPatientSearch('');
    setFormData({ ...formData, patientId: '', patientName: '' });
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      bloodGroup: 'A+',
      units: 1,
      urgency: 'NORMAL',
      reason: '',
      notes: '',
    });
    setPatientSearch('');
    setSelectedPatient(null);
    setPatientSuggestions([]);
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignRequest = async (requestId) => {
    try {
      await staffService.assignRequest(requestId);
      toast.success('Request assigned to you successfully!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign request');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await staffService.updateRequestStatus(requestId, newStatus);
      toast.success(`Request status updated to ${newStatus.toLowerCase()}!`);
      fetchRequests();
      if (showDetailsModal) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
      ASSIGNED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '👤' },
      IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🔄' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: '✕' },
    };
    const c = config[status] || config.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
        {c.icon} {status}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const config = {
      NORMAL: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '○' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⚡' },
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚨' },
    };
    const c = config[urgency] || config.NORMAL;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
        {c.icon} {urgency}
      </span>
    );
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Stats calculations
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    critical: requests.filter(r => r.urgency === 'CRITICAL').length,
  };

  if (error && !loading && requests.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-red-600 via-rose-600 to-pink-700 p-8 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          </div>
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Requests</h1>
            <p className="text-white/80 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchRequests} className="bg-white text-red-600">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-red-600 via-rose-600 to-pink-700 p-8 shadow-2xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-float" 
               style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                🩸 Blood Requests
              </h1>
              <p className="text-white/80 text-lg">
                Manage and process blood requests for patients
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-red-600 rounded-2xl font-bold shadow-lg
                        hover:shadow-xl transform transition-all duration-300 hover:scale-105
                        flex items-center gap-2"
            >
              <span className="text-xl">+</span> New Request
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Requests', value: stats.total, icon: '📋', color: 'from-white/20 to-white/10' },
              { label: 'Pending', value: stats.pending, icon: '⏳', color: 'from-amber-400/30 to-amber-500/20' },
              { label: 'In Progress', value: stats.inProgress, icon: '🔄', color: 'from-blue-400/30 to-blue-500/20' },
              { label: 'Critical', value: stats.critical, icon: '🚨', color: 'from-red-400/30 to-red-500/20' },
            ].map((stat, index) => (
              <div key={index} className={`bg-linear-to-br ${stat.color} backdrop-blur-sm rounded-2xl p-4 text-center
                                          border border-white/20 hover:border-white/40 transition-all duration-300`}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/70 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: '', label: '🔘 All Statuses' },
                { value: 'PENDING', label: '⏳ Pending' },
                { value: 'ASSIGNED', label: '👤 Assigned' },
                { value: 'IN_PROGRESS', label: '🔄 In Progress' },
                { value: 'COMPLETED', label: '✓ Completed' },
                { value: 'CANCELLED', label: '✕ Cancelled' },
              ]}
            />
          </div>
          <div className="flex-1">
            <Select
              value={bloodGroupFilter}
              onChange={(e) => { setBloodGroupFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: '', label: '🩸 All Blood Groups' },
                ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: `🩸 ${bg}` })),
              ]}
            />
          </div>
          <div className="flex-1">
            <Select
              value={urgencyFilter}
              onChange={(e) => { setUrgencyFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: '', label: '⚡ All Urgency Levels' },
                { value: 'NORMAL', label: '○ Normal' },
                { value: 'HIGH', label: '⚡ High' },
                { value: 'CRITICAL', label: '🚨 Critical' },
              ]}
            />
          </div>
          <button
            onClick={() => { setStatusFilter(''); setBloodGroupFilter(''); setUrgencyFilter(''); setCurrentPage(1); }}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold
                      hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            🔄 Clear
          </button>
        </div>
      </div>

      {/* Requests Grid/List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-red-100 to-rose-100
                         flex items-center justify-center text-5xl">
            🩸
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Blood Requests Found</h3>
          <p className="text-gray-500 mb-6">Create a new request to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold
                      shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
          >
            + Create New Request
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-5 font-bold text-gray-700">Request ID</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-700">Patient/Requester</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-700">Blood Group</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-700">Units</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-700">Urgency</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-700">Status</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-700">Date</th>
                  <th className="text-right py-4 px-5 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => (
                  <tr key={request._id} 
                      className={`border-b border-gray-100 hover:bg-linear-to-r hover:from-red-50/50 hover:to-rose-50/50
                                 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                      style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="py-4 px-5">
                      <span className="font-mono text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-bold">
                        #{request._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div>
                        <p className="font-bold text-gray-800">
                          {request.patientName || request.requesterId?.name || 'General Request'}
                        </p>
                        {request.requesterType === 'USER' && request.requesterId?.phone && (
                          <p className="text-sm text-gray-500">📞 {request.requesterId.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                      bg-linear-to-r from-red-100 to-rose-100 text-red-700 font-bold text-sm">
                        🩸 {request.bloodGroup}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-gray-700">{request.unitsRequired}</span>
                      <span className="text-gray-500 text-sm ml-1">unit(s)</span>
                    </td>
                    <td className="py-4 px-5">{getUrgencyBadge(request.urgency)}</td>
                    <td className="py-4 px-5">{getStatusBadge(request.status)}</td>
                    <td className="py-4 px-5 text-gray-600 text-sm">{formatDate(request.createdAt)}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => openDetailsModal(request)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold
                                    hover:bg-gray-200 transition-colors"
                        >
                          👁️ View
                        </button>
                        {request.status === 'PENDING' && (
                          <button
                            onClick={() => handleAssignRequest(request._id)}
                            className="px-3 py-1.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg 
                                      text-sm font-semibold hover:shadow-lg transition-all"
                          >
                            ✋ Assign
                          </button>
                        )}
                        {request.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateStatus(request._id, 'IN_PROGRESS')}
                            className="px-3 py-1.5 bg-linear-to-r from-purple-500 to-violet-600 text-white rounded-lg 
                                      text-sm font-semibold hover:shadow-lg transition-all"
                          >
                            ▶️ Start
                          </button>
                        )}
                        {request.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateStatus(request._id, 'COMPLETED')}
                            className="px-3 py-1.5 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg 
                                      text-sm font-semibold hover:shadow-lg transition-all"
                          >
                            ✓ Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-5 border-t border-gray-100">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Create Blood Request"
        size="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔍 Patient (Optional) - Search by name or phone
            </label>
            <div className="relative">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onFocus={() => patientSuggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Type patient name or phone number..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 
                          focus:ring-4 focus:ring-red-100 outline-none transition-all"
                disabled={selectedPatient}
              />
              {selectedPatient && (
                <button
                  type="button"
                  onClick={clearPatientSelection}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                            bg-red-100 text-red-600 hover:bg-red-200 transition-colors
                            flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            {searchingPatients && (
              <div className="absolute right-12 top-12">
                <LoadingSpinner size="sm" />
              </div>
            )}
            {showSuggestions && patientSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl 
                             shadow-2xl max-h-48 overflow-y-auto">
                {patientSuggestions.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => handleSelectPatient(patient)}
                    className="px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 
                              last:border-0 transition-colors"
                  >
                    <p className="font-bold text-gray-800">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.phone} • 🩸 {patient.bloodGroup}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="🩸 Blood Group Required"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
              required
            />
            <Input
              label="📊 Units Required"
              type="number"
              min="1"
              max="10"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
          <Select
            label="⚡ Urgency Level"
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            options={[
              { value: 'NORMAL', label: '○ Normal' },
              { value: 'HIGH', label: '⚡ High Priority' },
              { value: 'CRITICAL', label: '🚨 Critical - Emergency' },
            ]}
          />
          <Input
            label="📝 Reason for Request"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Surgery, transfusion, emergency, etc."
          />
          <Input
            label="💬 Additional Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold
                        hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2.5 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-xl 
                        font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 
                        hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? '⏳ Creating...' : '✓ Create Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedRequest(null); }}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Request ID', value: `#${selectedRequest._id?.slice(-8).toUpperCase()}`, icon: '🆔' },
                { label: 'Status', value: getStatusBadge(selectedRequest.status), icon: '📊', isComponent: true },
                { label: 'Patient/Requester', value: selectedRequest.patientName || selectedRequest.requesterId?.name || 'General', icon: '👤' },
                { label: 'Blood Group', value: selectedRequest.bloodGroup, icon: '🩸' },
                { label: 'Units Required', value: `${selectedRequest.unitsRequired} unit(s)`, icon: '📦' },
                { label: 'Urgency', value: getUrgencyBadge(selectedRequest.urgency), icon: '⚡', isComponent: true },
                { label: 'Request Type', value: selectedRequest.requesterType === 'USER' ? '👤 User' : '🏥 Hospital', icon: '📋' },
                { label: 'Assigned Staff', value: selectedRequest.assignedStaffId?.name || 'Not assigned', icon: '👨‍⚕️' },
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.isComponent ? item.value : (
                    <p className="font-bold text-gray-800">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            {selectedRequest.requesterType === 'USER' && selectedRequest.requesterId && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3">📞 Requester Contact</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedRequest.requesterId.phone && (
                    <p><span className="text-blue-600">Phone:</span> {selectedRequest.requesterId.phone}</p>
                  )}
                  {selectedRequest.requesterId.email && (
                    <p><span className="text-blue-600">Email:</span> {selectedRequest.requesterId.email}</p>
                  )}
                  {(selectedRequest.requesterId.address || selectedRequest.requesterId.city) && (
                    <p className="col-span-2">
                      <span className="text-blue-600">Address:</span> {[
                        selectedRequest.requesterId.address,
                        selectedRequest.requesterId.city,
                        selectedRequest.requesterId.state
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedRequest.medicalReason && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">🏥 Medical Reason</h4>
                <p className="text-purple-700">{selectedRequest.medicalReason}</p>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold
                          hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'PENDING' && (
                <button
                  onClick={() => { handleAssignRequest(selectedRequest._id); setShowDetailsModal(false); }}
                  className="px-5 py-2.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl 
                            font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  ✋ Assign to Me
                </button>
              )}
              {selectedRequest.status === 'ASSIGNED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest._id, 'IN_PROGRESS')}
                  className="px-5 py-2.5 bg-linear-to-r from-purple-500 to-violet-600 text-white rounded-xl 
                            font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  ▶️ Start Processing
                </button>
              )}
              {selectedRequest.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest._id, 'COMPLETED')}
                  className="px-5 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl 
                            font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  ✓ Mark Complete
                </button>
              )}
              {['PENDING', 'ASSIGNED'].includes(selectedRequest.status) && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest._id, 'CANCELLED')}
                  className="px-5 py-2.5 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-xl 
                            font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  ✕ Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffBloodRequestsPage;
