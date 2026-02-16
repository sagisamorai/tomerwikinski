import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import LangTabs, { fieldName } from '../components/LangTabs';

interface TestimonialData {
  [key: string]: any;
  name: string; role: string; role_en?: string; role_pt?: string;
  company: string; company_en?: string; company_pt?: string;
  content: string; content_en?: string; content_pt?: string;
  imageUrl: string; order: number; isActive: boolean;
}

const empty: TestimonialData = {
  name: '', role: '', role_en: '', role_pt: '',
  company: '', company_en: '', company_pt: '',
  content: '', content_en: '', content_pt: '',
  imageUrl: '', order: 0, isActive: true,
};

const TestimonialForm: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate, loading: saving } = useApiMutation();
  const { data: existing } = useApi<any>(`/api/testimonials/${id}`, { skip: isNew });
  const [form, setForm] = useState<TestimonialData>(empty);

  useEffect(() => {
    if (existing) setForm({
      name: existing.name || '', role: existing.role || '', role_en: existing.role_en || '', role_pt: existing.role_pt || '',
      company: existing.company || '', company_en: existing.company_en || '', company_pt: existing.company_pt || '',
      content: existing.content || '', content_en: existing.content_en || '', content_pt: existing.content_pt || '',
      imageUrl: existing.imageUrl || '', order: existing.order || 0, isActive: existing.isActive ?? true,
    });
  }, [existing]);

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) { await mutate('/api/testimonials', 'POST', form); toast('ההמלצה נוצרה בהצלחה'); }
      else { await mutate(`/api/testimonials/${id}`, 'PUT', form); toast('ההמלצה עודכנה בהצלחה'); }
      navigate('/admin/testimonials');
    } catch (err: any) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/testimonials')} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowRight size={18} /></button>
        <h1 className="text-2xl font-bold">{isNew ? 'המלצה חדשה' : 'עריכת המלצה'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">שם *</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" required />
          </div>

          <LangTabs>
            {(lang, suffix) => (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    תפקיד {lang === 'he' ? '*' : `(${lang.toUpperCase()})`}
                  </label>
                  <input type="text"
                    value={form[fieldName('role', suffix)] || ''}
                    onChange={(e) => set(fieldName('role', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required={lang === 'he'} dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.role : ''} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    חברה {lang !== 'he' ? `(${lang.toUpperCase()})` : ''}
                  </label>
                  <input type="text"
                    value={form[fieldName('company', suffix)] || ''}
                    onChange={(e) => set(fieldName('company', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.company : ''} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    תוכן ההמלצה {lang === 'he' ? '*' : `(${lang.toUpperCase()})`}
                  </label>
                  <textarea rows={5}
                    value={form[fieldName('content', suffix)] || ''}
                    onChange={(e) => set(fieldName('content', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required={lang === 'he'} dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.content?.slice(0, 80) : ''} />
                </div>
              </div>
            )}
          </LangTabs>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">כתובת תמונה</label>
              <input type="text" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">סדר</label>
              <input type="number" value={form.order} onChange={(e) => set('order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">סטטוס</label>
              <select value={form.isActive ? 'true' : 'false'} onChange={(e) => set('isActive', e.target.value === 'true')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900">
                <option value="true">פעיל</option><option value="false">לא פעיל</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            <Save size={16} />{saving ? 'שומר...' : isNew ? 'צור המלצה' : 'שמור שינויים'}
          </button>
          <button type="button" onClick={() => navigate('/admin/testimonials')}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">ביטול</button>
        </div>
      </form>
    </div>
  );
};

export default TestimonialForm;
