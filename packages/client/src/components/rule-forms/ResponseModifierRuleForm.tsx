import React from "react";
import { ResponseModifierRuleFormData } from "./types";
import { Plus, Trash2 } from "lucide-react";

interface ResponseModifierRuleFormProps {
  formData: ResponseModifierRuleFormData;
  onChange: (data: Partial<ResponseModifierRuleFormData>) => void;
  errors: Record<string, string>;
}

export const ResponseModifierRuleForm: React.FC<
  ResponseModifierRuleFormProps
> = ({
  formData,
  onChange,
  // errors, // Not used in this component yet
}) => {
  const addConditionalRule = () => {
    const newRules = [
      ...(formData.conditionalRules || []),
      { condition: "", modifications: {} },
    ];
    onChange({ conditionalRules: newRules });
  };

  const removeConditionalRule = (index: number) => {
    const newRules =
      formData.conditionalRules?.filter((_, i) => i !== index) || [];
    onChange({ conditionalRules: newRules });
  };

  const updateConditionalRule = (
    index: number,
    field: "condition" | "modifications",
    value: string | Record<string, unknown>
  ) => {
    const newRules = [...(formData.conditionalRules || [])];
    if (newRules[index]) {
      newRules[index] = { ...newRules[index], [field]: value };
      onChange({ conditionalRules: newRules });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white border-b border-gray-700 pb-2">
        Response Modification
      </h3>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Base Response Modifications (JSON)
        </label>
        <textarea
          value={JSON.stringify(formData.responseModifications || {}, null, 2)}
          onChange={(e) => {
            try {
              const modifications = JSON.parse(e.target.value);
              onChange({ responseModifications: modifications });
            } catch {
              // Invalid JSON, keep current value
            }
          }}
          className="w-full px-3 py-2 h-32 bg-gray-800 text-white rounded border border-gray-700 font-mono"
          placeholder={JSON.stringify(
            {
              "headers.X-Proxy-Modified": "true",
              "headers.X-Timestamp": "{{timestamp}}",
              "body.metadata.processedBy": "dev-proxy",
              "body.metadata.version": "1.0",
              status: 200,
            },
            null,
            2
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Base modifications applied to all responses matching this rule.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm text-gray-400">
            Conditional Rules
          </label>
          <button
            type="button"
            onClick={addConditionalRule}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors text-xs"
          >
            <Plus size={14} />
            Add Condition
          </button>
        </div>

        {formData.conditionalRules?.map((rule, index) => (
          <div
            key={index}
            className="bg-gray-800 border border-gray-600 rounded p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm text-gray-300">
                Conditional Rule {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeConditionalRule(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Condition (JavaScript expression)
              </label>
              <input
                type="text"
                value={rule.condition}
                onChange={(e) =>
                  updateConditionalRule(index, "condition", e.target.value)
                }
                className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 text-sm font-mono"
                placeholder="response.status === 404 || response.body.error"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Modifications (JSON)
              </label>
              <textarea
                value={JSON.stringify(rule.modifications, null, 2)}
                onChange={(e) => {
                  try {
                    const modifications = JSON.parse(e.target.value);
                    updateConditionalRule(
                      index,
                      "modifications",
                      modifications
                    );
                  } catch {
                    // Invalid JSON, keep current value
                  }
                }}
                className="w-full px-2 py-1 h-20 bg-gray-700 text-white rounded border border-gray-600 text-sm font-mono"
                placeholder='{"status": 200, "body.error": null}'
              />
            </div>
          </div>
        ))}

        {(!formData.conditionalRules ||
          formData.conditionalRules.length === 0) && (
          <p className="text-xs text-gray-500 italic">
            No conditional rules defined. Add conditions to modify responses
            based on specific criteria.
          </p>
        )}
      </div>

      <div className="bg-green-900/20 border border-green-700 rounded p-3">
        <h4 className="text-green-300 font-medium mb-2">
          Response Modifier Behavior
        </h4>
        <ul className="text-xs text-green-200 space-y-1">
          <li>
            • Modifies responses from cached rules, upstream servers, or static
            responses
          </li>
          <li>• Can augment response data with additional fields or headers</li>
          <li>
            • Conditional rules allow different modifications based on response
            content
          </li>
          <li>• Use template variables for dynamic values</li>
          <li>
            • Can transform error responses into success responses or vice versa
          </li>
        </ul>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded p-3">
        <h4 className="text-gray-300 font-medium mb-2">Available Variables</h4>
        <p className="text-xs text-gray-400 mb-2">
          Variables available in conditions and modifications:
        </p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>
            • <code className="bg-gray-700 px-1 rounded">response.status</code>{" "}
            - Original response status
          </li>
          <li>
            • <code className="bg-gray-700 px-1 rounded">response.headers</code>{" "}
            - Original response headers
          </li>
          <li>
            • <code className="bg-gray-700 px-1 rounded">response.body</code> -
            Original response body
          </li>
          <li>
            • <code className="bg-gray-700 px-1 rounded">request.method</code> -
            Original request method
          </li>
          <li>
            • <code className="bg-gray-700 px-1 rounded">request.path</code> -
            Original request path
          </li>
          <li>
            •{" "}
            <code className="bg-gray-700 px-1 rounded">{"{{timestamp}}"}</code>{" "}
            - Current timestamp
          </li>
        </ul>
      </div>
    </div>
  );
};
