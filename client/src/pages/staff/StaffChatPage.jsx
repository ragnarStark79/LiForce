import { useState, useEffect, useRef, useContext } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../hooks/useAuth';
import { SocketContext } from '../../context/SocketContext';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StaffChatPage = () => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const searchRef = useRef(null);
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
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (data) => {
      const currentConversation = selectedConversationRef.current;
      const roomId = currentConversation?._id || currentConversation?.roomId;
      
      if (data.conversationId === roomId) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
      fetchConversations();
    };
    
    const handleMessageDeleted = (data) => {
      const currentConversation = selectedConversationRef.current;
      const roomId = currentConversation?._id || currentConversation?.roomId;
      
      if (data.conversationId === roomId) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
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
      const data = await staffService.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const data = await staffService.getMessages(roomId);
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
    const messageText = newMessage.trim();

    try {
      setSending(true);
      setNewMessage('');

      const response = await staffService.sendMessage(roomId, messageText);

      if (response.chatMessage) {
        setMessages(prev => [...prev, response.chatMessage]);
      } else {
        fetchMessages(roomId);
      }

      fetchConversations();
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    const roomId = selectedConversation?._id || selectedConversation?.roomId;
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
    if (connected && socket) {
      socket.emit('chat:deleteMessage', { messageId, conversationId: roomId });
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      const data = await staffService.searchUsers(searchQuery);
      setSearchResults(data.users || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    try {
      const data = await staffService.startConversation(selectedUser._id);
      setSelectedConversation(data.conversation);
      setSearchQuery('');
      setShowDropdown(false);
      fetchConversations();
      toast.success('Started conversation with ' + selectedUser.name);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2 mb-4">
        <div className={connected ? 'w-2 h-2 rounded-full bg-green-500' : 'w-2 h-2 rounded-full bg-red-500'}></div>
        <span className="text-sm text-neutral-500">{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Conversations</h2>
          <div className="relative mb-4" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            {searching && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className="px-4 py-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0"
                  >
                    <p className="font-medium text-neutral-800">{u.name}</p>
                    <p className="text-sm text-neutral-500">{u.phone}</p>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-neutral-500">
                No users found
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Search for a user to start chatting</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => {
                  const isSelected = (selectedConversation?._id || selectedConversation?.roomId) === (conv._id || conv.roomId);
                  return (
                    <div
                      key={conv._id || conv.roomId}
                      onClick={() => setSelectedConversation(conv)}
                      className={isSelected 
                        ? 'p-3 rounded-lg cursor-pointer transition-colors bg-primary-100 border-primary-300' 
                        : 'p-3 rounded-lg cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100'}
                    >
                      <p className="font-medium text-neutral-800 truncate">
                        {conv.otherParticipant?.name || 'User'}
                      </p>
                      <p className="text-sm text-neutral-500 truncate">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="border-b border-neutral-200 pb-3 mb-3">
                <h3 className="font-semibold text-neutral-800">
                  {selectedConversation.otherParticipant?.name || 'User'}
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

                    return (
                      <div key={msg._id} className={isOwnMessage ? 'flex justify-end' : 'flex justify-start'}>
                        <div className={isOwnMessage 
                          ? 'group relative max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-primary-500 text-white'
                          : 'group relative max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-neutral-100 text-neutral-800'}>
                          <p>{messageText}</p>
                          <p className={isOwnMessage ? 'text-xs mt-1 text-primary-100' : 'text-xs mt-1 text-neutral-400'}>
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
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                <p className="text-sm">Or search for a user to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StaffChatPage;