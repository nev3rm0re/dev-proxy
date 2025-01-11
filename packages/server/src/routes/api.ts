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

router.post<{ requestId: string; responseId: string }>('/events/:requestId/:responseId', async (req, res) => {
  try {
    const response = await storage.toggleResponseLock(req.params.requestId, req.params.responseId);
    res.json({
      data: response,
      success: true,
      message: `Response ${req.params.responseId} locked for request ${req.params.requestId}`
    });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to set locked response' });
    return;
  }
});

router.post('/events/:requestId/:responseId/body', async (req, res) => {
  try {
    const route = await storage.getRoute(req.params.requestId);
    if (!route) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    const response = route.responses.find(r => r.responseId === req.params.responseId);
    if (!response) {
      res.status(404).json({ error: 'Response not found' });
      return;
    }
    response.lockedBody = req.body;
    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save response' });
  }
});

export default router;
