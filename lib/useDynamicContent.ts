import { useState, useEffect, useCallback } from 'react';

function getLang(): string {
  try { return localStorage.getItem('i18nextLng') || 'he'; } catch { return 'he'; }
}

export function usePageContent(slug: string) {
  const [data, setData] = useState<{ title: string; content: string } | null>(null);

  const fetchData = useCallback(() => {
    fetch(`/api/pages/public/${slug}?lang=${getLang()}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const h = () => fetchData();
    window.addEventListener('languageChanged', h);
    return () => window.removeEventListener('languageChanged', h);
  }, [fetchData]);

  return data;
}

export function useServiceContent(slug: string) {
  const [data, setData] = useState<{ title: string; shortDescription: string; fullContent: string } | null>(null);

  const fetchData = useCallback(() => {
    fetch(`/api/services/public/${slug}?lang=${getLang()}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const h = () => fetchData();
    window.addEventListener('languageChanged', h);
    return () => window.removeEventListener('languageChanged', h);
  }, [fetchData]);

  return data;
}

export function useAllServices() {
  const [data, setData] = useState<Array<{ slug: string; title: string; shortDescription: string; icon: string }>>([]);

  const fetchData = useCallback(() => {
    fetch(`/api/services/public?lang=${getLang()}`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const h = () => fetchData();
    window.addEventListener('languageChanged', h);
    return () => window.removeEventListener('languageChanged', h);
  }, [fetchData]);

  return data;
}
