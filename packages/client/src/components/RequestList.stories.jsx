import { RequestList } from "./RequestList";
import { useState } from "react";
import { action } from "@storybook/addon-actions";

export default {
  title: "Components/RequestList",
  component: RequestList,
  parameters: {
    layout: "fullscreen",
    // Disable the global decorator for this story
    layout: {
      fullscreen: true,
      decorator: false,
    },
  },
};

const initialEvents = [
  {
    id: "1",
    path: "/account/info",
    method: "OPTIONS",
    hostname: "platform.example.eu",
    hits: 1,
    isLocked: false,
    responses: [
      {
        responseId: "abc123",
        headers: {
          "access-control-allow-origin": "http://localhost:3001",
          "access-control-allow-credentials": "true",
          "access-control-allow-headers":
            "X-Requested-With, Authorization, Content-Type, jwt, accountId",
          "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
          "access-control-max-age": "86400",
          "content-length": "0",
          date: new Date().toUTCString(),
          connection: "close",
        },
        status: 204,
        count: 1,
        isLocked: false,
      },
    ],
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    path: "/account/info",
    method: "GET",
    hostname: "platform.example.eu",
    hits: 1,
    isLocked: false,
    responses: [
      {
        responseId: "def456",
        headers: {
          date: new Date().toUTCString(),
          "content-type": "application/json",
          "transfer-encoding": "chunked",
          connection: "close",
          server: "nginx/1.26.2",
          "access-control-allow-origin": "http://localhost:3001",
          "access-control-allow-credentials": "true",
          "access-control-allow-headers":
            "X-Requested-With, Authorization, Content-Type, jwt, accountId",
          "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
          "strict-transport-security": "max-age=31536000; includeSubDomains",
          "cache-control": "no-store",
        },
        body: {
          status: "success",
          result: {
            id: 10490,
            type: "incomplete",
            name: "demo testing account",
            email: "demo@example.com",
            country: "FR",
            isActive: 1,
            isVerified: 1,
          },
        },
        status: 200,
        count: 1,
        isLocked: false,
      },
    ],
    timestamp: new Date().toISOString(),
  },
];

const exampleResponse = {
  responseId: "resp_123",
  status: 200,
  headers: {
    'content-type': 'application/json',
    'content-length': '1024',
    'date': '2024-03-20T12:00:00Z'
  },
  body: {
    message: "Example response"
  },
  isLocked: false,
  lockedBody: null // optional, only used when isLocked is true
};

export const Default = () => {
  const [events, setEvents] = useState(initialEvents);
  const [incomingEventId, setIncomingEventId] = useState(null);
  const logEvent = action("New Request");

  const simulateNewRequest = (method, path) => {
    const newEventId = crypto.randomUUID();
    const newEvent = {
      id: newEventId,
      path,
      method,
      hostname: "platform.example.eu",
      hits: 1,
      isLocked: false,
      responses: [
        exampleResponse,
      ],
      timestamp: new Date().toISOString(),
    };

    logEvent({ ...newEvent });
    setIncomingEventId(newEventId);
    setEvents((prev) => [...prev, newEvent]);
    setTimeout(() => setIncomingEventId(null), 2000);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => simulateNewRequest("GET", "/account/info")}
          >
            Simulate GET Request
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => simulateNewRequest("POST", "/api/users")}
          >
            Simulate POST Request
          </button>
        </div>
      </div>

      <div className="flex-1">
        <RequestList
          events={events}
          incomingEventId={incomingEventId}
          onLockEvent={(eventId) => {
            setEvents((prev) =>
              prev.map((event) =>
                event.id === eventId
                  ? { ...event, isLocked: !event.isLocked }
                  : event
              )
            );
          }}
          onLockResponse={() => { }}
          onEditResponse={() => { }}
        />
      </div>
    </div>
  );
};
