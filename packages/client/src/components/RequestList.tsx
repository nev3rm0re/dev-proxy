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
const sortByMethodPriority = (a: string, b: string) => {
  const priorityA = PRIORITY_METHODS.indexOf(a.toLowerCase());
  const priorityB = PRIORITY_METHODS.indexOf(b.toLowerCase());
  if (priorityA === -1) return 1;
  if (priorityB === -1) return -1;
  return priorityA - priorityB;
};

export const RequestList: React.FC<RequestListProps> = ({
  events,
  onLockEvent,
  onLockResponse,
  onEditResponse,
}) => {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  useEffect(() => {
    if (events.length > 0) {
      setExpandedPath((prevPath) => prevPath === null ? events[0].path : prevPath);
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
          const isAnyRequestLocked = pathRequests.some(req => req.isLocked);

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
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{totalHits}</span>
                    <LockButton
                      isLocked={isAnyRequestLocked}
                      onClick={() => onLockEvent(pathRequests[0].id)}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-6 space-y-2 pb-2">
                  {Object.entries(methodGroups)
                    .sort(([methodA], [methodB]) => sortByMethodPriority(methodA, methodB))
                    .map(([method, requests]) => {
                      const allResponses = requests.flatMap(req => req.responses);

                      return (
                        <div key={method} className="p-2 rounded hover:bg-gray-800">
                          <ResponseList
                            route={requests[0]}
                            responses={allResponses}
                            method={method}
                            onLockResponse={(responseId) =>
                              onLockResponse(requests[0].id, responseId)
                            }
                            onEditResponse={(responseId, newBody) =>
                              onEditResponse(requests[0].id, responseId, newBody)
                            }
                          />
                        </div>
                      );
                    })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};