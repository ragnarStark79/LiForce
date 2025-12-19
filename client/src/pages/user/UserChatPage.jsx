import { useState, useEffect, useRef, useContext } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { SocketContext } from '../../context/SocketContext';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const UserChatPage = () => {
  const { user } = useAuth();
  const socketContext = useContext(SocketContext);
  const socket = socketContext?.socket;
  const connected = socketContext?.connected || false;
  const joinConversation = socketContext?.joinConversation;
  const leaveConversation = socketContext?.leaveConversation;

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null);

  // Keep the ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const roomId = selectedConversation._id || selectedConversation.roomId;
      fetchMessages(roomId);
      if (joinConversation) joinConversation(roomId);
      return () => {
        if (leaveConversation) leaveConversation(roomId);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (data) => {
      const currentConversation = selectedConversationRef.current;
      const roomId = currentConversation?._id || currentConversation?.roomId;
      
      if (data.conversationId === roomId) {
        setMessages(prev => {
          // Remove any temp messages with same content from same sender
          const filteredMessages = prev.filter(m => {
            if (!m._id?.toString().startsWith('temp-')) return true;
            const msgSenderId = m.senderId?._id || m.senderId;
            const newMsgSenderId = data.message.senderId?._id || data.message.senderId;
            if (m.message === data.message.message && msgSenderId === newMsgSenderId) {
              return false;
            }
            return true;
          });
          
          const exists = filteredMessages.some(m => m._id === data.message._id);
          if (exists) return filteredMessages;
          return [...filteredMessages, { ...data.message, isDeleted: data.message.isDeleted || false }];
        });
      }
      fetchConversations();
    };
    
    const handleMessageDeleted = (data) => {
      const currentConversation = selectedConversationRef.current;
      const roomId = currentConversation?._id || currentConversation?.roomId;
      
      if (data.conversationId === roomId) {
        // Mark message as deleted instead of removing it
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, isDeleted: true, deletedAt: data.deletedAt }
            : msg
        ));
      }
    };
    
    socket.on('chat:newMessage', handleNewMessage);
    socket.on('chat:messageDeleted', handleMessageDeleted);
    
    return () => {
      socket.off('chat:newMessage', handleNewMessage);
      socket.off('chat:messageDeleted', handleMessageDeleted);
    };
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await userService.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const data = await userService.getMessages(roomId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const roomId = selectedConversation._id || selectedConversation.roomId;
    const recipientId = selectedConversation.otherParticipant?._id;
    const messageText = newMessage.trim();

    // Clear input immediately for better UX
    setNewMessage('');

    try {
      setSending(true);

      // Step 1: Save message via REST API (ensures persistence)
      const response = await userService.sendMessage(roomId, messageText);

      if (response.chatMessage) {
        // Step 2: Add the saved message to local state
        setMessages(prev => {
          const exists = prev.some(m => m._id === response.chatMessage._id);
          if (exists) return prev;
          return [...prev, { ...response.chatMessage, isDeleted: false }];
        });

        // Step 3: Emit socket event for real-time delivery to recipient
        if (connected && socket) {
          socket.emit('chat:newMessage', {
            conversationId: roomId,
            message: response.chatMessage
          });
        }
      }

      // Refresh conversations to update last message in sidebar
      fetchConversations();
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      // Restore the message input on failure
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    const roomId = selectedConversation?._id || selectedConversation?.roomId;
    
    // Optimistically mark as deleted
    setMessages(prev => prev.map(msg => 
      msg._id === messageId 
        ? { ...msg, isDeleted: true, deletedAt: new Date().toISOString() }
        : msg
    ));
    
    if (connected && socket) {
      socket.emit('chat:deleteMessage', { messageId, conversationId: roomId });
    }
  };

  // Render deleted message placeholder
  const renderDeletedMessage = (isOwnMessage) => (
    <div className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
      isOwnMessage 
        ? 'bg-primary-200 text-primary-400 border border-primary-300' 
        : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      <span className="text-sm italic">This message was deleted</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getConnectionClass = () => connected ? 'bg-green-500' : 'bg-red-500';
  const getConversationClass = (conv) => {
    const isSelected = (selectedConversation?._id || selectedConversation?.roomId) === (conv._id || conv.roomId);
    return isSelected ? 'bg-primary-100 border-primary-300' : 'bg-neutral-50 hover:bg-neutral-100';
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2 mb-4">
        <div className={'w-2 h-2 rounded-full ' + getConnectionClass()}></div>
        <span className="text-sm text-neutral-500">{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Conversations</h2>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv._id || conv.roomId}
                    onClick={() => setSelectedConversation(conv)}
                    className={'p-3 rounded-lg cursor-pointer transition-colors ' + getConversationClass(conv)}
                  >
                    <p className="font-medium text-neutral-800 truncate">
                      {conv.otherParticipant?.name || 'Hospital Staff'}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="border-b border-neutral-200 pb-3 mb-3">
                <h3 className="font-semibold text-neutral-800">
                  {selectedConversation.otherParticipant?.name || 'Hospital Staff'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId = msg.senderId?._id || msg.senderId;
                    const isOwnMessage = senderId === user?._id;
                    const messageText = msg.message || msg.text || msg.content || '';
                    const isDeleted = msg.isDeleted;
                    const bubbleClass = isOwnMessage
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-800';
                    const timeClass = isOwnMessage ? 'text-primary-100' : 'text-neutral-400';

                    return (
                      <div key={msg._id} className={'flex ' + (isOwnMessage ? 'justify-end' : 'justify-start')}>
                        {isDeleted ? (
                          renderDeletedMessage(isOwnMessage)
                        ) : (
                          <div className={'group relative max-w-xs md:max-w-md px-4 py-2 rounded-lg ' + bubbleClass}>
                            <p>{messageText}</p>
                            <p className={'text-xs mt-1 ' + timeClass}>
                              {formatDate(msg.createdAt)}
                            </p>
                            {isOwnMessage && (
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="absolute -top-2 -right-2 hidden group-hover:flex w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center text-xs hover:bg-red-600"
                                title="Delete message"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="border-t border-neutral-200 pt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    disabled={sending}
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg mb-2">Select a conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserChatPage;
