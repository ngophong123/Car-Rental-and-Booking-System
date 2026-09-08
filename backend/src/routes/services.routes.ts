import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected routes (Admin only)
router.post('/', requireAuth, requireRole(['ADMIN']), createService);
router.patch('/:id', requireAuth, requireRole(['ADMIN']), updateService);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), deleteService);

export default router;
