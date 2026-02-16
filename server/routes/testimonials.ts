import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { z } from 'zod';

const router = Router();

const testimonialSchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  role: z.string().min(1, 'תפקיד הוא שדה חובה'),
  role_en: z.string().optional().nullable(),
  role_pt: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  company_en: z.string().optional().nullable(),
  company_pt: z.string().optional().nullable(),
  content: z.string().min(1, 'תוכן ההמלצה הוא שדה חובה'),
  content_en: z.string().optional().nullable(),
  content_pt: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    });
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת ההמלצות' });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const testimonial = await prisma.testimonial.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!testimonial) { res.status(404).json({ error: 'ההמלצה לא נמצאה' }); return; }
    res.json(testimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת ההמלצה' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = testimonialSchema.parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const testimonial = await prisma.testimonial.create({
      data: { ...data, createdBy: userId, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'create', entityType: 'testimonial', entityId: testimonial.id, entityName: testimonial.name });
    res.status(201).json(testimonial);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה ביצירת ההמלצה' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = testimonialSchema.partial().parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { ...data, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'testimonial', entityId: testimonial.id, entityName: testimonial.name });
    res.json(testimonial);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2025') { res.status(404).json({ error: 'ההמלצה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון ההמלצה' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await logAudit({ userId, userName, userRole: role, action: 'delete', entityType: 'testimonial', entityId: testimonial.id, entityName: testimonial.name });
    res.json({ message: 'ההמלצה נמחקה בהצלחה' });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'ההמלצה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת ההמלצה' });
  }
});

export default router;
