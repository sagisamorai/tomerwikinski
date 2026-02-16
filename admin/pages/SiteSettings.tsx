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

/* Keys managed by the custom branding UI — hidden from the generic loop */
const BRANDING_KEYS = new Set([
  'logo_prefix', 'logo_suffix', 'logo_url', 'logo_size', 'logo_max_width',
  'footer_logo_prefix', 'footer_logo_suffix', 'footer_logo_url', 'footer_logo_size', 'footer_logo_max_width',
  'favicon_url',
]);

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
        setValues((prev) => ({ ...prev, [settingId]: reader.result as string }));
        toast('התמונה נטענה — לחץ "שמור הכל" לשמירה');
      };
      reader.onerror = () => toast('שגיאה בקריאת הקובץ', 'error');
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
                  if (BRANDING_KEYS.has(setting.key)) return null;
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
                          type={setting.type === 'email' ? 'email' : setting.type === 'phone' ? 'tel' : 'text'}
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
      </div>
    </div>
  );
};


/* ================================================================ */
/*  BRANDING SECTION                                                */
/* ================================================================ */

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
  useEffect(() => { if (hasFooterValues) setShowFooterLogo(true); }, [hasFooterValues]);

  /* Current values for preview */
  const navUrl = getVal('logo_url');
  const navPrefix = getVal('logo_prefix') || 'GROUP';
  const navSuffix = getVal('logo_suffix') || 'CONSULT';
  const navSize = parseInt(getVal('logo_size') || '160', 10);

  const fUrl = showFooterLogo ? getVal('footer_logo_url') : navUrl;
  const fPrefix = showFooterLogo ? (getVal('footer_logo_prefix') || navPrefix) : navPrefix;
  const fSuffix = showFooterLogo ? (getVal('footer_logo_suffix') || navSuffix) : navSuffix;
  const fSize = showFooterLogo ? parseInt(getVal('footer_logo_size') || '160', 10) : navSize;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">מיתוג ולוגו</h2>
        <p className="text-xs text-slate-400 mt-0.5">ניהול הלוגו שמופיע בניווט ובפוטר של האתר</p>
      </div>

      <div className="p-6 space-y-8">

        {/* ── LIVE PREVIEW ── */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
            <Eye size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">תצוגה מקדימה</span>
          </div>
          {/* Navbar sim */}
          <div className="bg-white flex items-center px-5 border-b border-slate-100" style={{ height: '64px' }}>
            <div className="flex-shrink-0 overflow-hidden" style={{ maxWidth: '200px', maxHeight: '56px' }}>
              <PreviewLogo url={navUrl} prefix={navPrefix} suffix={navSuffix} size={navSize} dark={false} />
            </div>
            <div className="flex-1 flex items-center justify-center gap-3 text-[11px] text-slate-300 select-none">
              <span>דף הבית</span><span>הגישה שלנו</span><span>שירותים</span><span>צור קשר</span>
            </div>
          </div>
          {/* Footer sim */}
          <div className="bg-slate-900 flex items-center px-5" style={{ height: '56px' }}>
            <div className="flex-shrink-0 overflow-hidden" style={{ maxWidth: '200px', maxHeight: '48px' }}>
              <PreviewLogo url={fUrl} prefix={fPrefix} suffix={fSuffix} size={fSize} dark />
            </div>
            <div className="flex-1 flex items-center justify-center gap-3 text-[10px] text-slate-600 select-none">
              <span>ניווט מהיר</span><span>•</span><span>פרטי קשר</span>
            </div>
          </div>
        </div>

        {/* ── MAIN LOGO ── */}
        <LogoEditor
          title="לוגו ראשי (ניווט עליון)"
          subtitle="הלוגו שמופיע בראש כל עמוד"
          urlKey="logo_url" prefixKey="logo_prefix" suffixKey="logo_suffix" sizeKey="logo_size"
          getVal={getVal} setVal={setVal} findSetting={findSetting} values={values}
          onImageUpload={onImageUpload} onClearImage={onClearImage}
        />

        {/* ── FOOTER LOGO TOGGLE ── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFooterLogo(!showFooterLogo)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-right"
          >
            <div>
              <span className="text-sm font-semibold text-slate-700">לוגו נפרד לפוטר</span>
              <span className="text-xs text-slate-400 mr-2">
                {showFooterLogo ? '(פעיל)' : '(כבוי — משתמש בלוגו הראשי)'}
              </span>
            </div>
            <ToggleSwitch on={showFooterLogo} />
          </button>
          {showFooterLogo && (
            <div className="p-5 border-t border-slate-200">
              <LogoEditor
                title="" subtitle=""
                urlKey="footer_logo_url" prefixKey="footer_logo_prefix" suffixKey="footer_logo_suffix" sizeKey="footer_logo_size"
                getVal={getVal} setVal={setVal} findSetting={findSetting} values={values}
                onImageUpload={onImageUpload} onClearImage={onClearImage} compact
              />
            </div>
          )}
        </div>

        {/* ── FAVICON ── */}
        {findSetting('favicon_url') && (
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Favicon (אייקון כרטיסיה)</label>
            <ImageUploadField
              value={values[findSetting('favicon_url')!.id] || ''}
              onChange={(val) => setVal('favicon_url', val)}
              onUpload={(file) => onImageUpload(findSetting('favicon_url')!.id, file)}
              onClear={() => onClearImage(findSetting('favicon_url')!.id)}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
};


/* ================================================================ */
/*  LOGO EDITOR                                                     */
/* ================================================================ */

interface LogoEditorProps {
  title: string;
  subtitle: string;
  urlKey: string;
  prefixKey: string;
  suffixKey: string;
  sizeKey: string;
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
  getVal, setVal, findSetting, values,
  onImageUpload, onClearImage, compact,
}) => {
  const logoUrl = getVal(urlKey);
  const [mode, setMode] = useState<'image' | 'text'>(logoUrl ? 'image' : 'text');
  useEffect(() => { if (logoUrl) setMode('image'); }, [logoUrl]);

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

      {/* Mode buttons */}
      <div className="flex gap-2 mb-4">
        <ModeBtn active={isImage} icon={<Image size={14} />} label="העלאת תמונה" onClick={() => setMode('image')} />
        <ModeBtn
          active={!isImage}
          icon={<Type size={14} />}
          label="לוגו טקסט"
          onClick={() => {
            setMode('text');
            if (logoUrl && urlSetting) onClearImage(urlSetting.id);
          }}
        />
      </div>

      {/* Content */}
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
            <input type="text" value={getVal(prefixKey)} onChange={(e) => setVal(prefixKey, e.target.value)}
              placeholder="GROUP" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">חלק שני (כהה)</label>
            <input type="text" value={getVal(suffixKey)} onChange={(e) => setVal(suffixKey, e.target.value)}
              placeholder="CONSULT" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" dir="ltr" />
          </div>
        </div>
      )}

      {/* Unified size slider — same range for both modes */}
      {sizeSetting && (
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">גודל הלוגו</label>
          <SimpleSlider
            value={values[sizeSetting.id] || '160'}
            onChange={(v) => setVal(sizeKey, v)}
            min={60} max={300} step={5}
          />
          <p className="text-[10px] text-slate-400 mt-1">
            גרור ימינה להגדלה, שמאלה להקטנה.
          </p>
        </div>
      )}
    </div>
  );
};


