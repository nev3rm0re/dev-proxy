import { create } from "zustand";
import { ProxyState } from "../types/proxy";

export const useProxyStore = create<ProxyState>()((set) => ({
  events: [],
  selectedEventId: null,
  isConnected: false,
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 100) })),
  selectEvent: (id) => set({ selectedEventId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
}));

export default useProxyStore;