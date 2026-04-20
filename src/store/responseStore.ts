import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Request, Response, HttpMethod, BodyType } from '@/types/api';
import { db } from '@/db/database';

interface ResponseState {
  currentResponse: Response | null;
  responseHistory: Response[];
  isFetching: boolean;
  error: string | null;
  sendRequest: (request: Request) => Promise<Response | null>;
  saveResponseToHistory: (response: Response) => void;
  clearCurrentResponse: () => void;
  clearHistory: () => void;
  exportResponses: () => void;
  compareResponses: (idA: string, idB: string) => { statusDiff: boolean; bodyDiff: boolean; headersDiff: boolean } | null;
  loadHistoryForRequest: (requestId: string) => Promise<void>;
}

const buildHeaders = (headers: Record<string, string>, body: unknown, bodyType: BodyType): RequestInit['headers'] => {
  const result: Record<string, string> = { ...headers };
  if (bodyType === 'json') result['Content-Type'] = 'application/json';
  if (bodyType === 'x-www-form-urlencoded') result['Content-Type'] = 'application/x-www-form-urlencoded';
  if (bodyType === 'form-data') delete result['Content-Type'];
  return result;
};

const buildBody = (body: unknown, bodyType: BodyType): unknown => {
  if (bodyType === 'json' || bodyType === 'x-www-form-urlencoded') return body;
  if (bodyType === 'form-data' && typeof body === 'object') return body;
  return undefined;
};

export const useResponseStore = create<ResponseState>()(
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
          
          const fetchOptions: RequestInit = {
            method: request.method,
            headers,
          };
          
          if (request.method !== 'GET' && request.method !== 'HEAD' && body && request.bodyType !== 'none') {
            fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : (body as string);
          }

          const res = await fetch(request.url, fetchOptions);
          const duration = Math.round(performance.now() - startTime);
          
          const resHeaders: Record<string, string> = {};
          res.headers.forEach((value, key) => { resHeaders[key] = value; });
          
          let data: unknown;
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            data = await res.json();
          } else {
            data = await res.text();
          }

          const response: Response = {
            id: crypto.randomUUID(),
            requestId: request.id,
            status: res.status,
            statusText: res.statusText,
            data,
            headers: resHeaders,
            duration,
            timestamp: new Date().toISOString(),
          };

          await db.saveResponse(response);
          set({ currentResponse: response, isFetching: false });
          
          const { responseHistory } = get();
          set({ responseHistory: [response, ...responseHistory].slice(0, 100) });
          
          return response;
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Request failed';
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
        const blob = new Blob([JSON.stringify(responseHistory, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
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
        const responses = await db.getResponsesForRequest(requestId);
        set({ responseHistory: responses.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )});
      },
    }),
    {
      name: 'responseStore',
      partialize: (state) => ({ 
        currentResponse: state.currentResponse,
        responseHistory: state.responseHistory 
      }),
    }
  )
);

if (process.env.NODE_ENV === 'development') {
  useResponseStore.subscribe(
    (state) => state.error,
    (error) => { if (error) console.error('[ResponseStore]', error); }
  );
}