import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

interface AuditEntry {
  id: string; userId: string; userName: string; userRole: string | null;
  action: string; entityType: string; entityId: string; entityName: string | null;
  details: string | null; createdAt: string;
}

const entityLabels: Record<string, string> = {
  page: 'דף', service: 'שירות', category: 'קטגוריה', media: 'מדיה',
  setting: 'הגדרה', contact: 'פנייה', testimonial: 'המלצה', faq: 'שאלה נפוצה',
};
const actionLabels: Record<string, string> = { create: 'יצירה', update: 'עדכון', delete: 'מחיקה' };
const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700', update: 'bg-blue-100 text-blue-700', delete: 'bg-red-100 text-red-700',
};

const AuditLogPage: React.FC = () => {
  const [filter, setFilter] = useState('');
  const url = filter ? `/api/audit?limit=100&entityType=${filter}` : '/api/audit?limit=100';
  const { data, loading } = useApi<{ logs: AuditEntry[]; total: number }>(url);

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  const logs = data?.logs || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">יומן פעולות</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900">
          <option value="">הכל</option>
          {Object.entries(entityLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">אין רשומות ביומן הפעולות</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((entry) => (
              <div key={entry.id} className="px-5 py-4 flex items-start gap-4">
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${actionColors[entry.action] || 'bg-slate-100 text-slate-600'}`}>
                  {actionLabels[entry.action] || entry.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-slate-800">{entry.userName}</span>
                    {' '}
                    <span className="text-slate-500">
                      {actionLabels[entry.action] || entry.action} {entityLabels[entry.entityType] || entry.entityType}
                    </span>
                    {entry.entityName && (
                      <span className="font-medium text-slate-700"> "{entry.entityName}"</span>
                    )}
                  </p>
                  {entry.userRole && (
                    <p className="text-xs text-slate-400 mt-0.5">תפקיד: {entry.userRole}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleString('he-IL')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data && data.total > 100 && (
        <p className="text-center text-sm text-slate-400 mt-4">
          מציג 100 רשומות מתוך {data.total}
        </p>
      )}
    </div>
  );
};

export default AuditLogPage;
