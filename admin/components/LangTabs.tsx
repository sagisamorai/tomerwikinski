import React, { useState } from 'react';

const LANGS = [
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pt', label: 'Portugues', flag: '🇵🇹' },
];

interface LangTabsProps {
  children: (lang: string, suffix: string) => React.ReactNode;
}

const LangTabs: React.FC<LangTabsProps> = ({ children }) => {
  const [activeLang, setActiveLang] = useState('he');

  const suffix = activeLang === 'he' ? '' : `_${activeLang}`;

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
        {LANGS.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveLang(lang.code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeLang === lang.code
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
      <div>{children(activeLang, suffix)}</div>
    </div>
  );
};

export default LangTabs;

/**
 * Helper to get the correct field name for a given base field and language suffix.
 * e.g., fieldName('title', '_en') => 'title_en', fieldName('title', '') => 'title'
 */
export function fieldName(base: string, suffix: string): string {
  return suffix ? `${base}${suffix}` : base;
}
