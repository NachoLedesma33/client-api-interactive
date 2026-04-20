export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded';

export interface Request {
  id: string;
  nombre: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  bodyType: BodyType;
  createdAt: string;
  lastUsed: string | null;
}

export interface Response {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, string>;
  duration: number;
  timestamp: string;
}

export interface Collection {
  id: string;
  nombre: string;
  descripcion: string;
  requests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  id: string;
  nombre: string;
  variables: Record<string, string>;
  isActive: boolean;
}