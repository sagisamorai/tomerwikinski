import React, { useState, useRef } from 'react';
import { Upload, Trash2, Pencil, X, Save } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import DeleteDialog from '../components/DeleteDialog';
import RoleGuard from '../components/RoleGuard';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  categoryId: string | null;
  createdAt: string;
}

const MediaLibrary: React.FC = () => {
  const { data, loading, refetch } = useApi<MediaItem[]>('/api/media');
  const { mutate, loading: mutating } = useApiMutation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [editTarget, setEditTarget] = useState<MediaItem | null>(null);
  const [editAlt, setEditAlt] = useState('');

  const handleUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await mutate('/api/media', 'POST', formData, true);
        toast(`"${file.name}" הועלה בהצלחה`);
      } catch (err: any) {
        toast(err.message, 'error');
      }
    }
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutate(`/api/media/${deleteTarget.id}`, 'DELETE');
      toast('הקובץ נמחק בהצלחה');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    try {
      await mutate(`/api/media/${editTarget.id}`, 'PUT', { alt: editAlt });
      toast('פרטי הקובץ עודכנו');
      setEditTarget(null);
      refetch();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ספריית מדיה</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          <Upload size={16} />
          העלאת קובץ
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.svg"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {(!data || data.length === 0) ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center">
          <Upload size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-2">אין קבצים בספרייה</p>
          <button onClick={() => fileInputRef.current?.click()}
            className="text-slate-900 font-semibold text-sm hover:underline">לחץ להעלאת קובץ</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {item.mimeType.startsWith('image/') ? (
                  <img src={item.url} alt={item.alt || item.originalName} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 text-xs text-center p-2">{item.originalName}</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-slate-700 truncate" title={item.originalName}>{item.originalName}</p>
                <p className="text-xs text-slate-400">{formatSize(item.size)}</p>
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditTarget(item); setEditAlt(item.alt || ''); }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="עריכה"
                  >
                    <Pencil size={13} />
                  </button>
                  <RoleGuard roles={['admin']}>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="מחיקה"
                    >
                      <Trash2 size={13} />
                    </button>
                  </RoleGuard>
                  <button
                    onClick={() => { navigator.clipboard.writeText(item.url); toast('הקישור הועתק', 'info'); }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded text-xs"
                    title="העתק URL"
                  >
                    URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Alt Dialog */}
      {editTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 z-10">
            <button onClick={() => setEditTarget(null)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4">עריכת פרטי קובץ</h3>
            <p className="text-sm text-slate-500 mb-4">{editTarget.originalName}</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-slate-700">טקסט חלופי (Alt)</label>
              <input type="text" value={editAlt} onChange={(e) => setEditAlt(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">ביטול</button>
              <button onClick={handleEditSave} disabled={mutating}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                <Save size={14} />שמור
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteDialog
        open={!!deleteTarget}
        title="מחיקת קובץ"
        message={`האם למחוק את "${deleteTarget?.originalName}"?`}
        loading={mutating}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default MediaLibrary;
