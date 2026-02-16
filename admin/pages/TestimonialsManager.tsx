import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DeleteDialog from '../components/DeleteDialog';
import RoleGuard from '../components/RoleGuard';

interface Testimonial {
  id: string; name: string; role: string; company: string | null;
  content: string; order: number; isActive: boolean; updatedAt: string;
}

const TestimonialsManager: React.FC = () => {
  const { data, loading, refetch } = useApi<Testimonial[]>('/api/testimonials');
  const { mutate, loading: deleting } = useApiMutation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutate(`/api/testimonials/${deleteTarget.id}`, 'DELETE');
      toast('ההמלצה נמחקה בהצלחה');
      setDeleteTarget(null); refetch();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const columns: Column<Testimonial>[] = [
    { key: 'name', label: 'שם', sortable: true },
    { key: 'role', label: 'תפקיד' },
    { key: 'company', label: 'חברה' },
    { key: 'order', label: 'סדר', sortable: true, className: 'w-20' },
    { key: 'isActive', label: 'סטטוס', render: (t) => <StatusBadge active={t.isActive} /> },
  ];

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול המלצות</h1>
        <Link to="/admin/testimonials/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800">
          <Plus size={16} />המלצה חדשה
        </Link>
      </div>
      <DataTable data={data || []} columns={columns} searchPlaceholder="חיפוש המלצות..."
        searchKeys={['name', 'company', 'content']} emptyMessage="לא נמצאו המלצות"
        actions={(t) => (
          <>
            <button onClick={() => navigate(`/admin/testimonials/${t.id}`)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="עריכה"><Pencil size={15} /></button>
            <RoleGuard roles={['admin']}>
              <button onClick={() => setDeleteTarget(t)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="מחיקה"><Trash2 size={15} /></button>
            </RoleGuard>
          </>
        )} />
      <DeleteDialog open={!!deleteTarget} title="מחיקת המלצה" message={`האם למחוק את ההמלצה של "${deleteTarget?.name}"?`}
        loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default TestimonialsManager;
