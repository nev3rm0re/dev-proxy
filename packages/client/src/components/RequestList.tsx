import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ResponseList } from "@/components/ResponseList";
import type { ProxyEvent } from "@/types/proxy";
import { LockButton } from "@/components/ui/lock-button";
import { cn } from "@/lib/utils";
import { groupBy } from "lodash";

interface RequestListProps {
  events: ProxyEvent[];
  incomingEventId?: string | null;
  onLockEvent: (eventId: string) => void;
  onLockResponse: (eventId: string, responseId: string) => void;
  onEditResponse: (
    eventId: string,
    responseId: string,
    newBody: string
  ) => void;
}

const PRIORITY_METHODS = ["post", "put", "get", "delete"];

export const RequestList: React.FC<RequestListProps> = ({
  events,
  incomingEventId,
  onLockEvent,
  onLockResponse,
  onEditResponse,
}) => {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  useEffect(() => {
    if (events.length > 0 && expandedPath === null) {
      setExpandedPath(events[0].path);
    }
  }, [events]);

  const handleToggleExpand = (path: string) => {
    setExpandedPath(expandedPath === path ? null : path);
  };

  const groupedRequests = groupBy(events, "path");

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="grid grid-cols-[auto_1fr_auto] p-3 border-b border-gray-800 text-sm text-gray-400">
        <div className="flex items-center h-full">
          <span className="w-6"></span>
        </div>
        <div className="flex items-center h-full">Path</div>
        <div className="flex justify-between items-center h-full gap-4">
          <span>Total Hits</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {Object.entries(groupedRequests).map(([path, pathRequests]) => {
          const totalHits = pathRequests.reduce(
            (sum, req) => sum + req.hits,
            0
          );
          const methodGroups = groupBy(pathRequests, "method");

          return (
            <Collapsible
              key={path}
              open={expandedPath === path}
              className="border-b border-gray-800"
            >
              <CollapsibleTrigger asChild>
                <div
                  onClick={() => handleToggleExpand(path)}
                  className="grid grid-cols-[auto_1fr_auto] p-3 cursor-pointer hover:bg-gray-800"
                >
                  <div className="text-gray-300 flex items-baseline w-6 mt-1">
                    {expandedPath === path ? (
                      <ChevronDown
                        size={18}
                        className="text-gray-300 hover:text-white transition-colors"
                      />
                    ) : (
                      <ChevronRight
                        size={18}
                        className="text-gray-300 hover:text-white transition-colors"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-gray-300 truncate">
                      {pathRequests[0].hostname}
                      {path}
                    </div>
                    <div className="flex gap-0.5">
                      {Object.keys(methodGroups)
                        .sort((a, b) => {
                          const priorityA = PRIORITY_METHODS.indexOf(
                            a.toLowerCase()
                          );
                          const priorityB = PRIORITY_METHODS.indexOf(
                            b.toLowerCase()
                          );
                          if (priorityA === -1) return 1;
                          if (priorityB === -1) return -1;
                          return priorityA - priorityB;
                        })
                        .map((method) => (
                          <span
                            key={method}
                            className={`text-xs leading-none font-mono px-1 py-[2px] rounded-[2px] bg-gray-800 ${getMethodColor(
                              method
                            )}`}
                          >
                            {method.toUpperCase()}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{totalHits}</span>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-6 space-y-2 pb-2">
                  {Object.entries(methodGroups)
                    .sort(([methodA], [methodB]) => {
                      const priorityA = PRIORITY_METHODS.indexOf(
                        methodA.toLowerCase()
                      );
                      const priorityB = PRIORITY_METHODS.indexOf(
                        methodB.toLowerCase()
                      );
                      if (priorityA === -1) return 1;
                      if (priorityB === -1) return -1;
                      return priorityA - priorityB;
                    })
                    .map(([method, requests]) => (
                      <div key={method}>
                        {requests.map((request) => (
                          <div
                            key={request.id}
                            className={cn(
                              "p-2 rounded hover:bg-gray-800",
                              request.path === incomingEventId &&
                                "animate-pulse-gradient"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-xs font-mono ${getMethodColor(
                                  method
                                )}`}
                              >
                                {method.toUpperCase()}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-gray-400 text-sm">
                                  {request.hits}
                                </span>
                                <LockButton
                                  isLocked={request.isLocked}
                                  onClick={() => onLockEvent(request.id)}
                                />
                              </div>
                            </div>
                            <ResponseList
                              route={request}
                              responses={request.responses}
                              onLockResponse={(responseId) =>
                                onLockResponse(request.id, responseId)
                              }
                              onEditResponse={(responseId, newBody) =>
                                onEditResponse(request.id, responseId, newBody)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

function getMethodColor(method: string): string {
  switch (method.toLowerCase()) {
    case "get":
      return "text-emerald-500";
    case "delete":
      return "text-red-500";
    case "post":
      return "text-amber-500";
    case "put":
      return "text-orange-500";
    case "patch":
      return "text-yellow-500";
    case "options":
      return "text-blue-400";
    case "head":
      return "text-blue-400";
    default:
      return "text-gray-400";
  }
}
