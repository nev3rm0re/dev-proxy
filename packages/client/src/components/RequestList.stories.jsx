import { RequestList } from "./RequestList";

export default {
  title: "Components/RequestList",
  component: RequestList,
  parameters: {
    layout: "fullscreen",
    // Optionally disable the Layout wrapper for this story
    // decorator: false,
  },
};

const mockEvents = [
  {
    id: "1",
    path: "/api/users",
    method: "GET",
    hostname: "api.example.com",
    hits: 5,
    isLocked: false,
    responses: [
      {
        id: "resp1",
        body: '{"status": "success"}',
        isLocked: false,
        status: 200,
        headers: {
          "content-type": "application/json",
          "content-length": "123",
        },
      },
    ],
  },
  {
    id: "2",
    path: "/api/posts",
    method: "POST",
    hostname: "api.example.com",
    hits: 3,
    isLocked: true,
    responses: [],
  },
];

export const Default = {
  args: {
    events: mockEvents,
    incomingEventId: null,
    onLockEvent: (eventId) => console.log("Lock event:", eventId),
    onLockResponse: (eventId, responseId) =>
      console.log("Lock response:", eventId, responseId),
    onEditResponse: (eventId, responseId, newBody) =>
      console.log("Edit response:", eventId, responseId, newBody),
  },
};

export const WithIncomingEvent = {
  args: {
    ...Default.args,
    incomingEventId: "1",
  },
};
