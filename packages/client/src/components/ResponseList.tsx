import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { EventResponseSent, ProxyResponse } from "@/types/proxy";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";

interface ResponseListProps {
  route: EventResponseSent;
  responses: ProxyResponse[];
  method: string;
  onCreateRule: (responseId: string) => void;
}

export const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  method,
  onCreateRule,
}) => {
  const [expandedResponseIds, setExpandedResponseIds] = useState<string[]>([]);

  const handleToggleExpand = (responseId: string) => {
    setExpandedResponseIds((prev) =>
      prev.includes(responseId)
        ? prev.filter((id) => id !== responseId)
        : [...prev, responseId]
    );
  };

  return (
    <div className="border-l border-gray-700">
      {responses.map((response, index) => (
        <Collapsible
          key={`response-${index}`}
          open={expandedResponseIds.includes(response.responseId)}
        >
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center justify-between p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => handleToggleExpand(response.responseId)}
            >
              <div className="flex items-center space-x-2">
                {expandedResponseIds.includes(response.responseId) ? (
                  <ChevronDown
                    size={16}
                    className="text-gray-300 hover:text-white transition-colors"
                  />
                ) : (
                  <ChevronRight
                    size={16}
                    className="text-gray-300 hover:text-white transition-colors"
                  />
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-sm ${getMethodColor(
                    method
                  )}`}
                >
                  {method.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-sm ${
                    response.status.toString().startsWith("2")
                      ? "bg-green-500/20 text-green-400"
                      : response.status.toString().startsWith("4")
                      ? "bg-yellow-500/20 text-yellow-400"
                      : response.status.toString().startsWith("5")
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {response.status}
                </span>
                <span className="text-gray-400 text-sm">
                  {response.headers["content-type"]}
                </span>
                <span className="text-gray-400 text-sm">
                  {response.headers["content-length"]} bytes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">
                  {new Date(response.headers["date"]).toLocaleString("en-GB", {
                    timeZone: "UTC",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateRule(response.responseId);
                  }}
                  className="text-blue-400 hover:text-blue-300"
                  title="Create rule from this response"
                >
                  <Plus size={16} />
                  Create Rule
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2 bg-gray-900 rounded">
              <div className="max-h-[calc(100vh-150px)] overflow-auto">
                <CodeMirror
                  value={JSON.stringify(response.body, null, 2)}
                  height="auto"
                  editable={false}
                  extensions={[
                    json(),
                    basicSetup({
                      lineNumbers: false,
                      foldGutter: false,
                    }),
                  ]}
                  theme="dark"
                  className="rounded border border-gray-700"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

function getMethodColor(method: string): string {
  switch (method.toLowerCase()) {
    case "get":
      return "bg-emerald-500/20 text-emerald-400";
    case "delete":
      return "bg-red-500/20 text-red-400";
    case "post":
      return "bg-amber-500/20 text-amber-400";
    case "put":
      return "bg-orange-500/20 text-orange-400";
    case "patch":
      return "bg-yellow-500/20 text-yellow-400";
    case "options":
      return "bg-blue-500/20 text-blue-400";
    case "head":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}
