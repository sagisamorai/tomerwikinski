import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DeleteDialog from '../components/DeleteDialog';
import RoleGuard from '../components/RoleGuard';

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  _count?: { media: number };
}

const CategoriesManager: React.FC = () => {
  const { data, loading, refetch } = useApi<Category[]>('/api/categories');
  const { mutate, loading: deleting } = useApiMutation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutate(`/api/categories/${deleteTarget.id}`, 'DELETE');
      toast('הקטגוריה נמחקה בהצלחה');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const columns: Column<Category>[] = [
    { key: 'name', label: 'שם', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true, className: 'font-mono text-xs' },
    { key: 'order', label: 'סדר', sortable: true, className: 'w-20' },
    {
      key: '_count',
      label: 'פריטי מדיה',
      render: (c) => c._count?.media || 0,
    },
    {
      key: 'isActive',
      label: 'סטטוס',
      render: (c) => <StatusBadge active={c.isActive} />,
    },
  ];

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול קטגוריות</h1>
        <Link
          to="/admin/categories/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          <Plus size={16} />
          קטגוריה חדשה
        </Link>
      </div>

      <DataTable
        data={data || []}
        columns={columns}
        searchPlaceholder="חיפוש קטגוריות..."
        searchKeys={['name', 'slug']}
        emptyMessage="לא נמצאו קטגוריות"
        actions={(cat) => (
          <>
            <button onClick={() => navigate(`/admin/categories/${cat.id}`)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="עריכה">
              <Pencil size={15} />
            </button>
            <RoleGuard roles={['admin']}>
              <button onClick={() => setDeleteTarget(cat)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="מחיקה">
                <Trash2 size={15} />
              </button>
            </RoleGuard>
          </>
        )}
      />

      <DeleteDialog
        open={!!deleteTarget}
        title="מחיקת קטגוריה"
        message={`האם למחוק את הקטגוריה "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CategoriesManager;
