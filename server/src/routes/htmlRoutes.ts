import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router, Request, Response } from 'express';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Serve index.html file for all routes
router.get('*', (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, '../../../client/dist/index.html'));
});

export default router;