import apiClient from './apiClient';

export const bloodService = {
  getBloodRequests: async (params) => {
    const response = await apiClient.get('/blood/requests', { params });
    return response.data;
  },

  getRequestById: async (requestId) => {
    const response = await apiClient.get(`/blood/requests/${requestId}`);
    return response.data;
  },

  getInventory: async () => {
    const response = await apiClient.get('/blood/inventory');
    return response.data;
  },

  getDonations: async (params) => {
    const response = await apiClient.get('/blood/donations', { params });
    return response.data;
  },

  getStatistics: async (params) => {
    const response = await apiClient.get('/blood/statistics', { params });
    return response.data;
  },

  getHospitals: async (params) => {
    const response = await apiClient.get('/hospitals', { params });
    return response.data;
  },
};