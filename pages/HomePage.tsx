
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'he';
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="animate-fade-in">
      <section className="relative bg-slate-900 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/1920/1080')] bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            {t('home.heroTitle1')}<br />
            {t('home.heroTitle2')}
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10">
            {t('home.heroSubtitle')}
          </p>
          <p className="text-sm uppercase tracking-widest text-slate-400 mb-8 font-semibold">
            {t('home.heroExpertise')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-slate-900 px-8 py-4 rounded-md font-bold text-lg hover:bg-slate-100 transition-colors">
              {t('home.ctaCall')}
            </Link>
            <Link to="/approach" className="bg-transparent border border-white text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-white/10 transition-colors">
              {t('home.ctaApproach')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">{t('home.aboutTitle')}</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">{t('home.aboutP1')}</p>
          <p className="text-lg text-slate-600 leading-relaxed">{t('home.aboutP2')}</p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">{t('home.servicesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full border border-slate-100">
              <div className="bg-slate-100 p-4 rounded-full w-fit mb-6 text-slate-700"><Briefcase size={32} /></div>
              <h3 className="text-xl font-bold mb-4">{t('home.serviceStrategy')}</h3>
              <p className="text-slate-600 mb-8 flex-grow">{t('home.serviceStrategyDesc')}</p>
              <Link to="/services/strategy" className="text-slate-900 font-semibold flex items-center gap-2 group">
                {t('home.learnMore')} <Chevron size={18} className={`transition-transform ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full border border-slate-100">
              <div className="bg-slate-100 p-4 rounded-full w-fit mb-6 text-slate-700"><Users size={32} /></div>
              <h3 className="text-xl font-bold mb-4">{t('home.serviceCoaching')}</h3>
              <p className="text-slate-600 mb-8 flex-grow">{t('home.serviceCoachingDesc')}</p>
              <Link to="/services/coaching" className="text-slate-900 font-semibold flex items-center gap-2 group">
                {t('home.learnMore')} <Chevron size={18} className={`transition-transform ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full border border-slate-100">
              <div className="bg-slate-100 p-4 rounded-full w-fit mb-6 text-slate-700"><Building2 size={32} /></div>
              <h3 className="text-xl font-bold mb-4">{t('home.serviceRealEstate')}</h3>
              <p className="text-slate-600 mb-8 flex-grow">{t('home.serviceRealEstateDesc')}</p>
              <Link to="/services/real-estate" className="text-slate-900 font-semibold flex items-center gap-2 group">
                {t('home.learnMore')} <Chevron size={18} className={`transition-transform ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img src="https://picsum.photos/600/400?grayscale" alt="Team strategy" className="rounded-lg shadow-lg" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-8">{t('home.whyTitle')}</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <h4 className="font-bold mb-1">{t('home.why1Title')}</h4>
                    <p className="text-slate-600">{t('home.why1Desc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <h4 className="font-bold mb-1">{t('home.why2Title')}</h4>
                    <p className="text-slate-600">{t('home.why2Desc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                  <div>
                    <h4 className="font-bold mb-1">{t('home.why3Title')}</h4>
                    <p className="text-slate-600">{t('home.why3Desc')}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('home.finalCtaTitle')}</h2>
          <p className="text-lg text-slate-600 mb-10">{t('home.finalCtaDesc')}</p>
          <Link to="/contact" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-md font-bold text-lg hover:bg-slate-800 transition-colors">
            {t('home.ctaCall')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
