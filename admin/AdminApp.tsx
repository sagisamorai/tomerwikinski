import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { ToastProvider } from './components/Toast';
import AdminLayout from './components/AdminLayout';

import Dashboard from './pages/Dashboard';
import PagesManager from './pages/PagesManager';
import PageForm from './pages/PageForm';
import ServicesManager from './pages/ServicesManager';
import ServiceForm from './pages/ServiceForm';
import CategoriesManager from './pages/CategoriesManager';
import CategoryForm from './pages/CategoryForm';
import MediaLibrary from './pages/MediaLibrary';
import SiteSettings from './pages/SiteSettings';
import ContactMessages from './pages/ContactMessages';
import TestimonialsManager from './pages/TestimonialsManager';
import TestimonialForm from './pages/TestimonialForm';
import FAQManager from './pages/FAQManager';
import FAQForm from './pages/FAQForm';
import AuditLogPage from './pages/AuditLogPage';

const AdminApp: React.FC = () => {
  return (
    <ToastProvider>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-slate-100" dir="rtl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              <span className="text-slate-400">GROUP</span>CONSULT
            </h1>
            <p className="text-sm text-slate-500 mb-8">פאנל ניהול - נדרשת התחברות</p>
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'shadow-xl',
                },
              }}
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pages" element={<PagesManager />} />
            <Route path="pages/new" element={<PageForm />} />
            <Route path="pages/:id" element={<PageForm />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="services/new" element={<ServiceForm />} />
            <Route path="services/:id" element={<ServiceForm />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id" element={<CategoryForm />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="contacts" element={<ContactMessages />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="testimonials/new" element={<TestimonialForm />} />
            <Route path="testimonials/:id" element={<TestimonialForm />} />
            <Route path="faq" element={<FAQManager />} />
            <Route path="faq/new" element={<FAQForm />} />
            <Route path="faq/:id" element={<FAQForm />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </SignedIn>
    </ToastProvider>
  );
};

export default AdminApp;
