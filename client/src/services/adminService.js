import apiClient from './apiClient';

export const adminService = {
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  getPendingStaff: async (params) => {
    const response = await apiClient.get('/admin/staff/pending', { params });
    return response.data;
  },

  approveStaff: async (staffId) => {
    const response = await apiClient.put(`/admin/staff/${staffId}/approve`);
    return response.data;
  },

  rejectStaff: async (staffId, reason) => {
    const response = await apiClient.put(`/admin/staff/${staffId}/reject`, { reason });
    return response.data;
  },

  getAllStaff: async (params) => {
    const response = await apiClient.get('/admin/staff', { params });
    return response.data;
  },

  getAllUsers: async (params) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getHospital: async () => {
    const response = await apiClient.get('/admin/hospital');
    return response.data;
  },

  updateHospital: async (hospitalData) => {
    const response = await apiClient.put('/admin/hospital', hospitalData);
    return response.data;
  },

  getAnalytics: async (params) => {
    const response = await apiClient.get('/admin/analytics', { params });
    return response.data;
  },

  suspendUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/suspend`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/activate`);
    return response.data;
  },

  // Hospital Management (all hospitals)
  getAllHospitals: async (params) => {
    const response = await apiClient.get('/admin/hospitals', { params });
    return response.data;
  },

  createHospital: async (hospitalData) => {
    const response = await apiClient.post('/admin/hospitals', hospitalData);
    return response.data;
  },

  updateHospitalById: async (hospitalId, hospitalData) => {
    const response = await apiClient.put(`/admin/hospitals/${hospitalId}`, hospitalData);
    return response.data;
  },

  deleteHospital: async (hospitalId) => {
    const response = await apiClient.delete(`/admin/hospitals/${hospitalId}`);
    return response.data;
  },

  reactivateHospital: async (hospitalId) => {
    const response = await apiClient.put(`/admin/hospitals/${hospitalId}/reactivate`);
    return response.data;
  },

  getHospitalById: async (hospitalId) => {
    const response = await apiClient.get(`/admin/hospitals/${hospitalId}`);
    return response.data;
  },

  // Activity Logs
  getActivityLogs: async (params) => {
    const response = await apiClient.get('/admin/activity-logs', { params });
    return response.data;
  },

  // System Metrics
  getMetrics: async () => {
    const response = await apiClient.get('/admin/metrics');
    return response.data;
  },

  // Toggle User Status
  toggleUserStatus: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  // Profile Update Approvals
  getPendingProfileUpdates: async (params) => {
    const response = await apiClient.get('/admin/profile-updates/pending', { params });
    return response.data;
  },

  approveProfileUpdate: async (staffId) => {
    const response = await apiClient.put(`/admin/profile-updates/${staffId}/approve`);
    return response.data;
  },

  rejectProfileUpdate: async (staffId, reason) => {
    const response = await apiClient.put(`/admin/profile-updates/${staffId}/reject`, { reason });
    return response.data;
  },
};