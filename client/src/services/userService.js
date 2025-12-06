import apiClient from './apiClient';

export const userService = {
  getDashboard: async () => {
    const response = await apiClient.get('/users/dashboard');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/users/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await apiClient.put('/users/settings', settingsData);
    return response.data;
  },

  getBloodRequests: async (params) => {
    const response = await apiClient.get('/users/blood-requests', { params });
    return response.data;
  },

  createBloodRequest: async (requestData) => {
    const response = await apiClient.post('/users/blood-requests', requestData);
    return response.data;
  },

  cancelBloodRequest: async (requestId) => {
    const response = await apiClient.put(`/users/blood-requests/${requestId}/cancel`);
    return response.data;
  },

  getDonationHistory: async (params) => {
    const response = await apiClient.get('/users/donations', { params });
    return response.data;
  },

  getHospitals: async () => {
    const response = await apiClient.get('/hospitals/public');
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

  // Donation Scheduling
  getDonationSchedules: async (params) => {
    const response = await apiClient.get('/users/donation-schedules', { params });
    return response.data;
  },

  createDonationSchedule: async (scheduleData) => {
    const response = await apiClient.post('/users/donation-schedules', scheduleData);
    return response.data;
  },

  cancelDonationSchedule: async (scheduleId, reason) => {
    const response = await apiClient.put(`/users/donation-schedules/${scheduleId}/cancel`, { reason });
    return response.data;
  },
};
