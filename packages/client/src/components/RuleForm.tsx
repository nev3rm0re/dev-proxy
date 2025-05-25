import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  StaticRuleForm,
  ForwardingRuleForm,
  RequestModifierRuleForm,
  ResponseModifierRuleForm,
  PluginRuleForm,
} from "./rule-forms";
import type { JwtPluginConfig } from "@/types/proxy";

export type RuleType =
  | "static"
  | "plugin"
  | "forwarding"
  | "request-modifier"
  | "response-modifier";

export interface RuleFormData {
  name: string;
  type: RuleType;
  method: string | string[];
  pathPattern: string;
  responseStatus?: number;
  responseBody?: string;
  responseTemplate?: string;
  pluginType?: string;
  targetUrl?: string;
  responseHeaders?: Record<string, string>;
  requestModifications?: Record<string, unknown>; // For request modifier rules
  responseModifications?: Record<string, unknown>; // For response modifier rules
  conditionalRules?: Array<{
    condition: string;
    modifications: Record<string, unknown>;
  }>;
  pluginConfig?: Record<string, unknown>;
  isActive: boolean;
  isTerminating: boolean;
  order: number;
  description?: string;
}

export interface RuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: RuleFormData,
    jwtConfig?: JwtPluginConfig
  ) => Promise<void>;
  initialData?: Partial<RuleFormData>;
  editMode?: boolean;
  title?: string;
}

export const RuleForm: React.FC<RuleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  editMode = false,
  title,
}) => {
  const [formData, setFormData] = useState<RuleFormData>({
    name: "New Rule",
    type: "static",
    method: "GET",
    pathPattern: "/*",
    responseStatus: 200,
    responseBody: "",
    isActive: true,
    isTerminating: true,
    order: 0,
    description: "",
    ...initialData,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [jwtConfig, setJwtConfig] = useState<JwtPluginConfig>({
    secret: "",
    kid: "",
    exp: 3600,
    additionalClaims: {},
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.pathPattern?.trim()) {
      errors.pathPattern = "Path pattern is required";
    }

    // Validate based on rule type
    if (formData.type === "forwarding") {
      if (!formData.targetUrl?.trim()) {
        errors.targetUrl = "Target URL is required";
      }
    } else if (formData.type === "plugin" && formData.pluginType === "jwt") {
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
      await onSubmit(
        formData,
        formData.type === "plugin" ? jwtConfig : undefined
      );
      onClose();
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "New Rule",
      type: "static",
      method: "GET",
      pathPattern: "/*",
      responseStatus: 200,
      responseBody: "",
      isActive: true,
      isTerminating: true,
      order: 0,
      description: "",
    });
    setJwtConfig({
      secret: "",
      kid: "",
      exp: 3600,
      additionalClaims: {},
    });
    setFormErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFormDataChange = (updates: Partial<RuleFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const renderRuleTypeSpecificFields = () => {
    switch (formData.type) {
      case "static":
        return (
          <StaticRuleForm
            // @ts-expect-error - Type compatibility issue with union types
            formData={formData}
            onChange={handleFormDataChange}
            errors={formErrors}
          />
        );

      case "forwarding":
        return (
          <ForwardingRuleForm
            // @ts-expect-error - Type compatibility issue with union types
            formData={formData}
            onChange={handleFormDataChange}
            errors={formErrors}
          />
        );

      case "request-modifier":
        return (
          <RequestModifierRuleForm
            // @ts-expect-error - Type compatibility issue with union types
            formData={formData}
            onChange={handleFormDataChange}
            errors={formErrors}
          />
        );

      case "response-modifier":
        return (
          <ResponseModifierRuleForm
            // @ts-expect-error - Type compatibility issue with union types
            formData={formData}
            onChange={handleFormDataChange}
            errors={formErrors}
          />
        );

      case "plugin":
        return (
          <PluginRuleForm
            // @ts-expect-error - Type compatibility issue with union types
            formData={formData}
            onChange={handleFormDataChange}
            errors={formErrors}
            jwtConfig={jwtConfig}
            onJwtConfigChange={setJwtConfig}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl text-white">
            {title || (editMode ? "Edit Rule" : "Create New Rule")}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Rule Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-3 py-2 bg-gray-800 text-white rounded border ${
                  formErrors.name ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="My Rule"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>
          </div>
          {/* Common Fields - Method and Path */}
          <div className="space-y-4">
            <h3 className="text-lg text-white border-b border-gray-700 pb-2">
              Request Matching
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  HTTP Method
                </label>
                <select
                  value={
                    typeof formData.method === "string"
                      ? formData.method
                      : formData.method[0] || "GET"
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
                  <option value="OPTIONS">OPTIONS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Path Pattern
                </label>
                <input
                  type="text"
                  value={formData.pathPattern}
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
          </div>

          {/* Rule Type */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Rule Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as RuleType;
                  setFormData({
                    ...formData,
                    type: newType,
                    // Reset type-specific fields and set appropriate defaults
                    ...(newType === "plugin" ? { pluginType: "jwt" } : {}),
                    ...(newType === "request-modifier"
                      ? { isTerminating: false }
                      : {}), // Request modifiers are typically non-terminating
                    ...(newType === "response-modifier"
                      ? { responseModifications: {}, conditionalRules: [] }
                      : {}),
                  });
                }}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
              >
                <option value="static">Static Response</option>
                <option value="forwarding">Forward Requests</option>
                <option value="plugin">Plugin (Generated Response)</option>
                <option value="request-modifier">Request Modifier</option>
                <option value="response-modifier">Response Modifier</option>
              </select>
            </div>
            {renderRuleTypeSpecificFields()}

            {formData.type === "plugin" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
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
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-lg text-white border-b border-gray-700 pb-2">
              Advanced Options
            </h3>

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

            {formData.type === "request-modifier" && formData.isTerminating && (
              <div className="bg-amber-900/20 border border-amber-700 rounded p-3">
                <p className="text-amber-200 text-xs">
                  ⚠️ Request modifier rules are typically non-terminating to
                  allow the modified request to be processed by subsequent
                  rules.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 h-20 bg-gray-800 text-white rounded border border-gray-700"
                placeholder="Brief description of what this rule does..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            >
              {editMode ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
