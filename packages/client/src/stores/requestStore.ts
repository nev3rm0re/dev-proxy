import { create } from "zustand";
import type { EventResponseSent } from "@/types/proxy";

interface RequestStore {
  sendRequest: (data: EventResponseSent) => Promise<void>;
}

export const useRequestStore = create<RequestStore>(() => ({
  sendRequest: async (data) => {
    try {
      const response = await fetch(data.targetUrl, {
        method: data.method,
        headers: data.requestHeaders,
        body: data.method !== "GET" ? data.requestBody : undefined,
      });

      // Handle response as needed
      const responseData = await response.json();
      console.log("Response:", responseData);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  },
}));
