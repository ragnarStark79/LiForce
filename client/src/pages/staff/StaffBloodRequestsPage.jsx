import { useState, useEffect, useMemo, useRef } from 'react';
import { staffService } from '../../services/staffService';
import { useNotification } from '../../components/common/NotificationSystem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const StaffBloodRequestsPage = () => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, critical: 0 });

  // New Request Modal State
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    unitsRequired: 1,
    urgency: 'NORMAL',
    patientName: '',
    medicalReason: '',
    notes: '',
  });

  // Action Modals State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', notes: '' });

  // UI-only control state (does not affect data flow)
  const [filters, setFilters] = useState({ status: '', urgency: '', bloodGroup: '', query: '' });

  // Keep the search box as an uncontrolled input to avoid focus loss if the page rerenders.
  // We debounce syncing it into filters.query so the table still updates.
  const searchInputRef = useRef(null);
  const queryDebounceRef = useRef(null);

  // Stabilize the filter updates to avoid focus loss in some controlled inputs
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleQueryChange = (e) => {
    const next = e.target.value;
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => {
      updateFilter('query', next);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await staffService.getBloodRequests();
      setRequests(data.requests || []);

      // Calculate stats
      const reqs = data.requests || [];
      setStats({
        total: reqs.length,
        pending: reqs.filter(r => r.status === 'PENDING').length,
        inProgress: reqs.filter(r => ['IN_PROGRESS', 'ASSIGNED'].includes(r.status)).length,
        critical: reqs.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length
      });
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      notify.error('Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.bloodGroup) {
      notify.warning('Please select a blood group');
      return;
    }

    try {
      setFormLoading(true);
      await staffService.createBloodRequest(formData);
      notify.success('Blood request created successfully');
      setShowNewRequestModal(false);
      setFormData({
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

  const handleAssignRequest = async (request) => {
    if (!window.confirm('Are you sure you want to assign this request to yourself?')) return;
    try {
      await staffService.assignRequest(request._id);
      notify.success('Request assigned to you successfully');
      fetchRequests();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to assign request');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !statusUpdateData.status) return;

    try {
      setFormLoading(true);
      await staffService.updateRequestStatus(
        selectedRequest._id,
        statusUpdateData.status,
        statusUpdateData.notes
      );
      notify.success(`Request status updated to ${statusUpdateData.status}`);
      setShowStatusModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setFormLoading(false);
    }
  };

  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setStatusUpdateData({ status: request.status, notes: '' });
    setShowStatusModal(true);
  };

  const openViewModal = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const STATUS_OPTIONS = useMemo(() => ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], []);

  const getRequesterName = (req) => {
    if (req.patientName) return req.patientName;
    if (req.requesterId && req.requesterId.name) return req.requesterId.name;
    return 'Unknown';
  };

  const getRequesterPhone = (req) => {
    if (req.contactNumber) return req.contactNumber;
    if (req.requesterId && req.requesterId.phone) return req.requesterId.phone;
    return 'N/A';
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      NORMAL: 'default',
      HIGH: 'warning',
      CRITICAL: 'danger'
    };
    return <Badge variant={variants[urgency] || 'default'}>{urgency}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      ASSIGNED: 'info',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      CANCELLED: 'default'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredRequests = useMemo(() => {
    const q = (filters.query || '').trim().toLowerCase();

    return (requests || []).filter((r) => {
      const statusOk = !filters.status || r.status === filters.status;
      const urgencyOk = !filters.urgency || r.urgency === filters.urgency;
      const bgOk = !filters.bloodGroup || r.bloodGroup === filters.bloodGroup;

      const name = getRequesterName(r).toLowerCase();
      const id = (r._id || '').toLowerCase();
      const phone = (getRequesterPhone(r) || '').toLowerCase();
      const qOk = !q || name.includes(q) || id.includes(q) || phone.includes(q);

      return statusOk && urgencyOk && bgOk && qOk;
    });
  }, [requests, filters]);

  const clearFilters = () => setFilters({ status: '', urgency: '', bloodGroup: '', query: '' });

  const Shell = ({ children }) => (
    <div className="mx-auto max-w-7xl">
      {children}
    </div>
  );

  const GlassCard = ({ className = '', children }) => (
    <section className={`staffdash-card ${className}`}>{children}</section>
  );

  const SkeletonLine = ({ w = 'w-full' }) => (
    <div className={`h-3 ${w} rounded-full staffdash-skeleton`} />
  );

  const SkeletonRow = () => (
    <div className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-4 ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonLine w="w-32" />
          <SkeletonLine w="w-44" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-xl staffdash-skeleton" />
          <div className="h-8 w-24 rounded-xl staffdash-skeleton" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonLine w="w-40" />
                <SkeletonLine w="w-72" />
              </div>
              <div className="h-10 w-32 rounded-xl staffdash-skeleton" />
            </div>

            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 ring-1 ring-black/5">
                  <SkeletonLine w="w-20" />
                  <div className="mt-3 h-8 w-16 rounded-xl staffdash-skeleton" />
                  <div className="mt-3">
                    <SkeletonLine w="w-24" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="h-11 rounded-2xl staffdash-skeleton" />
              <div className="h-11 rounded-2xl staffdash-skeleton" />
              <div className="h-11 rounded-2xl staffdash-skeleton" />
              <div className="h-11 rounded-2xl staffdash-skeleton" />
            </div>
          </GlassCard>

          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        {/* Top Header */}
        <GlassCard className="p-6 sm:p-7 overflow-hidden">
          <div className="relative">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Blood Requests
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  Requests Console
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500 max-w-2xl">
                  Review, assign, and complete hospital requests with a clean workflow.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRequests}
                  className="rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
                >
                  + New Request
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total', value: stats.total, tone: 'text-slate-900' },
                { label: 'Pending', value: stats.pending, tone: 'text-amber-700' },
                { label: 'In Progress', value: stats.inProgress, tone: 'text-sky-700' },
                { label: 'Critical', value: stats.critical, tone: 'text-rose-700' }
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 ring-1 ring-black/5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
                  <div className={`mt-2 text-3xl font-semibold tabular-nums ${s.tone}`}>{s.value}</div>
                  <div className="mt-3 h-px w-full bg-linear-to-r from-slate-900/0 via-slate-900/10 to-slate-900/0" />
                  <div className="mt-3 text-xs font-semibold text-slate-500">Live snapshot</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Filters */}
        <GlassCard className="p-4 sm:p-5">
          {/* not a form: prevents Enter key / implicit submit behaviors from stealing focus */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-3 items-center" role="group" aria-label="Request filters">
            <div className="md:col-span-3">
              <Input
                label=""
                placeholder="Search name / phone / id"
                // uncontrolled input: avoids cursor/focus loss due to rerenders
                defaultValue={filters.query}
                onChange={handleQueryChange}
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                ref={searchInputRef}
              />
            </div>
            <div className="md:col-span-2">
              <Select
                label=""
                placeholder="Status"
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))]}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <Select
                label=""
                placeholder="Urgency"
                value={filters.urgency}
                onChange={(e) => updateFilter('urgency', e.target.value)}
                options={[{ value: '', label: 'All Urgency' }, ...URGENCY_LEVELS.map(u => ({ value: u, label: u }))]}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <Select
                label=""
                placeholder="Blood Group"
                value={filters.bloodGroup}
                onChange={(e) => updateFilter('bloodGroup', e.target.value)}
                options={[{ value: '', label: 'All Groups' }, ...BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))]}
                className="w-full"
              />
            </div>
            <div className="md:col-span-1 flex gap-2 justify-end">
              <button
                onClick={clearFilters}
                type="button"
                className="w-full md:w-auto rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
                title="Clear filters"
              >
                Clear
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Request feed (single) */}
        <div className="space-y-3">
          <GlassCard className="overflow-hidden">
            <div className="px-6 py-5 border-b border-white/40 bg-white/55 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Request Feed</div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-500">{filteredRequests.length} result(s)</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/40">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Requester</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Group</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Units</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Urgency</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/5">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-white/40 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-slate-700">#{request._id.slice(-8).toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">{getRequesterName(request)}</span>
                            <span className="text-xs font-semibold text-slate-500">☎ {getRequesterPhone(request)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-bold text-rose-600 border-rose-200 bg-rose-50">
                            {request.bloodGroup}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold tabular-nums text-slate-900">{request.unitsRequired}</span>
                        </td>
                        <td className="px-6 py-4">{getUrgencyBadge(request.urgency)}</td>
                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatDate(request.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openViewModal(request)}
                              className="rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
                            >
                              View
                            </button>
                            {request.status === 'PENDING' && (
                              <button
                                onClick={() => handleAssignRequest(request)}
                                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
                              >
                                Assign
                              </button>
                            )}
                            {['ASSIGNED', 'IN_PROGRESS'].includes(request.status) && (
                              <button
                                onClick={() => openStatusModal(request)}
                                className="rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
                              >
                                Update
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="text-sm font-semibold text-slate-900">No requests found</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">Try clearing filters.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* New Request Modal */}
        <Modal
          isOpen={showNewRequestModal}
          onClose={() => setShowNewRequestModal(false)}
          title="Create New Blood Request"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                required
              />
              <Input
                label="Units Required"
                type="number"
                min="1"
                value={formData.unitsRequired}
                onChange={(e) => setFormData({ ...formData, unitsRequired: e.target.value })}
                required
              />
            </div>
            <Select
              label="Urgency Level"
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              options={URGENCY_LEVELS.map(u => ({ value: u, label: u }))}
              required
            />
            <Input
              label="Patient Name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Full Name"
              required
            />
            <Input
              label="Medical Reason"
              value={formData.medicalReason}
              onChange={(e) => setFormData({ ...formData, medicalReason: e.target.value })}
              placeholder="e.g. Surgery, Accident..."
            />
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNewRequestModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2"
              >
                {formLoading ? <LoadingSpinner size="sm" /> : null}
                Create Request
              </button>
            </div>
          </form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Request Details"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center font-bold text-base border border-white shadow-sm">
                {selectedRequest?.bloodGroup}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">
                  {selectedRequest?.unitsRequired} Unit(s) Required
                </h3>
                <div className="flex gap-2 mt-1">
                  {selectedRequest && getUrgencyBadge(selectedRequest.urgency)}
                  {selectedRequest && getStatusBadge(selectedRequest.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Patient Info</h4>
                <p className="font-semibold text-slate-900">{getRequesterName(selectedRequest || {})}</p>
                <p className="text-sm text-slate-500 mt-1">{selectedRequest?.medicalReason || 'No medical reason provided'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contact Info</h4>
                <p className="font-semibold text-slate-900">{getRequesterPhone(selectedRequest || {})}</p>
                {selectedRequest?.requesterId?.email && (
                  <p className="text-sm text-slate-500 mt-1">{selectedRequest.requesterId.email}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Request Timeline</h4>
              <div className="text-sm text-slate-600">
                <p>Created on: <span className="font-semibold">{formatDate(selectedRequest?.createdAt)}</span></p>
                {selectedRequest?.status === 'ASSIGNED' && (
                  <p className="text-sky-700 mt-1 font-medium">Currently assigned to you</p>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Update Status Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Update Request  #${selectedRequest?._id.slice(-6).toUpperCase()}`}
        >
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl mb-4 text-sm space-y-2">
              <p><span className="font-semibold">Patient:</span> {getRequesterName(selectedRequest || {})}</p>
              <p><span className="font-semibold">Blood Group:</span> {selectedRequest?.bloodGroup} ({selectedRequest?.unitsRequired} units)</p>
              <p><span className="font-semibold">Current Status:</span> {selectedRequest?.status}</p>
            </div>

            <Select
              label="New Status"
              value={statusUpdateData.status}
              onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
              options={STATUS_OPTIONS.filter(s => s !== 'PENDING').map(s => ({ value: s, label: s }))}
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Notes / Comments</label>
              <textarea
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all resize-none h-24"
                value={statusUpdateData.notes}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                placeholder="Add any notes about this update..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2"
              >
                {formLoading ? <LoadingSpinner size="sm" /> : null}
                Update Status
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Shell>
  );
};

export default StaffBloodRequestsPage;
