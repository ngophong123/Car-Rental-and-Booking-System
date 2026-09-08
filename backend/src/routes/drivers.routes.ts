import { Router } from 'express';
import {
  getAllDrivers,
  createDriver,
  updateDriverStatus
} from '../controllers/drivers.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only Admin/Staff can manage drivers
router.use(requireAuth, requireRole(['ADMIN', 'STAFF']));

router.get('/', getAllDrivers);
router.post('/', createDriver);
router.patch('/:id/status', updateDriverStatus);

export default router;
