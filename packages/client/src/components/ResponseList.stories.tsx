import { ResponseList } from "./ResponseList";
import { action } from "@storybook/addon-actions";

export default {
  title: "Components/ResponseList",
  component: ResponseList,
  parameters: {
    layout: {
        decorator: false,
    }
  },
};

const mockResponses = [
  {
    responseId: "resp_1",
    status: 200,
    headers: {
      'content-type': 'application/json',
      'content-length': '532',
      'date': new Date().toUTCString()
    },
    body: {
      status: "success",
      data: {
        id: 123,
        name: "Example User",
        email: "user@example.com"
      }
    },
    isLocked: false
  },
  {
    responseId: "resp_2",
    status: 404,
    headers: {
      'content-type': 'application/json',
      'content-length': '89',
      'date': new Date().toUTCString()
    },
    body: {
      status: "error",
      message: "Resource not found"
    },
    isLocked: true,
    lockedBody: {
      status: "error",
      message: "Custom error message"
    }
  },
  {
    responseId: "resp_3",
    status: 500,
    headers: {
      'content-type': 'application/json',
      'content-length': '124',
      'date': new Date().toUTCString()
    },
    body: {
      status: "error",
      message: "Internal server error",
      code: "INTERNAL_ERROR"
    },
    isLocked: false
  }
];

const mockRoute = {
  id: "1",
  path: "/api/users",
  method: "GET",
  hostname: "api.example.com",
  hits: 3,
  timestamp: new Date().toISOString(),
  isLocked: false
};

export const Default = {
  args: {
    route: mockRoute,
    responses: mockResponses,
    method: "GET",
    onLockResponse: action("Lock Response"),
    onEditResponse: action("Edit Response")
  }
}; 