import { useState, useEffect } from 'react';
import type { SharedBrew } from '../types/sharedBrew';

interface UseSharedBrewsResult {
  brews: SharedBrew[];
  loading: boolean;
  error: string | null;
}

export function useSharedBrews(): UseSharedBrewsResult {
  const [brews, setBrews] = useState<SharedBrew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBrews() {
      try {
        const res = await fetch('/api/brews/shared');
        if (!res.ok) {
          throw new Error('Failed to fetch shared brews');
        }
        const data = await res.json() as { brews: SharedBrew[] };
        if (!cancelled) {
          setBrews(data.brews ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load shared brews');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBrews();
    return () => {
      cancelled = true;
    };
  }, []);

  return { brews, loading, error };
}
