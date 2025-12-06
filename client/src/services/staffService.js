import apiClient from './apiClient';

export const staffService = {
  // Profile management
  getProfile: async () => {
    const response = await apiClient.get('/staff/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/staff/profile', profileData);
    return response.data;
  },

  cancelProfileUpdateRequest: async () => {
    const response = await apiClient.delete('/staff/profile/update-request');
    return response.data;
  },

  getDashboard: async () => {
    const response = await apiClient.get('/staff/dashboard');
    return response.data;
  },

  getBloodRequests: async (params) => {
    const response = await apiClient.get('/staff/blood-requests', { params });
    return response.data;
  },

  assignRequest: async (requestId) => {
    const response = await apiClient.put(`/staff/blood-requests/${requestId}/assign`);
    return response.data;
  },

  updateRequestStatus: async (requestId, status, notes) => {
    const response = await apiClient.put(`/staff/blood-requests/${requestId}/status`, { status, notes });
    return response.data;
  },

  // Alias methods for component compatibility
  updateBloodRequest: async (requestId, data) => {
    const response = await apiClient.put(`/staff/blood-requests/${requestId}/status`, data);
    return response.data;
  },

  fulfillBloodRequest: async (requestId) => {
    const response = await apiClient.put(`/staff/blood-requests/${requestId}/status`, { status: 'COMPLETED' });
    return response.data;
  },

  getInventory: async () => {
    const response = await apiClient.get('/staff/inventory');
    return response.data;
  },

  updateInventory: async (inventoryData) => {
    const response = await apiClient.put('/staff/inventory', inventoryData);
    return response.data;
  },

  getPatients: async (params) => {
    const response = await apiClient.get('/staff/patients', { params });
    return response.data;
  },

  // Search patients for autocomplete
  searchPatients: async (query) => {
    const response = await apiClient.get('/staff/patients/search', { params: { query } });
    return response.data;
  },

  addPatient: async (patientData) => {
    const response = await apiClient.post('/staff/patients', patientData);
    return response.data;
  },

  updatePatient: async (patientId, patientData) => {
    const response = await apiClient.put(`/staff/patients/${patientId}`, patientData);
    return response.data;
  },

  recordDonation: async (donationData) => {
    const response = await apiClient.post('/staff/donations', donationData);
    return response.data;
  },

  // Blood request creation - Staff creates requests on behalf of hospital
  createBloodRequest: async (requestData) => {
    const response = await apiClient.post('/staff/blood-requests', requestData);
    return response.data;
  },

  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (roomId) => {
    const response = await apiClient.get(`/chat/messages/${roomId}`);
    return response.data;
  },

  sendMessage: async (roomId, message) => {
    const response = await apiClient.post('/chat/messages', { roomId, message });
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await apiClient.get('/chat/search-users', { params: { query } });
    return response.data;
  },

  startConversation: async (userId) => {
    const response = await apiClient.post('/chat/start-conversation', { userId });
    return response.data;
  },

  // Donation Scheduling
  getDonationSchedules: async (params) => {
    const response = await apiClient.get('/staff/donation-schedules', { params });
    return response.data;
  },

  assignDonationSchedule: async (scheduleId) => {
    const response = await apiClient.put(`/staff/donation-schedules/${scheduleId}/assign`);
    return response.data;
  },

  updateDonationScheduleStatus: async (scheduleId, status, notes) => {
    const response = await apiClient.put(`/staff/donation-schedules/${scheduleId}/status`, { status, notes });
    return response.data;
  },

  completeDonationSchedule: async (scheduleId, donationData) => {
    const response = await apiClient.put(`/staff/donation-schedules/${scheduleId}/complete`, donationData);
    return response.data;
  },
};
