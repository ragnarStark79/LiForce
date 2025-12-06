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
  getAllHospitals,
  createHospital,
  updateHospitalById,
  deleteHospital,
  reactivateHospital,
  getActivityLogs,
  getMetrics,
  toggleUserStatus,
  getPendingProfileUpdates,
  approveProfileUpdate,
  rejectProfileUpdate,
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

// Toggle user status (alternative to suspend/activate)
router.put('/users/:userId/toggle-status', toggleUserStatus);

// Hospital Management (own hospital)
router.get('/hospital', getHospital);
router.put('/hospital', updateHospital);

// Hospital Management (all hospitals - for super admin)
router.get('/hospitals', getAllHospitals);
router.post('/hospitals', createHospital);
router.put('/hospitals/:hospitalId', updateHospitalById);
router.delete('/hospitals/:hospitalId', deleteHospital);
router.put('/hospitals/:hospitalId/reactivate', reactivateHospital);

// Analytics
router.get('/analytics', getAnalytics);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

// Metrics
router.get('/metrics', getMetrics);

// Profile Update Approvals
router.get('/profile-updates/pending', getPendingProfileUpdates);
router.put('/profile-updates/:staffId/approve', approveProfileUpdate);
router.put('/profile-updates/:staffId/reject', rejectProfileUpdate);

export default router;
