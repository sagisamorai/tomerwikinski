
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../lib/useSiteSettings';
import { usePageContent } from '../lib/useDynamicContent';

const ContactPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'he';
  const page = usePageContent('contact');

  const phone = settings.phone || '050-XXXXXXX';
  const email = settings.email || 'office@example.com';
  const address = settings.address || 'Israel | Portugal';

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(t('contact.validationError'));
      return;
    }
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('contact.submitError'));
      }
      setSent(true);
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || t('contact.unexpectedError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <header className="bg-slate-50 border-b border-slate-200 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">{page?.title || t('contact.title')}</h1>
          <p className="text-xl text-slate-600 leading-relaxed">{page?.content || t('contact.subtitle')}</p>
        </div>
      </header>

      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            {sent ? (
              <div className="text-center py-12">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('contact.successTitle')}</h3>
                <p className="text-slate-500 mb-6">{t('contact.successMessage')}</p>
                <button onClick={() => setSent(false)} className="text-sm text-slate-600 underline hover:text-slate-900">
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">{t('contact.formName')}</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('contact.formNamePlaceholder')} className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">{t('contact.formPhone')}</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="050-0000000" className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">{t('contact.formEmail')}</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@office.com" className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">{t('contact.formMessage')}</label>
                  <textarea rows={4} name="message" value={form.message} onChange={handleChange} placeholder={t('contact.formMessagePlaceholder')} className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
                <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50">
                  <Send size={18} />
                  {sending ? t('contact.sending') : t('contact.submit')}
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-8">{t('contact.detailsTitle')}</h2>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-4 rounded-full text-slate-700"><Phone size={24} /></div>
                <div>
                  <p className="text-sm text-slate-500">{t('contact.phoneLabel')}</p>
                  <a href={`tel:${phone}`} className="text-lg font-bold hover:text-slate-600 transition-colors" dir="ltr">{phone}</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-4 rounded-full text-slate-700"><Mail size={24} /></div>
                <div>
                  <p className="text-sm text-slate-500">{t('contact.emailLabel')}</p>
                  <a href={`mailto:${email}`} className="text-lg font-bold hover:text-slate-600 transition-colors" dir="ltr">{email}</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-4 rounded-full text-slate-700"><MapPin size={24} /></div>
                <div>
                  <p className="text-sm text-slate-500">{t('contact.locationLabel')}</p>
                  <p className="text-lg font-bold">{address}</p>
                </div>
              </div>
            </div>
            <div className={`mt-12 p-6 ${isRtl ? 'border-r-2' : 'border-l-2'} border-slate-100 italic text-slate-500`}>
              {t('contact.disclaimer')}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
