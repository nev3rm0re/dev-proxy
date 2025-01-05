import express from 'express';
import { storage } from '../storage.ts';

const router = express.Router();

router.get('/_history', async (req, res) => {
  try {
    const history = await storage.getHistory();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/_lock/:requestId', async (req, res) => {
  try {
    console.log('locking request', req.params.requestId);
    await storage.lockRequest(req.params.requestId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to lock request' });
  }
});

export default router;
