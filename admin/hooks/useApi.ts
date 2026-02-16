import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function useApi<T>(url: string, options?: { skip?: boolean }) {
  const { getToken } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (options?.skip) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `שגיאה ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'שגיאה בלתי צפויה');
    } finally {
      setLoading(false);
    }
  }, [url, getToken, options?.skip]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}

export function useApiMutation() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (
    url: string,
    method: 'POST' | 'PUT' | 'DELETE',
    body?: any,
    isFormData?: boolean,
  ) => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      const res = await fetch(url, {
        method,
        headers,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `שגיאה ${res.status}`);
      }
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { mutate, loading };
}
