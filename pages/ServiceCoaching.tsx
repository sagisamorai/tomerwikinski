
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useServiceContent } from '../lib/useDynamicContent';

const ServiceCoaching: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'he';
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  const includes = t('services.coaching.includes', { returnObjects: true }) as string[];
  const svc = useServiceContent('coaching');

  return (
    <div className="animate-fade-in pb-20">
      <header className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">{svc?.title || t('services.coaching.title')}</h1>
          <p className="text-xl text-slate-300 leading-relaxed">{svc?.shortDescription || t('services.coaching.subtitle')}</p>
        </div>
      </header>

      <section className="py-20 max-w-4xl mx-auto px-4">
        {svc?.fullContent && (
          <div className="mb-16 space-y-4">
            {svc.fullContent.split(/\n\n+/).filter(Boolean).map((p, i) => (
              <p key={i} className="text-lg text-slate-600 leading-relaxed">{p}</p>
            ))}
          </div>
        )}

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 underline underline-offset-8 decoration-slate-200">{t('services.coaching.includesTitle')}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {includes.map((item, i) => (
              <li key={i} className="flex gap-3 items-start text-slate-700">
                <CheckCircle2 className="text-slate-400 shrink-0 mt-1" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">{t('services.coaching.howTitle')}</h2>
          <div className="space-y-6">
            <div className={`${isRtl ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-slate-900`}>
              <h4 className="font-bold mb-1">{t('services.coaching.step1Title')}</h4>
              <p className="text-slate-600">{t('services.coaching.step1Desc')}</p>
            </div>
            <div className={`${isRtl ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-slate-300`}>
              <h4 className="font-bold mb-1">{t('services.coaching.step2Title')}</h4>
              <p className="text-slate-600">{t('services.coaching.step2Desc')}</p>
            </div>
            <div className={`${isRtl ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-slate-300`}>
              <h4 className="font-bold mb-1">{t('services.coaching.step3Title')}</h4>
              <p className="text-slate-600">{t('services.coaching.step3Desc')}</p>
            </div>
          </div>
        </div>

        <div className="mb-16 bg-slate-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">{t('services.coaching.whoTitle')}</h2>
          <ul className="space-y-3 text-slate-700">
            {(t('services.coaching.who', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-10">
          <h3 className="font-bold mb-4">{t('services.coaching.relatedTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/services/strategy" className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900">{t('services.coaching.relatedStrategy')}</h4>
                <p className="text-sm text-slate-500 italic">{t('services.coaching.relatedStrategyDesc')}</p>
              </div>
              <Chevron className={`transition-transform ${isRtl ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </Link>
            <Link to="/services/real-estate" className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900">{t('services.coaching.relatedRealEstate')}</h4>
                <p className="text-sm text-slate-500 italic">{t('services.coaching.relatedRealEstateDesc')}</p>
              </div>
              <Chevron className={`transition-transform ${isRtl ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-400">
        <p>{t('services.coaching.footerNote')}</p>
      </footer>
    </div>
  );
};

export default ServiceCoaching;
