import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { z } from 'zod';

const router = Router();

const faqSchema = z.object({
  question: z.string().min(1, 'שאלה היא שדה חובה'),
  question_en: z.string().optional().nullable(),
  question_pt: z.string().optional().nullable(),
  answer: z.string().min(1, 'תשובה היא שדה חובה'),
  answer_en: z.string().optional().nullable(),
  answer_pt: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    });
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת השאלות הנפוצות' });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const faq = await prisma.fAQ.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!faq) { res.status(404).json({ error: 'השאלה לא נמצאה' }); return; }
    res.json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת השאלה' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = faqSchema.parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const faq = await prisma.fAQ.create({
      data: { ...data, createdBy: userId, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'create', entityType: 'faq', entityId: faq.id, entityName: faq.question.substring(0, 50) });
    res.status(201).json(faq);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה ביצירת השאלה' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = faqSchema.partial().parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const faq = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: { ...data, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'faq', entityId: faq.id, entityName: faq.question.substring(0, 50) });
    res.json(faq);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2025') { res.status(404).json({ error: 'השאלה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון השאלה' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    const faq = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await logAudit({ userId, userName, userRole: role, action: 'delete', entityType: 'faq', entityId: faq.id, entityName: faq.question.substring(0, 50) });
    res.json({ message: 'השאלה נמחקה בהצלחה' });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'השאלה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת השאלה' });
  }
});

export default router;
