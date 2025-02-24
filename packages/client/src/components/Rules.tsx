import type { ProxyRule } from "@/types/proxy";
import { useState, useEffect } from "react";

export type RuleFormData = {
  method: string;
  url: string;
  responseStatus: number;
  responseBody: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
};

export const Rules = () => {
  const [rules, setRules] = useState<ProxyRule[]>([]);
  const [formData, setFormData] = useState<RuleFormData>({
    method: "GET",
    url: "",
    responseStatus: 200,
    responseBody: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch("/api/rules");
        if (!response.ok) {
          throw new Error("Failed to fetch rules");
        }
        const data = await response.json();
        setRules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch rules");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const newRule = await response.json();
      setRules([...rules, newRule]);
    } catch (error) {
      console.error("Failed to create rule:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading rules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400">Method</label>
            <select
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400">URL</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400">Response Status</label>
          <input
            type="number"
            value={formData.responseStatus}
            onChange={(e) =>
              setFormData({
                ...formData,
                responseStatus: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400">Response Body</label>
          <textarea
            value={formData.responseBody}
            onChange={(e) =>
              setFormData({ ...formData, responseBody: e.target.value })
            }
            className="w-full px-3 py-2 h-32 bg-gray-800 text-white rounded border border-gray-700 font-mono"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Create Rule
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl text-white mb-4">Existing Rules</h2>
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 bg-gray-800 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-mono">
                      {rule.method}
                    </span>
                    <span className="text-white font-mono">{rule.url}</span>
                  </div>
                  <div className="mt-2 text-gray-400">
                    Response: {rule.responseStatus}
                  </div>
                </div>
                <button
                  onClick={() => {
                    // TODO: Implement delete functionality
                    console.log("Delete rule:", rule.id);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-400 mb-1">Response Body:</div>
                <pre className="bg-gray-900 p-2 rounded text-gray-300 text-sm overflow-x-auto">
                  {typeof rule.responseBody === "string"
                    ? rule.responseBody
                    : JSON.stringify(rule.responseBody, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
