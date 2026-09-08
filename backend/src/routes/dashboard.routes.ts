import { Router } from 'express';
import {
  getDashboardStats,
  getDashboardCharts
} from '../controllers/dashboard.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only Admin/Staff can access dashboard data
router.use(requireAuth, requireRole(['ADMIN', 'STAFF']));

router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);

export default router;
