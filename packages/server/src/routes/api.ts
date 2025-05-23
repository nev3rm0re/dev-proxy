import express from "express";
import { storage } from "../storage/index.js";
import { v4 as uuidv4 } from "uuid";
import type { RequestHandler } from "express";
import type { Rule } from "../storage/index.js";

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

router.delete("/history", async (req, res) => {
  await storage.clearEvents();
  res.json({ success: true });
});

router.get("/rules", async (req, res) => {
  try {
    const rules = await storage.getRules();
    res.json(rules);
  } catch (err) {
    console.error("Failed to fetch rules:", err);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});

// Add the missing POST endpoint for creating rules
router.post("/rules", async (req, res) => {
  try {
    const ruleData = req.body as Omit<Rule, "id">;

    // Generate an ID if not provided
    const rule: Rule = {
      ...ruleData,
      id: uuidv4(),
    };

    // Add rule to storage
    const savedRule = await storage.addRule(rule);

    // Return the created rule
    res.status(201).json(savedRule);
  } catch (err) {
    console.error("Failed to create rule:", err);
    res.status(500).json({ error: "Failed to create rule" });
  }
});

// Add a PUT endpoint to update rules
router.put<{ id: string }, unknown, Rule>("/rules/:id", (async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update the rule
    const updatedRule = await storage.updateRule(id, updates);

    if (!updatedRule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    res.json(updatedRule);
  } catch (err) {
    console.error("Failed to update rule:", err);
    res.status(500).json({ error: "Failed to update rule" });
  }
}) as RequestHandler);

// Update the delete endpoint to use the storage method
router.delete<{ id: string }>("/rules/:id", (async (req, res) => {
  try {
    const { id } = req.params;

    // Remove the rule from storage
    const success = await storage.deleteRule(id);

    if (!success) {
      return res.status(404).json({ error: "Rule not found" });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to delete rule:", err);
    res.status(500).json({ error: "Failed to delete rule" });
  }
}) as RequestHandler);

// Update the reorder endpoint to use the storage method
router.patch<
  Record<string, never>,
  Record<string, unknown>,
  { orderedIds: string[] }
>("/rules/reorder", (async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Reorder the rules using the storage method
    const reorderedRules = await storage.reorderRules(orderedIds);

    res.status(200).json({ success: true, rules: reorderedRules });
  } catch (err) {
    console.error("Failed to reorder rules:", err);
    res.status(500).json({ error: "Failed to reorder rules" });
  }
}) as RequestHandler);

export default router;
