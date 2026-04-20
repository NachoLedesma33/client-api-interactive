import { useState, useEffect, useCallback } from 'react';
import { db as apiDb, ApiDatabase } from '@/db/database';

export function useDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      apiDb.open();
      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Database error');
      setIsLoading(false);
    }
  }, []);

  const resetDatabase = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      await apiDb.requests.clear();
      await apiDb.responses.clear();
      await apiDb.collections.clear();
      await apiDb.environments.clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    }
  }, []);

  const exportDatabase = useCallback(async (): Promise<string> => {
    if (typeof window === 'undefined') return '{}';
    try {
      const data = {
        requests: await apiDb.requests.toArray(),
        responses: await apiDb.responses.toArray(),
        collections: await apiDb.collections.toArray(),
        environments: await apiDb.environments.toArray()
      };
      return JSON.stringify(data, null, 2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
      return '{}';
    }
  }, []);

  return { db: apiDb, isLoading, error, resetDatabase, exportDatabase };
}