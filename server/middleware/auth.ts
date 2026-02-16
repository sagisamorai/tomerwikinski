import { type Request, type Response, type NextFunction } from 'express';
import { getAuth } from '@clerk/express';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: 'נדרשת התחברות למערכת' });
    return;
  }
  next();
}

export function getUserInfo(req: Request): { userId: string; userName: string; role: string } {
  const auth = getAuth(req);
  const userId = auth?.userId || 'unknown';
  const sessionClaims = auth?.sessionClaims as any;
  const userName = sessionClaims?.firstName
    ? `${sessionClaims.firstName} ${sessionClaims.lastName || ''}`.trim()
    : sessionClaims?.email || 'משתמש';
  const role = (sessionClaims?.publicMetadata as any)?.role || 'editor';
  return { userId, userName, role };
}
