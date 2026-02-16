import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DeleteDialog from '../components/DeleteDialog';
import RoleGuard from '../components/RoleGuard';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

const PagesManager: React.FC = () => {
  const { data, loading, refetch } = useApi<Page[]>('/api/pages');
  const { mutate, loading: deleting } = useApiMutation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutate(`/api/pages/${deleteTarget.id}`, 'DELETE');
      toast('הדף נמחק בהצלחה');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const columns: Column<Page>[] = [
    { key: 'title', label: 'כותרת', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true, className: 'font-mono text-xs' },
    {
      key: 'status',
      label: 'סטטוס',
      sortable: true,
      render: (p) => (
        <StatusBadge
          active={p.status === 'published'}
          activeLabel="מפורסם"
          inactiveLabel="טיוטה"
        />
      ),
    },
    {
      key: 'updatedAt',
      label: 'עדכון אחרון',
      sortable: true,
      render: (p) => new Date(p.updatedAt).toLocaleDateString('he-IL'),
    },
  ];

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול דפים</h1>
        <Link
          to="/admin/pages/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          <Plus size={16} />
          דף חדש
        </Link>
      </div>

      <DataTable
        data={data || []}
        columns={columns}
        searchPlaceholder="חיפוש דפים..."
        searchKeys={['title', 'slug']}
        emptyMessage="לא נמצאו דפים"
        actions={(page) => (
          <>
            <button
              onClick={() => navigate(`/admin/pages/${page.id}`)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
              title="עריכה"
            >
              <Pencil size={15} />
            </button>
            <RoleGuard roles={['admin']}>
              <button
                onClick={() => setDeleteTarget(page)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="מחיקה"
              >
                <Trash2 size={15} />
              </button>
            </RoleGuard>
          </>
        )}
      />

      <DeleteDialog
        open={!!deleteTarget}
        title="מחיקת דף"
        message={`האם למחוק את הדף "${deleteTarget?.title}"? הפעולה תעביר את הדף לסטטוס מחוק.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PagesManager;
