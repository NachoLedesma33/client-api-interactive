import { $ as $$BaseLayout } from './BaseLayout_CDTvAxEA.mjs';
import { c as createComponent } from './astro-component_B9QXdNd9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_a4CxbHHH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import Dexie from 'dexie';

class ApiDatabase extends Dexie {
  requests;
  responses;
  collections;
  environments;
  constructor() {
    super("ApiClientDB");
    this.version(1).stores({
      requests: "id, nombre, method, url, createdAt, lastUsed",
      responses: "id, requestId, timestamp",
      collections: "id, nombre, createdAt",
      environments: "id, isActive, nombre"
    });
  }
  async saveRequest(request) {
    return this.requests.put(request);
  }
  async updateRequest(id, changes) {
    return this.requests.update(id, changes);
  }
  async deleteRequest(id) {
    return this.requests.delete(id);
  }
  async getAllRequests() {
    return this.requests.toArray();
  }
  async getRecentRequests(limit) {
    return this.requests.orderBy("lastUsed").reverse().filter((r) => r.lastUsed !== null).limit(limit).toArray();
  }
  async saveResponse(response) {
    return this.responses.put(response);
  }
  async getResponsesForRequest(requestId) {
    return this.responses.where("requestId").equals(requestId).toArray();
  }
  async saveCollection(collection) {
    return this.collections.put(collection);
  }
  async getCollections() {
    return this.collections.toArray();
  }
  async saveEnvironment(environment) {
    return this.environments.put(environment);
  }
  async getActiveEnvironment() {
    return this.environments.filter((e) => e.isActive).first();
  }
  async setActiveEnvironment(id) {
    await this.environments.toCollection().modify({ isActive: false });
    await this.environments.update(id, { isActive: true });
  }
}
let dbInstance = null;
function getDb() {
  if (!dbInstance) {
    dbInstance = new ApiDatabase();
  }
  return dbInstance;
}

const useRequestStore = create()(
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
          await getDb().saveRequest(currentRequest);
          set({ currentRequest: { ...currentRequest, lastUsed: (/* @__PURE__ */ new Date()).toISOString() } });
          await get().loadAllRequests();
        } finally {
          set({ isLoading: false });
        }
      },
      loadRequest: async (id) => {
        set({ isLoading: true });
        try {
          const requests = await getDb().requests.toArray();
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
        const newRequest = {
          ...original,
          id: crypto.randomUUID(),
          nombre: `${original.nombre} (Copy)`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastUsed: null
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
      }
    }),
    { name: "requestStore" }
  )
);

const useCollectionStore = create()(
  devtools(
    (set, get) => ({
      collections: [],
      isLoading: false,
      createCollection: async (nombre, descripcion = "") => {
        set({ isLoading: true });
        const newCollection = {
          id: crypto.randomUUID(),
          nombre,
          descripcion,
          requests: [],
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
          const updated = { ...collection, ...changes, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
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
        const newCollection = {
          ...original,
          id: crypto.randomUUID(),
          nombre: `${original.nombre} (Copy)`,
          requests: [...original.requests],
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await getDb().saveCollection(updated);
        await get().loadCollections();
      },
      loadCollections: async () => {
        set({ isLoading: true });
        const collections = await getDb().getCollections();
        set({ collections, isLoading: false });
      }
    }),
    { name: "collectionStore" }
  )
);

function Sidebar() {
  const { requests, loadAllRequests, fetchRecent } = useRequestStore();
  const { collections, loadCollections } = useCollectionStore();
  useEffect(() => {
    loadAllRequests();
    fetchRecent(10);
    loadCollections();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "w-64 bg-gray-100 border-r border-gray-200 p-4 overflow-y-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("button", { className: "w-full mb-2 px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700", children: "+ New Request" }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-gray-500 uppercase mb-2", children: "Recent" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: requests.slice(0, 5).map((req) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-200 truncate", children: [
        /* @__PURE__ */ jsx("span", { className: `text-xs mr-1 ${req.method === "GET" ? "text-green-600" : req.method === "POST" ? "text-blue-600" : req.method === "PUT" ? "text-orange-600" : req.method === "PATCH" ? "text-purple-600" : "text-red-600"}`, children: req.method }),
        req.nombre
      ] }) }, req.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-gray-500 uppercase mb-2", children: "Collections" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: collections.map((col) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-200", children: [
        "📁 ",
        col.nombre
      ] }) }, col.id)) })
    ] })
  ] });
}

