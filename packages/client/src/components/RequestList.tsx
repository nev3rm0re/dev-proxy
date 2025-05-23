import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ResponseList } from "@/components/ResponseList";
import type { EventResponseSent } from "@/types/proxy";
import type {
  Rule,
  StaticResponseRule,
  ForwardingRule,
  DomainRule,
} from "@/types/proxy";
import { LockButton } from "@/components/ui/lock-button";
import { groupBy } from "lodash";
import { useNavigate } from "react-router-dom";

interface RequestListProps {
  events: EventResponseSent[];
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
  const [rules, setRules] = useState<Rule[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (events.length > 0) {
      setExpandedPath((prevPath) =>
        prevPath === null ? events[0].path : prevPath
      );
    }
  }, [events]);

  // Fetch rules to match with requests
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch("/api/rules");
        const data = await response.json();
        setRules(data);
      } catch (error) {
        console.error("Failed to fetch rules:", error);
      }
    };
    fetchRules();
  }, []);

  const handleToggleExpand = (path: string) => {
    setExpandedPath(expandedPath === path ? null : path);
  };

  const createRuleFromResponse = async (
    event: EventResponseSent,
    responseId: string
  ) => {
    const response = event.responses.find((r) => r.responseId === responseId);
    if (!response) return;

    try {
      const rule = {
        name: `${event.method} ${event.path}`,
        type: "static" as const,
        method: event.method,
        pathPattern: event.path,
        responseStatus: response.status,
        responseBody:
          typeof response.body === "string"
            ? response.body
            : JSON.stringify(response.body, null, 2),
        responseHeaders: response.headers,
        isActive: true,
        isTerminating: true,
        order: rules.length,
        description: `Auto-created rule from locked response`,
      };

      const apiResponse = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rule),
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to create rule");
      }

      const newRule = await apiResponse.json();
      setRules([...rules, newRule]);

      // Navigate to rules tab to show the new rule
      navigate("/rules");
    } catch (error) {
      console.error("Failed to create rule:", error);
    }
  };

  // Function to find matching rule for a request
  const findMatchingRule = (event: EventResponseSent): Rule | null => {
    for (const rule of rules) {
      if (!rule.isActive) continue;

      if (rule.type === "static" || rule.type === "forwarding") {
        const staticOrForwardingRule = rule as
          | StaticResponseRule
          | ForwardingRule;
        const ruleMethod = Array.isArray(staticOrForwardingRule.method)
          ? staticOrForwardingRule.method
          : [staticOrForwardingRule.method];
        const methodMatches =
          ruleMethod.includes("*") || ruleMethod.includes(event.method);

        if (methodMatches) {
          // Simple pattern matching - could be enhanced with regex
          const pathPattern = staticOrForwardingRule.pathPattern || "/*";
          if (
            pathPattern === "/*" ||
            event.path === pathPattern ||
            event.path.startsWith(pathPattern.replace("*", ""))
          ) {
            return rule;
          }
        }
      } else if (rule.type === "domain") {
        // Domain rule matching logic could be added here
        const domainRule = rule as DomainRule;
        if (
          domainRule.pattern &&
          event.hostname.match(new RegExp(domainRule.pattern))
        ) {
          return rule;
        }
      }
    }
    return null;
  };

  const groupedRequests = groupBy(events, "path");

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="grid grid-cols-[auto_1fr_auto_auto] p-3 border-b border-gray-800 text-sm text-gray-400">
        <div className="flex items-center h-full">
          <span className="w-6"></span>
        </div>
        <div className="flex items-center h-full">Path</div>
        <div className="flex items-center h-full">Rule</div>
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
          const isAnyRequestLocked = pathRequests.some((req) => req.isLocked);
          const matchingRule = findMatchingRule(pathRequests[0]);

          return (
            <Collapsible
              key={path}
              open={expandedPath === path}
              className="border-b border-gray-800"
            >
              <CollapsibleTrigger asChild>
                <div
                  onClick={() => handleToggleExpand(path)}
                  className="grid grid-cols-[auto_1fr_auto_auto] p-3 cursor-pointer hover:bg-gray-800"
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
                  <div className="flex items-center justify-center min-w-[100px]">
                    {matchingRule ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/rules", {
                            state: { highlightRule: matchingRule.id },
                          });
                        }}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        title={`Matched by rule: ${matchingRule.name}`}
                      >
                        <ExternalLink size={12} />
                        {matchingRule.name.length > 15
                          ? `${matchingRule.name.substring(0, 15)}...`
                          : matchingRule.name}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">No rule</span>
                    )}
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
                    .sort(([methodA], [methodB]) =>
                      sortByMethodPriority(methodA, methodB)
                    )
                    .map(([method, requests]) => {
                      const allResponses = requests.flatMap(
                        (req) => req.responses
                      );

                      return (
                        <div
                          key={method}
                          className="p-2 rounded hover:bg-gray-800"
                        >
                          <ResponseList
                            route={requests[0]}
                            responses={allResponses}
                            method={method}
                            onLockResponse={(responseId) =>
                              onLockResponse(requests[0].id, responseId)
                            }
                            onEditResponse={(responseId, newBody) =>
                              onEditResponse(
                                requests[0].id,
                                responseId,
                                newBody
                              )
                            }
                            onCreateRule={(responseId) =>
                              createRuleFromResponse(requests[0], responseId)
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
