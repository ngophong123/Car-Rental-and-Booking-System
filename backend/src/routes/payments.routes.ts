import { Router } from 'express';
import {
  createPayment,
  getPayments,
  getPaymentDetail,
  confirmPayment,
  updatePaymentStatus,
  refundPayment,
  exportPaymentsCSV,
} from '../controllers/payments.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { paymentLimiter } from '../middlewares/rateLimiter';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  createPaymentSchema,
  adminPaymentQuerySchema,
  updatePaymentStatusSchema,
  refundPaymentSchema,
  uuidParamSchema,
} from '../validators';

const router = Router();

router.use(requireAuth);

// Customer Initiates Payment
router.post('/', paymentLimiter, validateBody(createPaymentSchema), createPayment);

// Admin & Staff: Query & Export Payments
router.get('/', requireRole(['ADMIN', 'STAFF']), validateQuery(adminPaymentQuerySchema), getPayments);
router.get('/export/csv', requireRole(['ADMIN', 'STAFF']), exportPaymentsCSV);
router.get('/:id', requireRole(['ADMIN', 'STAFF']), validateParams(uuidParamSchema), getPaymentDetail);

// Admin & Staff: Confirm payment
router.patch('/:id/confirm', requireRole(['ADMIN', 'STAFF']), validateParams(uuidParamSchema), confirmPayment);

// Strictly Admin: Status update & Refund
router.patch('/:id/status', requireRole(['ADMIN']), validateParams(uuidParamSchema), validateBody(updatePaymentStatusSchema), updatePaymentStatus);
router.post('/:id/refund', requireRole(['ADMIN']), validateParams(uuidParamSchema), validateBody(refundPaymentSchema), refundPayment);

export default router;
