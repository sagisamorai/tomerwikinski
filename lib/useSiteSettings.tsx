import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SiteSettings {
  [key: string]: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refetch: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: {},
  loading: true,
  refetch: () => {},
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

function getCurrentLang(): string {
  try {
    return localStorage.getItem('i18nextLng') || 'he';
  } catch {
    return 'he';
  }
}

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const lang = getCurrentLang();
      const res = await fetch(`/api/settings/public?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // Re-fetch when language changes
  useEffect(() => {
    const handler = () => fetchSettings();
    window.addEventListener('languageChanged', handler);
    return () => window.removeEventListener('languageChanged', handler);
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
