import { type Request, type Response, type NextFunction } from 'express';
import { getUserInfo } from './auth.js';

export type Role = 'admin' | 'editor';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { role } = getUserInfo(req);
    if (!allowedRoles.includes(role as Role)) {
      res.status(403).json({ error: 'אין לך הרשאה לבצע פעולה זו' });
      return;
    }
    next();
  };
}

export function canDelete(req: Request): boolean {
  const { role } = getUserInfo(req);
  return role === 'admin';
}
