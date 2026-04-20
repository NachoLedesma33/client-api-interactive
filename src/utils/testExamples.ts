import type { Request, Collection, Environment, HttpMethod, BodyType } from '@/types/api';
import { db } from '@/db/database';

const DEMO_REQUESTS: Request[] = [
  {
    id: 'demo-1',
    nombre: 'Get Posts',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: {},
    body: null,
    bodyType: 'none',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
  {
    id: 'demo-2',
    nombre: 'Get Single Post',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {},
    body: null,
    bodyType: 'none',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
  {
    id: 'demo-3',
    nombre: 'Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: { 'Content-Type': 'application/json' },
    body: { title: 'foo', body: 'bar', userId: 1 },
    bodyType: 'json',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
  {
    id: 'demo-4',
    nombre: 'Update Post',
    method: 'PUT',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json' },
    body: { id: 1, title: 'foo', body: 'bar', userId: 1 },
    bodyType: 'json',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
  {
    id: 'demo-5',
    nombre: 'Delete Post',
    method: 'DELETE',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {},
    body: null,
    bodyType: 'none',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
  {
    id: 'demo-6',
    nombre: 'GitHub Users',
    method: 'GET',
    url: 'https://api.github.com/users',
    headers: { 'User-Agent': 'API-Client-Demo' },
    body: null,
    bodyType: 'none',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
  {
    id: 'demo-7',
    nombre: 'Get Comments',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/comments?postId=1',
    headers: {},
    body: null,
    bodyType: 'none',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
  {
    id: 'demo-8',
    nombre: 'Get Todos',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/todos',
    headers: {},
    body: null,
    bodyType: 'none',
    createdAt: new Date().toISOString(),
    lastUsed: null,
  },
];

const DEMO_COLLECTIONS: Partial<Collection>[] = [
  {
    id: 'col-1',
    nombre: 'JSONPlaceholder API',
    descripcion: 'Basic REST API for testing CRUD operations',
    requests: ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'col-2',
    nombre: 'GitHub API',
    descripcion: 'GitHub REST API examples',
    requests: ['demo-6'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEMO_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-demo',
    nombre: 'Demo',
    variables: {
      baseUrl: 'https://jsonplaceholder.typicode.com',
      apiKey: 'demo-key-123',
    },
    isActive: false,
  },
];

export const IS_DEMO_DATA_AVAILABLE = true;

export async function seedDatabase(): Promise<{ requests: number; collections: number; environments: number }> {
  const existingRequests = await db.requests.count();
  
  if (existingRequests > 0) {
    console.log('[Seed] Database already has data, skipping seed');
    return { requests: existingRequests, collections: 0, environments: 0 };
  }

  for (const request of DEMO_REQUESTS) {
    await db.saveRequest(request);
  }

  for (const collection of DEMO_COLLECTIONS) {
    await db.saveCollection(collection as Collection);
  }

  for (const environment of DEMO_ENVIRONMENTS) {
    await db.saveEnvironment(environment);
  }

  const requestCount = await db.requests.count();
  const collectionCount = await db.collections.count();
  const environmentCount = await db.environments.count();

  console.log('[Seed] Demo data seeded successfully:', {
    requests: requestCount,
    collections: collectionCount,
    environments: environmentCount,
  });

  return {
    requests: requestCount,
    collections: collectionCount,
    environments: environmentCount,
  };
}