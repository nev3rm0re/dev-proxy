import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ResponseList } from '@/components/ResponseList';
import { ProxyEvent } from '@/types/proxy';
import { LockButton } from '@/components/ui/lock-button';

interface RequestListProps {
  events: ProxyEvent[];
  incomingEventId?: string | null;
  onLockEvent: (eventId: string) => void;
  onLockResponse: (eventId: string, responseId: string) => void;
  onEditResponse: (eventId: string, responseId: string, newBody: string) => void;
}

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
        {events.map((event) => (
          <Collapsible key={event.path} open={expandedPath === event.path}>
            <CollapsibleTrigger asChild>
              <div
                onClick={() => handleToggleExpand(event.path)}
                className={`grid grid-cols-[auto_1fr_auto] p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800
                ${event.path === incomingEventId ? 'animate-pulse-gradient' : ''}`}
              >
                <div className="text-gray-300 flex items-baseline w-6 mt-1">
                  {expandedPath === event.path ? 
                    <ChevronDown size={18} className="text-gray-300 hover:text-white transition-colors" /> : 
                    <ChevronRight size={18} className="text-gray-300 hover:text-white transition-colors" />
                  }
                </div>
                <div className="text-gray-300 truncate">
                  {event.hostname}
                  {event.path}
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-400 text-sm">{event.hits}</span>
                  <LockButton
                    isLocked={event.isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLockEvent(event.path);
                    }}
                  />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ResponseList
                responses={event.responses}
                onLockResponse={(responseId) => onLockResponse(event.id, responseId)}
                onEditResponse={(responseId, newBody) => onEditResponse(event.id, responseId, newBody)}
              />
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