const buildHeaders = (headers, body, bodyType) => {
  const result = { ...headers };
  if (bodyType === "json") result["Content-Type"] = "application/json";
  if (bodyType === "x-www-form-urlencoded") result["Content-Type"] = "application/x-www-form-urlencoded";
  if (bodyType === "form-data") delete result["Content-Type"];
  return result;
};
const buildBody = (body, bodyType) => {
  if (bodyType === "json" || bodyType === "x-www-form-urlencoded") return body;
  if (bodyType === "form-data" && typeof body === "object") return body;
  return void 0;
};
const useResponseStore = create()(
  subscribeWithSelector(
    (set, get) => ({
      currentResponse: null,
      responseHistory: [],
      isFetching: false,
      error: null,
      sendRequest: async (request) => {
        set({ isFetching: true, error: null });
        const startTime = performance.now();
        try {
          const headers = buildHeaders(request.headers, request.body, request.bodyType);
          const body = buildBody(request.body, request.bodyType);
          const fetchOptions = {
            method: request.method,
            headers
          };
          if (request.method !== "GET" && request.method !== "HEAD" && body && request.bodyType !== "none") {
            fetchOptions.body = typeof body === "object" ? JSON.stringify(body) : body;
          }
          const res = await fetch(request.url, fetchOptions);
          const duration = Math.round(performance.now() - startTime);
          const resHeaders = {};
          res.headers.forEach((value, key) => {
            resHeaders[key] = value;
          });
          let data;
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            data = await res.json();
          } else {
            data = await res.text();
          }
          const response = {
            id: crypto.randomUUID(),
            requestId: request.id,
            status: res.status,
            statusText: res.statusText,
            data,
            headers: resHeaders,
            duration,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          await getDb().saveResponse(response);
          set({ currentResponse: response, isFetching: false });
          const { responseHistory } = get();
          set({ responseHistory: [response, ...responseHistory].slice(0, 100) });
          return response;
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : "Request failed";
          set({ error: errorMsg, isFetching: false });
          return null;
        }
      },
      saveResponseToHistory: (response) => {
        const { responseHistory } = get();
        const exists = responseHistory.find((r) => r.id === response.id);
        if (!exists) {
          set({ responseHistory: [response, ...responseHistory].slice(0, 100) });
        }
      },
      clearCurrentResponse: () => set({ currentResponse: null, error: null }),
      clearHistory: () => set({ responseHistory: [] }),
      exportResponses: () => {
        const { responseHistory } = get();
        const blob = new Blob([JSON.stringify(responseHistory, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `api-responses-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      compareResponses: (idA, idB) => {
        const { responseHistory } = get();
        const resA = responseHistory.find((r) => r.id === idA);
        const resB = responseHistory.find((r) => r.id === idB);
        if (!resA || !resB) return null;
        const statusDiff = resA.status !== resB.status;
        const bodyDiff = JSON.stringify(resA.data) !== JSON.stringify(resB.data);
        const headersDiff = JSON.stringify(resA.headers) !== JSON.stringify(resB.headers);
        return { statusDiff, bodyDiff, headersDiff };
      },
      loadHistoryForRequest: async (requestId) => {
        const responses = await getDb().getResponsesForRequest(requestId);
        set({ responseHistory: responses.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ) });
      }
    }),
    {
      name: "responseStore",
      partialize: (state) => ({
        currentResponse: state.currentResponse,
        responseHistory: state.responseHistory
      })
    }
  )
);
if (process.env.NODE_ENV === "development") {
  useResponseStore.subscribe(
    (state) => state.error,
    (error) => {
      if (error) console.error("[ResponseStore]", error);
    }
  );
}

const resolve = (text, vars) => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}`);
};
const useEnvironmentStore = create()(
  devtools(
    (set, get) => ({
      environments: [],
      activeEnvId: null,
      isLoading: false,
      createEnv: async (nombre, variables = {}) => {
        set({ isLoading: true });
        const newEnv = {
          id: crypto.randomUUID(),
          nombre,
          variables,
          isActive: false
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
          environments: envs.map((e) => ({ ...e, isActive: e.id === id }))
        });
      },
      importEnvs: async (json) => {
        set({ isLoading: true });
        try {
          const imported = JSON.parse(json);
          for (const env of imported) {
            const newEnv = {
              ...env,
              id: crypto.randomUUID(),
              isActive: false
            };
            await getDb().saveEnvironment(newEnv);
          }
        } catch {
        }
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
          isLoading: false
        });
      }
    }),
    { name: "environmentStore" }
  )
);

function RequestEditor() {
  const { currentRequest, setCurrentRequest, updateCurrentRequestField, saveCurrentRequest, clearCurrentRequest } = useRequestStore();
  const { sendRequest, isFetching, error } = useResponseStore();
  const { resolveVariables } = useEnvironmentStore();
  const [localRequest, setLocalRequest] = useState({
    method: "GET",
    url: "",
    nombre: "New Request",
    headers: {},
    body: null,
    bodyType: "none"
  });
  useEffect(() => {
    if (currentRequest) {
      setLocalRequest(currentRequest);
    } else {
      setLocalRequest({
        method: "GET",
        url: "",
        nombre: "New Request",
        headers: {},
        body: null,
        bodyType: "none"
      });
    }
  }, [currentRequest]);
  const handleFieldChange = (field, value) => {
    setLocalRequest((prev) => ({ ...prev, [field]: value }));
    if (currentRequest) {
      updateCurrentRequestField(field, value);
    }
  };
  const handleSend = async () => {
    const req = {
      id: currentRequest?.id || crypto.randomUUID(),
      nombre: localRequest.nombre || "New Request",
      method: localRequest.method,
      url: resolveVariables(localRequest.url || ""),
      headers: localRequest.headers,
      body: localRequest.body,
      bodyType: localRequest.bodyType,
      createdAt: currentRequest?.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      lastUsed: currentRequest?.lastUsed || null
    };
    setCurrentRequest(req);
    await sendRequest(req);
    await saveCurrentRequest();
  };
  const handleSave = async () => {
    const req = {
      id: currentRequest?.id || crypto.randomUUID(),
      nombre: localRequest.nombre || "New Request",
      method: localRequest.method,
      url: localRequest.url || "",
      headers: localRequest.headers,
      body: localRequest.body,
      bodyType: localRequest.bodyType,
      createdAt: currentRequest?.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      lastUsed: currentRequest?.lastUsed || null
    };
    setCurrentRequest(req);
    await saveCurrentRequest();
  };
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const bodyTypes = ["none", "json", "form-data", "x-www-form-urlencoded"];
  return /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white border-b border-gray-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-3", children: [
      /* @__PURE__ */ jsx(
        "select",
        {
          value: localRequest.method,
          onChange: (e) => handleFieldChange("method", e.target.value),
          className: "px-3 py-2 border border-gray-300 rounded text-sm font-medium",
          children: methods.map((m) => /* @__PURE__ */ jsx("option", { value: m, children: m }, m))
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "URL",
          value: localRequest.url || "",
          onChange: (e) => handleFieldChange("url", e.target.value),
          className: "flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSend,
          disabled: isFetching || !localRequest.url,
          className: "px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50",
          children: isFetching ? "..." : "Send"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSave,
          className: "px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700",
          children: "Save"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-500 text-xs mb-1", children: "Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: localRequest.nombre || "",
            onChange: (e) => handleFieldChange("nombre", e.target.value),
            className: "px-2 py-1 border border-gray-300 rounded text-sm w-40"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-500 text-xs mb-1", children: "Body Type" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: localRequest.bodyType,
            onChange: (e) => handleFieldChange("bodyType", e.target.value),
            className: "px-2 py-1 border border-gray-300 rounded text-sm",
            children: bodyTypes.map((bt) => /* @__PURE__ */ jsx("option", { value: bt, children: bt }, bt))
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "text-red-600 text-sm", children: error })
    ] })
  ] });
}

