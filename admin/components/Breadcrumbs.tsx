import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const pathLabels: Record<string, string> = {
  admin: 'פאנל ניהול',
  pages: 'דפים',
  services: 'שירותים',
  categories: 'קטגוריות',
  media: 'ספריית מדיה',
  testimonials: 'המלצות',
  faq: 'שאלות נפוצות',
  contacts: 'פניות',
  settings: 'הגדרות אתר',
  audit: 'יומן פעולות',
  new: 'חדש',
  edit: 'עריכה',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.length <= 1) return null;

  const crumbs = parts.map((part, index) => {
    const path = '/' + parts.slice(0, index + 1).join('/');
    const label = pathLabels[part] || part;
    const isLast = index === parts.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500">
      <Link to="/admin" className="hover:text-slate-700">
        <Home size={14} />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <React.Fragment key={crumb.path}>
          <ChevronLeft size={14} className="text-slate-300" />
          {crumb.isLast ? (
            <span className="text-slate-800 font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-slate-700">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
