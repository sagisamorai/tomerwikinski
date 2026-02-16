import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DeleteDialog from '../components/DeleteDialog';
import RoleGuard from '../components/RoleGuard';

interface FAQ { id: string; question: string; answer: string; order: number; isActive: boolean; }

const FAQManager: React.FC = () => {
  const { data, loading, refetch } = useApi<FAQ[]>('/api/faq');
  const { mutate, loading: deleting } = useApiMutation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutate(`/api/faq/${deleteTarget.id}`, 'DELETE');
      toast('השאלה נמחקה בהצלחה');
      setDeleteTarget(null); refetch();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const columns: Column<FAQ>[] = [
    { key: 'question', label: 'שאלה', sortable: true },
    { key: 'answer', label: 'תשובה', render: (f) => <span className="truncate block max-w-xs">{f.answer}</span> },
    { key: 'order', label: 'סדר', sortable: true, className: 'w-20' },
    { key: 'isActive', label: 'סטטוס', render: (f) => <StatusBadge active={f.isActive} /> },
  ];

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">שאלות נפוצות</h1>
        <Link to="/admin/faq/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800">
          <Plus size={16} />שאלה חדשה
        </Link>
      </div>
      <DataTable data={data || []} columns={columns} searchPlaceholder="חיפוש שאלות..."
        searchKeys={['question', 'answer']} emptyMessage="לא נמצאו שאלות"
        actions={(f) => (
          <>
            <button onClick={() => navigate(`/admin/faq/${f.id}`)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="עריכה"><Pencil size={15} /></button>
            <RoleGuard roles={['admin']}>
              <button onClick={() => setDeleteTarget(f)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="מחיקה"><Trash2 size={15} /></button>
            </RoleGuard>
          </>
        )} />
      <DeleteDialog open={!!deleteTarget} title="מחיקת שאלה" message={`האם למחוק את השאלה?`}
        loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default FAQManager;
