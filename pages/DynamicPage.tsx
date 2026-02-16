import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PageData {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
}

const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'he';

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    const lang = localStorage.getItem('i18nextLng') || 'he';
    fetch(`/api/pages/public/${slug}?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        setPage(data);
        if (data.metaTitle) document.title = data.metaTitle;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Re-fetch on language change
  useEffect(() => {
    const handler = () => {
      if (!slug) return;
      const lang = localStorage.getItem('i18nextLng') || 'he';
      fetch(`/api/pages/public/${slug}?lang=${lang}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setPage(data); });
    };
    window.addEventListener('languageChanged', handler);
    return () => window.removeEventListener('languageChanged', handler);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isRtl ? 'הדף לא נמצא' : 'Page not found'}
        </h1>
        <p className="text-slate-500 mb-6">
          {isRtl ? 'הדף שחיפשת אינו קיים או שאינו פורסם.' : 'The page you are looking for does not exist or is not published.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          {isRtl ? (
            <>חזרה לעמוד הבית<ChevronLeft size={16} /></>
          ) : (
            <><ChevronRight size={16} />Back to Home</>
          )}
        </Link>
      </div>
    );
  }

  // Split content into paragraphs for nicer rendering
  const paragraphs = page.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="py-16 sm:py-20">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 sm:py-24 -mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {page.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose prose-slate max-w-none text-lg leading-relaxed space-y-6">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-slate-700">{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DynamicPage;
