import express from 'express';
import {
  getDashboard,
  getPendingStaff,
  approveStaff,
  rejectStaff,
  getAllStaff,
  getAllUsers,
  updateHospital,
  getHospital,
  getAnalytics,
  suspendUser,
  activateUser,
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication as ADMIN
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboard);

// Staff Management
router.get('/staff/pending', getPendingStaff);
router.get('/staff', getAllStaff);
router.put('/staff/:staffId/approve', approveStaff);
router.put('/staff/:staffId/reject', rejectStaff);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:userId/suspend', suspendUser);
router.put('/users/:userId/activate', activateUser);

// Hospital Management
router.get('/hospital', getHospital);
router.put('/hospital', updateHospital);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
