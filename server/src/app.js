import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import bloodRoutes from './routes/bloodRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Middleware - Allow multiple Vercel domains and localhost
const allowedOrigins = [
  config.clientUrl, // Main configured URL
  'http://localhost:5173',
  'http://localhost:5174',
];

// Also allow any Vercel preview/production URLs
const allowVercelDomains = (origin) => {
  if (!origin) return true; // Allow requests with no origin
  if (allowedOrigins.includes(origin)) return true;
  
  // Allow all Vercel deployment URLs (li-force-client-*.vercel.app)
  if (origin.includes('li-force-client') && origin.includes('vercel.app')) {
    return true;
  }
  
  return false;
};

console.log('CORS allowed origins:', allowedOrigins);
console.log('CORS also allows: All li-force-client-*.vercel.app domains');

app.use(cors({
  origin: (origin, callback) => {
    if (allowVercelDomains(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LifeForce API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    name: 'LifeForce API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      staff: '/api/staff',
      admin: '/api/admin',
      hospitals: '/api/hospitals',
      blood: '/api/blood',
      chat: '/api/chat'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
