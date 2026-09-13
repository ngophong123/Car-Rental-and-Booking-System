import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import { createServiceSchema, updateServiceSchema, uuidParamSchema } from '../validators';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', validateParams(uuidParamSchema), getServiceById);

// Protected routes (Admin only)
router.post('/', requireAuth, requireRole(['ADMIN']), validateBody(createServiceSchema), createService);
router.patch('/:id', requireAuth, requireRole(['ADMIN']), validateParams(uuidParamSchema), validateBody(updateServiceSchema), updateService);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), validateParams(uuidParamSchema), deleteService);

export default router;
