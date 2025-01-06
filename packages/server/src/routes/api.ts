import express from 'express';
import { storage } from '../storage';

const router = express.Router();

router.get('/history', async (req, res) => {
  try {
    const history = await storage.getRoutes();
    res.json(Object.values(history));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/events/:requestId', async (req, res) => {
  try {
    await storage.lockRoute(req.params.requestId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to lock request' });
  }
});

export default router;
