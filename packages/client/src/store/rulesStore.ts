import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Rule, ForwardingRule } from "../types/proxy";

interface RulesState {
  rules: Rule[];
  isLoading: boolean;
  error: string | null;
  fetchRules: () => Promise<void>;
  addRule: (rule: Omit<Rule, "id">) => Promise<Rule>;
  updateRule: (rule: Rule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  reorderRules: (orderedIds: string[]) => Promise<void>;
  toggleRuleActive: (id: string) => Promise<string | undefined>;
  resetToDefaults: () => Promise<void>;
  isRuleComplete: (rule: Rule) => boolean;
}

// Define the default rules that are initially added when no rules exist
const createDefaultRules = (): Rule[] => {
  const catchAllRule: ForwardingRule = {
    id: uuidv4(),
    name: "Forward All Requests",
    type: "forwarding",
    method: "*",
    pathPattern: "/*",
    targetUrl: "", // This is intentionally left empty to trigger the incomplete rule flow
    isActive: false,
    isTerminating: true,
    order: 0,
    description:
      "Forward all requests to a specific server. Configure the target URL to enable this rule.",
  };

  const domainRule: ForwardingRule = {
    id: uuidv4(),
    name: "Domain-Specific Redirect",
    type: "forwarding",
    method: "GET",
    pathPattern: "(.+)/*",
    targetUrl: "",
    isActive: false,
    isTerminating: true,
    order: 1,
    description:
      "Redirect requests to the same domain. For example: example.com/* → https://example.com/$1",
  };

  return [catchAllRule, domainRule];
};

export const useRulesStore = create<RulesState>()(
  persist(
    (set, get) => ({
      rules: [],
      isLoading: false,
      error: null,

      fetchRules: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/rules");
          if (!response.ok) {
            throw new Error("Failed to fetch rules");
          }
          const data = await response.json();

          // If no rules exist, create the default ones
          if (data.length === 0) {
            const defaultRules = createDefaultRules();
            set({ rules: defaultRules, isLoading: false });

            // Save the default rules to the server
            for (const rule of defaultRules) {
              try {
                await fetch("/api/rules", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(rule),
                });
              } catch (error) {
                console.error("Failed to save default rule:", error);
              }
            }
          } else {
            set({ rules: data, isLoading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch rules",
            isLoading: false,
          });
        }
      },

      addRule: async (rule) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/rules", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(rule),
          });

          if (!response.ok) {
            throw new Error("Failed to add rule");
          }

          const newRule = await response.json();
          set((state) => ({
            rules: [...state.rules, newRule],
            isLoading: false,
          }));

          return newRule;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add rule",
            isLoading: false,
          });
          throw error;
        }
      },

      updateRule: async (rule) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/rules/${rule.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(rule),
          });

          if (!response.ok) {
            throw new Error("Failed to update rule");
          }

          set((state) => ({
            rules: state.rules.map((r) => (r.id === rule.id ? rule : r)),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update rule",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteRule: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/rules/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete rule");
          }

          set((state) => ({
            rules: state.rules.filter((rule) => rule.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete rule",
            isLoading: false,
          });
          throw error;
        }
      },

      reorderRules: async (orderedIds) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/rules/reorder", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderedIds }),
          });

          if (!response.ok) {
            throw new Error("Failed to reorder rules");
          }

          const { rules } = get();
          const reorderedRules = orderedIds
            .map((id) => rules.find((rule) => rule.id === id))
            .filter(Boolean) as Rule[];

          set({
            rules: reorderedRules,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to reorder rules",
            isLoading: false,
          });
          throw error;
        }
      },

      toggleRuleActive: async (id) => {
        const { rules, isRuleComplete } = get();
        const rule = rules.find((r) => r.id === id);

        if (!rule) {
          set({ error: `Rule with id ${id} not found` });
          return;
        }

        // Check if the rule is complete before activating it
        if (!rule.isActive && !isRuleComplete(rule)) {
          // Return the rule ID to indicate it's incomplete and needs editing
          return id;
        }

        const updatedRule = { ...rule, isActive: !rule.isActive };
        await get().updateRule(updatedRule);

        // Return undefined to indicate successful activation
        return undefined;
      },

      // Check if a rule has all required fields filled
      isRuleComplete: (rule) => {
        if (rule.type === "forwarding") {
          const forwardingRule = rule as ForwardingRule;
          return !!forwardingRule.targetUrl;
        }

        // Domain rules and static response rules are always considered complete
        return true;
      },

      // Reset to default rules
      resetToDefaults: async () => {
        set({ isLoading: true, error: null });

        try {
          // Delete all existing rules
          const { rules } = get();
          for (const rule of rules) {
            await fetch(`/api/rules/${rule.id}`, {
              method: "DELETE",
            });
          }

          // Create default rules
          const defaultRules = createDefaultRules();
          for (const rule of defaultRules) {
            await fetch("/api/rules", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(rule),
            });
          }

          set({ rules: defaultRules, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to reset rules",
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "rules-storage", // Name for the localStorage key
      partialize: (state) => ({ rules: state.rules }), // Only persist the rules array
    }
  )
);

export default useRulesStore;
