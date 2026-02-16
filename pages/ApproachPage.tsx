
import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ShieldCheck, Zap, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePageContent } from '../lib/useDynamicContent';

const ApproachPage: React.FC = () => {
  const { t } = useTranslation();
  const page = usePageContent('approach');

  return (
    <div className="animate-fade-in pb-20">
      <header className="bg-slate-50 border-b border-slate-200 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">{page?.title || t('approach.title')}</h1>
          <p className="text-xl text-slate-700 font-medium">{t('approach.quote')}</p>
        </div>
      </header>

      {/* Dynamic content from DB */}
      {page?.content && (
        <section className="py-12 max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {page.content.split(/\n\n+/).filter(Boolean).map((p, i) => (
              <p key={i} className="text-lg text-slate-600 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>
      )}

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('approach.principlesTitle')}</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="text-slate-400 shrink-0"><Layers size={28} /></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('approach.p1Title')}</h3>
                  <p className="text-slate-600">{t('approach.p1Desc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-slate-400 shrink-0"><Zap size={28} /></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('approach.p2Title')}</h3>
                  <p className="text-slate-600">{t('approach.p2Desc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-slate-400 shrink-0"><Target size={28} /></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('approach.p3Title')}</h3>
                  <p className="text-slate-600">{t('approach.p3Desc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-slate-400 shrink-0"><ShieldCheck size={28} /></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('approach.p4Title')}</h3>
                  <p className="text-slate-600">{t('approach.p4Desc')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-12 text-white">
            <h2 className="text-2xl font-bold mb-8">{t('approach.servicesTitle')}</h2>
            <ul className="space-y-6 list-disc list-inside text-slate-300">
              <li><strong className="text-white">{t('approach.sConsulting')}</strong> {t('approach.sConsultingDesc')}</li>
              <li><strong className="text-white">{t('approach.sCoaching')}</strong> {t('approach.sCoachingDesc')}</li>
              <li><strong className="text-white">{t('approach.sRealEstate')}</strong> {t('approach.sRealEstateDesc')}</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link to="/contact" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-md font-bold text-lg hover:bg-slate-800 transition-colors">
            {t('approach.cta')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ApproachPage;
