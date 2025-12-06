import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

// Handle notification-related socket events
export const handleNotificationSocket = (io, socket) => {
  // Subscribe to notifications
  socket.on('notification:subscribe', () => {
    logger.info(`User ${socket.userId} subscribed to notifications`);
  });

  // Mark notification as read
  socket.on('notification:read', async ({ notificationId }) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        isRead: true,
        readAt: new Date()
      });

      socket.emit('notification:read:success', { notificationId });
      logger.info(`Notification ${notificationId} marked as read`);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      socket.emit('notification:error', { message: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  socket.on('notification:read:all', async () => {
    try {
      await Notification.updateMany(
        { userId: socket.userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );

      socket.emit('notification:read:all:success');
      logger.info(`All notifications marked as read for user ${socket.userId}`);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      socket.emit('notification:error', { message: 'Failed to mark all notifications as read' });
    }
  });
};

// Emit notification to user
export const emitNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
  logger.info(`Notification sent to user ${userId}`);
};

// Emit notification to role
export const emitNotificationToRole = (io, role, notification) => {
  io.to(`role:${role}`).emit('notification:new', notification);
  logger.info(`Notification sent to role ${role}`);
};

export default handleNotificationSocket;
