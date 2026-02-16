import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1, 'שם הקטגוריה הוא שדה חובה'),
  name_en: z.string().optional().nullable(),
  name_pt: z.string().optional().nullable(),
  slug: z.string().min(1, 'Slug הוא שדה חובה').regex(/^[a-z0-9-]+$/, 'Slug חייב להכיל רק אותיות קטנות באנגלית, מספרים ומקפים'),
  description: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  description_pt: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { media: true } } },
      orderBy: { order: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הקטגוריות' });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { media: { where: { deletedAt: null } } },
    });
    if (!category) { res.status(404).json({ error: 'הקטגוריה לא נמצאה' }); return; }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הקטגוריה' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = categorySchema.parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const category = await prisma.category.create({ data });
    await logAudit({ userId, userName, userRole: role, action: 'create', entityType: 'category', entityId: category.id, entityName: category.name });
    res.status(201).json(category);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2002') { res.status(400).json({ error: 'Slug כבר קיים במערכת' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה ביצירת הקטגוריה' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'category', entityId: category.id, entityName: category.name });
    res.json(category);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2002') { res.status(400).json({ error: 'Slug כבר קיים במערכת' }); return; }
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הקטגוריה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון הקטגוריה' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await logAudit({ userId, userName, userRole: role, action: 'delete', entityType: 'category', entityId: category.id, entityName: category.name });
    res.json({ message: 'הקטגוריה נמחקה בהצלחה' });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הקטגוריה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת הקטגוריה' });
  }
});

export default router;
