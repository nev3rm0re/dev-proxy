import React from "react";
import { ForwardingRuleFormData } from "./types";

interface ForwardingRuleFormProps {
  formData: ForwardingRuleFormData;
  onChange: (data: Partial<ForwardingRuleFormData>) => void;
  errors: Record<string, string>;
}

export const ForwardingRuleForm: React.FC<ForwardingRuleFormProps> = ({
  formData,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white border-b border-gray-700 pb-2">
        Forwarding Configuration
      </h3>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Target URL</label>
        <input
          type="text"
          value={formData.targetUrl || ""}
          onChange={(e) => onChange({ targetUrl: e.target.value })}
          className={`w-full px-3 py-2 bg-gray-800 text-white rounded border ${
            errors.targetUrl ? "border-red-500" : "border-gray-700"
          }`}
          placeholder="https://api.example.com"
        />
        {errors.targetUrl && (
          <p className="text-red-500 text-xs mt-1">{errors.targetUrl}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          The URL where requests will be forwarded to. You can use $1, $2, etc.
          to reference capture groups from the path pattern.
        </p>
        <div className="mt-2 text-xs text-gray-400">
          <p className="font-medium mb-1">Examples:</p>
          <ul className="space-y-1 ml-2">
            <li>
              •{" "}
              <code className="bg-gray-800 px-1 rounded">
                https://api.example.com
              </code>{" "}
              - Simple forwarding
            </li>
            <li>
              •{" "}
              <code className="bg-gray-800 px-1 rounded">
                https://api.example.com/$1
              </code>{" "}
              - With capture group
            </li>
            <li>
              •{" "}
              <code className="bg-gray-800 px-1 rounded">
                http://$1-service.internal:8080/$2
              </code>{" "}
              - Microservice routing
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
        <h4 className="text-blue-300 font-medium mb-2">Forwarding Behavior</h4>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>
            • Response status, headers, and body from upstream server will be
            passed through
          </li>
          <li>• No response status configuration needed</li>
          <li>
            • Request headers and body are forwarded as-is (unless modified by
            request modifier rules)
          </li>
          <li>
            • Path pattern capture groups can be used in target URL (e.g.,
            /api/(.*) → https://api.com/$1)
          </li>
        </ul>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded p-3">
        <h4 className="text-gray-300 font-medium mb-2">Common Path Patterns</h4>
        <div className="text-xs text-gray-400 space-y-2">
          <div>
            <code className="bg-gray-700 px-1 rounded">/api/(.*)</code>
            <span className="ml-2">→ Captures everything after /api/</span>
          </div>
          <div>
            <code className="bg-gray-700 px-1 rounded">
              /api/(v[0-9]+)/(.*)
            </code>
            <span className="ml-2">→ Captures version and path separately</span>
          </div>
          <div>
            <code className="bg-gray-700 px-1 rounded">
              /services/([^/]+)/(.*)
            </code>
            <span className="ml-2">
              → Captures service name and remaining path
            </span>
          </div>
          <div>
            <code className="bg-gray-700 px-1 rounded">
              /([^/]+)\\.local(.*)
            </code>
            <span className="ml-2">
              → Captures subdomain and path for .local domains
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
