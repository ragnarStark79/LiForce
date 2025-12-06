import express from 'express';
import {
  getDashboard,
  getBloodRequests,
  assignRequest,
  updateRequestStatus,
  getInventory,
  updateInventory,
  bulkUpdateInventory,
  recordDonation,
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
} from '../controllers/staffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('STAFF'));

router.get('/dashboard', getDashboard);

router.get('/blood-requests', getBloodRequests);
router.put('/blood-requests/:requestId/assign', assignRequest);
router.put('/blood-requests/:requestId/status', updateRequestStatus);

router.get('/inventory', getInventory);
router.put('/inventory', updateInventory);
router.put('/inventory/bulk', bulkUpdateInventory);

router.get('/patients', getPatients);
router.post('/patients', addPatient);
router.put('/patients/:patientId', updatePatient);
router.delete('/patients/:patientId', deletePatient);

router.post('/donations', recordDonation);

export default router;