import React from "react";
import { StaticRuleFormData } from "./types";

interface StaticRuleFormProps {
  formData: StaticRuleFormData;
  onChange: (data: Partial<StaticRuleFormData>) => void;
  errors: Record<string, string>;
}

export const StaticRuleForm: React.FC<StaticRuleFormProps> = ({
  formData,
  onChange,
  // errors, // Not used in this component yet
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white border-b border-gray-700 pb-2">
        Static Response Configuration
      </h3>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Response Status
        </label>
        <input
          type="number"
          value={formData.responseStatus || 200}
          onChange={(e) =>
            onChange({
              responseStatus: Number(e.target.value),
            })
          }
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Response Body
        </label>
        <textarea
          value={formData.responseBody || ""}
          onChange={(e) => onChange({ responseBody: e.target.value })}
          className="w-full px-3 py-2 h-32 bg-gray-800 text-white rounded border border-gray-700 font-mono"
          placeholder="Response content..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Response Headers (JSON)
        </label>
        <textarea
          value={JSON.stringify(formData.responseHeaders || {}, null, 2)}
          onChange={(e) => {
            try {
              const headers = JSON.parse(e.target.value);
              onChange({ responseHeaders: headers });
            } catch {
              // Invalid JSON, keep current value
            }
          }}
          className="w-full px-3 py-2 h-24 bg-gray-800 text-white rounded border border-gray-700 font-mono"
          placeholder='{"Content-Type": "application/json"}'
        />
        <p className="text-xs text-gray-500 mt-1">
          Specify response headers as JSON object
        </p>
      </div>
    </div>
  );
};
