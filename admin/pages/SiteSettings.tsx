import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import { useSiteSettings } from '../../lib/useSiteSettings';
import LangTabs from '../components/LangTabs';

interface Setting {
  id: string;
  key: string;
  value: string;
  value_en?: string;
  value_pt?: string;
  group: string;
  label: string;
  type: string;
  order: number;
}

const groupLabels: Record<string, string> = {
  general: 'כללי',
  contact: 'פרטי התקשרות',
  seo: 'SEO',
  branding: 'מיתוג',
  social: 'רשתות חברתיות',
};

const SiteSettings: React.FC = () => {
  const { data, loading, refetch } = useApi<Setting[]>('/api/settings');
  const { mutate, loading: saving } = useApiMutation();
  const { toast } = useToast();
  const { refetch: refetchSiteSettings } = useSiteSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [valuesEn, setValuesEn] = useState<Record<string, string>>({});
  const [valuesPt, setValuesPt] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const map: Record<string, string> = {};
      const mapEn: Record<string, string> = {};
      const mapPt: Record<string, string> = {};
      data.forEach((s) => {
        map[s.id] = s.value;
        mapEn[s.id] = s.value_en || '';
        mapPt[s.id] = s.value_pt || '';
      });
      setValues(map);
      setValuesEn(mapEn);
      setValuesPt(mapPt);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      const settings = Object.entries(values).map(([id, value]) => ({
        id,
        value,
        value_en: valuesEn[id] || '',
        value_pt: valuesPt[id] || '',
      }));
      await mutate('/api/settings/bulk/update', 'PUT', { settings });
      toast('ההגדרות נשמרו בהצלחה');
      refetch();
      refetchSiteSettings();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleImageUpload = async (settingId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', 'לוגו');
      formData.append('categoryId', '');
      const result = await mutate('/api/media', 'POST', formData, true);
      setValues((prev) => ({ ...prev, [settingId]: result.url }));
      toast('התמונה הועלתה בהצלחה');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleClearImage = (settingId: string) => {
    setValues((prev) => ({ ...prev, [settingId]: '' }));
  };

  if (loading) return <div className="text-center py-20 text-slate-400">טוען...</div>;

  const groups = new Map<string, Setting[]>();
  (data || []).forEach((s) => {
    if (!groups.has(s.group)) groups.set(s.group, []);
    groups.get(s.group)!.push(s);
  });

  const getValueByKey = (key: string): string => {
    const setting = (data || []).find((s) => s.key === key);
    if (!setting) return '';
    return values[setting.id] || '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">הגדרות אתר</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'שומר...' : 'שמור הכל'}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {Array.from(groups.entries()).map(([groupKey, settings]) => (
          <div key={groupKey} className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-5 text-slate-900">{groupLabels[groupKey] || groupKey}</h2>

            {/* Live logo preview for branding group */}
            {groupKey === 'branding' && (
              <LogoPreview
                logoUrl={getValueByKey('logo_url')}
                prefix={getValueByKey('logo_prefix') || 'GROUP'}
                suffix={getValueByKey('logo_suffix') || 'CONSULT'}
                size={parseInt(getValueByKey('logo_size') || '40', 10)}
              />
            )}

            <div className="space-y-5">
              {settings.map((setting) => {
                const isTranslatable = ['text', 'textarea'].includes(setting.type);

                return (
                  <div key={setting.id}>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">{setting.label}</label>

                    {setting.type === 'image' ? (
                      <ImageUploadField
                        value={values[setting.id] || ''}
                        onChange={(val) => setValues((prev) => ({ ...prev, [setting.id]: val }))}
                        onUpload={(file) => handleImageUpload(setting.id, file)}
                        onClear={() => handleClearImage(setting.id)}
                      />
                    ) : setting.type === 'range' ? (
                      <RangeField
                        value={values[setting.id] || '40'}
                        onChange={(val) => setValues((prev) => ({ ...prev, [setting.id]: val }))}
                        min={16}
                        max={80}
                        step={2}
                        unit="px"
                      />
                    ) : isTranslatable ? (
                      <LangTabs>
                        {(lang, _suffix) => {
                          const valMap = lang === 'he' ? values : lang === 'en' ? valuesEn : valuesPt;
                          const setMap = lang === 'he' ? setValues : lang === 'en' ? setValuesEn : setValuesPt;

                          return setting.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={valMap[setting.id] || ''}
                              onChange={(e) => setMap((prev) => ({ ...prev, [setting.id]: e.target.value }))}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                              dir={lang === 'he' ? 'rtl' : 'ltr'}
                              placeholder={lang !== 'he' ? values[setting.id]?.slice(0, 60) : ''}
                            />
                          ) : (
                            <input
                              type="text"
                              value={valMap[setting.id] || ''}
                              onChange={(e) => setMap((prev) => ({ ...prev, [setting.id]: e.target.value }))}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                              dir={lang === 'he' ? 'rtl' : 'ltr'}
                              placeholder={lang !== 'he' ? values[setting.id] : ''}
                            />
                          );
                        }}
                      </LangTabs>
                    ) : (
                      <input
                        type={setting.type === 'email' ? 'email' : setting.type === 'phone' ? 'tel' : setting.type === 'url' ? 'url' : 'text'}
                        value={values[setting.id] || ''}
                        onChange={(e) => setValues((prev) => ({ ...prev, [setting.id]: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        dir={setting.type === 'email' || setting.type === 'url' ? 'ltr' : 'rtl'}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groups.size === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            אין הגדרות מוגדרות. הריצו את ה-seed כדי לייצר הגדרות ברירת מחדל.
          </div>
        )}
      </div>
    </div>
  );
};


/* ============ Logo Preview ============ */

interface LogoPreviewProps {
  logoUrl: string;
  prefix: string;
  suffix: string;
  size: number;
}

const NAVBAR_MAX = 56;
const FOOTER_SCALE = 0.80;
const FOOTER_MAX = 44;

const LogoPreview: React.FC<LogoPreviewProps> = ({ logoUrl, prefix, suffix, size }) => {
  const navbarSize = Math.min(size, NAVBAR_MAX);
  const footerSize = Math.min(Math.round(size * FOOTER_SCALE), FOOTER_MAX);

  const renderLogo = (displaySize: number, textClass: string, prefixCls: string) => {
    if (logoUrl) {
      return <img src={logoUrl} alt="לוגו" style={{ height: `${displaySize}px` }} className="w-auto object-contain" />;
    }
    return (
      <span className={`font-bold tracking-tight leading-none ${textClass}`} style={{ fontSize: `${displaySize}px`, lineHeight: 1.1 }}>
        <span className={prefixCls}>{prefix}</span>{suffix}
      </span>
    );
  };

  return (
    <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="text-xs font-semibold text-slate-400 mb-3">תצוגה מקדימה של הלוגו</div>
      <div className="flex items-stretch gap-4">
        {/* Navbar preview */}
        <div className="flex-1">
          <div className="text-[10px] text-slate-400 mb-1.5 text-center font-medium">ניווט עליון ({navbarSize}px)</div>
          <div className="bg-white border border-slate-100 rounded-lg p-4 flex items-center justify-center" style={{ minHeight: '68px' }}>
            {renderLogo(navbarSize, '', 'text-slate-500')}
          </div>
        </div>
        {/* Footer/dark preview */}
        <div className="flex-1">
          <div className="text-[10px] text-slate-400 mb-1.5 text-center font-medium">פוטר / סיידבר ({footerSize}px)</div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-center" style={{ minHeight: '68px' }}>
            {renderLogo(footerSize, 'text-white', 'text-slate-400')}
          </div>
        </div>
      </div>
      {size > NAVBAR_MAX && (
        <div className="text-xs text-amber-600 mt-2 text-center">
          הגודל שנבחר ({size}px) מוגבל ל-{NAVBAR_MAX}px בניווט העליון כדי לשמור על מראה תקין
        </div>
      )}
    </div>
  );
};


/* ============ Range Field ============ */

interface RangeFieldProps {
  value: string;
  onChange: (val: string) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

const RangeField: React.FC<RangeFieldProps> = ({ value, onChange, min, max, step, unit = '' }) => {
  const numVal = parseInt(value, 10) || min;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numVal}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />
        <div className="flex items-center gap-1 min-w-[70px]">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={numVal}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= min && v <= max) onChange(String(v));
            }}
            className="w-14 px-2 py-1 border border-slate-200 rounded text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
            dir="ltr"
          />
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};


/* ============ Image Upload Field ============ */

interface ImageUploadFieldProps {
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onChange, onUpload, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative inline-block bg-slate-50 border border-slate-200 rounded-lg p-3">
          <img src={value} alt="תצוגה מקדימה" className="max-h-20 w-auto object-contain" />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <Upload size={20} />
          <span className="text-sm">גרור תמונה לכאן או לחץ להעלאה</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 whitespace-nowrap">או הזן URL:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default SiteSettings;
