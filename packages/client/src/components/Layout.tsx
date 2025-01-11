import { useProxyStore } from "@/store/proxyStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { RequestList } from "./RequestList";
import { useEffect } from "react";
import { ProxyResponse } from "@/types/proxy";



export const Layout = () => {
    const wsUrl = "ws://localhost:3000";
    const { isConnected } = useWebSocket(wsUrl);
    const { events, setEvents, incomingEventId, updateEvent, getEvent } = useProxyStore();

    useEffect(() => {
        // Make an api call to get the initial events
        const fetchEvents = async () => {
            const response = await fetch(`http://localhost:3000/api/history`);
            const data = await response.json();
            setEvents(data);
        };
        fetchEvents();
    }, []);

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
    const handleLockEvent = async (eventId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}/lock`, {
                method: 'POST',
            });

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Failed to lock event:', error);
        }
    };

    const handleLockResponse = async (routeId: string, responseId: string) => {
        try {
            const updatedResponse = await fetch(`http://localhost:3000/api/events/${routeId}/${responseId}`, {
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
            const response = await fetch(`http://localhost:3000/api/events/${routeId}/${responseId}/body`, {
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

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="p-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            <div className="flex-1">
                <RequestList
                    events={events}
                    incomingEventId={incomingEventId}
                    onLockEvent={handleLockEvent}
                    onLockResponse={handleLockResponse}
                    onEditResponse={handleEditResponse}
                />
            </div>
        </div>
    );
};