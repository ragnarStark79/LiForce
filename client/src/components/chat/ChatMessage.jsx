import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

const ChatMessage = ({ message, showReadReceipt = false, onDelete }) => {
  const { user } = useAuth();
  const isOwn = message.senderId === user?._id || message.senderId?._id === user?._id;
  const isDeleted = message.isDeleted;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get the message content, handling different field names
  const getMessageContent = () => {
    if (isDeleted) {
      return null; // Will show deleted placeholder instead
    }
    return message.message || message.content || message.text || '';
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {!isOwn && (
          <Avatar 
            name={message.senderName || message.senderId?.name || 'User'} 
            size="sm" 
          />
        )}
        <div className="group relative">
          {isDeleted ? (
            // Deleted message placeholder
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwn
                  ? 'bg-red-200 text-red-400 rounded-br-sm border border-red-300'
                  : 'bg-neutral-100 text-neutral-400 rounded-bl-sm border border-neutral-200'
              }`}
            >
              <p className="text-sm italic flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                This message was deleted
              </p>
              <p className={`text-xs mt-1 ${isOwn ? 'text-red-300' : 'text-neutral-300'}`}>
                {formatTime(message.deletedAt || message.createdAt)}
              </p>
            </div>
          ) : (
            // Normal message
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwn
                  ? 'bg-red-500 text-white rounded-br-sm'
                  : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
              } ${message.pending ? 'opacity-70' : ''}`}
            >
              <p className="text-sm">{getMessageContent()}</p>
              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                <p className={`text-xs ${isOwn ? 'text-red-100' : 'text-neutral-400'}`}>
                  {formatTime(message.createdAt)}
                </p>
                {showReadReceipt && isOwn && (
                  <span className={`text-xs ${message.isRead ? 'text-blue-300' : 'text-red-200'}`}>
                    {message.isRead ? '✓✓' : '✓'}
                  </span>
                )}
                {message.pending && (
                  <span className="text-xs text-red-200">⏳</span>
                )}
              </div>
            </div>
          )}
          
          {/* Delete button - only show for own messages that aren't deleted */}
          {isOwn && !isDeleted && onDelete && (
            <button
              onClick={() => onDelete(message._id)}
              className="absolute -top-2 -right-2 hidden group-hover:flex w-6 h-6 bg-red-600 text-white rounded-full items-center justify-center text-xs hover:bg-red-700 transition-colors shadow-md"
              title="Delete message"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;