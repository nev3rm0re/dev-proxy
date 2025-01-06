import { useProxyStore } from "@/store/proxyStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { RequestList } from "./RequestList";
import { useEffect } from "react";

export const Layout = () => {
    const wsUrl = "ws://localhost:3000";
    const { isConnected } = useWebSocket(wsUrl);
    const { events, setEvents, incomingEventId } = useProxyStore();

    useEffect(() => {
        // Make an api call to get the initial events
        const fetchEvents = async () => {
            const response = await fetch(`http://localhost:3000/api/history`);
            const data = await response.json();
            setEvents(data);
        };
        fetchEvents();
    }, []);

    const handleLockEvent = async (eventId: string) => {
        try {
            await fetch(`http://localhost:3000/api/events/${eventId}/lock`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to lock event:', error);
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
                    onLockResponse={() => { }} 
                    onEditResponse={() => { }} 
                />
            </div>
        </div>
    );
};