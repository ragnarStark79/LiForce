import { useContext, useCallback } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  const {
    socket,
    connected,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
    sendMessage,
    deleteMessage,
    notifications,
    unreadCount,
    clearUnread,
  } = context;

  // Helper to emit typing indicator
  const startTyping = useCallback((conversationId) => {
    if (socket && connected) {
      socket.emit('chat:typing', { conversationId });
    }
  }, [socket, connected]);

  // Helper to stop typing indicator
  const stopTyping = useCallback((conversationId) => {
    if (socket && connected) {
      socket.emit('chat:stopTyping', { conversationId });
    }
  }, [socket, connected]);

  // Helper to mark messages as read
  const markAsRead = useCallback((conversationId) => {
    if (socket && connected) {
      socket.emit('chat:markRead', { conversationId });
    }
  }, [socket, connected]);

  // Helper to check connection status
  const isConnected = useCallback(() => {
    return connected && socket?.connected;
  }, [socket, connected]);

  return {
    socket,
    connected,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
    sendMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    markAsRead,
    isConnected,
    notifications,
    unreadCount,
    clearUnread,
  };
};

export default useSocket;
