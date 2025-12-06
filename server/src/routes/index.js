import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import staffRoutes from './staffRoutes.js';
import adminRoutes from './adminRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import bloodRoutes from './bloodRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/staff', staffRoutes);
router.use('/admin', adminRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/blood', bloodRoutes);
router.use('/chat', chatRoutes);

export default router;
