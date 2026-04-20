import type { Request, HttpMethod, BodyType } from '@/types/api';

const escapeShell = (value: string): string => {
  if (!value) return '';
  if (/^[a-zA-Z0-9_.-]+$/.test(value)) return value;
  return "'" + value.replace(/'/g, "'\\''") + "'";
};

export const requestToCurl = (request: Request): string => {
  const parts: string[] = ['curl'];

  if (request.method !== 'GET') {
    parts.push(`-X ${request.method}`);
  }

  for (const [key, value] of Object.entries(request.headers)) {
    if (key && value !== undefined && value !== '') {
      parts.push(`-H ${escapeShell(key + ': ' + value)}`);
    }
  }

  const url = request.url;
  parts.push(escapeShell(url));

  if (request.body !== null && request.body !== undefined) {
    const bodyType = request.bodyType as BodyType;
    let bodyStr: string;

    if (bodyType === 'json') {
      bodyStr = typeof request.body === 'string' 
        ? request.body 
        : JSON.stringify(request.body);
    } else if (bodyType === 'x-www-form-urlencoded') {
      if (typeof request.body === 'string') {
        bodyStr = request.body;
      } else if (typeof request.body === 'object' && request.body !== null) {
        const params = new URLSearchParams(request.body as Record<string, string>);
        bodyStr = params.toString();
      } else {
        bodyStr = '';
      }
    } else {
      bodyStr = typeof request.body === 'string' ? request.body : String(request.body);
    }

    if (bodyStr && request.method !== 'GET' && request.method !== 'HEAD') {
      parts.splice(parts.length - 1, 0, `--data ${escapeShell(bodyStr)}`);
    }
  }

  return parts.join(' \\\n  ');
};

const extractOption = (args: string[], prefixes: string[]): { value: string; used: number } | null => {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    for (const prefix of prefixes) {
      if (arg === prefix || arg.startsWith(prefix + '=')) {
        const value = arg === prefix 
          ? args[i + 1] 
          : arg.substring(prefix.length + 1);
        return { value, used: arg === prefix ? 2 : 1 };
      }
    }
  }
  return null;
};

const extractHeaders = (args: string[]): Record<string, string> => {
  const headers: Record<string, string> = {};
  const usedIndices = new Set<number>();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '-H' || arg === '--header') && i + 1 < args.length) {
      const header = args[i + 1];
      const colonIndex = header.indexOf(':');
      if (colonIndex > 0) {
        const key = header.substring(0, colonIndex).trim();
        const value = header.substring(colonIndex + 1).trim();
        headers[key] = value;
        usedIndices.add(i);
        usedIndices.add(i + 1);
      }
      i++;
    } else if (arg.startsWith('--header=')) {
      const header = arg.substring('--header='.length);
      const colonIndex = header.indexOf(':');
      if (colonIndex > 0) {
        const key = header.substring(0, colonIndex).trim();
        const value = header.substring(colonIndex + 1).trim();
        headers[key] = value;
        usedIndices.add(i);
      }
    }
  }

  return headers;
};

const extractData = (args: string[]): string | null => {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '-D') {
      if (i + 1 < args.length) {
        return args[i + 1];
      }
      if (arg.includes('=')) {
        return arg.substring(arg.indexOf('=') + 1);
      }
    } else if (arg.startsWith('--data=') || arg.startsWith('--data-raw=') || arg.startsWith('-d=')) {
      return arg.split('=').slice(1).join('=');
    }
  }
  return null;
};

const extractAuth = (args: string[]): Record<string, string> | null => {
  const auth = extractOption(args, ['-u', '--user']);
  if (auth) {
    const [username, ...passwordParts] = auth.value.split(':');
    const password = passwordParts.join(':') || '';
    return { Authorization: 'Basic ' + btoa(username + ':' + password) };
  }
  return null;
};

export const curlToRequest = (curlString: string): Request | null => {
  try {
    const cleaned = curlString
      .replace(/^curl\s*/, '')
      .replace(/\\\n/g, ' ')
      .replace(/\\"/g, '"')
      .trim();

    const args = cleaned.match(/(?:[^\s"']|"[^"]*")+/g) || [];
    const normalizedArgs = args.map((arg) => arg.replace(/^"|"$/g, ''));

    const methodOpt = extractOption(normalizedArgs, ['-X', '--request']);
    let method: HttpMethod = 'GET';
    if (methodOpt) {
      const m = methodOpt.value.toUpperCase();
      if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) {
        method = m as HttpMethod;
      }
    }

    const headers = extractHeaders(normalizedArgs);
    const auth = extractAuth(normalizedArgs);
    if (auth) {
      Object.assign(headers, auth);
    }

    const data = extractData(normalizedArgs);
    let body: unknown = null;
    let bodyType: BodyType = 'none';

    if (data) {
      if (method === 'GET') {
        method = 'POST';
      }
      bodyType = 'json';
      try {
        body = JSON.parse(data);
      } catch {
        body = data;
      }
    }

    const urlArg = normalizedArgs.find((arg) => {
      const lower = arg.toLowerCase();
      return lower.startsWith('http://') || lower.startsWith('https://');
    });

    if (!urlArg) return null;

    const url = urlArg;

    return {
      id: crypto.randomUUID(),
      nombre: new URL(url).pathname || 'Imported Request',
      method,
      url,
      headers,
      body,
      bodyType,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };
  } catch {
    return null;
  }
};

export const isValidCurl = (text: string): boolean => {
  const lower = text.toLowerCase().trim();
  return lower.startsWith('curl') || lower.includes('curl ');
};