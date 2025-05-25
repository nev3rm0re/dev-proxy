import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRulesStore } from "@/store/rulesStore";
import { RuleForm, type RuleFormData } from "./RuleForm";
import {
  PlusCircle,
  Trash2,
  Play,
  Square,
  KeyRound,
  Edit,
  RefreshCw,
  GripVertical,
} from "lucide-react";
import type {
  PluginRule,
  JwtPluginConfig,
  StaticResponseRule,
  Rule,
  ForwardingRule,
} from "@/types/proxy";

export const Rules = () => {
  const location = useLocation();
  const {
    rules,
    isLoading,
    error,
    fetchRules,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleActive,
    resetToDefaults,
    isRuleComplete,
    reorderRules,
  } = useRulesStore();

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(
    null
  );
  const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null);
  const [dragOverRuleId, setDragOverRuleId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<RuleFormData>>(
    {}
  );

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Handle highlighting from navigation state
  useEffect(() => {
    const state = location.state as { highlightRule?: string };
    if (state?.highlightRule) {
      setHighlightedRuleId(state.highlightRule);
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedRuleId(null);
      }, 3000);
    }
  }, [location.state]);

  // Auto-open form if navigated from request list with data
  useEffect(() => {
    const state = location.state as {
      method?: string;
      path?: string;
      responseBody?: string | object;
      responseHeaders?: Record<string, string>;
      responseStatus?: number;
      ruleType?: string;
    };

    if (
      state &&
      (state.method || state.path || state.responseBody || state.ruleType)
    ) {
      if (state.ruleType === "wildcard") {
        // Creating rule from path click (wildcard)
        setInitialFormData({
          name: `Wildcard rule for ${state.path}`,
          type: "static",
          method: "*",
          pathPattern: state.path || "",
          responseStatus: 200,
          responseBody: "",
          isActive: true,
          isTerminating: true,
          order: rules.length,
          description: "Wildcard rule created from path",
        });
      } else if (state.ruleType === "specific") {
        // Creating rule from response click (specific)
        setInitialFormData({
          name: `${state.method} ${state.path}`,
          type: "static",
          method: state.method || "GET",
          pathPattern: state.path || "",
          responseStatus: state.responseStatus || 200,
          responseBody: state.responseBody
            ? typeof state.responseBody === "string"
              ? state.responseBody
              : JSON.stringify(state.responseBody, null, 2)
            : "",
          responseHeaders: state.responseHeaders || {},
          isActive: true,
          isTerminating: true,
          order: rules.length,
          description: "Rule created from specific response",
        });
      }
      setShowForm(true);
      setEditMode(false);
      setEditRuleId(null);
    }
  }, [location.state, rules.length]);

  // Handle drag and drop for reordering
  const handleDragStart = (e: React.DragEvent, ruleId: string) => {
    setDraggedRuleId(ruleId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, ruleId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverRuleId(ruleId);
  };

  const handleDragLeave = () => {
    setDragOverRuleId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetRuleId: string) => {
    e.preventDefault();
    setDragOverRuleId(null);

    if (!draggedRuleId || draggedRuleId === targetRuleId) {
      setDraggedRuleId(null);
      return;
    }

    // Reorder rules
    const draggedIndex = rules.findIndex((r) => r.id === draggedRuleId);
    const targetIndex = rules.findIndex((r) => r.id === targetRuleId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newRules = [...rules];
    const [draggedRule] = newRules.splice(draggedIndex, 1);
    newRules.splice(targetIndex, 0, draggedRule);

    // Update order numbers and send to server
    const orderedIds = newRules.map((rule) => rule.id!);

    try {
      await reorderRules(orderedIds);
    } catch (error) {
      console.error("Failed to reorder rules:", error);
    }

    setDraggedRuleId(null);
  };

  const handleDragEnd = () => {
    setDraggedRuleId(null);
    setDragOverRuleId(null);
  };

  const handleFormSubmit = async (
    formData: RuleFormData,
    jwtConfig?: JwtPluginConfig
  ) => {
    try {
      if (formData.type === "plugin" && formData.pluginType === "jwt") {
        const pluginRule: Omit<PluginRule, "id"> = {
          name: formData.name,
          type: "plugin",
          pluginType: "jwt",
          method: formData.method || "GET",
          pathPattern: formData.pathPattern || "/*",
          responseStatus: formData.responseStatus || 200,
          responseTemplate: formData.responseTemplate || "${jwt}",
          pluginConfig: {
            ...jwtConfig,
          } as unknown as Record<string, unknown>,
          isActive: formData.isActive,
          isTerminating: formData.isTerminating,
          order: formData.order,
          description: formData.description,
        };

        if (editMode && editRuleId) {
          await updateRule({ ...pluginRule, id: editRuleId });
        } else {
          await addRule(pluginRule);
        }
      } else if (formData.type === "forwarding") {
        const forwardingRule: Omit<ForwardingRule, "id"> = {
          name: formData.name,
          type: "forwarding",
          method: formData.method || "*",
          pathPattern: formData.pathPattern || "/*",
          targetUrl: formData.targetUrl || "",
          isActive: formData.isActive,
          isTerminating: formData.isTerminating,
          order: formData.order,
          description: formData.description,
        };

        if (editMode && editRuleId) {
          await updateRule({ ...forwardingRule, id: editRuleId });
        } else {
          await addRule(forwardingRule);
        }
      } else {
        const staticRule: Omit<StaticResponseRule, "id"> = {
          name: formData.name,
          type: "static",
          method: formData.method || "GET",
          pathPattern: formData.pathPattern || "/*",
          responseStatus: formData.responseStatus || 200,
          responseBody: formData.responseBody || "",
          isActive: formData.isActive,
          isTerminating: formData.isTerminating,
          order: formData.order,
          description: formData.description,
        };

        if (editMode && editRuleId) {
          await updateRule({ ...staticRule, id: editRuleId });
        } else {
          await addRule(staticRule);
        }
      }

      setShowForm(false);
      setEditMode(false);
      setEditRuleId(null);
      setInitialFormData({});
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  const handleEditRule = (rule: Rule) => {
    // Set form to edit mode
    setEditMode(true);
    setEditRuleId(rule.id || null);

    // Convert rule to formData format
    if (rule.type === "plugin" && (rule as PluginRule).pluginType === "jwt") {
      const pluginRule = rule as PluginRule;
      setInitialFormData({
        name: rule.name,
        type: "plugin",
        pluginType: "jwt",
        method: pluginRule.method,
        pathPattern: pluginRule.pathPattern,
        responseStatus: pluginRule.responseStatus,
        responseTemplate: pluginRule.responseTemplate,
        isActive: rule.isActive,
        isTerminating: rule.isTerminating,
        order: rule.order,
        description: rule.description,
      });
    } else if (rule.type === "forwarding") {
      const forwardingRule = rule as ForwardingRule;
      setInitialFormData({
        name: rule.name,
        type: "forwarding",
        method: forwardingRule.method,
        pathPattern: forwardingRule.pathPattern,
        targetUrl: forwardingRule.targetUrl,
        isActive: rule.isActive,
        isTerminating: rule.isTerminating,
        order: rule.order,
        description: rule.description,
      });
    } else {
      const staticRule = rule as StaticResponseRule;
      setInitialFormData({
        name: rule.name,
        type: "static",
        method: staticRule.method,
        pathPattern: staticRule.pathPattern,
        responseStatus: staticRule.responseStatus,
        responseBody: staticRule.responseBody,
        isActive: rule.isActive,
        isTerminating: rule.isTerminating,
        order: rule.order,
        description: rule.description,
      });
    }

    // Show the form
    setShowForm(true);
  };

  const createZendeskTokenRule = () => {
    setInitialFormData({
      name: "Zendesk Token Generator",
      type: "plugin",
      pluginType: "jwt",
      method: "GET",
      pathPattern: "/zendesk/token",
      responseStatus: 200,
      responseTemplate: "", // Will be handled by the JWT plugin in JSON mode
      isActive: true,
      isTerminating: true,
      order: rules.length,
      description: "Generates a JWT token for Zendesk authentication",
    });

    setShowForm(true);
    setEditMode(false);
    setEditRuleId(null);
  };

  const handleRuleToggle = async (id: string) => {
    try {
      // toggleRuleActive returns rule ID if the rule is incomplete
      const incompleteRuleId = await toggleRuleActive(id);

      // If an ID is returned, the rule is incomplete and needs editing
      if (incompleteRuleId) {
        const incompleteRule = rules.find((r) => r.id === incompleteRuleId);
        if (incompleteRule) {
          handleEditRule(incompleteRule);
        }
      }
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const handleRuleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      try {
        await deleteRule(id);
      } catch (error) {
        console.error("Error deleting rule:", error);
      }
    }
  };

  const handleResetToDefaults = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all rules to default? This action cannot be undone."
      )
    ) {
      try {
        setResetting(true);
        await resetToDefaults();
        setResetting(false);
      } catch (error) {
        console.error("Error resetting rules:", error);
        setResetting(false);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditRuleId(null);
    setInitialFormData({});
  };

  const handleNewRule = () => {
    setInitialFormData({
      name: "New Rule",
      type: "static",
      method: "GET",
      pathPattern: "/*",
      responseStatus: 200,
      responseBody: "",
      isActive: true,
      isTerminating: true,
      order: rules.length,
    });
    setShowForm(true);
    setEditMode(false);
    setEditRuleId(null);
  };

  // Helper function to format rule display
  const formatRuleDisplay = (rule: Rule) => {
    if (rule.type === "forwarding") {
      const forwardingRule = rule as ForwardingRule;
      const method = Array.isArray(forwardingRule.method)
        ? forwardingRule.method.join(", ")
        : forwardingRule.method;

      // Check if it's a domain-based pattern
      const isDomainPattern =
        forwardingRule.pathPattern.includes("([a-zA-Z0-9-]+") &&
        forwardingRule.pathPattern.includes("\\.[a-zA-Z0-9-]+");

      if (isDomainPattern && forwardingRule.targetUrl?.includes("$1")) {
        return {
          method,
          pattern: "<domain.name>/*",
          arrow: "→",
          target: forwardingRule.targetUrl
            .replace("$1", "domain.name")
            .replace("$2", "/*"),
        };
      }

      return {
        method,
        pattern: forwardingRule.pathPattern,
        arrow: "→",
        target: forwardingRule.targetUrl || "[Not configured]",
      };
    }

    if (rule.type === "static") {
      const staticRule = rule as StaticResponseRule;
      const method = Array.isArray(staticRule.method)
        ? staticRule.method.join(", ")
        : staticRule.method;

      return {
        method,
        pattern: staticRule.pathPattern,
        arrow: "→",
        target: `Static Response (${staticRule.responseStatus})`,
      };
    }

    if (rule.type === "plugin") {
      const pluginRule = rule as PluginRule;
      const method = Array.isArray(pluginRule.method)
        ? pluginRule.method.join(", ")
        : pluginRule.method;

      return {
        method,
        pattern: pluginRule.pathPattern,
        arrow: "→",
        target: `${pluginRule.pluginType?.toUpperCase()} Plugin`,
      };
    }

    return {
      method: "Unknown",
      pattern: "Unknown",
      arrow: "→",
      target: "Unknown",
    };
  };

  if (isLoading && rules.length === 0 && !resetting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading rules...</div>
      </div>
    );
  }

  if (error && rules.length === 0 && !resetting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Rules List */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-white">Rules</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
            title="Reset all rules to default"
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={createZendeskTokenRule}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-500"
            title="Create Zendesk Token Rule"
          >
            <KeyRound size={16} />
            <span>Zendesk Token</span>
          </button>
          <button
            onClick={handleNewRule}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            <PlusCircle size={16} />
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      {/* Rule Form Modal */}
      <RuleForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={initialFormData}
        editMode={editMode}
      />

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">No rules configured yet.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={createZendeskTokenRule}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 flex items-center gap-2"
              >
                <KeyRound size={16} />
                Create Zendesk Token Rule
              </button>
              <button
                onClick={handleNewRule}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Create Generic Rule
              </button>
            </div>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              draggable
              onDragStart={(e) => handleDragStart(e, rule.id!)}
              onDragOver={(e) => handleDragOver(e, rule.id!)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, rule.id!)}
              onDragEnd={handleDragEnd}
              className={`p-4 rounded transition-all duration-500 cursor-move ${
                highlightedRuleId === rule.id
                  ? "bg-blue-800 border-2 border-blue-400"
                  : dragOverRuleId === rule.id
                  ? "bg-gray-700 border-2 border-blue-300"
                  : "bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <GripVertical
                    size={16}
                    className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
                  />
                  <button
                    onClick={() => handleRuleToggle(rule.id!)}
                    className={`${
                      rule.isActive ? "text-green-500" : "text-gray-500"
                    }${
                      !isRuleComplete(rule) && !rule.isActive
                        ? " opacity-50"
                        : ""
                    }`}
                    title={
                      !isRuleComplete(rule) && !rule.isActive
                        ? "Incomplete rule - click to edit"
                        : rule.isActive
                        ? "Active"
                        : "Inactive"
                    }
                  >
                    {rule.isActive ? <Play size={16} /> : <Square size={16} />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {rule.name}
                      </span>
                      {!rule.isTerminating && (
                        <span className="text-xs bg-orange-900 text-orange-200 px-2 py-0.5 rounded">
                          Non-terminating
                        </span>
                      )}
                      {!isRuleComplete(rule) && (
                        <span className="text-xs bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded">
                          Incomplete
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const display = formatRuleDisplay(rule);
                        return (
                          <>
                            <span className="text-blue-400 font-mono text-sm">
                              {display.method}
                            </span>
                            <span className="text-white font-mono text-sm">
                              {display.pattern}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {display.arrow}
                            </span>
                            <span className="text-green-400 font-mono text-sm">
                              {display.target}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="text-blue-400 hover:text-blue-300"
                    title="Edit Rule"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleRuleDelete(rule.id!)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete Rule"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm text-gray-400 mb-1">
                  Rule Type:
                  <span className="ml-1 text-white">
                    {rule.type === "plugin"
                      ? `Plugin (${(rule as PluginRule).pluginType})`
                      : rule.type === "forwarding"
                      ? "Forward Requests"
                      : "Static Response"}
                  </span>
                </div>

                <div className="bg-gray-900 p-2 rounded text-gray-300 text-sm overflow-x-auto">
                  {rule.type === "plugin" ? (
                    <div>
                      <div className="mb-1">Response Template:</div>
                      <pre className="whitespace-pre-wrap break-all">
                        {(rule as PluginRule).responseTemplate}
                      </pre>
                      {(rule as PluginRule).pluginType === "jwt" && (
                        <div className="mt-2 text-xs border-t border-gray-700 pt-2">
                          <p>
                            JWT Claims:{" "}
                            {Object.keys(
                              (rule as PluginRule).pluginConfig
                                ?.additionalClaims || {}
                            ).join(", ")}
                          </p>
                          {(rule as PluginRule).pluginConfig?.responseFormat ===
                            "json" && (
                            <p>
                              Response: JSON with{" "}
                              {String(
                                (rule as PluginRule).pluginConfig
                                  ?.jsonProperty || "jwt"
                              )}{" "}
                              property
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : rule.type === "forwarding" ? (
                    <div>
                      <div className="mb-1">Target URL:</div>
                      <pre className="whitespace-pre-wrap break-all">
                        {(rule as ForwardingRule).targetUrl ||
                          "[Not configured]"}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-1">Response Body:</div>
                      <pre className="whitespace-pre-wrap break-all">
                        {rule.type === "static" &&
                        (rule as StaticResponseRule).responseBody &&
                        typeof (rule as StaticResponseRule).responseBody ===
                          "string"
                          ? (rule as StaticResponseRule).responseBody.length >
                            300
                            ? `${(
                                rule as StaticResponseRule
                              ).responseBody.substring(0, 300)}...`
                            : (rule as StaticResponseRule).responseBody
                          : JSON.stringify(
                              (rule as StaticResponseRule).responseBody || "",
                              null,
                              2
                            )}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
