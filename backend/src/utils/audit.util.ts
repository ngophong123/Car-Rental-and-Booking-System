import { Request } from 'express';
import { prisma } from '../prisma';

export interface AuditLogParams {
  adminId?: string | null;
  adminEmail?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, any> | null;
  req?: Request;
}

// Strip any potentially sensitive keys before writing to audit log
const sanitizeDetails = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeDetails);

  const sensitiveKeys = ['password', 'currentPassword', 'newPassword', 'token', 'refreshToken', 'secret', 'secretKey', 'cvv', 'apiKey'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeDetails(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export const logAudit = async (params: AuditLogParams): Promise<void> => {
  try {
    const { adminId, adminEmail, action, resource, resourceId, details, req } = params;

    const ipAddress = req
      ? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || req.ip || null
      : null;

    const userAgent = req ? (req.headers['user-agent'] as string) || null : null;

    await prisma.auditLog.create({
      data: {
        adminId: adminId || null,
        adminEmail: adminEmail || null,
        action,
        resource,
        resourceId: resourceId || null,
        details: details ? sanitizeDetails(details) : undefined,
        ipAddress: ipAddress ? ipAddress.slice(0, 50) : null,
        userAgent: userAgent ? userAgent.slice(0, 255) : null
      }
    });
  } catch (error) {
    // Non-blocking: Audit logging errors should not crash the main business transaction
    console.error('[AUDIT LOGGING FAILED]:', error);
  }
};
