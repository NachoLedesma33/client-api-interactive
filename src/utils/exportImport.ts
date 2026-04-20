import type { Request, Collection, Environment } from '@/types/api';

export const exportToJson = <T,>(data: T, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromJson = async <T,>(file: File): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data as T);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

interface OpenAPIPath {
  summary?: string;
  description?: string;
  parameters?: { name: string; in: string; required?: boolean; schema?: { type: string } }[];
  requestBody?: {
    content?: Record<string, { schema?: { type: string }; example?: unknown };
  };
}

interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string };
  paths?: Record<string, { get?: OpenAPIPath; post?: OpenAPIPath; put?: OpenAPIPath; patch?: OpenAPIPath; delete?: OpenAPIPath }>;
  components?: { schemas?: Record<string, { type: string; properties?: Record<string, { type: string }> } };
}

const methodMap: Record<string, 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'> = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
};

export const exportToOpenApi = (requests: Request[], title = 'API', version = '1.0.0'): string => {
  const paths: Record<string, Record<string, OpenAPIPath>> = {};

  for (const req of requests) {
    const url = req.url.replace(/^https?:\/\/[^\/]+/, '');
    if (!url) continue;

    const pathItem = paths[url] || {};
    const method = methodMap[req.method.toLowerCase()] || 'GET';

    const path: OpenAPIPath = {
      summary: req.nombre,
      parameters: [],
      requestBody: undefined,
    };

    if (req.bodyType !== 'none' && req.body) {
      const contentType = req.bodyType === 'json' ? 'application/json' : 'application/x-www-form-urlencoded';
      path.requestBody = {
        content: {
          [contentType]: {
            schema: { type: req.bodyType === 'json' ? 'object' : 'string' },
            example: req.body,
          },
        },
      };
    }

    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'content-type') {
        continue;
      }
      path.parameters!.push({
        name: key,
        in: 'header',
        required: false,
        schema: { type: 'string' },
      });
    }

    pathItem[method.toLowerCase()] = path;
    paths[url] = pathItem;
  }

  const spec: OpenAPISpec = {
    openapi: '3.0.3',
    info: { title, version },
    paths,
  };

  return JSON.stringify(spec, null, 2);
};

export const importFromOpenApi = (json: string): Request[] => {
  const spec: OpenAPISpec = JSON.parse(json);
  const requests: Request[] = [];

  if (!spec.paths) return requests;

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [methodKey, methodObj] of Object.entries(methods)) {
      if (!methodObj || methodKey === 'parameters') continue;

      const method = methodKey.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) continue;

      const headers: Record<string, string> = {};
      if (methodObj.parameters) {
        for (const param of methodObj.parameters) {
          if (param.in === 'header') {
            headers[param.name] = '';
          }
        }
      }

      let body: unknown = null;
      let bodyType: 'none' | 'json' | 'x-www-form-urlencoded' = 'none';
      if (methodObj.requestBody?.content) {
        const content = methodObj.requestBody.content;
        if (content['application/json']) {
          bodyType = 'json';
          body = content['application/json']?.example;
        } else if (content['application/x-www-form-urlencoded']) {
          bodyType = 'x-www-form-urlencoded';
          body = content['application/x-www-form-urlencoded']?.example;
        }
      }

      requests.push({
        id: crypto.randomUUID(),
        nombre: methodObj.summary || path,
        method,
        url: 'https://example.com' + path,
        headers,
        body,
        bodyType,
        createdAt: new Date().toISOString(),
        lastUsed: null,
      });
    }
  }

  return requests;
};

interface PostmanItem {
  name: string;
  request: {
    method: string;
    url: { raw: string; query?: { key: string; value: string }[] };
    header?: { key: string; value: string }[];
    body?: { mode: string; raw: string };
  };
}

interface PostmanCollection {
  info: { name: string; schema: string };
  item: PostmanItem[];
  variable?: { key: string; value: string }[];
}

export const exportToPostman = (collection: Collection, requests: Request[]): string => {
  const items: PostmanItem[] = [];

  for (const reqId of collection.requests) {
    const req = requests.find((r) => r.id === reqId);
    if (!req) continue;

    const queryParams: { key: string; value: string }[] = [];
    try {
      const url = new URL(req.url);
      url.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
      });
    } catch {}

    const headers: { key: string; value: string }[] = [];
    for (const [key, value] of Object.entries(req.headers)) {
      headers.push({ key, value });
    }

    let bodyMode: string | undefined;
    let bodyRaw: string | undefined;
    if (req.bodyType !== 'none' && req.body) {
      bodyMode = req.bodyType === 'json' ? 'raw' : 'raw';
      bodyRaw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    items.push({
      name: req.nombre,
      request: {
        method: req.method,
        url: { raw: req.url, query: queryParams.length > 0 ? queryParams : undefined },
        header: headers.length > 0 ? headers : undefined,
        body: bodyMode ? { mode: bodyMode, raw: bodyRaw! } : undefined,
      },
    });
  }

  const postmanCollection: PostmanCollection = {
    info: { name: collection.nombre, schema: 'https://schema.getpostman.org/json/collection/v2.1.0/collection.json' },
    item: items,
  };

  return JSON.stringify(postmanCollection, null, 2);
};

export const importFromPostman = (json: string): { collection: Partial<Collection>; requests: Request[] } => {
  const postman: PostmanCollection = JSON.parse(json);

  const requests: Request[] = [];
  for (const item of postman.item) {
    const url = item.request.url?.raw || '';
    const method = (item.request.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

    const headers: Record<string, string> = {};
    if (item.request.header) {
      for (const h of item.request.header) {
        headers[h.key] = h.value;
      }
    }

    let body: unknown = null;
    let bodyType: 'none' | 'json' | 'x-www-form-urlencoded' = 'none';
    if (item.request.body?.raw) {
      bodyType = 'json';
      try {
        body = JSON.parse(item.request.body.raw);
      } catch {
        body = item.request.body.raw;
      }
    }

    const queryParams: Record<string, string> = {};
    if (item.request.url?.query) {
      for (const q of item.request.url.query) {
        queryParams[q.key] = q.value;
      }
    }

    requests.push({
      id: crypto.randomUUID(),
      nombre: item.name,
      method,
      url: url + '?' + new URLSearchParams(queryParams).toString(),
      headers,
      body,
      bodyType,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    });
  }

  const collection: Partial<Collection> = {
    id: crypto.randomUUID(),
    nombre: postman.info?.name || 'Imported Collection',
    descripcion: '',
    requests: requests.map((r) => r.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { collection, requests };
};

export const exportAll = (
  requests: Request[],
  collections: Collection[],
  environments: Environment[]
): string => {
  return JSON.stringify({ requests, collections, environments }, null, 2);
};

export const importAll = (json: string): { requests: Request[]; collections: Collection[]; environments: Environment[] } => {
  const data = JSON.parse(json);
  return {
    requests: data.requests || [],
    collections: data.collections || [],
    environments: data.environments || [],
  };
};