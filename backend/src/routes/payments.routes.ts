import { Router } from 'express';
import { createPayment, confirmPayment, getPayments } from '../controllers/payments.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', createPayment);
router.get('/', requireRole(['ADMIN', 'STAFF']), getPayments);
router.patch('/:id/confirm', requireRole(['ADMIN', 'STAFF']), confirmPayment);

export default router;
