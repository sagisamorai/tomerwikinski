import prisma from './prisma.js';

interface AuditParams {
  userId: string;
  userName: string;
  userRole?: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  entityName?: string;
  details?: string;
}

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
