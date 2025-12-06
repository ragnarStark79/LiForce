import apiClient from './apiClient';

export const staffService = {
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
};
