import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RegPageStrip } from './WorkshopRegPage';
import { Plus, Copy, Trash2, Edit3, Upload, Save, Download, Link as LinkIcon, Eye, EyeOff, Loader2, X, Star, Files } from 'lucide-react';
import {
  workshopService,
  renderCertificate,
  compressTemplate,
  DEFAULT_LAYOUT,
  Workshop,
  WorkshopReg,
  CertLayout,
  TextSpot,
  workshopUrl,
  verifyUrl
} from '../../services/workshopService';

const FONTS: TextSpot['font'][] = ['Tajawal', 'Cinzel', 'Plus Jakarta Sans'];

// الإدارة فقط: الورش المجانية وقالب الشهادة والمسجّلات وتقييماتهن
export const AdminWorkshops: React.FC<{ isAr: boolean; onNotice: (m: string) => void }> = ({ isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [list, setList] = useState<Workshop[]>([]);
  const [regs, setRegs] = useState<WorkshopReg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Workshop> | null>(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [w, r] = await Promise.all([workshopService.list(), workshopService.registrations().catch(() => [])]);
      setList(w);
      setRegs(r);
    } catch (e: any) {
      onNotice(`${tr('Could not load workshops:', 'تعذر تحميل الورش:')} ${e?.code || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(workshopUrl(id));
      onNotice(tr('Link copied.', 'تم نسخ الرابط.'));
    } catch {
      window.prompt(tr('Copy the link:', 'انسخي الرابط:'), workshopUrl(id));
    }
  };

  const shown = useMemo(() => regs.filter((r) => !filter || r.workshopId === filter), [regs, filter]);

  const exportCsv = () => {
    const head = ['Serial', 'Workshop', 'Name', 'Email', 'WhatsApp', 'Country', 'Rating', 'Benefit/10', 'Feedback', 'Date'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = shown.map((r) => [r.serial, r.workshopTitle, r.name, r.email, r.phone, r.country, r.rating, r.benefit, r.feedback, r.createdAt?.slice(0, 10)].map(esc).join(','));
    const blob = new Blob(['﻿' + [head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'workshop-registrations.csv';
    a.click();
  };

  const stats = (id: string) => {
    const r = regs.filter((x) => x.workshopId === id);
    const avg = (k: 'rating' | 'benefit') => (r.length ? (r.reduce((s, x) => s + (Number(x[k]) || 0), 0) / r.length).toFixed(1) : '—');
    return { count: r.length, rating: avg('rating'), benefit: avg('benefit') };
  };

  if (editing) {
    return (
      <WorkshopEditor
        isAr={isAr}
        initial={editing}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await load();
          onNotice(tr('Workshop saved.', 'تم حفظ الورشة.'));
        }}
        onNotice={onNotice}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{tr('Free workshops & certificates', 'الورش المجانية والشهادات')}</h2>
            <p className="text-xs text-gray-500">
              {tr('Share the workshop link; attendees register, rate it and get a certificate with a serial number and QR code instantly.', 'شاركي رابط الورشة: تسجّل المتدربة وتقيّم الورشة وتحصل فورًا على شهادة برقم تسلسلي ورمز QR للتحقق.')}
            </p>
          </div>
          <button onClick={() => setEditing({ title: '', active: true, layout: DEFAULT_LAYOUT })} className="px-4 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            {tr('New workshop', 'ورشة جديدة')}
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No workshops yet.', 'لا توجد ورش بعد.')}</div>
        ) : (
          <div className="space-y-3">
            {list.map((w) => {
              const s = stats(w.id);
              return (
                <div key={w.id} className="p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
                  {w.template ? <img src={w.template} alt="" className="w-24 h-16 object-cover rounded-lg border" /> : <div className="w-24 h-16 rounded-lg bg-gray-100 text-[10px] text-gray-400 flex items-center justify-center">{tr('No template', 'بلا قالب')}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <b className="text-sm text-[#0A192F]">{w.title}</b>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${w.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {w.active ? tr('Open', 'مفتوحة') : tr('Closed', 'مغلقة')}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {tr('Registrations', 'المسجّلات')}: {s.count} • ⭐ {s.rating} • {tr('Benefit', 'الاستفادة')}: {s.benefit}/10
                    </div>
                    <div className="text-[10px] text-gray-400 break-all" dir="ltr">
                      {tr('Certificate link', 'رابط الشهادة')}: {workshopUrl(w.id)}
                    </div>
                    <RegPageStrip w={w} onNotice={onNotice} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => copyLink(w.id)} className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#0A192F] text-[11px] font-bold flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" />
                      {tr('Copy certificate link', 'نسخ رابط الشهادة')}
                    </button>
                    <a href={workshopUrl(w.id)} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold">
                      {tr('Open', 'فتح')}
                    </a>
                    <button onClick={() => setEditing(w)} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" />
                      {tr('Edit', 'تعديل')}
                    </button>
                    <button
                      onClick={() => setEditing({ ...w, id: undefined, title: `${w.title} (${tr('copy', 'نسخة')})`, createdAt: undefined })}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold flex items-center gap-1"
                      title={tr('New workshop with the same certificate', 'ورشة جديدة بنفس الشهادة')}
                    >
                      <Files className="w-3.5 h-3.5" />
                      {tr('Duplicate', 'تكرار')}
                    </button>
                    <button
                      onClick={async () => {
                        await workshopService.setActive(w.id, !w.active);
                        load();
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold flex items-center gap-1"
                    >
                      {w.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {w.active ? tr('Close', 'إغلاق التسجيل') : tr('Open', 'فتح التسجيل')}
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(tr('Delete this workshop? Issued certificates stay valid.', 'حذف الورشة؟ الشهادات الصادرة تبقى صالحة للتحقق.'))) return;
                        await workshopService.remove(w.id);
                        load();
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-[#0A192F]">{tr('Registrations & feedback', 'المسجّلات والتقييمات')} ({shown.length})</h3>
          <div className="flex gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 text-xs">
              <option value="">{tr('All workshops', 'كل الورش')}</option>
              {list.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
            <button onClick={exportCsv} className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              Excel
            </button>
          </div>
        </div>
        {shown.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No registrations yet.', 'لا توجد تسجيلات بعد.')}</div>
        ) : (
          <div className="space-y-2">
            {shown.map((r) => (
              <div key={r.serial} className="p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="text-[#0A192F]">{r.name}</b>
                  <span className="text-[10px] text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</span>
                </div>
                <div className="text-gray-500" dir="auto">
                  {r.workshopTitle} • <span dir="ltr">{r.email}</span>
                  {r.phone ? ` • ${r.phone}` : ''}
                  {r.country ? ` • ${r.country}` : ''}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-[#D4AF37] fill-current' : 'text-gray-300'}`} />
                    ))}
                  </span>
                  <span>
                    {tr('Benefit', 'الاستفادة')}: <b>{r.benefit}/10</b>
                  </span>
                </div>
                {r.feedback && <p className="text-gray-700 whitespace-pre-line bg-[#FAF8F5] rounded-lg p-2">{r.feedback}</p>}
                <div className="flex items-center justify-between gap-2">
                  <a href={verifyUrl(r.serial)} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-[#AA820A] underline" dir="ltr">
                    {r.serial}
                  </a>
                  <button
                    onClick={async () => {
                      if (!window.confirm(tr('Delete this registration and cancel its certificate?', 'حذف هذا التسجيل وإلغاء شهادته (لن تظهر صالحة عند التحقق)؟'))) return;
                      await workshopService.deleteRegistration(r.serial);
                      setRegs((p) => p.filter((x) => x.serial !== r.serial));
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------ Editor ------------------------------ */

const WorkshopEditor: React.FC<{
  isAr: boolean;
  initial: Partial<Workshop>;
  onCancel: () => void;
  onSaved: () => void;
  onNotice: (m: string) => void;
}> = ({ isAr, initial, onCancel, onSaved, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [w, setW] = useState<Partial<Workshop>>({ ...initial, layout: JSON.parse(JSON.stringify(initial.layout || DEFAULT_LAYOUT)) });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sample, setSample] = useState(isAr ? 'أمل الحسن' : 'Amal Alhasan');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layout = w.layout as CertLayout;

  useEffect(() => {
    if (!w.template || !canvasRef.current) return;
    const t = setTimeout(() => {
      renderCertificate(canvasRef.current!, w.template!, layout, {
        name: sample,
        issuedAt: new Date().toISOString().slice(0, 10),
        serial: 'EZ-2026-SAMPLE'
      }).catch((e) => console.error(e));
    }, 150);
    return () => clearTimeout(t);
  }, [w.template, JSON.stringify(layout), sample]);

  const setSpot = (k: 'name' | 'date' | 'serial', patch: Partial<TextSpot>) => setW((p) => ({ ...p, layout: { ...(p.layout as CertLayout), [k]: { ...(p.layout as any)[k], ...patch } } }));
  const setQr = (patch: Partial<CertLayout['qr']>) => setW((p) => ({ ...p, layout: { ...(p.layout as CertLayout), qr: { ...(p.layout as CertLayout).qr, ...patch } } }));

  const save = async () => {
    if (!String(w.title || '').trim()) return onNotice(tr('Write the workshop title.', 'اكتبي عنوان الورشة.'));
    setSaving(true);
    try {
      await workshopService.save(w as any);
      onSaved();
    } catch (e: any) {
      onNotice(`${tr('Could not save:', 'تعذر الحفظ:')} ${e?.code || e?.message || ''}`);
    } finally {
      setSaving(false);
    }
  };

  const Slider = ({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) => (
    <label className="block text-[11px] text-gray-600">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono">{value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#D4AF37]" />
    </label>
  );

  const SpotControls = ({ k, label }: { k: 'name' | 'date' | 'serial'; label: string }) => {
    const s = layout[k];
    return (
      <div className="p-3 rounded-2xl border border-gray-200 space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-[#0A192F]">
          <input type="checkbox" checked={s.show} onChange={(e) => setSpot(k, { show: e.target.checked })} />
          {label}
        </label>
        {s.show && (
          <>
            {Slider({ label: tr('Horizontal ←→', 'أفقيًا ←→'), value: s.x, min: 0, max: 100, step: 0.5, onChange: (v) => setSpot(k, { x: v }) })}
            {Slider({ label: tr('Vertical ↑↓', 'عموديًا ↑↓'), value: s.y, min: 0, max: 100, step: 0.5, onChange: (v) => setSpot(k, { y: v }) })}
            {Slider({ label: tr('Size', 'الحجم'), value: s.size, min: 0.6, max: 10, step: 0.1, onChange: (v) => setSpot(k, { size: v }) })}
            <div className="flex gap-2 items-center">
              <input type="color" value={s.color} onChange={(e) => setSpot(k, { color: e.target.value })} className="w-10 h-8 rounded border" />
              <select value={s.font} onChange={(e) => setSpot(k, { font: e.target.value as any })} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-xs">
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{w.id ? tr('Edit workshop', 'تعديل الورشة') : tr('New workshop', 'ورشة جديدة')}</h2>
        <button onClick={onCancel} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#0A192F] mb-1">{tr('Workshop title *', 'عنوان الورشة *')}</label>
          <input value={w.title || ''} onChange={(e) => setW({ ...w, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#0A192F] mb-1">{tr('Short description (shown on the page)', 'وصف قصير يظهر في الصفحة')}</label>
          <textarea rows={2} value={w.description || ''} onChange={(e) => setW({ ...w, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-[#0A192F]">
          <input type="checkbox" checked={w.active !== false} onChange={(e) => setW({ ...w, active: e.target.checked })} />
          {tr('Registration open', 'التسجيل مفتوح')}
        </label>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-2">
        <div className="text-xs font-bold text-[#0A192F]">{tr('Certificate template (image)', 'قالب الشهادة (صورة)')}</div>
        <p className="text-[11px] text-gray-500">
          {tr('Upload your designed certificate as PNG or JPG without the name, date or serial. They are added automatically.', 'ارفعي تصميم الشهادة صورةً (PNG أو JPG) بدون الاسم والتاريخ والرقم، فهذه تُضاف تلقائيًا.')}
        </p>
        <label className="inline-flex px-4 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold items-center gap-1.5 cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-[#D4AF37]" />}
          {w.template ? tr('Replace template', 'تغيير القالب') : tr('Upload template', 'رفع القالب')}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              setUploading(true);
              try {
                setW((p) => ({ ...p, template: '' }));
                const d = await compressTemplate(f);
                setW((p) => ({ ...p, template: d }));
              } catch {
                onNotice(tr('Could not read this image.', 'تعذرت قراءة الصورة.'));
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
      </div>

      {w.template && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">{tr('Sample name:', 'اسم للتجربة:')}</span>
              <input value={sample} onChange={(e) => setSample(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs" />
            </div>
            <canvas ref={canvasRef} className="w-full h-auto rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-4" />
            <p className="text-[11px] text-gray-500">{tr('Preview: move the sliders until everything sits in place.', 'معاينة: حرّكي المؤشرات حتى يستقر كل عنصر في مكانه.')}</p>
          </div>
          <div className="space-y-3">
            {SpotControls({ k: 'name', label: tr('Student name', 'اسم المتدربة') })}
            {SpotControls({ k: 'date', label: tr('Date', 'التاريخ') })}
            {SpotControls({ k: 'serial', label: tr('Serial number', 'الرقم التسلسلي') })}
            <div className="p-3 rounded-2xl border border-gray-200 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[#0A192F]">
                <input type="checkbox" checked={layout.qr.show} onChange={(e) => setQr({ show: e.target.checked })} />
                {tr('QR code (verification)', 'رمز QR (للتحقق)')}
              </label>
              {layout.qr.show && (
                <>
                  {Slider({ label: tr('Horizontal ←→', 'أفقيًا ←→'), value: layout.qr.x, min: 0, max: 95, step: 0.5, onChange: (v) => setQr({ x: v }) })}
                  {Slider({ label: tr('Vertical ↑↓', 'عموديًا ↑↓'), value: layout.qr.y, min: 0, max: 95, step: 0.5, onChange: (v) => setQr({ y: v }) })}
                  {Slider({ label: tr('Size', 'الحجم'), value: layout.qr.size, min: 5, max: 25, step: 0.5, onChange: (v) => setQr({ size: v }) })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={save} disabled={saving || uploading} className="px-5 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
          {tr('Save workshop', 'حفظ الورشة')}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold">
          {tr('Cancel', 'إلغاء')}
        </button>
      </div>
    </div>
  );
};
