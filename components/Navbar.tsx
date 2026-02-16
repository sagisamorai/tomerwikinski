import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'he';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.approach'), path: '/approach' },
    { name: t('nav.strategy'), path: '/services/strategy' },
    { name: t('nav.coaching'), path: '/services/coaching' },
    { name: t('nav.realEstate'), path: '/services/real-estate' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center transition-all duration-300 py-2"
          style={{ height: scrolled ? '70px' : '80px' }}
        >
          {/* Logo — capped so nav links always have room */}
          <div className="flex-shrink-0 flex items-center" style={{ maxWidth: '300px', maxHeight: '64px', overflow: 'hidden' }}>
            <Logo to="/" className="text-slate-900" prefixClass="text-slate-500" context="navbar" />
          </div>

          {/* Nav links — centered in remaining space */}
          <div className="hidden md:flex flex-1 items-center justify-center min-w-0">
            <div className={`flex items-center ${isRtl ? 'space-x-5 space-x-reverse' : 'space-x-5'}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === link.path
                      ? 'text-slate-900 border-b-2 border-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Language switcher */}
          <div className="hidden md:flex flex-shrink-0 items-center">
            <LanguageSwitcher />
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-1 items-center justify-end gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-4 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-b border-slate-50 last:border-0"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
