import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import LangTabs, { fieldName } from '../components/LangTabs';

interface CategoryData {
  [key: string]: any;
  name: string; name_en?: string; name_pt?: string;
  slug: string;
  description: string; description_en?: string; description_pt?: string;
  order: number; isActive: boolean;
}

const emptyCat: CategoryData = {
  name: '', name_en: '', name_pt: '', slug: '',
  description: '', description_en: '', description_pt: '',
  order: 0, isActive: true,
};

const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate, loading: saving } = useApiMutation();
  const { data: existing } = useApi<any>(`/api/categories/${id}`, { skip: isNew });
  const [form, setForm] = useState<CategoryData>(emptyCat);

  useEffect(() => {
    if (existing) setForm({
      name: existing.name || '', name_en: existing.name_en || '', name_pt: existing.name_pt || '',
      slug: existing.slug || '',
      description: existing.description || '', description_en: existing.description_en || '', description_pt: existing.description_pt || '',
      order: existing.order || 0, isActive: existing.isActive ?? true,
    });
  }, [existing]);

  const handleChange = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) { await mutate('/api/categories', 'POST', form); toast('הקטגוריה נוצרה בהצלחה'); }
      else { await mutate(`/api/categories/${id}`, 'PUT', form); toast('הקטגוריה עודכנה בהצלחה'); }
      navigate('/admin/categories');
    } catch (err: any) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/categories')} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowRight size={18} /></button>
        <h1 className="text-2xl font-bold">{isNew ? 'קטגוריה חדשה' : 'עריכת קטגוריה'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <LangTabs>
            {(lang, suffix) => (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    שם {lang === 'he' ? '*' : `(${lang.toUpperCase()})`}
                  </label>
                  <input type="text"
                    value={form[fieldName('name', suffix)] || ''}
                    onChange={(e) => {
                      handleChange(fieldName('name', suffix), e.target.value);
                      if (isNew && lang === 'he') handleChange('slug', autoSlug(e.target.value));
                    }}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required={lang === 'he'} dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.name : ''} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    תיאור {lang !== 'he' ? `(${lang.toUpperCase()})` : ''}
                  </label>
                  <textarea rows={3}
                    value={form[fieldName('description', suffix)] || ''}
                    onChange={(e) => handleChange(fieldName('description', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.description?.slice(0, 60) : ''} />
                </div>
              </div>
            )}
          </LangTabs>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Slug *</label>
            <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" dir="ltr" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            <Save size={16} />{saving ? 'שומר...' : isNew ? 'צור קטגוריה' : 'שמור שינויים'}
          </button>
          <button type="button" onClick={() => navigate('/admin/categories')}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">ביטול</button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
