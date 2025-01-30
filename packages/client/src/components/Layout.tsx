import { useProxyStore } from "@/store/proxyStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { RequestList } from "./RequestList";
import React, { useEffect, useState } from "react";
import type { ProxyResponse } from "@/types/proxy";
import { Settings as SettingsIcon, Trash2 } from "lucide-react";
import { Settings } from "./Settings";
import { BuildHashBadge } from "./BuildHashBadge";

export const Layout = () => {
    const wsUrl = `/ws`;
    const { isConnected } = useWebSocket(wsUrl);
    const { events, setEvents, incomingEventId, updateEvent, getEvent } = useProxyStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [filterTerm, setFilterTerm] = useState('');

    useEffect(() => {
        // Make an api call to get the initial events
        const fetchEvents = async () => {
            const response = await fetch(`/api/history`);
            const data = await response.json();
            setEvents(data);
        };
        fetchEvents();
    }, []);

    const handleLockEvent = async (eventId: string) => {
        try {
            const isLocked = getEvent(eventId)?.isLocked;
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PUT',
                body: JSON.stringify({ isLocked: !isLocked }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();
            updateEvent(data.data);
        } catch (error) {
            console.error('Failed to lock event:', error);
        }
    };

    const updateRouteResponse = (routeId: string, responseId: string, newResponse: ProxyResponse) => {
        const event = getEvent(routeId);
        if (event) {
            const response = event.responses.findIndex((r: ProxyResponse) => r.responseId === responseId);
            if (response !== -1) {
                console.log('Event found, replacing response');
                event.responses[response] = { ...newResponse };
                updateEvent(event);
            }
        }
    }

    const handleLockResponse = async (routeId: string, responseId: string) => {
        try {
            const updatedResponse = await fetch(`/api/events/${routeId}/${responseId}`, {
                method: 'POST',
            });
            const data = await updatedResponse.json();
            updateRouteResponse(routeId, responseId, data.data);
        } catch (error) {
            console.error('Failed to lock response:', error);
        }
    };

    const handleEditResponse = async (routeId: string, responseId: string, newBody: string) => {
        try {
            const response = await fetch(`/api/events/${routeId}/${responseId}/body`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: newBody,
            });
            const data = await response.json();
            updateRouteResponse(routeId, responseId, data.data);
        } catch (error) {
            console.error('Failed to edit response:', error);
        }
    };

    const handleClearEvents = async () => {
        if (window.confirm('Are you sure you want to clear all events? This cannot be undone.')) {
            try {
                await fetch('/api/history', {
                    method: 'DELETE',
                });
                setEvents([]);
            } catch (error) {
                console.error('Failed to clear events:', error);
            }
        }
    };

    const filteredEvents = React.useMemo(() => events.map(event => {
        if (!filterTerm.trim()) return event;
        
        const searchTerm = filterTerm.trim().toLowerCase();
        
        // Check if path matches
        const pathMatches = event.path.toLowerCase().includes(searchTerm);
        
        // Filter responses that match the search term
        const filteredResponses = event.responses.filter(response => 
            response.body && 
            typeof response.body === 'object' &&
            JSON.stringify(response.body).toLowerCase().includes(searchTerm)
        );
        
        // If path matches or there are matching responses, return modified event
        if (pathMatches || filteredResponses.length > 0) {
            return {
                ...event,
                responses: pathMatches ? event.responses : filteredResponses
            };
        }
        
        // If no matches, return null
        return null;
    }).filter(Boolean) as typeof events, [events, filterTerm]);

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
                        onClick={handleClearEvents}
                    >
                        <Trash2 size={16} />
                        <span className="text-sm">Clear Log</span>
                    </button>
                    <input
                        type="text"
                        placeholder="Filter requests..."
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        className="ml-4 px-3 py-1 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-gray-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        className="text-muted-foreground hover:text-white transition-colors"
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        <SettingsIcon size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <RequestList
                    events={filteredEvents}
                    incomingEventId={incomingEventId}
                    onLockEvent={handleLockEvent}
                    onLockResponse={handleLockResponse}
                    onEditResponse={handleEditResponse}
                />
            </div>
            <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <BuildHashBadge />
        </div>
    );
};