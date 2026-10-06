import { db } from './db';

export interface AuditLogInput {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, any> | null;
}

export async function logAudit(input: AuditLogInput) {
  try {
    return await db.auditLog.create({
      data: {
        user_id: input.userId || null,
        user_name: input.userName || null,
        user_role: input.userRole || null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        ip_address: input.ipAddress || null,
        user_agent: input.userAgent || null,
        details: input.details ? JSON.stringify(input.details) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}
