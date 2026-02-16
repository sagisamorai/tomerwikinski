import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (allowed.includes(file.mimetype)) { cb(null, true); }
    else { cb(new Error('סוג הקובץ אינו נתמך. קבצים מותרים: JPG, PNG, GIF, WebP, SVG, PDF')); }
  },
});

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = categoryId;
    const media = await prisma.mediaAsset.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת קבצי המדיה' });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const media = await prisma.mediaAsset.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { category: true },
    });
    if (!media) { res.status(404).json({ error: 'הקובץ לא נמצא' }); return; }
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הקובץ' });
  }
});

router.post('/', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'לא נבחר קובץ להעלאה' }); return; }
    const { userId, userName, role } = getUserInfo(req);
    const media = await prisma.mediaAsset.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        alt: req.body.alt || null,
        categoryId: req.body.categoryId || null,
        createdBy: userId,
      },
    });
    await logAudit({ userId, userName, userRole: role, action: 'create', entityType: 'media', entityId: media.id, entityName: media.originalName });
    res.status(201).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהעלאת הקובץ' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    const media = await prisma.mediaAsset.update({
      where: { id: req.params.id },
      data: {
        alt: req.body.alt ?? undefined,
        categoryId: req.body.categoryId ?? undefined,
      },
    });
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'media', entityId: media.id, entityName: media.originalName });
    res.json(media);
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הקובץ לא נמצא' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון הקובץ' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    const media = await prisma.mediaAsset.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await logAudit({ userId, userName, userRole: role, action: 'delete', entityType: 'media', entityId: media.id, entityName: media.originalName });
    res.json({ message: 'הקובץ נמחק בהצלחה' });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הקובץ לא נמצא' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת הקובץ' });
  }
});

export default router;
