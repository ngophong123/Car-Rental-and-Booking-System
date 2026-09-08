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

const router = Router();

// All booking routes require authentication
router.use(requireAuth);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

// Driver actions
router.patch('/:id/driver-status', requireRole(['DRIVER']), updateDriverTripStatus);

// Only Admin/Staff can update status arbitrarily or assign driver
router.patch('/:id/status', requireRole(['ADMIN', 'STAFF']), updateBookingStatus);
router.patch('/:id/assign-driver', requireRole(['ADMIN', 'STAFF']), assignDriver);

export default router;
