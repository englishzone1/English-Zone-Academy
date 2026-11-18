import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, Loader2, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { workshopService, CertificateRecord, formatCertDate } from '../services/workshopService';

// صفحة التحقق العامة: يفتحها رمز QR على الشهادة
export const VerifyCertificatePage: React.FC<{ serial: string; navigate: (r: string) => void }> = ({ serial, navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(!!serial);
  const [q, setQ] = useState(serial);

  useEffect(() => {
    if (!serial) return;
    setLoading(true);
    workshopService
      .getCertificate(serial.trim().toUpperCase())
      .then(setCert)
      .catch(() => setCert(null))
      .finally(() => setLoading(false));
  }, [serial]);

  return (
    <div className="min-h-[70vh] bg-[#FAF8F5] py-12">
      <div className="max-w-xl mx-auto px-4 space-y-6">
        <h1 className="font-serif-luxury font-bold text-2xl text-center text-[#0A192F]">{tr('Certificate verification', 'التحقق من الشهادة')}</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) navigate(`verify/${q.trim().toUpperCase()}`);
          }}
          className="flex gap-2"
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} dir="ltr" placeholder="EZ-2026-XXXXXX" className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm font-mono" />
          <button className="px-4 rounded-xl bg-[#0A192F] text-[#F3E5AB]" title={tr('Check', 'تحقق')}>
            <Search className="w-4 h-4" />
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" />
          </div>
        ) : serial && cert ? (
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-md space-y-3 text-center">
            <ShieldCheck className="w-14 h-14 mx-auto text-emerald-600" />
            <div className="font-bold text-emerald-700">{tr('Valid certificate issued by English Zone Academy', 'شهادة صحيحة صادرة رسميًا عن أكاديمية English Zone')}</div>
            <div className="text-sm text-gray-700 space-y-1.5">
              <div>
                {tr('Name:', 'الاسم:')} <b>{cert.name}</b>
              </div>
              <div>
                {tr('Workshop:', 'الورشة:')} <b>{cert.workshopTitle}</b>
              </div>
              <div>
                {tr('Issued on:', 'تاريخ الإصدار:')} <b>{formatCertDate(cert.issuedAt, isAr ? 'ar' : 'en')}</b>
              </div>
              <div>
                {tr('Serial number:', 'الرقم التسلسلي:')} <b dir="ltr" className="font-mono">{cert.serial}</b>
              </div>
            </div>
          </div>
        ) : serial ? (
          <div className="bg-white rounded-3xl p-6 border-2 border-red-400 shadow-md space-y-2 text-center">
            <ShieldX className="w-14 h-14 mx-auto text-red-500" />
            <div className="font-bold text-red-600">{tr('No certificate found with this number', 'لا توجد شهادة بهذا الرقم')}</div>
            <p className="text-xs text-gray-500">{tr('Check the serial number and try again.', 'تأكدي من الرقم التسلسلي وحاولي مرة أخرى.')}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
