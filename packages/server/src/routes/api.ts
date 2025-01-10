import express from 'express';
import { storage } from '../storage/index.js';

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

router.put('/events/:requestId/:responseId', async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ error: 'Response data is required' });
    }
    await storage.lockResponse(req.params.requestId, req.params.responseId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set locked response' });
  }
});


export default router;
