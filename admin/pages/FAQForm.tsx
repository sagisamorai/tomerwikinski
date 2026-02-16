import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import LangTabs, { fieldName } from '../components/LangTabs';

interface FAQData {
  [key: string]: any;
  question: string; question_en?: string; question_pt?: string;
  answer: string; answer_en?: string; answer_pt?: string;
  order: number; isActive: boolean;
}

const empty: FAQData = {
  question: '', question_en: '', question_pt: '',
  answer: '', answer_en: '', answer_pt: '',
  order: 0, isActive: true,
};

const FAQForm: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate, loading: saving } = useApiMutation();
  const { data: existing } = useApi<any>(`/api/faq/${id}`, { skip: isNew });
  const [form, setForm] = useState<FAQData>(empty);

  useEffect(() => {
    if (existing) setForm({
      question: existing.question || '', question_en: existing.question_en || '', question_pt: existing.question_pt || '',
      answer: existing.answer || '', answer_en: existing.answer_en || '', answer_pt: existing.answer_pt || '',
      order: existing.order || 0, isActive: existing.isActive ?? true,
    });
  }, [existing]);

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) { await mutate('/api/faq', 'POST', form); toast('השאלה נוצרה בהצלחה'); }
      else { await mutate(`/api/faq/${id}`, 'PUT', form); toast('השאלה עודכנה בהצלחה'); }
      navigate('/admin/faq');
    } catch (err: any) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/faq')} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowRight size={18} /></button>
        <h1 className="text-2xl font-bold">{isNew ? 'שאלה חדשה' : 'עריכת שאלה'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <LangTabs>
            {(lang, suffix) => (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    שאלה {lang === 'he' ? '*' : `(${lang.toUpperCase()})`}
                  </label>
                  <input type="text"
                    value={form[fieldName('question', suffix)] || ''}
                    onChange={(e) => set(fieldName('question', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required={lang === 'he'} dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.question : ''} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    תשובה {lang === 'he' ? '*' : `(${lang.toUpperCase()})`}
                  </label>
                  <textarea rows={6}
                    value={form[fieldName('answer', suffix)] || ''}
                    onChange={(e) => set(fieldName('answer', suffix), e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required={lang === 'he'} dir={lang === 'he' ? 'rtl' : 'ltr'}
                    placeholder={lang !== 'he' ? form.answer?.slice(0, 80) : ''} />
                </div>
              </div>
            )}
          </LangTabs>

          <div className="grid grid-cols-2 gap-4">
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
            <Save size={16} />{saving ? 'שומר...' : isNew ? 'צור שאלה' : 'שמור שינויים'}
          </button>
          <button type="button" onClick={() => navigate('/admin/faq')}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">ביטול</button>
        </div>
      </form>
    </div>
  );
};

export default FAQForm;
