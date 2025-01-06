import { create } from "zustand";
import { ProxyState } from "../types/proxy";

export const useProxyStore = create<ProxyState>()((set) => ({
  events: [],
  selectedEventId: null,
  isConnected: false,
  addEvent: (event) => set((state) => {
    // Check if we already have an event with same project, path and method
    const existingEvent = state.events.findIndex(e => 
      e.projectId === event.projectId && 
      e.path === event.path && 
      e.method === event.method
    );
    
    if (existingEvent === -1) {
      return { events: [event, ...state.events].slice(0, 100) };
    } else {
      const events = [...state.events];
      events[existingEvent].hits++;
      return { events };
    }
  }),
  selectEvent: (id) => set({ selectedEventId: id }),
  // Indicate that the client is connected to the server
  setConnected: (connected) => set({ isConnected: connected }),
  setEvents: (events) => set({ events }),
}));

export default useProxyStore;