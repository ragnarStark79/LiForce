import apiClient from './apiClient';

export const chatService = {
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (roomId, params) => {
    const response = await apiClient.get(`/chat/messages/${roomId}`, { params });
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await apiClient.post('/chat/messages', messageData);
    return response.data;
  },

  markAsRead: async (roomId) => {
    const response = await apiClient.put(`/chat/messages/${roomId}/read`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/chat/unread-count');
    return response.data;
  },

  findUserByPhone: async (phone) => {
    const response = await apiClient.get('/chat/find-user', { params: { phone } });
    return response.data;
  },

  getAdminConversation: async () => {
    const response = await apiClient.get('/chat/admin-conversation');
    return response.data;
  },
};