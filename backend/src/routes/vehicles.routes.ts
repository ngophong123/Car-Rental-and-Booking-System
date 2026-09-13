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
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware';
import { createVehicleSchema, updateVehicleSchema, vehicleQuerySchema, uuidParamSchema } from '../validators';

const router = Router();

// Public routes with caching (cache for 1 hour)
router.get('/', validateQuery(vehicleQuerySchema), cacheData('vehicles', 3600), getAllVehicles);
router.get('/:id', validateParams(uuidParamSchema), getVehicleById);

// Protected routes (Admin/Staff only)
router.post('/', requireAuth, requireRole(['ADMIN']), validateBody(createVehicleSchema), createVehicle);
router.patch('/:id', requireAuth, requireRole(['ADMIN']), validateParams(uuidParamSchema), validateBody(updateVehicleSchema), updateVehicle);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), validateParams(uuidParamSchema), deleteVehicle);

export default router;
