import express from 'express';
import {
  getAllHospitals,
  getHospitalById,
  getHospitalInventory,
  createHospital,
  updateHospital,
  deleteHospital,
} from '../controllers/hospitalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import Hospital from '../models/Hospital.js';

const router = express.Router();

// Public route - for staff registration (no auth required)
router.get('/public', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
      .select('_id name code city')
      .sort({ name: 1 });
    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes (require authentication)
router.use(authMiddleware);

router.get('/', getAllHospitals);
router.get('/:hospitalId', getHospitalById);
router.get('/:hospitalId/inventory', getHospitalInventory);

// Admin only routes
router.post('/', roleMiddleware('ADMIN'), createHospital);
router.put('/:hospitalId', roleMiddleware('ADMIN'), updateHospital);
router.delete('/:hospitalId', roleMiddleware('ADMIN'), deleteHospital);

export default router;
