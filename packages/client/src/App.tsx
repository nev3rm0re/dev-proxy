import { useProxyStore } from "@/store/proxyStore";
import { useWebSocket } from "./hooks/useWebSocket";
import { RequestList } from "./components/RequestList";
import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Trash2 } from "lucide-react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Rules } from "./components/Rules";
import { Settings } from "./components/Settings";
import { BuildHashBadge } from "./components/BuildHashBadge";

export const App = () => {
  const wsUrl = `/ws`;
  const { isConnected } = useWebSocket(wsUrl);
  const { events, setEvents, incomingEventId } = useProxyStore();
  const [filterTerm, setFilterTerm] = useState("");
  const location = useLocation();

  // Determine active tab from URL
  const activeTab = location.pathname === "/rules" ? "rules" : "log";

  useEffect(() => {
    // Make an api call to get the initial events
    const fetchEvents = async () => {
      const response = await fetch(`/api/history`);
      const data = await response.json();
      setEvents(data);
    };
    fetchEvents();
  }, [setEvents]);

  const handleClearEvents = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all events? This cannot be undone."
      )
    ) {
      try {
        await fetch("/api/history", {
          method: "DELETE",
        });
        setEvents([]);
      } catch (error) {
        console.error("Failed to clear events:", error);
      }
    }
  };

  const filteredEvents = React.useMemo(
    () =>
      events
        .map((event) => {
          if (!filterTerm.trim()) return event;

          const searchTerm = filterTerm.trim().toLowerCase();

          // Check if path matches
          const pathMatches = event.path.toLowerCase().includes(searchTerm);

          // Filter responses that match the search term
          const filteredResponses = event.responses.filter(
            (response) =>
              response.body &&
              typeof response.body === "object" &&
              JSON.stringify(response.body).toLowerCase().includes(searchTerm)
          );

          // If path matches or there are matching responses, return modified event
          if (pathMatches || filteredResponses.length > 0) {
            return {
              ...event,
              responses: pathMatches ? event.responses : filteredResponses,
            };
          }

          // If no matches, return null
          return null;
        })
        .filter(Boolean) as typeof events,
    [events, filterTerm]
  );

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/*"
          element={
            <div className="flex flex-col h-screen bg-gray-900">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-2 mr-4">
                    <Link
                      to="/"
                      className={`px-3 py-1 rounded transition-colors ${
                        activeTab === "log"
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Log
                    </Link>
                    <Link
                      to="/rules"
                      className={`px-3 py-1 rounded transition-colors ${
                        activeTab === "rules"
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Rules
                    </Link>
                  </div>
                  {activeTab === "log" && (
                    <>
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
                        className="ml-4 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-gray-500"
                      />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    to={"/settings"}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    <SettingsIcon size={16} />
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <RequestList
                        events={filteredEvents}
                        incomingEventId={incomingEventId}
                      />
                    }
                  />
                  <Route path="/rules" element={<Rules />} />
                </Routes>
              </div>
              <BuildHashBadge />
            </div>
          }
        />
      </Routes>
    </div>
  );
};
