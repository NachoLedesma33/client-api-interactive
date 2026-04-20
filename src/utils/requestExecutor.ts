import type { Request, Response, Environment, HttpMethod, BodyType } from '@/types/api';

export interface ExecutorOptions {
  timeout?: number;
  environment?: Environment | null;
}

const DEFAULT_TIMEOUT = 30000;

const resolve = (text: string, vars: Record<string, string>): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
};

const resolveObject = (
  obj: Record<string, string>,
  vars: Record<string, string>
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolve(value, vars);
  }
  return result;
};

const buildHeaders = (
  headers: Record<string, string>,
  body: unknown,
  bodyType: BodyType
): Record<string, string> => {
  const result: Record<string, string> = { ...headers };
  
  if (bodyType === 'json' && body !== null && body !== undefined) {
    result['Content-Type'] = 'application/json';
  } else if (bodyType === 'x-www-form-urlencoded') {
    result['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  
  return result;
};

const buildBody = (body: unknown, bodyType: BodyType): BodyInit | undefined => {
  if (body === null || body === undefined) {
    return undefined;
  }
  
  if (bodyType === 'json') {
    return typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  if (bodyType === 'x-www-form-urlencoded') {
    if (typeof body === 'string') {
      return body;
    }
    if (typeof body === 'object' && body !== null) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
        params.append(key, String(value));
      }
      return params.toString();
    }
  }
  
  if (bodyType === 'form-data') {
    if (body instanceof FormData) {
      return body;
    }
    if (typeof body === 'object' && body !== null) {
      const formData = new FormData();
      for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
        formData.append(key, String(value));
      }
      return formData;
    }
  }
  
  return undefined;
};

export async function executeRequest(
  request: Request,
  options: ExecutorOptions = {}
): Promise<Response> {
  const startTime = performance.now();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const vars = options.environment?.variables ?? {};

  const requestId = request.id;
  const url = resolve(request.url, vars);
  const method = request.method as HttpMethod;
  const headers = resolveObject(request.headers, vars);
  const bodyType = request.bodyType as BodyType;
  const body = request.body;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchHeaders = buildHeaders(headers, body, bodyType);
    const fetchBody = buildBody(body, bodyType);

    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
      signal: controller.signal,
    };

    if (method !== 'GET' && method !== 'HEAD' && fetchBody !== undefined) {
      fetchOptions.body = fetchBody;
    }

    const fetchResponse = await fetch(url, fetchOptions);
    const duration = Math.round(performance.now() - startTime);

    clearTimeout(timeoutId);

    const responseHeaders: Record<string, string> = {};
    fetchResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: unknown;
    const contentType = fetchResponse.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      data = await fetchResponse.json();
    } else if (contentType.includes('text/') || contentType.includes('xml') || contentType.includes('html')) {
      data = await fetchResponse.text();
    } else {
      const text = await fetchResponse.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    return {
      id: crypto.randomUUID(),
      requestId,
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      data,
      headers: responseHeaders,
      duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);

    let errorMessage = 'Unknown error';
    let status = 0;
    let statusText = 'Error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = `Request timed out after ${timeout}ms`;
        statusText = 'Timeout';
        status = 408;
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error: Could not connect to the server';
        statusText = 'Network Error';
        status = 0;
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: Cross-origin request blocked';
        statusText = 'CORS Error';
        status = 0;
      } else {
        errorMessage = error.message;
      }
    }

    return {
      id: crypto.randomUUID(),
      requestId,
      status,
      statusText,
      data: { error: errorMessage },
      headers: {},
      duration,
      timestamp: new Date().toISOString(),
    };
  }
}

export function cancelRequest(): void {
}