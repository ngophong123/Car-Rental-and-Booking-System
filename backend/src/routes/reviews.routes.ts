import { Router } from 'express';
import { createReview, getVehicleReviews } from '../controllers/reviews.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/vehicle/:vehicleId', getVehicleReviews); // Public
router.post('/', requireAuth, createReview); // Customer only

export default router;
