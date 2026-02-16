import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { z } from 'zod';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  email: z.string().email('כתובת דוא״ל אינה תקינה'),
  phone: z.string().optional().nullable(),
  message: z.string().min(1, 'הודעה היא שדה חובה'),
});

// GET /api/contacts - list all messages (admin only view)
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הפניות' });
  }
});

// POST /api/contacts - submit from public site (no auth required)
router.post('/public', async (req: Request, res: Response) => {
  try {
    const data = contactSchema.parse(req.body);
    const message = await prisma.contactMessage.create({ data });
    res.status(201).json({ message: 'הפנייה נשלחה בהצלחה' });
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בשליחת הפנייה' });
  }
});

// PUT /api/contacts/:id/read - mark as read
router.put('/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(message);
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הפנייה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון הפנייה' });
  }
});

// DELETE /api/contacts/:id - delete message
router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    await logAudit({ userId, userName, userRole: role, action: 'delete', entityType: 'contact', entityId: req.params.id, entityName: 'פנייה' });
    res.json({ message: 'הפנייה נמחקה בהצלחה' });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הפנייה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת הפנייה' });
  }
});

export default router;
