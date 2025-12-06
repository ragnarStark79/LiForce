import apiClient from './apiClient';

export const userService = {
  getDashboard: async () => {
    const response = await apiClient.get('/user/dashboard');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/user/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await apiClient.put('/user/settings', settingsData);
    return response.data;
  },

  getBloodRequests: async (params) => {
    const response = await apiClient.get('/user/blood-requests', { params });
    return response.data;
  },

  createBloodRequest: async (requestData) => {
    const response = await apiClient.post('/user/blood-requests', requestData);
    return response.data;
  },

  cancelBloodRequest: async (requestId) => {
    const response = await apiClient.put(`/user/blood-requests/${requestId}/cancel`);
    return response.data;
  },

  getDonationHistory: async (params) => {
    const response = await apiClient.get('/user/donations', { params });
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
};
