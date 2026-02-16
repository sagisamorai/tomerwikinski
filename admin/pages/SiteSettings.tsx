import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, X, Image, Type, Eye } from 'lucide-react';
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
      if (file.size > 2 * 1024 * 1024) {
        toast('הקובץ גדול מדי. מקסימום 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setValues((prev) => ({ ...prev, [settingId]: dataUrl }));
        toast('התמונה נטענה — לחץ "שמור הכל" לשמירה');
      };
      reader.onerror = () => {
        toast('שגיאה בקריאת הקובץ', 'error');
      };
      reader.readAsDataURL(file);
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

  const findSetting = (key: string): Setting | undefined => (data || []).find((s) => s.key === key);
  const getVal = (key: string): string => {
    const s = findSetting(key);
    return s ? (values[s.id] || '') : '';
  };
  const setVal = (key: string, val: string) => {
    const s = findSetting(key);
    if (s) setValues((prev) => ({ ...prev, [s.id]: val }));
  };

  const brandingKeys = new Set([
    'logo_prefix', 'logo_suffix', 'logo_url', 'logo_size', 'logo_max_width',
    'footer_logo_prefix', 'footer_logo_suffix', 'footer_logo_url', 'footer_logo_size', 'footer_logo_max_width',
    'favicon_url',
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">הגדרות אתר</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {saving ? 'שומר...' : 'שמור הכל'}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {Array.from(groups.entries()).map(([groupKey, settings]) => {
          if (groupKey === 'branding') {
            return (
              <BrandingSection
                key="branding"
                getVal={getVal}
                setVal={setVal}
                findSetting={findSetting}
                values={values}
                onImageUpload={handleImageUpload}
                onClearImage={handleClearImage}
              />
            );
          }

          return (
            <div key={groupKey} className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-5 text-slate-900">{groupLabels[groupKey] || groupKey}</h2>
              <div className="space-y-5">
                {settings.map((setting) => {
                  if (brandingKeys.has(setting.key)) return null;
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
                      ) : isTranslatable ? (
                        <LangTabs>
                          {(lang) => {
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
          );
        })}

        {groups.size === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            אין הגדרות מוגדרות. הריצו את ה-seed כדי לייצר הגדרות ברירת מחדל.
          </div>
        )}
      </div>
    </div>
  );
};


/* ================================================================
   BRANDING SECTION — custom layout for logo management
   ================================================================ */

interface BrandingSectionProps {
  getVal: (key: string) => string;
  setVal: (key: string, val: string) => void;
  findSetting: (key: string) => Setting | undefined;
  values: Record<string, string>;
  onImageUpload: (settingId: string, file: File) => void;
  onClearImage: (settingId: string) => void;
}

const BrandingSection: React.FC<BrandingSectionProps> = ({
  getVal, setVal, findSetting, values, onImageUpload, onClearImage,
}) => {
  const [showFooterLogo, setShowFooterLogo] = useState(false);

  const hasFooterValues = !!(getVal('footer_logo_url') || getVal('footer_logo_prefix') || getVal('footer_logo_suffix'));

  useEffect(() => {
    if (hasFooterValues) setShowFooterLogo(true);
  }, [hasFooterValues]);

  const navUrl = getVal('logo_url');
  const navPrefix = getVal('logo_prefix') || 'GROUP';
  const navSuffix = getVal('logo_suffix') || 'CONSULT';
  const navSize = parseInt(getVal('logo_size') || '160', 10);

  const fUrl = showFooterLogo ? getVal('footer_logo_url') : navUrl;
  const fPrefix = showFooterLogo ? (getVal('footer_logo_prefix') || '') : navPrefix;
  const fSuffix = showFooterLogo ? (getVal('footer_logo_suffix') || '') : navSuffix;
  const fSize = showFooterLogo ? parseInt(getVal('footer_logo_size') || '160', 10) : navSize;

  const useImage = !!navUrl;
  const footerUseImage = showFooterLogo ? !!getVal('footer_logo_url') : useImage;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">מיתוג ולוגו</h2>
        <p className="text-xs text-slate-400 mt-0.5">ניהול הלוגו של האתר — ניווט עליון ופוטר</p>
      </div>

      <div className="p-6 space-y-8">

        {/* ─────── LIVE PREVIEW ─────── */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <Eye size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">תצוגה מקדימה באתר</span>
          </div>

          {/* Navbar preview */}
          <div className="bg-white flex items-center px-4 border-b border-slate-100" style={{ minHeight: '56px', maxHeight: '90px' }}>
            <div className="flex-shrink-0 overflow-hidden" style={{ maxWidth: '40%', maxHeight: '80px' }}>
              <LogoRender url={navUrl} prefix={navPrefix} suffix={navSuffix} size={navSize} textCls="" prefixCls="text-slate-400" />
            </div>
            <div className="flex-1 flex items-center justify-center gap-3 text-[11px] text-slate-300 select-none">
              <span>דף הבית</span><span>הגישה שלנו</span><span>שירותים</span><span>צור קשר</span>
            </div>
          </div>

          {/* Footer preview */}
          <div className="bg-slate-900 flex items-center px-4" style={{ minHeight: '48px', maxHeight: '90px' }}>
            <div className="flex-shrink-0 overflow-hidden" style={{ maxHeight: '80px' }}>
              <LogoRender url={fUrl} prefix={fPrefix} suffix={fSuffix} size={fSize} textCls="text-white" prefixCls="text-slate-400" />
            </div>
            <div className="flex-1 flex items-center justify-center gap-3 text-[10px] text-slate-600 select-none">
              <span>ניווט מהיר</span><span>•</span><span>פרטי קשר</span>
            </div>
          </div>
        </div>


        {/* ─────── MAIN LOGO (NAVBAR) ─────── */}
        <LogoEditor
          title="לוגו ראשי (ניווט עליון)"
          subtitle="הלוגו שמופיע בראש כל עמוד באתר"
          urlKey="logo_url"
          prefixKey="logo_prefix"
          suffixKey="logo_suffix"
          sizeKey="logo_size"
          sizeDefault="160"
          getVal={getVal}
          setVal={setVal}
          findSetting={findSetting}
          values={values}
          onImageUpload={onImageUpload}
          onClearImage={onClearImage}
        />


        {/* ─────── FOOTER LOGO ─────── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFooterLogo(!showFooterLogo)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-right"
          >
            <div>
              <span className="text-sm font-semibold text-slate-700">לוגו נפרד לפוטר</span>
              <span className="text-xs text-slate-400 mr-2">
                {showFooterLogo ? '(פעיל — לוגו שונה בתחתית)' : '(כבוי — משתמש בלוגו הראשי)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-5 rounded-full transition-colors ${showFooterLogo ? 'bg-slate-900' : 'bg-slate-300'} relative`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showFooterLogo ? 'right-0.5' : 'right-[calc(100%-18px)]'}`} />
              </div>
            </div>
          </button>

          {showFooterLogo && (
            <div className="p-5 border-t border-slate-200 bg-white">
              <LogoEditor
                title=""
                subtitle=""
                urlKey="footer_logo_url"
                prefixKey="footer_logo_prefix"
                suffixKey="footer_logo_suffix"
                sizeKey="footer_logo_size"
                sizeDefault="160"
                getVal={getVal}
                setVal={setVal}
                findSetting={findSetting}
                values={values}
                onImageUpload={onImageUpload}
                onClearImage={onClearImage}
                compact
              />
            </div>
          )}
        </div>


        {/* ─────── FAVICON ─────── */}
        {findSetting('favicon_url') && (
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Favicon (אייקון כרטיסיה)</label>
            <ImageUploadField
              value={values[findSetting('favicon_url')!.id] || ''}
              onChange={(val) => {
                const s = findSetting('favicon_url');
                if (s) {
                  const prev = { ...values };
                  prev[s.id] = val;
                  // We can't call setValues from here directly, use setVal
                  setVal('favicon_url', val);
                }
              }}
              onUpload={(file) => {
                const s = findSetting('favicon_url');
                if (s) onImageUpload(s.id, file);
              }}
              onClear={() => {
                const s = findSetting('favicon_url');
                if (s) onClearImage(s.id);
              }}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
};


/* ================================================================
   LOGO EDITOR — reusable card for editing a single logo
   ================================================================ */

interface LogoEditorProps {
  title: string;
  subtitle: string;
  urlKey: string;
  prefixKey: string;
  suffixKey: string;
  sizeKey: string;
  sizeDefault: string;
  getVal: (key: string) => string;
  setVal: (key: string, val: string) => void;
  findSetting: (key: string) => Setting | undefined;
  values: Record<string, string>;
  onImageUpload: (settingId: string, file: File) => void;
  onClearImage: (settingId: string) => void;
  compact?: boolean;
}

const LogoEditor: React.FC<LogoEditorProps> = ({
  title, subtitle, urlKey, prefixKey, suffixKey, sizeKey,
  sizeDefault, getVal, setVal, findSetting, values,
  onImageUpload, onClearImage, compact,
}) => {
  const logoUrl = getVal(urlKey);
  const [mode, setMode] = useState<'image' | 'text'>(logoUrl ? 'image' : 'text');

  useEffect(() => {
    if (logoUrl) setMode('image');
  }, [logoUrl]);

  const urlSetting = findSetting(urlKey);
  const sizeSetting = findSetting(sizeKey);
  const isImage = mode === 'image';

  return (
    <div className={compact ? '' : 'border border-slate-200 rounded-xl p-5'}>
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => { setMode('image'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            isImage
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Image size={14} />
          העלאת תמונה
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('text');
            if (logoUrl && urlSetting) {
              onClearImage(urlSetting.id);
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            !isImage
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Type size={14} />
          לוגו טקסט
        </button>
      </div>

      {/* Content based on mode */}
      {isImage ? (
        <div className="mb-4">
          {urlSetting && (
            <ImageUploadField
              value={values[urlSetting.id] || ''}
              onChange={(val) => setVal(urlKey, val)}
              onUpload={(file) => onImageUpload(urlSetting.id, file)}
              onClear={() => onClearImage(urlSetting.id)}
              compact
            />
          )}
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">חלק ראשון (בהיר)</label>
            <input
              type="text"
              value={getVal(prefixKey)}
              onChange={(e) => setVal(prefixKey, e.target.value)}
              placeholder="GROUP"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">חלק שני (כהה)</label>
            <input
              type="text"
              value={getVal(suffixKey)}
              onChange={(e) => setVal(suffixKey, e.target.value)}
              placeholder="CONSULT"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              dir="ltr"
            />
          </div>
        </div>
      )}

      {/* Size control - slider label changes based on mode */}
      {sizeSetting && (
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">
            {isImage ? 'רוחב הלוגו' : 'גודל הטקסט'}
          </label>
          <SimpleSlider
            value={values[sizeSetting.id] || sizeDefault}
            onChange={(v) => setVal(sizeKey, v)}
            min={isImage ? 60 : 20}
            max={isImage ? 300 : 80}
            step={isImage ? 5 : 2}
          />
          <p className="text-[10px] text-slate-400 mt-1">
            {isImage
              ? 'גרור ימינה להגדלה, שמאלה להקטנה. הלוגו ישמור על הפרופורציות שלו.'
              : 'גרור ימינה להגדלה, שמאלה להקטנה.'}
          </p>
        </div>
      )}
    </div>
  );
};


/* ================================================================
   LOGO RENDER — tiny preview helper
   ================================================================ */

const LogoRender: React.FC<{
  url: string; prefix: string; suffix: string;
  size: number; textCls: string; prefixCls: string;
}> = ({ url, prefix, suffix, size, textCls, prefixCls }) => {
  if (url) {
    return <img src={url} alt="לוגו" style={{ width: `${size}px` }} className="h-auto object-contain max-w-full max-h-full" />;
  }
  if (!prefix && !suffix) {
    return <span className="text-[10px] text-slate-400 italic">ללא לוגו</span>;
  }
  return (
    <span className={`font-bold tracking-tight leading-none whitespace-nowrap ${textCls}`} style={{ fontSize: `${Math.min(size, 40)}px`, lineHeight: 1.1 }}>
      <span className={prefixCls}>{prefix}</span>{suffix}
    </span>
  );
};


/* ================================================================
   SIMPLE SLIDER — clean range input with number
   ================================================================ */

const SimpleSlider: React.FC<{
  value: string; onChange: (v: string) => void;
  min: number; max: number; step: number;
}> = ({ value, onChange, min, max, step }) => {
  const num = parseInt(value, 10) || min;
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min} max={max} step={step} value={num}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
      />
      <div className="flex items-center gap-1 min-w-[60px]">
        <input
          type="number"
          min={min} max={max} step={step} value={num}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= min && v <= max) onChange(String(v));
          }}
          className="w-12 px-1.5 py-1 border border-slate-200 rounded text-center text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
          dir="ltr"
        />
        <span className="text-[10px] text-slate-400">px</span>
      </div>
    </div>
  );
};


/* ================================================================
   IMAGE UPLOAD FIELD
   ================================================================ */

interface ImageUploadFieldProps {
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
  compact?: boolean;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onChange, onUpload, onClear, compact }) => {
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
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <img src={value} alt="תצוגה" className={`${compact ? 'max-h-14' : 'max-h-20'} w-auto object-contain`} />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-1.5 -left-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
          >
            <X size={10} />
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          compact ? 'px-3 py-2.5' : 'p-4'
        } ${
          dragOver ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Upload size={compact ? 14 : 18} />
          <span className={compact ? 'text-xs' : 'text-sm'}>גרור תמונה לכאן או לחץ להעלאה</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default SiteSettings;
