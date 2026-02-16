import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { z } from 'zod';

const router = Router();

const serviceSchema = z.object({
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  title_en: z.string().optional().nullable(),
  title_pt: z.string().optional().nullable(),
  slug: z.string().min(1, 'Slug הוא שדה חובה').regex(/^[a-z0-9-]+$/, 'Slug חייב להכיל רק אותיות קטנות באנגלית, מספרים ומקפים'),
  shortDescription: z.string().min(1, 'תיאור קצר הוא שדה חובה'),
  shortDescription_en: z.string().optional().nullable(),
  shortDescription_pt: z.string().optional().nullable(),
  fullContent: z.string().optional().default(''),
  fullContent_en: z.string().optional().nullable(),
  fullContent_pt: z.string().optional().nullable(),
  icon: z.string().optional().default('Briefcase'),
  imageUrl: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת השירותים' });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!service) { res.status(404).json({ error: 'השירות לא נמצא' }); return; }
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת השירות' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = serviceSchema.parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const service = await prisma.service.create({
      data: { ...data, createdBy: userId, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'create', entityType: 'service', entityId: service.id, entityName: service.title });
    res.status(201).json(service);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2002') { res.status(400).json({ error: 'Slug כבר קיים במערכת' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה ביצירת השירות' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = serviceSchema.partial().parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { ...data, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'service', entityId: service.id, entityName: service.title });
    res.json(service);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2002') { res.status(400).json({ error: 'Slug כבר קיים במערכת' }); return; }
    if (err?.code === 'P2025') { res.status(404).json({ error: 'השירות לא נמצא' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון השירות' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await logAudit({ userId, userName, userRole: role, action: 'delete', entityType: 'service', entityId: service.id, entityName: service.title });
    res.json({ message: 'השירות נמחק בהצלחה' });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'השירות לא נמצא' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת השירות' });
  }
});

export default router;
