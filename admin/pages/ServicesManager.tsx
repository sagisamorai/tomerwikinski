import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DeleteDialog from '../components/DeleteDialog';
import RoleGuard from '../components/RoleGuard';

interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  order: number;
  isActive: boolean;
  updatedAt: string;
}

const ServicesManager: React.FC = () => {
  const { data, loading, refetch } = useApi<Service[]>('/api/services');
  const { mutate, loading: deleting } = useApiMutation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutate(`/api/services/${deleteTarget.id}`, 'DELETE');
      toast('השירות נמחק בהצלחה');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const columns: Column<Service>[] = [
    { key: 'title', label: 'כותרת', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true, className: 'font-mono text-xs' },
    { key: 'order', label: 'סדר', sortable: true, className: 'w-20' },
    {
      key: 'isActive',
      label: 'סטטוס',
      render: (s) => <StatusBadge active={s.isActive} />,
    },
    {
      key: 'updatedAt',
      label: 'עדכון אחרון',
      render: (s) => new Date(s.updatedAt).toLocaleDateString('he-IL'),
    },
  ];

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול שירותים</h1>
        <Link
          to="/admin/services/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          <Plus size={16} />
          שירות חדש
        </Link>
      </div>

      <DataTable
        data={data || []}
        columns={columns}
        searchPlaceholder="חיפוש שירותים..."
        searchKeys={['title', 'slug']}
        emptyMessage="לא נמצאו שירותים"
        actions={(service) => (
          <>
            <button
              onClick={() => navigate(`/admin/services/${service.id}`)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
              title="עריכה"
            >
              <Pencil size={15} />
            </button>
            <RoleGuard roles={['admin']}>
              <button
                onClick={() => setDeleteTarget(service)}
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
        title="מחיקת שירות"
        message={`האם למחוק את השירות "${deleteTarget?.title}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ServicesManager;
