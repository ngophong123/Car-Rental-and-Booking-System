import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  assignDriver,
  updateDriverTripStatus
} from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { bookingLimiter } from '../middlewares/rateLimiter';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  assignDriverSchema,
  driverTripStatusSchema,
  uuidParamSchema
} from '../validators';

const router = Router();

// All booking routes require authentication
router.use(requireAuth);

router.post('/', bookingLimiter, validateBody(createBookingSchema), createBooking);
router.get('/', getBookings);
router.get('/:id', validateParams(uuidParamSchema), getBookingById);
router.post('/:id/cancel', validateParams(uuidParamSchema), cancelBooking);

// Driver actions
router.patch('/:id/driver-status', requireRole(['DRIVER']), validateParams(uuidParamSchema), validateBody(driverTripStatusSchema), updateDriverTripStatus);

// Only Admin/Staff can update status arbitrarily or assign driver
router.patch('/:id/status', requireRole(['ADMIN', 'STAFF']), validateParams(uuidParamSchema), validateBody(updateBookingStatusSchema), updateBookingStatus);
router.patch('/:id/assign-driver', requireRole(['ADMIN', 'STAFF']), validateParams(uuidParamSchema), validateBody(assignDriverSchema), assignDriver);

export default router;
