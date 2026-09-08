import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicles.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { cacheData } from '../middlewares/cache.middleware';

const router = Router();

// Public routes with caching (cache for 1 hour)
router.get('/', cacheData('vehicles', 3600), getAllVehicles);
router.get('/:id', getVehicleById); // Maybe cache this too? Just keep list for now

// Protected routes (Admin/Staff only)
router.post('/', requireAuth, requireRole(['ADMIN']), createVehicle);
router.patch('/:id', requireAuth, requireRole(['ADMIN']), updateVehicle);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), deleteVehicle);

export default router;
