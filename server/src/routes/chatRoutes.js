import express from 'express';
import {
  getChatMessages,
  sendMessage,
  getConversations,
  findUserByPhone,
  getStaffAdminConversation,
  markAsRead,
  getUnreadCount,
  searchUsers,
  startConversation,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/messages/:roomId', getChatMessages);
router.post('/messages', sendMessage);
router.put('/messages/:roomId/read', markAsRead);
router.get('/unread-count', getUnreadCount);
router.get('/find-user', findUserByPhone);
router.get('/search-users', searchUsers);
router.post('/start-conversation', startConversation);
router.get('/admin-conversation', getStaffAdminConversation);

export default router;
