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
    <div className="space-y-2">
      <h3 className="text-lg text-white border-b border-gray-700 pb-1">
        Static Response Configuration
      </h3>

      {/* Response Status - Inline */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-400 w-24 flex-shrink-0">
          Status
        </label>
        <div className="w-24">
          <input
            type="number"
            value={formData.responseStatus || 200}
            onChange={(e) =>
              onChange({
                responseStatus: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 h-9"
          />
        </div>
      </div>

      {/* Response Body - Inline */}
      <div className="flex items-start gap-3">
        <label className="text-sm text-gray-400 w-24 flex-shrink-0 pt-2">
          Response Body
        </label>
        <div className="flex-1">
          <textarea
            value={formData.responseBody || ""}
            onChange={(e) => onChange({ responseBody: e.target.value })}
            className="w-full px-3 py-2 h-24 bg-gray-800 text-white rounded border border-gray-700 font-mono text-sm"
            placeholder="Response content..."
          />
        </div>
      </div>

      {/* Response Headers - Inline */}
      <div className="flex items-start gap-3">
        <label className="text-sm text-gray-400 w-24 flex-shrink-0 pt-2">
          Headers (JSON)
        </label>
        <div className="flex-1">
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
            className="w-full px-3 py-2 h-20 bg-gray-800 text-white rounded border border-gray-700 font-mono text-sm"
            placeholder='{"Content-Type": "application/json"}'
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Specify response headers as JSON object
          </p>
        </div>
      </div>
    </div>
  );
};
