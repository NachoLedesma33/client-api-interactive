import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Environment } from '@/types/api';
import { getDb } from '@/db/database';

interface EnvironmentState {
  environments: Environment[];
  activeEnvId: string | null;
  isLoading: boolean;
  createEnv: (nombre: string, variables?: Record<string, string>) => Promise<void>;
  updateEnv: (id: string, changes: Partial<Environment>) => Promise<void>;
  deleteEnv: (id: string) => Promise<void>;
  setActiveEnv: (id: string | null) => Promise<void>;
  importEnvs: (json: string) => Promise<void>;
  exportEnvs: () => string;
  resolveVariables: (text: string) => string;
  loadEnvironments: () => Promise<void>;
}

const resolve = (text: string, vars: Record<string, string>): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}`);
};

export const useEnvironmentStore = create<EnvironmentState>()(
  devtools(
    (set, get) => ({
      environments: [],
      activeEnvId: null,
      isLoading: false,

  createEnv: async (nombre, variables = {}) => {
    set({ isLoading: true });
    const newEnv: Environment = {
      id: crypto.randomUUID(),
      nombre,
      variables,
      isActive: false,
    };
    await getDb().saveEnvironment(newEnv);
    await get().loadEnvironments();
    set({ isLoading: false });
  },

  updateEnv: async (id, changes) => {
    set({ isLoading: true });
    const envs = await getDb().environments.toArray();
    const env = envs.find((e) => e.id === id);
    if (env) {
      const updated = { ...env, ...changes };
      await getDb().saveEnvironment(updated);
    }
    await get().loadEnvironments();
    set({ isLoading: false });
  },

  deleteEnv: async (id) => {
    set({ isLoading: true });
    await getDb().environments.delete(id);
    const { activeEnvId } = get();
    if (activeEnvId === id) set({ activeEnvId: null });
    await get().loadEnvironments();
    set({ isLoading: false });
  },

  setActiveEnv: async (id) => {
    if (id) await getDb().setActiveEnvironment(id);
    set({ activeEnvId: id });
    const envs = await getDb().environments.toArray();
    set({
      environments: envs.map((e) => ({ ...e, isActive: e.id === id })),
    });
  },

  importEnvs: async (json) => {
    set({ isLoading: true });
    try {
      const imported: Environment[] = JSON.parse(json);
      for (const env of imported) {
        const newEnv: Environment = {
          ...env,
          id: crypto.randomUUID(),
          isActive: false,
        };
        await getDb().saveEnvironment(newEnv);
      }
    } catch {}
    await get().loadEnvironments();
    set({ isLoading: false });
  },

  exportEnvs: () => {
    const { environments } = get();
    return JSON.stringify(environments, null, 2);
  },

  resolveVariables: (text) => {
    const { environments, activeEnvId } = get();
    const active = environments.find((e) => e.id === activeEnvId);
    if (!active) return text;
    return resolve(text, active.variables);
  },

  loadEnvironments: async () => {
    set({ isLoading: true });
    const environments = await getDb().environments.toArray();
    const active = environments.find((e) => e.isActive);
    set({
      environments,
      activeEnvId: active?.id || null,
      isLoading: false,
    });
  },
    }),
    { name: 'environmentStore' }
  )
);