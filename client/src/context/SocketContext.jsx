import { createContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      const socketInstance = io('http://localhost:5001', {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Handle incoming chat notifications
      socketInstance.on('chat:notification', (data) => {
        const { message, senderName } = data;
        setUnreadCount(prev => prev + 1);
        toast.success(`New message from ${senderName || 'Someone'}`, {
          icon: '💬',
          duration: 4000,
        });
      });

      // Handle new message in current conversation
      socketInstance.on('chat:newMessage', (data) => {
        // This will be handled by individual chat components
      });

      // Handle message deleted
      socketInstance.on('chat:messageDeleted', (data) => {
        // This will be handled by individual chat components
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  }, [socket, connected]);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  }, [socket]);

  const off = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  const joinConversation = useCallback((conversationId) => {
    if (socket && connected) {
      socket.emit('chat:join', { conversationId });
    }
  }, [socket, connected]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket && connected) {
      socket.emit('chat:leave', { conversationId });
    }
  }, [socket, connected]);

  const sendMessage = useCallback((conversationId, receiverId, content) => {
    if (socket && connected) {
      socket.emit('chat:message', { conversationId, receiverId, content });
    }
  }, [socket, connected]);

  const deleteMessage = useCallback((messageId, conversationId) => {
    if (socket && connected) {
      socket.emit('chat:deleteMessage', { messageId, conversationId });
    }
  }, [socket, connected]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = {
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
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
