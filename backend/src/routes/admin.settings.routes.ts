import { Router } from 'express';
import {
  getSettings,
  updateSettingsSection,
  getAuditLogs,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from '../controllers/admin.settings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { adminChangePasswordSchema, adminUpdateProfileSchema } from '../validators';

const router = Router();

router.use(requireAuth);

// Settings Configuration
router.get('/', requireRole(['ADMIN', 'STAFF']), getSettings);
router.patch('/:section', requireRole(['ADMIN']), updateSettingsSection);

// Audit Logs
router.get('/audit/logs', requireRole(['ADMIN']), getAuditLogs);

// Admin Profile & Password Management
router.get('/profile/me', requireRole(['ADMIN', 'STAFF']), getAdminProfile);
router.patch('/profile/me', requireRole(['ADMIN', 'STAFF']), validateBody(adminUpdateProfileSchema), updateAdminProfile);
router.patch('/profile/password', requireRole(['ADMIN', 'STAFF']), validateBody(adminChangePasswordSchema), changeAdminPassword);

export default router;
