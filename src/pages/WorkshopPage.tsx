import React, { useEffect, useRef, useState } from 'react';
import { Award, Download, Printer, Star, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { WsBackdrop, wsVars } from '../components/common/WorkshopTheme';
import { workshopService, renderCertificate, Workshop, CertificateRecord, verifyUrl } from '../services/workshopService';

interface Props {
  workshopId: string;
  navigate: (route: string) => void;
}

const savedKey = (id: string) => `ez_ws_cert_${id}`;

// صفحة الورشة العامة: تسجيل + تقييم ← شهادة فورية + دعوة للانضمام للمنصة
export const WorkshopPage: React.FC<Props> = ({ workshopId, navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [ws, setWs] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', rating: 5, benefit: 8, feedback: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    workshopService
      .get(workshopId)
      .then((w) => {
        setWs(w);
        try {
          const saved = localStorage.getItem(savedKey(workshopId));
          if (saved) setCert(JSON.parse(saved));
        } catch {
          /* ignore */
        }
      })
      .catch(() => setWs(null))
      .finally(() => setLoading(false));
  }, [workshopId]);

  useEffect(() => {
    if (!cert || !ws?.template || !canvasRef.current) return;
    setRendering(true);
    renderCertificate(canvasRef.current, ws.template, ws.layout, { name: cert.name, issuedAt: cert.issuedAt, serial: cert.serial })
      .catch((e) => console.error(e))
      .finally(() => setRendering(false));
  }, [cert, ws]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws) return;
    if (form.name.trim().length < 3) return setError(tr('Please write your full name as it should appear on the certificate.', '{اكتب|اكتبي} {اسمك|اسمكِ} الكامل كما تريدينه على الشهادة.'));
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError(tr('Please write a valid email.', '{اكتب|اكتبي} بريدًا إلكترونيًا صحيحًا.'));
    if (form.feedback.trim().length < 5) return setError(tr('Please share a short feedback about the workshop.', '{اكتب|اكتبي} {رأيك|رأيكِ} في الورشة ولو بجملة قصيرة.'));
    setSending(true);
    setError('');
    try {
      const c = await workshopService.register(ws, form);
      try {
        localStorage.setItem(savedKey(ws.id), JSON.stringify(c));
      } catch {
        /* ignore */
      }
      setCert(c);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError(tr('Could not register, please try again.', 'تعذر التسجيل، {حاول|حاولي} مرة أخرى.') + (err?.code ? ` (${err.code})` : ''));
    } finally {
      setSending(false);
    }
  };

  const download = () => {
    const c = canvasRef.current;
    if (!c || !cert) return;
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `English-Zone-Certificate-${cert.serial}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      },
      'image/png'
    );
  };

  const printPdf = () => {
    const c = canvasRef.current;
    if (!c || !cert) return;
    const data = c.toDataURL('image/png');
    const landscape = c.width >= c.height;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>${cert.serial}</title><style>@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:0}html,body{margin:0;height:100%}img{width:100%;height:100%;object-fit:contain}</style></head><body><img src="${data}" onload="setTimeout(function(){window.print()},300)"/></body></html>`
    );
    w.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!ws || (!ws.active && !cert)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Award className="w-12 h-12 mx-auto text-[#D4AF37]" />
        <h1 className="font-serif-luxury font-bold text-2xl text-[#061638]">{tr('Registration is closed', 'التسجيل في هذه الورشة مغلق')}</h1>
        <p className="text-sm text-gray-600">{tr('Follow us to join the next free workshop.', '{تابعنا|تابعينا} {لتنضم|لتنضمي} إلى الورشة المجانية القادمة.')}</p>
        <button onClick={() => navigate('join-us')} className="px-6 py-3 rounded-xl bg-[#061638] text-[#F3E5AB] font-bold text-sm">
          {tr('Join the platform for free', '{انضم|انضمي} إلى المنصة مجانًا')}
        </button>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen py-10 ${ws.theme === 'white' ? 'ez-light' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={wsVars(ws.theme, '#061638', '#eef2f9')}>
      <WsBackdrop theme={ws.theme} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#B8901F] text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            {tr('Free workshop', 'ورشة مجانية')}
          </span>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[var(--ink)]">{ws.title}</h1>
          {ws.description && <p className="text-sm text-[var(--muted)] whitespace-pre-line">{ws.description}</p>}
        </div>

        {cert ? (
          <div className="bg-[var(--card)] backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-[#D4AF37]/40 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              {tr('Congratulations! Here is your certificate.', 'مبارك! هذه {شهادتك|شهادتكِ}.')}
            </div>
            {ws.template ? (
              <div className="relative">
                {rendering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                  </div>
                )}
                <canvas ref={canvasRef} className="w-full h-auto rounded-xl border border-gray-200 shadow-sm" />
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">{tr('The certificate design will be available soon.', 'تصميم الشهادة سيتوفر قريبًا.')}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button onClick={download} disabled={!ws.template} className="px-5 py-2.5 rounded-xl [background:var(--btn)] text-[var(--btnInk)] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                <Download className="w-4 h-4 text-[#D4AF37]" />
                {tr('Download image', 'تحميل الشهادة (صورة)')}
              </button>
              <button onClick={printPdf} disabled={!ws.template} className="px-5 py-2.5 rounded-xl border border-[#D4AF37] text-[var(--ink)] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                <Printer className="w-4 h-4 text-[#AA820A]" />
                {tr('Print / save as PDF', 'طباعة أو حفظ PDF')}
              </button>
            </div>
            <div className="text-xs text-[var(--muted)] flex flex-wrap items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {tr('Serial number:', 'الرقم التسلسلي:')} <b dir="ltr">{cert.serial}</b>
              <a href={verifyUrl(cert.serial)} target="_blank" rel="noopener noreferrer" className="text-[#AA820A] underline">
                {tr('Verification page', 'صفحة التحقق')}
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-[var(--card)] backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-[var(--line)] shadow-md space-y-4">
            <h2 className="font-bold text-lg text-[var(--ink)]">{tr('Register & get your certificate', '{سجّل|سجّلي} {واحصل|واحصلي} على {شهادتك|شهادتكِ} فورًا')}</h2>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">{tr('Full name (as on the certificate) *', 'الاسم الكامل كما تريدينه على الشهادة *')}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#1f2433] bg-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1">{tr('Email *', 'البريد الإلكتروني *')}</label>
                <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#1f2433] bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1">{tr('WhatsApp (optional)', 'رقم الواتساب (اختياري)')}</label>
                <input type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#1f2433] bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">{tr('Country (optional)', 'الدولة (اختياري)')}</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#1f2433] bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">{tr('Your rating of the workshop', '{تقييمك|تقييمكِ} للورشة')}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })}>
                    <Star className={`w-7 h-7 ${n <= form.rating ? 'text-[#D4AF37] fill-current' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                {tr('How much did the workshop benefit you?', 'ما مدى {استفادتك|استفادتكِ} من الورشة؟')} <span className="text-[#AA820A]">{form.benefit} / 10</span>
              </label>
              <input type="range" min={1} max={10} value={form.benefit} onChange={(e) => setForm({ ...form, benefit: Number(e.target.value) })} className="w-full accent-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">{tr('Your feedback *', '{رأيك|رأيكِ} في الورشة *')}</label>
              <textarea rows={4} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} maxLength={2000} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#1f2433] bg-white" />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={sending} className="w-full py-3.5 rounded-xl [background:var(--btn)] text-[var(--btnInk)] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4 text-[#D4AF37]" />}
              {tr('Get my certificate', '{احصل|احصلي} على {شهادتك|شهادتكِ}')}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
