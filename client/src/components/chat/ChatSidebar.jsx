import { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import { chatService } from '../../services/chatService';

const ChatSidebar = ({ onSelectConversation, activeConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return msgDate.toLocaleDateString([], { weekday: 'short' });
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-800">Conversations</h3>
      </div>
      
      <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-center text-neutral-500 py-8 text-sm">
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left ${
                activeConversationId === conv._id ? 'bg-red-50' : ''
              }`}
            >
              <Avatar name={conv.participantName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-neutral-800 truncate">
                    {conv.participantName}
                  </p>
                  <span className="text-xs text-neutral-400">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 truncate">
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;