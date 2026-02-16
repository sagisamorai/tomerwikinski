import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { heIL } from '@clerk/localizations';
import { SiteSettingsProvider } from './lib/useSiteSettings';
import './lib/i18n';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import ApproachPage from './pages/ApproachPage';
import ServiceStrategy from './pages/ServiceStrategy';
import ServiceCoaching from './pages/ServiceCoaching';
import ServiceRealEstate from './pages/ServiceRealEstate';
import ContactPage from './pages/ContactPage';
import DynamicPage from './pages/DynamicPage';

import AdminApp from './admin/AdminApp';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

const PublicSite: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-slate-50">
    <Navbar />
    <main className="flex-grow pt-16">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/approach" element={<ApproachPage />} />
        <Route path="/services/strategy" element={<ServiceStrategy />} />
        <Route path="/services/coaching" element={<ServiceCoaching />} />
        <Route path="/services/real-estate" element={<ServiceRealEstate />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/page/:slug" element={<DynamicPage />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey} localization={heIL}>
      <SiteSettingsProvider>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400">Loading...</div>}>
          <HashRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/*" element={<PublicSite />} />
            </Routes>
          </HashRouter>
        </Suspense>
      </SiteSettingsProvider>
    </ClerkProvider>
  );
};

export default App;
