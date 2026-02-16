import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import LangTabs, { fieldName } from '../components/LangTabs';

interface ServiceData {
  [key: string]: any;
  title: string;
  title_en?: string;
  title_pt?: string;
  slug: string;
  shortDescription: string;
  shortDescription_en?: string;
  shortDescription_pt?: string;
  fullContent: string;
  fullContent_en?: string;
  fullContent_pt?: string;
  icon: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

const emptyService: ServiceData = {
  title: '', title_en: '', title_pt: '',
  slug: '',
  shortDescription: '', shortDescription_en: '', shortDescription_pt: '',
  fullContent: '', fullContent_en: '', fullContent_pt: '',
  icon: 'Briefcase', imageUrl: '', order: 0, isActive: true,
};

const iconOptions = ['Briefcase', 'Users', 'Building2', 'Target', 'TrendingUp', 'Shield', 'Globe', 'Lightbulb'];

const ServiceForm: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate, loading: saving } = useApiMutation();
  const { data: existing } = useApi<any>(`/api/services/${id}`, { skip: isNew });

  const [form, setForm] = useState<ServiceData>(emptyService);

  useEffect(() => {
    if (existing) setForm({
      title: existing.title || '', title_en: existing.title_en || '', title_pt: existing.title_pt || '',
      slug: existing.slug || '',
      shortDescription: existing.shortDescription || '', shortDescription_en: existing.shortDescription_en || '', shortDescription_pt: existing.shortDescription_pt || '',
      fullContent: existing.fullContent || '', fullContent_en: existing.fullContent_en || '', fullContent_pt: existing.fullContent_pt || '',
      icon: existing.icon || 'Briefcase', imageUrl: existing.imageUrl || '', order: existing.order || 0, isActive: existing.isActive ?? true,
    });
  }, [existing]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) {
        await mutate('/api/services', 'POST', form);
        toast('השירות נוצר בהצלחה');
      } else {
        await mutate(`/api/services/${id}`, 'PUT', form);
        toast('השירות עודכן בהצלחה');
      }
      navigate('/admin/services');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/services')} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowRight size={18} />
        </button>
        <h1 className="text-2xl font-bold">{isNew ? 'שירות חדש' : 'עריכת שירות'}</h1>
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
                    תיאור קצר {lang === 'he' ? '*' : `(${lang.toUpperCase()})`}
                  </label>
                  <textarea
                    rows={3}
                    value={form[fieldName('shortDescription', suffix)] || ''}
                    onChange={(e) => handleChange(fieldName('shortDescription', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required={lang === 'he'}
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.shortDescription?.slice(0, 80) : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    תוכן מלא {lang !== 'he' ? `(${lang.toUpperCase()})` : ''}
                  </label>
                  <textarea
                    rows={10}
                    value={form[fieldName('fullContent', suffix)] || ''}
                    onChange={(e) => handleChange(fieldName('fullContent', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            )}
          </LangTabs>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Slug *</label>
            <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" dir="ltr" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">אייקון</label>
              <select value={form.icon} onChange={(e) => handleChange('icon', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
                {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">סדר</label>
              <input type="number" value={form.order} onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">סטטוס</label>
              <select value={form.isActive ? 'true' : 'false'} onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
                <option value="true">פעיל</option>
                <option value="false">לא פעיל</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">כתובת תמונה (URL)</label>
            <input type="text" value={form.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" dir="ltr" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            <Save size={16} />
            {saving ? 'שומר...' : isNew ? 'צור שירות' : 'שמור שינויים'}
          </button>
          <button type="button" onClick={() => navigate('/admin/services')}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
