import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const health = {
    status: 'ok',
    timestamp: Date.now(),
    environment: import.meta.env.MODE || 'development',
  };

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
};