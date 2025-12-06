import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

const ChatMessage = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.senderId === user?._id || message.senderId?._id === user?._id;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-red-500 text-white rounded-br-sm'
              : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${isOwn ? 'text-red-100' : 'text-neutral-400'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;