import { Router } from 'express';
import {
  getAllDrivers,
  createDriver,
  updateDriverStatus
} from '../controllers/drivers.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import { createDriverSchema, updateDriverStatusSchema, uuidParamSchema } from '../validators';

const router = Router();

// Only Admin/Staff can manage drivers
router.use(requireAuth, requireRole(['ADMIN', 'STAFF']));

router.get('/', getAllDrivers);
router.post('/', validateBody(createDriverSchema), createDriver);
router.patch('/:id/status', validateParams(uuidParamSchema), validateBody(updateDriverStatusSchema), updateDriverStatus);

export default router;
