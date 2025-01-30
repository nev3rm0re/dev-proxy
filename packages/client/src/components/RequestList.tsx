import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ResponseList } from '@/components/ResponseList';
import { ProxyEvent } from '@/types/proxy';
import { LockButton } from '@/components/ui/lock-button';
import { cn } from "@/lib/utils";
import { groupBy } from 'lodash';

interface RequestListProps {
  events: ProxyEvent[];
  incomingEventId?: string | null;
  onLockEvent: (eventId: string) => void;
  onLockResponse: (eventId: string, responseId: string) => void;
  onEditResponse: (eventId: string, responseId: string, newBody: string) => void;
}

const PRIORITY_METHODS = ['post', 'put', 'get', 'delete'];

export const RequestList: React.FC<RequestListProps> = ({ 
  events, 
  incomingEventId,
  onLockEvent, 
  onLockResponse, 
  onEditResponse 
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

  const groupedRequests = groupBy(events, 'path');

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="grid grid-cols-[auto_1fr_auto] p-3 border-b border-gray-800 text-sm text-gray-400">
        <div className="flex items-center h-full">
          <span className="w-6"></span>
        </div>
        <div className="flex items-center h-full">Path</div>
        <div className="flex justify-between items-center h-full gap-4">
          <span>Hits</span>
          <span>Status</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {Object.entries(groupedRequests).map(([path, pathRequests]) => {
          const methodGroups = groupBy(pathRequests, 'method');
          
          return (
            <div key={path} className="mb-4 border-b border-gray-200">
              <h3 className="font-medium">{path}</h3>
              <div className="ml-4">
                {Object.entries(methodGroups)
                  .sort(([methodA], [methodB]) => {
                    const priorityA = PRIORITY_METHODS.indexOf(methodA.toLowerCase());
                    const priorityB = PRIORITY_METHODS.indexOf(methodB.toLowerCase());
                    if (priorityA === -1) return 1;
                    if (priorityB === -1) return -1;
                    return priorityA - priorityB;
                  })
                  .map(([method, requests]) => (
                    <div key={method} className="mb-2">
                      <span className={`text-xs font-mono ${getMethodColor(method)}`}>
                        {method.toUpperCase()}
                      </span>
                      {requests.map(request => (
                        <Collapsible key={request.id} open={expandedPath === request.path} className="relative">
                          <CollapsibleTrigger asChild>
                            <div
                              onClick={() => handleToggleExpand(request.path)}
                              className={cn(
                                "sticky top-0 z-10 self-start grid grid-cols-[auto_1fr_auto] p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 bg-gray-900",
                                request.path === incomingEventId && 'animate-pulse-gradient'
                              )}
                            >
                              <div className="text-gray-300 flex items-baseline w-6 mt-1">
                                {expandedPath === request.path ? 
                                  <ChevronDown size={18} className="text-gray-300 hover:text-white transition-colors" /> : 
                                  <ChevronRight size={18} className="text-gray-300 hover:text-white transition-colors" />
                                }
                              </div>
                              <div className="text-gray-300 truncate">
                                {request.hostname}
                                {request.path}
                              </div>
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-gray-400 text-sm">{request.hits}</span>
                                <LockButton
                                  isLocked={request.isLocked}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onLockEvent(request.id);
                                  }}
                                />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <ResponseList
                              route={request}
                              responses={request.responses}
                              onLockResponse={(responseId) => onLockResponse(request.id, responseId)}
                              onEditResponse={(responseId, newBody) => onEditResponse(request.id, responseId, newBody)}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getMethodColor(method: string): string {
  switch (method.toLowerCase()) {
    case 'post':
      return 'text-green-500';
    case 'put':
      return 'text-blue-500';
    case 'get':
      return 'text-yellow-500';
    case 'delete':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

