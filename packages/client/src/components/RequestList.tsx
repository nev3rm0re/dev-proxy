import { useProxyStore } from "../store/proxyStore";
import { LockOpen, Lock } from "lucide-react";

export const RequestList = () => {
    const { events, selectedEventId, selectEvent } = useProxyStore();
  
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="grid grid-cols-4 p-3 border-b border-gray-800 text-sm text-gray-400">
          <div>Project ID</div>
          <div className="col-span-2">Path</div>
          <div className="flex justify-between">
            <span>Time</span>
            <span>Hits</span>
            <span>Status</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className={`grid grid-cols-4 p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 ${
                selectedEventId === event.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="text-gray-300">{event.projectId}</div>
              <div className="col-span-2 text-gray-300 truncate">
                {event.path}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-gray-400 text-sm">{event.hits}</span>
                <button className="text-gray-400 hover:text-gray-200">
                  { event.isLocked ? <LockOpen size={16} /> : <Lock size={16} /> }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }