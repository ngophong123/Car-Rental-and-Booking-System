import { Router } from 'express';
import {
  getCustomers,
  getCustomerDetail,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
} from '../controllers/admin.customers.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  adminCustomerQuerySchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
  uuidParamSchema,
} from '../validators';

const router = Router();

// Global Auth Guard: All customer admin endpoints require valid JWT authentication
router.use(requireAuth);

// Read Access: ADMIN and STAFF
router.get('/', requireRole(['ADMIN', 'STAFF']), validateQuery(adminCustomerQuerySchema), getCustomers);
router.get('/:id', requireRole(['ADMIN', 'STAFF']), validateParams(uuidParamSchema), getCustomerDetail);

// Mutation Access: Strictly ADMIN
router.patch('/:id', requireRole(['ADMIN']), validateParams(uuidParamSchema), validateBody(updateCustomerSchema), updateCustomer);
router.post('/:id/status', requireRole(['ADMIN']), validateParams(uuidParamSchema), validateBody(updateCustomerStatusSchema), updateCustomerStatus);
router.delete('/:id', requireRole(['ADMIN']), validateParams(uuidParamSchema), deleteCustomer);

export default router;
