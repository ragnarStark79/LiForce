import apiClient from './apiClient';

export const hospitalService = {
  // Get all hospitals (public endpoint for registration and staff profile)
  getHospitals: async (params) => {
    const response = await apiClient.get('/hospitals/public', { params });
    return response.data;
  },

  // Get hospital by ID (requires auth)
  getHospitalById: async (hospitalId) => {
    const response = await apiClient.get(`/hospitals/${hospitalId}`);
    return response.data;
  },

  // Search hospitals
  searchHospitals: async (query) => {
    const response = await apiClient.get('/hospitals/public', { params: { query } });
    return response.data;
  },
};
