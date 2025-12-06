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

  getAllHospitals: async (params) => {
    const response = await apiClient.get('/hospitals', { params });
    return response.data;
  },

  createHospital: async (hospitalData) => {
    const response = await apiClient.post('/hospitals', hospitalData);
    return response.data;
  },

  updateHospitalById: async (hospitalId, hospitalData) => {
    const response = await apiClient.put(`/hospitals/${hospitalId}`, hospitalData);
    return response.data;
  },

  deleteHospital: async (hospitalId) => {
    const response = await apiClient.delete(`/hospitals/${hospitalId}`);
    return response.data;
  },

  getHospitalById: async (hospitalId) => {
    const response = await apiClient.get(`/hospitals/${hospitalId}`);
    return response.data;
  },
};