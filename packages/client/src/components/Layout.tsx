import { useWebSocket } from "../hooks/useWebSocket";
import { RequestList } from "./RequestList";

export const Layout = () => {
    const wsUrl = "ws://localhost:3000";
    const { isConnected } = useWebSocket(wsUrl);

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="p-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            <div className="flex-1">
                <RequestList />
            </div>
        </div>
    );
};