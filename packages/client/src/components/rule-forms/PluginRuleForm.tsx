import React from "react";
import { PluginRuleFormData } from "./types";
import { JwtPlugin } from "../plugins/JwtPlugin";
import type { JwtPluginConfig } from "@/types/proxy";

interface PluginRuleFormProps {
  formData: PluginRuleFormData;
  onChange: (data: Partial<PluginRuleFormData>) => void;
  errors: Record<string, string>;
  jwtConfig?: JwtPluginConfig;
  onJwtConfigChange?: (config: JwtPluginConfig) => void;
}

export const PluginRuleForm: React.FC<PluginRuleFormProps> = ({
  formData,
  onChange,
  errors,
  jwtConfig,
  onJwtConfigChange,
}) => {
  const renderPluginConfiguration = () => {
    switch (formData.pluginType) {
      case "jwt":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Response Template
              </label>
              <textarea
                value={formData.responseTemplate || ""}
                onChange={(e) => onChange({ responseTemplate: e.target.value })}
                className="w-full px-3 py-2 h-32 bg-gray-800 text-white rounded border border-gray-700 font-mono"
                placeholder="Use ${jwt} to insert the generated JWT"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: If using JSON response format, this template is ignored.
              </p>
            </div>

            {jwtConfig && onJwtConfigChange && (
              <div>
                <JwtPlugin config={jwtConfig} onChange={onJwtConfigChange} />
                {errors.secret && (
                  <p className="text-red-500 text-xs mt-1">{errors.secret}</p>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-gray-800 border border-gray-600 rounded p-3">
            <p className="text-gray-400 text-sm">
              Plugin type "{formData.pluginType}" is not yet supported.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white border-b border-gray-700 pb-2">
        Plugin Configuration
      </h3>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Plugin Type</label>
        <select
          value={formData.pluginType || "jwt"}
          onChange={(e) => onChange({ pluginType: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
        >
          <option value="jwt">JWT Generation</option>
          {/* Future plugin types can be added here */}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Response Status
        </label>
        <input
          type="number"
          value={formData.responseStatus || 200}
          onChange={(e) => onChange({ responseStatus: Number(e.target.value) })}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
        />
      </div>

      {renderPluginConfiguration()}

      <div className="bg-purple-900/20 border border-purple-700 rounded p-3">
        <h4 className="text-purple-300 font-medium mb-2">Plugin Behavior</h4>
        <ul className="text-xs text-purple-200 space-y-1">
          <li>• Plugins generate dynamic responses based on configuration</li>
          <li>• JWT plugin creates signed tokens with configurable claims</li>
          <li>• Response templates allow embedding generated content</li>
          <li>• Status codes and headers can be customized</li>
          <li>• Plugins are typically terminating rules</li>
        </ul>
      </div>
    </div>
  );
};
