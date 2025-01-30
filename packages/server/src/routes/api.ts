import express from "express";
import { storage } from "../storage/index.js";
import { v4 as uuidv4 } from "uuid";
import type { RequestHandler } from "express";

interface Server {
  id: string;
  name: string;
  url: string;
  isDefault: boolean;
}

interface ServerRequestBody {
  name: string;
  url: string;
}

const router = express.Router();

router.get("/history", async (req, res) => {
  try {
    const history = await storage.getRoutes();
    res.json(Object.values(history));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.put("/events/:requestId", async (req, res) => {
  try {
    const route = {
      ...(await storage.findRoute(req.params.requestId)),
      isLocked: req.body.isLocked,
    };
    const data = await storage.saveRoute(route);
    res.json({
      data,
      success: true,
      message: `Request ${req.params.requestId} ${
        route.isLocked ? "locked" : "unlocked"
      }`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to lock request" });
  }
});

router.post<{ requestId: string; responseId: string }>(
  "/events/:requestId/:responseId",
  async (req, res) => {
    try {
      const response = await storage.toggleResponseLock(
        req.params.requestId,
        req.params.responseId
      );
      res.json({
        data: response,
        success: true,
        message: `Response ${req.params.responseId} locked for request ${req.params.requestId}`,
      });
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to set locked response" });
      return;
    }
  }
);

router.post("/events/:requestId/:responseId/body", async (req, res) => {
  try {
    const route = await storage.getRoute(req.params.requestId);
    if (!route) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    const response = route.responses.find(
      (r) => r.responseId === req.params.responseId
    );
    if (!response) {
      res.status(404).json({ error: "Response not found" });
      return;
    }
    response.lockedBody = req.body;
    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ error: "Failed to save response" });
  }
});

router.get("/settings/servers", async (req, res) => {
  try {
    const servers = (await storage.getServers()) || [];
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

router.post<Record<string, never>, Record<string, never>, ServerRequestBody>(
  "/settings/servers",
  (async (req, res) => {
    try {
      const { name, url } = req.body;

      if (!name || !url) {
        return res.status(400).json({ error: "Name and URL are required" });
      }

      const servers = (await storage.getServers()) || [];
      const isDefault = servers.length === 0;

      const newServer: Server = {
        id: uuidv4(),
        name,
        url,
        isDefault,
      };

      await storage.addServer(newServer);
      res.json(newServer);
    } catch (error) {
      res.status(500).json({ error: "Failed to add server" });
    }
  }) as RequestHandler
);

router.post("/settings/servers/:id/default", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.setDefaultServer(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to set default server" });
  }
});

router.delete("/settings/servers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteServer(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete server" });
  }
});

router.put<{ id: string }, Record<string, never>, ServerRequestBody>(
  "/settings/servers/:id",
  (async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url } = req.body;
      if (!name || !url) {
        return res.status(400).json({ error: "Name and URL are required" });
      }

      await storage.updateServer(id, { name, url });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update server" });
    }
  }) as RequestHandler
);

router.delete("/history", async (req, res) => {
  await storage.clearEvents();
  res.json({ success: true });
});

export default router;
