import express from 'express';
import {
  getAllBloodRequests,
  getBloodRequestById,
  getAllDonations,
  getInventorySummary,
  getBloodStatistics,
} from '../controllers/bloodController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Blood Requests
router.get('/requests', getAllBloodRequests);
router.get('/requests/:requestId', getBloodRequestById);

// Donations
router.get('/donations', getAllDonations);

// Inventory
router.get('/inventory', getInventorySummary);

// Statistics
router.get('/statistics', getBloodStatistics);

export default router;
