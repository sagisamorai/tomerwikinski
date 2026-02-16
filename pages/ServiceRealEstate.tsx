
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Globe, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ServiceRealEstate: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'he';
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  const includes = t('services.realEstate.includes', { returnObjects: true }) as string[];

  return (
    <div className="animate-fade-in pb-20">
      <header className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">{t('services.realEstate.title')}</h1>
          <p className="text-xl text-slate-300 leading-relaxed">{t('services.realEstate.subtitle')}</p>
        </div>
      </header>

      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="text-slate-400 mb-4"><Building size={32} /></div>
            <h3 className="text-xl font-bold mb-3">{t('services.realEstate.israelTitle')}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{t('services.realEstate.israelDesc')}</p>
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="text-slate-400 mb-4"><Globe size={32} /></div>
            <h3 className="text-xl font-bold mb-3">{t('services.realEstate.intlTitle')}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{t('services.realEstate.intlDesc')}</p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 underline underline-offset-8 decoration-slate-200">{t('services.realEstate.includesTitle')}</h2>
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
          <h2 className="text-2xl font-bold mb-8">{t('services.realEstate.howTitle')}</h2>
          <div className="space-y-6">
            <div className={`${isRtl ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-slate-900`}>
              <h4 className="font-bold mb-1">{t('services.realEstate.step1Title')}</h4>
              <p className="text-slate-600">{t('services.realEstate.step1Desc')}</p>
            </div>
            <div className={`${isRtl ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-slate-300`}>
              <h4 className="font-bold mb-1">{t('services.realEstate.step2Title')}</h4>
              <p className="text-slate-600">{t('services.realEstate.step2Desc')}</p>
            </div>
            <div className={`${isRtl ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-slate-300`}>
              <h4 className="font-bold mb-1">{t('services.realEstate.step3Title')}</h4>
              <p className="text-slate-600">{t('services.realEstate.step3Desc')}</p>
            </div>
          </div>
        </div>

        <div className="mb-16 bg-slate-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">{t('services.realEstate.whoTitle')}</h2>
          <ul className="space-y-3 text-slate-700">
            {(t('services.realEstate.who', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-10">
          <h3 className="font-bold mb-4">{t('services.realEstate.relatedTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/services/strategy" className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900">{t('services.realEstate.relatedStrategy')}</h4>
                <p className="text-sm text-slate-500 italic">{t('services.realEstate.relatedStrategyDesc')}</p>
              </div>
              <Chevron className={`transition-transform ${isRtl ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </Link>
            <Link to="/services/coaching" className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900">{t('services.realEstate.relatedCoaching')}</h4>
                <p className="text-sm text-slate-500 italic">{t('services.realEstate.relatedCoachingDesc')}</p>
              </div>
              <Chevron className={`transition-transform ${isRtl ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-400">
        <p>{t('services.realEstate.footerNote')}</p>
      </footer>
    </div>
  );
};

export default ServiceRealEstate;
