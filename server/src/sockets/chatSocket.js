import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

export const handleChatSocket = (io, socket) => {
  // Join user's personal room for notifications
  socket.join(`user:${socket.userId}`);

  // Join a conversation room
  socket.on('chat:join', ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave a conversation room
  socket.on('chat:leave', ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Send a message
  socket.on('chat:message', async (data) => {
    try {
      const { conversationId, receiverId, content } = data;
      
      if (!conversationId || !content) {
        socket.emit('chat:error', { message: 'Conversation ID and content are required' });
        return;
      }

      const sender = await User.findById(socket.userId).select('name role');

      const message = await ChatMessage.create({
        roomId: conversationId,
        senderId: socket.userId,
        receiverId,
        message: content,
        isRead: false
      });

      await message.populate('senderId', 'name email role avatar');

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          content,
          senderId: socket.userId,
          timestamp: new Date()
        }
      });

      io.to(`conversation:${conversationId}`).emit('chat:newMessage', {
        conversationId,
        message: {
          _id: message._id,
          message: message.message,
          senderId: message.senderId,
          createdAt: message.createdAt,
          isRead: message.isRead
        }
      });
      
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('chat:notification', {
          conversationId,
          message: content,
          senderName: sender?.name || 'Someone',
          senderId: socket.userId
        });
      }

      console.log(`Message sent in conversation ${conversationId} by ${socket.userId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Delete a message
  socket.on('chat:deleteMessage', async (data) => {
    try {
      const { messageId, conversationId } = data;

      if (!messageId) {
        socket.emit('chat:error', { message: 'Message ID is required' });
        return;
      }

      const message = await ChatMessage.findById(messageId);

      if (!message) {
        socket.emit('chat:error', { message: 'Message not found' });
        return;
      }

      if (message.senderId.toString() !== socket.userId.toString()) {
        socket.emit('chat:error', { message: 'You can only delete your own messages' });
        return;
      }

      await ChatMessage.findByIdAndDelete(messageId);

      io.to(`conversation:${conversationId}`).emit('chat:messageDeleted', {
        conversationId,
        messageId
      });

      console.log(`Message ${messageId} deleted by ${socket.userId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('chat:error', { message: 'Failed to delete message' });
    }
  });

  // Typing indicator - start typing
  socket.on('chat:typing', async ({ conversationId }) => {
    try {
      const user = await User.findById(socket.userId).select('name');
      socket.to(`conversation:${conversationId}`).emit('chat:typing', {
        conversationId,
        userId: socket.userId,
        userName: user?.name || 'Someone'
      });
    } catch (error) {
      console.error('Error emitting typing indicator:', error);
    }
  });

  // Typing indicator - stop typing
  socket.on('chat:stopTyping', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('chat:stopTyping', {
      conversationId,
      userId: socket.userId
    });
  });

  // Mark messages as read
  socket.on('chat:markRead', async ({ conversationId }) => {
    try {
      const result = await ChatMessage.updateMany(
        {
          roomId: conversationId,
          receiverId: socket.userId,
          isRead: false
        },
        { $set: { isRead: true, readAt: new Date() } }
      );

      // Emit to all users in the conversation that messages were read
      socket.to(`conversation:${conversationId}`).emit('chat:messagesRead', {
        conversationId,
        readBy: socket.userId,
        readAt: new Date()
      });

      console.log(`${result.modifiedCount} messages marked as read in conversation ${conversationId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
};

export default handleChatSocket;