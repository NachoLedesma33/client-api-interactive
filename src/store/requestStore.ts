import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Request, HttpMethod, BodyType } from '@/types/api';
import { db } from '@/db/database';

interface RequestState {
  currentRequest: Request | null;
  requests: Request[];
  recentRequests: Request[];
  isLoading: boolean;
  setCurrentRequest: (request: Request | null) => void;
  clearCurrentRequest: () => void;
  updateCurrentRequestField: <K extends keyof Request>(field: K, value: Request[K]) => void;
  saveCurrentRequest: () => Promise<void>;
  loadRequest: (id: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  duplicateRequest: (id: string) => Promise<void>;
  fetchRecent: (limit: number) => Promise<void>;
  loadAllRequests: () => Promise<void>;
}

export const useRequestStore = create<RequestState>()(
  devtools(
    (set, get) => ({
      currentRequest: null,
      requests: [],
      recentRequests: [],
      isLoading: false,

      setCurrentRequest: (request) => set({ currentRequest: request }),

      clearCurrentRequest: () => set({ currentRequest: null }),

      updateCurrentRequestField: (field, value) => {
        const { currentRequest } = get();
        if (!currentRequest) return;
        set({ currentRequest: { ...currentRequest, [field]: value } });
      },

      saveCurrentRequest: async () => {
        const { currentRequest } = get();
        if (!currentRequest) return;
        set({ isLoading: true });
        try {
          await db.saveRequest(currentRequest);
          set({ currentRequest: { ...currentRequest, lastUsed: new Date().toISOString() } });
          await get().loadAllRequests();
        } finally {
          set({ isLoading: false });
        }
      },

      loadRequest: async (id) => {
        set({ isLoading: true });
        try {
          const requests = await db.requests.toArray();
          const request = requests.find((r) => r.id === id);
          if (request) set({ currentRequest: request });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteRequest: async (id) => {
        set({ isLoading: true });
        try {
          await db.deleteRequest(id);
          const { currentRequest } = get();
          if (currentRequest?.id === id) set({ currentRequest: null });
          await get().loadAllRequests();
        } finally {
          set({ isLoading: false });
        }
      },

      duplicateRequest: async (id) => {
        const requests = await db.requests.toArray();
        const original = requests.find((r) => r.id === id);
        if (!original) return;
        const newRequest: Request = {
          ...original,
          id: crypto.randomUUID(),
          nombre: `${original.nombre} (Copy)`,
          createdAt: new Date().toISOString(),
          lastUsed: null,
        };
        await db.saveRequest(newRequest);
        await get().loadAllRequests();
      },

      fetchRecent: async (limit) => {
        const recent = await db.getRecentRequests(limit);
        set({ recentRequests: recent });
      },

      loadAllRequests: async () => {
        const requests = await db.getAllRequests();
        set({ requests });
      },
    }),
    { name: 'requestStore' }
  )
);