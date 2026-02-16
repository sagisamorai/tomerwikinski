import React, { useState } from 'react';
import { Mail, MailOpen, Trash2, Eye, X } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import DataTable, { type Column } from '../components/DataTable';
import DeleteDialog from '../components/DeleteDialog';
import RoleGuard from '../components/RoleGuard';

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const ContactMessages: React.FC = () => {
  const { data, loading, refetch } = useApi<ContactMsg[]>('/api/contacts');
  const { mutate, loading: mutating } = useApiMutation();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<ContactMsg | null>(null);
  const [viewTarget, setViewTarget] = useState<ContactMsg | null>(null);

  const handleMarkRead = async (msg: ContactMsg) => {
    try {
      await mutate(`/api/contacts/${msg.id}/read`, 'PUT');
      refetch();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const handleView = (msg: ContactMsg) => {
    setViewTarget(msg);
    if (!msg.isRead) handleMarkRead(msg);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutate(`/api/contacts/${deleteTarget.id}`, 'DELETE');
      toast('הפנייה נמחקה');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const columns: Column<ContactMsg>[] = [
    {
      key: 'isRead',
      label: '',
      className: 'w-10',
      render: (m) => m.isRead
        ? <MailOpen size={16} className="text-slate-300" />
        : <Mail size={16} className="text-blue-500" />,
    },
    { key: 'name', label: 'שם', sortable: true },
    { key: 'email', label: 'דוא״ל', sortable: true, className: 'font-mono text-xs' },
    { key: 'phone', label: 'טלפון' },
    {
      key: 'message',
      label: 'הודעה',
      render: (m) => <span className="truncate block max-w-xs">{m.message}</span>,
    },
    {
      key: 'createdAt',
      label: 'תאריך',
      sortable: true,
      render: (m) => new Date(m.createdAt).toLocaleDateString('he-IL'),
    },
  ];

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  const unreadCount = data?.filter((m) => !m.isRead).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">פניות</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-600 mt-1">{unreadCount} פניות שלא נקראו</p>
          )}
        </div>
      </div>

      <DataTable
        data={data || []}
        columns={columns}
        searchPlaceholder="חיפוש פניות..."
        searchKeys={['name', 'email', 'message']}
        emptyMessage="לא נמצאו פניות"
        actions={(msg) => (
          <>
            <button onClick={() => handleView(msg)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="צפייה">
              <Eye size={15} />
            </button>
            <RoleGuard roles={['admin']}>
              <button onClick={() => setDeleteTarget(msg)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="מחיקה">
                <Trash2 size={15} />
              </button>
            </RoleGuard>
          </>
        )}
      />

      {/* View Dialog */}
      {viewTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setViewTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 z-10">
            <button onClick={() => setViewTarget(null)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4">פנייה מ-{viewTarget.name}</h3>
            <div className="space-y-3 text-sm">
              <div><strong>דוא״ל:</strong> <span dir="ltr">{viewTarget.email}</span></div>
              {viewTarget.phone && <div><strong>טלפון:</strong> {viewTarget.phone}</div>}
              <div><strong>תאריך:</strong> {new Date(viewTarget.createdAt).toLocaleString('he-IL')}</div>
              <div className="pt-3 border-t border-slate-200">
                <strong>הודעה:</strong>
                <p className="mt-2 text-slate-600 whitespace-pre-wrap">{viewTarget.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteDialog open={!!deleteTarget} title="מחיקת פנייה" message="האם למחוק פנייה זו לצמיתות?"
        loading={mutating} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default ContactMessages;
