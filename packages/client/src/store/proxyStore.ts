import { create } from "zustand";
import { ProxyEvent, ProxyState } from "../types/proxy";

export const useProxyStore = create<ProxyState>()((set, get) => ({
  events: [],
  incomingEventId: null,
  isConnected: false,
  getEvent: (id: string) => get().events.find(event => event.id === id),
  updateEvent: (event: ProxyEvent) => set((state) => {
    const existingEvent = state.events.findIndex(e => e.id === event.id);
    if (existingEvent !== -1) {
      state.events[existingEvent] = event;
    }
    return { events: state.events };
  }),
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
      events[existingEvent] = {
        ...events[existingEvent],
        hits: events[existingEvent].hits + 1,
        responses: event.responses
      };
      return { events };
    }
  }),
  setIncomingEventId: (id) => set({ incomingEventId: id }),
  // Indicate that the client is connected to the server
  setConnected: (connected) => set({ isConnected: connected }),
  setEvents: (events) => set({ events }),
}));

export default useProxyStore;