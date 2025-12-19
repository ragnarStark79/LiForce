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

  // Broadcast a message (used when message is saved via REST API)
  socket.on('chat:newMessage', (data) => {
    const { conversationId, message } = data;
    if (!conversationId || !message) return;
    
    // Broadcast to all OTHER users in the conversation (not the sender)
    socket.to(`conversation:${conversationId}`).emit('chat:newMessage', {
      conversationId,
      message
    });
    
    // Also send notification to recipient if they're not in the conversation room
    const recipientId = message.receiverId?._id || message.receiverId;
    if (recipientId) {
      socket.to(`user:${recipientId}`).emit('chat:notification', {
        conversationId,
        message: message.message || message.content,
        senderName: message.senderId?.name || 'Someone',
        senderId: message.senderId?._id || message.senderId
      });
    }
    
    console.log(`Message broadcast in conversation ${conversationId}`);
  });

  // Send a message via socket (alternative to REST - saves to DB)
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
        isRead: false,
        isDeleted: false
      });

      await message.populate('senderId', 'name email role avatar');

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          content,
          senderId: socket.userId,
          timestamp: new Date()
        }
      });

      // Emit to ALL users in the conversation (including sender for confirmation)
      io.to(`conversation:${conversationId}`).emit('chat:newMessage', {
        conversationId,
        message: {
          _id: message._id,
          message: message.message,
          senderId: message.senderId,
          receiverId: message.receiverId,
          createdAt: message.createdAt,
          isRead: message.isRead,
          isDeleted: message.isDeleted
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

  // Delete a message (soft delete - marks as deleted instead of removing)
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

      // Soft delete - mark as deleted instead of removing
      await ChatMessage.findByIdAndUpdate(messageId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: socket.userId
      });

      // Emit to all users in the conversation that message was deleted
      io.to(`conversation:${conversationId}`).emit('chat:messageDeleted', {
        conversationId,
        messageId,
        isDeleted: true,
        deletedAt: new Date()
      });

      console.log(`Message ${messageId} soft-deleted by ${socket.userId}`);
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