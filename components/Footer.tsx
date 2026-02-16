
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { useSiteSettings } from '../lib/useSiteSettings';

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const { t } = useTranslation();

  const phone = settings.phone || '050-XXXXXXX';
  const email = settings.email || 'office@example.com';
  const address = settings.address || 'Israel | Portugal';

  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-6 max-h-[52px] overflow-hidden flex items-center">
              <Logo to="/" className="text-white" prefixClass="text-slate-400" context="footer" />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">{t('footer.quickNav')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/approach" className="hover:text-white transition-colors">{t('footer.approach')}</Link></li>
              <li><Link to="/services/strategy" className="hover:text-white transition-colors">{t('footer.strategy')}</Link></li>
              <li><Link to="/services/coaching" className="hover:text-white transition-colors">{t('footer.coaching')}</Link></li>
              <li><Link to="/services/real-estate" className="hover:text-white transition-colors">{t('footer.realEstate')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">{t('footer.contactTitle')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-slate-500 flex-shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors" dir="ltr">{phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-slate-500 flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors" dir="ltr">{email}</a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-slate-500 flex-shrink-0" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-center text-slate-500">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
