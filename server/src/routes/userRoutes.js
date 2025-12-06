import express from 'express';
import {
  getDashboard,
  getProfile,
  updateProfile,
  getBloodRequests,
  createBloodRequest,
  getDonationHistory,
  cancelBloodRequest,
  getSettings,
  updateSettings,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication as USER
router.use(authMiddleware);
router.use(roleMiddleware('USER'));

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Blood Requests
router.get('/blood-requests', getBloodRequests);
router.post('/blood-requests', createBloodRequest);
router.put('/blood-requests/:requestId/cancel', cancelBloodRequest);

// Donation History
router.get('/donations', getDonationHistory);

export default router;
