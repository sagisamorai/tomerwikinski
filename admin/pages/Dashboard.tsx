import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import {
  FileText, Briefcase, FolderOpen, Image, MessageSquare, Star, HelpCircle, Clock,
} from 'lucide-react';

interface DashboardData {
  stats: {
    pages: number;
    publishedPages: number;
    services: number;
    categories: number;
    media: number;
    unreadContacts: number;
    testimonials: number;
    faq: number;
  };
  recentActivity: {
    id: string;
    userName: string;
    action: string;
    entityType: string;
    entityName?: string;
    createdAt: string;
  }[];
}

const entityTypeLabels: Record<string, string> = {
  page: 'דף', service: 'שירות', category: 'קטגוריה', media: 'מדיה',
  setting: 'הגדרה', contact: 'פנייה', testimonial: 'המלצה', faq: 'שאלה נפוצה',
};

const actionLabels: Record<string, string> = {
  create: 'יצר', update: 'עדכן', delete: 'מחק',
};

const Dashboard: React.FC = () => {
  const { data, loading } = useApi<DashboardData>('/api/dashboard');

  if (loading) {
    return <div className="text-center py-20 text-slate-400">טוען...</div>;
  }

  const stats = data?.stats;
  const activity = data?.recentActivity || [];

  const cards = [
    { label: 'דפים', value: stats?.pages || 0, sub: `${stats?.publishedPages || 0} מפורסמים`, icon: FileText, href: '/admin/pages', color: 'bg-blue-50 text-blue-600' },
    { label: 'שירותים', value: stats?.services || 0, icon: Briefcase, href: '/admin/services', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'קטגוריות', value: stats?.categories || 0, icon: FolderOpen, href: '/admin/categories', color: 'bg-amber-50 text-amber-600' },
    { label: 'קבצי מדיה', value: stats?.media || 0, icon: Image, href: '/admin/media', color: 'bg-purple-50 text-purple-600' },
    { label: 'פניות שלא נקראו', value: stats?.unreadContacts || 0, icon: MessageSquare, href: '/admin/contacts', color: 'bg-red-50 text-red-600' },
    { label: 'המלצות', value: stats?.testimonials || 0, icon: Star, href: '/admin/testimonials', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'שאלות נפוצות', value: stats?.faq || 0, icon: HelpCircle, href: '/admin/faq', color: 'bg-cyan-50 text-cyan-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">דשבורד</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.href}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
              <p className="text-sm font-medium text-slate-600">{card.label}</p>
              {card.sub && <p className="text-xs text-slate-400 mt-1">{card.sub}</p>}
            </Link>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <h2 className="font-bold text-slate-900">פעילות אחרונה</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {activity.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">אין פעילות אחרונה</div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                <div className="flex-1">
                  <span className="font-medium text-slate-700">{item.userName}</span>
                  {' '}
                  <span className="text-slate-500">{actionLabels[item.action] || item.action}</span>
                  {' '}
                  <span className="text-slate-500">{entityTypeLabels[item.entityType] || item.entityType}</span>
                  {item.entityName && (
                    <span className="text-slate-700 font-medium"> "{item.entityName}"</span>
                  )}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleString('he-IL')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