function ResponsePanel() {
  const { currentResponse, isFetching, error } = useResponseStore();
  if (isFetching) {
    return /* @__PURE__ */ jsx("div", { className: "flex-1 p-4 bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-gray-500", children: "Loading..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "flex-1 p-4 bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "text-red-600", children: [
      "Error: ",
      error
    ] }) });
  }
  if (!currentResponse) {
    return /* @__PURE__ */ jsx("div", { className: "flex-1 p-4 bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Enter a URL and click Send" }) });
  }
  const statusColor = currentResponse.status >= 200 && currentResponse.status < 300 ? "text-green-600" : currentResponse.status >= 300 && currentResponse.status < 400 ? "text-yellow-600" : "text-red-600";
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col bg-gray-50 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 bg-white border-b border-gray-200 flex items-center gap-4 text-sm", children: [
      /* @__PURE__ */ jsxs("span", { className: `font-medium ${statusColor}`, children: [
        currentResponse.status,
        " ",
        currentResponse.statusText
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
        currentResponse.duration,
        "ms"
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: new Date(currentResponse.timestamp).toLocaleTimeString() })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-gray-500 uppercase mb-2", children: "Response Body" }),
        /* @__PURE__ */ jsx("pre", { className: "bg-white p-3 rounded border border-gray-200 text-sm overflow-x-auto", children: typeof currentResponse.data === "string" ? currentResponse.data : JSON.stringify(currentResponse.data, null, 2) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-gray-500 uppercase mb-2", children: "Headers" }),
        /* @__PURE__ */ jsx("div", { className: "bg-white p-3 rounded border border-gray-200 text-sm", children: Object.entries(currentResponse.headers).map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "mb-1", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            key,
            ":"
          ] }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-800", children: value })
        ] }, key)) })
      ] })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "API Client - Cyber Glass" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex h-[calc(100vh-6rem)] gap-6" id="app-root"> <aside class="hidden md:block w-72 shrink-0 bg-white/40 dark:bg-cyber-surface/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-glass overflow-hidden flex flex-col transition-all duration-300"> ${renderComponent($$result2, "Sidebar", Sidebar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/Sidebar.tsx", "client:component-export": "Sidebar" })} </aside> <div class="flex-1 flex flex-col gap-6 min-w-0"> <div class="bg-white/40 dark:bg-cyber-surface/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-glass overflow-hidden transition-all duration-300"> ${renderComponent($$result2, "RequestEditor", RequestEditor, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/RequestEditor.tsx", "client:component-export": "RequestEditor" })} </div> <div class="flex-1 bg-white/40 dark:bg-cyber-surface/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-glass overflow-hidden flex flex-col transition-all duration-300 relative"> ${renderComponent($$result2, "ResponsePanel", ResponsePanel, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ResponsePanel.tsx", "client:component-export": "ResponsePanel" })} </div> </div> </div> ` })}`;
}, "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/index.astro", void 0);

const $$file = "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
