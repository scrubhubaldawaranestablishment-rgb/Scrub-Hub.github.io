import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, type User, type Channel } from "./api-client";

interface AppState {
  user: User | null;
  token: string | null;
  activeChannel: Channel | null;
  channels: Channel[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  setChannels: (channels: Channel[]) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadChannels: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeChannel: null,
      channels: [],

      setUser: (user) => set({ user }),
      setToken: (token) => {
        api.setToken(token);
        set({ token });
      },
      setActiveChannel: (channel) => set({ activeChannel: channel }),
      setChannels: (channels) => set({ channels }),

      login: async (email, password) => {
        const { user, token } = await api.login(email, password);
        api.setToken(token);
        set({ user, token });
        await get().loadChannels();
      },

      register: async (email, password, name) => {
        const { user, token } = await api.register(email, password, name);
        api.setToken(token);
        set({ user, token });
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
          // ignore
        }
        api.setToken(null);
        set({ user: null, token: null, activeChannel: null, channels: [] });
      },

      loadChannels: async () => {
        const channels = await api.getChannels();
        const active = get().activeChannel;
        const activeChannel = active
          ? channels.find((c) => c.id === active.id) || channels[0] || null
          : channels[0] || null;
        set({ channels, activeChannel });
      },

      hydrate: async () => {
        const token = get().token || api.getToken();
        if (!token) return;
        api.setToken(token);
        try {
          const { user } = await api.me();
          set({ user, token });
          await get().loadChannels();
        } catch {
          api.setToken(null);
          set({ user: null, token: null, activeChannel: null, channels: [] });
        }
      },
    }),
    {
      name: "creatorpilot-store",
      partialize: (state) => ({ token: state.token, activeChannel: state.activeChannel }),
    },
  ),
);
