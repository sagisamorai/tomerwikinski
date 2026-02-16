import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  currentUrl?: string | null;
  accept?: string;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  currentUrl,
  accept = 'image/*',
  label = 'העלאת קובץ',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const displayUrl = preview || currentUrl;

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-slate-700">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400'
        }`}
      >
        {displayUrl ? (
          <div className="relative inline-block">
            <img src={displayUrl} alt="תצוגה מקדימה" className="max-h-32 rounded-lg mx-auto" />
            <button
              onClick={(e) => { e.stopPropagation(); setPreview(null); }}
              className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Upload size={32} />
            <span className="text-sm">גרור קובץ לכאן או לחץ לבחירה</span>
            <span className="text-xs">JPG, PNG, GIF, WebP, SVG עד 10MB</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
