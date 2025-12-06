import express from 'express';
import {
  getDashboard,
  getBloodRequests,
  createBloodRequest,
  assignRequest,
  updateRequestStatus,
  getInventory,
  updateInventory,
  bulkUpdateInventory,
  recordDonation,
  getPatients,
  searchPatients,
  addPatient,
  updatePatient,
  deletePatient,
  getDonationSchedules,
  assignDonationSchedule,
  updateDonationScheduleStatus,
  completeDonationSchedule,
  getProfile,
  updateProfile,
  cancelProfileUpdateRequest,
} from '../controllers/staffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('STAFF'));

router.get('/dashboard', getDashboard);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile/update-request', cancelProfileUpdateRequest);

router.get('/blood-requests', getBloodRequests);
router.post('/blood-requests', createBloodRequest);
router.put('/blood-requests/:requestId/assign', assignRequest);
router.put('/blood-requests/:requestId/status', updateRequestStatus);

router.get('/inventory', getInventory);
router.put('/inventory', updateInventory);
router.put('/inventory/bulk', bulkUpdateInventory);

router.get('/patients', getPatients);
router.get('/patients/search', searchPatients);
router.post('/patients', addPatient);
router.put('/patients/:patientId', updatePatient);
router.delete('/patients/:patientId', deletePatient);

router.post('/donations', recordDonation);

// Donation Scheduling
router.get('/donation-schedules', getDonationSchedules);
router.put('/donation-schedules/:scheduleId/assign', assignDonationSchedule);
router.put('/donation-schedules/:scheduleId/status', updateDonationScheduleStatus);
router.put('/donation-schedules/:scheduleId/complete', completeDonationSchedule);

export default router;