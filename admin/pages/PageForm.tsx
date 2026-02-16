import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import LangTabs, { fieldName } from '../components/LangTabs';

interface PageData {
  [key: string]: string | undefined;
  title: string;
  title_en?: string;
  title_pt?: string;
  slug: string;
  content: string;
  content_en?: string;
  content_pt?: string;
  metaTitle: string;
  metaTitle_en?: string;
  metaTitle_pt?: string;
  metaDescription: string;
  metaDescription_en?: string;
  metaDescription_pt?: string;
  status: string;
}

const emptyPage: PageData = {
  title: '', slug: '', content: '', metaTitle: '', metaDescription: '', status: 'draft',
  title_en: '', title_pt: '', content_en: '', content_pt: '',
  metaTitle_en: '', metaTitle_pt: '', metaDescription_en: '', metaDescription_pt: '',
};

const PageForm: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate, loading: saving } = useApiMutation();
  const { data: existing } = useApi<PageData>(`/api/pages/${id}`, { skip: isNew });

  const [form, setForm] = useState<PageData>(emptyPage);

  useEffect(() => {
    if (existing) setForm({
      title: existing.title || '',
      title_en: existing.title_en || '',
      title_pt: existing.title_pt || '',
      slug: existing.slug || '',
      content: existing.content || '',
      content_en: existing.content_en || '',
      content_pt: existing.content_pt || '',
      metaTitle: existing.metaTitle || '',
      metaTitle_en: existing.metaTitle_en || '',
      metaTitle_pt: existing.metaTitle_pt || '',
      metaDescription: existing.metaDescription || '',
      metaDescription_en: existing.metaDescription_en || '',
      metaDescription_pt: existing.metaDescription_pt || '',
      status: existing.status || 'draft',
    });
  }, [existing]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const autoSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, '')
      .replace(/[\s\u0590-\u05FF]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) {
        await mutate('/api/pages', 'POST', form);
        toast('הדף נוצר בהצלחה');
      } else {
        await mutate(`/api/pages/${id}`, 'PUT', form);
        toast('הדף עודכן בהצלחה');
      }
      navigate('/admin/pages');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/pages')} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowRight size={18} />
        </button>
        <h1 className="text-2xl font-bold">{isNew ? 'דף חדש' : 'עריכת דף'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <LangTabs>
            {(lang, suffix) => (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    כותרת {lang === 'he' ? '*' : `(${lang.toUpperCase()})`}
                  </label>
                  <input
                    type="text"
                    value={form[fieldName('title', suffix)] || ''}
                    onChange={(e) => {
                      handleChange(fieldName('title', suffix), e.target.value);
                      if (isNew && lang === 'he') handleChange('slug', autoSlug(e.target.value));
                    }}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required={lang === 'he'}
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.title : ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    תוכן {lang !== 'he' ? `(${lang.toUpperCase()})` : ''}
                  </label>
                  <textarea
                    rows={12}
                    value={form[fieldName('content', suffix)] || ''}
                    onChange={(e) => handleChange(fieldName('content', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.content?.slice(0, 100) + '...' : ''}
                  />
                </div>
              </div>
            )}
          </LangTabs>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">סטטוס</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="draft">טיוטה</option>
              <option value="published">מפורסם</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="font-bold text-slate-900">SEO</h2>
          <LangTabs>
            {(lang, suffix) => (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    כותרת SEO {lang !== 'he' ? `(${lang.toUpperCase()})` : ''}
                  </label>
                  <input
                    type="text"
                    value={form[fieldName('metaTitle', suffix)] || ''}
                    onChange={(e) => handleChange(fieldName('metaTitle', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    תיאור SEO {lang !== 'he' ? `(${lang.toUpperCase()})` : ''}
                  </label>
                  <textarea
                    rows={3}
                    value={form[fieldName('metaDescription', suffix)] || ''}
                    onChange={(e) => handleChange(fieldName('metaDescription', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            )}
          </LangTabs>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'שומר...' : isNew ? 'צור דף' : 'שמור שינויים'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/pages')}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageForm;
