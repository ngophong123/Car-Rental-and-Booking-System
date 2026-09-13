import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocket, isAllowedOrigin } from './socket';
import { APP_NAME } from "./shared";
import { apiLimiter } from './middlewares/rateLimiter';

import authRoutes from './routes/auth.routes';
import vehiclesRoutes from './routes/vehicles.routes';
import servicesRoutes from './routes/services.routes';
import bookingsRoutes from './routes/bookings.routes';
import driversRoutes from './routes/drivers.routes';
import paymentsRoutes from './routes/payments.routes';
import reviewsRoutes from './routes/reviews.routes';
import dashboardRoutes from './routes/dashboard.routes';
import aiRoutes from './routes/ai.routes';
import adminCustomersRoutes from './routes/admin.customers.routes';
import adminSettingsRoutes from './routes/admin.settings.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;

// Security: Disable X-Powered-By header to prevent technology fingerprinting
app.disable('x-powered-by');

// Security: Mount Helmet for standard HTTP security headers
app.use(helmet({
  contentSecurityPolicy: false, // APIs return JSON; CSP configured on frontend Next.js
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  xContentTypeOptions: true,
  xFrameOptions: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Initialize WebSockets
initSocket(httpServer);

// Security: Strict CORS Whitelist
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'device-fingerprint',
    'client-timestamp',
  ],
  maxAge: 86400
}));

// Security: Explicit Request Body Limits against DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security: Apply General Rate Limiter to all API endpoints
app.use('/api', apiLimiter);

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin/payments', paymentsRoutes);
app.use('/api/admin/customers', adminCustomersRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/ai', aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: `Server is running healthy! (${APP_NAME})`,
    timestamp: new Date().toISOString(),
  });
});

// Security: Central Express Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err?.message === 'Blocked by CORS policy') {
    res.status(403).json({ success: false, message: 'Origin not allowed by CORS policy', data: null });
    return;
  }
  
  console.error('[SERVER ERROR]:', err?.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'An internal server error occurred.' : (err.message || 'Server error'),
    data: null
  });
});

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