/* ================================================================ */
/*  Small reusable pieces                                           */
/* ================================================================ */

const ModeBtn: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button
    type="button" onClick={onClick}
    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
      active ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
    }`}
  >
    {icon}{label}
  </button>
);

const ToggleSwitch: React.FC<{ on: boolean }> = ({ on }) => (
  <div className={`w-10 h-5 rounded-full transition-colors ${on ? 'bg-slate-900' : 'bg-slate-300'} relative`}>
    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'right-0.5' : 'right-[calc(100%-18px)]'}`} />
  </div>
);

/** Preview logo that matches the actual Logo component logic */
const PreviewLogo: React.FC<{
  url: string; prefix: string; suffix: string; size: number; dark: boolean;
}> = ({ url, prefix, suffix, size, dark }) => {
  if (url) {
    return <img src={url} alt="לוגו" style={{ width: `${Math.min(size, 200)}px` }} className="h-auto object-contain max-h-full" />;
  }
  const fontSize = Math.round(Math.min(size, 200) * 0.28);
  return (
    <span className={`font-bold tracking-tight leading-none whitespace-nowrap ${dark ? 'text-white' : ''}`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.15 }}>
      <span className={dark ? 'text-slate-400' : 'text-slate-400'}>{prefix}</span>{suffix}
    </span>
  );
};

const SimpleSlider: React.FC<{
  value: string; onChange: (v: string) => void; min: number; max: number; step: number;
}> = ({ value, onChange, min, max, step }) => {
  const num = Math.max(min, Math.min(max, parseInt(value, 10) || min));
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={num}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900" />
      <div className="flex items-center gap-1 min-w-[60px]">
        <input type="number" min={min} max={max} step={step} value={num}
          onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= min && v <= max) onChange(String(v)); }}
          className="w-12 px-1.5 py-1 border border-slate-200 rounded text-center text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900" dir="ltr" />
        <span className="text-[10px] text-slate-400">px</span>
      </div>
    </div>
  );
};


/* ================================================================ */
/*  IMAGE UPLOAD FIELD                                              */
/* ================================================================ */

interface ImageUploadFieldProps {
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
  compact?: boolean;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onUpload, onClear, compact }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => { if (file.type.startsWith('image/')) onUpload(file); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <img src={value} alt="תצוגה" className={`${compact ? 'max-h-14' : 'max-h-20'} w-auto object-contain`} />
          <button type="button" onClick={onClear}
            className="absolute -top-1.5 -left-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow">
            <X size={10} />
          </button>
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${compact ? 'px-3 py-2.5' : 'p-4'} ${dragOver ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400'}`}
      >
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Upload size={compact ? 14 : 18} />
          <span className={compact ? 'text-xs' : 'text-sm'}>גרור תמונה לכאן או לחץ להעלאה</span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
    </div>
  );
};

export default SiteSettings;
