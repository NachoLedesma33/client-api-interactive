import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Collection } from '@/types/api';
import { getDb } from '@/db/database';

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;
  createCollection: (nombre: string, descripcion?: string) => Promise<void>;
  updateCollection: (id: string, changes: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  duplicateCollection: (id: string) => Promise<void>;
  addRequestToCollection: (colId: string, reqId: string) => Promise<void>;
  removeRequestFromCollection: (colId: string, reqId: string) => Promise<void>;
  loadCollections: () => Promise<void>;
}

export const useCollectionStore = create<CollectionState>()(
  devtools(
    (set, get) => ({
      collections: [],
      isLoading: false,

  createCollection: async (nombre, descripcion = '') => {
    set({ isLoading: true });
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      nombre,
      descripcion,
      requests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await getDb().saveCollection(newCollection);
    await get().loadCollections();
    set({ isLoading: false });
  },

  updateCollection: async (id, changes) => {
    set({ isLoading: true });
    const collections = await getDb().getCollections();
    const collection = collections.find((c) => c.id === id);
    if (collection) {
      const updated = { ...collection, ...changes, updatedAt: new Date().toISOString() };
      await getDb().saveCollection(updated);
    }
    await get().loadCollections();
    set({ isLoading: false });
  },

  deleteCollection: async (id) => {
    set({ isLoading: true });
    await getDb().collections.delete(id);
    await get().loadCollections();
    set({ isLoading: false });
  },

  duplicateCollection: async (id) => {
    const collections = await getDb().getCollections();
    const original = collections.find((c) => c.id === id);
    if (!original) return;
    const newCollection: Collection = {
      ...original,
      id: crypto.randomUUID(),
      nombre: `${original.nombre} (Copy)`,
      requests: [...original.requests],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await getDb().saveCollection(newCollection);
    await get().loadCollections();
  },

  addRequestToCollection: async (colId, reqId) => {
    const collections = await getDb().getCollections();
    const collection = collections.find((c) => c.id === colId);
    if (!collection || collection.requests.includes(reqId)) return;
    const updated = {
      ...collection,
      requests: [...collection.requests, reqId],
      updatedAt: new Date().toISOString(),
    };
    await getDb().saveCollection(updated);
    await get().loadCollections();
  },

  removeRequestFromCollection: async (colId, reqId) => {
    const collections = await getDb().getCollections();
    const collection = collections.find((c) => c.id === colId);
    if (!collection) return;
    const updated = {
      ...collection,
      requests: collection.requests.filter((r) => r !== reqId),
      updatedAt: new Date().toISOString(),
    };
    await getDb().saveCollection(updated);
    await get().loadCollections();
  },

  loadCollections: async () => {
    set({ isLoading: true });
    const collections = await getDb().getCollections();
    set({ collections, isLoading: false });
  },
    }),
    { name: 'collectionStore' }
  )
);