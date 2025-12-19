import { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import Input from '../common/Input';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chatService';

const ChatWindow = ({ conversationId, recipientId, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, connected, joinConversation, leaveConversation } = useSocket();
  const { user } = useAuth();

  // Join conversation room when component mounts or conversationId changes
  useEffect(() => {
    if (conversationId && connected) {
      joinConversation(conversationId);
      fetchMessages();
      
      // Mark messages as read when joining
      markMessagesAsRead();
    }
    
    return () => {
      if (conversationId && connected) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, connected]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
        const newMsg = {
          _id: data.message._id,
          message: data.message.message,
          senderId: data.message.senderId,
          createdAt: data.message.createdAt,
          isRead: data.message.isRead,
          isDeleted: data.message.isDeleted || false
        };
        
        setMessages(prev => {
          // Remove any temporary/pending messages with the same content from the same sender
          const filteredMessages = prev.filter(m => {
            if (!m._id?.toString().startsWith('temp-')) return true;
            const msgSenderId = m.senderId?._id || m.senderId;
            const newMsgSenderId = newMsg.senderId?._id || newMsg.senderId;
            if (m.message === newMsg.message && msgSenderId === newMsgSenderId) {
              return false;
            }
            return true;
          });
          
          // Avoid duplicate messages
          const exists = filteredMessages.some(m => m._id === newMsg._id);
          if (exists) return filteredMessages;
          return [...filteredMessages, newMsg];
        });
        
        // Mark as read if we're the recipient
        const senderIdStr = data.message.senderId?._id || data.message.senderId;
        if (senderIdStr !== user?._id) {
          markMessagesAsRead();
        }
      }
    };

    const handleMessageDeleted = (data) => {
      if (data.conversationId === conversationId) {
        // Mark message as deleted instead of removing it
        setMessages(prev => prev.map(m => 
          m._id === data.messageId 
            ? { ...m, isDeleted: true, deletedAt: data.deletedAt }
            : m
        ));
      }
    };

    const handleTypingStart = (data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setIsTyping(true);
        setTypingUser(data.userName);
      }
    };

    const handleTypingStop = (data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.map(msg => {
          const msgSenderId = msg.senderId?._id || msg.senderId;
          if (msgSenderId === user?._id) {
            return { ...msg, isRead: true, readAt: data.readAt };
          }
          return msg;
        }));
      }
    };

    socket.on('chat:newMessage', handleNewMessage);
    socket.on('chat:messageDeleted', handleMessageDeleted);
    socket.on('chat:typing', handleTypingStart);
    socket.on('chat:stopTyping', handleTypingStop);
    socket.on('chat:messagesRead', handleMessagesRead);

    return () => {
      socket.off('chat:newMessage', handleNewMessage);
      socket.off('chat:messageDeleted', handleMessageDeleted);
      socket.off('chat:typing', handleTypingStart);
      socket.off('chat:stopTyping', handleTypingStop);
      socket.off('chat:messagesRead', handleMessagesRead);
    };
  }, [socket, conversationId, user?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(conversationId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = useCallback(() => {
    if (socket && connected && conversationId) {
      socket.emit('chat:markRead', { conversationId });
    }
  }, [socket, connected, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (socket && connected && conversationId) {
      socket.emit('chat:typing', { conversationId });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:stopTyping', { conversationId });
      }, 2000);
    }
  }, [socket, connected, conversationId]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const handleDeleteMessage = useCallback((messageId) => {
    if (!window.confirm('Delete this message?')) return;
    
    if (socket && connected) {
      socket.emit('chat:deleteMessage', { messageId, conversationId });
    }
  }, [socket, connected, conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // Clear typing timeout and emit stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket && connected) {
      socket.emit('chat:stopTyping', { conversationId });
    }

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Optimistically add the message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      message: messageContent,
      senderId: { _id: user?._id, name: user?.name },
      createdAt: new Date().toISOString(),
      isRead: false,
      isDeleted: false,
      pending: true
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      setSending(true);
      
      // Send message via socket for real-time delivery
      if (socket && connected) {
        socket.emit('chat:message', {
          conversationId,
          receiverId: recipientId,
          content: messageContent
        });
      } else {
        // Fallback to REST API if socket is not connected
        const response = await chatService.sendMessage({
          roomId: conversationId,
          receiverId: recipientId,
          message: messageContent
        });
        
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg._id === tempId 
            ? { ...response.chatMessage, pending: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      // Restore the message input
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-800">{recipientName}</h3>
            <span className={`text-xs ${connected ? 'text-green-500' : 'text-neutral-400'}`}>
              {connected ? '● Online' : '○ Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message, index) => (
            <ChatMessage 
              key={message._id || index} 
              message={message} 
              showReadReceipt={true}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-neutral-500 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>{typingUser || 'Someone'} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-neutral-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending || !connected}>
            {sending ? '...' : 'Send'}
          </Button>
        </div>
        {!connected && (
          <p className="text-xs text-red-500 mt-1">Disconnected. Trying to reconnect...</p>
        )}
      </form>
    </div>
  );
};

export default ChatWindow;