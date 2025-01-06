import { create } from "zustand";
import { ProxyState } from "../types/proxy";

export const useProxyStore = create<ProxyState>()((set) => ({
  events: [],
  selectedEventId: null,
  isConnected: false,
  addEvent: (event) => set((state) => {
    // Check if we already have an event with same project, path and method
    const exists = state.events.some(e => 
      e.projectId === event.projectId && 
      e.path === event.path && 
      e.method === event.method
    );
    
    if (!exists) {
      return { events: [event, ...state.events].slice(0, 100) };
    }
    return state;
  }),
  selectEvent: (id) => set({ selectedEventId: id }),
  // Indicate that the client is connected to the server
  setConnected: (connected) => set({ isConnected: connected }),
}));

export default useProxyStore;