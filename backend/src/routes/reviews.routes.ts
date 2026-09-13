import { Router } from 'express';
import { createReview, getVehicleReviews } from '../controllers/reviews.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import { createReviewSchema } from '../validators';
import { z } from 'zod';

const router = Router();

const vehicleIdParamSchema = z.object({
  vehicleId: z.string().uuid({ message: 'Mã phương tiện phải là UUID hợp lệ' })
});

router.get('/vehicle/:vehicleId', validateParams(vehicleIdParamSchema), getVehicleReviews); // Public
router.post('/', requireAuth, validateBody(createReviewSchema), createReview); // Customer only

export default router;
