import { useProxyStore } from "@/store/proxyStore";
import { useWebSocket } from "./hooks/useWebSocket";
import { RequestList } from "./components/RequestList";
import React, { useEffect, useState } from "react";
import type { ProxyResponse } from "@/types/proxy";
import { Settings as SettingsIcon, Trash2 } from "lucide-react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Rules } from "./components/Rules";
import { Settings } from "./components/Settings";
import { BuildHashBadge } from "./components/BuildHashBadge";

export const App = () => {
  const wsUrl = `/ws`;
  const { isConnected } = useWebSocket(wsUrl);
  const { events, setEvents, incomingEventId, updateEvent, getEvent } =
    useProxyStore();
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

  const handleLockEvent = async (eventId: string) => {
    try {
      const isLocked = getEvent(eventId)?.isLocked;
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify({ isLocked: !isLocked }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      updateEvent(data.data);
    } catch (error) {
      console.error("Failed to lock event:", error);
    }
  };

  const updateRouteResponse = (
    routeId: string,
    responseId: string,
    newResponse: ProxyResponse
  ) => {
    const event = getEvent(routeId);
    if (event) {
      const response = event.responses.findIndex(
        (r: ProxyResponse) => r.responseId === responseId
      );
      if (response !== -1) {
        console.log("Event found, replacing response");
        event.responses[response] = { ...newResponse };
        updateEvent(event);
      }
    }
  };

  const handleLockResponse = async (routeId: string, responseId: string) => {
    try {
      // Get the event and response data
      const event = getEvent(routeId);
      if (!event) {
        console.error("Event not found");
        return;
      }

      const response = event.responses.find((r) => r.responseId === responseId);
      if (!response) {
        console.error("Response not found");
        return;
      }

      // Create a static rule with the cached response
      const rule = {
        name: `Cache: ${event.method} ${event.path}`,
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
        order: 0, // High priority for cache rules
        description: `Auto-created cache rule from locked response`,
      };

      const apiResponse = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rule),
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to create cache rule");
      }

      const newRule = await apiResponse.json();
      console.log("Cache rule created:", newRule);

      // Optionally, you could navigate to rules tab to show the new rule
      // navigate("/rules", { state: { highlightRule: newRule.id } });
    } catch (error) {
      console.error("Failed to create cache rule:", error);
    }
  };

  const handleEditResponse = async (
    routeId: string,
    responseId: string,
    newBody: string
  ) => {
    try {
      const response = await fetch(
        `/api/events/${routeId}/${responseId}/body`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: newBody,
        }
      );
      const data = await response.json();
      updateRouteResponse(routeId, responseId, data.data);
    } catch (error) {
      console.error("Failed to edit response:", error);
    }
  };

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
                        onLockEvent={handleLockEvent}
                        onLockResponse={handleLockResponse}
                        onEditResponse={handleEditResponse}
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
