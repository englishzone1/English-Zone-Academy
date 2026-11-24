import { WsThemePicker, WsTheme } from '../common/WorkshopTheme';
import { copyText } from '../../utils/copyText';
import React, { useEffect, useRef, useState } from 'react';
import { Upload, Save, X, Link as LinkIcon, Download, Loader2, Megaphone } from 'lucide-react';
import { workshopPageService, WorkshopPage, Workshop, compressPoster, joinUrl, DEFAULT_GROUP_LINK } from '../../services/workshopService';
import { drawQR } from '../../services/qr';

const COLORS = ['#6b2f3a', '#0E3A99', '#1d6b3a', '#1f4e9c', '#7b2482', '#b5541c', '#0e4d5c', '#AA820A'];

// صفحة التسجيل في الورشة (قبل موعدها): صورة الإعلان والاسم والموعد واللون ومجموعة تيليغرام، ثم رابط للنشر
export const RegPageStrip: React.FC<{ w: Workshop; onNotice: (m: string) => void }> = ({ w, onNotice }) => {
  const [page, setPage] = useState<WorkshopPage | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const load = () => workshopPageService.get(w.id).then(setPage).catch(() => setPage(null));
  useEffect(() => {
    load();
  }, [w.id]);

  const url = joinUrl(w.id);
  const copy = async () => {
    if (await copyText(url)) onNotice('تم نسخ رابط التسجيل.');
  };

  return (
    <div className="mt-2 p-3 rounded-xl bg-[#FAF8F5] border border-dashed border-gray-300 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Megaphone className="w-4 h-4 text-[#AA820A]" />
        <b className="text-xs text-[#0E3A99]">صفحة التسجيل في الورشة</b>
        {page === undefined ? null : page && page.published ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">منشورة</span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">{page ? 'غير منشورة' : 'لم تُجهَّز بعد'}</span>
        )}
      </div>
      {page && page.published && (
        <div className="text-[10px] text-gray-500 break-all" dir="ltr">
          {url}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setEditing(true)} className="px-2.5 py-1.5 rounded-lg bg-[#0E3A99] text-[#F3E5AB] text-[11px] font-bold">
          {page ? 'تعديل صفحة التسجيل' : 'إعداد صفحة التسجيل'}
        </button>
        {page && page.published && (
          <>
            <button onClick={copy} className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#0E3A99] text-[11px] font-bold flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" /> نسخ رابط التسجيل
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-bold">
              فتح
            </a>
          </>
        )}
      </div>
      {editing && (
        <RegPageEditor
          w={w}
          initial={page || null}
          onClose={() => setEditing(false)}
          onSaved={() => {
            load();
            onNotice('تم حفظ صفحة التسجيل.');
          }}
        />
      )}
    </div>
  );
};

const RegPageEditor: React.FC<{ w: Workshop; initial: WorkshopPage | null; onClose: () => void; onSaved: () => void }> = ({ w, initial, onClose, onSaved }) => {
  const [p, setP] = useState<WorkshopPage>({
    workshopId: w.id,
    published: false,
    title: w.title,
    subtitle: '',
    date: '',
    time: '',
    duration: '',
    learn: [],
    color: '#6b2f3a',
    groupLink: DEFAULT_GROUP_LINK,
    ...(initial || {}),
    theme: initial ? initial.theme || 'white' : 'blue'
  } as WorkshopPage);
  const [learnText, setLearnText] = useState((initial?.learn || []).join('\n'));
  const [busy, setBusy] = useState(false);
  const [upl, setUpl] = useState(false);
  const [err, setErr] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const set = (k: keyof WorkshopPage, v: any) => setP((x) => ({ ...x, [k]: v }));

  const upload = async (f?: File) => {
    if (!f) return;
    setUpl(true);
    setErr('');
    try {
      set('poster', await compressPoster(f));
    } catch {
      setErr('تعذّر تجهيز الصورة، جرّبي صورة أصغر.');
    } finally {
      setUpl(false);
    }
  };

  const save = async (publish: boolean) => {
    if (p.title.trim().length < 3) return setErr('اكتبي اسم الورشة.');
    setBusy(true);
    setErr('');
    try {
      await workshopPageService.save({ ...p, published: publish, learn: learnText.split('\n') });
      set('published', publish);
      onSaved();
      if (publish) setSavedUrl(joinUrl(w.id));
      else onClose();
    } catch (e: any) {
      setErr(`تعذّر الحفظ: ${e?.code || e?.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!savedUrl || !qrRef.current) return;
    const c = qrRef.current;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    drawQR(ctx, savedUrl, 30, 30, c.width - 60, '#000000');
  }, [savedUrl]);

  const downloadQr = () => {
    const a = document.createElement('a');
    a.href = qrRef.current!.toDataURL('image/png');
    a.download = `workshop-qr-${w.id}.png`;
    a.click();
  };

  const inp = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#D4AF37]';
  const lbl = 'block text-[11px] font-bold text-gray-600 mb-1';

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-3" dir="rtl">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#0E3A99]">صفحة التسجيل في الورشة</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedUrl ? (
          <div className="space-y-3 text-center">
            <p className="text-emerald-700 font-bold">✓ نُشرت صفحة التسجيل. هذا رابطها، انشريه في كل مكان:</p>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border text-xs break-all" dir="ltr">
              {savedUrl}
            </div>
            <button
              onClick={async () => {
                if (await copyText(savedUrl)) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2500);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#0E3A99] text-sm font-bold"
            >
              {copied ? '✓ تم نسخ الرابط' : 'نسخ الرابط'}
            </button>
            <canvas ref={qrRef} width={600} height={600} className="w-44 h-44 mx-auto border rounded-xl" />
            <button onClick={downloadQr} className="w-full py-2.5 rounded-xl border border-gray-300 text-sm font-bold flex items-center justify-center gap-1.5">
              <Download className="w-4 h-4" /> تنزيل الباركود (لوضعه على الإعلان)
            </button>
            <p className="text-[11px] text-gray-500">والرابط القصير {window.location.origin}/workshop يفتح دائمًا آخر ورشة نشرتِها.</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-sm font-bold">
              تم
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className={lbl}>صورة إعلان الورشة</label>
              <div className="flex items-center gap-3">
                {p.poster ? <img src={p.poster} alt="" className="w-24 h-24 object-cover rounded-xl border" /> : <div className="w-24 h-24 rounded-xl bg-gray-100" />}
                <label className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold cursor-pointer flex items-center gap-1">
                  {upl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {p.poster ? 'تغيير الصورة' : 'رفع صورة'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
              </div>
            </div>
            <div>
              <label className={lbl}>اسم الورشة</label>
              <input value={p.title} onChange={(e) => set('title', e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>جملة تحت الاسم</label>
              <input value={p.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="خطوتك الأولى نحو…" className={inp} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={lbl}>اليوم والتاريخ</label>
                <input value={p.date} onChange={(e) => set('date', e.target.value)} placeholder="الخميس 3 ديسمبر" className={inp} />
              </div>
              <div>
                <label className={lbl}>الساعة</label>
                <input value={p.time} onChange={(e) => set('time', e.target.value)} placeholder="8:00 مساءً" className={inp} />
              </div>
              <div>
                <label className={lbl}>المدة</label>
                <input value={p.duration} onChange={(e) => set('duration', e.target.value)} placeholder="ساعتان" className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>ماذا ستتعلم في الورشة؟ (كل نقطة في سطر)</label>
              <textarea value={learnText} onChange={(e) => setLearnText(e.target.value)} rows={4} className={inp} />
            </div>
            <div>
              <label className={lbl}>مظهر الصفحة</label>
              <WsThemePicker value={(p.theme as WsTheme) || 'blue'} onChange={(t) => set('theme', t)} />
            </div>
            {p.theme === 'white' && <div>
              <label className={lbl}>لون الأزرار والعناوين</label>
              <div className="flex flex-wrap items-center gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => set('color', c)} className={`w-8 h-8 rounded-full border-2 ${p.color === c ? 'border-[#D4AF37] scale-110' : 'border-white'}`} style={{ background: c }} />
                ))}
                <input type="color" value={p.color} onChange={(e) => set('color', e.target.value)} className="w-9 h-9 rounded-lg border" title="لون آخر" />
              </div>
            </div>}
            <div>
              <label className={lbl}>رابط مجموعة تيليغرام (بعد تأكيد التسجيل)</label>
              <input value={p.groupLink} onChange={(e) => set('groupLink', e.target.value)} dir="ltr" className={inp} />
            </div>
            {err && <p className="text-xs font-bold text-red-600">{err}</p>}
            <div className="grid grid-cols-2 gap-2">
              <button disabled={busy || upl} onClick={() => save(false)} className="py-3 rounded-xl border border-gray-300 text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                <Save className="w-4 h-4" /> حفظ دون نشر
              </button>
              <button disabled={busy || upl} onClick={() => save(true)} className="py-3 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-sm font-bold disabled:opacity-50">
                {busy ? '...' : 'نشر وإظهار الرابط'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
