import React from "react";
import { RequestModifierRuleFormData } from "./types";

interface RequestModifierRuleFormProps {
  formData: RequestModifierRuleFormData;
  onChange: (data: Partial<RequestModifierRuleFormData>) => void;
  errors: Record<string, string>;
}

export const RequestModifierRuleForm: React.FC<
  RequestModifierRuleFormProps
> = ({
  formData,
  onChange,
  // errors, // Not used in this component yet
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white border-b border-gray-700 pb-2">
        Request Modification
      </h3>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Request Modifications (JSON)
        </label>
        <textarea
          value={JSON.stringify(formData.requestModifications || {}, null, 2)}
          onChange={(e) => {
            try {
              const modifications = JSON.parse(e.target.value);
              onChange({ requestModifications: modifications });
            } catch {
              // Invalid JSON, keep current value
            }
          }}
          className="w-full px-3 py-2 h-32 bg-gray-800 text-white rounded border border-gray-700 font-mono"
          placeholder={JSON.stringify(
            {
              "headers.Authorization": "Bearer {{token}}",
              "headers.X-User-Id": "{{userId}}",
              "body.userId": "{{userId}}",
              "query.version": "v2",
            },
            null,
            2
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Specify request modifications as JSON. Use dot notation for nested
          properties:
        </p>
        <ul className="text-xs text-gray-400 mt-1 ml-4 space-y-1">
          <li>
            • <code className="bg-gray-800 px-1 rounded">headers.X-Custom</code>{" "}
            - Modify request headers
          </li>
          <li>
            • <code className="bg-gray-800 px-1 rounded">body.fieldName</code> -
            Modify request body fields
          </li>
          <li>
            • <code className="bg-gray-800 px-1 rounded">query.param</code> -
            Modify query parameters
          </li>
          <li>
            • <code className="bg-gray-800 px-1 rounded">path</code> - Modify
            the request path
          </li>
        </ul>
      </div>

      <div className="bg-amber-900/20 border border-amber-700 rounded p-3">
        <h4 className="text-amber-300 font-medium mb-2">
          Request Modifier Behavior
        </h4>
        <ul className="text-xs text-amber-200 space-y-1">
          <li>
            • This rule type is typically <strong>non-terminating</strong>
          </li>
          <li>• It modifies the request and passes it to subsequent rules</li>
          <li>• Multiple request modifiers can be chained together</li>
          <li>
            • Use template variables like{" "}
            <code className="bg-amber-800 px-1 rounded">{"{{variable}}"}</code>{" "}
            for dynamic values
          </li>
          <li>• Order matters - rules are processed in sequence</li>
        </ul>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded p-3">
        <h4 className="text-gray-300 font-medium mb-2">Template Variables</h4>
        <p className="text-xs text-gray-400 mb-2">
          Available template variables:
        </p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>
            • <code className="bg-gray-700 px-1 rounded">{"{{path}}"}</code> -
            Original request path
          </li>
          <li>
            • <code className="bg-gray-700 px-1 rounded">{"{{method}}"}</code> -
            HTTP method
          </li>
          <li>
            •{" "}
            <code className="bg-gray-700 px-1 rounded">{"{{timestamp}}"}</code>{" "}
            - Current timestamp
          </li>
          <li>
            • <code className="bg-gray-700 px-1 rounded">{"{{randomId}}"}</code>{" "}
            - Generated random ID
          </li>
          <li>
            •{" "}
            <code className="bg-gray-700 px-1 rounded">
              {"{{env.VAR_NAME}}"}
            </code>{" "}
            - Environment variables
          </li>
        </ul>
      </div>
    </div>
  );
};
