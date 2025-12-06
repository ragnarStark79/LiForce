import Notification from '../models/Notification.js';
import { emitToUser } from '../sockets/index.js';
import logger from '../utils/logger.js';

// Create a notification
export const createNotification = async (userId, type, title, message, relatedData = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedData,
      isRead: false,
    });

    // Emit real-time notification via socket
    try {
      emitToUser(userId, 'notification:new', notification);
    } catch (socketError) {
      logger.warn('Failed to emit notification via socket:', socketError.message);
    }

    logger.info(`Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

// Create bulk notifications
export const createBulkNotifications = async (notifications) => {
  try {
    const createdNotifications = await Notification.insertMany(notifications);
    
    // Emit to each user
    createdNotifications.forEach(notification => {
      try {
        emitToUser(notification.userId, 'notification:new', notification);
      } catch (socketError) {
        logger.warn(`Failed to emit notification to user ${notification.userId}`);
      }
    });

    logger.info(`Created ${createdNotifications.length} notifications`);
    return createdNotifications;
  } catch (error) {
    logger.error('Error creating bulk notifications:', error);
    throw error;
  }
};

// Notification types helper functions
export const notifyBloodRequestCreated = async (staffUserIds, requestData) => {
  const notifications = staffUserIds.map(userId => ({
    userId,
    type: 'BLOOD_REQUEST',
    title: 'New Blood Request',
    message: `New ${requestData.urgency} blood request for ${requestData.bloodGroup}`,
    relatedData: {
      requestId: requestData._id,
      bloodGroup: requestData.bloodGroup,
      urgency: requestData.urgency,
    },
  }));

  return await createBulkNotifications(notifications);
};

export const notifyBloodRequestStatusUpdate = async (userId, requestData, newStatus) => {
  return await createNotification(
    userId,
    'BLOOD_REQUEST',
    'Blood Request Update',
    `Your blood request has been ${newStatus.toLowerCase()}`,
    {
      requestId: requestData._id,
      status: newStatus,
      bloodGroup: requestData.bloodGroup,
    }
  );
};

export const notifyDonationScheduled = async (userId, donationData) => {
  return await createNotification(
    userId,
    'DONATION',
    'Donation Scheduled',
    `Your donation appointment is scheduled for ${new Date(donationData.donationDate).toLocaleDateString()}`,
    {
      donationId: donationData._id,
      donationDate: donationData.donationDate,
      hospitalId: donationData.hospitalId,
    }
  );
};

export const notifyStaffApprovalStatus = async (userId, status, hospitalName) => {
  const message = status === 'APPROVED' 
    ? `Your staff registration at ${hospitalName} has been approved!`
    : `Your staff registration at ${hospitalName} has been rejected.`;

  return await createNotification(
    userId,
    'STAFF_APPROVAL',
    'Staff Registration Update',
    message,
    { status }
  );
};

export const notifyInventoryLow = async (staffUserIds, inventoryData) => {
  const notifications = staffUserIds.map(userId => ({
    userId,
    type: 'INVENTORY_ALERT',
    title: 'Low Inventory Alert',
    message: `${inventoryData.bloodGroup} blood units are running low (${inventoryData.unitsAvailable} units remaining)`,
    relatedData: {
      bloodGroup: inventoryData.bloodGroup,
      unitsAvailable: inventoryData.unitsAvailable,
      hospitalId: inventoryData.hospitalId,
    },
  }));

  return await createBulkNotifications(notifications);
};

export const notifyChatMessage = async (userId, senderName, messagePreview) => {
  return await createNotification(
    userId,
    'CHAT_MESSAGE',
    'New Message',
    `${senderName}: ${messagePreview.substring(0, 50)}...`,
    { senderName }
  );
};

export default {
  createNotification,
  createBulkNotifications,
  notifyBloodRequestCreated,
  notifyBloodRequestStatusUpdate,
  notifyDonationScheduled,
  notifyStaffApprovalStatus,
  notifyInventoryLow,
  notifyChatMessage,
};
