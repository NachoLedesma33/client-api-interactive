import Dexie, { type Table } from 'dexie';
import type { Request, Response, Collection, Environment } from '@/types/api';

export class ApiDatabase extends Dexie {
  requests!: Table<Request, string>;
  responses!: Table<Response, string>;
  collections!: Table<Collection, string>;
  environments!: Table<Environment, string>;

  constructor() {
    super('ApiClientDB');
    this.version(1).stores({
      requests: 'id, nombre, method, url, createdAt, lastUsed',
      responses: 'id, requestId, timestamp',
      collections: 'id, nombre, createdAt',
      environments: 'id, isActive, nombre'
    });
  }

  async saveRequest(request: Request): Promise<string> {
    return this.requests.put(request);
  }

  async updateRequest(id: string, changes: Partial<Request>): Promise<number> {
    return this.requests.update(id, changes);
  }

  async deleteRequest(id: string): Promise<void> {
    return this.requests.delete(id);
  }

  async getAllRequests(): Promise<Request[]> {
    return this.requests.toArray();
  }

  async getRecentRequests(limit: number): Promise<Request[]> {
    return this.requests.orderBy('lastUsed').reverse().filter(r => r.lastUsed !== null).limit(limit).toArray();
  }

  async saveResponse(response: Response): Promise<string> {
    return this.responses.put(response);
  }

  async getResponsesForRequest(requestId: string): Promise<Response[]> {
    return this.responses.where('requestId').equals(requestId).toArray();
  }

  async saveCollection(collection: Collection): Promise<string> {
    return this.collections.put(collection);
  }

  async getCollections(): Promise<Collection[]> {
    return this.collections.toArray();
  }

  async saveEnvironment(environment: Environment): Promise<string> {
    return this.environments.put(environment);
  }

  async getActiveEnvironment(): Promise<Environment | undefined> {
    return this.environments.filter(e => e.isActive).first();
  }

  async setActiveEnvironment(id: string): Promise<void> {
    await this.environments.toCollection().modify({ isActive: false });
    await this.environments.update(id, { isActive: true });
  }
}

// Lazy-initialize DB only on client side
let dbInstance: ApiDatabase | null = null;

export function getDb(): ApiDatabase {
  if (!dbInstance) {
    dbInstance = new ApiDatabase();
  }
  return dbInstance;
}