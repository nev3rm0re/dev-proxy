import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRulesStore } from "@/store/rulesStore";
import { JwtPlugin } from "./plugins/JwtPlugin";
import {
  PlusCircle,
  Trash2,
  Play,
  Square,
  X,
  KeyRound,
  Edit,
  RefreshCw,
} from "lucide-react";
import type {
  PluginRule,
  JwtPluginConfig,
  StaticResponseRule,
  Rule,
  ForwardingRule,
  DomainRule,
} from "@/types/proxy";

// This type helps us manage the form data for different rule types
type RuleFormData = {
  name: string;
  type: "static" | "plugin" | "forwarding" | "domain";
  method?: string | string[];
  pathPattern?: string;
  pattern?: string;
  responseStatus?: number;
  responseBody?: string;
  responseTemplate?: string;
  pluginType?: string;
  targetUrl?: string;
  isActive: boolean;
  isTerminating: boolean;
  order: number;
  description?: string;
};

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
  } = useRulesStore();

  const [formData, setFormData] = useState<RuleFormData>(() => {
    // Get initial data from location state if available
    const state = location.state;
    if (state) {
      return {
        name: `Rule for ${state.method} ${state.url || state.path}`,
        type: "static",
        method: state.method || "GET",
        pathPattern: state.url || state.path || "",
        responseStatus: state.responseStatus || 200,
        responseBody: state.responseBody
          ? typeof state.responseBody === "string"
            ? state.responseBody
            : JSON.stringify(state.responseBody, null, 2)
          : "",
        isActive: true,
        isTerminating: true,
        order: rules.length,
      };
    }

    return {
      name: "New Rule",
      type: "static",
      method: "GET",
      pathPattern: "",
      responseStatus: 200,
      responseBody: "",
      isActive: true,
      isTerminating: true,
      order: rules.length,
    };
  });

  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [jwtConfig, setJwtConfig] = useState<JwtPluginConfig>({
    secret: "",
    kid: "",
    exp: 3600,
    additionalClaims: {},
  });
  const [editMode, setEditMode] = useState(false);
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(
    null
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
      responseBody?: any;
    };
    if (state && (state.method || state.path || state.responseBody)) {
      setShowForm(true);
    }
  }, [location.state]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }

    // Validate based on rule type
    if (formData.type === "forwarding") {
      if (!formData.targetUrl?.trim()) {
        errors.targetUrl = "Target URL is required";
      }
      if (!formData.pathPattern?.trim()) {
        errors.pathPattern = "Path pattern is required";
      }
    } else if (formData.type === "domain") {
      if (!formData.pattern?.trim()) {
        errors.pattern = "Domain pattern is required";
      }
    } else if (formData.type === "static") {
      if (!formData.pathPattern?.trim()) {
        errors.pathPattern = "Path pattern is required";
      }
    } else if (formData.type === "plugin" && formData.pluginType === "jwt") {
      if (!formData.pathPattern?.trim()) {
        errors.pathPattern = "Path pattern is required";
      }
      if (!jwtConfig.secret) {
        errors.secret = "Secret key is required for JWT generation";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
      } else if (formData.type === "domain") {
        const domainRule: Omit<DomainRule, "id"> = {
          name: formData.name,
          type: "domain",
          pattern: formData.pattern || "(.+)/*",
          isActive: formData.isActive,
          isTerminating: formData.isTerminating,
          order: formData.order,
          description: formData.description,
        };

        if (editMode && editRuleId) {
          await updateRule({ ...domainRule, id: editRuleId });
        } else {
          await addRule(domainRule);
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

      resetForm();
      setShowForm(false);
      setEditMode(false);
      setEditRuleId(null);
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "New Rule",
      type: "static",
      method: "GET",
      pathPattern: "",
      responseStatus: 200,
      responseBody: "",
      isActive: true,
      isTerminating: true,
      order: rules.length,
    });
    setJwtConfig({
      secret: "",
      kid: "",
      exp: 3600,
      additionalClaims: {},
    });
    setFormErrors({});
  };

  const handleEditRule = (rule: Rule) => {
    // Set form to edit mode
    setEditMode(true);
    setEditRuleId(rule.id);

    // Convert rule to formData format
    if (rule.type === "plugin" && (rule as PluginRule).pluginType === "jwt") {
      const pluginRule = rule as PluginRule;
      setFormData({
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

      // Set JWT config
      setJwtConfig(pluginRule.pluginConfig as unknown as JwtPluginConfig);
    } else if (rule.type === "forwarding") {
      const forwardingRule = rule as ForwardingRule;
      setFormData({
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
    } else if (rule.type === "domain") {
      const domainRule = rule as DomainRule;
      setFormData({
        name: rule.name,
        type: "domain",
        pattern: domainRule.pattern,
        isActive: rule.isActive,
        isTerminating: rule.isTerminating,
        order: rule.order,
        description: rule.description,
      });
    } else {
      const staticRule = rule as StaticResponseRule;
      setFormData({
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
    // Configure the form for a Zendesk token rule
    setFormData({
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

    // Configure the JWT specific settings
    setJwtConfig({
      secret: "",
      kid: "",
      exp: 3600, // 1 hour
      additionalClaims: {
        scope: "user",
        external_id: "user_123", // Placeholder, can be changed by user
      },
      responseFormat: "json",
      jsonProperty: "jwt",
    });

    // Show the form with pre-populated values
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

  const renderRuleTypeForm = () => {
    switch (formData.type) {
      case "forwarding":
        return (
          <div className="mt-4">
            <div>
              <label className="block text-sm text-gray-400">Target URL</label>
              <input
                type="text"
                value={formData.targetUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, targetUrl: e.target.value })
                }
                className={`w-full px-3 py-2 bg-gray-800 text-white rounded border ${
                  formErrors.targetUrl ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="https://example.com"
              />
              {formErrors.targetUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.targetUrl}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                The URL where requests will be forwarded to. You can use $1, $2,
                etc. to reference capture groups from the path pattern.
              </p>
            </div>
          </div>
        );

      case "domain":
        return (
          <div className="mt-4">
            <div>
              <label className="block text-sm text-gray-400">
                Domain Pattern
              </label>
              <input
                type="text"
                value={formData.pattern || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pattern: e.target.value })
                }
                className={`w-full px-3 py-2 bg-gray-800 text-white rounded border ${
                  formErrors.pattern ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="(.+)/*"
              />
              {formErrors.pattern && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.pattern}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Regular expression pattern for the domain. Use capture groups
                like (.+) to match and extract parts of the domain.
              </p>
            </div>
          </div>
        );

      case "plugin":
        if (formData.pluginType === "jwt") {
          return (
            <div className="mt-4">
              <div>
                <label className="block text-sm text-gray-400">
                  Response Template
                </label>
                <textarea
                  value={formData.responseTemplate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responseTemplate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 h-32 bg-gray-800 text-white rounded border border-gray-700 font-mono"
                  placeholder="Use ${jwt} to insert the generated JWT"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: If using JSON response format, this template is ignored.
                </p>
              </div>
              <div className="mt-4">
                <JwtPlugin config={jwtConfig} onChange={setJwtConfig} />
              </div>
            </div>
          );
        }
        return null;

      case "static":
      default:
        return (
          <div className="mt-4">
            <div>
              <label className="block text-sm text-gray-400">
                Response Body
              </label>
              <textarea
                value={formData.responseBody || ""}
                onChange={(e) =>
                  setFormData({ ...formData, responseBody: e.target.value })
                }
                className="w-full px-3 py-2 h-32 bg-gray-800 text-white rounded border border-gray-700 font-mono"
              />
            </div>
          </div>
        );
    }
  };

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
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
              setEditMode(false);
              setEditRuleId(null);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {showForm ? <X size={16} /> : <PlusCircle size={16} />}
            <span>{showForm ? "Cancel" : "Add Rule"}</span>
          </button>
        </div>
      </div>

      {/* Rule Creation/Edit Form */}
      {showForm && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h3 className="text-lg text-white mb-4">
            {editMode ? "Edit Rule" : "Create New Rule"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400">Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-3 py-2 bg-gray-800 text-white rounded border ${
                  formErrors.name ? "border-red-500" : "border-gray-700"
                }`}
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400">Rule Type</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as RuleFormData["type"];
                  setFormData({
                    ...formData,
                    type: newType,
                    // Reset type-specific fields
                    ...(newType === "plugin" ? { pluginType: "jwt" } : {}),
                  });
                }}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
              >
                <option value="forwarding">Forward Requests</option>
                <option value="domain">Domain Rule</option>
                <option value="static">Static Response</option>
                <option value="plugin">Plugin (Generated Response)</option>
              </select>
            </div>

            {formData.type === "plugin" && (
              <div>
                <label className="block text-sm text-gray-400">
                  Plugin Type
                </label>
                <select
                  value={formData.pluginType || "jwt"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pluginType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
                >
                  <option value="jwt">JWT Generation</option>
                </select>
              </div>
            )}

            {(formData.type === "forwarding" ||
              formData.type === "static" ||
              formData.type === "plugin") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400">Method</label>
                  <select
                    value={
                      typeof formData.method === "string"
                        ? formData.method
                        : formData.method?.[0] || "GET"
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, method: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
                  >
                    <option value="*">ANY (*)</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400">
                    Path Pattern
                  </label>
                  <input
                    type="text"
                    value={formData.pathPattern || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pathPattern: e.target.value })
                    }
                    className={`w-full px-3 py-2 bg-gray-800 text-white rounded border ${
                      formErrors.pathPattern
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                    placeholder="/api/*"
                  />
                  {formErrors.pathPattern && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.pathPattern}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(formData.type === "static" || formData.type === "plugin") && (
              <div>
                <label className="block text-sm text-gray-400">
                  Response Status
                </label>
                <input
                  type="number"
                  value={formData.responseStatus || 200}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responseStatus: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTerminating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isTerminating: e.target.checked,
                    })
                  }
                  className="form-checkbox h-4 w-4"
                />
                <span className="text-sm text-gray-400">
                  Terminating (stop processing rules after match)
                </span>
              </label>
            </div>

            {renderRuleTypeForm()}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setEditMode(false);
                  setEditRuleId(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                {editMode ? "Update Rule" : "Create Rule"}
              </button>
            </div>
          </form>
        </div>
      )}

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
                onClick={() => setShowForm(true)}
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
              className={`p-4 rounded transition-all duration-500 ${
                highlightedRuleId === rule.id
                  ? "bg-blue-800 border-2 border-blue-400"
                  : "bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRuleToggle(rule.id)}
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
                      {rule.isTerminating && (
                        <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">
                          Terminating
                        </span>
                      )}
                      {!isRuleComplete(rule) && (
                        <span className="text-xs bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded">
                          Incomplete
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-400 font-mono text-sm">
                        {rule.type === "forwarding" &&
                          (Array.isArray((rule as ForwardingRule).method)
                            ? (rule as ForwardingRule).method.join(", ")
                            : (rule as ForwardingRule).method)}
                        {rule.type === "static" &&
                          (Array.isArray((rule as StaticResponseRule).method)
                            ? (rule as StaticResponseRule).method.join(", ")
                            : (rule as StaticResponseRule).method)}
                        {rule.type === "plugin" &&
                          (Array.isArray((rule as PluginRule).method)
                            ? (rule as PluginRule).method.join(", ")
                            : (rule as PluginRule).method)}
                        {rule.type === "domain" && "DOMAIN"}
                      </span>
                      <span className="text-white font-mono text-sm">
                        {rule.type === "domain"
                          ? (rule as DomainRule).pattern
                          : rule.type === "forwarding"
                          ? (rule as ForwardingRule).pathPattern
                          : rule.type === "static"
                          ? (rule as StaticResponseRule).pathPattern
                          : (rule as PluginRule).pathPattern}
                      </span>
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
                    onClick={() => handleRuleDelete(rule.id)}
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
                      : rule.type === "domain"
                      ? "Domain Rule"
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
                              {(rule as PluginRule).pluginConfig
                                ?.jsonProperty || "jwt"}{" "}
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
                  ) : rule.type === "domain" ? (
                    <div>
                      <div className="mb-1">Domain Pattern:</div>
                      <pre className="whitespace-pre-wrap break-all">
                        {(rule as DomainRule).pattern}
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
