import { create } from "zustand";
import { ProxyState } from "../types/proxy";

export const useProxyStore = create<ProxyState>()((set, get) => ({
  events: [],
  incomingEventId: null,
  isConnected: false,
  addEvent: (event) => set((state) => {
    const { setIncomingEventId } = get();
    setIncomingEventId(null);
    
    const existingEvent = state.events.findIndex(e => 
      e.hostname === event.hostname && 
      e.path === event.path && 
      e.method === event.method
    );
    
    if (existingEvent === -1) {
      setIncomingEventId(event.path);
      return { events: [event, ...state.events].slice(0, 100) };
    } else {
      setIncomingEventId(state.events[existingEvent].path);
      const events = [...state.events];
      events[existingEvent].hits++;
      return { events };
    }
  }),
  setIncomingEventId: (id) => set({ incomingEventId: id }),
  // Indicate that the client is connected to the server
  setConnected: (connected) => set({ isConnected: connected }),
  setEvents: (events) => set({ events }),
}));

export default useProxyStore;